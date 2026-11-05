"""
Suite de pruebas: Autenticación (Admin/Gerente), Auditoría de Ventas por Sucursal,
Proyecciones Gerenciales y Diagrama de Arquitectura.
ACTIVE SPORT S.A.
"""

from app import app
import json

client = app.test_client()

print("--- INICIANDO PRUEBAS DE LOGIN, AUDITORÍA Y ARQUITECTURA ---")

# 1. Login Administrador
res = client.post('/api/login', json={'usuario': 'admin', 'password': 'admin123'})
assert res.status_code == 200, f"Error {res.status_code}: {res.data}"
data = res.get_json()
assert data['success'] is True
assert data['user']['rol'] == 'administrador'
assert data['user']['usuario'] == 'admin'
print("[OK] Test 1: Login exitoso para Administrador (rol: administrador).")

# 2. Login Gerente
res = client.post('/api/login', json={'usuario': 'gerente', 'password': 'gerente123'})
assert res.status_code == 200
data = res.get_json()
assert data['success'] is True
assert data['user']['rol'] == 'gerente'
assert data['user']['usuario'] == 'gerente'
print("[OK] Test 2: Login exitoso para Gerente (rol: gerente).")

# 3. Login Fallido (credenciales erróneas)
res = client.post('/api/login', json={'usuario': 'admin', 'password': 'password_incorrecto'})
assert res.status_code == 401
data = res.get_json()
assert data['success'] is False
print("[OK] Test 3: Rechazo correcto con HTTP 401 ante credenciales inválidas.")

# 4. Historial de Movimientos (GET /api/movimientos - Solución a bug de pantalla en carga)
res = client.get('/api/movimientos')
assert res.status_code == 200
data = res.get_json()
assert data['success'] is True
assert 'data' in data
assert len(data['data']) > 0
print(f"[OK] Test 4: GET /api/movimientos funcional con {len(data['data'])} movimientos históricos.")

# 5. Auditoría de Ventas por Sucursal (GET /api/auditoria/ventas)
res = client.get('/api/auditoria/ventas')
assert res.status_code == 200
data = res.get_json()
assert data['success'] is True
resumen = data['resumen']
assert 'principal' in resumen
assert 'secundaria' in resumen
assert 'total_uds_global' in resumen

uds_p = resumen['principal']['unidades_vendidas']
uds_s = resumen['secundaria']['unidades_vendidas']
uds_t = resumen['total_uds_global']
assert uds_t == uds_p + uds_s
print(f"[OK] Test 5: Auditoría de Ventas por Sucursal calculada correctamente (Principal: {uds_p} uds, Secundaria: {uds_s} uds, Total: {uds_t} uds).")

# 6. Agrupaciones temporales: Día, Mes y Año
agrup = data['agrupaciones']
assert 'por_dia' in agrup
assert 'por_mes' in agrup
assert 'por_ano' in agrup
assert len(agrup['por_dia']) > 0
assert len(agrup['por_mes']) > 0
assert len(agrup['por_ano']) > 0
print(f"[OK] Test 6: Agrupaciones temporales validadas ({len(agrup['por_dia'])} días, {len(agrup['por_mes'])} meses, {len(agrup['por_ano'])} años).")

# 7. Proyecciones Gerenciales
proy = data['proyecciones']
assert 'promedio_diario_global' in proy
assert 'proyeccion_mes_global' in proy
assert 'cobertura_stock_dias' in proy
assert proy['promedio_diario_global'] > 0
assert proy['proyeccion_mes_global'] > 0
print(f"[OK] Test 7: Proyecciones predictivas verificadas (Ritmo diario: {proy['promedio_diario_global']} uds/día, Cierre mes: {proy['proyeccion_mes_global']} uds, Cobertura: {proy['cobertura_stock_dias']} días).")

# 8. Filtro por sucursal específica
res_p = client.get('/api/auditoria/ventas?sucursal=principal')
assert res_p.status_code == 200
data_p = res_p.get_json()
assert data_p['success'] is True
assert all('principal' in v['Local_Venta'].lower() for v in data_p['ventas_auditadas'])
print("[OK] Test 8: Filtro específico por Sucursal Principal validado en la bitácora auditada.")

# 9. Endpoint de Imagen de Arquitectura
res_img = client.get('/api/arquitectura-imagen')
assert res_img.status_code == 200
assert 'image/' in res_img.content_type
print(f"[OK] Test 9: Imagen técnica de arquitectura servida correctamente (Content-Type: {res_img.content_type}, Tamaño: {len(res_img.data)} bytes).")

print("--- TODAS LAS PRUEBAS DE LOGIN, AUDITORÍA Y ARQUITECTURA PASARON EXITOSAMENTE ---")

