/**
 * Controlador: paqueteController
 * Maneja las peticiones HTTP para el catálogo de paquetes turísticos.
 * Rutas: GET /api/paquetes, GET /api/paquetes/:id, POST /api/paquetes,
 *        PUT /api/paquetes/:id, DELETE /api/paquetes/:id
 */

const paqueteService = require('../services/paqueteService');

/**
 * GET /api/paquetes?categoria=xxx
 * Obtiene el catálogo de paquetes activos, con filtro opcional por categoría.
 * Query param: categoria (opcional) - 'Tradicional', 'Joya Oculta', 'Vivencial'
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function getCatalogo(req, res) {
  try {
    // Extraer parámetro de categoría del query string
    const { categoria } = req.query;

    const paquetes = await paqueteService.getCatalogo(categoria || null);

    return res.status(200).json({
      success:  true,
      total:    paquetes.length,
      paquetes
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al obtener el catálogo de paquetes.'
    });
  }
}

/**
 * GET /api/paquetes/:id
 * Obtiene el detalle completo de un paquete turístico específico.
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function getDetalle(req, res) {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número válido
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        mensaje: 'El ID del paquete debe ser un número válido.'
      });
    }

    const paquete = await paqueteService.getDetalle(parseInt(id));

    return res.status(200).json({
      success: true,
      paquete
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al obtener el detalle del paquete.'
    });
  }
}

/**
 * POST /api/paquetes
 * Crea un nuevo paquete turístico. Solo para administradores.
 * Requiere: Token JWT válido + rol 'admin'
 * Body esperado: { nombre, categoria, precio, duracion, altitud?, dificultad?, cupos?, descripcion?, imagen? }
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function crear(req, res) {
  try {
    // req.usuario es inyectado por el middleware verificarToken
    const adminRol = req.usuario.rol;

    const nuevoPaquete = await paqueteService.crearPaquete(req.body, adminRol);

    return res.status(201).json({
      success: true,
      mensaje: 'Paquete turístico creado exitosamente.',
      paquete: nuevoPaquete
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al crear el paquete turístico.'
    });
  }
}

/**
 * PUT /api/paquetes/:id
 * Actualiza un paquete turístico existente. Solo para administradores.
 * Requiere: Token JWT válido + rol 'admin'
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const adminRol = req.usuario.rol;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        mensaje: 'El ID del paquete debe ser un número válido.'
      });
    }

    const paqueteActualizado = await paqueteService.actualizarPaquete(parseInt(id), req.body, adminRol);

    return res.status(200).json({
      success: true,
      mensaje: 'Paquete turístico actualizado exitosamente.',
      paquete: paqueteActualizado
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al actualizar el paquete turístico.'
    });
  }
}

/**
 * DELETE /api/paquetes/:id
 * Elimina (desactiva) un paquete turístico. Solo para administradores.
 * La eliminación es lógica (el registro permanece con activo=0).
 * Requiere: Token JWT válido + rol 'admin'
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function eliminar(req, res) {
  try {
    const { id } = req.params;
    const adminRol = req.usuario.rol;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        mensaje: 'El ID del paquete debe ser un número válido.'
      });
    }

    await paqueteService.eliminarPaquete(parseInt(id), adminRol);

    return res.status(200).json({
      success: true,
      mensaje: 'Paquete turístico eliminado del catálogo exitosamente.'
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al eliminar el paquete turístico.'
    });
  }
}

module.exports = { getCatalogo, getDetalle, crear, actualizar, eliminar };
