/**
 * Controlador: solicitudController
 * Maneja las peticiones HTTP para solicitudes de paquetes turísticos a medida.
 * Rutas: POST /api/cotizaciones, GET /api/cotizaciones/usuario,
 *        GET /api/cotizaciones, PUT /api/cotizaciones/:id/estado
 */

const solicitudService = require('../services/solicitudService');

/**
 * POST /api/cotizaciones
 * Crea una nueva solicitud de paquete personalizado a medida.
 * Requiere: Token JWT válido (cualquier usuario autenticado)
 * Body esperado: { nombre_contacto, email_contacto, telefono_contacto?,
 *                 num_personas?, fecha_viaje?, destinos, servicios?,
 *                 presupuesto?, mensaje? }
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function crear(req, res) {
  try {
    // El ID del usuario viene del token JWT validado por el middleware
    const id_usuario = req.usuario.id;

    // Combinar el id_usuario con los datos del body
    const data = { ...req.body, id_usuario };

    const solicitud = await solicitudService.crearSolicitud(data);

    return res.status(201).json({
      success:   true,
      mensaje:   '¡Solicitud enviada exitosamente! Nos comunicaremos contigo pronto para cotizarte un tour personalizado.',
      solicitud
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al crear la solicitud.'
    });
  }
}

/**
 * GET /api/cotizaciones/usuario
 * Obtiene las solicitudes realizadas por el usuario autenticado.
 * Requiere: Token JWT válido
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function getMisSolicitudes(req, res) {
  try {
    const id_usuario = req.usuario.id;
    const rol        = req.usuario.rol;

    // Obtener solo las solicitudes del usuario actual
    const solicitudes = await solicitudService.getSolicitudes(id_usuario, 'cliente');

    return res.status(200).json({
      success:    true,
      total:      solicitudes.length,
      solicitudes
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al obtener tus solicitudes.'
    });
  }
}

/**
 * GET /api/cotizaciones
 * Obtiene todas las solicitudes del sistema (para gestión interna).
 * Requiere: Token JWT válido + rol 'admin' o 'operaciones'
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function getTodas(req, res) {
  try {
    const id_usuario = req.usuario.id;
    const rol        = req.usuario.rol;

    // El servicio filtra según el rol automáticamente
    const solicitudes = await solicitudService.getSolicitudes(id_usuario, rol);

    return res.status(200).json({
      success:    true,
      total:      solicitudes.length,
      solicitudes
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al obtener las solicitudes.'
    });
  }
}

/**
 * PUT /api/cotizaciones/:id/estado
 * Actualiza el estado de una solicitud a medida.
 * Requiere: Token JWT válido + rol 'admin' o 'operaciones'
 * Body esperado: { estado } - 'nueva', 'en_revision', 'cotizada', 'aceptada', 'rechazada'
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function actualizarEstado(req, res) {
  try {
    const { id }     = req.params;
    const { estado } = req.body;
    const rol        = req.usuario.rol;

    // Validar que el ID sea numérico
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        mensaje: 'El ID de la solicitud debe ser un número válido.'
      });
    }

    if (!estado) {
      return res.status(400).json({
        success: false,
        mensaje: 'El campo estado es obligatorio.'
      });
    }

    const resultado = await solicitudService.actualizarEstado(parseInt(id), estado, rol);

    return res.status(200).json({
      success:    true,
      mensaje:    `Estado de la solicitud actualizado a '${estado}' exitosamente.`,
      solicitud:  resultado
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al actualizar el estado de la solicitud.'
    });
  }
}

module.exports = { crear, getMisSolicitudes, getTodas, actualizarEstado };
