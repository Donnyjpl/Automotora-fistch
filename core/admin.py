from django.contrib import admin
from .models import Vendedor, Auto, Venta, Comprador

admin.site.register(Vendedor)
admin.site.register(Auto)
admin.site.register(Venta)
admin.site.register(Comprador)

# Register your models here.
