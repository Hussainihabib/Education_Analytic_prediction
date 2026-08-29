from fastapi import HTTPException, status
from app.database.connection import db


def require_roles(user: dict, roles: set[str]):
    role = user.get("role")
    if role not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Required role: {', '.join(sorted(roles))}"
        )
    return user


def get_scope_query(user: dict, resource: str) -> dict:
    """Return a MongoDB filter enforcing role ownership for a resource."""
    role = user.get("role")

    if role in {"Admin", "Analyst"}:
        return {}

    if resource == "students":
        if role == "Teacher":
            return {"teacher_id": user.get("teacher_id")}
        if role == "Student":
            return {"student_id": user.get("student_id")}

    if resource == "teachers":
        if role == "Teacher":
            return {"teacher_id": user.get("teacher_id")}
        if role == "Student":
            student = db["students"].find_one(
                {"student_id": user.get("student_id")},
                {"teacher_id": 1}
            )
            teacher_id = student.get("teacher_id") if student else None
            return {"teacher_id": teacher_id} if teacher_id else {"_id": None}

    if resource == "attendance":
        if role == "Teacher":
            return {"teacher_id": user.get("teacher_id")}
        if role == "Student":
            return {"student_id": user.get("student_id")}

    if resource == "results":
        if role == "Teacher":
            return {"teacher_id": user.get("teacher_id")}
        if role == "Student":
            return {"student_id": user.get("student_id")}

    if resource == "courses":
        if role == "Teacher":
            teacher_id = user.get("teacher_id")
            teacher = db["teachers"].find_one(
                {"teacher_id": teacher_id},
                {"first_name": 1, "last_name": 1}
            )
            if teacher:
                full_name = f"{teacher.get('first_name', '')} {teacher.get('last_name', '')}".strip()
                return {
                    "$or": [
                        {"teacher_id": teacher_id},
                        {"teacher_name": full_name}
                    ]
                }
            return {"teacher_id": teacher_id}

        if role == "Student":
            student = db["students"].find_one(
                {"student_id": user.get("student_id")},
                {"department": 1, "semester": 1}
            )
            if not student:
                return {"_id": None}
            return {
                "department": student.get("department"),
                "semester": student.get("semester")
            }

    return {"_id": None}


def merge_filters(scope: dict, extra: dict | None = None) -> dict:
    if not extra:
        return scope
    if not scope:
        return extra
    if not scope.get("$or") and not extra.get("$or"):
        merged = dict(scope)
        merged.update(extra)
        return merged
    return {"$and": [scope, extra]}


def assert_resource_owner(user: dict, resource: str, document: dict | None):
    if document is None:
        raise HTTPException(status_code=404, detail="Record Not Found")
    scope = get_scope_query(user, resource)
    # Admin/Analyst scope is unrestricted.
    if not scope:
        return document
    collection = db[resource]
    if not collection.find_one({"_id": document.get("_id"), **scope}):
        raise HTTPException(status_code=403, detail="You do not have access to this record")
    return document
