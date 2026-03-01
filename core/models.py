from django.db import models


class Vendedor(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20)

    def __str__(self):
        return self.nombre


class Comprador(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    dni_ruc = models.CharField(max_length=20, unique=True, verbose_name="DNI / RUC")
    telefono = models.CharField(max_length=20)
    direccion = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

    class Meta:
        verbose_name = "Comprador"
        verbose_name_plural = "Compradores"


class Auto(models.Model):

    class Estado(models.TextChoices):
        DISPONIBLE = "disponible", "Disponible"
        RESERVADO = "reservado", "Reservado"
        VENDIDO = "vendido", "Vendido"

    class Combustible(models.TextChoices):
        GASOLINA = "gasolina", "Gasolina"
        DIESEL = "diesel", "Diésel"
        ELECTRICO = "electrico", "Eléctrico"
        HIBRIDO = "hibrido", "Híbrido"
        GAS = "gas", "Gas"

    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    año = models.IntegerField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.DISPONIBLE
    )
    # Nuevos campos
    color = models.CharField(max_length=50, blank=True, null=True)
    kilometraje = models.PositiveIntegerField(default=0, help_text="Kilometraje en km")
    combustible = models.CharField(
        max_length=20,
        choices=Combustible.choices,
        default=Combustible.GASOLINA,
        verbose_name="Tipo de combustible"
    )
    vin = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        verbose_name="Número VIN / Placa"
    )

    def __str__(self):
        return f"{self.marca} {self.modelo} ({self.año})"

    class Meta:
        verbose_name = "Auto"
        verbose_name_plural = "Autos"


class Venta(models.Model):

    class MetodoPago(models.TextChoices):
        EFECTIVO = "efectivo", "Efectivo"
        CREDITO = "credito", "Crédito"
        TRANSFERENCIA = "transferencia", "Transferencia"

    auto = models.OneToOneField(Auto, on_delete=models.PROTECT)
    vendedor = models.ForeignKey(Vendedor, on_delete=models.PROTECT)
    comprador = models.ForeignKey(
        Comprador,
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    fecha = models.DateField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    # Nuevos campos
    metodo_pago = models.CharField(
        max_length=20,
        choices=MetodoPago.choices,
        default=MetodoPago.EFECTIVO,
        verbose_name="Método de pago"
    )
    numero_cuotas = models.PositiveIntegerField(
        default=1,
        help_text="1 = pago único, mayor a 1 = financiado"
    )
    descuento = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Descuento aplicado en soles"
    )
    comision_vendedor = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Comisión generada para el vendedor"
    )

    def save(self, *args, **kwargs):
        # Cuando se crea la venta, el auto pasa a vendido
        self.auto.estado = Auto.Estado.VENDIDO
        self.auto.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Venta #{self.id} - {self.auto}"

    class Meta:
        verbose_name = "Venta"
        verbose_name_plural = "Ventas"