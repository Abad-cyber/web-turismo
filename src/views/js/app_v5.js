/* ============================================================
   SisturPuno - app.js
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
  return localStorage.getItem('sistur_token');
}

/** URL base dinámica: local o producción */
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';

/** Helper fetch autenticado con URL dinámica */
async function apiFetch(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  const token = getToken();
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE + endpoint, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error en la solicitud');
  return data;
}

/** Guardar sesión en localStorage y actualizar estado */
function setSession(user, token) {
  state.usuario = user;
  state.token = token;
  localStorage.setItem('sistur_token', token);
  localStorage.setItem('sistur_usuario', JSON.stringify(user));
}

/** Limpiar sesión */
function clearSession() {
  state.usuario = null;
  state.token = null;
  localStorage.removeItem('sistur_token');
  localStorage.removeItem('sistur_usuario');
}

/** Restaurar sesión al recargar la página */
function loadSession() {
  const token = localStorage.getItem('sistur_token');
  const userStr = localStorage.getItem('sistur_usuario');
  if (token && userStr) {
    try {
      state.token = token;
      state.usuario = JSON.parse(userStr);
    } catch(e) {
      clearSession();
    }
  }
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

// Rastrear la última posición del clic a nivel global para posicionar modales
window.lastClickPageY = 100;
document.addEventListener('click', (e) => {
  if (e.pageY !== undefined) {
    window.lastClickPageY = e.pageY;
  }
}, true);

/**
 * Abre un modal y lo posiciona en la altura del clic del usuario.
 * @param {string} id - ID del elemento modal-overlay
 * @param {MouseEvent|null} event - Evento del clic (opcional)
 */
function abrirModal(id, event) {
  const overlay = document.getElementById(id);
  if (!overlay) return;

  const modal = overlay.querySelector('.modal');
  if (modal) {
    // Convertimos el overlay en un elemento anclado al documento
    overlay.style.setProperty('position', 'absolute', 'important');
    overlay.style.setProperty('height', Math.max(document.body.scrollHeight, window.innerHeight) + 'px', 'important');
    overlay.style.setProperty('display', 'block', 'important');
    
    // Obtenemos la altura real del modal (funciona porque visibility:hidden no destruye la geometría)
    let modalHeight = modal.offsetHeight || 400; // fallback de 400px por si acaso
    
    // El usuario pidió que la ventana aparezca "centrada en el clic".
    // Así que restamos la mitad de la altura de la ventana a la coordenada Y del clic.
    let topOffset = window.lastClickPageY - (modalHeight / 2);
    
    // Evitamos que se corte por la parte superior del documento (mínimo 20px)
    if (topOffset < 20) topOffset = 20;
    
    // Posicionamiento absoluto anclado a la coordenada calculada
    modal.style.setProperty('position', 'absolute', 'important');
    modal.style.setProperty('top', topOffset + 'px', 'important');
    modal.style.setProperty('left', '0', 'important');
    modal.style.setProperty('right', '0', 'important');
    modal.style.setProperty('margin', '0 auto', 'important');
    modal.style.setProperty('margin-bottom', '60px', 'important');
  }

  overlay.classList.add('active');
}

function cerrarModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

function mostrarModalLogin(event) {
  cerrarModal('modal-registro');
  abrirModal('modal-login', event || null);
}

function mostrarModalRegistro(event) {
  cerrarModal('modal-login');
  abrirModal('modal-registro', event || null);
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
  // Bug fix 4.1: Mostrar/ocultar formulario del cotizador según sesión
  const cotForm = document.getElementById('cotizador-form-wrap');
  const cotMsg  = document.getElementById('cotizador-auth-msg');

  if (token && state.usuario) {
    if (btnLoginNav) btnLoginNav.style.display = 'none';
    if (btnRegNav) btnRegNav.style.display = 'none';
    if (btnDashNav) btnDashNav.style.display = 'inline-block';
    if (btnLoginMob) btnLoginMob.style.display = 'none';
    if (btnRegMob) btnRegMob.style.display = 'none';
    if (btnDashMob) btnDashMob.style.display = 'inline-block';
    if (cotForm) cotForm.style.display = 'block';
    if (cotMsg)  cotMsg.style.display  = 'none';
  } else {
    if (btnLoginNav) btnLoginNav.style.display = 'inline-block';
    if (btnRegNav) btnRegNav.style.display = 'inline-block';
    if (btnDashNav) btnDashNav.style.display = 'none';
    if (btnLoginMob) btnLoginMob.style.display = 'inline-block';
    if (btnRegMob) btnRegMob.style.display = 'inline-block';
    if (btnDashMob) btnDashMob.style.display = 'none';
    if (cotForm) cotForm.style.display = 'none';
    if (cotMsg)  cotMsg.style.display  = 'block';
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
    const res = await fetch(API_BASE + '/auth/login', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: email, password: pass})
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
  // Bug fix 4.4: Validar confirmación de contraseña
  const pass2El = document.getElementById('reg-password2');
  const pass2 = pass2El ? pass2El.value : pass;
  if (!nombre || !email || !pass) return showToast('Completa todos los campos', 'error');
  if (pass !== pass2) return showToast('Las contraseñas no coinciden', 'error');
  try {
    if(btn) { btn.disabled = true; btn.textContent = 'Registrando...'; }
    const res = await fetch(API_BASE + '/auth/register', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({nombre, email: email, password: pass})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al registrarse');
    showToast('Registro exitoso. Ya puedes iniciar sesion.', 'success');
    mostrarModalLogin(event);
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
    const res = await fetch(API_BASE + '/paquetes');
    const data = await res.json();
    state.paquetes = data.paquetes || [];
    filtrarPorCategoria('todos');
  } catch (err) {
    console.error('Error cargando catalogo', err);
    // Bug fix 6.1: Mostrar error al usuario si la API falla
    const cont = document.getElementById('tours-grid');
    if (cont) {
      cont.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>No se pudieron cargar los tours. Verifica tu conexión o intenta más tarde.</p></div>`;
    }
  }
}

/** Bug fix 1.1: Función buscarTours (faltaba completamente) */
function buscarTours(query) {
  state.busquedaActual = query.toLowerCase().trim();
  if (!state.busquedaActual) {
    filtrarPorCategoria(state.categoriaActual);
    return;
  }
  state.paquetesFiltrados = state.paquetes.filter(p => {
    const matchCat  = state.categoriaActual === 'todos' || p.categoria === state.categoriaActual;
    const matchText = p.nombre.toLowerCase().includes(state.busquedaActual) ||
                      (p.descripcion && p.descripcion.toLowerCase().includes(state.busquedaActual));
    return matchCat && matchText;
  });
  renderCatalogo();
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

let toursLimit = 8;
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
          <button class="btn btn-gold btn-sm" onclick="abrirModalDetalle(${t.id}, event)">Ver m&aacute;s</button>
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

async function abrirModalDetalle(id, event) {
  try {
    const res = await fetch(API_BASE + '/paquetes/' + id);
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
    
    // PUNTO 3: Botón Mostrar Mapa va DEBAJO del itinerario, fuera del form
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((p.paquete.nombre || '') + ' Puno, Peru')}`;
    const itEl = document.getElementById('detalle-itinerario');
    if (itEl) {
      // Insertar botón de mapa después del contenedor del itinerario
      const existingMapBtn = document.getElementById('btn-detalle-mapa');
      if (existingMapBtn) existingMapBtn.remove();
      const mapBtn = document.createElement('a');
      mapBtn.id = 'btn-detalle-mapa';
      mapBtn.href = mapUrl;
      mapBtn.target = '_blank';
      mapBtn.rel = 'noopener';
      mapBtn.className = 'btn btn-outline';
      mapBtn.style.cssText = 'display:flex;align-items:center;gap:6px;margin-top:1rem;width:100%;justify-content:center;';
      mapBtn.innerHTML = '<i data-lucide="map-pin" class="icon-sm"></i> Ver en Google Maps';
      itEl.parentElement.after(mapBtn);
    }

    const authCheck = document.getElementById('reserva-auth-check');
    if (state.token) {
      authCheck.innerHTML = `
        <form id="form-reservar-tour" onsubmit="handleReservarTour(event)">
          <div class="form-group">
            <label class="form-label">Fecha del Tour</label>
            <input type="text" id="reserva-fecha" class="form-control" required placeholder="Selecciona una fecha">
          </div>
          <div class="form-group" style="margin-top:1rem;">
            <label class="form-label">N&uacute;mero de personas</label>
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
          <p style="margin-bottom:1rem;font-size:0.9rem;">Debes iniciar sesi&oacute;n para reservar.</p>
          <button class="btn btn-gold" style="width:100%;" onclick="cerrarModal('modal-detalle'); mostrarModalLogin(event);">Iniciar Sesi&oacute;n</button>
        </div>
      `;
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    abrirModal('modal-detalle', event || null);
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
    const res = await fetch(API_BASE + '/reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + state.token
      },
      body: JSON.stringify({
        id_paquete: p.id,
        fecha_reserva: fecha,
        pasajeros: pers
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al reservar');
    
    cerrarModal('modal-detalle');
    state.reservaActual = data.reserva;
    
    const qrText = data.reserva.codigo_qr || "SISTUR-RES-" + data.reserva.id;
    generateQRCode(qrText, 'qr-code-container');
    document.getElementById('ticket-codigo').textContent = qrText;
    document.getElementById('ticket-tour-nombre').textContent = p.nombre || '-';
    document.getElementById('ticket-fecha').textContent = fecha;
    document.getElementById('ticket-personas').textContent = pers;
    document.getElementById('ticket-monto').textContent = 'S/. ' + parseFloat(precioTotal).toFixed(2);
    document.getElementById('ticket-cliente').textContent = reserva.usuario?.nombre || reserva.nombre_usuario || state.usuario?.nombre || '-';
  const estadoObj = { pendiente: 'Pendiente', confirmada: 'Confirmada', cancelada: 'Cancelada', completada: 'Completada' };
  document.getElementById('ticket-estado').textContent = estadoObj[(reserva.estado || 'pendiente').toLowerCase()] || 'Pendiente';

    
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
  const codigo  = reserva.codigo_qr || reserva.codigo_reserva || `SISTUR-RES-${reserva.id}`;
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

/** Muestra el ticket en el modal con datos de una reserva */
function mostrarTicket(reserva, paquete) {
  const qrText = reserva.codigo_qr || reserva.codigo_reserva || `SISTUR-RES-${String(reserva.id).padStart(6,'0')}`;
  generateQRCode(qrText, 'qr-code-container');
  document.getElementById('ticket-codigo').textContent = qrText;
  document.getElementById('ticket-tour-nombre').textContent = paquete?.nombre || reserva.paquete_nombre || '-';
  document.getElementById('ticket-fecha').textContent = formatDate(reserva.fecha_reserva || reserva.fecha_tour);
  document.getElementById('ticket-personas').textContent = reserva.pasajeros || reserva.num_personas || '-';
  document.getElementById('ticket-monto').textContent = formatPrice(reserva.precio_total || reserva.monto_total || 0);
  document.getElementById('ticket-cliente').textContent = reserva.usuario?.nombre || reserva.nombre_usuario || state.usuario?.nombre || '-';
  const estadoObj = { pendiente: 'Pendiente', confirmada: 'Confirmada', cancelada: 'Cancelada', completada: 'Completada' };
  document.getElementById('ticket-estado').textContent = estadoObj[(reserva.estado || 'pendiente').toLowerCase()] || 'Pendiente';
  abrirModal('modal-ticket');
}

/** Actualiza los elementos de UI que dependen del estado de sesión */
function actualizarUIParaSesion() {
  verificarSesion();
  const nomEl = document.getElementById('dashboard-user-name');
  const rolEl = document.getElementById('dashboard-role-badge');
  const emailEl = document.getElementById('dashboard-user-email');
  // Bug fix 2.1: ID corregido de 'dashboard-user-avatar' a 'dashboard-avatar'
  const avatarEl = document.getElementById('dashboard-avatar');
  if (state.usuario) {
    if (nomEl) nomEl.textContent = state.usuario.nombre || '';
    if (emailEl) emailEl.textContent = state.usuario.email || '';
    if (rolEl) {
      const rol = state.usuario.rol || 'cliente';
      rolEl.textContent = rol;
      rolEl.className = 'dashboard-role-badge role-' + rol;
    }
    if (avatarEl) avatarEl.textContent = (state.usuario.nombre || 'U')[0].toUpperCase();
  }
}

/* ============================================================
   MÓDULO 7: COTIZADOR
   ============================================================ */

async function handleCotizacion(evento) {
  evento.preventDefault();

  if (!state.usuario) {
    showToast('Debes iniciar sesión para solicitar una cotización.', 'warning');
    mostrarModalLogin(event);
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
  
  // Ocultar WhatsApp flotante solo si es admin
  const waBtn = document.getElementById('whatsapp-float-btn');
  if (waBtn) {
    if (state.usuario && state.usuario.rol === 'admin') {
      waBtn.style.setProperty('display', 'none', 'important');
    } else {
      waBtn.style.setProperty('display', 'flex', 'important');
    }
  }

  const rol = state.usuario?.rol || 'cliente';
  const esAdmin = rol === 'admin' || rol === 'operaciones' || rol === 'guia';

  // Mostrar/ocultar pestañas según rol de manera detallada
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  
  // Ocultar "Mis Reservas" para roles administrativos (solo para clientes)
  const tabMisReservas = document.getElementById('dtab-mis-reservas');
  if (tabMisReservas) {
    tabMisReservas.style.display = (rol === 'cliente') ? 'inline-flex' : 'none';
  }
  
  if (rol === 'admin') {
    ['dtab-all-reservas', 'dtab-manifiesto', 'dtab-tours-admin', 'dtab-usuarios'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'inline-flex';
    });
  } else if (rol === 'operaciones') {
    ['dtab-all-reservas', 'dtab-manifiesto'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'inline-flex';
    });
  } else if (rol === 'guia') {
    ['dtab-manifiesto'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'inline-flex';
    });
  }

  // Cargar datos según rol
  cargarMisReservas();
  if (esAdmin) {
    cargarCotizaciones_Admin();
  }
  actualizarUIParaSesion();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function ocultarDashboard() {
  document.getElementById('landing-page').style.display = '';
  document.getElementById('dashboard-section').classList.remove('visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Restaurar WhatsApp flotante al salir del dashboard
  const waBtn = document.getElementById('whatsapp-float-btn');
  if (waBtn) {
    waBtn.style.setProperty('display', 'flex', 'important');
  }
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
        <td><span class="ticket-code" style="font-size:0.75rem;padding:3px 10px;">${r.codigo_qr || r.codigo_reserva || `SISTUR-${String(r.id).padStart(6,'0')}`}</span></td>
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

window.mostrarTicketGlobal = (idx) => {
  const r = state.todasReservas[idx];
  const paquete = r.paquete || { nombre: r.nombre_paquete || r.paquete_nombre || `Tour #${r.id_paquete}`, precio: r.precio_total / (r.pasajeros || r.num_personas || 1) };
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
    state.todasReservas = reservas;
    tbody.innerHTML = reservas.map((r, idx) => `
      <tr>
        <td><span style="font-family:monospace;font-size:0.78rem;color:var(--gold-primary);">${r.codigo_qr || r.codigo_reserva || `SISTUR-${String(r.id).padStart(6,'0')}`}</span></td>
        <td>${r.usuario?.nombre || r.nombre_usuario || `Usuario #${r.id_usuario}`}</td>
        <td>${r.paquete?.nombre || r.nombre_paquete || `Tour #${r.id_paquete}`}</td>
        <td>${formatDate(r.fecha_reserva || r.fecha_tour)}</td>
        <td>${r.pasajeros || r.num_personas}</td>
        <td style="color:var(--gold-primary);font-weight:600;">${formatPrice(r.precio_total || r.monto_total || 0)}</td>
        <td><span class="status-badge status-${(r.estado||'pendiente').toLowerCase()}">${r.estado || 'Pendiente'}</span></td>
        <td>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <select
              class="form-select"
              style="padding:6px 10px;font-size:0.78rem;border-radius:8px;"
              onchange="cambiarEstadoReserva(${r.id}, this.value)"
              aria-label="Cambiar estado de reserva"
            >
              <option value="" disabled selected>Cambiar estado</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              <option value="completada">Completada</option>
            </select>
            <button class="btn btn-ghost btn-sm" onclick="mostrarTicketGlobal(${idx})" style="padding:4px 8px;" title="Ver Ticket">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
            </button>
          </div>
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
        <td><span style="font-family:monospace;font-size:0.78rem;">${r.codigo_qr || r.codigo_reserva || `SISTUR-${String(r.id).padStart(6,'0')}`}</span></td>
        <td><strong>${r.usuario?.nombre || r.nombre_usuario || `Usuario #${r.id_usuario}`}</strong></td>
        <td>${r.usuario?.email || r.email_usuario || '-'}</td>
        <td style="text-align:center;">${r.pasajeros || r.num_personas}</td>
        <td><span class="status-badge status-${(r.estado||'pendiente').toLowerCase()}">${r.estado || 'Pendiente'}</span></td>
        <td>${r.estado === 'confirmada' ? '<i data-lucide="check-circle" class="icon-sm"></i>' : '<i data-lucide="clock" class="icon-sm"></i>'}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--error);padding:2rem;"> ${err.message}</td></tr>`;
  }
}

// Bug fix 3.1: Definir funciones helper que faltaban para cargarTours_Admin
function getBadgeClass(cat) {
  if (cat === 'Tradicional') return 'badge-tradicional';
  if (cat === 'Joya Oculta')  return 'badge-joya';
  if (cat === 'Vivencial')    return 'badge-vivencial';
  return 'badge-tradicional';
}
function getCategoriaEmoji(cat) {
  if (cat === 'Tradicional') return '⭐';
  if (cat === 'Joya Oculta')  return '💎';
  if (cat === 'Vivencial')    return '⛺';
  return '🏔️';
}
function getDiffClass(diff) {
  if (diff === 'Fácil' || diff === 'Facil') return 'diff-easy';
  if (diff === 'Moderada' || diff === 'Moderado') return 'diff-moderate';
  if (diff === 'Alta' || diff === 'Difícil') return 'diff-hard';
  return 'diff-easy';
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
    // Bug fix 3.1: Eliminada referencia a PAQUETES_LOCAL que no existe
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--error);padding:2rem;">Error al cargar los tours. Verifica la conexión.</td></tr>';
    return;
  }

  if (paquetes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">No hay tours registrados.</td></tr>';
    return;
  }

  tbody.innerHTML = paquetes.map(p => `
    <tr>
      <td style="color:var(--text-subtle);">#${p.id}</td>
      <td><strong>${p.nombre}</strong></td>
      <td><span class="tour-badge" style="position:static;">${getCategoriaEmoji(p.categoria)} ${p.categoria}</span></td>
      <td style="color:var(--gold-primary);font-weight:700;">${formatPrice(p.precio)}</td>
      <td>${p.duracion}</td>
      <td>${p.dificultad || '-'}</td>
      <td><span class="status-badge status-confirmada">${p.activo ? 'Activo' : 'Inactivo'}</span></td>
    </tr>
  `).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
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
            <option value="" disabled selected>Cambiar estado</option>
            <option value="nueva">Nueva</option>
            <option value="en_revision">En Revisión</option>
            <option value="cotizada">Cotizada</option>
            <option value="aceptada">Aceptada (Confirmada)</option>
            <option value="rechazada">Rechazada</option>
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
        <td><span class="dashboard-role-badge role-${u.rol || 'cliente'}">${u.rol || 'cliente'}</span></td>
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
            <option value="cliente">Cliente</option>
            <option value="guia">Guía</option>
            <option value="operaciones">Operaciones</option>
            <option value="admin">Admin</option>
          </select>
        </td>
        <!-- Bug fix 5.1: Agregar botones de editar y eliminar que faltaban -->
        <td>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-ghost btn-sm" style="padding:4px 8px;" onclick="abrirModalEditarUsuario(${u.id}, '${(u.nombre||'').replace(/'/g,"'")}', '${u.email}', '${u.rol||'cliente'}', '${u.telefono||''}')" title="Editar usuario">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>
            <button class="btn btn-sm" style="padding:4px 8px;background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3);border-radius:8px;" onclick="handleEliminarUsuario(${u.id}, '${(u.nombre||'').replace(/'/g,"'")}')" title="Eliminar usuario">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          </div>
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
    
    // Si estamos en la pestaña de todas las reservas, recargarla
    const allReservasTab = document.getElementById('dtab-all-reservas');
    if (allReservasTab && allReservasTab.classList.contains('active')) {
      cargarTodasReservas();
    }
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
  loadSession();
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

  console.log('%c SisturPuno - Frontend cargado', 'color:#FFB300;font-size:14px;font-weight:bold;');
  console.log('%cTurismo & Experiencias Puno S.A.C. | RUC: 20609876541', 'color:#94A3B8;font-size:12px;');
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

/* ============================================================
   MÓDULO 12: CRUD USUARIOS Y PERFIL
   ============================================================ */
function abrirModalNuevoUsuario(event) {
  document.getElementById('form-usuario').reset();
  document.getElementById('user-edit-id').value = '';
  document.getElementById('modal-usuario-title').textContent = 'Nuevo Usuario';
  document.getElementById('grp-us-password').style.display = '';
  document.getElementById('us-password').required = true;
  abrirModal('modal-usuario', event || null);
}

function abrirModalEditarUsuario(id, nombre, email, rol, telefono, event) {
  document.getElementById('form-usuario').reset();
  document.getElementById('user-edit-id').value = id;
  document.getElementById('us-nombre').value = nombre;
  document.getElementById('us-email').value = email;
  document.getElementById('us-rol').value = rol;
  document.getElementById('us-telefono').value = telefono !== 'undefined' && telefono ? telefono : '';

  document.getElementById('modal-usuario-title').textContent = 'Editar Usuario';
  document.getElementById('grp-us-password').style.display = 'none';
  document.getElementById('us-password').required = false;
  abrirModal('modal-usuario', event || null);
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
    localStorage.setItem('sistur_usuario', JSON.stringify(state.usuario));
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
  // Bug fix 4.5: Corregidos errores tipográficos en el mensaje de WhatsApp
  const mensaje = "Hola, quiero pagar mi reserva de tour.\nTour: " + (r.nombre_paquete || r.paquete_nombre || r.paquete?.nombre || 'Tour') + "\nFecha: " + formatDate(r.fecha_reserva) + "\nCódigo: " + (r.codigo_qr || r.codigo_reserva || r.id) + "\nMonto a pagar: " + formatPrice(r.precio_total) + "\nAquí está mi comprobante de pago:";
  const url = "https://wa.me/" + numeroAdmin + "?text=" + encodeURIComponent(mensaje);
  window.open(url, '_blank');
}

/** Descargar ticket en PDF */
window.descargarPDF = function() {
  try {
    if (typeof html2pdf === 'undefined') {
      showToast('Error: Librería PDF no cargada. Intenta recargar la página.', 'error');
      return;
    }
    
    const element = document.getElementById('ticket-card-content');
    if (!element) return;
    
    // Guardamos el color original
    const originalBg = element.style.backgroundColor;
    // Forzamos fondo negro para que el PDF salga igual que el modo oscuro, y ajustamos el padding
    element.style.backgroundColor = '#0a0a0d';
    element.style.padding = '20px';
    element.style.borderRadius = '0'; // Evitar bordes redondeados feos en el PDF

    const reserva = state.reservaActual;
    const codigo = reserva ? (reserva.codigo_qr || reserva.codigo_reserva || reserva.id || 'ticket') : 'ticket';
    
    const opt = {
      margin:       0,
      filename:     `SisturPuno_Ticket_${codigo}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#0a0a0d' },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    showToast('Generando PDF...', 'info');
    
    html2pdf().set(opt).from(element).save().then(() => {
      showToast('¡PDF descargado con éxito!', 'success');
      // Restaurar estilos originales
      element.style.backgroundColor = originalBg;
      element.style.padding = '1.5rem';
      element.style.borderRadius = '16px';
    }).catch(err => {
      console.error("Error generando PDF:", err);
      showToast('Error al generar el PDF', 'error');
      element.style.backgroundColor = originalBg;
    });
  } catch(error) {
    console.error("Excepción en descargarPDF:", error);
    showToast('Ocurrió un error inesperado al exportar', 'error');
  }
}



