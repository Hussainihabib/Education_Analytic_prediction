from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator
from app.schemas.common import identifier, general_text


class AttendanceBase(BaseModel):
    student_id: str = Field(..., min_length=3, max_length=20)
    course_id: str = Field(..., min_length=2, max_length=20)
    teacher_id: str = Field(..., min_length=3, max_length=20)
    attendance_date: date
    status: Literal["Present", "Absent", "Late", "Leave"]
    remarks: Optional[str] = Field(None, max_length=300)

    @field_validator("student_id", "course_id", "teacher_id")
    @classmethod
    def v_ids(cls, v, info): return identifier(v, info.field_name.replace("_", " "))
    @field_validator("remarks")
    @classmethod
    def v_remarks(cls, v): return general_text(v, "Remarks", 1, 300) if v is not None else v


class AttendanceCreate(AttendanceBase):
    attendance_id: str = Field(..., min_length=3, max_length=20)
    @field_validator("attendance_id")
    @classmethod
    def v_id(cls, v): return identifier(v, "Attendance ID")


class AttendanceUpdate(AttendanceBase):
    pass


class AttendanceResponse(BaseModel):
    id: str
    attendance_id: str
    student_id: str
    course_id: str
    teacher_id: str
    attendance_date: date
    status: str
    remarks: Optional[str]
    created_at: datetime
