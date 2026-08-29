from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator
from app.schemas.common import identifier, general_text, numeric, integer


class ResultBase(BaseModel):
    student_id: str = Field(..., min_length=3, max_length=20)
    course_id: str = Field(..., min_length=2, max_length=20)
    teacher_id: str = Field(..., min_length=3, max_length=20)
    marks_obtained: float = Field(..., ge=0)
    total_marks: float = Field(..., gt=0)
    semester: int = Field(..., ge=1, le=8)
    exam_type: Literal["Quiz", "Assignment", "Mid", "Final"]
    remarks: Optional[str] = Field(None, max_length=300)

    @field_validator("student_id", "course_id", "teacher_id")
    @classmethod
    def v_ids(cls, v, info): return identifier(v, info.field_name.replace("_", " "))
    @field_validator("marks_obtained", "total_marks", mode="before")
    @classmethod
    def v_numbers(cls, v, info): return numeric(v, info.field_name)
    @field_validator("semester")
    @classmethod
    def v_semester(cls, v): return integer(v, "Semester")
    @field_validator("remarks")
    @classmethod
    def v_remarks(cls, v): return general_text(v, "Remarks", 1, 300) if v is not None else v
    @model_validator(mode="after")
    def marks_limit(self):
        if self.marks_obtained > self.total_marks:
            raise ValueError("Marks obtained cannot be greater than total marks")
        return self


class ResultCreate(ResultBase):
    result_id: str = Field(..., min_length=3, max_length=20)
    @field_validator("result_id")
    @classmethod
    def v_result_id(cls, v): return identifier(v, "Result ID")


class ResultUpdate(ResultBase):
    pass


class ResultResponse(BaseModel):
    id: str
    result_id: str
    student_id: str
    course_id: str
    teacher_id: str
    marks_obtained: float
    total_marks: float
    percentage: float
    grade: str
    status: str
    semester: int
    exam_type: str
    remarks: Optional[str]
    created_at: datetime
