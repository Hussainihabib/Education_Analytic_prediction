from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator
from app.schemas.common import identifier, alphabetic_text, general_text, integer


class CourseBase(BaseModel):
    course_name: str = Field(..., min_length=2, max_length=120)
    department: str = Field(..., min_length=2, max_length=100)
    semester: int = Field(..., ge=1, le=8)
    credit_hours: int = Field(..., ge=1, le=6)
    teacher_name: str = Field(..., min_length=2, max_length=100)
    teacher_id: Optional[str] = Field(None, min_length=3, max_length=20)
    course_type: Literal["Core", "Elective"]
    status: Literal["Active", "Inactive"]

    @field_validator("course_name", "teacher_name")
    @classmethod
    def v_text(cls, v, info): return general_text(v, info.field_name.replace("_", " "), 2, 120)
    @field_validator("department")
    @classmethod
    def v_department(cls, v): return alphabetic_text(v, "Department")
    @field_validator("teacher_id")
    @classmethod
    def v_teacher_id(cls, v): return identifier(v, "Teacher ID") if v is not None else v
    @field_validator("semester", "credit_hours")
    @classmethod
    def v_int(cls, v, info): return integer(v, info.field_name)


class CourseCreate(CourseBase):
    course_code: str = Field(..., min_length=3, max_length=20)
    @field_validator("course_code")
    @classmethod
    def v_code(cls, v): return identifier(v, "Course Code")


class CourseUpdate(CourseBase):
    pass


class CourseResponse(BaseModel):
    id: str
    course_code: str
    course_name: str
    department: str
    semester: int
    credit_hours: int
    teacher_name: str
    teacher_id: Optional[str] = None
    course_type: str
    status: str
    created_at: datetime
