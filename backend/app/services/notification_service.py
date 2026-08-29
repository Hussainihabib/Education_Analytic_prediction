from datetime import datetime, timedelta
import uuid

from app.models.notification_model import notification_collection
from app.database.connection import db

student_collection = db["students"]
result_collection = db["results"]

# How long a generated alert "cools down" before the same
# student/title combination can be re-generated. Prevents the
# scheduler (or repeated manual /generate calls) from flooding a
# user with duplicate alerts for a condition that hasn't changed.
DEDUP_WINDOW = timedelta(hours=24)


def _already_alerted(receiver_email: str, title: str) -> bool:
    return notification_collection.find_one({
        "receiver_email": receiver_email,
        "title": title,
        "created_at": {"$gte": datetime.now() - DEDUP_WINDOW},
    }) is not None


# ==========================================
# Create Notification
# ==========================================

def create_notification(data):

    notification = {

        "notification_id": str(uuid.uuid4())[:8].upper(),

        "title": data.title,

        "message": data.message,

        "receiver_role": data.receiver_role,

        "receiver_email": data.receiver_email,

        "is_read": False,

        "created_at": datetime.now()

    }

    notification_collection.insert_one(notification)

    return {

        "message": "Notification Created Successfully"

    }


# ==========================================
# Get All Notifications
# ==========================================

def get_all_notifications():

    notifications = list(

        notification_collection.find(

            {},

            {

                "_id": 0

            }

        ).sort(

            "created_at",

            -1

        )

    )

    return notifications


# ==========================================
# Get User Notifications
# ==========================================
def get_my_notifications(

    receiver_role,

    receiver_email

):

    notifications = list(

        notification_collection.find(

            {

                "receiver_role": receiver_role,

                "receiver_email": receiver_email

            },

            {

                "_id": 0

            }

        ).sort(

            "created_at",

            -1

        )

    )

    return notifications
# ==========================================
# Mark Notification Read
# ==========================================

def mark_notification_read(
    notification_id,
    receiver_role=None,
    receiver_email=None
):
    query = {"notification_id": notification_id}
    if receiver_role is not None:
        query["receiver_role"] = receiver_role
    if receiver_email is not None:
        query["receiver_email"] = receiver_email

    result = notification_collection.update_one(
        query,
        {"$set": {"is_read": True}}
    )

    if result.matched_count == 0:
        return {"message": "Notification not found or access denied"}

    return {"message": "Notification Updated"}


# ==========================================
# Delete Notification
# ==========================================

def delete_notification(

    notification_id

):

    notification_collection.delete_one(

        {

            "notification_id": notification_id

        }

    )

    return {

        "message": "Notification Deleted"

    }
# ==========================================
# Auto Generate Notifications
# ==========================================

def generate_notifications():

    notifications = []

    students = list(student_collection.find({}))

    student_map = {
        student["student_id"]: student
        for student in students
    }

    # ======================================
    # Student Notifications
    # ======================================

    for student in students:

        if student.get("attendance", 0) < 75:

            if not _already_alerted(student["email"], "Low Attendance"):

                notifications.append({

                    "notification_id": str(uuid.uuid4())[:8].upper(),

                    "title": "Low Attendance",

                    "message": "Your attendance is below 75%.",

                    "receiver_role": "Student",

                    "receiver_email": student["email"],

                    "is_read": False,

                    "created_at": datetime.now()

                })

        if student.get("cgpa", 0) < 2.5:

            if not _already_alerted(student["email"], "Low CGPA"):

                notifications.append({

                    "notification_id": str(uuid.uuid4())[:8].upper(),

                    "title": "Low CGPA",

                    "message": "Your CGPA is below 2.5.",

                    "receiver_role": "Student",

                    "receiver_email": student["email"],

                    "is_read": False,

                    "created_at": datetime.now()

                })

    # ======================================
    # Result Notifications
    # ======================================

    results = result_collection.find({})

    for result in results:

        if result.get("status") == "Fail":

            student = student_map.get(result["student_id"])

            if student:

                if not _already_alerted(student["email"], "Course Failed"):

                    notifications.append({

                        "notification_id": str(uuid.uuid4())[:8].upper(),

                        "title": "Course Failed",

                        "message": "You have failed one of your courses.",

                        "receiver_role": "Student",

                        "receiver_email": student["email"],

                        "is_read": False,

                        "created_at": datetime.now()

                    })

    # ======================================
    # Insert All Notifications
    # ======================================

    if notifications:

        notification_collection.insert_many(notifications)

    return {

        "message": "Notifications Generated Successfully",

        "total_notifications": len(notifications)

    }