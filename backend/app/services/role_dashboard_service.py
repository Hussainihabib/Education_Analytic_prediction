from datetime import datetime
from app.database.connection import db
from app.auth.access import get_scope_query, merge_filters

students = db["students"]
teachers = db["teachers"]
courses = db["courses"]
attendance = db["attendance"]
results = db["results"]


def _rows(collection, query):
    return list(collection.find(query))


def _student_query(user, extra=None):
    return merge_filters(get_scope_query(user, "students"), extra)


def _result_query(user, extra=None):
    return merge_filters(get_scope_query(user, "results"), extra)


def _attendance_query(user, extra=None):
    return merge_filters(get_scope_query(user, "attendance"), extra)


def _course_query(user, extra=None):
    return merge_filters(get_scope_query(user, "courses"), extra)


def _teacher_query(user, extra=None):
    return merge_filters(get_scope_query(user, "teachers"), extra)


def stats(user):
    sq = _student_query(user)
    rq = _result_query(user)
    aq = _attendance_query(user)
    cq = _course_query(user)
    tq = _teacher_query(user)
    return {
        "total_students": students.count_documents(sq),
        "active_students": students.count_documents(merge_filters(sq, {"status": "Active"})),
        "inactive_students": students.count_documents(merge_filters(sq, {"status": "Inactive"})),
        "total_teachers": teachers.count_documents(tq),
        "active_teachers": teachers.count_documents(merge_filters(tq, {"status": "Active"})),
        "inactive_teachers": teachers.count_documents(merge_filters(tq, {"status": "Inactive"})),
        "total_courses": courses.count_documents(cq),
        "total_attendance": attendance.count_documents(aq),
        "total_results": results.count_documents(rq),
    }


