/**
 * Repositorio: reservaRepository
 * Acceso a la base de datos para la tabla 'reservas'.
 * Usa prepared statements (mysql2 con '?') para prevenir SQL Injection.
 * Las consultas JOIN incluyen datos del usuario y del paquete para presentación.
 */

const pool = require('../../config/db');

/**
 * Genera un código de reserva único en formato 'RES-XXXX'.
 * Busca el último ID insertado para crear el siguiente código correlativo.
 * @returns {Promise<string>} Código de reserva generado (ej: 'RES-0042')
 */
async function generarCodigo() {
  const [rows] = await pool.execute(
    'SELECT MAX(id) AS ultimo_id FROM reservas'
  );
  // Incrementar el último ID para generar el siguiente código
  const siguienteId = (rows[0].ultimo_id || 0) + 1;
  return `RES-${String(siguienteId).padStart(4, '0')}`;
}

/**
 * Crea una nueva reserva con código autogenerado 'RES-XXXX'.
 * @param {Object} data              - Datos de la reserva
 * @param {number} data.id_usuario   - ID del usuario que reserva
 * @param {number} data.id_paquete   - ID del paquete turístico reservado
 * @param {string} data.fecha_reserva - Fecha del tour (YYYY-MM-DD)
 * @param {number} data.pasajeros    - Número de pasajeros
 * @param {number} data.precio_total - Precio total calculado
 * @param {string} data.codigo_qr   - Texto del código QR para verificación
 * @param {string} data.notas       - Notas adicionales (opcional)
 * @returns {Promise<Object>} Resultado con insertId y codigo_reserva generado
 */
/**
 * Crea una nueva reserva y genera el código basándose en el insertId.
 * Bug fix 8.1: Eliminada la race condition de generarCodigo() con MAX(id).
 * El código se genera DESPUÉS del INSERT usando el insertId real.
 */
async function create(data) {
  const { id_usuario, id_paquete, fecha_reserva, pasajeros, precio_total, codigo_qr, notas } = data;

  // Insertar con código temporal único basado en timestamp para evitar colisiones
  const tempCode = `T-${Math.floor(Math.random()*999999999)}`;

  const [result] = await pool.execute(
    `INSERT INTO reservas (codigo_reserva, id_usuario, id_paquete, fecha_reserva, pasajeros, precio_total, codigo_qr, notas)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [tempCode, id_usuario, id_paquete, fecha_reserva, pasajeros, precio_total, codigo_qr || null, notas || null]
  );

  // Generar el código definitivo con el insertId real (sin race condition)
  const codigo_reserva = `RES-${String(result.insertId).padStart(4, '0')}`;
  await pool.execute('UPDATE reservas SET codigo_reserva = ? WHERE id = ?', [codigo_reserva, result.insertId]);

  return { ...result, codigo_reserva };
}

/**
 * Obtiene todas las reservas del sistema con datos del usuario y paquete (JOIN).
 * Ordenadas por fecha de creación descendente (más recientes primero).
 * @returns {Promise<Array>} Lista completa de reservas con datos relacionados
 */
async function findAll() {
  const [rows] = await pool.execute(
    `SELECT
       r.id,
       r.codigo_reserva,
       r.id_usuario,
       r.id_paquete,
       r.fecha_reserva,
       r.pasajeros,
       r.precio_total,
       r.estado,
       r.codigo_qr,
       r.notas,
       r.created_at,
       r.updated_at,
       u.nombre       AS nombre_usuario,
       u.email        AS email_usuario,
       u.telefono     AS telefono_usuario,
       p.nombre       AS nombre_paquete,
       p.categoria    AS categoria_paquete,
       p.duracion     AS duracion_paquete,
       p.imagen       AS imagen_paquete
     FROM reservas r
     INNER JOIN usuarios u ON r.id_usuario = u.id
     INNER JOIN paquetes p ON r.id_paquete = p.id
     ORDER BY r.created_at DESC`
  );
  return rows;
}

/**
 * Obtiene todas las reservas de un usuario específico con datos del paquete (JOIN).
 * @param {number} id_usuario - ID del usuario a consultar
 * @returns {Promise<Array>} Lista de reservas del usuario
 */
async function findByUsuario(id_usuario) {
  const [rows] = await pool.execute(
    `SELECT
       r.id,
       r.codigo_reserva,
       r.id_paquete,
       r.fecha_reserva,
       r.pasajeros,
       r.precio_total,
       r.estado,
       r.codigo_qr,
       r.notas,
       r.created_at,
       r.updated_at,
       p.nombre       AS nombre_paquete,
       p.categoria    AS categoria_paquete,
       p.duracion     AS duracion_paquete,
       p.imagen       AS imagen_paquete
     FROM reservas r
     INNER JOIN paquetes p ON r.id_paquete = p.id
     WHERE r.id_usuario = ?
     ORDER BY r.created_at DESC`,
    [id_usuario]
  );
  return rows;
}

/**
 * Busca una reserva específica por su ID con datos de usuario y paquete (JOIN).
 * @param {number} id - ID de la reserva a buscar
 * @returns {Promise<Object|null>} Datos de la reserva o null si no existe
 */
async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT
       r.*,
       u.nombre   AS nombre_usuario,
       u.email    AS email_usuario,
       p.nombre   AS nombre_paquete,
       p.precio   AS precio_unitario
     FROM reservas r
     INNER JOIN usuarios u ON r.id_usuario = u.id
     INNER JOIN paquetes p ON r.id_paquete = p.id
     WHERE r.id = ? LIMIT 1`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Actualiza el estado de una reserva.
 * Estados válidos: 'pendiente', 'confirmada', 'cancelada', 'completada'
 * @param {number} id      - ID de la reserva a actualizar
 * @param {string} estado  - Nuevo estado de la reserva
 * @returns {Promise<Object>} Resultado de la actualización con affectedRows
 */
async function updateEstado(id, estado) {
  const [result] = await pool.execute(
    'UPDATE reservas SET estado = ? WHERE id = ?',
    [estado, id]
  );
  return result;
}

/**
 * Bug fix 12.1: Actualiza el código QR de una reserva.
 * Movido aquí desde reservaService para cumplir con el patrón de capas.
 */
async function updateCodigoQr(id, codigo_qr) {
  const [result] = await pool.execute(
    'UPDATE reservas SET codigo_qr = ? WHERE id = ?',
    [codigo_qr, id]
  );
  return result;
}

module.exports = { create, findAll, findByUsuario, findById, updateEstado, updateCodigoQr };
