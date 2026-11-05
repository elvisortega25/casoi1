"""
=============================================================================
SISTEMA DE INVENTARIO WEB Y VENTA CRUZADA FRACCIONADA - ACTIVE SPORT S.A.
Backend en Python con Flask y persistencia en archivos JSON.
=============================================================================
"""

import os
import json
import logging
from datetime import datetime
from threading import Lock
from flask import Flask, request, jsonify, render_template

# Configuración básica de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("ActiveSportApp")

# Inicialización de la aplicación Flask
app = Flask(__name__, template_folder="templates", static_folder="static")

# Rutas de los archivos de datos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
PRODUCTOS_FILE = os.path.join(DATA_DIR, "productos.json")
MOVIMIENTOS_FILE = os.path.join(DATA_DIR, "movimientos.json")
SEGUIMIENTO_FILE = os.path.join(DATA_DIR, "seguimiento_ventas.json")

# Rutas de estáticos e imágenes del sistema
STATIC_DIR = os.path.join(BASE_DIR, "static")
IMG_DIR = os.path.join(STATIC_DIR, "img")
ARQUITECTURA_IMG = os.path.join(IMG_DIR, "arquitectura_sistema.jpg")
BRAIN_IMG = r"C:\Users\Administrador\.gemini\antigravity\brain\e36154a8-3a61-486d-9ae9-9f6775f752c8\arquitectura_active_sport_roles_1793907755307.jpg"

# Bloqueo para operaciones atómicas de concurrencia
file_lock = Lock()

# Configuración de locales físicos independientes
LOCALES = {
    "principal": "Sucursal Principal",
    "secundaria": "Sucursal Secundaria"
}

# Catálogo inicial con stock independiente por sucursal
PRODUCTOS_INICIALES = [
    {
        "codigo": "AS001",
        "nombre": "Zapatillas para correr",
        "stock": {
            "principal": 3,
            "secundaria": 8
        },
        "stock_minimo": 18,
        "ventas_mes": 46
    },
    {
        "codigo": "AS002",
        "nombre": "Camiseta deportiva",
        "stock": {
            "principal": 20,
            "secundaria": 18
        },
        "stock_minimo": 15,
        "ventas_mes": 29
    },
    {
        "codigo": "AS003",
        "nombre": "Balón de fútbol",
        "stock": {
            "principal": 4,
            "secundaria": 5
        },
        "stock_minimo": 12,
        "ventas_mes": 34
    },
    {
        "codigo": "AS004",
        "nombre": "Mochila deportiva",
        "stock": {
            "principal": 12,
            "secundaria": 10
        },
        "stock_minimo": 8,
        "ventas_mes": 17
    },
    {
        "codigo": "AS005",
        "nombre": "Pantalón de entrenamiento",
        "stock": {
            "principal": 5,
            "secundaria": 6
        },
        "stock_minimo": 14,
        "ventas_mes": 25
    },
    {
        "codigo": "AS006",
        "nombre": "Guantes de gimnasio",
        "stock": {
            "principal": 16,
            "secundaria": 15
        },
        "stock_minimo": 10,
        "ventas_mes": 13
    }
]

MOVIMIENTOS_INICIALES = [
    {
        "id": "MOV-0001",
        "codigo_producto": "AS001",
        "tipo": "Entrada",
        "cantidad": 20,
        "fecha": "2026-11-01 08:30:00",
        "observacion": "Recepción de lote inicial en Sucursal Principal"
    },
    {
        "id": "MOV-0002",
        "codigo_producto": "AS001",
        "tipo": "Venta",
        "cantidad": 6,
        "fecha": "2026-11-02 11:15:20",
        "observacion": "Venta en mostrador Sucursal Principal - Boleta B01-0045"
    },
    {
        "id": "MOV-0003",
        "codigo_producto": "AS003",
        "tipo": "Venta",
        "cantidad": 5,
        "fecha": "2026-11-03 16:40:10",
        "observacion": "Venta institucional Club Juvenil - Sucursal Secundaria"
    },
    {
        "id": "MOV-0004",
        "codigo_producto": "AS005",
        "tipo": "Venta",
        "cantidad": 4,
        "fecha": "2026-11-04 14:10:05",
        "observacion": "Venta en tienda física Sucursal Principal"
    }
]

