@echo off
cd /d "%~dp0backend"
if not exist .venv (
  echo Creating Python environment...
  python -m venv .venv
)
call .venv\Scripts\activate.bat
pip install -q -r requirements.txt
echo Starting FinPilot at http://localhost:8000 ...
python run.py
