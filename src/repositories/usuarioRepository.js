/**
 * Repositorio: usuarioRepository
 * Acceso a la base de datos para la tabla 'usuarios'.
 * Usa prepared statements (mysql2 con '?') para prevenir SQL Injection.
 */

const pool = require('../../config/db');

/**
 * Busca un usuario por su dirección de email.
 * @param {string} email - Email del usuario a buscar
 * @returns {Promise<Object|null>} Fila del usuario o null si no existe
 */
async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT * FROM usuarios WHERE email = ? LIMIT 1',
    [email]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Busca un usuario por su ID.
 * @param {number} id - ID del usuario a buscar
 * @returns {Promise<Object|null>} Fila del usuario o null si no existe
 */
async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, nombre, email, rol, telefono, created_at, updated_at FROM usuarios WHERE id = ? LIMIT 1',
    [id]
  );
  // Retornamos sin password por seguridad
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {string} nombre          - Nombre completo del usuario
 * @param {string} email           - Correo electrónico (debe ser único)
 * @param {string} hashedPassword  - Contraseña ya hasheada con bcrypt
 * @param {string} rol             - Rol asignado ('admin','operaciones','guia','cliente')
 * @param {string} telefono        - Teléfono de contacto (puede ser null)
 * @returns {Promise<Object>} Resultado de la inserción con insertId
 */
async function create(nombre, email, hashedPassword, rol, telefono) {
  const [result] = await pool.execute(
    'INSERT INTO usuarios (nombre, email, password, rol, telefono) VALUES (?, ?, ?, ?, ?)',
    [nombre, email, hashedPassword, rol || 'cliente', telefono || null]
  );
  return result;
}

/**
 * Obtiene todos los usuarios del sistema (sin passwords).
 * Ordenados por fecha de creación descendente.
 * @returns {Promise<Array>} Lista de todos los usuarios
 */
async function findAll() {
  const [rows] = await pool.execute(
    'SELECT id, nombre, email, rol, telefono, created_at, updated_at FROM usuarios ORDER BY created_at DESC'
  );
  return rows;
}

/**
 * Actualiza el rol de un usuario específico.
 * @param {number} id  - ID del usuario a actualizar
 * @param {string} rol - Nuevo rol ('admin','operaciones','guia','cliente')
 * @returns {Promise<Object>} Resultado de la actualización con affectedRows
 */
async function updateRol(id, rol) {
  const [result] = await pool.execute(
    'UPDATE usuarios SET rol = ? WHERE id = ?',
    [rol, id]
  );
  return result;
}

/**
 * Actualiza los datos de un usuario.
 * @param {number} id - ID del usuario
 * @param {string} nombre - Nombre completo
 * @param {string} email - Correo electrónico
 * @param {string} telefono - Teléfono
 * @param {string} rol - Rol del usuario
 * @returns {Promise<Object>} Resultado de la actualización
 */
async function update(id, nombre, email, telefono, rol) {
  const [result] = await pool.execute(
    'UPDATE usuarios SET nombre = ?, email = ?, telefono = ?, rol = ? WHERE id = ?',
    [nombre, email, telefono || null, rol, id]
  );
  return result;
}

/**
 * Elimina un usuario por su ID.
 * @param {number} id - ID del usuario a eliminar
 * @returns {Promise<Object>} Resultado de la eliminación
 */
async function deleteById(id) {
  const [result] = await pool.execute(
    'DELETE FROM usuarios WHERE id = ?',
    [id]
  );
  return result;
}

/**
 * Actualiza el perfil (nombre, teléfono) de un usuario.
 * @param {number} id - ID del usuario
 * @param {string} nombre - Nombre completo
 * @param {string} telefono - Teléfono de contacto
 * @returns {Promise<Object>} Resultado de la actualización
 */
async function updateProfile(id, nombre, telefono) {
  const [result] = await pool.execute(
    'UPDATE usuarios SET nombre = ?, telefono = ? WHERE id = ?',
    [nombre, telefono || null, id]
  );
  return result;
}

/**
 * Actualiza la contraseña de un usuario.
 * @param {number} id - ID del usuario
 * @param {string} hashedPassword - Nueva contraseña hasheada
 * @returns {Promise<Object>} Resultado de la actualización
 */
async function updatePassword(id, hashedPassword) {
  const [result] = await pool.execute(
    'UPDATE usuarios SET password = ? WHERE id = ?',
    [hashedPassword, id]
  );
  return result;
}

module.exports = { 
  findByEmail, 
  findById, 
  create, 
  findAll, 
  updateRol,
  update,
  deleteById,
  updateProfile,
  updatePassword
};