SEGUIMIENTO_INICIAL = [
    {
        "ID_Orden": "ORD-0001",
        "Fecha": "2026-11-04 10:15:00",
        "Cliente": "Carlos Mendoza",
        "Producto": "Camiseta deportiva (AS002)",
        "Cantidad_Total": 2,
        "Local_Venta": "Sucursal Principal",
        "Detalle_Entrega": {
            "entregadas_momento": 2,
            "pendientes_retiro": 0,
            "local_retiro": "Sucursal Principal"
        },
        "Estado_Global": "Completado",
        "Tipo_Venta": "Normal"
    },
    {
        "ID_Orden": "ORD-0002",
        "Fecha": "2026-11-05 09:30:15",
        "Cliente": "Elvis Ortega",
        "Producto": "Zapatillas para correr (AS001)",
        "Cantidad_Total": 5,
        "Local_Venta": "Sucursal Principal",
        "Detalle_Entrega": {
            "entregadas_momento": 3,
            "pendientes_retiro": 2,
            "local_retiro": "Sucursal Secundaria"
        },
        "Estado_Global": "Pendiente de retiro parcial",
        "Tipo_Venta": "Fraccionada"
    },
    {
        "ID_Orden": "ORD-0003",
        "Fecha": "2026-11-05 11:20:45",
        "Cliente": "Mariana Ríos",
        "Producto": "Balón de fútbol (AS003)",
        "Cantidad_Total": 6,
        "Local_Venta": "Sucursal Secundaria",
        "Detalle_Entrega": {
            "entregadas_momento": 5,
            "pendientes_retiro": 1,
            "local_retiro": "Sucursal Principal"
        },
        "Estado_Global": "Pendiente de retiro parcial",
        "Tipo_Venta": "Fraccionada"
    }
]


# =============================================================================
# FUNCIONES AUXILIARES DE GESTIÓN DE ARCHIVOS JSON
# =============================================================================

def inicializar_almacen():
    """Garantiza la existencia e integridad de los archivos JSON y recursos visuales."""
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(IMG_DIR, exist_ok=True)

    if not os.path.exists(PRODUCTOS_FILE):
        guardar_json(PRODUCTOS_FILE, PRODUCTOS_INICIALES)

    if not os.path.exists(MOVIMIENTOS_FILE):
        guardar_json(MOVIMIENTOS_FILE, MOVIMIENTOS_INICIALES)

    if not os.path.exists(SEGUIMIENTO_FILE):
        guardar_json(SEGUIMIENTO_FILE, SEGUIMIENTO_INICIAL)

    # Copiar o asegurar la disponibilidad de la imagen de arquitectura en español
    if os.path.exists(BRAIN_IMG):
        try:
            import shutil
            shutil.copyfile(BRAIN_IMG, ARQUITECTURA_IMG)
            logger.info("Imagen de arquitectura en español sincronizada en: %s", ARQUITECTURA_IMG)
        except Exception as err:
            logger.warning("No se pudo copiar arquitectura_sistema.jpg: %s", err)


def cargar_json(ruta_archivo, valor_por_defecto=None):
    """Carga de forma segura un archivo JSON."""
    if valor_por_defecto is None:
        valor_por_defecto = []
    if not os.path.exists(ruta_archivo):
        return valor_por_defecto
    try:
        with open(ruta_archivo, "r", encoding="utf-8") as archivo:
            return json.load(archivo)
    except Exception as err:
        logger.error("Error al leer %s: %s", ruta_archivo, err)
        return valor_por_defecto


def guardar_json(ruta_archivo, datos):
    """Guarda con escritura atómica tolerante a bloqueos en Windows."""
    try:
        directorio = os.path.dirname(ruta_archivo)
        if directorio and not os.path.exists(directorio):
            os.makedirs(directorio, exist_ok=True)

        temp_file = f"{ruta_archivo}.tmp"
        with open(temp_file, "w", encoding="utf-8") as archivo:
            json.dump(datos, archivo, indent=2, ensure_ascii=False)
            archivo.flush()
            os.fsync(archivo.fileno())

        try:
            os.replace(temp_file, ruta_archivo)
        except OSError:
            import time
            time.sleep(0.05)
            try:
                os.replace(temp_file, ruta_archivo)
            except OSError:
                with open(ruta_archivo, "w", encoding="utf-8") as archivo:
                    json.dump(datos, archivo, indent=2, ensure_ascii=False)
                if os.path.exists(temp_file):
                    try:
                        os.remove(temp_file)
                    except OSError:
                        pass
        return True
    except OSError as err:
        logger.error("Error E/S en %s: %s", ruta_archivo, err)
        return False


def normalizar_producto(p):
    """Calcula totales y garantiza la estructura de stock por sucursal."""
    if "stock" not in p or not isinstance(p["stock"], dict):
        p["stock"] = {"principal": 0, "secundaria": 0}
    p["stock_principal"] = p["stock"].get("principal", 0)
    p["stock_secundaria"] = p["stock"].get("secundaria", 0)
    p["stock_total"] = p["stock_principal"] + p["stock_secundaria"]
    p["stock_actual"] = p["stock_total"]
    return p


# Inicializar base de datos
inicializar_almacen()


# =============================================================================
# AUTENTICACIÓN Y ROLES DE USUARIO (ADMINISTRADOR Y GERENTE)
# =============================================================================

