from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URI: str
    JWT_SECRET: str
    JWT_EXPIRES_IN: int = 86400
    CORS_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()