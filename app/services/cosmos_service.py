from datetime import datetime, timezone
from uuid import uuid4

from azure.cosmos import CosmosClient

from app.core.config import get_settings
from app.core.identity import get_credential

def get_container():
    settings = get_settings()

    client = CosmosClient(
        url=settings.cosmos_endpoint,
        credential=get_credential()
    )

    database = client.get_database_client(
        settings.cosmos_database
    )

    return database.get_container_client(
        settings.cosmos_container
    )

def save_message(conversation_id, role, content):
    settings = get_settings()

    if settings.demo_mode:
        return None

    document = {
        "id": str(uuid4()),
        "conversationId": conversation_id,
        "role": role,
        "content": content,
        "createdAt": datetime.now(
            timezone.utc
        ).isoformat()
    }

    return get_container().create_item(body=document)

def get_history(conversation_id):
    settings = get_settings()

    if settings.demo_mode:
        return []

    query = """
    SELECT c.role, c.content, c.createdAt
    FROM c
    WHERE c.conversationId = @conversationId
    ORDER BY c.createdAt ASC
    """

    return list(
        get_container().query_items(
            query=query,
            parameters=[
                {
                    "name": "@conversationId",
                    "value": conversation_id
                }
            ],
            partition_key=conversation_id
        )
    )
