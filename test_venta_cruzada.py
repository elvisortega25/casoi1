"""
Pruebas automatizadas de Venta Normal, Venta Cruzada y Confirmación de Retiro
para ACTIVE SPORT S.A.
"""

from app import app
import json

client = app.test_client()

print("--- INICIANDO SUITE DE PRUEBAS DE VENTA CRUZADA ---")

# 1. Verificar carga de productos con stock por local
res = client.get('/api/productos')
assert res.status_code == 200
prods = res.get_json()['data']
assert len(prods) == 6
as001 = next(p for p in prods if p['codigo'] == 'AS001')
assert as001['stock']['principal'] == 6
assert as001['stock']['secundaria'] == 8
assert as001['stock_total'] == 14
print("[OK] Test 1: Catálogo con desglose de stock por sucursal verificado.")

# 2. Verificar seguimiento_ventas.json inicial
res = client.get('/api/seguimiento')
assert res.status_code == 200
seg = res.get_json()
assert seg['total'] >= 3
print(f"[OK] Test 2: Seguimiento de ventas cargado ({seg['total']} órdenes registradas).")

# 3. Caso VENTA NORMAL (Local actual tiene stock suficiente)
# Operando desde 'principal'. AS002 tiene 20 en principal. Vender 5.
res = client.post('/api/ventas', json={
    'tipo': 'Venta',
    'codigo': 'AS002',
    'cantidad': 5,
    'cliente': 'Ana Gomez',
    'local_operacion': 'principal',
    'observacion': 'Venta mostrador normal'
})
assert res.status_code == 201, f"Error {res.status_code}: {res.get_json()}"
body = res.get_json()
assert body['es_cruzada'] is False
orden = body['data']['orden']
assert orden['Tipo_Venta'] == 'Normal'
assert orden['Estado'] == 'Entregado'
assert orden['Local_Venta'] == 'Sucursal Principal'
assert orden['Local_Retiro'] == 'Sucursal Principal'
# Verificar descuento de stock en AS002: principal pasa de 20 a 15, secundaria sigue en 18
prod_act = body['data']['producto']
assert prod_act['stock']['principal'] == 15
assert prod_act['stock']['secundaria'] == 18
print("[OK] Test 3: Venta Normal procesada (se descontó de Sucursal Principal, Estado=Entregado).")

# 4. Caso VENTA CRUZADA (Local actual no tiene, pero el otro sí)
# Operando desde 'principal'. AS001 tiene 6 en principal y 8 en secundaria.
# Solicitamos 7 unidades.
res = client.post('/api/ventas', json={
    'tipo': 'Venta',
    'codigo': 'AS001',
    'cantidad': 7,
    'cliente': 'Elvis Ortega',
    'local_operacion': 'principal',
    'observacion': 'Venta Cruzada especial'
})
assert res.status_code == 201, f"Error {res.status_code}: {res.get_json()}"
body = res.get_json()
assert body['es_cruzada'] is True
orden_cruzada = body['data']['orden']
assert orden_cruzada['Tipo_Venta'] == 'Cruzada'
assert orden_cruzada['Estado'] == 'Pendiente de retiro'
assert orden_cruzada['Local_Venta'] == 'Sucursal Principal'
assert orden_cruzada['Local_Retiro'] == 'Sucursal Secundaria'
id_orden_cruzada = orden_cruzada['ID_Orden']
# Verificar descuento en AS001: principal sigue en 6, secundaria pasa de 8 a 1 (8 - 7)
prod_act = body['data']['producto']
assert prod_act['stock']['principal'] == 6
assert prod_act['stock']['secundaria'] == 1
print(f"[OK] Test 4: Venta Cruzada procesada con éxito (Orden: {id_orden_cruzada}, se descontó de Sucursal Secundaria, Estado=Pendiente de retiro).")

# 5. Caso STOCK INSUFICIENTE EN AMBOS LOCALES (Rechazo estricto)
# AS003 tiene 4 en principal y 5 en secundaria. Solicitamos 6.
res = client.post('/api/ventas', json={
    'tipo': 'Venta',
    'codigo': 'AS003',
    'cantidad': 6,
    'cliente': 'Mario Casas',
    'local_operacion': 'principal'
})
assert res.status_code == 400
body = res.get_json()
assert body['success'] is False
assert 'insuficiente' in body['message'].lower()
print("[OK] Test 5: Rechazo estricto verificado cuando ninguna sucursal puede cubrir la venta.")

# 6. Endpoint de Confirmación de Retiro del Cliente
# Cambiar estado de id_orden_cruzada a 'Entregado'
res = client.post(f'/api/seguimiento/{id_orden_cruzada}/entregar')
assert res.status_code == 200, f"Error: {res.get_json()}"
body = res.get_json()
assert body['success'] is True
assert body['data']['Estado'] == 'Entregado'
print(f"[OK] Test 6: Retiro confirmado para orden {id_orden_cruzada} (Estado actualizado a 'Entregado').")

# 7. Reiniciar datos a valores iniciales
res = client.post('/api/reiniciar')
assert res.status_code == 200
print("[OK] Test 7: Base de datos reiniciada a los valores iniciales.")

print("\n*** ¡TODAS LAS PRUEBAS DE VENTA CRUZADA PASARON CON ÉXITO (7/7)! ***")

