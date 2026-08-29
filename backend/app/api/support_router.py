from fastapi import APIRouter, Depends
from typing import Optional

from app.auth.dependencies import (
    admin_only,
    get_current_user
)

from app.schemas.support_schema import (
    SupportCreate,
    SupportStatusUpdate,
    SupportReply
)

from app.services.support_service import (
    create_support,
    get_all_support,
    get_my_support,
    update_ticket_status,
    reply_ticket,
    delete_ticket,
    search_support
)

router = APIRouter()


# ==========================================
# Create Ticket
# ==========================================

@router.post("/")
def create_support_api(

    data: SupportCreate,

    user=Depends(get_current_user)

):

    return create_support(

        data,

        user

    )


# ==========================================
# Get All Tickets (Admin)
# ==========================================

@router.get("/")
def get_all_support_api(

    user=Depends(admin_only)

):

    return get_all_support()


# ==========================================
# My Tickets
# ==========================================

@router.get("/my")
def get_my_support_api(

    user=Depends(get_current_user)

):

    return get_my_support(

        user["sub"]

    )


# ==========================================
# Search Tickets (Admin)
# ==========================================

@router.get("/search")
def search_support_api(

    email: Optional[str] = None,

    status: Optional[str] = None,

    priority: Optional[str] = None,

    category: Optional[str] = None,

    user=Depends(admin_only)

):

    return search_support(

        email,

        status,

        priority,

        category

    )


# ==========================================
# Update Status
# ==========================================

@router.put("/{ticket_id}")
def update_ticket_status_api(

    ticket_id: str,

    data: SupportStatusUpdate,

    user=Depends(admin_only)

):

    return update_ticket_status(

        ticket_id,

        data

    )


# ==========================================
# Reply Ticket
# ==========================================

@router.put("/reply/{ticket_id}")
def reply_ticket_api(

    ticket_id: str,

    data: SupportReply,

    user=Depends(admin_only)

):

    return reply_ticket(

        ticket_id,

        data

    )


# ==========================================
# Delete Ticket
# ==========================================

@router.delete("/{ticket_id}")
def delete_ticket_api(

    ticket_id: str,

    user=Depends(admin_only)

):

    return delete_ticket(

        ticket_id

    )