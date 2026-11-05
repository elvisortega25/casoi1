"""
Suite de pruebas automatizadas: Venta Cruzada Fraccionada y Confirmación de Retiros
ACTIVE SPORT S.A.
"""

from app import app
import json

client = app.test_client()

print("--- INICIANDO PRUEBAS DE VENTA FRACCIONADA ---")

# 1. Verificar carga inicial de productos
res = client.get('/api/productos')
assert res.status_code == 200
prods = res.get_json()['data']
as001 = next(p for p in prods if p['codigo'] == 'AS001')
assert as001['stock']['principal'] == 3
assert as001['stock']['secundaria'] == 8
assert as001['stock_total'] == 11
print("[OK] Test 1: Productos cargados con stock independiente (AS001: 3 en Principal, 8 en Secundaria).")

# 2. Escenario 1: Venta Normal (Stock suficiente en el local actual)
# Local: Principal. AS002 tiene 20 en Principal. Pedimos 5.
res = client.post('/api/ventas', json={
    'tipo': 'Venta',
    'codigo': 'AS002',
    'cantidad': 5,
    'cliente': 'Ana Gomez',
    'local_operacion': 'principal'
})
assert res.status_code == 201
data = res.get_json()
assert data['es_fraccionada'] is False
orden = data['data']['orden']
assert orden['Tipo_Venta'] == 'Normal'
assert orden['Estado_Global'] == 'Completado'
assert orden['Detalle_Entrega']['entregadas_momento'] == 5
assert orden['Detalle_Entrega']['pendientes_retiro'] == 0
prod = data['data']['producto']
assert prod['stock']['principal'] == 15 # 20 - 5
assert prod['stock']['secundaria'] == 18
print("[OK] Test 2 (Escenario 1): Venta Normal procesada (5 descontadas de Principal, Estado_Global=Completado).")

# 3. Escenario 2: Venta Fraccionada / Cruzada (Demanda > Stock local, pero <= Stock total)
# Local: Principal. AS001 tiene 3 en Principal y 8 en Secundaria.
# El cliente pide 5 unidades.
# LÓGICA ESPERADA:
# - Descuenta 3 de Principal (queda en 0)
# - Descuenta 2 de Secundaria (queda en 6)
# - Entregadas momento = 3, Pendientes retiro = 2 en Sucursal Secundaria
# - Estado_Global = 'Pendiente de retiro parcial', Tipo_Venta = 'Fraccionada'
res = client.post('/api/ventas', json={
    'tipo': 'Venta',
    'codigo': 'AS001',
    'cantidad': 5,
    'cliente': 'Elvis Ortega',
    'local_operacion': 'principal'
})
assert res.status_code == 201
data = res.get_json()
assert data['es_fraccionada'] is True
orden_fracc = data['data']['orden']
assert orden_fracc['Tipo_Venta'] == 'Fraccionada'
assert orden_fracc['Estado_Global'] == 'Pendiente de retiro parcial'
assert orden_fracc['Detalle_Entrega']['entregadas_momento'] == 3
assert orden_fracc['Detalle_Entrega']['pendientes_retiro'] == 2
assert orden_fracc['Detalle_Entrega']['local_retiro'] == 'Sucursal Secundaria'

prod = data['data']['producto']
assert prod['stock']['principal'] == 0  # 3 - 3
assert prod['stock']['secundaria'] == 6 # 8 - 2
id_orden_fracc = orden_fracc['ID_Orden']

# Verificar mensaje de alerta
assert "3 unidades en este momento" in data['message']
assert "Sucursal Secundaria" in data['message']
assert "2 unidades restantes" in data['message']
print(f"[OK] Test 3 (Escenario 2): Venta Fraccionada aprobada (Orden {id_orden_fracc}: 3 entregadas en Principal, 2 pendientes en Secundaria).")

# 4. Escenario 3: Stock Insuficiente Combinado
# AS003 tiene 4 en Principal y 5 en Secundaria (Total = 9).
# Cliente pide 10.
res = client.post('/api/ventas', json={
    'tipo': 'Venta',
    'codigo': 'AS003',
    'cantidad': 10,
    'cliente': 'Mario Casas',
    'local_operacion': 'principal'
})
assert res.status_code == 400
data = res.get_json()
assert data['success'] is False
assert 'insuficiente' in data['message'].lower()
print("[OK] Test 4 (Escenario 3): Rechazo estricto verificado cuando la cantidad supera la suma de ambos locales.")

# 5. Endpoint de Confirmación de Retiro de Saldo
# Sucursal Secundaria confirma que Elvis Ortega retiró las 2 unidades restantes
res = client.post(f'/api/seguimiento/{id_orden_fracc}/confirmar-retiro')
assert res.status_code == 200
data = res.get_json()
assert data['success'] is True
assert data['data']['Estado_Global'] == 'Completado'
assert data['data']['Detalle_Entrega']['pendientes_retiro'] == 0
print(f"[OK] Test 5: Retiro de saldo confirmado para orden {id_orden_fracc} (Estado_Global actualizado a 'Completado').")

# 6. Reiniciar estado inicial
res = client.post('/api/reiniciar')
assert res.status_code == 200
print("[OK] Test 6: Reinicio de base de datos a estado inicial.")

print("\n*** ¡TODAS LAS PRUEBAS DE VENTA FRACCIONADA PASARON EXITOSAMENTE (6/6)! ***")

