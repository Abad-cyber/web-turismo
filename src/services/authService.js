/**
 * Servicio: authService
 * Lógica de negocio para autenticación y autorización.
 * Gestiona el registro de usuarios y el inicio de sesión con JWT.
 */

const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const usuarioRepo = require('../repositories/usuarioRepository');
const emailService= require('./emailService');

// Número de rondas para el hash bcrypt (10 es el estándar recomendado)
const SALT_ROUNDS = 10;

// Tiempo de expiración del token JWT
const JWT_EXPIRES = '24h';

/**
 * Registra un nuevo usuario en el sistema.
 * Hashea la contraseña con bcrypt antes de almacenarla.
 * @param {string} nombre    - Nombre completo del usuario
 * @param {string} email     - Email único del usuario
 * @param {string} password  - Contraseña en texto plano (se hasheará)
 * @param {string} rol       - Rol del usuario (default: 'cliente')
 * @param {string} telefono  - Teléfono de contacto (opcional)
 * @returns {Promise<Object>} Datos del usuario registrado (sin password)
 * @throws {Error} Si el email ya está registrado o los datos son inválidos
 */
async function register(nombre, email, password, rol = 'cliente', telefono = null) {
  // Verificar que el email no esté ya registrado
  const usuarioExistente = await usuarioRepo.findByEmail(email);
  if (usuarioExistente) {
    const error = new Error('El email ya se encuentra registrado en el sistema.');
    error.status = 409; // Conflict
    throw error;
  }

  // Validar que los campos requeridos estén presentes
  if (!nombre || !email || !password) {
    const error = new Error('Nombre, email y contraseña son campos obligatorios.');
    error.status = 400;
    throw error;
  }

  // Validar que la contraseña tenga al menos 6 caracteres
  if (password.length < 6) {
    const error = new Error('La contraseña debe tener al menos 6 caracteres.');
    error.status = 400;
    throw error;
  }

  // Hashear la contraseña con bcrypt
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Crear el usuario en la base de datos
  const result = await usuarioRepo.create(nombre, email, hashedPassword, rol, telefono);

  // Retornar datos del usuario creado (sin password)
  const nuevoUsuario = await usuarioRepo.findById(result.insertId);

  // Enviar correo de bienvenida (sin bloquear si falla)
  try {
    await emailService.enviarCorreoRegistro(nuevoUsuario.nombre, nuevoUsuario.email);
  } catch (error) {
    console.error('[authService] Error al enviar correo de registro:', error.message);
  }

  // Generar token JWT
  const token = jwt.sign(
    { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, rol: nuevoUsuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  return { usuario: nuevoUsuario, token };
}

/**
 * Autentica un usuario con email y contraseña.
 * Retorna un JWT token válido por 24 horas si las credenciales son correctas.
 * @param {string} email    - Email del usuario
 * @param {string} password - Contraseña en texto plano a verificar
 * @returns {Promise<Object>} Objeto con token JWT y datos del usuario
 * @throws {Error} Si las credenciales son inválidas
 */
async function login(email, password) {
  // Buscar el usuario por email (incluye el hash del password)
  const usuario = await usuarioRepo.findByEmail(email);
  if (!usuario) {
    const error = new Error('Credenciales inválidas. Verifica tu email y contraseña.');
    error.status = 401;
    throw error;
  }

  // Comparar la contraseña ingresada con el hash almacenado en BD
  const passwordValido = await bcrypt.compare(password, usuario.password);
  if (!passwordValido) {
    const error = new Error('Credenciales inválidas. Verifica tu email y contraseña.');
    error.status = 401;
    throw error;
  }

  // Generar el token JWT con los datos esenciales del usuario como payload
  const payload = {
    id:     usuario.id,
    email:  usuario.email,
    rol:    usuario.rol,
    nombre: usuario.nombre
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });

  // Retornar token y datos del usuario (sin password)
  return {
    token,
    usuario: {
      id:       usuario.id,
      nombre:   usuario.nombre,
      email:    usuario.email,
      rol:      usuario.rol,
      telefono: usuario.telefono
    }
  };
}

module.exports = { register, login };
