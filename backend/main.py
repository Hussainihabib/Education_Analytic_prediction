"""
EduPredict — FastAPI application entrypoint.

Run locally with:
    uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_URL

from app.core.logging_middleware import LoggingMiddleware
from app.core.exception_handler import register_exception_handlers
from app.core.scheduler import start_scheduler, stop_scheduler

from app.api import (
    auth,
    student,
    teacher,
    course,
    attendance,
    result,
    dashboard,
    notification_router,
    support_router,
    prediction,
    spark,
    reports,
    ingestion,
)


# ==========================================
# FastAPI Application
# ==========================================

app = FastAPI(
    title="EduPredict API",
    description="Educational Data Analytics & Prediction Platform",
    version="1.0.0",
)


# ==========================================
# CORS
# ==========================================

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Request Logging
# ==========================================

app.add_middleware(LoggingMiddleware)


# ==========================================
# Global Exception Handling
# ==========================================

register_exception_handlers(app)


# ==========================================
# API Routers
# ==========================================

app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Auth"],
)

app.include_router(
    student.router,
    prefix="/students",
    tags=["Students"],
)

app.include_router(
    teacher.router,
    prefix="/teachers",
    tags=["Teachers"],
)

app.include_router(
    course.router,
    prefix="/courses",
    tags=["Courses"],
)

app.include_router(
    attendance.router,
    prefix="/attendance",
    tags=["Attendance"],
)

app.include_router(
    result.router,
    prefix="/results",
    tags=["Results"],
)

app.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"],
)

app.include_router(
    notification_router.router,
    prefix="/notifications",
    tags=["Notifications"],
)

app.include_router(
    support_router.router,
    prefix="/support",
    tags=["Support"],
)

app.include_router(
    prediction.router,
    prefix="/prediction",
    tags=["Prediction / ML"],
)

app.include_router(
    spark.router,
    prefix="/spark",
    tags=["Spark Analytics"],
)

app.include_router(
    reports.router,
    prefix="/reports",
    tags=["Reports"],
)

app.include_router(
    ingestion.router,
    prefix="/ingestion",
    tags=["Data Ingestion"],
)


# ==========================================
# Basic Routes
# ==========================================

@app.get("/")
def root():
    return {
        "message": "EduPredict API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


# ==========================================
# Startup / Shutdown
# ==========================================

@app.on_event("startup")
def on_startup():
    start_scheduler()


@app.on_event("shutdown")
def on_shutdown():
    stop_scheduler()