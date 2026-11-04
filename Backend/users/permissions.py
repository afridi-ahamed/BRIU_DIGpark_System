from rest_framework.permissions import BasePermission

class IsSuperAdmin(BasePermission):
    """Only Superadmin can access this view"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role == 'superadmin' or request.user.is_superuser)

class IsSuperAdminOrReadOnly(BasePermission):
    """Superadmin can do anything, others can only read"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role == 'superadmin' or request.user.is_superuser:
            return True
        return request.method in ['GET', 'HEAD', 'OPTIONS'] 

class IsStaffOrSuperAdmin(BasePermission):
    """Only Staff and Superadmin can access this view"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role in ['staff', 'superadmin'] or request.user.is_superuser)
