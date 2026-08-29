from datetime import datetime

from app.models.support_model import (
    support_collection,
    create_support_ticket
)
from app.services.notification_service import create_notification
from app.schemas.notification_schema import NotificationCreate


# ==========================================
# Create Ticket
# ==========================================

def create_support(

    data,
    user

):

    ticket = create_support_ticket(

        user_email=user["sub"],

        role=user["role"],

        subject=data.subject,

        message=data.message,

        category=data.category,

        priority=data.priority

    )

    support_collection.insert_one(ticket)

    return {

        "message": "Support Ticket Created Successfully",

        "ticket_id": ticket["ticket_id"]

    }


# ==========================================
# Get All Tickets (Admin)
# ==========================================

def get_all_support():

    tickets = list(

        support_collection.find(

            {},

            {

                "_id": 0

            }

        ).sort(

            "created_at",

            -1

        )

    )

    return tickets


# ==========================================
# Get My Tickets
# ==========================================

def get_my_support(

    email

):

    tickets = list(

        support_collection.find(

            {

                "user_email": email

            },

            {

                "_id": 0

            }

        ).sort(

            "created_at",

            -1

        )

    )

    return tickets


# ==========================================
# Update Ticket Status
# ==========================================

def update_ticket_status(

    ticket_id,

    data

):

    result = support_collection.update_one(

        {

            "ticket_id": ticket_id

        },

        {

            "$set": {

                "status": data.status,

                "updated_at": datetime.now()

            }

        }

    )

    if result.matched_count == 0:

        return {

            "message": "Ticket Not Found"

        }

    return {

        "message": "Status Updated Successfully"

    }


# ==========================================
# Reply Ticket
# ==========================================
def reply_ticket(

    ticket_id,

    data

):

    ticket = support_collection.find_one({"ticket_id": ticket_id})

    if not ticket:
        return {
            "message": "Ticket Not Found"
        }

    result = support_collection.update_one(

        {

            "ticket_id": ticket_id

        },

        {

            "$set": {

                "admin_reply": data.admin_reply,

                "status": "Resolved",

                "updated_at": datetime.now()

            }

        }

    )

    if result.matched_count == 0:

        return {

            "message": "Ticket Not Found"

        }

    # Notify the ticket owner that a reply has arrived.
    try:
        create_notification(NotificationCreate(
            title="Support Ticket Reply",
            message=f"Your ticket '{ticket.get('subject', '')}' has a new reply.",
            receiver_role=ticket.get("role", "Student"),
            receiver_email=ticket.get("user_email"),
        ))
    except Exception:
        # Notification failure should never block the reply itself.
        pass

    return {

        "message": "Reply Added Successfully"

    }

# ==========================================
# Delete Ticket
# ==========================================

def delete_ticket(

    ticket_id

):

    result = support_collection.delete_one(

        {

            "ticket_id": ticket_id

        }

    )

    if result.deleted_count == 0:

        return {

            "message": "Ticket Not Found"

        }

    return {

        "message": "Ticket Deleted Successfully"

    }


# ==========================================
# Search Tickets
# ==========================================

def search_support(

    email=None,

    status=None,

    priority=None,

    category=None

):

    query = {}

    if email:

        query["user_email"] = email

    if status:

        query["status"] = status

    if priority:

        query["priority"] = priority

    if category:

        query["category"] = category

    tickets = list(

        support_collection.find(

            query,

            {

                "_id": 0

            }

        ).sort(

            "created_at",

            -1

        )

    )

    return tickets