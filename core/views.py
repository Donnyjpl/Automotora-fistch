from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth
from .models import Vendedor, Auto, Venta, Comprador
from .serializers import VendedorSerializer, AutoSerializer, VentaSerializer, CompradorSerializer

from rest_framework.permissions import BasePermission
from rest_framework.views import APIView
from rest_framework.response import Response
from .permissions import IsAdminOrReadCreate

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.is_superuser or request.user.groups.filter(name='Admin').exists())
        )

class DashboardView(APIView):
    permission_classes = [IsAdmin]  # Solo admin puede ver todo el dashboard
    def get(self, request):
        return Response({"datos": "info del dashboard"})


class VendedorViewSet(viewsets.ModelViewSet):
    queryset = Vendedor.objects.all()
    serializer_class = VendedorSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'email']
    ordering_fields = ['nombre']

    @action(detail=True, methods=['get'], url_path='resumen')
    def resumen(self, request, pk=None):
        """Estadísticas de un vendedor específico"""
        vendedor = self.get_object()
        ventas = Venta.objects.filter(vendedor=vendedor)
        data = {
            "vendedor": vendedor.nombre,
            "total_ventas": ventas.count(),
            "ingresos_totales": ventas.aggregate(total=Sum('total'))['total'] or 0,
            "comision_total": ventas.aggregate(comision=Sum('comision_vendedor'))['comision'] or 0,
            "descuento_total": ventas.aggregate(descuento=Sum('descuento'))['descuento'] or 0,
        }
        return Response(data)


class CompradorViewSet(viewsets.ModelViewSet):
    queryset = Comprador.objects.all()
    serializer_class = CompradorSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'apellido', 'dni_ruc']
    ordering_fields = ['apellido', 'nombre']

    @action(detail=True, methods=['get'], url_path='historial')
    def historial(self, request, pk=None):
        """Historial de compras de un comprador"""
        comprador = self.get_object()
        ventas = Venta.objects.filter(comprador=comprador).select_related('auto', 'vendedor')
        serializer = VentaSerializer(ventas, many=True)
        return Response({
            "comprador": f"{comprador.nombre} {comprador.apellido}",
            "total_compras": ventas.count(),
            "historial": serializer.data,
        })


class AutoViewSet(viewsets.ModelViewSet):
    queryset = Auto.objects.all()
    serializer_class = AutoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['marca', 'modelo', 'color', 'vin']
    ordering_fields = ['precio', 'año', 'marca']

    def get_queryset(self):
        queryset = Auto.objects.all()
        estado = self.request.query_params.get('estado')
        combustible = self.request.query_params.get('combustible')
        marca = self.request.query_params.get('marca')

        if estado:
            queryset = queryset.filter(estado=estado)
        if combustible:
            queryset = queryset.filter(combustible=combustible)
        if marca:
            queryset = queryset.filter(marca__icontains=marca)

        return queryset

    @action(detail=False, methods=['get'], url_path='estadisticas')
    def estadisticas(self, request):
        """Resumen del inventario de autos"""
        data = {
            "total": Auto.objects.count(),
            "disponibles": Auto.objects.filter(estado='disponible').count(),
            "reservados": Auto.objects.filter(estado='reservado').count(),
            "vendidos": Auto.objects.filter(estado='vendido').count(),
            "precio_promedio": Auto.objects.aggregate(avg=Avg('precio'))['avg'] or 0,
            "por_combustible": list(
                Auto.objects.values('combustible').annotate(total=Count('id'))
            ),
            "por_marca": list(
                Auto.objects.values('marca').annotate(total=Count('id')).order_by('-total')
            ),
        }
        return Response(data)


class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all().select_related('auto', 'vendedor', 'comprador')
    serializer_class = VentaSerializer
    permission_classes = [IsAdminOrReadCreate]  # 👈 aquí
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['vendedor__nombre', 'comprador__nombre', 'comprador__apellido']
    ordering_fields = ['fecha', 'total']

    def get_queryset(self):
        queryset = Venta.objects.all().select_related('auto', 'vendedor', 'comprador')
        vendedor = self.request.query_params.get('vendedor')
        metodo_pago = self.request.query_params.get('metodo_pago')
        fecha_inicio = self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fecha_fin')

        if vendedor:
            queryset = queryset.filter(vendedor__id=vendedor)
        if metodo_pago:
            queryset = queryset.filter(metodo_pago=metodo_pago)
        if fecha_inicio:
            queryset = queryset.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha__lte=fecha_fin)

        return queryset

    @action(detail=False, methods=['get'], url_path='estadisticas')
    def estadisticas(self, request):
        """Estadísticas generales para el dashboard"""
        ventas = Venta.objects.all()

        # Ventas por mes
        por_mes = list(
            ventas.annotate(mes=TruncMonth('fecha'))
            .values('mes')
            .annotate(total_ventas=Count('id'), ingresos=Sum('total'))
            .order_by('mes')
        )

        # Ventas por vendedor
        por_vendedor = list(
            ventas.values('vendedor__id', 'vendedor__nombre')
            .annotate(total_ventas=Count('id'), ingresos=Sum('total'), comision=Sum('comision_vendedor'))
            .order_by('-total_ventas')
        )

        # Ventas por método de pago
        por_metodo_pago = list(
            ventas.values('metodo_pago').annotate(total=Count('id'))
        )

        data = {
            "total_ventas": ventas.count(),
            "ingresos_totales": ventas.aggregate(total=Sum('total'))['total'] or 0,
            "descuentos_totales": ventas.aggregate(desc=Sum('descuento'))['desc'] or 0,
            "comisiones_totales": ventas.aggregate(com=Sum('comision_vendedor'))['com'] or 0,
            "por_mes": por_mes,
            "por_vendedor": por_vendedor,
            "por_metodo_pago": por_metodo_pago,
        }
        return Response(data)