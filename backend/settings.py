from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    tavily_api_key: str
    model: str = "gpt-4o-mini"

    model_config = {"env_file": ".env"}


settings = Settings()
