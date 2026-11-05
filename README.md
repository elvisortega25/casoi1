# ACTIVE SPORT S.A. - Sistema de Gestión de Inventario Web

Prototipo funcional full-stack ligero para el control de inventario y registro de movimientos de almacén, desarrollado para **ACTIVE SPORT S.A.** con Python (Flask) en el backend y Vanilla JavaScript, HTML5 y CSS3 en el frontend.

---

## 📁 Estructura del Proyecto

```text
trabajoenclases/
│
├── data/
│   ├── productos.json       # Base de datos de catálogo (stock actual, mínimo, ventas)
│   └── movimientos.json     # Historial de transacciones (Ventas y Entradas)
│
├── static/
│   ├── css/
│   │   └── styles.css       # Estilos visuales modernos, responsivos y tema corporativo
│   └── js/
│       └── script.js        # Lógica del cliente: Fetch API, validaciones, interactividad
│
├── templates/
│   └── index.html           # Interfaz web principal (Dashboard, Inventario y Movimientos)
│
├── app.py                   # Servidor Flask, lógica de negocio y APIs RESTful
├── requirements.txt         # Dependencias del proyecto
└── README.md                # Documentación de uso y pruebas
```

---

## 🚀 Requisitos Previos e Instalación

### 1. Requisitos
- Python 3.8 o superior.
- Navegador web moderno (Chrome, Edge, Firefox, etc.).

### 2. Instalación de Dependencias
Abre una terminal o consola de comandos en la carpeta del proyecto y ejecuta:

```bash
# En Windows (usando el lanzador py):
py -m pip install -r requirements.txt

# O de forma estándar:
pip install -r requirements.txt
```

---

## ▶️ Ejecución del Sistema

Inicia el servidor backend con:

```bash
# En Windows:
py app.py

# O bien:
python app.py
```

Una vez iniciado, abre tu navegador web e ingresa a:
👉 **`http://127.0.0.1:5000`**

---

## 📌 Características Implementadas

### 1. Base de Datos en Archivos JSON
- **`data/productos.json`**: Contiene los 6 productos iniciales exactos del caso con sus códigos (`AS001` a `AS006`), nombres, `stock_actual`, `stock_minimo` y `ventas_mes`.
- **`data/movimientos.json`**: Historial auditable con `id` único autoincremental (`MOV-xxxx`), `codigo_producto`, `tipo` (Entrada/Venta), `cantidad`, `fecha` (YYYY-MM-DD HH:MM:SS) y `observacion`.
- **Manejo de Errores y Tolerancia a Fallos**: Si los archivos JSON no existen o están vacíos, `app.py` los genera automáticamente con la estructura inicial.
- **Concurrencia Segura**: Uso de `threading.Lock()` y escritura atómica mediante archivos temporales para evitar corrupción en accesos simultáneos.

### 2. Backend (Python / Flask)
- **Autenticación y Roles de Acceso**:
  - `admin` / `admin123`: **Administrador General** (Acceso operativo completo: registro de ventas, entradas de mercadería, retiros y reinicio de base de datos).
  - `gerente` / `gerente123`: **Gerente de Operaciones** (Acceso ejecutivo: reporte consolidado, auditoría de ventas por sucursal, proyecciones gerenciales y diagramas de arquitectura).
- **Validación Estricta de Ventas**: No se permite registrar una venta si la cantidad solicitada supera el `stock_actual` disponible. El servidor responde con código HTTP `400 Bad Request` y un mensaje detallado.
- **Actualización de Stock**:
  - Al registrar una **Venta**: `stock_actual` disminuye y `ventas_mes` se incrementa en la misma cantidad.
  - Al registrar una **Entrada/Compra**: `stock_actual` se incrementa.
