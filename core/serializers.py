from rest_framework import serializers
from .models import Vendedor, Auto, Venta, Comprador
from django.db import transaction
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if user.is_superuser or user.groups.filter(name='Admin').exists():
            data['role'] = 'Admin'   # 👈 con A mayúscula para que coincida con React
        else:
            data['role'] = 'user'
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class VendedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendedor
        fields = '__all__'


class CompradorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comprador
        fields = '__all__'

    def validate_dni_ruc(self, value):
        # Solo números y longitud válida para DNI (8) o RUC (11)
        if not value.isdigit():
            raise serializers.ValidationError("El DNI/RUC solo debe contener números.")
        if len(value) not in [8, 11]:
            raise serializers.ValidationError("El DNI debe tener 8 dígitos y el RUC 11 dígitos.")
        return value

    def validate_telefono(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("El teléfono solo debe contener números.")
        if len(value) < 7 or len(value) > 15:
            raise serializers.ValidationError("El teléfono debe tener entre 7 y 15 dígitos.")
        return value


class AutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auto
        fields = '__all__'

    def validate_año(self, value):
        from datetime import date
        año_actual = date.today().year
        if value < 1900 or value > año_actual + 1:
            raise serializers.ValidationError(
                f"El año debe estar entre 1900 y {año_actual + 1}."
            )
        return value

    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0.")
        return value

    def validate_kilometraje(self, value):
        if value < 0:
            raise serializers.ValidationError("El kilometraje no puede ser negativo.")
        return value

    def validate_vin(self, value):
        if value and len(value) < 5:
            raise serializers.ValidationError("El VIN/Placa debe tener al menos 5 caracteres.")
        return value


class VentaSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para mostrar info relacionada
    auto_detalle = AutoSerializer(source='auto', read_only=True)
    vendedor_nombre = serializers.CharField(source='vendedor.nombre', read_only=True)
    comprador_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Venta
        fields = '__all__'

    def get_comprador_nombre(self, obj):
        if obj.comprador:
            return f"{obj.comprador.nombre} {obj.comprador.apellido}"
        return None

    def validate_total(self, value):
        if value <= 0:
            raise serializers.ValidationError("El total de la venta debe ser mayor a 0.")
        return value

    def validate_descuento(self, value):
        if value < 0:
            raise serializers.ValidationError("El descuento no puede ser negativo.")
        return value

    def validate_comision_vendedor(self, value):
        if value < 0:
            raise serializers.ValidationError("La comisión no puede ser negativa.")
        return value

    def validate_numero_cuotas(self, value):
        if value < 1:
            raise serializers.ValidationError("El número de cuotas debe ser al menos 1.")
        return value

    def validate(self, data):
        auto = data.get('auto')
        metodo_pago = data.get('metodo_pago')
        numero_cuotas = data.get('numero_cuotas', 1)
        descuento = data.get('descuento', 0)
        total = data.get('total', 0)

        # Validar que el auto esté disponible
        if auto and auto.estado != Auto.Estado.DISPONIBLE:
            raise serializers.ValidationError(
                {"auto": f"Este auto no está disponible. Estado actual: {auto.estado}."}
            )

        # Si el pago es en efectivo, no debería tener cuotas
        if metodo_pago == Venta.MetodoPago.EFECTIVO and numero_cuotas > 1:
            raise serializers.ValidationError(
                {"numero_cuotas": "El pago en efectivo no puede tener más de 1 cuota."}
            )

        # El descuento no puede ser mayor al total
        if descuento and total and descuento >= total:
            raise serializers.ValidationError(
                {"descuento": "El descuento no puede ser igual o mayor al total de la venta."}
            )

        return data

    def create(self, validated_data):
        with transaction.atomic():
            # Bloquear el auto para evitar condiciones de carrera
            auto = Auto.objects.select_for_update().get(id=validated_data['auto'].id)

            if auto.estado != Auto.Estado.DISPONIBLE:
                raise serializers.ValidationError(
                    {"auto": f"Este auto ya no está disponible. Estado actual: {auto.estado}."}
                )

            # El estado del auto lo maneja el método save() del modelo
            venta = Venta(**validated_data)
            venta.save()
            return venta

    def update(self, instance, validated_data):
        # No permitir cambiar el auto una vez creada la venta
        if 'auto' in validated_data and validated_data['auto'] != instance.auto:
            raise serializers.ValidationError(
                {"auto": "No se puede cambiar el auto de una venta ya registrada."}
            )
        return super().update(instance, validated_data)