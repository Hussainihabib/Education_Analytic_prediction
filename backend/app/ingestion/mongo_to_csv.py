import os
import pandas as pd

from app.database.connection import get_database

db = get_database()


DATASET_FOLDER = "app/dataset"

os.makedirs(DATASET_FOLDER, exist_ok=True)


def export_collection(collection_name, file_name):

    data = list(
        db[collection_name].find({}, {"_id": 0})
    )

    if len(data) == 0:
        print(f"{collection_name} collection is empty.")
        return

    df = pd.DataFrame(data)

    path = os.path.join(
        DATASET_FOLDER,
        file_name
    )

    df.to_csv(
        path,
        index=False
    )

    print(f"{collection_name} exported successfully.")


def export_all():

    export_collection(
        "students",
        "students.csv"
    )

    export_collection(
        "teachers",
        "teachers.csv"
    )

    export_collection(
        "courses",
        "courses.csv"
    )

    export_collection(
        "attendance",
        "attendance.csv"
    )

    export_collection(
        "results",
        "results.csv"
    )


if __name__ == "__main__":

    export_all()