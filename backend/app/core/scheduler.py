"""
Lightweight background scheduler for automatic, threshold-based
alerting (Functional Requirement #8 — Notifications and Alerts).

The project has no task-queue / APScheduler dependency declared
anywhere, so this uses only the Python standard library
(threading + time) to avoid introducing a new dependency that may
not be installed in the deployment environment. It runs
`generate_notifications()` on a fixed interval in a daemon thread
for as long as the FastAPI process is alive.
"""

import threading
import time

from app.core.logger import logger
from app.services.notification_service import generate_notifications

# How often to re-check academic thresholds (attendance, CGPA,
# failed results) and generate alerts. Kept short here for demo
# purposes; raise this (e.g. 6 * 60 * 60 for every 6 hours) for a
# real deployment.
CHECK_INTERVAL_SECONDS = 15 * 60

_stop_event = threading.Event()
_thread: threading.Thread | None = None


def _run_loop():
    while not _stop_event.is_set():
        try:
            result = generate_notifications()
            logger.info(f"[scheduler] Notification sweep: {result}")
        except Exception as exc:  # noqa: BLE001 - background job must never crash the app
            logger.info(f"[scheduler] Notification sweep failed: {exc}")

        # Wait, but check the stop flag frequently so shutdown is fast.
        _stop_event.wait(CHECK_INTERVAL_SECONDS)


def start_scheduler():
    global _thread

    if _thread is not None and _thread.is_alive():
        return

    _stop_event.clear()
    _thread = threading.Thread(target=_run_loop, daemon=True, name="notification-scheduler")
    _thread.start()
    logger.info(
        f"[scheduler] Automatic notification generation started "
        f"(every {CHECK_INTERVAL_SECONDS}s)"
    )


def stop_scheduler():
    _stop_event.set()