USUARIOS = {
    "admin": {
        "usuario": "admin",
        "password": "admin123",
        "nombre": "Administrador General",
        "rol": "administrador",
        "badge": "Administrador",
        "avatar": "🛡️",
        "descripcion": "Acceso total y operativo: ventas, reposiciones, confirmación de retiros y reinicio."
    },
    "gerente": {
        "usuario": "gerente",
        "password": "gerente123",
        "nombre": "Gerente de Operaciones",
        "rol": "gerente",
        "badge": "Gerente",
        "avatar": "👔",
        "descripcion": "Acceso estratégico y ejecutivo: reportes consolidados, auditoría de ventas por sucursal y proyecciones."
    }
}


# =============================================================================
# RUTAS DE LA APLICACIÓN (FRONTEND)
# =============================================================================

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/login", methods=["POST"])
def autenticar_usuario():
    """Valida credenciales de acceso para los roles Administrador y Gerente."""
    datos = request.get_json(silent=True) or {}
    usuario = str(datos.get("usuario", "")).strip().lower()
    password = str(datos.get("password", "")).strip()

    if not usuario or not password:
        return jsonify({"success": False, "message": "Por favor ingresa tu usuario y contraseña."}), 400

    cuenta = USUARIOS.get(usuario)
    if not cuenta or cuenta["password"] != password:
        return jsonify({
            "success": False,
            "message": "Credenciales incorrectas. Verifique usuario o contraseña."
        }), 401

    datos_usuario = {
        "usuario": cuenta["usuario"],
        "nombre": cuenta["nombre"],
        "rol": cuenta["rol"],
        "badge": cuenta["badge"],
        "avatar": cuenta["avatar"],
        "descripcion": cuenta["descripcion"]
    }

    logger.info("Inicio de sesión exitoso: %s (%s)", cuenta["nombre"], cuenta["rol"])
    return jsonify({
        "success": True,
        "message": f"¡Bienvenido(a), {cuenta['nombre']}! Has ingresado con rol de {cuenta['badge']}.",
        "user": datos_usuario
    }), 200


@app.route("/api/usuarios/credenciales", methods=["GET"])
def obtener_credenciales_demo():
    """Retorna información de las cuentas para acceso rápido y pruebas."""
    cuentas = []
    for k, v in USUARIOS.items():
        cuentas.append({
            "usuario": v["usuario"],
            "password": v["password"],
            "nombre": v["nombre"],
            "rol": v["rol"],
            "badge": v["badge"],
            "avatar": v["avatar"],
            "descripcion": v["descripcion"]
        })
    return jsonify({"success": True, "data": cuentas}), 200


# =============================================================================
# ENDPOINTS REST: CATÁLOGO DE PRODUCTOS
# =============================================================================

@app.route("/api/productos", methods=["GET"])
def obtener_productos():
    """Retorna el catálogo con el desglose de existencias por local."""
    with file_lock:
        productos = cargar_json(PRODUCTOS_FILE, PRODUCTOS_INICIALES)
    return jsonify({
        "success": True,
        "total": len(productos),
        "locales": LOCALES,
        "data": [normalizar_producto(p) for p in productos]
    }), 200


@app.route("/api/productos/<string:codigo>", methods=["GET"])
def obtener_producto_por_codigo(codigo):
    with file_lock:
        productos = cargar_json(PRODUCTOS_FILE, PRODUCTOS_INICIALES)
    codigo_limpio = codigo.strip().upper()
    producto = next((p for p in productos if p["codigo"].upper() == codigo_limpio), None)
    if not producto:
        return jsonify({"success": False, "message": f"Producto '{codigo}' no encontrado."}), 404
    return jsonify({"success": True, "data": normalizar_producto(producto)}), 200


# =============================================================================
# ENDPOINTS REST: SEGUIMIENTO DE VENTAS Y VENTA FRACCIONADA
# =============================================================================

@app.route("/api/seguimiento", methods=["GET"])
def obtener_seguimiento_ventas():
    """Retorna el registro histórico centralizado de seguimiento_ventas.json."""
    with file_lock:
        seguimiento = cargar_json(SEGUIMIENTO_FILE, SEGUIMIENTO_INICIAL)

    ordenes_ordenadas = list(reversed(seguimiento))
    total_ordenes = len(ordenes_ordenadas)
    pendientes = sum(1 for o in ordenes_ordenadas if o.get("Estado_Global") == "Pendiente de retiro parcial")
    completadas = sum(1 for o in ordenes_ordenadas if o.get("Estado_Global") == "Completado")
    fraccionadas = sum(1 for o in ordenes_ordenadas if o.get("Tipo_Venta") == "Fraccionada")

    return jsonify({
        "success": True,
        "total": total_ordenes,
        "pendientes_retiro": pendientes,
        "completadas": completadas,
        "ventas_fraccionadas": fraccionadas,
        "data": ordenes_ordenadas
    }), 200


# =============================================================================
# ENDPOINTS REST: BITÁCORA Y AUDITORÍA DE MOVIMIENTOS
# =============================================================================

