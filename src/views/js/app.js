/* ============================================================
   RUTAS DEL ALTIPLANO - app.js
   Frontend modular para la agencia de turismo
   ============================================================ */

'use strict';

/* ============================================================
   MÓDULO 1: ESTADO GLOBAL
   ============================================================ */
const state = {
  usuario: null,
  token: null,
  paquetes: [],        // Lista completa de paquetes cargados
  paquetesFiltrados: [],  // Lista filtrada para mostrar
  categoriaActual: 'todos',
  busquedaActual: '',
  reservaActual: null, // Datos de la última reserva para el ticket
  paqueteDetalle: null, // Paquete actualmente en el modal de detalle
  qrInstance: null,
};

/* ============================================================
   MÓDULO 2: UTILIDADES
   ============================================================ */

/** Leer token del localStorage */
function getToken() {
  return localStorage.getItem('rda_token');
}

/** Guardar sesión en localStorage y actualizar estado */
function setSession(user, token) {
  state.usuario = user;
  state.token = token;
  localStorage.setItem('rda_token', token);
  localStorage.setItem('rda_usuario', JSON.stringify(user));
}

/** Limpiar sesión */
function clearSession() {
  state.usuario = null;
  state.token = null;
  localStorage.removeItem('rda_token');
  localStorage.removeItem('rda_usuario');
}

/** Formatear precio en soles */
function formatPrice(precio) {
  return `S/. ${parseFloat(precio).toFixed(2)}`;
}

