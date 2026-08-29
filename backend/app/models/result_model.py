from datetime import datetime


def calculate_percentage(obtained, total):

    return round((obtained / total) * 100, 2)


def calculate_grade(percentage):

    if percentage >= 90:
        return "A+"

    elif percentage >= 85:
        return "A"

    elif percentage >= 80:
        return "B+"

    elif percentage >= 75:
        return "B"

    elif percentage >= 70:
        return "C+"

    elif percentage >= 60:
        return "C"

    elif percentage >= 50:
        return "D"

    else:
        return "F"


def calculate_status(percentage):

    return "Pass" if percentage >= 50 else "Fail"


def create_result(result):

    percentage = calculate_percentage(
        result.marks_obtained,
        result.total_marks
    )

    grade = calculate_grade(percentage)

    status = calculate_status(percentage)

    return {

        "result_id": result.result_id,

        "student_id": result.student_id,

        "course_id": result.course_id,

        "teacher_id": result.teacher_id,

        "marks_obtained": result.marks_obtained,

        "total_marks": result.total_marks,

        "percentage": percentage,

        "grade": grade,

        "status": status,

        "semester": result.semester,

        "exam_type": result.exam_type,

        "remarks": result.remarks,

        "created_at": datetime.utcnow()
    }