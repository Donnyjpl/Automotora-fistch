from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import VendedorViewSet, AutoViewSet, VentaViewSet, CompradorViewSet
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core.serializers import CustomTokenObtainPairView


router = DefaultRouter()
router.register(r'vendedores', VendedorViewSet)
router.register(r'compradores', CompradorViewSet)
router.register(r'autos', AutoViewSet)
router.register(r'ventas', VentaViewSet)


urlpatterns = [
    # Admin de Django
    path("admin/", admin.site.urls),

    # API con router
    path('api/', include(router.urls)),

    # JWT Authentication
    #path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Documentación
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

