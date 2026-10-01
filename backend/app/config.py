"""
FastAPI Backend Configuration.
Handles server settings, model paths, and service thresholds.
"""
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "SIH26038 DR Screening Engine"
    app_version: str = "1.0.0"
    api_prefix: str = "/api/v1"
    # Avoid unrelated deployment variables such as DEBUG=release being parsed
    # as booleans; application settings use an explicit APP_ namespace.
    debug: bool = Field(default=True, validation_alias="APP_DEBUG")

    # CORS settings for React frontend
    cors_origins: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    # Model Weights Paths
    base_dir: Path = Path(__file__).resolve().parent.parent.parent
    weights_dir: Path = base_dir / "ml" / "weights"
    efficientnet_weights_path: Path = weights_dir / "efficientnet_b0_aptos.pth"

    # Quality Gate Defaults
    blur_threshold: float = 100.0

    # Reliability Defaults
    confidence_threshold: float = 0.70

    class Config:
        env_file = ".env"


settings = Settings()
