from fastapi import APIRouter, Depends

from app.auth.dependencies import (
    admin_only,
    get_current_user
)

from app.schemas.notification_schema import NotificationCreate

from app.services.notification_service import (
    create_notification,
    get_all_notifications,
    get_my_notifications,
    mark_notification_read,
    delete_notification,
    generate_notifications
)

router = APIRouter()


# ==========================================
# Create Notification
# ==========================================

@router.post("/")

def create_notification_api(
    data: NotificationCreate,
    user=Depends(admin_only)
):

    return create_notification(data)


# ==========================================
# All Notifications (Admin)
# ==========================================

@router.get("/")

def all_notifications_api(
    user=Depends(admin_only)
):

    return get_all_notifications()


# ==========================================
# My Notifications
# ==========================================


@router.get("/my")
def my_notifications_api(
    user=Depends(get_current_user)
):
    print(user)

    return get_my_notifications(

    user["role"],

    user["sub"]

)

# ==========================================
# Mark Read
# ==========================================

@router.put("/{notification_id}")

def mark_read_api(

    notification_id: str,

    user=Depends(get_current_user)

):

    if user["role"] == "Admin":
        return mark_notification_read(notification_id)
    return mark_notification_read(
        notification_id,
        user["role"],
        user["sub"]
    )


# ==========================================
# Delete Notification
# ==========================================

@router.delete("/{notification_id}")

def delete_notification_api(

    notification_id: str,

    user=Depends(admin_only)

):

    return delete_notification(

        notification_id

    )


# ==========================================
# Auto Generate Notifications
# ==========================================

@router.post("/generate")

def generate_notifications_api(

    user=Depends(admin_only)

):

    return generate_notifications()