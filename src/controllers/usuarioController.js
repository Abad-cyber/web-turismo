/**
 * Controlador: usuarioController
 * Maneja las peticiones HTTP para la gestión de usuarios del sistema.
 * Rutas: GET /api/usuarios, PUT /api/usuarios/:id/rol
 * Acceso restringido solo a rol 'admin'.
 */

const usuarioRepo = require('../repositories/usuarioRepository');
const Usuario     = require('../models/Usuario');
const bcrypt      = require('bcryptjs');

/**
 * GET /api/usuarios
 * Obtiene la lista completa de usuarios registrados en el sistema.
 * Solo accesible para usuarios con rol 'admin'.
 * Requiere: Token JWT válido + rol 'admin'
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function getAll(req, res) {
  try {
    // Obtener todos los usuarios (sin passwords, ya manejado en el repositorio)
    const usuarios = await usuarioRepo.findAll();

    return res.status(200).json({
      success:  true,
      total:    usuarios.length,
      usuarios
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al obtener la lista de usuarios.'
    });
  }
}

/**
 * PUT /api/usuarios/:id/rol
 * Actualiza el rol de un usuario específico.
 * Solo accesible para usuarios con rol 'admin'.
 * Requiere: Token JWT válido + rol 'admin'
 * Body esperado: { rol } - 'admin', 'operaciones', 'guia', 'cliente'
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function updateRol(req, res) {
  try {
    const { id }  = req.params;
    const { rol } = req.body;

    // Validar que el ID sea un número válido
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        mensaje: 'El ID del usuario debe ser un número válido.'
      });
    }

    // Validar que se proporcionó el rol
    if (!rol) {
      return res.status(400).json({
        success: false,
        mensaje: 'El campo rol es obligatorio.'
      });
    }

    // Validar que el rol sea uno de los roles válidos del sistema
    if (!Usuario.esRolValido(rol)) {
      return res.status(400).json({
        success: false,
        mensaje: `Rol inválido. Los roles válidos son: ${Usuario.ROLES.join(', ')}`
      });
    }

    // Verificar que el usuario existe antes de actualizar
    const usuarioExistente = await usuarioRepo.findById(parseInt(id));
    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        mensaje: `Usuario con ID ${id} no encontrado.`
      });
    }

    // Actualizar el rol en la base de datos
    const result = await usuarioRepo.updateRol(parseInt(id), rol);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo actualizar el rol del usuario.'
      });
    }

    // Obtener los datos actualizados del usuario
    const usuarioActualizado = await usuarioRepo.findById(parseInt(id));

    return res.status(200).json({
      success:  true,
      mensaje:  `Rol del usuario actualizado a '${rol}' exitosamente.`,
      usuario:  usuarioActualizado
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al actualizar el rol del usuario.'
    });
  }
}

/**
 * POST /api/usuarios
 * Crea un usuario (Solo admin)
 */
async function crear(req, res) {
  try {
    const { nombre, email, password, rol, telefono } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ success: false, mensaje: 'Faltan campos obligatorios.' });
    }

    if (!Usuario.esRolValido(rol)) {
      return res.status(400).json({ success: false, mensaje: 'Rol inválido.' });
    }

    const existe = await usuarioRepo.findByEmail(email);
    if (existe) {
      return res.status(400).json({ success: false, mensaje: 'El email ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await usuarioRepo.create(nombre, email, hashedPassword, rol, telefono);
    const nuevoUsuario = await usuarioRepo.findById(result.insertId);

    return res.status(201).json({ success: true, mensaje: 'Usuario creado', usuario: nuevoUsuario });
  } catch (error) {
    return res.status(500).json({ success: false, mensaje: error.message || 'Error al crear usuario' });
  }
}

/**
 * PUT /api/usuarios/:id
 * Actualiza un usuario (Solo admin)
 */
async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, rol } = req.body;

    if (!nombre || !email || !rol) {
      return res.status(400).json({ success: false, mensaje: 'Faltan campos obligatorios.' });
    }

    if (!Usuario.esRolValido(rol)) {
      return res.status(400).json({ success: false, mensaje: 'Rol inválido.' });
    }

    const usuarioExistente = await usuarioRepo.findById(id);
    if (!usuarioExistente) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado.' });
    }

    // Verificar si el email ya pertenece a otro usuario
    const emailExistente = await usuarioRepo.findByEmail(email);
    if (emailExistente && emailExistente.id !== parseInt(id)) {
      return res.status(400).json({ success: false, mensaje: 'El email ya está en uso.' });
    }

    await usuarioRepo.update(id, nombre, email, telefono, rol);
    const usuarioActualizado = await usuarioRepo.findById(id);

    return res.status(200).json({ success: true, mensaje: 'Usuario actualizado', usuario: usuarioActualizado });
  } catch (error) {
    return res.status(500).json({ success: false, mensaje: error.message || 'Error al actualizar usuario' });
  }
}

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario (Solo admin)
 */
async function eliminar(req, res) {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ success: false, mensaje: 'No puedes eliminar tu propio usuario.' });
    }

    const usuarioExistente = await usuarioRepo.findById(id);
    if (!usuarioExistente) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado.' });
    }

    await usuarioRepo.deleteById(id);

    return res.status(200).json({ success: true, mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ success: false, mensaje: error.message || 'Error al eliminar usuario' });
  }
}

module.exports = { getAll, updateRol, crear, actualizar, eliminar };