- **Endpoints de la API**:
  - `GET /`: Carga la interfaz web del sistema.
  - `POST /api/login`: Autentica credenciales y retorna rol y perfil del usuario.
  - `GET /api/productos`: Retorna el catálogo completo con desglose por sucursal física.
  - `GET /api/productos/<codigo>`: Retorna el detalle de un producto específico.
  - `GET /api/movimientos`: Retorna el historial completo de movimientos ordenados cronológicamente.
  - `POST /api/ventas` / `POST /api/movimientos`: Registra una nueva venta o entrada con lógica fraccionada multi-sucursal.
  - `GET /api/seguimiento`: Retorna el listado de órdenes y saldos pendientes de retiro.
  - `POST /api/seguimiento/<id>/confirmar-retiro`: Confirma entrega física del saldo en local destino.
  - `GET /api/auditoria/ventas`: Genera auditoría integral de ventas por sucursal, agregaciones (día, mes, año) y proyecciones.
  - `GET /api/reportes`: Genera los indicadores consolidados para el Reporte Gerencial.
  - `GET /api/arquitectura-imagen`: Sirve la infografía oficial de arquitectura del sistema en 4 capas.
  - `POST /api/reiniciar`: Restaura los datos originales del caso para demostraciones.

### 3. Frontend (HTML5 / CSS3 / Vanilla JS)
- **Módulo de Autenticación**: Modal y conmutador rápido de usuarios en cabecera con avatar, rol y botón de cierre de sesión.
- **Auditoría de Ventas por Sucursal & Reportes Gerenciales**:
  - Desglose independiente: Unidades vendidas en **Sucursal Principal (Local 1)** vs **Sucursal Secundaria (Local 2)** y **Total Global**.
  - Filtros dinámicos por **Día**, **Mes** y **Año**.
  - Proyecciones gerenciales: Promedio diario de ventas, proyección de cierre de mes, comparativa de cuota de mercado y estimación de días de cobertura de stock antes del agotamiento.
  - Bitácora detallada transaccional con identificación visual de la sucursal de origen.
- **Módulo de Arquitectura**: Infografía técnica oficial y desglose detallado de las 4 capas del sistema.
- **Reporte Gerencial (Dashboard)**:
  - Total global de unidades disponibles en inventario.
  - Indicador de alerta de reposición (conteo de productos con `stock_actual <= stock_minimo`).
  - Total acumulado de ventas del mes.
  - **Top 3 productos con mayores ventas del mes**: Tarjetas tipo podio (1°, 2°, 3°) con barras proporcionales.
  - **Lista de productos con déficit**: Muestra cuántas unidades faltan para alcanzar el mínimo y ofrece un botón de reposición rápida.
- **Módulo de Inventario**:
  - Tabla interactiva con resaltado visual (`row-alert-replenish` con borde rojo/ámbar) para productos con stock insuficiente.
  - Columna de **Faltante para Mínimo** (`stock_minimo - stock_actual`).
  - Búsqueda en tiempo real por código o nombre de producto.
  - Filtros rápidos: "Todos", "⚠️ Solo Bajo Mínimo", "✓ Stock Óptimo".
  - Botones de acción rápida en cada fila para pre-cargar formularios.
- **Módulo de Movimientos**:
  - Dos formularios separados y claros: **Registrar Venta** y **Ingresar Mercadería**.
  - Dropdown dinámico que muestra stock disponible en tiempo real.
  - Botones de incremento rápido (+1, +5, +10, +25).
  - Alertas flotantes (Toasts) para confirmación de éxito y avisos de error.
- **Historial de Movimientos**:
  - Tabla de auditoría en tiempo real conectada a `movimientos.json`.

---

## 🧪 Casos de Prueba Recomendados

1. **Intento de Venta que Supera el Stock (Validación Estricta)**:
   - Selecciona `AS003 - Balón de fútbol` (Stock actual: 9).
   - Intenta registrar una venta de `10` o más unidades.
   - **Resultado**: El sistema rechaza la operación, muestra un mensaje de alerta impidiendo la transacción y no modifica el stock ni registra el movimiento.

2. **Venta Válida**:
   - Selecciona `AS002 - Camiseta deportiva` (Stock actual: 38, Ventas: 29).
   - Registra una venta de `5` unidades.
   - **Resultado**: El stock pasa a `33`, las ventas del mes aumentan a `34`, y se añade una entrada en `movimientos.json`.

3. **Ingreso de Mercadería (Entrada)**:
   - Selecciona `AS001 - Zapatillas para correr` (Stock actual: 14, Mínimo: 18, Faltan: 4).
   - Ingresa una mercadería de `6` unidades.
   - **Resultado**: El stock pasa a `20` (superando el mínimo de 18), desaparece la alerta de reposición urgente y se actualizan los contadores del dashboard.

