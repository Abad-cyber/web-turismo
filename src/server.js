/**
 * server.js - Servidor Principal Express
 * Rutas del Altiplano - Agencia de Turismo Puno S.A.C.
 *
 * Configura todos los middlewares, monta las rutas de la API REST
 * y sirve el frontend estático desde src/views.
 *
 * Inicio: npm run dev  (modo desarrollo con --watch)
 *         npm start    (modo producción)
 */

// Cargar variables de entorno desde config/.env ANTES de cualquier otra cosa
require('dotenv').config({
  path: require('path').join(__dirname, '../config/.env')
});

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// Importar middlewares de autenticación y control de roles
const { verificarToken, verificarRol } = require('./middleware/authMiddleware');

// Importar controladores de cada dominio
const authController     = require('./controllers/authController');
const paqueteController  = require('./controllers/paqueteController');
const reservaController  = require('./controllers/reservaController');
const solicitudController = require('./controllers/solicitudController');
const usuarioController  = require('./controllers/usuarioController');

// Inicializar la aplicación Express
const app = express();

// ============================================================
// CONFIGURACIÓN DE MIDDLEWARES GLOBALES
// ============================================================

// CORS: Permitir peticiones desde cualquier origen (ajustar en producción)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser de JSON: Permite leer req.body en formato JSON
app.use(express.json());

// Parser de URL encoded: Para formularios HTML tradicionales
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos: Servir el frontend desde la carpeta src/views
// Imágenes, CSS, JS del cliente serán accesibles desde la raíz '/'
app.use(express.static(path.join(__dirname, 'views')));

// ============================================================
// RUTAS DE LA API REST
// ============================================================

// ----------------------------------------------------------
// AUTH: Registro, Login y Perfil de Usuario
// ----------------------------------------------------------
// POST /api/auth/register - Registrar nuevo usuario
app.post('/api/auth/register', authController.register);

// POST /api/auth/login - Iniciar sesión y obtener token JWT
app.post('/api/auth/login', authController.login);

// GET /api/auth/profile - Ver perfil del usuario autenticado
app.get('/api/auth/profile', verificarToken, authController.getProfile);

// PUT /api/auth/profile - Actualizar perfil del usuario autenticado
app.put('/api/auth/profile', verificarToken, authController.updateProfile);

// ----------------------------------------------------------
// PAQUETES TURÍSTICOS: Catálogo y CRUD (admin)
// ----------------------------------------------------------
// GET /api/paquetes?categoria=xxx - Ver catálogo (público, sin auth)
app.get('/api/paquetes', paqueteController.getCatalogo);

// GET /api/paquetes/:id - Ver detalle de un paquete (público, sin auth)
app.get('/api/paquetes/:id', paqueteController.getDetalle);

// POST /api/paquetes - Crear nuevo paquete (solo admin)
app.post('/api/paquetes',
  verificarToken,
  verificarRol('admin'),
  paqueteController.crear
);

// PUT /api/paquetes/:id - Actualizar paquete (solo admin)
app.put('/api/paquetes/:id',
  verificarToken,
  verificarRol('admin'),
  paqueteController.actualizar
);

// DELETE /api/paquetes/:id - Eliminar paquete lógicamente (solo admin)
app.delete('/api/paquetes/:id',
  verificarToken,
  verificarRol('admin'),
  paqueteController.eliminar
);

// ----------------------------------------------------------
// RESERVAS: Gestión de Reservas Turísticas
// ----------------------------------------------------------
// POST /api/reservas - Crear una reserva (cualquier usuario autenticado)
app.post('/api/reservas',
  verificarToken,
  reservaController.crear
);

// GET /api/reservas/usuario - Ver MIS reservas (usuario autenticado)
// IMPORTANTE: Esta ruta debe ir ANTES de /api/reservas/:id para no colisionar
app.get('/api/reservas/usuario',
  verificarToken,
  reservaController.getMisReservas
);

// GET /api/reservas - Ver TODAS las reservas (admin, operaciones, guia)
app.get('/api/reservas',
  verificarToken,
  verificarRol('admin', 'operaciones', 'guia'),
  reservaController.getTodas
);

