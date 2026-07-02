from django.db import models

class AuditLog(models.Model):
  user = models.ForeignKey('authentication.CustomUser', on_delete=models.SET_NULL, null=True, related_name='audit_logs')
  action = models.CharField(max_length=255)
  details = models.TextField()
  method = models.CharField(max_length=10)
  url = models.CharField(max_length=500)
  ip = models.CharField(max_length=50, null=True, blank=True)
  timestamp = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    user_str = self.user.name if self.user else "Anonymous"
    return f"{user_str} - {self.action} at {self.timestamp}"
