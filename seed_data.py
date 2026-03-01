import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

import random
from datetime import date, timedelta
from core.models import Vendedor, Auto, Venta, Comprador

print("Limpiando datos anteriores...")
Venta.objects.all().delete()
Auto.objects.all().delete()
Comprador.objects.all().delete()
Vendedor.objects.all().delete()

print("Creando vendedores...")
vendedores_data = [
    {"nombre": "Carlos Rios",     "email": "carlos.rios@auto.pe",   "telefono": "987001001"},
    {"nombre": "Lucia Mendoza",   "email": "lucia.mendoza@auto.pe", "telefono": "987001002"},
    {"nombre": "Jorge Salas",     "email": "jorge.salas@auto.pe",   "telefono": "987001003"},
    {"nombre": "Ana Torres",      "email": "ana.torres@auto.pe",    "telefono": "987001004"},
    {"nombre": "Pedro Vargas",    "email": "pedro.vargas@auto.pe",  "telefono": "987001005"},
]
vendedores = [Vendedor.objects.create(**v) for v in vendedores_data]
print(f"   OK: {len(vendedores)} vendedores creados")

print("Creando compradores...")
compradores_data = [
    {"nombre": "Miguel",     "apellido": "Gutierrez",     "dni_ruc": "45678901", "telefono": "991001001", "direccion": "Av. Larco 123, Miraflores"},
    {"nombre": "Sofia",      "apellido": "Paredes",       "dni_ruc": "45678902", "telefono": "991001002", "direccion": "Jr. Ucayali 456, Lima"},
    {"nombre": "Rafael",     "apellido": "Chavez",        "dni_ruc": "45678903", "telefono": "991001003", "direccion": "Calle Los Pinos 789, San Isidro"},
    {"nombre": "Valeria",    "apellido": "Espinoza",      "dni_ruc": "45678904", "telefono": "991001004", "direccion": "Av. Brasil 321, Pueblo Libre"},
    {"nombre": "Luis",       "apellido": "Castillo",      "dni_ruc": "45678905", "telefono": "991001005", "direccion": "Av. Arequipa 654, Lince"},
    {"nombre": "Carmen",     "apellido": "Flores",        "dni_ruc": "45678906", "telefono": "991001006", "direccion": "Jr. Callao 987, Brena"},
    {"nombre": "Diego",      "apellido": "Morales",       "dni_ruc": "45678907", "telefono": "991001007", "direccion": "Av. Universitaria 111, San Miguel"},
    {"nombre": "Patricia",   "apellido": "Ramos",         "dni_ruc": "45678908", "telefono": "991001008", "direccion": "Calle Colon 222, Jesus Maria"},
    {"nombre": "Andres",     "apellido": "Vega",          "dni_ruc": "45678909", "telefono": "991001009", "direccion": "Av. Colonial 333, Cercado"},
    {"nombre": "Natalia",    "apellido": "Soto",          "dni_ruc": "45678910", "telefono": "991001010", "direccion": "Jr. Tacna 444, Rimac"},
    {"nombre": "Empresa",    "apellido": "Logistics SAC", "dni_ruc": "20501234567", "telefono": "014441001", "direccion": "Av. Venezuela 555, Lima"},
    {"nombre": "Inversiones","apellido": "Pacifico SRL",  "dni_ruc": "20501234568", "telefono": "014441002", "direccion": "Av. Javier Prado 666, San Borja"},
]
compradores = [Comprador.objects.create(**c) for c in compradores_data]
print(f"   OK: {len(compradores)} compradores creados")

