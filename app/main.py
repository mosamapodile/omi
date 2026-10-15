from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.chat import router
from app.core.config import get_settings

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(
    title="omi",
    description="A little space to think.",
    version="0.1.0"
)

app.include_router(router)

@app.get("/api/health")
def health():
    settings = get_settings()

    return {
        "status": "healthy",
        "application": "omi",
        "mode": "demo" if settings.demo_mode else "azure"
    }

@app.get("/")
def home():
    return FileResponse(STATIC_DIR / "index.html")

app.mount(
    "/static",
    StaticFiles(directory=STATIC_DIR),
    name="static"
)
