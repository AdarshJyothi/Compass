import calendar
from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models


def month_bounds(d: date):
    days = calendar.monthrange(d.year, d.month)[1]
    return d.replace(day=1), d.replace(day=days), days


def get_settings(db: Session) -> models.Settings:
    s = db.query(models.Settings).first()
    if not s:
        s = models.Settings()
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


def fixed_items(db: Session):
    return db.query(models.Recurring).filter(models.Recurring.active == True).all()


def variable_expenses(db: Session, start: date, end: date):
    return (
        db.query(models.Expense)
        .filter(models.Expense.date >= start, models.Expense.date <= end)
        .all()
    )


def compute_dashboard(db: Session, today: date | None = None) -> dict:
    today = today or date.today()
    start, end, days_in_month = month_bounds(today)
    s = get_settings(db)
    salary = s.monthly_salary or 0.0

    fixed = fixed_items(db)
    fixed_total = sum(r.amount for r in fixed)

    expenses = variable_expenses(db, start, end)
    variable_spent = sum(e.amount for e in expenses)

    days_left = days_in_month - today.day + 1
    savings_target = salary * (s.savings_pct or 0) / 100.0
    spendable_variable = salary - fixed_total - savings_target
    remaining_variable = spendable_variable - variable_spent
    safe_per_day = max(0.0, remaining_variable) / days_left if days_left else 0.0

    daily_avg = variable_spent / today.day
    projected_variable = daily_avg * days_in_month
    projected_savings = salary - fixed_total - projected_variable
    left_this_month = salary - fixed_total - variable_spent

    cats = {c.id: c for c in db.query(models.Category).all()}
    by_cat: dict[int, float] = {}
    for e in expenses:
        by_cat[e.category_id] = by_cat.get(e.category_id, 0.0) + e.amount
    breakdown = sorted(
        (
            {
                "category_id": cid,
                "name": cats[cid].name if cid in cats else "Unknown",
                "color": cats[cid].color if cid in cats else "#888",
                "icon": cats[cid].icon if cid in cats else "package",
                "amount": round(amt, 2),
            }
            for cid, amt in by_cat.items()
        ),
        key=lambda x: -x["amount"],
    )

    def kind_of(cid):
        return cats[cid].kind if cid in cats else "want"

    needs_spent = sum(r.amount for r in fixed if kind_of(r.category_id) == "need") + sum(
        e.amount for e in expenses if kind_of(e.category_id) == "need"
    )
    wants_spent = sum(r.amount for r in fixed if kind_of(r.category_id) == "want") + sum(
        e.amount for e in expenses if kind_of(e.category_id) == "want"
    )

    recent = (
        db.query(models.Expense)
        .order_by(models.Expense.date.desc(), models.Expense.id.desc())
        .limit(6)
        .all()
    )
    upcoming = [
        {"id": r.id, "name": r.name, "amount": r.amount, "day_of_month": r.day_of_month}
        for r in sorted(fixed, key=lambda r: r.day_of_month)
        if r.day_of_month >= today.day
    ]

    daily: dict[str, float] = {}
    for e in expenses:
        k = e.date.isoformat()
        daily[k] = daily.get(k, 0.0) + e.amount
    series, cum = [], 0.0
    for dnum in range(1, today.day + 1):
        k = date(today.year, today.month, dnum).isoformat()
        cum += daily.get(k, 0.0)
        series.append({"day": dnum, "spent": round(cum, 2)})

    return {
        "month_label": today.strftime("%B %Y"),
        "today": today.isoformat(),
        "days_in_month": days_in_month,
        "days_left": days_left,
        "salary": salary,
        "fixed_total": round(fixed_total, 2),
        "variable_spent": round(variable_spent, 2),
        "total_spent": round(fixed_total + variable_spent, 2),
        "left_this_month": round(left_this_month, 2),
        "savings_target": round(savings_target, 2),
        "safe_to_spend_per_day": round(safe_per_day, 2),
        "projected_savings": round(projected_savings, 2),
        "budget": {
            "needs": {"spent": round(needs_spent, 2), "budget": round(salary * s.needs_pct / 100.0, 2)},
            "wants": {"spent": round(wants_spent, 2), "budget": round(salary * s.wants_pct / 100.0, 2)},
            "savings": {"projected": round(projected_savings, 2), "target": round(savings_target, 2)},
        },
        "category_breakdown": breakdown,
        "daily_cumulative": series,
        "recent": [
            {
                "id": e.id,
                "amount": e.amount,
                "note": e.note,
                "date": e.date.isoformat(),
                "category_id": e.category_id,
            }
            for e in recent
        ],
        "upcoming_bills": upcoming,
        "setup_needed": salary <= 0,
    }


def avg_monthly_variable(db: Session, today: date) -> float:
    start_this, _, _ = month_bounds(today)
    rows = (
        db.query(models.Expense.date, func.sum(models.Expense.amount))
        .filter(models.Expense.date < start_this)
        .group_by(func.strftime("%Y-%m", models.Expense.date))
        .all()
    )
    totals = {}
    for d, total in rows:
        totals[d.strftime("%Y-%m")] = float(total)
    if totals:
        months = sorted(totals.keys())[-3:]
        return sum(totals[m] for m in months) / len(months)
    dash_spent = sum(
        e.amount for e in variable_expenses(db, start_this, today)
    )
    if today.day > 0 and dash_spent > 0:
        return dash_spent / today.day * calendar.monthrange(today.year, today.month)[1]
    return 0.0


def compute_forecast(db: Session, months: int, salary_growth_pct: float, expense_change_pct: float) -> dict:
    today = date.today()
    s = get_settings(db)
    salary = s.monthly_salary or 0.0
    fixed_total = sum(r.amount for r in fixed_items(db))
    avg_var = avg_monthly_variable(db, today) * (1 + expense_change_pct / 100.0)

    series, cum = [], 0.0
    y, m = today.year, today.month
    cur_salary = salary
    for i in range(1, months + 1):
        m += 1
        if m > 12:
            m, y = 1, y + 1
        if i % 12 == 0:
            cur_salary *= 1 + salary_growth_pct / 100.0
        net = cur_salary - fixed_total - avg_var
        cum += net
        series.append(
            {
                "label": date(y, m, 1).strftime("%b %Y"),
                "net": round(net, 2),
                "cumulative": round(cum, 2),
            }
        )
    return {
        "assumptions": {
            "salary": salary,
            "fixed_total": round(fixed_total, 2),
            "avg_variable": round(avg_var, 2),
            "salary_growth_pct": salary_growth_pct,
            "expense_change_pct": expense_change_pct,
        },
        "monthly_net": round(salary - fixed_total - avg_var, 2),
        "series": series,
    }