print("Creando autos...")
marcas_modelos = [
    ("Toyota",    "Corolla",   2022,  85000, "gasolina"),
    ("Toyota",    "Hilux",     2023, 145000, "diesel"),
    ("Toyota",    "RAV4",      2023, 120000, "hibrido"),
    ("Toyota",    "Yaris",     2021,  65000, "gasolina"),
    ("Kia",       "Soluto",    2022,  72000, "gasolina"),
    ("Kia",       "Sportage",  2023, 110000, "gasolina"),
    ("Kia",       "Picanto",   2021,  55000, "gasolina"),
    ("Kia",       "EV6",       2023, 185000, "electrico"),
    ("Hyundai",   "Tucson",    2022, 105000, "gasolina"),
    ("Hyundai",   "Accent",    2022,  70000, "gasolina"),
    ("Hyundai",   "Ioniq",     2023, 130000, "hibrido"),
    ("Nissan",    "Sentra",    2022,  80000, "gasolina"),
    ("Nissan",    "X-Trail",   2023, 115000, "gasolina"),
    ("Nissan",    "Frontier",  2022, 138000, "diesel"),
    ("Chevrolet", "Onix",      2022,  68000, "gasolina"),
    ("Chevrolet", "Tracker",   2023,  98000, "gasolina"),
    ("Suzuki",    "Vitara",    2022,  88000, "gasolina"),
    ("Suzuki",    "Swift",     2021,  58000, "gasolina"),
    ("Honda",     "Civic",     2022,  92000, "gasolina"),
    ("Honda",     "HR-V",      2023, 102000, "gasolina"),
    ("Mazda",     "CX-5",      2023, 118000, "gasolina"),
    ("Mazda",     "3",         2022,  88000, "gasolina"),
    ("BYD",       "Atto 3",    2023, 145000, "electrico"),
    ("BYD",       "Dolphin",   2023,  98000, "electrico"),
    ("Ford",      "Ranger",    2022, 142000, "diesel"),
]
colores = ["Blanco", "Negro", "Plata", "Rojo", "Azul", "Gris", "Verde"]
autos_creados = []

for i, (marca, modelo, anio, precio, combustible) in enumerate(marcas_modelos):
    cantidad = random.randint(3, 4)
    for j in range(cantidad):
        anio_auto = anio if j == 0 else anio - random.randint(0, 1)
        precio_auto = precio + random.randint(-5000, 5000)
        auto = Auto.objects.create(
            marca=marca,
            modelo=modelo,
            año=anio_auto,
            precio=precio_auto,
            estado="disponible",
            color=random.choice(colores),
            kilometraje=random.randint(0, 50000),
            combustible=combustible,
            vin=f"VIN{i:03d}{j:02d}{random.randint(1000, 9999)}",
        )
        autos_creados.append(auto)

print(f"   OK: {len(autos_creados)} autos creados")

print("Creando ventas...")
metodos = ["efectivo", "credito", "transferencia"]
cantidad_ventas = min(65, len(autos_creados))
autos_para_vender = random.sample(autos_creados, cantidad_ventas)
fecha_inicio = date(2025, 1, 1)
ventas_creadas = 0

for i, auto in enumerate(autos_para_vender):
    vendedor = random.choice(vendedores)
    comprador = random.choice(compradores)
    metodo = random.choice(metodos)
    descuento = random.choice([0, 0, 0, 500, 1000, 2000, 3000])
    total = float(auto.precio) - descuento
    cuotas = 1 if metodo == "efectivo" else random.choice([6, 12, 18, 24, 36])
    comision = round(total * random.uniform(0.02, 0.05), 2)

    dias_offset = int((i / len(autos_para_vender)) * 365)
    fecha = fecha_inicio + timedelta(days=dias_offset)

    Auto.objects.filter(id=auto.id).update(estado="vendido")

    venta = Venta.objects.create(
        auto=auto,
        vendedor=vendedor,
        comprador=comprador,
        total=total,
        metodo_pago=metodo,
        numero_cuotas=cuotas,
        descuento=descuento,
        comision_vendedor=comision,
    )
    Venta.objects.filter(id=venta.id).update(fecha=fecha)
    ventas_creadas += 1

print(f"   OK: {ventas_creadas} ventas creadas")

print("")
print("RESUMEN FINAL:")
print(f"   Vendedores:  {Vendedor.objects.count()}")
print(f"   Compradores: {Comprador.objects.count()}")
print(f"   Autos total: {Auto.objects.count()}")
print(f"   Disponibles: {Auto.objects.filter(estado='disponible').count()}")
print(f"   Vendidos:    {Auto.objects.filter(estado='vendido').count()}")
print(f"   Ventas:      {Venta.objects.count()}")
total_ingresos = sum(float(v.total) for v in Venta.objects.all())
print(f"   Ingresos:    S/ {total_ingresos:,.2f}")
print("")
print("Base de datos poblada correctamente")