from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.schemas.common import general_text


class NotificationCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=120)
    message: str = Field(..., min_length=3, max_length=1000)
    receiver_role: Literal["Admin", "Teacher", "Student", "Analyst"]
    receiver_email: EmailStr

    @field_validator("title")
    @classmethod
    def v_title(cls, v): return general_text(v, "Title", 3, 120)
    @field_validator("message")
    @classmethod
    def v_message(cls, v): return general_text(v, "Message", 3, 1000)
    @field_validator("receiver_email")
    @classmethod
    def v_email(cls, v): return str(v).strip().lower()


class NotificationResponse(BaseModel):
    notification_id: str
    title: str
    message: str
    receiver_role: str
    receiver_email: EmailStr
    is_read: bool
    created_at: datetime


class NotificationRead(BaseModel):
    is_read: bool = True
