from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Threat Analysis ML Service"
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:8080"
    ]
    
    # Model Settings
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./models")
    MODEL_VERSION: str = "1.0.0"
    
    # Data Processing Settings
    MAX_BATCH_SIZE: int = 1000
    CONFIDENCE_THRESHOLD: float = 0.7
    
    # Security Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Performance Settings
    ENABLE_CACHE: bool = os.getenv("ENABLE_CACHE", "True").lower() == "true"
    CACHE_TTL: int = 3600  # Cache time-to-live in seconds
    DYNAMIC_BATCH_SIZING: bool = True
    
    # Logging Settings
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    class Config:
        env_file = ".env"

settings = Settings()