@app.route("/api/movimientos", methods=["GET"])
def obtener_movimientos():
    """Retorna la bitácora completa de movimientos de almacén ordenados de forma descendente."""
    with file_lock:
        movimientos = cargar_json(MOVIMIENTOS_FILE, MOVIMIENTOS_INICIALES)
    return jsonify({
        "success": True,
        "total": len(movimientos),
        "data": list(reversed(movimientos))
    }), 200


# =============================================================================
# ENDPOINTS REST: AUDITORÍA AVANZADA DE VENTAS Y REPORTES GERENCIALES
# =============================================================================

@app.route("/api/auditoria/ventas", methods=["GET"])
def obtener_auditoria_ventas():
    """
    Retorna auditoría integral de ventas por sucursal:
    - Desglose exacto de ventas en Sucursal Principal vs Sucursal Secundaria y totales globales.
    - Agrupaciones temporales: por Día, por Mes y por Año.
    - Proyecciones gerenciales: promedio diario, proyección a fin de mes, comparativa de sucursales
      y estimación de agotamiento/cobertura de inventario en días.
    - Historial detallado de ventas con filtros de sucursal, período y texto.
    """
    sucursal_filtro = request.args.get("sucursal", "todas").strip()
    fecha_filtro = request.args.get("fecha", "").strip()
    busqueda = request.args.get("busqueda", "").strip().lower()

    with file_lock:
        productos = cargar_json(PRODUCTOS_FILE, PRODUCTOS_INICIALES)
        seguimiento = cargar_json(SEGUIMIENTO_FILE, SEGUIMIENTO_INICIAL)
        movimientos = cargar_json(MOVIMIENTOS_FILE, MOVIMIENTOS_INICIALES)

    # Consolidar todas las ventas registradas
    ventas = []
    ids_registrados = set()
    for s in seguimiento:
        ids_registrados.add(s.get("ID_Orden"))
        ventas.append(dict(s))

    # Incorporar ventas históricas de movimientos que no estén en seguimiento
    for m in movimientos:
        if m.get("tipo") == "Venta":
            observacion = m.get("observacion", "")
            es_orden = any(id_ord in observacion for id_ord in ids_registrados)
            if not es_orden:
                local_detectado = "Sucursal Principal"
                if "secundaria" in observacion.lower():
                    local_detectado = "Sucursal Secundaria"

                cod = m.get("codigo_producto", "")
                prod_obj = next((p for p in productos if p.get("codigo") == cod), None)
                nom_prod = f"{prod_obj['nombre']} ({cod})" if prod_obj else f"Producto ({cod})"

                ventas.append({
                    "ID_Orden": m.get("id"),
                    "Fecha": m.get("fecha"),
                    "Cliente": "Cliente Histórico",
                    "Producto": nom_prod,
                    "Cantidad_Total": m.get("cantidad", 0),
                    "Local_Venta": local_detectado,
                    "Detalle_Entrega": {
                        "entregadas_momento": m.get("cantidad", 0),
                        "pendientes_retiro": 0,
                        "local_retiro": local_detectado
                    },
                    "Estado_Global": "Completado",
                    "Tipo_Venta": "Normal"
                })

    # Ordenar por fecha descendente
    ventas.sort(key=lambda x: str(x.get("Fecha", "")), reverse=True)

    # Acumuladores de métricas por sucursal
    total_uds_principal = 0
    total_ordenes_principal = 0
    total_uds_secundaria = 0
    total_ordenes_secundaria = 0

    por_dia = {}
    por_mes = {}
    por_ano = {}
    dias_distintos = set()

    for v in ventas:
        cant = int(v.get("Cantidad_Total", 0))
        local = str(v.get("Local_Venta", ""))
        f_str = str(v.get("Fecha", ""))

        fecha_corta = f_str.split(" ")[0] if f_str else "Desconocida"
        mes_corta = fecha_corta[:7] if len(fecha_corta) >= 7 else fecha_corta
        ano_corta = fecha_corta[:4] if len(fecha_corta) >= 4 else fecha_corta

        dias_distintos.add(fecha_corta)

        es_principal = "principal" in local.lower()
        if es_principal:
            total_uds_principal += cant
            total_ordenes_principal += 1
        else:
            total_uds_secundaria += cant
            total_ordenes_secundaria += 1

        # Agrupación por día
        if fecha_corta not in por_dia:
            por_dia[fecha_corta] = {
                "periodo": fecha_corta,
                "principal": 0,
                "secundaria": 0,
                "total": 0,
                "ordenes": 0
            }
        por_dia[fecha_corta]["total"] += cant
        por_dia[fecha_corta]["ordenes"] += 1
        if es_principal:
            por_dia[fecha_corta]["principal"] += cant
        else:
            por_dia[fecha_corta]["secundaria"] += cant

        # Agrupación por mes
        if mes_corta not in por_mes:
            por_mes[mes_corta] = {
                "periodo": mes_corta,
                "principal": 0,
                "secundaria": 0,
                "total": 0,
                "ordenes": 0
            }
        por_mes[mes_corta]["total"] += cant
        por_mes[mes_corta]["ordenes"] += 1
        if es_principal:
            por_mes[mes_corta]["principal"] += cant
        else:
            por_mes[mes_corta]["secundaria"] += cant

        # Agrupación por año
        if ano_corta not in por_ano:
            por_ano[ano_corta] = {
                "periodo": ano_corta,
                "principal": 0,
                "secundaria": 0,
                "total": 0,
                "ordenes": 0
            }
        por_ano[ano_corta]["total"] += cant
        por_ano[ano_corta]["ordenes"] += 1
        if es_principal:
            por_ano[ano_corta]["principal"] += cant
        else:
            por_ano[ano_corta]["secundaria"] += cant

    total_uds_global = total_uds_principal + total_uds_secundaria
    total_ordenes_global = total_ordenes_principal + total_ordenes_secundaria

    pct_principal = round((total_uds_principal / total_uds_global) * 100, 1) if total_uds_global > 0 else 0
    pct_secundaria = round((total_uds_secundaria / total_uds_global) * 100, 1) if total_uds_global > 0 else 0

    # Proyecciones y tendencias gerenciales
    num_dias = max(len(dias_distintos), 1)
    promedio_diario_global = round(total_uds_global / num_dias, 2)
    promedio_diario_principal = round(total_uds_principal / num_dias, 2)
    promedio_diario_secundaria = round(total_uds_secundaria / num_dias, 2)

    proyeccion_mes_global = round(promedio_diario_global * 30)
    proyeccion_mes_principal = round(promedio_diario_principal * 30)
    proyeccion_mes_secundaria = round(promedio_diario_secundaria * 30)

    productos_norm = [normalizar_producto(p) for p in productos]
    stock_total_actual = sum(p["stock_total"] for p in productos_norm)
    cobertura_dias = round(stock_total_actual / promedio_diario_global, 1) if promedio_diario_global > 0 else 999

    proyecciones = {
        "dias_auditados": num_dias,
        "promedio_diario_global": promedio_diario_global,
        "promedio_diario_principal": promedio_diario_principal,
        "promedio_diario_secundaria": promedio_diario_secundaria,
        "proyeccion_mes_global": proyeccion_mes_global,
        "proyeccion_mes_principal": proyeccion_mes_principal,
        "proyeccion_mes_secundaria": proyeccion_mes_secundaria,
        "sucursal_lider": "Sucursal Principal" if total_uds_principal >= total_uds_secundaria else "Sucursal Secundaria",
        "diferencia_uds": abs(total_uds_principal - total_uds_secundaria),
        "stock_total_disponible": stock_total_actual,
        "cobertura_stock_dias": cobertura_dias,
        "alerta_gerencial": (
            f"Al ritmo promedio actual de {promedio_diario_global} uds/día, el stock total ({stock_total_actual} uds) "
            f"tiene una cobertura proyectada de {cobertura_dias} días antes de agotarse."
        )
    }

    # Filtrado dinámico de ventas para la tabla auditada
    ventas_filtradas = []
    for v in ventas:
        local_v = str(v.get("Local_Venta", ""))
        f_str = str(v.get("Fecha", ""))
        prod = str(v.get("Producto", "")).lower()
        cli = str(v.get("Cliente", "")).lower()
        id_o = str(v.get("ID_Orden", "")).lower()

        if sucursal_filtro != "todas":
            if sucursal_filtro.lower() not in local_v.lower():
                continue

        if fecha_filtro:
            if not f_str.startswith(fecha_filtro):
                continue

        if busqueda:
            if busqueda not in prod and busqueda not in cli and busqueda not in id_o:
                continue

        ventas_filtradas.append(v)

    lista_dias = sorted(por_dia.values(), key=lambda x: x["periodo"], reverse=True)
    lista_meses = sorted(por_mes.values(), key=lambda x: x["periodo"], reverse=True)
    lista_anos = sorted(por_ano.values(), key=lambda x: x["periodo"], reverse=True)

    return jsonify({
        "success": True,
        "resumen": {
            "total_uds_global": total_uds_global,
            "total_ordenes_global": total_ordenes_global,
            "principal": {
                "nombre": "Sucursal Principal",
                "unidades_vendidas": total_uds_principal,
                "numero_ordenes": total_ordenes_principal,
                "porcentaje": pct_principal,
                "promedio_por_orden": round(total_uds_principal / max(total_ordenes_principal, 1), 2)
            },
            "secundaria": {
                "nombre": "Sucursal Secundaria",
                "unidades_vendidas": total_uds_secundaria,
                "numero_ordenes": total_ordenes_secundaria,
                "porcentaje": pct_secundaria,
                "promedio_por_orden": round(total_uds_secundaria / max(total_ordenes_secundaria, 1), 2)
            }
        },
        "proyecciones": proyecciones,
        "agrupaciones": {
            "por_dia": lista_dias,
            "por_mes": lista_meses,
            "por_ano": lista_anos
        },
        "ventas_auditadas": ventas_filtradas,
        "total_auditadas": len(ventas_filtradas)
    }), 200


