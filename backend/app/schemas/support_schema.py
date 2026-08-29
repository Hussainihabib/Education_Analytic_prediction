from typing import Literal
from pydantic import BaseModel, Field, field_validator
from app.schemas.common import general_text


class SupportCreate(BaseModel):
    subject: str = Field(..., min_length=3, max_length=100)
    message: str = Field(..., min_length=10, max_length=1000)
    category: Literal["Attendance", "Result", "Course", "Account", "Dashboard", "Prediction", "Bug", "Feedback", "Other"]
    priority: Literal["Low", "Medium", "High"]

    @field_validator("subject")
    @classmethod
    def v_subject(cls, v): return general_text(v, "Subject", 3, 100)
    @field_validator("message")
    @classmethod
    def v_message(cls, v): return general_text(v, "Message", 10, 1000)


class SupportStatusUpdate(BaseModel):
    status: Literal["Open", "In Progress", "Resolved", "Closed"]


class SupportReply(BaseModel):
    admin_reply: str = Field(..., min_length=3, max_length=1000)
    @field_validator("admin_reply")
    @classmethod
    def v_reply(cls, v): return general_text(v, "Admin reply", 3, 1000)
