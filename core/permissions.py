# core/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminOrReadCreate(BasePermission):
    """
    - Cualquier usuario autenticado puede leer (GET) y crear (POST)
    - Solo admin puede editar (PUT, PATCH) y eliminar (DELETE)
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # GET, POST → cualquier usuario autenticado
        if request.method in SAFE_METHODS or request.method == 'POST':
            return True
        
        # PUT, PATCH, DELETE → solo admin
        return (
            request.user.is_superuser or 
            request.user.groups.filter(name='Admin').exists()
        )