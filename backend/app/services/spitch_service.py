from spitch import Spitch
from app.config import settings

# Initialize client
client = Spitch(api_key=settings.spitch_api_key)

LANGUAGE_VOICE_MAP = {
    "en": "sade",
    "yo": "sade",
    "ha": "sade"
}

async def text_to_speech(text: str, language: str = "en") -> bytes:
    """Call Spitch SDK and return raw audio bytes directly."""
    if not settings.spitch_api_key or settings.spitch_api_key == "your_spitch_app_api_key":
        # Mock: return empty bytes (frontend should handle gracefully)
        return b""
    
    response = client.speech.generate(
        text=text,
        language=language,
        voice=LANGUAGE_VOICE_MAP.get(language, "sade"),
        format="mp3"
    )
    return response.read()