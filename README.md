<div align="center">

# FinPilot

**Your personal money cockpit — budgeting, expense tracking, and savings forecasting that never leaves your computer.**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

*Log your expenses in seconds. Know exactly what's safe to spend today. See where your savings will be years from now.*

</div>

---

## Why FinPilot?

Most budgeting apps want your bank credentials, your data on their servers, and a subscription fee. FinPilot takes the opposite approach:

- **100% local** — a single SQLite file on your machine. No cloud, no sync, no tracking.
- **Salary-aware** — tell it what you earn and what your fixed costs are; it tells you what's safe to spend *per day* while keeping your savings on target.
- **Forward-looking** — most apps tell you where money went. FinPilot also projects where you'll be in 6–60 months, with what-if sliders for raises and spending cuts.

<!-- Add screenshots: create docs/screenshots/ and drop dashboard-dark.png, dashboard-light.png here -->

## Features

**Expense tracking**
- Add an expense in under 5 seconds: amount, category, date, note
- 12 sensible default categories (with icons and colors) — add your own, reclassify anytime
- Filter by month and category, edit or delete any entry

**Budget engine**
- Classic 50/30/20 needs/wants/savings split — fully customizable
- Safe-to-spend-per-day, recalculated every day from what's actually left
- Budget health bars: see needs, wants, and savings burn at a glance
- Fixed costs (rent, EMIs, subscriptions) tracked separately with due-day reminders on the dashboard

**Forecasting**
- Projects cumulative savings 6–60 months ahead from your real spending average
- What-if sliders: annual salary growth, spending increase/decrease
- Learns from history — the more you log, the smarter the projection

**Experience**
- Dark and light mode, toggle in the sidebar, remembers your choice
- Login protected: bcrypt-hashed password, JWT sessions
- Interactive charts (Recharts), Indian Rupee formatting throughout

## Quick start

**Prerequisite:** [Python 3.10+](https://www.python.org/downloads/) (on Windows, tick *"Add Python to PATH"* during install). That's it — the frontend ships pre-built.

**1 · Get the code**
```bash
git clone https://github.com/<your-username>/finpilot.git
cd finpilot
```

**2 · Start it**

Windows: double-click `start.bat` &nbsp;·&nbsp; macOS / Linux: `./start.sh`

Your browser opens at **http://localhost:8000**. The first launch creates a virtual environment and installs dependencies (one-time, ~30 seconds).

### First-run checklist

1. **Create your account** — username + password, stored only on your machine
2. **Settings → Income & budget split** — enter your monthly salary and adjust the 50/30/20 split if you like
3. **Settings → Fixed monthly costs** — add rent, EMIs, subscriptions with their due day
4. **Dashboard → Add expense** — log your first expense and watch the numbers come alive

## Configuration (optional)

FinPilot runs out of the box with zero configuration. To customize it, create your own `.env` file — this is where any secret or personal setting belongs:

```bash
cd backend
cp .env.example .env      # Windows: copy .env.example .env
```

Then edit `backend/.env`:

| Variable | Default | What it does |
|---|---|---|
| `FINPILOT_PORT` | `8000` | Port the app runs on |
| `GEMINI_API_KEY` | *(empty)* | Enables the upcoming AI features. Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

`.env` is gitignored — your keys and settings never get committed or pushed.

## Privacy — what never gets committed

This repo's `.gitignore` keeps everything personal on your machine only:

| Ignored file | Contains |
|---|---|
| `backend/finpilot.db` | All your financial data |
| `backend/.jwt_secret` | Auto-generated login-token secret |
| `backend/.env` | Your API keys and personal settings |
| `context.md` | Personal AI-assistant notes (if present) |

Before pushing, `git status` should never list any of these. Only `.env.example` (the template with empty values) is committed.

## How the math works

Say you earn ₹80,000/month, pay ₹20,000 rent, and target 20% savings (₹16,000):

| | |
|---|---|
| Spendable on variable expenses | 80,000 − 20,000 − 16,000 = **₹44,000/month** |
| Spent ₹11,000 by the 11th? | ₹33,000 left ÷ 20 days = **₹1,650 safe per day** |
| Projected savings | salary − fixed − (current daily pace × days in month) |

The forecast extends this: average variable spend from your last 3 months, fixed costs, and salary (compounding your growth assumption yearly) projected up to 5 years.

## Project structure

```
finpilot/
├── start.bat / start.sh     # one-click launchers
├── backend/
│   ├── run.py               # starts server + opens browser
│   ├── requirements.txt
│   └── app/
│       ├── main.py          # FastAPI app, serves API + frontend
│       ├── models.py        # SQLAlchemy models
│       ├── security.py      # bcrypt + JWT
│       ├── routers/         # auth, expenses, categories, recurring, settings, dashboard, forecast
│       └── services/budget.py  # all budget & forecast math
└── frontend/
    ├── dist/                # pre-built app (what :8000 serves)
    └── src/                 # React source (pages, components, theme)
```

Data lives in `backend/finpilot.db` — **copy that one file to back up everything.**

## API

Full interactive docs at `http://localhost:8000/docs` while running.

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/register` · `login` | One-time account creation, then login (JWT) |
| `GET/POST/PUT/DELETE /api/expenses` | Expense CRUD, filter by `?month=YYYY-MM&category_id=` |
| `/api/categories` · `/api/recurring` | Categories and fixed monthly costs |
| `GET/PUT /api/settings` | Salary and budget split |
| `GET /api/dashboard` | All computed numbers for the dashboard |
| `GET /api/forecast?months=12&salary_growth_pct=10` | Savings projection |

## Development

Want to modify the UI?

```bash
cd frontend
npm install
npm run dev     # hot-reload dev server on :5173 (proxies /api to :8000)
npm run build   # rebuild dist/ — commit it, it's what :8000 serves for everyone
```

Backend hot-reload: `cd backend && .venv/Scripts/uvicorn app.main:app --reload`

## Troubleshooting

- **"python is not recognized"** — reinstall Python with *Add to PATH* ticked, or use `py` instead of `python` in `start.bat`
- **Port 8000 already in use** — set `FINPILOT_PORT` in `backend/.env` (see Configuration)
- **Forgot your password** — no recovery yet: delete `backend/finpilot.db` to start fresh (this erases your data — keep backups)
- **Blank page after UI changes** — you edited `src/` but didn't run `npm run build`

## Roadmap

- [x] Auth, expenses, budget engine, dashboard, forecast, dark/light mode
- [ ] Reports page — daily/weekly/monthly analysis with print-ready PDF & Excel export
- [ ] Gemini-powered natural-language entry (*"dinner swiggy 450"* → logged)
- [ ] Monthly AI insights & "can I afford X?" chat
- [ ] In-app AI agent (function-calling over your own data)
- [ ] Savings goals with ETA · CSV bank-statement import · receipt scanning

## Contributing

Issues and PRs welcome. Keep it simple: this project deliberately avoids heavy dependencies and cloud services.

## License

[MIT](LICENSE) — use it, fork it, make it yours.
