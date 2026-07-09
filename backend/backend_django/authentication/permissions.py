from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
  def has_permission(self, request, view):
    return request.user and request.user.is_authenticated and request.user.role == 'admin'

class IsOfficerUser(permissions.BasePermission):
  def has_permission(self, request, view):
    return request.user and request.user.is_authenticated and request.user.role == 'officer'

class IsAnalystUser(permissions.BasePermission):
  def has_permission(self, request, view):
    return request.user and request.user.is_authenticated and request.user.role == 'analyst'

class IsOfficerOrAdminUser(permissions.BasePermission):
  def has_permission(self, request, view):
    return request.user and request.user.is_authenticated and request.user.role in ['officer', 'admin']

class IsAnalystOrAdminUser(permissions.BasePermission):
  def has_permission(self, request, view):
    return request.user and request.user.is_authenticated and request.user.role in ['analyst', 'admin']

class IsStaffUser(permissions.BasePermission):
  def has_permission(self, request, view):
    return request.user and request.user.is_authenticated and request.user.role in ['officer', 'analyst', 'admin']