@app.route("/api/arquitectura-imagen", methods=["GET"])
def servir_imagen_arquitectura():
    """Sirve la imagen técnica de la arquitectura del sistema."""
    from flask import send_file
    if os.path.exists(ARQUITECTURA_IMG):
        return send_file(ARQUITECTURA_IMG, mimetype="image/jpeg")
    if os.path.exists(BRAIN_IMG):
        return send_file(BRAIN_IMG, mimetype="image/jpeg")
    return jsonify({"success": False, "message": "Imagen no disponible"}), 404


@app.route("/api/ventas", methods=["POST"])
@app.route("/api/movimientos", methods=["POST"])
def procesar_venta_fraccionada():
    """
    Lógica de Venta Cruzada Fraccionada:
    Permite vender una cantidad mayor a la que tiene el local actual,
    siempre y cuando la suma del stock de ambos locales cubra la demanda.

    - Escenario 1 (Venta Normal):
      Si local_actual >= cantidad:
      Se descuenta todo de local_actual.
      Estado_Global = 'Completado', Tipo_Venta = 'Normal'.

    - Escenario 2 (Venta Fraccionada/Cruzada):
      Si local_actual < cantidad y (local_actual + otro_local) >= cantidad:
      Se aprueba UNA sola venta por el total.
      Descuenta todo lo disponible del local_actual (entregadas_momento).
      Descuenta el faltante del otro_local (pendientes_retiro).
      Estado_Global = 'Pendiente de retiro parcial', Tipo_Venta = 'Fraccionada'.

    - Escenario 3 (Stock Insuficiente Global):
      Si cantidad > (local_actual + otro_local):
      Rechaza con HTTP 400 Bad Request.
    """
    datos = request.get_json(silent=True) or {}
    tipo_operacion = str(datos.get("tipo", "Venta")).strip().capitalize()
    codigo = str(datos.get("codigo", "")).strip().upper()
    cliente = str(datos.get("cliente", "")).strip() or "Cliente Mostrador"
    local_op = str(datos.get("local_operacion", "principal")).strip().lower()
    cantidad = datos.get("cantidad")
    observacion = str(datos.get("observacion", "")).strip()

    if not codigo:
        return jsonify({"success": False, "message": "El código del producto es obligatorio."}), 400

    if local_op not in ["principal", "secundaria"]:
        local_op = "principal"

    try:
        cantidad = int(cantidad)
        if cantidad <= 0: raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "La cantidad debe ser un entero positivo."}), 400

    with file_lock:
        productos = cargar_json(PRODUCTOS_FILE, PRODUCTOS_INICIALES)
        movimientos = cargar_json(MOVIMIENTOS_FILE, MOVIMIENTOS_INICIALES)
        seguimiento = cargar_json(SEGUIMIENTO_FILE, SEGUIMIENTO_INICIAL)

        producto = next((p for p in productos if p["codigo"].upper() == codigo), None)
        if not producto:
            return jsonify({"success": False, "message": f"Producto '{codigo}' no encontrado."}), 404

        producto = normalizar_producto(producto)

        # -------------------------------------------------------------
        # OPERACIÓN: ENTRADA / REABASTECIMIENTO
        # -------------------------------------------------------------
        if tipo_operacion == "Entrada":
            local_destino = local_op
            producto["stock"][local_destino] += cantidad
            normalizar_producto(producto)
            nombre_local = LOCALES[local_destino]

            nuevo_mov = {
                "id": f"MOV-{len(movimientos) + 1:04d}",
                "codigo_producto": producto["codigo"],
                "tipo": "Entrada",
                "cantidad": cantidad,
                "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "observacion": f"{observacion or 'Ingreso de mercadería'} ({nombre_local})"
            }
            movimientos.append(nuevo_mov)

            guardar_json(PRODUCTOS_FILE, productos)
            guardar_json(MOVIMIENTOS_FILE, movimientos)

            return jsonify({
                "success": True,
                "message": f"Ingreso exitoso de {cantidad} unidad(es) de '{producto['nombre']}' en {nombre_local}.",
                "data": {"producto": producto}
            }), 201

        # -------------------------------------------------------------
        # OPERACIÓN: VENTA CON LÓGICA FRACCIONADA
        # -------------------------------------------------------------
        local_actual = local_op
        otro_local = "secundaria" if local_actual == "principal" else "principal"

        nombre_actual = LOCALES[local_actual]
        nombre_otro = LOCALES[otro_local]

        stock_actual = producto["stock"].get(local_actual, 0)
        stock_otro = producto["stock"].get(otro_local, 0)
        stock_total = stock_actual + stock_otro

        # Validación estricta de stock global combinado
        if cantidad > stock_total:
            return jsonify({
                "success": False,
                "message": (
                    f"Operación rechazada: Stock global insuficiente para '{producto['nombre']}'. "
                    f"Se solicitaron {cantidad} unidades, pero el stock total combinado entre ambas sucursales es de {stock_total} "
                    f"({nombre_actual}: {stock_actual} uds., {nombre_otro}: {stock_otro} uds.)."
                ),
                "stock_actual": stock_actual,
                "stock_otro": stock_otro,
                "stock_total": stock_total,
                "cantidad_solicitada": cantidad
            }), 400

        # ESCENARIO 1: VENTA NORMAL (El local actual tiene todo el stock)
        if stock_actual >= cantidad:
            producto["stock"][local_actual] -= cantidad
            producto["ventas_mes"] += cantidad
            normalizar_producto(producto)

            entregadas_momento = cantidad
            pendientes_retiro = 0
            local_retiro = nombre_actual
            estado_global = "Completado"
            tipo_venta = "Normal"
            es_fraccionada = False

            mensaje_alerta = (
                f"Venta Exitosa (Normal). Se entregaron las {cantidad} unidades en este momento en {nombre_actual}. "
                f"Pedido completado."
            )

        # ESCENARIO 2: VENTA FRACCIONADA / CRUZADA
        # El local actual no cubre el total, pero la suma de ambos locales sí lo cubre
        else:
            entregadas_momento = stock_actual
            pendientes_retiro = cantidad - stock_actual

            # Descontar del inventario de cada sucursal
            producto["stock"][local_actual] -= entregadas_momento # Queda en 0 en local actual
            producto["stock"][otro_local] -= pendientes_retiro    # Se descuenta el saldo del otro local
            producto["ventas_mes"] += cantidad
            normalizar_producto(producto)

            local_retiro = nombre_otro
            estado_global = "Pendiente de retiro parcial"
            tipo_venta = "Fraccionada"
            es_fraccionada = True

            # Alerta exacta requerida en el caso
            mensaje_alerta = (
                f"Venta Exitosa. Entregue {entregadas_momento} unidades en este momento. "
                f"El cliente debe acercarse a {nombre_otro} a retirar las {pendientes_retiro} unidades restantes."
            )

        fecha_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        nuevo_id = f"ORD-{len(seguimiento) + 1:04d}"

        # Estructura requerida de seguimiento_ventas.json
        nueva_orden = {
            "ID_Orden": nuevo_id,
            "Fecha": fecha_str,
            "Cliente": cliente,
            "Producto": f"{producto['nombre']} ({producto['codigo']})",
            "Cantidad_Total": cantidad,
            "Local_Venta": nombre_actual,
            "Detalle_Entrega": {
                "entregadas_momento": entregadas_momento,
                "pendientes_retiro": pendientes_retiro,
                "local_retiro": local_retiro
            },
            "Estado_Global": estado_global,
            "Tipo_Venta": tipo_venta
        }
        seguimiento.append(nueva_orden)

        # Registro en la bitácora histórica
        nuevo_mov = {
            "id": f"MOV-{len(movimientos) + 1:04d}",
            "codigo_producto": producto["codigo"],
            "tipo": "Venta",
            "cantidad": cantidad,
            "fecha": fecha_str,
            "observacion": (
                f"Venta {tipo_venta} a '{cliente}' ({nuevo_id}) - "
                f"Entregadas: {entregadas_momento} en {nombre_actual} | Pendientes: {pendientes_retiro} en {local_retiro}"
            )
        }
        movimientos.append(nuevo_mov)

        # Persistir cambios atómicamente
        guardar_json(PRODUCTOS_FILE, productos)
        guardar_json(SEGUIMIENTO_FILE, seguimiento)
        guardar_json(MOVIMIENTOS_FILE, movimientos)

    logger.info("Venta %s procesada: %s | Cliente: %s | Total: %d (Inmediatas: %d, Pendientes: %d)",
                tipo_venta, nuevo_id, cliente, cantidad, entregadas_momento, pendientes_retiro)

    return jsonify({
        "success": True,
        "message": mensaje_alerta,
        "es_fraccionada": es_fraccionada,
        "data": {
            "orden": nueva_orden,
            "producto": producto,
            "detalle": {
                "entregadas_momento": entregadas_momento,
                "pendientes_retiro": pendientes_retiro,
                "local_retiro": local_retiro
            }
        }
    }), 201


