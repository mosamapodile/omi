from openai import OpenAI
from azure.identity import get_bearer_token_provider

from app.core.config import get_settings
from app.core.identity import get_credential

SYSTEM_PROMPT = (
    "You are omi, a calm and thoughtful AI assistant. "
    "Explain concepts clearly and naturally."
)

def generate_response(message: str) -> str:
    settings = get_settings()

    if settings.demo_mode:
        return (
            "Hello! I'm omi.\n\n"
            f"You asked: {message}\n\n"
            "I'm currently running in demo mode. "
            "Connect Microsoft Foundry to enable AI."
        )

    if not settings.azure_openai_endpoint:
        raise RuntimeError("Missing Azure AI endpoint")

    if not settings.azure_openai_deployment:
        raise RuntimeError("Missing model deployment")

    token_provider = get_bearer_token_provider(
        get_credential(),
        "https://cognitiveservices.azure.com/.default"
    )

    client = OpenAI(
        base_url=settings.azure_openai_endpoint,
        api_key=token_provider
    )

    response = client.chat.completions.create(
        model=settings.azure_openai_deployment,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message}
        ]
    )

    return response.choices[0].message.content or ""
