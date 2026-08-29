# EduPredict MongoDB ML integration

This ML folder now supports training from the **current MongoDB records** instead of depending on the demo CSV files.

## Models

- `performance_model.joblib`: student Pass/Fail prediction from current students + results.
- `dropout_model.joblib`: Low/Medium/High risk prediction. Uses an observed dropout field if one exists; otherwise a transparent risk label is derived from current attendance, CGPA, marks and failed results. This fallback is a risk model, not a true historical dropout-outcome model.
- `course_demand_model.joblib`: High/Medium/Low course demand. Uses `course_demand` if present; otherwise derives the label from current enrollment.
- `anomaly_model.joblib`: Isolation Forest trained on current student performance data.

## API integration

Use `prediction_api.py` as the replacement/addition for the existing prediction router and mount it with:

```python
app.include_router(router, prefix="/prediction", tags=["Prediction"])
```

If your existing `main.py` already imports a router from `app.api.prediction`, copy the router from `prediction_api.py` into that file rather than registering a second `/prediction` router.

### Endpoints

- `GET /prediction/status` — Admin/Teacher/Student/Analyst
- `POST /prediction/` — Admin/Teacher/Student/Analyst
- `POST /prediction/dropout` — Admin/Teacher/Student/Analyst
- `POST /prediction/course-demand` — Admin/Teacher/Student/Analyst
- `POST /prediction/retrain` — **Admin only**

Retraining reads MongoDB collections `students`, `results`, and `courses`, then writes model artifacts into `app/ml/models`.

## First training

From the backend directory with the venv active:

```bash
python -m app.ml.retrain_models
```

The existing `retrain_models.py` should be replaced by the new version supplied with this package.