def students_by_department(user):
    return [{"department": x["_id"], "count": x["count"]} for x in students.aggregate([
        {"$match": _student_query(user)},
        {"$group": {"_id": "$department", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ])]


def students_by_semester(user):
    return [{"semester": x["_id"], "count": x["count"]} for x in students.aggregate([
        {"$match": _student_query(user)},
        {"$group": {"_id": "$semester", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ])]


def attendance_summary(user):
    return [{"status": x["_id"], "count": x["count"]} for x in attendance.aggregate([
        {"$match": _attendance_query(user)},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ])]


def average_cgpa(user):
    row = list(students.aggregate([
        {"$match": _student_query(user)},
        {"$group": {"_id": None, "average": {"$avg": "$cgpa"}}}
    ]))
    return {"average_cgpa": round(row[0]["average"], 2) if row and row[0]["average"] is not None else 0}


def average_attendance(user):
    row = list(students.aggregate([
        {"$match": _student_query(user)},
        {"$group": {"_id": None, "average": {"$avg": "$attendance"}}}
    ]))
    return {"average_attendance": round(row[0]["average"], 2) if row and row[0]["average"] is not None else 0}


def result_summary(user):
    return {x["_id"]: x["count"] for x in results.aggregate([
        {"$match": _result_query(user)},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ])}


def grade_distribution(user):
    data = {x["_id"]: x["count"] for x in results.aggregate([
        {"$match": _result_query(user)},
        {"$group": {"_id": "$grade", "count": {"$sum": 1}}}
    ])}
    return [{"grade": g, "count": data.get(g, 0)} for g in ["A+", "A", "B+", "B", "C+", "C", "D", "F"]]


def department_performance(user):
    rows = students.aggregate([
        {"$match": _student_query(user)},
        {"$group": {"_id": "$department", "average_cgpa": {"$avg": "$cgpa"}, "student_count": {"$sum": 1}}},
        {"$sort": {"average_cgpa": -1}}, {"$limit": 10}
    ])
    return [{"rank": i, "department": x["_id"], "average_cgpa": round(x["average_cgpa"] or 0, 2), "students": x["student_count"]} for i, x in enumerate(rows, 1)]


def top_students(user):
    rows = students.find(_student_query(user), {"_id": 0, "student_id": 1, "first_name": 1, "last_name": 1, "department": 1, "semester": 1, "cgpa": 1, "attendance": 1}).sort("cgpa", -1).limit(10)
    return [{"rank": i, "student_id": x["student_id"], "name": f'{x.get("first_name", "")} {x.get("last_name", "")}'.strip(), "department": x.get("department"), "semester": x.get("semester"), "cgpa": x.get("cgpa"), "attendance": x.get("attendance")} for i, x in enumerate(rows, 1)]


def monthly_attendance(user):
    rows = attendance.aggregate([
        {"$match": _attendance_query(user)},
        {"$group": {"_id": {"$substr": ["$attendance_date", 5, 2]}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ])
    months = {"01":"Jan","02":"Feb","03":"Mar","04":"Apr","05":"May","06":"Jun","07":"Jul","08":"Aug","09":"Sep","10":"Oct","11":"Nov","12":"Dec"}
    return [{"month": months.get(x["_id"], x["_id"]), "count": x["count"]} for x in rows]


def course_performance(user):
    rows = results.aggregate([
        {"$match": _result_query(user)},
        {"$group": {"_id": "$course_id", "average_marks": {"$avg": "$marks_obtained"}, "pass": {"$sum": {"$cond": [{"$eq": ["$status", "Pass"]}, 1, 0]}}, "fail": {"$sum": {"$cond": [{"$eq": ["$status", "Fail"]}, 1, 0]}}, "students": {"$sum": 1}}},
        {"$sort": {"average_marks": -1}}
    ])
    return [{"course_id": x["_id"], "average_marks": round(x.get("average_marks") or 0, 2), "pass": x.get("pass", 0), "fail": x.get("fail", 0), "students": x.get("students", 0)} for x in rows]


def teacher_performance(user):
    rows = teachers.find(_teacher_query(user), {"_id": 0, "teacher_id": 1, "first_name": 1, "last_name": 1, "department": 1, "status": 1})
    output = []
    for i, t in enumerate(rows, 1):
        q = _course_query(user)
        q = merge_filters(q, {"teacher_id": t["teacher_id"]})
        total_courses = courses.count_documents(q)
        output.append({"rank": i, "teacher_id": t["teacher_id"], "teacher_name": f'{t.get("first_name", "")} {t.get("last_name", "")}'.strip(), "department": t.get("department"), "status": t.get("status"), "total_courses": total_courses})
    return output


def at_risk_students(user):
    output = []
    for s in students.find(_student_query(user), {"_id": 0, "student_id": 1, "first_name": 1, "last_name": 1, "department": 1, "semester": 1, "attendance": 1, "cgpa": 1}):
        risk = "Low"
        if s.get("attendance", 0) < 75 or s.get("cgpa", 0) < 2.5: risk = "High"
        elif s.get("attendance", 0) < 85 or s.get("cgpa", 0) < 3: risk = "Medium"
        if risk != "Low":
            output.append({"student_id": s["student_id"], "name": f'{s.get("first_name", "")} {s.get("last_name", "")}'.strip(), "department": s.get("department"), "semester": s.get("semester"), "attendance": s.get("attendance"), "cgpa": s.get("cgpa"), "risk": risk})
    output.sort(key=lambda x: (x["risk"] != "High", x["cgpa"], x["attendance"]))
    return output[:50]


def department_pass_rate(user):
    student_query = _student_query(user)
    rows = results.aggregate([
        {"$match": _result_query(user)},
        {"$lookup": {"from": "students", "localField": "student_id", "foreignField": "student_id", "as": "student"}},
        {"$unwind": "$student"},
        {"$match": {"student": {"$exists": True}}},
        {"$match": {"student.department": {"$exists": True}}},
        {"$group": {"_id": "$student.department", "pass": {"$sum": {"$cond": [{"$eq": ["$status", "Pass"]}, 1, 0]}}, "total": {"$sum": 1}}},
        {"$project": {"_id": 0, "department": "$_id", "pass": 1, "fail": {"$subtract": ["$total", "$pass"]}, "pass_rate": {"$cond": [{"$gt": ["$total", 0]}, {"$multiply": [{"$divide": ["$pass", "$total"]}, 100]}, 0]}}},
        {"$sort": {"department": 1}}
    ])
    # Enforce student ownership for non-global roles after lookup.
    if user.get("role") in {"Teacher", "Student"}:
        allowed = {x.get("student_id") for x in students.find(student_query, {"student_id": 1})}
        filtered = []
        for x in results.aggregate([
            {"$match": _result_query(user)},
            {"$lookup": {"from": "students", "localField": "student_id", "foreignField": "student_id", "as": "student"}},
            {"$unwind": "$student"},
            {"$match": {"student.student_id": {"$in": list(allowed)}}},
            {"$group": {"_id": "$student.department", "pass": {"$sum": {"$cond": [{"$eq": ["$status", "Pass"]}, 1, 0]}}, "total": {"$sum": 1}}},
        ]):
            total=x["total"]; filtered.append({"department":x["_id"],"pass":x["pass"],"fail":total-x["pass"],"pass_rate":round((x["pass"]/total)*100,2) if total else 0})
        return filtered
    return [{**x, "pass_rate": round(x.get("pass_rate", 0), 2)} for x in rows]


def performance_trend(user):
    rows = results.aggregate([
        {"$match": _result_query(user)},
        {"$group": {"_id": "$semester", "average_percentage": {"$avg": "$percentage"}, "results": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ])
    return [{"semester": x["_id"], "average_percentage": round(x.get("average_percentage") or 0, 2), "results": x.get("results", 0)} for x in rows]


def get_departments(user):
    return sorted({x.get("department") for x in students.find(_student_query(user), {"department":1}) if x.get("department")})


def get_semesters(user):
    return sorted({x.get("semester") for x in students.find(_student_query(user), {"semester":1}) if x.get("semester") is not None})


def admin_filter(user, department=None, semester=None, status=None):
    extra = {}
    if department: extra["department"] = department
    if semester is not None: extra["semester"] = semester
    if status: extra["status"] = status
    q = _student_query(user, extra)
    return {"total": students.count_documents(q), "students": list(students.find(q, {"_id": 0}))}


def full_dashboard(user):
    return {
        **stats(user),
        **average_attendance(user),
        **average_cgpa(user),
        "students_by_department": students_by_department(user),
        "students_by_semester": students_by_semester(user),
        "attendance_summary": attendance_summary(user),
        "result_summary": result_summary(user),
        "high_risk_students": at_risk_students(user),
        "last_updated": datetime.now(),
    }
