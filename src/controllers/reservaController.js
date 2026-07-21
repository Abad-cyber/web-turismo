/**
 * Controlador: reservaController
 * Maneja las peticiones HTTP para la gestión de reservas turísticas.
 * Rutas: POST /api/reservas, GET /api/reservas/usuario,
 *        GET /api/reservas, PUT /api/reservas/:id/estado
 */

const reservaService = require('../services/reservaService');

/**
 * POST /api/reservas
 * Crea una nueva reserva para el usuario autenticado.
 * Requiere: Token JWT válido (cualquier rol autenticado)
 * Body esperado: { id_paquete, fecha_reserva, pasajeros, notas? }
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function crear(req, res) {
  try {
    // El usuario autenticado viene del middleware verificarToken
    const id_usuario = req.usuario.id;
    const { id_paquete, fecha_reserva, pasajeros, notas } = req.body;

    // Validar campos obligatorios
    if (!id_paquete || !fecha_reserva || !pasajeros) {
      return res.status(400).json({
        success: false,
        mensaje: 'Los campos id_paquete, fecha_reserva y pasajeros son obligatorios.'
      });
    }

    const reserva = await reservaService.crearReserva(
      id_usuario,
      parseInt(id_paquete),
      fecha_reserva,
      parseInt(pasajeros),
      notas || null
    );

    return res.status(201).json({
      success: true,
      mensaje: '¡Reserva creada exitosamente! Te esperamos en Puno.',
      reserva
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al crear la reserva.'
    });
  }
}

/**
 * GET /api/reservas/usuario
 * Obtiene todas las reservas del usuario autenticado.
 * Requiere: Token JWT válido
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function getMisReservas(req, res) {
  try {
    // Obtener el ID del usuario desde el token JWT decodificado
    const id_usuario = req.usuario.id;

    const reservas = await reservaService.getReservasUsuario(id_usuario);

    return res.status(200).json({
      success:  true,
      total:    reservas.length,
      reservas
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al obtener tus reservas.'
    });
  }
}

/**
 * GET /api/reservas
 * Obtiene todas las reservas del sistema (para gestión interna).
 * Requiere: Token JWT válido + rol 'admin', 'operaciones' o 'guia'
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function getTodas(req, res) {
  try {
    const rol = req.usuario.rol;

    const reservas = await reservaService.getTodasReservas(rol);

    return res.status(200).json({
      success:  true,
      total:    reservas.length,
      reservas
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al obtener las reservas.'
    });
  }
}

/**
 * PUT /api/reservas/:id/estado
 * Cambia el estado de una reserva existente.
 * Requiere: Token JWT válido + rol 'admin' o 'operaciones'
 * Body esperado: { estado } - 'pendiente', 'confirmada', 'cancelada', 'completada'
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function cambiarEstado(req, res) {
  try {
    const { id }    = req.params;
    const { estado } = req.body;
    const rol        = req.usuario.rol;

    // Validar que se proporcionó el ID y el estado
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        mensaje: 'El ID de la reserva debe ser un número válido.'
      });
    }

    if (!estado) {
      return res.status(400).json({
        success: false,
        mensaje: 'El campo estado es obligatorio.'
      });
    }

    const reservaActualizada = await reservaService.cambiarEstado(parseInt(id), estado, rol);

    return res.status(200).json({
      success: true,
      mensaje: `Estado de la reserva actualizado a '${estado}' exitosamente.`,
      reserva: reservaActualizada
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al cambiar el estado de la reserva.'
    });
  }
}

module.exports = { crear, getMisReservas, getTodas, cambiarEstado };