@app.route("/api/seguimiento/<string:id_orden>/confirmar-retiro", methods=["POST", "PUT"])
@app.route("/api/seguimiento/<string:id_orden>/entregar", methods=["POST", "PUT"])
def confirmar_retiro_saldo(id_orden):
    """
    Endpoint para que la sucursal de destino confirme que el cliente ya retiró
    las unidades faltantes de una venta fraccionada.
    Actualiza Estado_Global a 'Completado'.
    """
    id_limpio = id_orden.strip().upper()

    with file_lock:
        seguimiento = cargar_json(SEGUIMIENTO_FILE, SEGUIMIENTO_INICIAL)

        orden = next((o for o in seguimiento if o["ID_Orden"].upper() == id_limpio), None)
        if not orden:
            return jsonify({
                "success": False,
                "message": f"Orden con ID '{id_orden}' no encontrada en el sistema."
            }), 404

        if orden.get("Estado_Global") == "Completado":
            return jsonify({
                "success": False,
                "message": f"La orden '{id_orden}' ya se encuentra completada anteriormente."
            }), 400

        # Actualizar estado a Completado
        unidades_retiradas = orden["Detalle_Entrega"]["pendientes_retiro"]
        orden["Estado_Global"] = "Completado"
        orden["Detalle_Entrega"]["pendientes_retiro"] = 0
        orden["Fecha_Retiro_Saldo"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if not guardar_json(SEGUIMIENTO_FILE, seguimiento):
            return jsonify({
                "success": False,
                "message": "Error al actualizar seguimiento_ventas.json en disco."
            }), 500

    local_destino = orden["Detalle_Entrega"]["local_retiro"]
    logger.info("Retiro de saldo confirmado para orden %s (%d unidades en %s).",
                id_limpio, unidades_retiradas, local_destino)

    return jsonify({
        "success": True,
        "message": (
            f"¡Retiro de saldo confirmado! El cliente retiró las {unidades_retiradas} unidad(es) pendientes en {local_destino}. "
            f"La orden {id_orden} ha pasado a estado 'Completado'."
        ),
        "data": orden
    }), 200


# =============================================================================
# ENDPOINT: REPORTE GERENCIAL CONSOLIDADO
# =============================================================================

@app.route("/api/reportes", methods=["GET"])
def obtener_reporte_gerencial():
    with file_lock:
        productos = cargar_json(PRODUCTOS_FILE, PRODUCTOS_INICIALES)
        seguimiento = cargar_json(SEGUIMIENTO_FILE, SEGUIMIENTO_INICIAL)

    productos_norm = [normalizar_producto(p) for p in productos]

    total_unidades_stock = sum(p["stock_total"] for p in productos_norm)
    total_stock_principal = sum(p["stock_principal"] for p in productos_norm)
    total_stock_secundaria = sum(p["stock_secundaria"] for p in productos_norm)
    total_ventas_mes = sum(p["ventas_mes"] for p in productos_norm)

    top_ventas = sorted(productos_norm, key=lambda p: p["ventas_mes"], reverse=True)[:3]

    productos_bajo_stock = []
    for p in productos_norm:
        if p["stock_total"] <= p["stock_minimo"]:
            faltante = max(0, p["stock_minimo"] - p["stock_total"])
            productos_bajo_stock.append({
                **p,
                "faltante": faltante
            })

    productos_bajo_stock.sort(key=lambda p: p["faltante"], reverse=True)

    pendientes_retiro = sum(1 for o in seguimiento if o.get("Estado_Global") == "Pendiente de retiro parcial")
    fraccionadas_total = sum(1 for o in seguimiento if o.get("Tipo_Venta") == "Fraccionada")

    return jsonify({
        "success": True,
        "data": {
            "total_unidades_stock": total_unidades_stock,
            "stock_principal": total_stock_principal,
            "stock_secundaria": total_stock_secundaria,
            "total_ventas_mes": total_ventas_mes,
            "total_productos": len(productos_norm),
            "cantidad_bajo_stock": len(productos_bajo_stock),
            "pendientes_retiro": pendientes_retiro,
            "ventas_fraccionadas_total": fraccionadas_total,
            "top_ventas": top_ventas,
            "productos_bajo_stock": productos_bajo_stock,
            "locales": LOCALES
        }
    }), 200


@app.route("/api/reiniciar", methods=["POST"])
def reiniciar_datos():
    """Restablece los archivos a los valores iniciales exactos."""
    with file_lock:
        guardar_json(PRODUCTOS_FILE, PRODUCTOS_INICIALES)
        guardar_json(MOVIMIENTOS_FILE, MOVIMIENTOS_INICIALES)
        guardar_json(SEGUIMIENTO_FILE, SEGUIMIENTO_INICIAL)

    logger.info("Base de datos reiniciada a valores iniciales de ACTIVE SPORT S.A.")
    return jsonify({
        "success": True,
        "message": "Datos reiniciados con éxito a los valores iniciales (incluyendo stock independiente y seguimiento de retiros)."
    }), 200


if __name__ == "__main__":
    puerto = int(os.environ.get("PORT", 5000))
    logger.info("Iniciando Sistema ACTIVE SPORT S.A. en http://127.0.0.1:%d", puerto)
    app.run(host="0.0.0.0", port=puerto, debug=True)
