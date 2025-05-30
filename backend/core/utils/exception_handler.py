from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler for standardized API responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    # Standardized response structure
    data = {
        'status': 'error',
        'code': getattr(exc, 'default_code', 'error'),
        'message': str(exc),
        'details': None
    }

    if response is not None:
        data['status_code'] = response.status_code
        
        # Handle specific error details (like validation errors)
        if isinstance(response.data, dict):
            data['details'] = response.data
            if 'detail' in response.data:
                data['message'] = response.data['detail']
            else:
                data['message'] = "Validation error"
        elif isinstance(response.data, list):
             data['details'] = response.data
             data['message'] = response.data[0]

        response.data = data
    else:
        # Handle unexpected exceptions (500)
        logger.error(f"Unexpected error: {exc}", exc_info=True)
        data['status_code'] = 500
        data['message'] = "Internal Server Error"
        data['details'] = "An unexpected error occurred. Please contact support."
        return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
