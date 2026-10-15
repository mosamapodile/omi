from uuid import uuid4
import logging

from fastapi import APIRouter, HTTPException

from app.core.config import get_settings
from app.models.schemas import ChatRequest, ChatResponse
from app.services.ai_service import generate_response
from app.services.cosmos_service import save_message

router = APIRouter(prefix="/api", tags=["Chat"])
logger = logging.getLogger(__name__)

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    settings = get_settings()

    conversation_id = (
        request.conversation_id or str(uuid4())
    )

    try:
        reply = generate_response(request.message)

        save_message(
            conversation_id,
            "user",
            request.message
        )

        save_message(
            conversation_id,
            "assistant",
            reply
        )

        return ChatResponse(
            reply=reply,
            conversation_id=conversation_id,
            mode="demo" if settings.demo_mode else "azure"
        )

    except Exception:
        logger.exception("Chat request failed")
        raise HTTPException(
            status_code=503,
            detail="omi could not complete the request."
        )
