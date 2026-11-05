"""
Script de pruebas automatizadas para verificar el sistema backend de ACTIVE SPORT S.A.
"""

from app import app
import json

client = app.test_client()

# 1. Probar GET /api/productos
res = client.get('/api/productos')
data = res.get_json()
assert res.status_code == 200, f"Error {res.status_code}"
assert data['total'] == 6, f"Esperados 6 productos, recibidos {data['total']}"
print(f"[OK] GET /api/productos: {data['total']} productos cargados correctamente")

# 2. Probar GET /api/reportes
res = client.get('/api/reportes')
rep = res.get_json()['data']
assert res.status_code == 200
assert 'top_ventas' in rep and len(rep['top_ventas']) == 3
assert 'total_unidades_stock' in rep
print(f"[OK] GET /api/reportes: Total stock={rep['total_unidades_stock']}, Top ventas={len(rep['top_ventas'])}, Bajo stock={rep['cantidad_bajo_stock']}")

# 3. Probar regla estricta: Venta que supera stock (AS003 tiene stock_actual = 9)
res = client.post('/api/movimientos', json={
    'codigo': 'AS003',
    'tipo': 'Venta',
    'cantidad': 15,
    'observacion': 'Intento de venta excesiva'
})
assert res.status_code == 400, f"Se esperaba 400, recibido {res.status_code}"
body = res.get_json()
assert body['success'] is False
assert 'insuficiente' in body['message'].lower()
print("[OK] Regla de validación estricta cumplida: Venta rechazada al superar stock disponible")

# 4. Probar venta válida (AS002: stock 38 -> 35, ventas 29 -> 32)
res = client.post('/api/movimientos', json={
    'codigo': 'AS002',
    'tipo': 'Venta',
    'cantidad': 3,
    'observacion': 'Venta de prueba válida'
})
assert res.status_code == 201, f"Se esperaba 201, recibido {res.status_code}"
prod = res.get_json()['data']['producto']
assert prod['stock_actual'] == 35, f"Stock esperado 35, obtenido {prod['stock_actual']}"
assert prod['ventas_mes'] == 32, f"Ventas esperadas 32, obtenidas {prod['ventas_mes']}"
print("[OK] Venta válida procesada: Stock disminuyó a 35 y Ventas aumentaron a 32")

# 5. Probar entrada válida (AS001: stock 14 -> 24)
res = client.post('/api/movimientos', json={
    'codigo': 'AS001',
    'tipo': 'Entrada',
    'cantidad': 10,
    'observacion': 'Compra lote reposición'
})
assert res.status_code == 201
prod = res.get_json()['data']['producto']
assert prod['stock_actual'] == 24
print("[OK] Entrada de mercadería procesada: Stock incrementó a 24")

# 6. Probar reiniciar datos
res = client.post('/api/reiniciar')
assert res.status_code == 200
res = client.get('/api/productos/AS001')
assert res.get_json()['data']['stock_actual'] == 14
print("[OK] Reinicio de datos completado exitosamente a valores originales")

# 7. Probar render de index
res = client.get('/')
assert res.status_code == 200
assert b'ACTIVE SPORT S.A.' in res.data
print("[OK] GET / sirve index.html correctamente con código HTTP 200")

print("\n*** TODOS LOS TESTS DE INTEGRACIÓN PASARON EXITOSAMENTE (7/7) ***")
