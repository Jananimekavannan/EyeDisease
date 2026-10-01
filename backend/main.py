"""
SIH26038 FastAPI Server Entry Point.
Modular REST API server for Diabetic Retinopathy Screening in Rural India.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.routes import health, prediction, quality, report

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Explainable AI for Diabetic Retinopathy Screening in Rural India (SIH26038).\n"
        "Features: Fundus Quality Gate, EfficientNet-B0 DR Prediction, Grad-CAM Heatmaps, "
        "Reliability/Uncertainty Engine, and Screening Report generation."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware for React client integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(quality.router, prefix=settings.api_prefix)
app.include_router(prediction.router, prefix=settings.api_prefix)
app.include_router(report.router, prefix=settings.api_prefix)


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.app_name} API",
        "version": settings.app_version,
        "docs": "/docs",
        "api_prefix": settings.api_prefix
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