// PUT /api/reservas/:id/estado - Cambiar estado de reserva (admin, operaciones)
app.put('/api/reservas/:id/estado',
  verificarToken,
  verificarRol('admin', 'operaciones'),
  reservaController.cambiarEstado
);

// ----------------------------------------------------------
// COTIZACIONES / SOLICITUDES A MEDIDA: Paquetes Personalizados
// ----------------------------------------------------------
// POST /api/cotizaciones - Crear solicitud personalizada (usuario autenticado)
app.post('/api/cotizaciones',
  verificarToken,
  solicitudController.crear
);

// GET /api/cotizaciones/usuario - Ver MIS solicitudes (usuario autenticado)
// IMPORTANTE: Esta ruta debe ir ANTES de /api/cotizaciones/:id/estado
app.get('/api/cotizaciones/usuario',
  verificarToken,
  solicitudController.getMisSolicitudes
);

// GET /api/cotizaciones - Ver TODAS las solicitudes (admin, operaciones)
app.get('/api/cotizaciones',
  verificarToken,
  verificarRol('admin', 'operaciones'),
  solicitudController.getTodas
);

// PUT /api/cotizaciones/:id/estado - Actualizar estado solicitud (admin, operaciones)
app.put('/api/cotizaciones/:id/estado',
  verificarToken,
  verificarRol('admin', 'operaciones'),
  solicitudController.actualizarEstado
);

// ----------------------------------------------------------
// USUARIOS: Gestión de Cuentas (solo admin)
// ----------------------------------------------------------
// GET /api/usuarios - Listar todos los usuarios (solo admin)
app.get('/api/usuarios',
  verificarToken,
  verificarRol('admin'),
  usuarioController.getAll
);

// POST /api/usuarios - Crear usuario (solo admin)
app.post('/api/usuarios',
  verificarToken,
  verificarRol('admin'),
  usuarioController.crear
);

// PUT /api/usuarios/:id - Actualizar usuario (solo admin)
app.put('/api/usuarios/:id',
  verificarToken,
  verificarRol('admin'),
  usuarioController.actualizar
);

// PUT /api/usuarios/:id/rol - Cambiar rol de usuario (solo admin)
app.put('/api/usuarios/:id/rol',
  verificarToken,
  verificarRol('admin'),
  usuarioController.updateRol
);

// DELETE /api/usuarios/:id - Eliminar usuario (solo admin)
app.delete('/api/usuarios/:id',
  verificarToken,
  verificarRol('admin'),
  usuarioController.eliminar
);

// ============================================================
// RUTA CATCH-ALL: SPA (Single Page Application)
// Servir index.html para cualquier ruta que no sea de la API
// Esto permite que el frontend maneje su propio enrutamiento
// ============================================================
app.get('*', (req, res) => {
  // Solo servir el frontend si la ruta no empieza con /api
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  } else {
    // Ruta de API no encontrada
    res.status(404).json({
      success: false,
      mensaje: `La ruta de API '${req.method} ${req.path}' no existe.`
    });
  }
});

// ============================================================
// INICIO DEL SERVIDOR
// ============================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('🏔️  ================================================');
  console.log('🦙  Rutas del Altiplano - Agencia de Turismo Puno');
  console.log('🏔️  ================================================');
  console.log(`🚀  Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`📡  API REST disponible en: http://localhost:${PORT}/api`);
  console.log(`🌍  Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📋  Endpoints disponibles:');
  console.log(`     POST   /api/auth/register`);
  console.log(`     POST   /api/auth/login`);
  console.log(`     GET    /api/auth/profile`);
  console.log(`     GET    /api/paquetes`);
  console.log(`     GET    /api/paquetes/:id`);
  console.log(`     POST   /api/reservas`);
  console.log(`     GET    /api/reservas/usuario`);
  console.log(`     GET    /api/reservas`);
  console.log(`     POST   /api/cotizaciones`);
  console.log(`     GET    /api/cotizaciones/usuario`);
  console.log(`     GET    /api/usuarios`);
  console.log('');
  console.log('💡  Admin por defecto: admin@rutasdelaltiplano.pe / admin123');
  console.log('🏔️  ================================================');
  console.log('');
});

module.exports = app;
