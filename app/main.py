from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(
    title="omi",
    description="A little space to think.",
    version="0.1.0"
)

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "application": "omi"
    }

@app.get("/")
def home():
    return FileResponse(STATIC_DIR / "index.html")

app.mount(
    "/static",
    StaticFiles(directory=STATIC_DIR),
    name="static"
)
