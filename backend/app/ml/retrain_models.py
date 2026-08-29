from app.database.connection import db
from app.ml.mongo_training import retrain_all


def retrain_all_models():
    """Train all EduPredict ML models from the current MongoDB database."""
    try:
        metadata = retrain_all(db)
        print("\nAll MongoDB-backed ML models trained successfully.\n")
        for model in metadata.get("models", []):
            print(model.get("model"), model.get("accuracy", ""), model.get("records", ""))
        return True
    except Exception as exc:
        print(f"\nML retraining failed: {exc}\n")
        return False


if __name__ == "__main__":
    raise SystemExit(0 if retrain_all_models() else 1)
