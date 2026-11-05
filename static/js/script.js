/**
 * =============================================================================
 * ACTIVE SPORT S.A. - INVENTARIO & VENTA CRUZADA FRACCIONADA
 * Lógica del Frontend en Vanilla JavaScript (ES6+)
 * =============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado local reactivo de la aplicación
  const state = {
    productos: [],
    movimientos: [],
    seguimiento: [],
    reportes: null,
    auditoria: null,
    usuarioActual: null,
    locales: {
      principal: 'Sucursal Principal',
      secundaria: 'Sucursal Secundaria'
    },
    localOperativo: 'principal', // 'principal' o 'secundaria'
    filtroInventario: 'todos',
    busquedaInventario: '',
    filtroSeguimiento: 'todos',
    filtroLocalRetiro: 'todos',
    filtroAuditoriaSucursal: 'todas',
    agrupacionAuditoria: 'dia', // 'dia', 'mes', 'ano'
    filtroAuditoriaFecha: '',
    filtroAuditoriaBusqueda: ''
  };

  // Referencias a los elementos del DOM
  const dom = {
    // Autenticación & Perfil de Usuario
    modalLogin: document.getElementById('modalLogin'),
    formLogin: document.getElementById('formLogin'),
    loginUsuario: document.getElementById('loginUsuario'),
    loginPassword: document.getElementById('loginPassword'),
    loginErrorMsg: document.getElementById('loginErrorMsg'),
    headerUserAvatar: document.getElementById('headerUserAvatar'),
    headerUserName: document.getElementById('headerUserName'),
    headerUserRole: document.getElementById('headerUserRole'),
    btnSwitchUser: document.getElementById('btnSwitchUser'),
    btnLogout: document.getElementById('btnLogout'),
    quickAccountBtns: document.querySelectorAll('[data-quick-user]'),

    // Auditoría de Ventas por Sucursal
    kpiAuditoriaSucursal1: document.getElementById('kpiAuditoriaSucursal1'),
    kpiAuditoriaSucursal1Sub: document.getElementById('kpiAuditoriaSucursal1Sub'),
    kpiAuditoriaSucursal2: document.getElementById('kpiAuditoriaSucursal2'),
    kpiAuditoriaSucursal2Sub: document.getElementById('kpiAuditoriaSucursal2Sub'),
    kpiAuditoriaTotal: document.getElementById('kpiAuditoriaTotal'),
    kpiAuditoriaTotalSub: document.getElementById('kpiAuditoriaTotalSub'),
    kpiAuditoriaProyeccion: document.getElementById('kpiAuditoriaProyeccion'),
    kpiAuditoriaProyeccionSub: document.getElementById('kpiAuditoriaProyeccionSub'),
    filtroAuditoriaSucursal: document.getElementById('filtroAuditoriaSucursal'),
    filtroAuditoriaFecha: document.getElementById('filtroAuditoriaFecha'),
    btnClearAuditoriaFecha: document.getElementById('btnClearAuditoriaFecha'),
    filtroAuditoriaBusqueda: document.getElementById('filtroAuditoriaBusqueda'),
    btnRefreshAuditoria: document.getElementById('btnRefreshAuditoria'),
    btnToggleAgrupacion: document.querySelectorAll('[data-agrupacion]'),
    projRitmoDiario: document.getElementById('projRitmoDiario'),
    projMesPrincipal: document.getElementById('projMesPrincipal'),
    projRitmoPrincipal: document.getElementById('projRitmoPrincipal'),
    projMesSecundaria: document.getElementById('projMesSecundaria'),
    projRitmoSecundaria: document.getElementById('projRitmoSecundaria'),
    projDiasCobertura: document.getElementById('projDiasCobertura'),
    projAlertaStock: document.getElementById('projAlertaStock'),
    labelSharePrincipal: document.getElementById('labelSharePrincipal'),
    labelShareSecundaria: document.getElementById('labelShareSecundaria'),
    barSharePrincipal: document.getElementById('barSharePrincipal'),
    barShareSecundaria: document.getElementById('barShareSecundaria'),
    tituloTablaAgrupada: document.getElementById('tituloTablaAgrupada'),
    thPeriodoAgrupado: document.getElementById('thPeriodoAgrupado'),
    agrupadaTableBody: document.getElementById('agrupadaTableBody'),
    agrupadaTableFoot: document.getElementById('agrupadaTableFoot'),
    tablaDetalleAuditoria: document.getElementById('tablaDetalleAuditoria'),
    auditoriaDetalleTableBody: document.getElementById('auditoriaDetalleTableBody'),
    auditoriaSummaryText: document.getElementById('auditoriaSummaryText'),

    // Selectores de Sucursal Activa
    globalLocalSelect: document.getElementById('globalLocalSelect'),
    formVentaLocalSelect: document.getElementById('formVentaLocalSelect'),
    formEntradaLocalSelect: document.getElementById('formEntradaLocalSelect'),
    navBadgePendientes: document.getElementById('navBadgePendientes'),

    // KPIs del Dashboard
    kpiTotalStock: document.getElementById('kpiTotalStock'),
    kpiDesgloseStock: document.getElementById('kpiDesgloseStock'),
    kpiPendientesRetiro: document.getElementById('kpiPendientesRetiro'),
    kpiBajoStock: document.getElementById('kpiBajoStock'),
    kpiTotalVentas: document.getElementById('kpiTotalVentas'),
    kpiVentasCruzadasSubtext: document.getElementById('kpiVentasCruzadasSubtext'),
    dashboardTimestamp: document.getElementById('dashboardTimestamp'),
    topVentasList: document.getElementById('topVentasList'),
    alertasStockList: document.getElementById('alertasStockList'),

    // Módulo de Seguimiento de Retiros (Venta Fraccionada)
    tablaSeguimiento: document.getElementById('tablaSeguimiento'),
    seguimientoTableBody: document.getElementById('seguimientoTableBody'),
    btnRefreshSeguimiento: document.getElementById('btnRefreshSeguimiento'),
    countSeguimientoTodos: document.getElementById('countSeguimientoTodos'),
    countSeguimientoPendientes: document.getElementById('countSeguimientoPendientes'),
    countSeguimientoEntregados: document.getElementById('countSeguimientoEntregados'),
    countSeguimientoCruzadas: document.getElementById('countSeguimientoCruzadas'),
    seguimientoSummaryText: document.getElementById('seguimientoSummaryText'),
    filtroLocalRetiroSelect: document.getElementById('filtroLocalRetiro'),

    // Módulo de Inventario
    tablaInventario: document.getElementById('tablaInventario'),
    inventarioTableBody: document.getElementById('inventarioTableBody'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    countTodos: document.getElementById('countTodos'),
    countAlerta: document.getElementById('countAlerta'),
    countOptimo: document.getElementById('countOptimo'),
    tableSummaryText: document.getElementById('tableSummaryText'),
    btnRefreshTable: document.getElementById('btnRefreshTable'),

    // Alerta visual de Venta Fraccionada
    ventaFraccionadaBanner: document.getElementById('ventaFraccionadaBanner'),
    fraccionadaBannerText: document.getElementById('fraccionadaBannerText'),
    btnCloseFraccionadaBanner: document.getElementById('btnCloseFraccionadaBanner'),

    // Formulario de Venta
    formVenta: document.getElementById('formVenta'),
    ventaCliente: document.getElementById('ventaCliente'),
    ventaProductoSelect: document.getElementById('ventaProductoSelect'),
    ventaCantidad: document.getElementById('ventaCantidad'),
    ventaObservacion: document.getElementById('ventaObservacion'),
    btnSubmitVenta: document.getElementById('btnSubmitVenta'),
    ventaStockHelper: document.getElementById('ventaStockHelper'),
    helperNombreLocalActual: document.getElementById('helperNombreLocalActual'),
    helperStockLocalActual: document.getElementById('helperStockLocalActual'),
    helperNombreLocalOtro: document.getElementById('helperNombreLocalOtro'),
    helperStockLocalOtro: document.getElementById('helperStockLocalOtro'),
    ventaLiveDiagnosis: document.getElementById('ventaLiveDiagnosis'),

    // Formulario de Entrada
    formEntrada: document.getElementById('formEntrada'),
    entradaProductoSelect: document.getElementById('entradaProductoSelect'),
    entradaCantidad: document.getElementById('entradaCantidad'),
    entradaObservacion: document.getElementById('entradaObservacion'),
    btnSubmitEntrada: document.getElementById('btnSubmitEntrada'),
    entradaStockHelper: document.getElementById('entradaStockHelper'),
    entradaStockActual: document.getElementById('entradaStockActual'),
    entradaDeficitHelper: document.getElementById('entradaDeficitHelper'),

    // Historial y Auditoría
    movimientosTableBody: document.getElementById('movimientosTableBody'),
    movimientosSummaryText: document.getElementById('movimientosSummaryText'),
    btnRefreshMovimientos: document.getElementById('btnRefreshMovimientos'),

    // Utilidades
    navLinks: document.querySelectorAll('.nav-link'),
    btnReiniciar: document.getElementById('btnReiniciar'),
    modalConfirmReset: document.getElementById('modalConfirmReset'),
    btnCancelReset: document.getElementById('btnCancelReset'),
    btnCancelResetX: document.getElementById('btnCancelResetX'),
    btnConfirmReset: document.getElementById('btnConfirmReset'),
    toastContainer: document.getElementById('toastContainer')
  };

  // ===========================================================================
  // GESTIÓN DEL LOCAL OPERATIVO
  // ===========================================================================

  function setLocalOperativo(nuevoLocal) {
    state.localOperativo = nuevoLocal;
    dom.globalLocalSelect.value = nuevoLocal;
    dom.formVentaLocalSelect.value = nuevoLocal;
    dom.formEntradaLocalSelect.value = nuevoLocal;
    actualizarHelperVenta();
    actualizarHelperEntrada();
  }

  dom.globalLocalSelect.addEventListener('change', (e) => {
    setLocalOperativo(e.target.value);
    mostrarToast('Local Actualizado', `Operando ahora desde: ${state.locales[state.localOperativo]}`, 'info', 2500);
  });

  dom.formVentaLocalSelect.addEventListener('change', (e) => {
    setLocalOperativo(e.target.value);
  });

  dom.formEntradaLocalSelect.addEventListener('change', () => {
    actualizarHelperEntrada();
  });

  if (dom.btnCloseFraccionadaBanner) {
    dom.btnCloseFraccionadaBanner.addEventListener('click', () => {
      dom.ventaFraccionadaBanner.style.display = 'none';
    });
  }

  // ===========================================================================
  // COMUNICACIÓN CON EL BACKEND (FETCH API)
  // ===========================================================================

  async function cargarDatosCompletos() {
    try {
      await Promise.all([
        obtenerProductos(),
        obtenerSeguimiento(),
        obtenerReportes(),
        obtenerMovimientos(),
        obtenerAuditoriaVentas()
      ]);
      actualizarHoraDashboard();
    } catch (error) {
      console.error('Error al sincronizar datos:', error);
      mostrarToast('Error de Red', 'Fallo al conectar con el servidor Flask.', 'danger');
    }
  }

  async function obtenerAuditoriaVentas() {
    try {
      const params = new URLSearchParams({
        sucursal: state.filtroAuditoriaSucursal,
        agrupacion: state.agrupacionAuditoria,
        fecha: state.filtroAuditoriaFecha,
        busqueda: state.filtroAuditoriaBusqueda
      });
      const resp = await fetch(`/api/auditoria/ventas?${params.toString()}`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (data.success) {
        state.auditoria = data;
        renderAuditoriaVentas(data);
      }
    } catch (err) {
      console.error('Error al obtener auditoría de ventas:', err);
    }
  }

  function renderAuditoriaVentas(aud) {
    if (!aud || !aud.resumen) return;

    const res = aud.resumen;
    const proy = aud.proyecciones || {};

    // 1. Tarjetas KPI
    dom.kpiAuditoriaSucursal1.textContent = `${res.principal.unidades_vendidas} uds`;
    dom.kpiAuditoriaSucursal1Sub.textContent = `${res.principal.porcentaje}% del total | ${res.principal.numero_ordenes} órdenes`;

    dom.kpiAuditoriaSucursal2.textContent = `${res.secundaria.unidades_vendidas} uds`;
    dom.kpiAuditoriaSucursal2Sub.textContent = `${res.secundaria.porcentaje}% del total | ${res.secundaria.numero_ordenes} órdenes`;

    dom.kpiAuditoriaTotal.textContent = `${res.total_uds_global} uds`;
    dom.kpiAuditoriaTotalSub.textContent = `${res.total_ordenes_global} transacciones en red comercial`;

    dom.kpiAuditoriaProyeccion.textContent = `${proy.proyeccion_mes_global || 0} uds`;
    dom.kpiAuditoriaProyeccionSub.textContent = `Ritmo: ${proy.promedio_diario_global || 0} uds/día (~30 días)`;

    // 2. Proyecciones Gerenciales y Comparativa
    dom.projRitmoDiario.textContent = proy.promedio_diario_global || '0.0';
    dom.projMesPrincipal.textContent = proy.proyeccion_mes_principal || 0;
    dom.projRitmoPrincipal.textContent = `Ritmo: ${proy.promedio_diario_principal || 0} uds/día`;
    dom.projMesSecundaria.textContent = proy.proyeccion_mes_secundaria || 0;
    dom.projRitmoSecundaria.textContent = `Ritmo: ${proy.promedio_diario_secundaria || 0} uds/día`;
    dom.projDiasCobertura.textContent = proy.cobertura_stock_dias || '0.0';
    dom.projAlertaStock.textContent = proy.alerta_gerencial || 'Inventario en seguimiento.';

    // Barra de Proporción entre Sucursales
    dom.labelSharePrincipal.textContent = `🏢 Sucursal Principal: ${res.principal.unidades_vendidas} uds (${res.principal.porcentaje}%)`;
    dom.labelShareSecundaria.textContent = `🏬 Sucursal Secundaria: ${res.secundaria.unidades_vendidas} uds (${res.secundaria.porcentaje}%)`;
    dom.barSharePrincipal.style.width = `${res.principal.porcentaje}%`;
    dom.barShareSecundaria.style.width = `${res.secundaria.porcentaje}%`;

    // 3. Tabla Agrupada (Por Día / Mes / Año)
    const agrup = state.agrupacionAuditoria;
    let listaAgrupada = [];
    if (agrup === 'dia') {
      listaAgrupada = aud.agrupaciones.por_dia || [];
      dom.tituloTablaAgrupada.textContent = 'Ventas Diarias (Sucursal Principal vs Sucursal Secundaria)';
      dom.thPeriodoAgrupado.textContent = 'Fecha (Día)';
    } else if (agrup === 'mes') {
      listaAgrupada = aud.agrupaciones.por_mes || [];
      dom.tituloTablaAgrupada.textContent = 'Ventas Mensuales Consolidadas por Sucursal';
      dom.thPeriodoAgrupado.textContent = 'Mes (Año-Mes)';
    } else {
      listaAgrupada = aud.agrupaciones.por_ano || [];
      dom.tituloTablaAgrupada.textContent = 'Ventas Anuales Totales por Sucursal';
      dom.thPeriodoAgrupado.textContent = 'Año Fiscal';
    }

    if (listaAgrupada.length === 0) {
      dom.agrupadaTableBody.innerHTML = `
        <tr><td colspan="7" class="text-center py-4 text-muted">No se registraron ventas en el periodo seleccionado.</td></tr>
      `;
      dom.agrupadaTableFoot.innerHTML = '';
    } else {
      let htmlRows = '';
      let sumP = 0, sumS = 0, sumT = 0, sumO = 0;

      listaAgrupada.forEach(item => {
        sumP += item.principal;
        sumS += item.secundaria;
        sumT += item.total;
        sumO += item.ordenes;

        const lider = item.principal > item.secundaria
          ? '<span class="badge-branch-tag tag-principal">🏢 Principal</span>'
          : (item.secundaria > item.principal
            ? '<span class="badge-branch-tag tag-secundaria">🏬 Secundaria</span>'
            : '<span class="badge-status">⚖️ Empate</span>');

        const pctP = item.total > 0 ? Math.round((item.principal / item.total) * 100) : 0;
        const pctS = item.total > 0 ? 100 - pctP : 0;

        htmlRows += `
          <tr>
            <td class="font-mono font-bold">${escapeHTML(item.periodo)}</td>
            <td class="text-center font-mono font-bold text-principal">${item.principal}</td>
            <td class="text-center font-mono font-bold text-secundaria">${item.secundaria}</td>
            <td class="text-center font-mono font-bold" style="font-size: 1.05rem;">${item.total}</td>
            <td class="text-center font-mono">${item.ordenes}</td>
            <td class="text-center">${lider}</td>
            <td class="text-center font-mono" style="font-size: 0.78rem;">
              <span class="text-principal">${pctP}%</span> / <span class="text-secundaria">${pctS}%</span>
            </td>
          </tr>
        `;
      });

      dom.agrupadaTableBody.innerHTML = htmlRows;
      dom.agrupadaTableFoot.innerHTML = `
        <tr style="background: #f1f5f9; font-weight: 800; border-top: 2px solid var(--border-color-dark);">
          <td>TOTAL GENERAL</td>
          <td class="text-center font-mono text-principal">${sumP} uds</td>
          <td class="text-center font-mono text-secundaria">${sumS} uds</td>
          <td class="text-center font-mono" style="font-size: 1.1rem; color: var(--color-primary);">${sumT} uds</td>
          <td class="text-center font-mono">${sumO} ops</td>
          <td class="text-center">${sumP >= sumS ? '🏢 Principal' : '🏬 Secundaria'}</td>
          <td class="text-center">100%</td>
        </tr>
      `;
    }

    // 4. Tabla Detallada Transaccional
    const auditadas = aud.ventas_auditadas || [];
    dom.auditoriaSummaryText.textContent = `Mostrando ${auditadas.length} venta(s) auditada(s)`;

    if (auditadas.length === 0) {
      dom.auditoriaDetalleTableBody.innerHTML = `
        <tr><td colspan="9" class="text-center py-4 text-muted">No se encontraron ventas con los filtros aplicados.</td></tr>
      `;
    } else {
      let htmlDetalle = '';
      auditadas.forEach(v => {
        const esFracc = v.Tipo_Venta === 'Fraccionada';
        const esPend = v.Estado_Global === 'Pendiente de retiro parcial';
        const esPrinc = (v.Local_Venta || '').toLowerCase().includes('principal');

        const branchTag = esPrinc
          ? '<span class="badge-branch-tag tag-principal">🏢 Sucursal Principal</span>'
          : '<span class="badge-branch-tag tag-secundaria">🏬 Sucursal Secundaria</span>';

        const modalBadge = esFracc
          ? '<span class="badge-tipo-fraccionada">🔄 Fraccionada</span>'
          : '<span class="badge-tipo-normal">✓ Normal</span>';

        const estadoBadge = esPend
          ? '<span class="badge-status-pending">⏳ Retiro pendiente</span>'
          : '<span class="badge-status-delivered">✓ Completado</span>';

        const detalle = v.Detalle_Entrega || {
          entregadas_momento: v.Cantidad_Total || 0,
          pendientes_retiro: 0,
          local_retiro: v.Local_Venta
        };

        const detalleTexto = detalle.pendientes_retiro > 0
          ? `<span class="detail-line-pending">${detalle.entregadas_momento} en mano / ${detalle.pendientes_retiro} en ${escapeHTML(detalle.local_retiro)}</span>`
          : `<span class="detail-line-now">${detalle.entregadas_momento} uds. 100% entregado</span>`;

        htmlDetalle += `
          <tr>
            <td><span class="code-pill">${escapeHTML(v.ID_Orden || 'ORD-0000')}</span></td>
            <td class="font-mono text-muted" style="font-size: 0.78rem;">${escapeHTML(v.Fecha || '')}</td>
            <td>${branchTag}</td>
            <td><strong>${escapeHTML(v.Cliente || 'Cliente Mostrador')}</strong></td>
            <td>${escapeHTML(v.Producto || 'Producto')}</td>
            <td class="text-center font-mono font-bold" style="font-size: 1rem;">${v.Cantidad_Total || 0}</td>
            <td style="font-size: 0.82rem;">${detalleTexto}</td>
            <td class="text-center">${modalBadge}</td>
            <td class="text-center">${estadoBadge}</td>
          </tr>
        `;
      });
      dom.auditoriaDetalleTableBody.innerHTML = htmlDetalle;
    }
  }

  async function obtenerProductos() {
    const resp = await fetch('/api/productos');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.success) {
      state.productos = data.data;
      if (data.locales) state.locales = data.locales;
      renderTablaInventario();
      poblarSelectsProductos();
    }
  }

  async function obtenerSeguimiento() {
    const resp = await fetch('/api/seguimiento');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.success) {
      state.seguimiento = data.data;
      renderTablaSeguimiento();
      actualizarContadoresSeguimiento();
    }
  }

  async function obtenerReportes() {
    const resp = await fetch('/api/reportes');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.success) {
      state.reportes = data.data;
      renderDashboard(data.data);
    }
  }

  async function obtenerMovimientos() {
    const resp = await fetch('/api/movimientos');
    if (!resp.ok) return;
    const data = await resp.json();
    if (data.success) {
      state.movimientos = data.data;
      renderTablaMovimientos();
    }
  }

  async function registrarVentaAPI(payload) {
    const resp = await fetch('/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    return { status: resp.status, ok: resp.ok, data };
  }

  async function confirmarRetiroSaldoAPI(idOrden) {
    const resp = await fetch(`/api/seguimiento/${encodeURIComponent(idOrden)}/confirmar-retiro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await resp.json();
    return { status: resp.status, ok: resp.ok, data };
  }

  // ===========================================================================
  // RENDERIZADO DEL DASHBOARD (REPORTE GERENCIAL)
  // ===========================================================================

  function renderDashboard(rep) {
    if (!rep) return;

    dom.kpiTotalStock.textContent = Number(rep.total_unidades_stock).toLocaleString('es-ES');
    dom.kpiDesgloseStock.textContent = `Principal: ${rep.stock_principal} | Secundaria: ${rep.stock_secundaria}`;
    dom.kpiPendientesRetiro.textContent = rep.pendientes_retiro || 0;
    dom.kpiBajoStock.textContent = rep.cantidad_bajo_stock;
    dom.kpiTotalVentas.textContent = Number(rep.total_ventas_mes).toLocaleString('es-ES');
    dom.kpiVentasCruzadasSubtext.textContent = `${rep.ventas_fraccionadas_total || 0} venta(s) fraccionada(s)`;

    // Indicador numérico en el botón superior
    const pendientes = rep.pendientes_retiro || 0;
    if (pendientes > 0) {
      dom.navBadgePendientes.textContent = pendientes;
      dom.navBadgePendientes.style.display = 'inline-block';
    } else {
      dom.navBadgePendientes.style.display = 'none';
    }

    renderTopVentas(rep.top_ventas);
    renderAlertasStock(rep.productos_bajo_stock);
  }

  function renderTopVentas(top) {
    if (!top || top.length === 0) {
      dom.topVentasList.innerHTML = '<div class="loading-placeholder">Sin ventas en el periodo.</div>';
      return;
    }

    const maxVentas = Math.max(...top.map(p => p.ventas_mes), 1);
    const medallas = ['🥇', '🥈', '🥉'];
    const clasesRank = ['rank-1', 'rank-2', 'rank-3'];

    let html = '';
    top.forEach((prod, i) => {
      const porcentaje = Math.round((prod.ventas_mes / maxVentas) * 100);
      const medalla = medallas[i] || `#${i + 1}`;
      const rankClass = clasesRank[i] || 'rank-3';

      html += `
        <div class="top-item-card">
          <div class="top-rank-badge ${rankClass}">${medalla}</div>
          <div class="top-info">
            <div class="top-title-row">
              <span class="top-name">${escapeHTML(prod.nombre)}</span>
              <span class="top-code">${escapeHTML(prod.codigo)}</span>
            </div>
            <div class="top-bar-bg">
              <div class="top-bar-fill" style="width: ${porcentaje}%;"></div>
            </div>
          </div>
          <div class="top-sales-metric">
            ${prod.ventas_mes}
            <span>unidades</span>
          </div>
        </div>
      `;
    });

    dom.topVentasList.innerHTML = html;
  }

  function renderAlertasStock(criticos) {
    if (!criticos || criticos.length === 0) {
      dom.alertasStockList.innerHTML = `
        <div class="no-alerts-state">
          <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">🎉</div>
          <strong>¡Niveles de inventario óptimos!</strong>
          <p style="font-size: 0.8rem; margin-top: 0.2rem;">El stock global consolidado supera el stock mínimo en todas las referencias.</p>
        </div>
      `;
      return;
    }

    let html = '';
    criticos.forEach(prod => {
      const faltante = prod.faltante;
      const textoDeficit = faltante > 0 ? `Faltan ${faltante} uds.` : `En el límite (0)`;

      html += `
        <div class="alerta-item-card">
          <div class="alerta-info-wrap">
            <div class="alerta-icon">⚠️</div>
            <div>
              <div class="alerta-title">
                ${escapeHTML(prod.nombre)} <span class="top-code">${escapeHTML(prod.codigo)}</span>
              </div>
              <div class="alerta-levels">
                Stock Total: <strong>${prod.stock_total}</strong> (Principal: ${prod.stock_principal}, Secundaria: ${prod.stock_secundaria}) | Mínimo: <strong>${prod.stock_minimo}</strong>
              </div>
            </div>
          </div>
          <div class="alerta-badge-group">
            <span class="badge-deficit">${textoDeficit}</span>
          </div>
        </div>
      `;
    });

    dom.alertasStockList.innerHTML = html;
  }

  function actualizarHoraDashboard() {
    const ahora = new Date();
    dom.dashboardTimestamp.textContent = ahora.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // ===========================================================================
  // MÓDULO DE SEGUIMIENTO DE RETIROS (VENTA CRUZADA FRACCIONADA)
  // ===========================================================================

  function renderTablaSeguimiento() {
    if (!state.seguimiento || state.seguimiento.length === 0) {
      dom.seguimientoTableBody.innerHTML = `
        <tr><td colspan="11" class="text-center py-4 text-muted">Aún no hay ventas en seguimiento_ventas.json.</td></tr>
      `;
      dom.seguimientoSummaryText.textContent = 'Mostrando 0 órdenes';
      return;
    }

    const filtroEstado = state.filtroSeguimiento;
    const filtroLocal = state.filtroLocalRetiro;

    const filtrados = state.seguimiento.filter(o => {
      if (filtroEstado === 'pendiente' && o.Estado_Global !== 'Pendiente de retiro parcial') return false;
      if (filtroEstado === 'completado' && o.Estado_Global !== 'Completado') return false;
      if (filtroEstado === 'fraccionada' && o.Tipo_Venta !== 'Fraccionada') return false;

      // Filtro por local de retiro del saldo
      if (filtroLocal !== 'todos' && o.Detalle_Entrega && o.Detalle_Entrega.local_retiro !== filtroLocal) return false;

      return true;
    });

    dom.seguimientoSummaryText.textContent = `Mostrando ${filtrados.length} de ${state.seguimiento.length} órdenes`;

    if (filtrados.length === 0) {
      dom.seguimientoTableBody.innerHTML = `
        <tr><td colspan="11" class="text-center py-4 text-muted">No hay órdenes que coincidan con los filtros aplicados.</td></tr>
      `;
      return;
    }

    let html = '';
    filtrados.forEach(orden => {
      const esPendiente = orden.Estado_Global === 'Pendiente de retiro parcial';
      const esFraccionada = orden.Tipo_Venta === 'Fraccionada';

      // Resaltado visual en fila para ventas con retiro parcial pendiente
      const rowClass = esPendiente ? 'row-pending-pickup' : '';

      const tipoBadge = esFraccionada
        ? `<span class="badge-tipo-fraccionada">🔄 Fraccionada</span>`
        : `<span class="badge-tipo-normal">✓ Normal</span>`;

      const estadoBadge = esPendiente
        ? `<span class="badge-status-pending">⏳ Pendiente retiro parcial</span>`
        : `<span class="badge-status-delivered">✓ Completado</span>`;

      const detalle = orden.Detalle_Entrega || {
        entregadas_momento: orden.Cantidad_Total || 0,
        pendientes_retiro: 0,
        local_retiro: orden.Local_Venta
      };

      const detalleHTML = `
        <div class="delivery-detail-box">
          <span class="detail-line-now">✓ En mano: <strong>${detalle.entregadas_momento}</strong> uds.</span>
          ${detalle.pendientes_retiro > 0 
            ? `<span class="detail-line-pending">⏳ Por retirar: <strong>${detalle.pendientes_retiro}</strong> uds.</span>` 
            : `<span class="text-muted" style="font-size: 0.75rem;">100% entregado</span>`
          }
        </div>
      `;

      // Botón "Confirmar Retiro de Saldo" exclusivo para pedidos pendientes
      let accionCell = '';
      if (esPendiente) {
        accionCell = `
          <button class="btn-confirm-pickup" data-id="${escapeHTML(orden.ID_Orden)}" title="Confirmar que el cliente retiró las unidades pendientes">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Confirmar Retiro de Saldo</span>
          </button>
        `;
      } else {
        accionCell = `
          <span class="badge-retirado-done">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Saldo Entregado</span>
          </span>
        `;
      }

      html += `
        <tr class="${rowClass}">
          <td><span class="code-pill">${escapeHTML(orden.ID_Orden)}</span></td>
          <td class="font-mono text-muted" style="font-size: 0.78rem;">${escapeHTML(orden.Fecha)}</td>
          <td><strong>${escapeHTML(orden.Cliente || 'Cliente Mostrador')}</strong></td>
          <td>${escapeHTML(orden.Producto)}</td>
          <td class="text-center font-mono font-bold" style="font-size: 1rem;">${orden.Cantidad_Total}</td>
          <td><span class="text-muted">${escapeHTML(orden.Local_Venta)}</span></td>
          <td>${detalleHTML}</td>
          <td><strong style="color: #0f172a;">${escapeHTML(detalle.local_retiro)}</strong></td>
          <td class="text-center">${tipoBadge}</td>
          <td class="text-center">${estadoBadge}</td>
          <td class="text-center">${accionCell}</td>
        </tr>
      `;
    });

    dom.seguimientoTableBody.innerHTML = html;

    // Vincular botones "Confirmar Retiro de Saldo"
    dom.seguimientoTableBody.querySelectorAll('.btn-confirm-pickup').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idOrden = e.currentTarget.getAttribute('data-id');
        await procesarConfirmacionRetiroSaldo(idOrden, e.currentTarget);
      });
    });
  }

  function actualizarContadoresSeguimiento() {
    const total = state.seguimiento.length;
    const pendientes = state.seguimiento.filter(o => o.Estado_Global === 'Pendiente de retiro parcial').length;
    const completadas = state.seguimiento.filter(o => o.Estado_Global === 'Completado').length;
    const fraccionadas = state.seguimiento.filter(o => o.Tipo_Venta === 'Fraccionada').length;

    dom.countSeguimientoTodos.textContent = total;
    dom.countSeguimientoPendientes.textContent = pendientes;
    dom.countSeguimientoEntregados.textContent = completadas;
    dom.countSeguimientoCruzadas.textContent = fraccionadas;
  }

  async function procesarConfirmacionRetiroSaldo(idOrden, btnElement) {
    if (!idOrden) return;

    btnElement.disabled = true;
    btnElement.innerHTML = `<span>Confirmando...</span>`;

    try {
      const res = await confirmarRetiroSaldoAPI(idOrden);
      if (res.ok && res.data.success) {
        mostrarToast('¡Retiro de Saldo Confirmado!', res.data.message, 'success', 5500);
        await Promise.all([
          obtenerSeguimiento(),
          obtenerReportes()
        ]);
      } else {
        mostrarToast('Error al Confirmar', res.data.message || 'No se pudo actualizar.', 'danger');
        btnElement.disabled = false;
        btnElement.innerHTML = `<span>Confirmar Retiro de Saldo</span>`;
      }
    } catch (err) {
      console.error('Error al confirmar saldo:', err);
      mostrarToast('Error de Servidor', 'Fallo de comunicación.', 'danger');
      btnElement.disabled = false;
    }
  }

  // Filtros de la tabla de seguimiento
  document.querySelectorAll('[data-filter-seguimiento]').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('[data-filter-seguimiento]').forEach(c => c.classList.remove('active'));
      e.currentTarget.classList.add('active');
      state.filtroSeguimiento = e.currentTarget.getAttribute('data-filter-seguimiento');
      renderTablaSeguimiento();
    });
  });

  dom.filtroLocalRetiroSelect.addEventListener('change', (e) => {
    state.filtroLocalRetiro = e.target.value;
    renderTablaSeguimiento();
  });

  dom.btnRefreshSeguimiento.addEventListener('click', async () => {
    await obtenerSeguimiento();
    await obtenerReportes();
    mostrarToast('Seguimiento Actualizado', 'Registros sincronizados con seguimiento_ventas.json.', 'success', 2500);
  });

  // ===========================================================================
  // MÓDULO DE INVENTARIO: CATÁLOGO CON DESGLOSE POR SUCURSAL
  // ===========================================================================

  function renderTablaInventario() {
    if (!state.productos || state.productos.length === 0) {
      dom.inventarioTableBody.innerHTML = `
        <tr><td colspan="10" class="text-center py-4 text-muted">No hay productos en inventario.</td></tr>
      `;
      return;
    }

    const texto = state.busquedaInventario.trim().toLowerCase();
    const filtrados = state.productos.filter(p => {
      const match = !texto || p.codigo.toLowerCase().includes(texto) || p.nombre.toLowerCase().includes(texto);
      if (!match) return false;

      const bajoMinimo = p.stock_total <= p.stock_minimo;
      if (state.filtroInventario === 'alerta') return bajoMinimo;
      if (state.filtroInventario === 'optimo') return !bajoMinimo;
      return true;
    });

    const totalBajo = state.productos.filter(p => p.stock_total <= p.stock_minimo).length;
    dom.countTodos.textContent = state.productos.length;
    dom.countAlerta.textContent = totalBajo;
    dom.countOptimo.textContent = state.productos.length - totalBajo;
    dom.tableSummaryText.textContent = `Mostrando ${filtrados.length} de ${state.productos.length} productos`;

    if (filtrados.length === 0) {
      dom.inventarioTableBody.innerHTML = `
        <tr><td colspan="10" class="text-center py-4 text-muted">No se encontraron productos coincidentes.</td></tr>
      `;
      return;
    }

    let html = '';
    filtrados.forEach(prod => {
      const estaBajo = prod.stock_total <= prod.stock_minimo;
      const faltante = Math.max(0, prod.stock_minimo - prod.stock_total);

      const rowClass = estaBajo ? 'row-alert-replenish' : '';
      const totalClass = estaBajo ? 'stock-value-cell stock-danger' : 'stock-value-cell stock-ok';

      const alertaBadge = estaBajo
        ? `<span class="badge-status badge-alert">⚠️ Reponer (${faltante})</span>`
        : `<span class="badge-status badge-optimal">✓ Óptimo</span>`;

      const faltanteBadge = estaBajo
        ? `<span class="badge-missing has-deficit">Faltan ${faltante} uds.</span>`
        : `<span class="badge-missing no-deficit">Cubierto (0)</span>`;

      html += `
        <tr class="${rowClass}">
          <td><span class="code-pill">${escapeHTML(prod.codigo)}</span></td>
          <td><strong>${escapeHTML(prod.nombre)}</strong></td>
          <td class="text-center font-mono font-bold">${prod.stock_principal}</td>
          <td class="text-center font-mono font-bold">${prod.stock_secundaria}</td>
          <td class="text-center ${totalClass}">${prod.stock_total}</td>
          <td class="text-center font-mono">${prod.stock_minimo}</td>
          <td class="text-center font-mono font-bold">${prod.ventas_mes}</td>
          <td class="text-center">${alertaBadge}</td>
          <td class="text-center">${faltanteBadge}</td>
          <td class="text-center">
            <div class="quick-action-btns">
              <button class="btn-mini btn-mini-sale" data-action="vender" data-codigo="${escapeHTML(prod.codigo)}">
                Vender
              </button>
              <button class="btn-mini btn-mini-entry" data-action="ingresar" data-codigo="${escapeHTML(prod.codigo)}">
                Ingresar
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    dom.inventarioTableBody.innerHTML = html;

    dom.inventarioTableBody.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const accion = e.currentTarget.getAttribute('data-action');
        const codigo = e.currentTarget.getAttribute('data-codigo');
        if (accion === 'vender') prepararVenta(codigo);
        if (accion === 'ingresar') prepararIngreso(codigo);
      });
    });
  }

  dom.searchInput.addEventListener('input', (e) => {
    state.busquedaInventario = e.target.value;
    dom.clearSearchBtn.style.display = state.busquedaInventario ? 'block' : 'none';
    renderTablaInventario();
  });

  dom.clearSearchBtn.addEventListener('click', () => {
    dom.searchInput.value = '';
    state.busquedaInventario = '';
    dom.clearSearchBtn.style.display = 'none';
    renderTablaInventario();
  });

  document.querySelectorAll('[data-filter]').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('[data-filter]').forEach(c => c.classList.remove('active'));
      e.currentTarget.classList.add('active');
      state.filtroInventario = e.currentTarget.getAttribute('data-filter');
      renderTablaInventario();
    });
  });

  dom.btnRefreshTable.addEventListener('click', async () => {
    await obtenerProductos();
    await obtenerReportes();
    mostrarToast('Inventario Actualizado', 'Existencias sincronizadas.', 'success', 2500);
  });

  // ===========================================================================
  // SELECTS Y DIAGNÓSTICO EN VIVO DE VENTA FRACCIONADA
  // ===========================================================================

  function poblarSelectsProductos() {
    const valVenta = dom.ventaProductoSelect.value;
    const valEntrada = dom.entradaProductoSelect.value;

    const placeholder = '<option value="" disabled selected>-- Selecciona un producto --</option>';
    let options = placeholder;

    state.productos.forEach(p => {
      options += `<option value="${escapeHTML(p.codigo)}">${escapeHTML(p.codigo)} - ${escapeHTML(p.nombre)} (Stock Total: ${p.stock_total})</option>`;
    });

    dom.ventaProductoSelect.innerHTML = options;
    dom.entradaProductoSelect.innerHTML = options;

    if (valVenta && state.productos.some(p => p.codigo === valVenta)) {
      dom.ventaProductoSelect.value = valVenta;
      actualizarHelperVenta();
    } else {
      dom.ventaStockHelper.style.display = 'none';
      dom.ventaLiveDiagnosis.style.display = 'none';
    }

    if (valEntrada && state.productos.some(p => p.codigo === valEntrada)) {
      dom.entradaProductoSelect.value = valEntrada;
      actualizarHelperEntrada();
    }
  }

  function actualizarHelperVenta() {
    const codigo = dom.ventaProductoSelect.value;
    const producto = state.productos.find(p => p.codigo === codigo);

    if (!producto) {
      dom.ventaStockHelper.style.display = 'none';
      dom.ventaLiveDiagnosis.style.display = 'none';
      return;
    }

    const localActual = state.localOperativo;
    const otroLocal = localActual === 'principal' ? 'secundaria' : 'principal';

    const stockLocal = producto.stock[localActual] || 0;
    const stockOtro = producto.stock[otroLocal] || 0;

    dom.helperNombreLocalActual.textContent = `Tu Local (${state.locales[localActual]}):`;
    dom.helperStockLocalActual.textContent = stockLocal;

    dom.helperNombreLocalOtro.textContent = `Otro Local (${state.locales[otroLocal]}):`;
    dom.helperStockLocalOtro.textContent = stockOtro;

    dom.ventaStockHelper.style.display = 'grid';
    diagnosticarVentaEnVivo();
  }

  function diagnosticarVentaEnVivo() {
    const codigo = dom.ventaProductoSelect.value;
    const cantidad = parseInt(dom.ventaCantidad.value, 10);
    const producto = state.productos.find(p => p.codigo === codigo);

    if (!producto || isNaN(cantidad) || cantidad <= 0) {
      dom.ventaLiveDiagnosis.style.display = 'none';
      return;
    }

    const localActual = state.localOperativo;
    const otroLocal = localActual === 'principal' ? 'secundaria' : 'principal';
    const nombreLocalActual = state.locales[localActual];
    const nombreOtroLocal = state.locales[otroLocal];

    const stockLocal = producto.stock[localActual] || 0;
    const stockOtro = producto.stock[otroLocal] || 0;
    const stockTotal = stockLocal + stockOtro;

    // Escenario 1: Venta Normal
    if (stockLocal >= cantidad) {
      dom.ventaLiveDiagnosis.className = 'live-diagnosis-box diag-normal';
      dom.ventaLiveDiagnosis.innerHTML = `
        <span>✓ <strong>ESCENARIO 1 (VENTA NORMAL)</strong>: Tu local tiene ${stockLocal} uds. suficientes. Se entregarán todas las ${cantidad} unidades de inmediato.</span>
      `;
      dom.ventaLiveDiagnosis.style.display = 'flex';
    } 
    // Escenario 2: Venta Fraccionada / Cruzada
    else if (stockTotal >= cantidad) {
      const aEntregarAhora = stockLocal;
      const aRetirarAlla = cantidad - stockLocal;

      dom.ventaLiveDiagnosis.className = 'live-diagnosis-box diag-cruzada';
      dom.ventaLiveDiagnosis.innerHTML = `
        <span>🔄 <strong>ESCENARIO 2 (VENTA FRACCIONADA)</strong>: Tu local solo tiene ${stockLocal} uds. Se entregarán <strong>${aEntregarAhora} unidades en mano</strong> y el cliente deberá retirar las <strong>${aRetirarAlla} unidades restantes en la ${nombreOtroLocal}</strong>.</span>
      `;
      dom.ventaLiveDiagnosis.style.display = 'flex';
    } 
    // Escenario 3: Stock Insuficiente
    else {
      dom.ventaLiveDiagnosis.className = 'live-diagnosis-box diag-error';
      dom.ventaLiveDiagnosis.innerHTML = `
        <span>❌ <strong>STOCK INSUFICIENTE</strong>: Se solicitan ${cantidad} uds., pero la suma combinada de ambos locales es solo ${stockTotal} uds. (${nombreLocalActual}: ${stockLocal}, ${nombreOtroLocal}: ${stockOtro}).</span>
      `;
      dom.ventaLiveDiagnosis.style.display = 'flex';
    }
  }

  function actualizarHelperEntrada() {
    const codigo = dom.entradaProductoSelect.value;
    const producto = state.productos.find(p => p.codigo === codigo);
    const localDestino = dom.formEntradaLocalSelect.value;

    if (!producto) {
      dom.entradaStockHelper.style.display = 'none';
      return;
    }

    const stockLocal = producto.stock[localDestino] || 0;
    dom.entradaStockActual.textContent = stockLocal;

    if (producto.stock_total <= producto.stock_minimo) {
      const faltante = producto.stock_minimo - producto.stock_total;
      dom.entradaDeficitHelper.textContent = ` | ⚠️ Déficit global: faltan ${faltante} uds.`;
      dom.entradaDeficitHelper.className = 'text-danger fw-bold';
    } else {
      dom.entradaDeficitHelper.textContent = ` | ✓ Stock global cubierto`;
      dom.entradaDeficitHelper.className = 'text-success fw-bold';
    }

    dom.entradaStockHelper.style.display = 'flex';
  }

  function prepararVenta(codigo) {
    scrollA('movimientos');
    dom.ventaProductoSelect.value = codigo;
    actualizarHelperVenta();
    dom.ventaCantidad.focus();
    dom.ventaCantidad.select();
  }

  function prepararIngreso(codigo) {
    scrollA('movimientos');
    dom.entradaProductoSelect.value = codigo;
    actualizarHelperEntrada();
    dom.entradaCantidad.value = 10;
    dom.entradaCantidad.focus();
    dom.entradaCantidad.select();
  }

  function scrollA(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  // ===========================================================================
  // FORMULARIO DE VENTAS CON ALERTA VISUAL FRACCIONADA
  // ===========================================================================

  dom.formVenta.addEventListener('submit', async (e) => {
    e.preventDefault();

    const localOperacion = dom.formVentaLocalSelect.value;
    const cliente = dom.ventaCliente.value.trim();
    const codigo = dom.ventaProductoSelect.value;
    const cantidad = parseInt(dom.ventaCantidad.value, 10);
    const observacion = dom.ventaObservacion.value.trim();

    if (!cliente) {
      mostrarToast('Validación', 'Por favor ingresa el nombre del cliente.', 'warning');
      dom.ventaCliente.focus();
      return;
    }

    if (!codigo) {
      mostrarToast('Validación', 'Selecciona el producto a vender.', 'warning');
      dom.ventaProductoSelect.focus();
      return;
    }

    if (isNaN(cantidad) || cantidad <= 0) {
      mostrarToast('Validación', 'Ingresa una cantidad mayor a cero.', 'warning');
      dom.ventaCantidad.focus();
      return;
    }

    dom.btnSubmitVenta.disabled = true;
    dom.btnSubmitVenta.innerHTML = `<span>Procesando...</span>`;

    try {
      const res = await registrarVentaAPI({
        tipo: 'Venta',
        codigo: codigo,
        cantidad: cantidad,
        cliente: cliente,
        local_operacion: localOperacion,
        observacion: observacion
      });

      if (res.ok && res.data.success) {
        // Alerta visual muy clara y detallada si ocurre venta fraccionada (Escenario 2)
        if (res.data.es_fraccionada) {
          const detalle = res.data.data.detalle;
          const textoAlerta = `Venta Exitosa. Entregue ${detalle.entregadas_momento} unidades en este momento. El cliente debe acercarse a ${detalle.local_retiro} a retirar las ${detalle.pendientes_retiro} unidades restantes.`;

          // Mostrar en tarjeta destacada fija arriba del formulario
          if (dom.ventaFraccionadaBanner) {
            dom.fraccionadaBannerText.textContent = textoAlerta;
            dom.ventaFraccionadaBanner.style.display = 'flex';
            dom.ventaFraccionadaBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }

          // Mostrar Toast destacado de alta prioridad
          mostrarToast(
            '🔄 VENTA FRACCIONADA REGISTRADA',
            textoAlerta,
            'warning',
            9000
          );
        } else {
          if (dom.ventaFraccionadaBanner) dom.ventaFraccionadaBanner.style.display = 'none';
          mostrarToast(
            '✅ VENTA NORMAL REGISTRADA',
            res.data.message,
            'success',
            5000
          );
        }

        dom.formVenta.reset();
        dom.formVentaLocalSelect.value = state.localOperativo;
        dom.ventaStockHelper.style.display = 'none';
        dom.ventaLiveDiagnosis.style.display = 'none';

        // Sincronizar todos los módulos
        await cargarDatosCompletos();
      } else {
        mostrarToast('Operación Rechazada', res.data.message || 'Error al procesar la venta.', 'danger', 7000);
      }
    } catch (err) {
      console.error('Error al enviar venta:', err);
      mostrarToast('Error de Servidor', 'Fallo al comunicar con Flask.', 'danger');
    } finally {
      dom.btnSubmitVenta.disabled = false;
      dom.btnSubmitVenta.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span>Procesar Venta</span>
      `;
    }
  });

  // Formulario de Entrada (Reabastecimiento)
  dom.formEntrada.addEventListener('submit', async (e) => {
    e.preventDefault();

    const localDestino = dom.formEntradaLocalSelect.value;
    const codigo = dom.entradaProductoSelect.value;
    const cantidad = parseInt(dom.entradaCantidad.value, 10);
    const observacion = dom.entradaObservacion.value.trim();

    if (!codigo || isNaN(cantidad) || cantidad <= 0) {
      mostrarToast('Validación', 'Selecciona el producto y una cantidad válida.', 'warning');
      return;
    }

    dom.btnSubmitEntrada.disabled = true;
    dom.btnSubmitEntrada.innerHTML = `<span>Ingresando...</span>`;

    try {
      const res = await registrarVentaAPI({
        tipo: 'Entrada',
        codigo: codigo,
        cantidad: cantidad,
        local_operacion: localDestino,
        observacion: observacion
      });

      if (res.ok && res.data.success) {
        mostrarToast('Ingreso Exitoso', res.data.message, 'success');
        dom.formEntrada.reset();
        dom.formEntradaLocalSelect.value = state.localOperativo;
        dom.entradaStockHelper.style.display = 'none';
        await cargarDatosCompletos();
      } else {
        mostrarToast('Error', res.data.message, 'danger');
      }
    } catch (err) {
      console.error(err);
      mostrarToast('Error', 'Fallo al ingresar mercadería.', 'danger');
    } finally {
      dom.btnSubmitEntrada.disabled = false;
      dom.btnSubmitEntrada.innerHTML = `<span>Ingresar a Inventario</span>`;
    }
  });

  dom.ventaProductoSelect.addEventListener('change', actualizarHelperVenta);
  dom.entradaProductoSelect.addEventListener('change', actualizarHelperEntrada);
  dom.ventaCantidad.addEventListener('input', diagnosticarVentaEnVivo);

  document.querySelectorAll('.btn-qty').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = e.currentTarget.getAttribute('data-target');
      const val = parseInt(e.currentTarget.getAttribute('data-val'), 10);
      const input = document.getElementById(targetId);
      if (input) {
        const cur = parseInt(input.value, 10) || 0;
        input.value = cur + val;
        input.dispatchEvent(new Event('input'));
      }
    });
  });

  // ===========================================================================
  // AUDITORÍA DE MOVIMIENTOS
  // ===========================================================================

  function renderTablaMovimientos() {
    if (!state.movimientos || state.movimientos.length === 0) {
      dom.movimientosTableBody.innerHTML = `
        <tr><td colspan="7" class="text-center py-4 text-muted">Sin movimientos registrados.</td></tr>
      `;
      return;
    }

    dom.movimientosSummaryText.textContent = `Total: ${state.movimientos.length} movimiento(s) registrado(s)`;

    let html = '';
    state.movimientos.forEach(mov => {
      const esVenta = mov.tipo.toLowerCase() === 'venta';
      const badgeClass = esVenta ? 'type-badge type-venta' : 'type-badge type-entrada';
      const prod = state.productos.find(p => p.codigo === mov.codigo_producto);
      const nombreProd = prod ? prod.nombre : 'Producto Registrado';

      html += `
        <tr>
          <td><span class="code-pill">${escapeHTML(mov.id)}</span></td>
          <td class="font-mono text-muted" style="font-size: 0.8rem;">${escapeHTML(mov.fecha)}</td>
          <td class="text-center"><span class="${badgeClass}">${esVenta ? '🛒 Venta' : '📥 Entrada'}</span></td>
          <td><span class="code-pill">${escapeHTML(mov.codigo_producto)}</span></td>
          <td><strong>${escapeHTML(nombreProd)}</strong></td>
          <td class="text-center font-mono font-bold">${mov.cantidad}</td>
          <td class="text-muted">${escapeHTML(mov.observacion || '-')}</td>
        </tr>
      `;
    });

    dom.movimientosTableBody.innerHTML = html;
  }

  dom.btnRefreshMovimientos.addEventListener('click', async () => {
    await obtenerMovimientos();
    mostrarToast('Auditoría Sincronizada', 'Historial cargado.', 'success', 2500);
  });

  // ===========================================================================
  // MODAL DE REINICIO
  // ===========================================================================

  dom.btnReiniciar.addEventListener('click', () => {
    dom.modalConfirmReset.style.display = 'flex';
  });

  const cerrarModal = () => {
    dom.modalConfirmReset.style.display = 'none';
  };

  dom.btnCancelReset.addEventListener('click', cerrarModal);
  dom.btnCancelResetX.addEventListener('click', cerrarModal);
  dom.modalConfirmReset.addEventListener('click', (e) => {
    if (e.target === dom.modalConfirmReset) cerrarModal();
  });

  dom.btnConfirmReset.addEventListener('click', async () => {
    cerrarModal();
    try {
      const resp = await fetch('/api/reiniciar', { method: 'POST' });
      const data = await resp.json();
      if (data.success) {
        mostrarToast('Datos Reiniciados', data.message, 'success');
        if (dom.ventaFraccionadaBanner) dom.ventaFraccionadaBanner.style.display = 'none';
        await cargarDatosCompletos();
      }
    } catch (err) {
      console.error(err);
      mostrarToast('Error', 'No se pudieron reiniciar los datos.', 'danger');
    }
  });

  // Navegación
  dom.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      dom.navLinks.forEach(l => l.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });

  // ===========================================================================
  // SISTEMA DE NOTIFICACIONES TOAST
  // ===========================================================================

  function mostrarToast(titulo, mensaje, tipo = 'success', duracion = 4500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;

    const iconos = {
      success: '✅',
      danger: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    const icono = iconos[tipo] || 'ℹ️';

    toast.innerHTML = `
      <div class="toast-icon">${icono}</div>
      <div class="toast-content">
        <div class="toast-title">${escapeHTML(titulo)}</div>
        <div class="toast-message">${escapeHTML(mensaje)}</div>
      </div>
      <button class="toast-close" title="Cerrar">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      desvanecerToast(toast);
    });

    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      desvanecerToast(toast);
    }, duracion);
  }

  function desvanecerToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('toast-hide');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }

  function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ===========================================================================
  // EVENT LISTENERS: AUDITORÍA DE VENTAS POR SUCURSAL
  // ===========================================================================

  if (dom.filtroAuditoriaSucursal) {
    dom.filtroAuditoriaSucursal.addEventListener('change', (e) => {
      state.filtroAuditoriaSucursal = e.target.value;
      obtenerAuditoriaVentas();
    });
  }

  if (dom.btnToggleAgrupacion) {
    dom.btnToggleAgrupacion.forEach(btn => {
      btn.addEventListener('click', (e) => {
        dom.btnToggleAgrupacion.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.agrupacionAuditoria = e.currentTarget.getAttribute('data-agrupacion');
        obtenerAuditoriaVentas();
      });
    });
  }

  if (dom.filtroAuditoriaFecha) {
    dom.filtroAuditoriaFecha.addEventListener('input', (e) => {
      state.filtroAuditoriaFecha = e.target.value.trim();
      obtenerAuditoriaVentas();
    });
  }

  if (dom.btnClearAuditoriaFecha) {
    dom.btnClearAuditoriaFecha.addEventListener('click', () => {
      dom.filtroAuditoriaFecha.value = '';
      state.filtroAuditoriaFecha = '';
      obtenerAuditoriaVentas();
    });
  }

  if (dom.filtroAuditoriaBusqueda) {
    dom.filtroAuditoriaBusqueda.addEventListener('input', (e) => {
      state.filtroAuditoriaBusqueda = e.target.value.trim();
      obtenerAuditoriaVentas();
    });
  }

  if (dom.btnRefreshAuditoria) {
    dom.btnRefreshAuditoria.addEventListener('click', async () => {
      await obtenerAuditoriaVentas();
      mostrarToast('Auditoría Actualizada', 'Datos de ventas sincronizados.', 'success', 2000);
    });
  }

  // ===========================================================================
  // MÓDULO DE AUTENTICACIÓN (LOGIN Y ROLES: ADMINISTRADOR & GERENTE)
  // ===========================================================================

  function inicializarAuth() {
    const sesion = sessionStorage.getItem('activeSportUser');
    if (sesion) {
      try {
        state.usuarioActual = JSON.parse(sesion);
      } catch (e) {
        state.usuarioActual = null;
      }
    }

    if (!state.usuarioActual) {
      state.usuarioActual = {
        usuario: 'admin',
        nombre: 'Administrador General',
        rol: 'administrador',
        badge: 'Administrador',
        avatar: '🛡️',
        descripcion: 'Acceso total operativo.'
      };
      sessionStorage.setItem('activeSportUser', JSON.stringify(state.usuarioActual));
    }

    actualizarBadgeUsuario();
  }

  function actualizarBadgeUsuario() {
    if (!state.usuarioActual) return;
    const u = state.usuarioActual;
    if (dom.headerUserAvatar) dom.headerUserAvatar.textContent = u.avatar || '👤';
    if (dom.headerUserName) dom.headerUserName.textContent = u.nombre || u.usuario;
    if (dom.headerUserRole) {
      dom.headerUserRole.textContent = u.badge || u.rol;
      if (u.rol === 'gerente') {
        dom.headerUserRole.className = 'user-role-tag user-role-gerente';
      } else {
        dom.headerUserRole.className = 'user-role-tag';
      }
    }
  }

  if (dom.quickAccountBtns) {
    dom.quickAccountBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const u = btn.getAttribute('data-quick-user');
        const p = btn.getAttribute('data-quick-pass');
        if (dom.loginUsuario) dom.loginUsuario.value = u;
        if (dom.loginPassword) dom.loginPassword.value = p;
        if (dom.formLogin) dom.formLogin.dispatchEvent(new Event('submit'));
      });
    });
  }

  if (dom.formLogin) {
    dom.formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usuario = dom.loginUsuario.value.trim();
      const password = dom.loginPassword.value.trim();
      if (dom.loginErrorMsg) dom.loginErrorMsg.style.display = 'none';

      try {
        const resp = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario, password })
        });
        const data = await resp.json();
        if (resp.ok && data.success) {
          state.usuarioActual = data.user;
          sessionStorage.setItem('activeSportUser', JSON.stringify(data.user));
          actualizarBadgeUsuario();
          if (dom.modalLogin) dom.modalLogin.style.display = 'none';
          dom.formLogin.reset();
          mostrarToast('¡Sesión Iniciada!', data.message, 'success', 3500);
        } else {
          if (dom.loginErrorMsg) {
            dom.loginErrorMsg.textContent = data.message || 'Credenciales incorrectas.';
            dom.loginErrorMsg.style.display = 'block';
          }
        }
      } catch (err) {
        console.error(err);
        if (dom.loginErrorMsg) {
          dom.loginErrorMsg.textContent = 'Error al comunicar con el servidor Flask.';
          dom.loginErrorMsg.style.display = 'block';
        }
      }
    });
  }

  if (dom.btnSwitchUser) {
    dom.btnSwitchUser.addEventListener('click', () => {
      if (dom.modalLogin) dom.modalLogin.style.display = 'flex';
      if (dom.loginErrorMsg) dom.loginErrorMsg.style.display = 'none';
    });
  }

  if (dom.btnLogout) {
    dom.btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem('activeSportUser');
      state.usuarioActual = null;
      if (dom.modalLogin) dom.modalLogin.style.display = 'flex';
      if (dom.loginErrorMsg) dom.loginErrorMsg.style.display = 'none';
      if (dom.formLogin) dom.formLogin.reset();
    });
  }

  // Arranque inicial
  inicializarAuth();
  cargarDatosCompletos();
});
