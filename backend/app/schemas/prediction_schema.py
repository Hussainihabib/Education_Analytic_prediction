from pydantic import BaseModel, Field, field_validator
from app.schemas.common import numeric, integer, alphabetic_text


class PredictionRequest(BaseModel):
    attendance: float = Field(..., ge=0, le=100)
    cgpa: float = Field(..., ge=0, le=4)
    assignment_marks: float = Field(..., ge=0)
    quiz_marks: float = Field(..., ge=0)
    mid_marks: float = Field(..., ge=0)
    final_marks: float = Field(..., ge=0)
    semester: int = Field(..., ge=1, le=8)
    department: str = Field(..., min_length=2, max_length=100)

    @field_validator("attendance", "cgpa", "assignment_marks", "quiz_marks", "mid_marks", "final_marks", mode="before")
    @classmethod
    def v_numbers(cls, v, info): return numeric(v, info.field_name)
    @field_validator("semester")
    @classmethod
    def v_semester(cls, v): return integer(v, "Semester")
    @field_validator("department")
    @classmethod
    def v_department(cls, v): return alphabetic_text(v, "Department")
