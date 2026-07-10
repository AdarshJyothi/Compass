from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..security import get_current_user
from ..services.budget import compute_forecast

router = APIRouter(prefix="/api/forecast", tags=["forecast"], dependencies=[Depends(get_current_user)])


@router.get("")
def forecast(
    months: int = Query(12, ge=1, le=60),
    salary_growth_pct: float = Query(0, ge=-50, le=100),
    expense_change_pct: float = Query(0, ge=-90, le=200),
    db: Session = Depends(get_db),
):
    return compute_forecast(db, months, salary_growth_pct, expense_change_pct)
