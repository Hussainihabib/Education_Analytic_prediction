
from fastapi import APIRouter, Depends, HTTPException
from app.auth.dependencies import get_current_user, admin_only
from app.database.connection import db
from app.ml.mongo_training import retrain_all, load_metadata, anomaly_results, correlation_matrix, semester_trend
from app.ml.predictor import predict_student, predict_dropout, predict_course, student_data_from_db
from app.ml.runtime_schemas import StudentPredictionInput, CoursePredictionInput

router = APIRouter()


def _allowed_reader(user):
    if user.get("role") not in {"Admin", "Teacher", "Student", "Analyst"}:
        raise HTTPException(status_code=403, detail="Access Denied")


@router.get("/status")
def ml_status(user=Depends(get_current_user)):
    _allowed_reader(user)
    return load_metadata()


@router.post("/retrain")
def retrain(user=Depends(admin_only)):
    try:
        return {"success": True, "message": "ML models retrained from current MongoDB records", **retrain_all(db)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/", name="student_performance_prediction")
@router.post("/student", include_in_schema=False)
def student_prediction(data: StudentPredictionInput, user=Depends(get_current_user)):
    _allowed_reader(user)
    try:
        return predict_student(data)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@router.post("/student/{student_id}")
def student_prediction_from_database(student_id: str, user=Depends(get_current_user)):
    _allowed_reader(user)
    requested = student_id.strip().upper()
    if user.get("role") == "Student" and str(user.get("student_id", "")).strip().upper() != requested:
        raise HTTPException(status_code=403, detail="Students can only view their own predictions")
    if user.get("role") == "Teacher":
        student = db["students"].find_one({"student_id": requested})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        if student.get("teacher_id") and student.get("teacher_id") != user.get("teacher_id"):
            raise HTTPException(status_code=403, detail="You can only view predictions for your assigned students")
    data = student_data_from_db(db, requested)
    if data is None:
        raise HTTPException(status_code=404, detail="Student not found or no result data available")
    try:
        result = predict_student(type("PredictionData", (), data)())
        return {**result, "student_id": data["student_id"], "source": "MongoDB"}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@router.post("/dropout")
def dropout_prediction(data: StudentPredictionInput, user=Depends(get_current_user)):
    _allowed_reader(user)
    try:
        return predict_dropout(data)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@router.post("/course-demand")
def course_demand_prediction(data: CoursePredictionInput, user=Depends(get_current_user)):
    _allowed_reader(user)
    try:
        return predict_course(data)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@router.get("/anomalies")
def anomalies(limit: int = 50, user=Depends(get_current_user)):
    _allowed_reader(user)
    return {"total": len(anomaly_results(db, limit)), "anomalies": anomaly_results(db, limit)}


@router.get("/correlation")
def correlation(user=Depends(get_current_user)):
    _allowed_reader(user)
    return {"correlation": correlation_matrix(db)}


@router.get("/trend")
def trend(user=Depends(get_current_user)):
    _allowed_reader(user)
    return {"trend": semester_trend(db)}
