# from pydantic import BaseModel, EmailStr
# from typing import Literal
# from datetime import datetime


# class UserRegister(BaseModel):
#     name: str
#     email: EmailStr
#     password: str
#     role: Literal["Admin", "Teacher", "Student", "Analyst"]


# class UserLogin(BaseModel):
#     email: EmailStr
#     password: str


# class UserResponse(BaseModel):
#     id: str
#     name: str
#     email: EmailStr
   # role: str
#     is_active: bool
#     created_at: datetime

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Literal, Optional
from datetime import datetime
import re


# ============================================================
# USER REGISTER
# ============================================================

class UserRegister(BaseModel):

    name: str = Field(
        ...,
        min_length=2,
        max_length=50
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=72
    )

    role: Literal[
        "Admin",
        "Teacher",
        "Student",
        "Analyst"
    ]

    teacher_id: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=20
    )

    student_id: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=20
    )


    # --------------------------------------------------------
    # NAME VALIDATION
    # --------------------------------------------------------

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):

        value = value.strip()

        if not value:
            raise ValueError("Name cannot be empty")

        if not re.fullmatch(r"[A-Za-z]+(?: [A-Za-z]+)*", value):
            raise ValueError(
                "Name must contain alphabets only without spaces or special characters"
            )

        return value


    # --------------------------------------------------------
    # EMAIL VALIDATION
    # --------------------------------------------------------

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):

        value = str(value).strip().lower()

        if not value:
            raise ValueError("Email cannot be empty")

        return value


    # --------------------------------------------------------
    # PASSWORD VALIDATION
    # --------------------------------------------------------

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):

        if not value.strip():
            raise ValueError("Password cannot be empty")

        if any(char.isspace() for char in value):
            raise ValueError(
                "Password cannot contain spaces"
            )

        if not re.search(r"[A-Z]", value):
            raise ValueError(
                "Password must contain at least one uppercase letter"
            )

        if not re.search(r"[a-z]", value):
            raise ValueError(
                "Password must contain at least one lowercase letter"
            )

        if not re.search(r"\d", value):
            raise ValueError(
                "Password must contain at least one number"
            )

        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError(
                "Password must contain at least one special character"
            )

        return value


    # --------------------------------------------------------
    # TEACHER / STUDENT ID VALIDATION
    # --------------------------------------------------------

    @field_validator("teacher_id", "student_id")
    @classmethod
    def validate_ids(cls, value):

        if value is None:
            return value

        value = value.strip()

        if not value:
            raise ValueError("ID cannot be empty")

        # Letters and numbers only.
        # No spaces or special characters.
        if not re.fullmatch(r"[A-Za-z0-9_-]+", value):
            raise ValueError(
                "ID must contain letters and numbers only"
            )

        return value.upper()


    # --------------------------------------------------------
    # ROLE-BASED ID VALIDATION
    # --------------------------------------------------------

    @model_validator(mode="after")
    def validate_role_identity(self):

        if self.role == "Teacher":

            if not self.teacher_id:
                raise ValueError(
                    "teacher_id is required for Teacher role"
                )

            if self.student_id:
                raise ValueError(
                    "student_id is not allowed for Teacher role"
                )

        elif self.role == "Student":

            if not self.student_id:
                raise ValueError(
                    "student_id is required for Student role"
                )

            if self.teacher_id:
                raise ValueError(
                    "teacher_id is not allowed for Student role"
                )

        elif self.role in ["Admin", "Analyst"]:

            if self.teacher_id:
                raise ValueError(
                    "teacher_id is not allowed for this role"
                )

            if self.student_id:
                raise ValueError(
                    "student_id is not allowed for this role"
                )

        return self


# ============================================================
# USER LOGIN
# ============================================================

class UserLogin(BaseModel):

    email: EmailStr

    password: str = Field(
        ...,
        min_length=1,
        max_length=72
    )


    @field_validator("email")
    @classmethod
    def validate_login_email(cls, value):

        return str(value).strip().lower()


    @field_validator("password")
    @classmethod
    def validate_login_password(cls, value):

        if not value.strip():
            raise ValueError("Password cannot be empty")

        if any(char.isspace() for char in value):
            raise ValueError(
                "Password cannot contain spaces"
            )

        return value


# ============================================================
# USER RESPONSE
# ============================================================

class UserResponse(BaseModel):

    id: str

    name: str

    email: EmailStr

    role: Literal[
        "Admin",
        "Teacher",
        "Student",
        "Analyst"
    ]

    teacher_id: Optional[str] = None

    student_id: Optional[str] = None

    is_active: bool

    created_at: datetime


