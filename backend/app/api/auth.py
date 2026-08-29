# from fastapi import Depends
# from fastapi import APIRouter, HTTPException
# from app.auth.dependencies import get_current_user
# from app.schemas.user_schema import UserRegister, UserLogin
# from app.services.user_service import create_new_user, login_user
# from app.auth.hash import verify_password
# from app.auth.jwt_handler import create_access_token

# router = APIRouter()


# @router.post("/register")
# def register(user: UserRegister):

#     created_user = create_new_user(user)

#     if created_user is None:
#         raise HTTPException(
#             status_code=400,
#             detail="Email already exists"
#         )

#     return {
#         "message": "User Registered Successfully",
#         "user": {
#             "name": created_user["name"],
#             "email": created_user["email"],
#             "role": created_user["role"]
#         }
#     }
    
    
# @router.post("/login")
# def login(user: UserLogin):

#     db_user = login_user(user.email)

#     if not db_user:
#         raise HTTPException(
#             status_code=401,
#             detail="Invalid Email or Password"
#         )

#     if not verify_password(
#         user.password,
#         db_user["password"]
#     ):
#         raise HTTPException(
#             status_code=401,
#             detail="Invalid Email or Password"
#         )

#     token = create_access_token(
#         {
#             "sub": db_user["email"],
#             "role": db_user["role"]
#         }
#     )

#     return {

#         "access_token": token,

#         "token_type": "bearer",

#         "user": {

#             "name": db_user["name"],

#             "email": db_user["email"],

#             "role": db_user["role"]

#         }

#     }    
# @router.get("/me")
# def current_user(
#     user=Depends(get_current_user)
# ):

#     return {
#         "logged_in_user": user
#     }    
    
# from app.auth.dependencies import (
#     get_current_user,
#     admin_only,
#     teacher_only,
#     student_only,
#     analyst_only
# )    
    
# @router.get("/admin")
# def admin_dashboard(
#     user=Depends(admin_only)
# ):
#     return {
#         "message": "Welcome Admin",
#         "user": user
#     }
    
# @router.get("/teacher")
# def teacher_dashboard(
#     user=Depends(teacher_only)
# ):
#     return {
#         "message": "Welcome Teacher"
#     }        

from fastapi import Depends, APIRouter, HTTPException, status

from app.auth.dependencies import (
    get_current_user,
    admin_only,
    teacher_only,
    student_only,
    analyst_only
)

from app.schemas.user_schema import (
    UserRegister,
    UserLogin
)

from app.services.user_service import (
    create_new_user,
    login_user
)

from app.auth.hash import verify_password
from app.auth.jwt_handler import create_access_token


router = APIRouter()


# ============================================================
# REGISTER
# ============================================================

@router.post("/register")
def register(user: UserRegister):

    # --------------------------------------------------------
    # ADMIN CANNOT BE CREATED THROUGH PUBLIC REGISTRATION
    # --------------------------------------------------------

    if user.role == "Admin":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account cannot be created through public registration"
        )


    # --------------------------------------------------------
    # CREATE USER
    # --------------------------------------------------------

    created_user = create_new_user(user)


    # --------------------------------------------------------
    # DUPLICATE EMAIL
    # --------------------------------------------------------

    if created_user == "email_exists":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )


    # --------------------------------------------------------
    # DUPLICATE TEACHER ID
    # --------------------------------------------------------

    if created_user == "teacher_id_exists":
        raise HTTPException(status_code=400, detail="Teacher ID already has a user account")
    if created_user == "teacher_not_found":
        raise HTTPException(status_code=400, detail="Teacher ID does not exist")
    if created_user == "teacher_email_mismatch":
        raise HTTPException(status_code=400, detail="Teacher email does not match the registered teacher")


    # --------------------------------------------------------
    # DUPLICATE STUDENT ID
    # --------------------------------------------------------

    if created_user == "student_id_exists":
        raise HTTPException(status_code=400, detail="Student ID already has a user account")
    if created_user == "student_not_found":
        raise HTTPException(status_code=400, detail="Student ID does not exist")
    if created_user == "student_email_mismatch":
        raise HTTPException(status_code=400, detail="Student email does not match the registered student")


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "message": "User Registered Successfully",

        "user": {

            "name": created_user["name"],

            "email": created_user["email"],

            "role": created_user["role"],

            "teacher_id": created_user.get("teacher_id"),

            "student_id": created_user.get("student_id"),

            "is_active": created_user["is_active"]

        }

    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(user: UserLogin):

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    db_user = login_user(user.email)


    if not db_user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Email or Password"
        )


    # --------------------------------------------------------
    # ACTIVE ACCOUNT CHECK
    # --------------------------------------------------------

    if not db_user.get("is_active", True):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive"
        )


    # --------------------------------------------------------
    # PASSWORD CHECK
    # --------------------------------------------------------

    if not verify_password(
        user.password,
        db_user["password"]
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Email or Password"
        )


    # --------------------------------------------------------
    # JWT PAYLOAD
    # --------------------------------------------------------

    token_data = {

        "sub": db_user["email"],

        "role": db_user["role"],

        "teacher_id": db_user.get("teacher_id"),

        "student_id": db_user.get("student_id")

    }


    token = create_access_token(token_data)


    # --------------------------------------------------------
    # LOGIN RESPONSE
    # --------------------------------------------------------

    return {

        "access_token": token,

        "token_type": "bearer",

        "user": {

            "name": db_user["name"],

            "email": db_user["email"],

            "role": db_user["role"],

            "teacher_id": db_user.get("teacher_id"),

            "student_id": db_user.get("student_id"),

            "is_active": db_user.get("is_active", True)

        }

    }


# ============================================================
# CURRENT USER
# ============================================================

@router.get("/me")
def current_user(
    user=Depends(get_current_user)
):

    return {

        "logged_in_user": user

    }


# ============================================================
# ADMIN TEST / DASHBOARD ACCESS
# ============================================================

@router.get("/admin")
def admin_dashboard(
    user=Depends(admin_only)
):

    return {

        "message": "Welcome Admin",

        "user": user

    }


# ============================================================
# TEACHER TEST / DASHBOARD ACCESS
# ============================================================

@router.get("/teacher")
def teacher_dashboard(
    user=Depends(teacher_only)
):

    return {

        "message": "Welcome Teacher",

        "user": user

    }


# ============================================================
# STUDENT TEST / DASHBOARD ACCESS
# ============================================================

@router.get("/student")
def student_dashboard(
    user=Depends(student_only)
):

    return {

        "message": "Welcome Student",

        "user": user

    }


# ============================================================
# ANALYST TEST / DASHBOARD ACCESS
# ============================================================

@router.get("/analyst")
def analyst_dashboard(
    user=Depends(analyst_only)
):

    return {

        "message": "Welcome Analyst",

        "user": user

    }