/** Formatear fecha legible */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Mostrar notificación toast */
function showToast(mensaje, tipo = 'info', titulo = null) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '', error: '', warning: '', info: '' };
  const titles = { success: 'Éxito', error: 'Error', warning: 'Atención', info: 'Información' };

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast-icon">${icons[tipo] || ''}</span>
    <div class="toast-content">
      <div class="toast-title">${titulo || titles[tipo]}</div>
      <div class="toast-msg">${mensaje}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Cerrar notificación"></button>
  `;
  container.appendChild(toast);

  // Auto-remove after 4s
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

/** Generar código QR usando QRCode.js */
function generateQRCode(texto, elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = '<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(texto) + '" style="width:100%;height:100%;border-radius:8px;" alt="QR"/>';
}

// RECOVERY SCRIPT

function abrirModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function cerrarModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

function mostrarModalLogin() {
  cerrarModal('modal-registro');
  abrirModal('modal-login');
}

function mostrarModalRegistro() {
  cerrarModal('modal-login');
  abrirModal('modal-registro');
}


function initModalClosers() { document.querySelectorAll('.modal').forEach(m => { m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('active'); }); }); }
function verificarSesion() {
  const token = getToken();
  const btnLoginNav = document.getElementById('btn-login-nav');
  const btnRegNav = document.getElementById('btn-register-nav');
  const btnDashNav = document.getElementById('btn-dashboard-nav');
  const btnLoginMob = document.getElementById('btn-login-mobile');
  const btnRegMob = document.getElementById('btn-register-mobile');
  const btnDashMob = document.getElementById('btn-dashboard-mobile');
  
  if (token && state.usuario) {
    if (btnLoginNav) btnLoginNav.style.display = 'none';
    if (btnRegNav) btnRegNav.style.display = 'none';
    if (btnDashNav) btnDashNav.style.display = 'inline-block';
    if (btnLoginMob) btnLoginMob.style.display = 'none';
    if (btnRegMob) btnRegMob.style.display = 'none';
    if (btnDashMob) btnDashMob.style.display = 'inline-block';
  } else {
    if (btnLoginNav) btnLoginNav.style.display = 'inline-block';
    if (btnRegNav) btnRegNav.style.display = 'inline-block';
    if (btnDashNav) btnDashNav.style.display = 'none';
    if (btnLoginMob) btnLoginMob.style.display = 'inline-block';
    if (btnRegMob) btnRegMob.style.display = 'inline-block';
    if (btnDashMob) btnDashMob.style.display = 'none';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-password').value;
  if (!email || !pass) return showToast('Completa todos los campos', 'error');
  try {
    if(btn) { btn.disabled = true; btn.textContent = 'Ingresando...'; }
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({correo: email, password: pass})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al iniciar sesion');
    setSession(data.usuario, data.token);
    showToast('Bienvenido ' + data.usuario.nombre, 'success');
    cerrarModal('modal-login');
    verificarSesion();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if(btn) { btn.disabled = false; btn.textContent = 'Ingresar'; }
  }
}

async function handleRegistro(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const nombre = document.getElementById('reg-nombre').value;
  const email = document.getElementById('reg-email').value;
  const pass = document.getElementById('reg-password').value;
  if (!nombre || !email || !pass) return showToast('Completa todos los campos', 'error');
  try {
    if(btn) { btn.disabled = true; btn.textContent = 'Registrando...'; }
    const res = await fetch('http://localhost:3000/api/auth/registro', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({nombre, correo: email, password: pass})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al registrarse');
    showToast('Registro exitoso. Ya puedes iniciar sesion.', 'success');
    mostrarModalLogin();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if(btn) { btn.disabled = false; btn.textContent = 'Crear cuenta'; }
  }
}

function handleLogout() {
  clearSession();
  showToast('Has cerrado sesion', 'info');
  verificarSesion();
  ocultarDashboard();
}

async function cargarCatalogo() {
  try {
    const res = await fetch('http://localhost:3000/api/paquetes');
    const data = await res.json();
    state.paquetes = data.paquetes || [];
    filtrarPorCategoria('todos');
  } catch (err) {
    console.error('Error cargando catalogo', err);
  }
}

function filtrarPorCategoria(cat) {
  state.categoriaActual = cat;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  const t = document.getElementById('tab-' + (cat==='todos'?'todos':cat.toLowerCase().replace(' ','-')));
  if(t) t.classList.add('active');
  
  if (cat === 'todos') state.paquetesFiltrados = [...state.paquetes];
  else state.paquetesFiltrados = state.paquetes.filter(p => p.categoria === cat);
  renderCatalogo();
}

let toursLimit = 6;
function renderCatalogo() {
  const cont = document.getElementById('tours-grid');
  if(!cont) return;
  const p = state.paquetesFiltrados.slice(0, toursLimit);
  cont.innerHTML = p.map(t => `
    <div class="tour-card animate-on-scroll">
      <div class="tour-img-wrap">
        <img src="${t.imagen || 'https://via.placeholder.com/400x300'}" alt="${t.nombre}" class="tour-img">
        <div class="tour-badge">${t.categoria}</div>
      </div>
      <div class="tour-content">
        <h3 class="tour-title">${t.nombre}</h3>
        <p class="tour-desc">${t.descripcion ? t.descripcion.substring(0,80) : ''}...</p>
        <div class="tour-meta">
          <span><i data-lucide="clock" class="icon-sm"></i> ${t.duracion}</span>
          <span><i data-lucide="map-pin" class="icon-sm"></i> Puno</span>
        </div>
        <div class="tour-footer">
          <div class="tour-price">S/ ${t.precio}</div>
          <button class="btn btn-gold btn-sm" onclick="abrirModalDetalle(${t.id})">Ver m&aacute;s</button>
        </div>
      </div>
    </div>
  `).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
  
  const btn = document.getElementById('btn-load-more');
  if (btn) btn.style.display = toursLimit >= state.paquetesFiltrados.length ? 'none' : 'inline-block';
}

function cargarMas() {
  toursLimit += 6;
  renderCatalogo();
}

async function abrirModalDetalle(id) {
  try {
    const res = await fetch('http://localhost:3000/api/paquetes/' + id);
    const p = await res.json();
    state.paqueteDetalle = p.paquete;
    document.getElementById('detalle-img').src = p.paquete.imagen || 'https://via.placeholder.com/800x400';
    document.getElementById('detalle-img').alt = p.paquete.nombre;
    document.getElementById('detalle-badges').innerHTML = '<span class="tour-badge">' + p.paquete.categoria + '</span>';
    document.getElementById('modal-detalle-title').textContent = p.paquete.nombre;
    document.getElementById('detalle-meta-grid').innerHTML = '<div class="meta-item"><i data-lucide="clock" class="icon-sm"></i><div><div class="meta-label">Duraci\u00f3n</div><div class="meta-value">' + p.paquete.duracion + '</div></div></div><div class="meta-item"><i data-lucide="mountain" class="icon-sm"></i><div><div class="meta-label">Altitud</div><div class="meta-value">' + (p.paquete.altitud || '3827 msnm') + '</div></div></div>';
    document.getElementById('detalle-precio').textContent = 'S/ ' + p.paquete.precio;
    document.getElementById('detalle-descripcion').textContent = p.paquete.descripcion;
    document.getElementById('detalle-itinerario').innerHTML = Array.isArray(p.paquete.itinerario) ? p.paquete.itinerario.map(i => '<div style="margin-bottom:8px">&bull; ' + i + '</div>').join('') : (p.paquete.itinerario || 'Itinerario disponible próximamente.');
    
    const authCheck = document.getElementById('reserva-auth-check');
    if (state.token) {
      authCheck.innerHTML = `
        <form id="form-reservar-tour" onsubmit="handleReservarTour(event)">
          <div class="form-group">
            <label class="form-label">Fecha del Tour</label>
            <input type="text" id="reserva-fecha" class="form-control" required placeholder="Selecciona una fecha">
          </div>
          <div class="form-group" style="margin-top:1rem;">
            <label class="form-label">Nmero de personas</label>
            <input type="number" id="reserva-personas" class="form-control" min="1" max="20" value="1" required>
          </div>
          <button type="submit" class="btn btn-emerald" style="width:100%;margin-top:1.5rem;">Confirmar Reserva</button>
        </form>
      `;
      setTimeout(() => {
        if(typeof flatpickr !== 'undefined') flatpickr('#reserva-fecha', {minDate: 'today'});
      }, 100);
    } else {
      authCheck.innerHTML = `
        <div style="background:var(--bg-light);padding:1rem;border-radius:8px;text-align:center;">
          <p style="margin-bottom:1rem;font-size:0.9rem;">Debes iniciar sesin para reservar.</p>
          <button class="btn btn-gold btn-sm" onclick="cerrarModal('modal-detalle'); mostrarModalLogin();">Iniciar Sesin</button>
        </div>
      `;
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    abrirModal('modal-detalle');
  } catch(err) {
    showToast('Error cargando detalles del tour', 'error');
  }
}

async function handleReservarTour(e) {
  e.preventDefault();
  const fecha = document.getElementById('reserva-fecha').value;
  const pers = parseInt(document.getElementById('reserva-personas').value);
  if (!fecha || !pers) return showToast('Completa todos los campos', 'error');
  
  const p = state.paqueteDetalle;
  const precioTotal = p.precio * pers;
  
  try {
    const res = await fetch('http://localhost:3000/api/reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + state.token
      },
      body: JSON.stringify({
        paquete_id: p.id,
        fecha_reserva: fecha,
        pasajeros: pers,
        precio_total: precioTotal
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al reservar');
    
    cerrarModal('modal-detalle');
    state.reservaActual = data.reserva;
    
    const qrText = data.reserva.codigo_qr || "RDA-RES-" + data.reserva.id;
    generateQRCode(qrText, 'qr-code-container');
    document.getElementById('ticket-codigo').textContent = qrText;
    document.getElementById('ticket-tour-nombre').textContent = p.paquete.nombre;
    document.getElementById('ticket-fecha').textContent = fecha;
    document.getElementById('ticket-personas').textContent = pers;
    document.getElementById('ticket-monto').textContent = 'S/ ' + precioTotal;
    document.getElementById('ticket-cliente').textContent = state.usuario.nombre;

    
    abrirModal('modal-ticket');
    showToast('Reserva exitosa', 'success');
  } catch(err) {
    showToast(err.message, 'error');
  }
}


/** Compartir ticket por WhatsApp */
function compartirWhatsApp() {
  const reserva = state.reservaActual;
  if (!reserva) return;

  const tour    = reserva.paquete?.nombre || state.paqueteDetalle?.nombre || '-';
  const fecha   = reserva.fecha_reserva || reserva.fecha_tour;
  const codigo  = reserva.codigo_qr || reserva.codigo_reserva || `RDA-RES-${reserva.id}`;
  const monto   = reserva.precio_total || reserva.monto_total || 0;

  const msg = encodeURIComponent(
    `Hola, quiero pagar mi reserva de tour.\n` +
    `Tour: ${tour}\n` +
    `Fecha: ${fecha}\n` +
    `Código: ${codigo}\n` +
    `Monto a pagar: S/. ${monto}\n` +
    `Aquí está mi comprobante de pago:`
  );

  window.open(`https://wa.me/51930844635?text=${msg}`, '_blank');
}

