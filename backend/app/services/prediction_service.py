from app.ml.predictor import predict_student


def predict(data):

    prediction = predict_student(data)

    return {
        "prediction": prediction
    }