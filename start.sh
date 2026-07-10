#!/usr/bin/env bash
cd "$(dirname "$0")/backend"
if [ ! -d .venv ]; then
  echo "Creating Python environment..."
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt
echo "Starting FinPilot at http://localhost:8000 ..."
python run.py
