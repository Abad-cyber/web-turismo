/**
 * Repositorio: paqueteRepository
 * Acceso a la base de datos para la tabla 'paquetes'.
 * Usa prepared statements (mysql2 con '?') para prevenir SQL Injection.
 */

const pool = require('../../config/db');

/**
 * Obtiene todos los paquetes activos, con opción de filtrar por categoría.
 * @param {string|null} categoria - Categoría a filtrar ('Tradicional','Joya Oculta','Vivencial') o null para todos
 * @returns {Promise<Array>} Lista de paquetes
 */
async function findAll(categoria = null) {
  if (categoria) {
    // Filtrar por categoría específica usando prepared statement
    const [rows] = await pool.execute(
      'SELECT * FROM paquetes WHERE activo = 1 AND categoria = ? ORDER BY id ASC',
      [categoria]
    );
    return rows;
  }
  // Sin filtro: retornar todos los paquetes activos
  const [rows] = await pool.execute(
    'SELECT * FROM paquetes WHERE activo = 1 ORDER BY id ASC'
  );
  return rows;
}

/**
 * Busca un paquete por su ID (incluyendo los inactivos para administración).
 * @param {number} id - ID del paquete a buscar
 * @returns {Promise<Object|null>} Fila del paquete o null si no existe
 */
async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM paquetes WHERE id = ? LIMIT 1',
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Crea un nuevo paquete turístico en la base de datos.
 * @param {Object} data - Datos del paquete a crear
 * @param {string} data.nombre
 * @param {string} data.categoria
 * @param {number} data.precio
 * @param {string} data.duracion
 * @param {string} data.altitud
 * @param {string} data.dificultad
 * @param {number} data.cupos
 * @param {string} data.descripcion
 * @param {string} data.imagen
 * @returns {Promise<Object>} Resultado de la inserción con insertId
 */
async function create(data) {
  const { nombre, categoria, precio, duracion, altitud, dificultad, cupos, descripcion, imagen } = data;
  const [result] = await pool.execute(
    `INSERT INTO paquetes (nombre, categoria, precio, duracion, altitud, dificultad, cupos, descripcion, imagen)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, categoria, precio, duracion, altitud || null, dificultad || 'Fácil', cupos || 10, descripcion || null, imagen || null]
  );
  return result;
}

/**
 * Actualiza los datos de un paquete existente.
 * @param {number} id   - ID del paquete a actualizar
 * @param {Object} data - Datos actualizados del paquete
 * @returns {Promise<Object>} Resultado de la actualización con affectedRows
 */
async function update(id, data) {
  const { nombre, categoria, precio, duracion, altitud, dificultad, cupos, descripcion, imagen, activo } = data;
  const [result] = await pool.execute(
    `UPDATE paquetes
     SET nombre = ?, categoria = ?, precio = ?, duracion = ?, altitud = ?,
         dificultad = ?, cupos = ?, descripcion = ?, imagen = ?, activo = ?
     WHERE id = ?`,
    [nombre, categoria, precio, duracion, altitud || null, dificultad, cupos, descripcion || null, imagen || null, activo !== undefined ? activo : 1, id]
  );
  return result;
}

/**
 * Elimina un paquete de forma lógica (lo marca como inactivo).
 * No se borra físicamente para preservar historial de reservas.
 * @param {number} id - ID del paquete a desactivar
 * @returns {Promise<Object>} Resultado de la actualización con affectedRows
 */
async function deletePaquete(id) {
  // Eliminación lógica: marcar como inactivo en vez de borrar el registro
  const [result] = await pool.execute(
    'UPDATE paquetes SET activo = 0 WHERE id = ?',
    [id]
  );
  return result;
}

/**
 * Actualiza el número de cupos disponibles de un paquete.
 * Se usa al confirmar o cancelar reservas.
 * @param {number} id    - ID del paquete
 * @param {number} cupos - Nuevo número de cupos disponibles
 * @returns {Promise<Object>} Resultado de la actualización
 */
async function updateCupos(id, cupos) {
  const [result] = await pool.execute(
    'UPDATE paquetes SET cupos = ? WHERE id = ?',
    [cupos, id]
  );
  return result;
}

module.exports = { findAll, findById, create, update, delete: deletePaquete, updateCupos };
