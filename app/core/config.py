from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    demo_mode: bool = True

    azure_openai_endpoint: str = ""
    azure_openai_deployment: str = ""

    cosmos_endpoint: str = ""
    cosmos_database: str = "omi"
    cosmos_container: str = "conversations"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

@lru_cache
def get_settings():
    return Settings()
