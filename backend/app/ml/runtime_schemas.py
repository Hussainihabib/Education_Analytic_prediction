from pydantic import BaseModel, Field

class StudentPredictionInput(BaseModel):
    attendance: float = Field(..., ge=0, le=100)
    cgpa: float = Field(..., ge=0, le=4)
    avg_marks_percentage: float = Field(..., ge=0, le=100)
    failed_results: int = Field(0, ge=0)
    result_count: int = Field(0, ge=0)
    semester: int = Field(..., ge=1, le=8)
    department: str = Field(..., min_length=1, max_length=100)

class CoursePredictionInput(BaseModel):
    department: str = Field(..., min_length=1, max_length=100)
    semester: int = Field(..., ge=1, le=8)
    students_enrolled: int = Field(0, ge=0)
    teacher_count: int = Field(0, ge=0)
    previous_demand: float = Field(0, ge=0)
