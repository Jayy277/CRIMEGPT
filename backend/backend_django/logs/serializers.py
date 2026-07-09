from rest_framework import serializers
from .models import AuditLog
from authentication.serializers import UserSerializer

class AuditLogSerializer(serializers.ModelSerializer):
  user = UserSerializer(read_only=True)

  class Meta:
    model = AuditLog
    fields = ('id', 'user', 'action', 'details', 'method', 'url', 'ip', 'timestamp')
