from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from app.config import SECRET_KEY, ALGORITHM
from app.database.connection import db

security = HTTPBearer(auto_error=True)

VALID_ROLES = {"Admin", "Teacher", "Student", "Analyst"}


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or Expired Token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    email = payload.get("sub")
    role = payload.get("role")
    if not email or role not in VALID_ROLES:
        raise HTTPException(status_code=401, detail="Invalid Token Payload")

    user = db["users"].find_one({"email": email.lower()})
    if not user:
        raise HTTPException(status_code=401, detail="User account not found")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Your account is inactive")

    # The database is the source of truth for role and identity.
    if user.get("role") != role:
        raise HTTPException(status_code=401, detail="Token role is no longer valid")

    if role == "Teacher" and not user.get("teacher_id"):
        raise HTTPException(status_code=401, detail="Teacher identity is not configured")
    if role == "Student" and not user.get("student_id"):
        raise HTTPException(status_code=401, detail="Student identity is not configured")

    return {
        "sub": user["email"],
        "email": user["email"],
        "role": user["role"],
        "teacher_id": user.get("teacher_id"),
        "student_id": user.get("student_id"),
        "name": user.get("name"),
        "is_active": user.get("is_active", True),
    }


def _role_only(role):
    def dependency(user=Depends(get_current_user)):
        if user.get("role") != role:
            raise HTTPException(status_code=403, detail=f"{role} Access Required")
        return user
    return dependency


def admin_only(user=Depends(get_current_user)):
    if user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Admin Access Required")
    return user


def teacher_only(user=Depends(get_current_user)):
    if user.get("role") != "Teacher":
        raise HTTPException(status_code=403, detail="Teacher Access Required")
    return user


def student_only(user=Depends(get_current_user)):
    if user.get("role") != "Student":
        raise HTTPException(status_code=403, detail="Student Access Required")
    return user


def analyst_only(user=Depends(get_current_user)):
    if user.get("role") != "Analyst":
        raise HTTPException(status_code=403, detail="Analyst Access Required")
    return user


def admin_or_teacher(user=Depends(get_current_user)):
    if user.get("role") not in {"Admin", "Teacher"}:
        raise HTTPException(status_code=403, detail="Admin or Teacher Access Required")
    return user


def admin_or_student(user=Depends(get_current_user)):
    if user.get("role") not in {"Admin", "Student"}:
        raise HTTPException(status_code=403, detail="Admin or Student Access Required")
    return user


def admin_or_analyst(user=Depends(get_current_user)):
    if user.get("role") not in {"Admin", "Analyst"}:
        raise HTTPException(status_code=403, detail="Admin or Analyst Access Required")
    return user


def admin_teacher_analyst(user=Depends(get_current_user)):
    if user.get("role") not in {"Admin", "Teacher", "Analyst"}:
        raise HTTPException(status_code=403, detail="Admin, Teacher or Analyst Access Required")
    return user


def all_authenticated(user=Depends(get_current_user)):
    return user


def admin_or_teacher_or_student_or_analyst(user=Depends(get_current_user)):
    return user
