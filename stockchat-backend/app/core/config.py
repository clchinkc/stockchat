from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "StockSage AI"
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173"]

settings = Settings() 