from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal
from app.schemas.common import identifier, name, alphabetic_text, general_text, phone, integer


class TeacherBase(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    gender: Literal["Male", "Female", "Other"]
    age: int = Field(..., ge=22, le=70)
    department: str = Field(..., min_length=2, max_length=100)
    designation: str = Field(..., min_length=2, max_length=100)
    qualification: str = Field(..., min_length=2, max_length=150)
    experience: int = Field(..., ge=0, le=50)
    phone: str
    address: str = Field(..., min_length=3, max_length=250)

    @field_validator("first_name", "last_name")
    @classmethod
    def v_names(cls, v): return name(v, "Name")
    @field_validator("email")
    @classmethod
    def v_email(cls, v): return str(v).strip().lower()
    @field_validator("department", "designation", "qualification")
    @classmethod
    def v_alpha(cls, v, info): return alphabetic_text(v, info.field_name.replace("_", " "))
    @field_validator("phone")
    @classmethod
    def v_phone(cls, v): return phone(v)
    @field_validator("address")
    @classmethod
    def v_address(cls, v): return general_text(v, "Address", 3, 250)
    @field_validator("age", "experience")
    @classmethod
    def v_ints(cls, v, info): return integer(v, info.field_name)


class TeacherCreate(TeacherBase):
    teacher_id: str = Field(..., min_length=3, max_length=20)
    status: Literal["Active", "Inactive"] = "Active"

    @field_validator("teacher_id")
    @classmethod
    def v_id(cls, v): return identifier(v, "Teacher ID")


class TeacherUpdate(TeacherBase):
    status: Literal["Active", "Inactive"]


class TeacherResponse(BaseModel):
    id: str
    teacher_id: str
    first_name: str
    last_name: str
    email: EmailStr
    department: str
    designation: str
    status: str
    created_at: datetime
