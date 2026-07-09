import json
import re
from .models import AuditLog

class AuditLoggerMiddleware:
  def __init__(self, get_response):
    self.get_response = get_response

  def __call__(self, request):
    response = self.get_response(request)

    # Only log state modifications or logins
    if request.method == 'GET':
      return response

    try:
      # Capture user if authenticated
      user = request.user if request.user and request.user.is_authenticated else None
      action = f"{request.method} {request.path}"
      
      details = ""
      # Access request body for non-GET requests (if content is text)
      if request.body:
        try:
          body_str = request.body.decode('utf-8')
          # Redact passwords
          body_sanitized = re.sub(r'"password"\s*:\s*"[^"]*"', '"password":"[REDACTED]"', body_str)
          details = f"Request Body: {body_sanitized}"
        except Exception:
          details = "Request Body: [Unparseable Content]"

      # Special handling for successful login mapping
      if request.path == '/api/auth/login' and response.status_code == 200:
        action = "User Login"
        try:
          body_data = json.loads(request.body)
          email = body_data.get('usernameOrEmail', 'Unknown')
          details = f"User {email} logged in successfully."
          
          # Associate the newly authenticated user
          from django.contrib.auth import get_user_model
          User = get_user_model()
          user = User.objects.filter(email__iexact=email).first()
          if not user:
            user = User.objects.filter(name=email).first()
        except Exception:
          pass

      # Get IP
      x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
      if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
      else:
        ip = request.META.get('REMOTE_ADDR')

      # Create Log
      AuditLog.objects.create(
        user=user,
        action=action,
        details=details,
        method=request.method,
        url=request.path,
        ip=ip
      )
    except Exception as e:
      print("Error in AuditLoggerMiddleware:", e)

    return response
