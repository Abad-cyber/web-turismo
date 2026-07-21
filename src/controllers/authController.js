/**
 * Controlador: authController
 * Maneja las peticiones HTTP relacionadas con autenticación y usuarios.
 * Rutas: POST /api/auth/register, POST /api/auth/login, GET /api/auth/profile
 */

const authService    = require('../services/authService');
const usuarioRepo    = require('../repositories/usuarioRepository');
const bcrypt         = require('bcryptjs');

/**
 * POST /api/auth/register
 * Registra un nuevo usuario en el sistema.
 * Body esperado: { nombre, email, password, rol?, telefono? }
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function register(req, res) {
  try {
    const { nombre, email, password, rol, telefono } = req.body;

    // Validación básica de campos requeridos en el controlador
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        mensaje: 'Los campos nombre, email y contraseña son obligatorios.'
      });
    }

    // Delegar la lógica al servicio de autenticación
    const authData = await authService.register(nombre, email, password, rol, telefono);

    return res.status(201).json({
      success: true,
      mensaje: '¡Usuario registrado exitosamente! Bienvenido a Rutas del Altiplano.',
      usuario: authData.usuario,
      token: authData.token
    });
  } catch (error) {
    // Retornar el código HTTP definido en el error del servicio o 500 por defecto
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error interno al registrar el usuario.'
    });
  }
}

/**
 * POST /api/auth/login
 * Autentica un usuario y retorna un token JWT válido por 24 horas.
 * Body esperado: { email, password }
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validar que se enviaron las credenciales
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        mensaje: 'El email y la contraseña son campos obligatorios.'
      });
    }

    // Delegar autenticación al servicio
    const resultado = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      mensaje: 'Inicio de sesión exitoso.',
      token:   resultado.token,
      usuario: resultado.usuario
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error interno al iniciar sesión.'
    });
  }
}

/**
 * GET /api/auth/profile
 * Retorna el perfil del usuario autenticado.
 * Requiere: Token JWT válido en el header Authorization.
 * El middleware verificarToken ya añade req.usuario con los datos del token.
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function getProfile(req, res) {
  try {
    // req.usuario es inyectado por el middleware verificarToken
    const id = req.usuario.id;

    // Obtener datos actualizados del usuario desde la base de datos
    const usuario = await usuarioRepo.findById(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado.'
      });
    }

    return res.status(200).json({
      success: true,
      usuario
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      mensaje: error.message || 'Error al obtener el perfil del usuario.'
    });
  }
}

/**
 * PUT /api/auth/profile
 * Actualiza el perfil del usuario autenticado
 */
async function updateProfile(req, res) {
  try {
    const id = req.usuario.id;
    const { nombre, telefono, password_actual, password_nuevo } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, mensaje: 'El nombre es obligatorio.' });
    }

    // Actualizar nombre y teléfono
    await usuarioRepo.updateProfile(id, nombre, telefono);

    // Actualizar contraseña si se envió
    if (password_actual && password_nuevo) {
      // Necesitamos el hash de la contraseña actual, así que buscamos al usuario por email para traer el password
      const usuarioCompleto = await usuarioRepo.findById(id); // findById no trae el password.
      // Modificación: necesito una manera de obtener el password. 
      // Buscar el usuario por email
      const usuarioFull = await usuarioRepo.findByEmail(usuarioCompleto.email);
      
      const passwordValido = await bcrypt.compare(password_actual, usuarioFull.password);
      if (!passwordValido) {
        return res.status(400).json({ success: false, mensaje: 'La contraseña actual es incorrecta.' });
      }

      if (password_nuevo.length < 6) {
        return res.status(400).json({ success: false, mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      }

      const hashedPassword = await bcrypt.hash(password_nuevo, 10);
      await usuarioRepo.updatePassword(id, hashedPassword);
    }

    const usuarioActualizado = await usuarioRepo.findById(id);

    return res.status(200).json({ success: true, mensaje: 'Perfil actualizado exitosamente.', usuario: usuarioActualizado });
  } catch (error) {
    return res.status(500).json({ success: false, mensaje: error.message || 'Error al actualizar el perfil.' });
  }
}

module.exports = { register, login, getProfile, updateProfile };
