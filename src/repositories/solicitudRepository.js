/**
 * Repositorio: solicitudRepository
 * Acceso a la base de datos para la tabla 'solicitudes_medida'.
 * Usa prepared statements (mysql2 con '?') para prevenir SQL Injection.
 * Gestiona las solicitudes de paquetes turísticos personalizados.
 */

const pool = require('../../config/db');

/**
 * Crea una nueva solicitud a medida en la base de datos.
 * @param {Object} data                      - Datos de la solicitud
 * @param {number} data.id_usuario           - ID del usuario solicitante
 * @param {string} data.nombre_contacto      - Nombre del contacto
 * @param {string} data.email_contacto       - Email para respuesta
 * @param {string} data.telefono_contacto    - Teléfono de contacto
 * @param {number} data.num_personas         - Número de personas en el grupo
 * @param {string} data.fecha_viaje          - Fecha tentativa del viaje
 * @param {string} data.destinos             - Destinos o lugares solicitados
 * @param {string} data.servicios            - Servicios adicionales requeridos
 * @param {string} data.presupuesto          - Rango de presupuesto
 * @param {string} data.mensaje              - Mensaje adicional del cliente
 * @returns {Promise<Object>} Resultado de la inserción con insertId
 */
async function create(data) {
  const {
    id_usuario, nombre_contacto, email_contacto, telefono_contacto,
    num_personas, fecha_viaje, destinos, servicios, presupuesto, mensaje
  } = data;

  const [result] = await pool.execute(
    `INSERT INTO solicitudes_medida
       (id_usuario, nombre_contacto, email_contacto, telefono_contacto,
        num_personas, fecha_viaje, destinos, servicios, presupuesto, mensaje)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id_usuario,
      nombre_contacto,
      email_contacto,
      telefono_contacto || null,
      num_personas || 1,
      fecha_viaje || null,
      destinos,
      servicios || null,
      presupuesto || null,
      mensaje || null
    ]
  );
  return result;
}

/**
 * Obtiene todas las solicitudes del sistema con datos del usuario solicitante (JOIN).
 * Ordenadas por fecha de creación descendente (más nuevas primero).
 * @returns {Promise<Array>} Lista completa de solicitudes
 */
async function findAll() {
  const [rows] = await pool.execute(
    `SELECT
       s.*,
       u.nombre AS nombre_usuario,
       u.email  AS email_usuario
     FROM solicitudes_medida s
     INNER JOIN usuarios u ON s.id_usuario = u.id
     ORDER BY s.created_at DESC`
  );
  return rows;
}

/**
 * Obtiene las solicitudes realizadas por un usuario específico.
 * @param {number} id_usuario - ID del usuario a consultar
 * @returns {Promise<Array>} Lista de solicitudes del usuario
 */
async function findByUsuario(id_usuario) {
  const [rows] = await pool.execute(
    `SELECT * FROM solicitudes_medida
     WHERE id_usuario = ?
     ORDER BY created_at DESC`,
    [id_usuario]
  );
  return rows;
}

/**
 * Actualiza el estado de una solicitud a medida.
 * Estados válidos: 'nueva', 'en_revision', 'cotizada', 'aceptada', 'rechazada'
 * @param {number} id     - ID de la solicitud a actualizar
 * @param {string} estado - Nuevo estado de la solicitud
 * @returns {Promise<Object>} Resultado de la actualización con affectedRows
 */
async function updateEstado(id, estado) {
  const [result] = await pool.execute(
    'UPDATE solicitudes_medida SET estado = ? WHERE id = ?',
    [estado, id]
  );
  return result;
}

module.exports = { create, findAll, findByUsuario, updateEstado };
