from app.ingestion.mongo_to_csv import export_all


def export_all_data():
    export_all()


if __name__ == "__main__":
    export_all_data()