/* ============================================================
   MÓDULO 7: COTIZADOR
   ============================================================ */

async function handleCotizacion(evento) {
  evento.preventDefault();

  if (!state.usuario) {
    showToast('Debes iniciar sesión para solicitar una cotización.', 'warning');
    mostrarModalLogin();
    return;
  }

  const nombre   = document.getElementById('cot-nombre')?.value?.trim();
  const email    = document.getElementById('cot-email')?.value?.trim();
  const fecha    = document.getElementById('cot-fecha')?.value;
  const personas = document.getElementById('cot-personas')?.value;
  const mensaje  = document.getElementById('cot-mensaje')?.value?.trim();

  const destinosChecks = document.querySelectorAll('input[name="destinos"]:checked');
  const destinos = Array.from(destinosChecks).map(c => c.value);

  if (!nombre || !email || !fecha || !personas) {
    showToast('Completa todos los campos obligatorios.', 'warning');
    return;
  }

  if (destinos.length === 0) {
    showToast('Selecciona al menos una joya oculta de interés.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-cotizar-submit');
  if (btn) { btn.textContent = 'Enviando...'; btn.disabled = true; }

  try {
    await apiFetch('/cotizaciones', 'POST', {
      nombre, email,
      destinos_interes: destinos.join(', '),
      fecha_tentativa: fecha,
      num_personas: parseInt(personas),
      mensaje_adicional: mensaje,
    });
    showToast('¡Cotización enviada! Te contactaremos pronto.', 'success');
    document.getElementById('form-cotizacion').reset();
    // Restablecer campos con datos del usuario
    if (state.usuario) {
      const ei = document.getElementById('cot-email');
      const ni = document.getElementById('cot-nombre');
      if (ei) ei.value = state.usuario.email || '';
      if (ni) ni.value = state.usuario.nombre || '';
    }
  } catch (err) {
    showToast(err.message || 'Error al enviar la cotización.', 'error');
  } finally {
    if (btn) { btn.innerHTML = '<i data-lucide="clipboard-list" class="icon-sm"></i> Solicitar Cotización Personalizada'; btn.disabled = false; }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

/* ============================================================
   MÓDULO 8: DASHBOARD
   ============================================================ */

function mostrarDashboard() {
  document.getElementById('landing-page').style.display = 'none';
  const dash = document.getElementById('dashboard-section');
  dash.classList.add('visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Cargar datos según rol
  cargarMisReservas();
  if (state.usuario?.rol === 'admin' || state.usuario?.rol === 'operaciones') {
    cargarCotizaciones_Admin();
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function ocultarDashboard() {
  document.getElementById('landing-page').style.display = '';
  document.getElementById('dashboard-section').classList.remove('visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchDashTab(tabId) {
  // Ocultar todos los panels
  document.querySelectorAll('.dashboard-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));

  // Mostrar el seleccionado
  const panel = document.getElementById(`dpanel-${tabId}`);
  const tab   = document.getElementById(`dtab-${tabId}`);
  if (panel) panel.classList.add('active');
  if (tab)   tab.classList.add('active');

  // Cargar datos según el tab
  const loaders = {
    'mis-reservas':  cargarMisReservas,
    'mi-perfil':     cargarMiPerfil,
    'cotizaciones':  cargarCotizaciones_Admin,
    'all-reservas':  cargarTodasReservas,
    'manifiesto':    () => {}, // Se carga con los filtros
    'tours-admin':   cargarTours_Admin,
    'usuarios':      cargarUsuarios_Admin,
  };
  if (loaders[tabId]) loaders[tabId]();
}

async function cargarMisReservas() {
  const tbody = document.getElementById('tbody-mis-reservas');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;"><i data-lucide="hourglass" class="icon-lg"></i> Cargando...</td></tr>';

  try {
    const data = await apiFetch('/reservas/usuario');
    const reservas = data.reservas || data || [];
    if (reservas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">No tienes reservas aún. ¡Explora nuestros tours!</td></tr>';
      return;
    }
    state.misReservas = reservas;
    tbody.innerHTML = reservas.map((r, idx) => {
      let estado = (r.estado || 'pendiente').toLowerCase();
      const created = new Date(r.createdAt || r.created_at || new Date());
      const now = new Date();
      const diffHours = Math.abs(now - created) / 36e5;
      
      let badgeLabel = r.estado || 'Pendiente';
      let actions = `<button class="btn btn-ghost btn-sm" onclick="mostrarTicketDesdePanel(${idx})" style="padding:4px 8px;font-size:0.75rem;"><i data-lucide="ticket" class="icon-sm"></i> Ticket</button>`;
      
      if (estado === 'pendiente') {
        if (diffHours > 24) {
          estado = 'cancelado';
          badgeLabel = 'Cancelado (Expirado)';
        } else {
          const remaining = Math.max(1, Math.ceil(24 - diffHours));
          actions += `<button class="btn btn-emerald btn-sm" onclick="pagarReserva(${idx})" style="padding:4px 8px;font-size:0.75rem;margin-left:5px;"><i data-lucide="credit-card" class="icon-sm"></i> Pagar (${remaining}h)</button>`;
        }
      }

      return `
      <tr>
        <td><span class="ticket-code" style="font-size:0.75rem;padding:3px 10px;">${r.codigo_qr || r.codigo_reserva || `RDA-${String(r.id).padStart(6,'0')}`}</span></td>
        <td><strong>${r.paquete?.nombre || r.paquete_nombre || `Tour #${r.id_paquete}`}</strong></td>
        <td>${formatDate(r.fecha_reserva)}</td>
        <td>${r.pasajeros} persona(s)</td>
        <td style="color:var(--gold-primary);font-weight:700;">${formatPrice(r.precio_total)}</td>
        <td><span class="status-badge status-${estado}">${badgeLabel}</span></td>
        <td style="color:var(--text-subtle);font-size:0.8rem;">${formatDate(r.created_at || r.createdAt)}</td>
        <td>${actions}</td>
      </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--error);padding:2rem;"> ${err.message}</td></tr>`;
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.mostrarTicketDesdePanel = (idx) => {
  const r = state.misReservas[idx];
  const paquete = r.paquete || { nombre: r.paquete_nombre || `Tour #${r.id_paquete}`, precio: r.precio_total / (r.pasajeros || 1) };
  state.reservaActual = { ...r, paquete };
  mostrarTicket(r, paquete);
};

async function cargarTodasReservas() {
  const tbody = document.getElementById('tbody-all-reservas');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem;"><i data-lucide="hourglass" class="icon-lg"></i> Cargando...</td></tr>';

  try {
    const data = await apiFetch('/reservas');
    const reservas = data.reservas || data || [];
    if (reservas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem;">No hay reservas.</td></tr>';
      return;
    }
    tbody.innerHTML = reservas.map(r => `
      <tr>
        <td><span style="font-family:monospace;font-size:0.78rem;color:var(--gold-primary);">${r.codigo_qr || `RDA-${String(r.id).padStart(6,'0')}`}</span></td>
        <td>${r.usuario?.nombre || r.usuario_nombre || `Usuario #${r.usuario_id}`}</td>
        <td>${r.paquete?.nombre || r.paquete_nombre || `Tour #${r.paquete_id}`}</td>
        <td>${formatDate(r.fecha_tour)}</td>
        <td>${r.num_personas}</td>
        <td style="color:var(--gold-primary);font-weight:600;">${formatPrice(r.monto_total)}</td>
        <td><span class="status-badge status-${(r.estado||'pendiente').toLowerCase()}">${r.estado || 'Pendiente'}</span></td>
        <td>
          <select
            class="form-select"
            style="padding:6px 10px;font-size:0.78rem;border-radius:8px;"
            onchange="cambiarEstadoReserva(${r.id}, this.value)"
            aria-label="Cambiar estado de reserva"
          >
            <option value="" disabled selected>Cambiar estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
            <option value="completado">Completado</option>
          </select>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--error);padding:2rem;"> ${err.message}</td></tr>`;
  }
}

async function cargarManifiesto() {
  const paqueteId = document.getElementById('manif-paquete')?.value;
  const fecha     = document.getElementById('manif-fecha')?.value;
  const tbody     = document.getElementById('tbody-manifiesto');
  if (!tbody) return;

  if (!paqueteId || !fecha) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">Selecciona un tour y fecha para cargar el manifiesto.</td></tr>';
    return;
  }

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;"><i data-lucide="hourglass" class="icon-lg"></i> Cargando manifiesto...</td></tr>';

  try {
    const data = await apiFetch(`/reservas?paquete_id=${paqueteId}&fecha_tour=${fecha}`);
    const reservas = data.reservas || data || [];

    if (reservas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">No hay pasajeros para esta fecha y tour.</td></tr>';
      return;
    }

    tbody.innerHTML = reservas.map((r, idx) => `
      <tr>
        <td style="font-weight:700;color:var(--gold-primary);">${idx + 1}</td>
        <td><span style="font-family:monospace;font-size:0.78rem;">${r.codigo_qr || `RDA-${String(r.id).padStart(6,'0')}`}</span></td>
        <td><strong>${r.usuario?.nombre || r.usuario_nombre || `Usuario #${r.usuario_id}`}</strong></td>
        <td>${r.usuario?.email || r.usuario_email || '-'}</td>
        <td style="text-align:center;">${r.num_personas}</td>
        <td><span class="status-badge status-${(r.estado||'pendiente').toLowerCase()}">${r.estado || 'Pendiente'}</span></td>
        <td>${r.estado === 'confirmado' ? '<i data-lucide="check-circle" class="icon-sm"></i>' : '<i data-lucide="clock" class="icon-sm"></i>'}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--error);padding:2rem;"> ${err.message}</td></tr>`;
  }
}

async function cargarTours_Admin() {
  const tbody = document.getElementById('tbody-tours-admin');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;"><i data-lucide="hourglass" class="icon-lg"></i> Cargando...</td></tr>';

  let paquetes = [];
  try {
    const data = await apiFetch('/paquetes');
    paquetes = data.paquetes || data || [];
  } catch (_) {
    paquetes = PAQUETES_LOCAL;
  }

  tbody.innerHTML = paquetes.map(p => `
    <tr>
      <td style="color:var(--text-subtle);">#${p.id}</td>
      <td><strong>${p.nombre}</strong></td>
      <td><span class="tour-badge ${getBadgeClass(p.categoria)}" style="position:static;">${getCategoriaEmoji(p.categoria)} ${p.categoria}</span></td>
      <td style="color:var(--gold-primary);font-weight:700;">${formatPrice(p.precio)}</td>
      <td>${p.duracion}</td>
      <td><span class="tour-difficulty ${getDiffClass(p.dificultad)}">${p.dificultad}</span></td>
      <td><span class="status-badge status-confirmado">Activo</span></td>
    </tr>
  `).join('');
}

async function cargarCotizaciones_Admin() {
  const tbody = document.getElementById('tbody-cotizaciones');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem;"><i data-lucide="hourglass" class="icon-lg"></i> Cargando...</td></tr>';

  try {
    const data = await apiFetch('/cotizaciones');
    const cotizaciones = data.cotizaciones || data || [];
    if (cotizaciones.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem;">No hay cotizaciones.</td></tr>';
      return;
    }
    tbody.innerHTML = cotizaciones.map(c => `
      <tr>
        <td style="color:var(--text-subtle);">#${c.id}</td>
        <td><strong>${c.nombre}</strong></td>
        <td>${c.email}</td>
        <td style="font-size:0.8rem;max-width:180px;">${c.destinos_interes || c.destinos || '-'}</td>
        <td>${c.num_personas}</td>
        <td>${formatDate(c.fecha_tentativa)}</td>
        <td><span class="status-badge status-${(c.estado||'pendiente').toLowerCase()}">${c.estado || 'Pendiente'}</span></td>
        <td>
          <select
            class="form-select"
            style="padding:6px 10px;font-size:0.78rem;border-radius:8px;"
            onchange="cambiarEstadoCotizacion(${c.id}, this.value)"
            aria-label="Cambiar estado de cotización"
          >
            <option value="" disabled selected>Cambiar</option>
            <option value="pendiente">Pendiente</option>
            <option value="revisado">Revisado</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--error);padding:2rem;"> ${err.message}</td></tr>`;
  }
}

async function cargarUsuarios_Admin() {
  const tbody = document.getElementById('tbody-usuarios');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem;"><i data-lucide="hourglass" class="icon-lg"></i> Cargando...</td></tr>';

  try {
    const data = await apiFetch('/usuarios');
    const usuarios = data.usuarios || data || [];
    if (usuarios.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem;">No hay usuarios.</td></tr>';
      return;
    }
    tbody.innerHTML = usuarios.map(u => `
      <tr>
        <td style="color:var(--text-subtle);">#${u.id}</td>
        <td>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--gold-primary),var(--gold-secondary));display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;font-size:0.85rem;flex-shrink:0;">
              ${(u.nombre||'U')[0].toUpperCase()}
            </div>
            <strong>${u.nombre}</strong>
          </div>
        </td>
        <td>${u.email}</td>
        <td><span class="dashboard-role-badge role-${u.rol || 'turista'}">${u.rol || 'turista'}</span></td>
        <td style="color:var(--text-subtle);font-size:0.8rem;">${formatDate(u.createdAt || u.created_at)}</td>
        <td>
          <select
            class="form-select"
            style="padding:6px 10px;font-size:0.78rem;border-radius:8px;"
            onchange="cambiarRolUsuario(${u.id}, this.value)"
            ${u.id === state.usuario?.id ? 'disabled title="No puedes cambiar tu propio rol"' : ''}
            aria-label="Cambiar rol del usuario"
          >
            <option value="" disabled selected>Cambiar rol</option>
            <option value="turista">Turista</option>
            <option value="guia">Guía</option>
            <option value="operaciones">Operaciones</option>
            <option value="admin">Admin</option>
          </select>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--error);padding:2rem;"> ${err.message}</td></tr>`;
  }
}

async function cambiarEstadoReserva(id, estado) {
  if (!estado) return;
  try {
    await apiFetch(`/reservas/${id}/estado`, 'PUT', { estado });
    showToast(`Estado actualizado a "${estado}"`, 'success');
  } catch (err) {
    showToast(err.message || 'Error al actualizar estado.', 'error');
  }
}

async function cambiarEstadoCotizacion(id, estado) {
  if (!estado) return;
  try {
    await apiFetch(`/cotizaciones/${id}/estado`, 'PUT', { estado });
    showToast(`Cotización actualizada a "${estado}"`, 'success');
  } catch (err) {
    showToast(err.message || 'Error al actualizar cotización.', 'error');
  }
}

async function cambiarRolUsuario(id, rol) {
  if (!rol) return;
  try {
    await apiFetch(`/usuarios/${id}/rol`, 'PUT', { rol });
    showToast(`Rol actualizado a "${rol}"`, 'success');
    cargarUsuarios_Admin(); // Refrescar
  } catch (err) {
    showToast(err.message || 'Error al cambiar el rol.', 'error');
  }
}

/* ============================================================
   MÓDULO 10: ANIMACIONES
   ============================================================ */

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    // Solo los que no han sido observados aún
    if (!el.classList.contains('visible')) {
      observer.observe(el);
    }
  });
}

function initNavbar() {
  const navbar = document.getElementById('main-navbar');
  const sections = document.querySelectorAll('section[id]');

  // Scroll handler
  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Active nav link
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    document.querySelectorAll('.navbar .nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Hamburger
  const hamburger = document.getElementById('hamburger-btn');
  const drawer    = document.getElementById('nav-drawer');
  hamburger?.addEventListener('click', () => {
    const isOpen = drawer?.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

function closeDrawer() {
  const drawer    = document.getElementById('nav-drawer');
  const hamburger = document.getElementById('hamburger-btn');
  drawer?.classList.remove('open');
  hamburger?.classList.remove('open');
  hamburger?.setAttribute('aria-expanded', 'false');
}

function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;

    const update = () => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString('es-PE');
      if (current < target) requestAnimationFrame(update);
    };
    update();
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

function initLoader() {
  const loader = document.getElementById('page-loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader?.classList.add('hidden');
    }, 600);
  });
  // Fallback
  setTimeout(() => loader?.classList.add('hidden'), 3000);
}

/* ============================================================
   MÓDULO 11: INICIALIZACIÓN
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  // Loader
  initLoader();

  // Sesión
  verificarSesion();

  // Modal closers
  initModalClosers();

  // Navbar & scroll animations
  initNavbar();
  initScrollAnimations();
  initCounters();

  // Inicializar Flatpickr para el cotizador
  const cotFecha = document.getElementById('cot-fecha');
  if (cotFecha && typeof flatpickr !== 'undefined') {
    flatpickr(cotFecha, {
      locale: "es",
      minDate: "today",
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "j \\de F, Y",
    });
  }

  // Cargar catálogo
  await cargarCatalogo();
  initScrollAnimations(); // Re-init after tours load


  // Set fecha mínima para reservas (se actualiza dinámicamente al abrir el modal)
  const today = new Date().toISOString().split('T')[0];

  console.log('%c Rutas del Altiplano - Frontend cargado', 'color:#FFB300;font-size:14px;font-weight:bold;');
  console.log('%cTurismo & Experiencias Puno S.A.C. | RUC: 20609876541', 'color:#94A3B8;font-size:12px;');
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

/* ============================================================
   MÓDULO 12: CRUD USUARIOS Y PERFIL
   ============================================================ */
function abrirModalNuevoUsuario() {
  document.getElementById('form-usuario').reset();
  document.getElementById('user-edit-id').value = '';
  document.getElementById('modal-usuario-title').textContent = 'Nuevo Usuario';
  document.getElementById('grp-us-password').style.display = '';
  document.getElementById('us-password').required = true;
  abrirModal('modal-usuario');
}

function abrirModalEditarUsuario(id, nombre, email, rol, telefono) {
  document.getElementById('form-usuario').reset();
  document.getElementById('user-edit-id').value = id;
  document.getElementById('us-nombre').value = nombre;
  document.getElementById('us-email').value = email;
  document.getElementById('us-rol').value = rol;
  document.getElementById('us-telefono').value = telefono !== 'undefined' && telefono ? telefono : '';
  
  document.getElementById('modal-usuario-title').textContent = 'Editar Usuario';
  document.getElementById('grp-us-password').style.display = 'none';
  document.getElementById('us-password').required = false;
  abrirModal('modal-usuario');
}

async function handleGuardarUsuario(e) {
  e.preventDefault();
  const id = document.getElementById('user-edit-id').value;
  const nombre = document.getElementById('us-nombre').value.trim();
  const email = document.getElementById('us-email').value.trim();
  const telefono = document.getElementById('us-telefono').value.trim();
  const rol = document.getElementById('us-rol').value;
  const password = document.getElementById('us-password').value;

  const btn = document.getElementById('btn-usuario-submit');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    if (id) {
      await apiFetch(`/usuarios/${id}`, 'PUT', { nombre, email, rol, telefono });
      showToast('Usuario actualizado ', 'success');
    } else {
      if(!password) throw new Error('Contraseña es requerida');
      await apiFetch('/usuarios', 'POST', { nombre, email, password, rol, telefono });
      showToast('Usuario creado ', 'success');
    }
    cerrarModal('modal-usuario');
    cargarUsuarios_Admin();
  } catch(err) {
    showToast(err.message || 'Error al guardar usuario', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar Usuario';
  }
}

async function handleEliminarUsuario(id, nombre) {
  if(!confirm(`¿Estás seguro de eliminar a ${nombre}?`)) return;
  try {
    await apiFetch(`/usuarios/${id}`, 'DELETE');
    showToast('Usuario eliminado ', 'success');
    cargarUsuarios_Admin();
  } catch(err) {
    showToast(err.message || 'Error al eliminar usuario', 'error');
  }
}

function cargarMiPerfil() {
  if(!state.usuario) return;
  document.getElementById('prof-nombre').value = state.usuario.nombre || '';
  document.getElementById('prof-email').value = state.usuario.email || '';
  document.getElementById('prof-telefono').value = state.usuario.telefono || '';
  document.getElementById('prof-password').value = '';
}

async function handleActualizarPerfil(e) {
  e.preventDefault();
  const nombre = document.getElementById('prof-nombre').value.trim();
  const telefono = document.getElementById('prof-telefono').value.trim();
  const password = document.getElementById('prof-password').value;

  const btn = document.getElementById('btn-perfil-submit');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    const body = { nombre, telefono };
    if(password) body.password = password;
    const res = await apiFetch('/auth/profile', 'PUT', body);
    state.usuario.nombre = res.usuario?.nombre || nombre;
    state.usuario.telefono = res.usuario?.telefono || telefono;
    localStorage.setItem('rda_usuario', JSON.stringify(state.usuario));
    actualizarUIParaSesion();
    showToast('Perfil actualizado ', 'success');
    document.getElementById('prof-password').value = '';
  } catch(err) {
    showToast(err.message || 'Error al actualizar perfil', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar Cambios';
  }
}

window.pagarReserva = (idx) => {
  const r = state.misReservas[idx];
  const numeroAdmin = "51930844635";
  const mensaje = "Hola, quiero pagar mi reserva de tour.\nTour: " + (r.paquete_nombre || r.paquete?.nombre || 'Tour') + "\nFecha: " + formatDate(r.fecha_reserva) + "\nCdigo: " + (r.codigo_qr || r.codigo_reserva || r.id) + "\nMonto a pagar: " + formatPrice(r.precio_total) + "\nAqu est mi comprobante de pago:";
  const url = "https://wa.me/" + numeroAdmin + "?text=" + encodeURIComponent(mensaje);
  window.open(url, '_blank');
};


