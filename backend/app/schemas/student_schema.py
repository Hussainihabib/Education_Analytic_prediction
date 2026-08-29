from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from app.schemas.common import identifier, name, alphabetic_text, general_text, phone, numeric, integer


class StudentCreate(BaseModel):
    student_id: str = Field(..., min_length=3, max_length=20)
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    gender: Literal["Male", "Female", "Other"]
    age: int = Field(..., ge=15, le=100)
    department: str = Field(..., min_length=2, max_length=100)
    semester: int = Field(..., ge=1, le=8)
    cgpa: float = Field(..., ge=0, le=4)
    attendance: float = Field(..., ge=0, le=100)
    phone: Optional[str] = None
    address: Optional[str] = Field(None, max_length=250)
    teacher_id: Optional[str] = None

    @field_validator("student_id")
    @classmethod
    def v_student_id(cls, v): return identifier(v, "Student ID")
    @field_validator("first_name", "last_name")
    @classmethod
    def v_names(cls, v): return name(v, "Name")
    @field_validator("email")
    @classmethod
    def v_email(cls, v): return str(v).strip().lower()
    @field_validator("department")
    @classmethod
    def v_department(cls, v): return alphabetic_text(v, "Department")
    @field_validator("phone")
    @classmethod
    def v_phone(cls, v): return phone(v) if v is not None else v
    @field_validator("address")
    @classmethod
    def v_address(cls, v): return general_text(v, "Address", 3, 250) if v is not None else v
    @field_validator("teacher_id")
    @classmethod
    def v_teacher_id(cls, v): return identifier(v, "Teacher ID") if v is not None else v
    @field_validator("age", "semester")
    @classmethod
    def v_ints(cls, v, info): return integer(v, info.field_name)
    @field_validator("cgpa", "attendance", mode="before")
    @classmethod
    def v_numbers(cls, v, info): return numeric(v, info.field_name)


class StudentUpdate(StudentCreate):
    status: Literal["Active", "Inactive"]
    student_id: Optional[str] = None


class StudentResponse(BaseModel):
    id: str
    student_id: str
    first_name: str
    last_name: str
    email: EmailStr
    department: str
    teacher_id: Optional[str] = None
    semester: int
    cgpa: float
    attendance: float
    status: str
    created_at: datetime
