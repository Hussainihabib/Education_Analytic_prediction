from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logger import logger


class LoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request, call_next):

        logger.info(

            f"{request.method} {request.url.path}"

        )

        response = await call_next(request)

        logger.info(

            f"Status : {response.status_code}"

        )

        return response