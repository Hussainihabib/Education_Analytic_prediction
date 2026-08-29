from datetime import datetime
import uuid

from app.database.connection import db

support_collection = db["support"]


# ==========================================
# Create Support Ticket
# ==========================================

def create_support_ticket(

    user_email,
    role,
    subject,
    message,
    category,
    priority

):

    return {

        "ticket_id": str(uuid.uuid4())[:8].upper(),

        "user_email": user_email,

        "role": role,

        "subject": subject,

        "message": message,

        "category": category,

        "priority": priority,

        "status": "Open",

        "admin_reply": "",

        "created_at": datetime.now(),

        "updated_at": datetime.now()

    }