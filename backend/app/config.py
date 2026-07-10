import os
from pathlib import Path


def _load_env():
    env_file = Path(__file__).resolve().parent.parent / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())


_load_env()

PORT = int(os.getenv("FINPILOT_PORT", "8000"))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
