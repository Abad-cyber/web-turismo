/**
 * Servicio: solicitudService
 * Lógica de negocio para la gestión de solicitudes de paquetes a medida.
 * Coordina la creación, consulta y actualización de estado de solicitudes.
 */

const solicitudRepo = require('../repositories/solicitudRepository');
const Solicitud     = require('../models/Solicitud');

// Roles que pueden ver todas las solicitudes del sistema
const ROLES_GESTION = ['admin', 'operaciones'];

/**
 * Crea una nueva solicitud de paquete personalizado a medida.
 * Valida los datos obligatorios antes de persistir en la base de datos.
 * @param {Object} data - Datos de la solicitud
 * @param {number} data.id_usuario          - ID del usuario solicitante
 * @param {string} data.nombre_contacto     - Nombre del contacto (obligatorio)
 * @param {string} data.email_contacto      - Email de contacto (obligatorio)
 * @param {string} data.telefono_contacto   - Teléfono (opcional)
 * @param {number} data.num_personas        - Número de personas del grupo
 * @param {string} data.fecha_viaje         - Fecha tentativa del viaje
 * @param {string} data.destinos            - Destinos solicitados (obligatorio)
 * @param {string} data.servicios           - Servicios adicionales (opcional)
 * @param {string} data.presupuesto         - Rango de presupuesto (opcional)
 * @param {string} data.mensaje             - Mensaje adicional (opcional)
 * @returns {Promise<Object>} Datos de la solicitud creada
 * @throws {Error} Si los campos obligatorios no están presentes
 */
async function crearSolicitud(data) {
  const { nombre_contacto, email_contacto, destinos, id_usuario } = data;

  // Validar campos obligatorios
  if (!nombre_contacto || !email_contacto || !destinos) {
    const error = new Error('Los campos nombre de contacto, email y destinos son obligatorios.');
    error.status = 400;
    throw error;
  }

  // Validar formato básico de email de contacto
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email_contacto)) {
    const error = new Error('El formato del email de contacto no es válido.');
    error.status = 400;
    throw error;
  }

  // Crear la solicitud en la base de datos
  const result = await solicitudRepo.create(data);

  // Retornar la solicitud con sus datos completos
  return {
    id:               result.insertId,
    id_usuario,
    nombre_contacto,
    email_contacto,
    estado:           'nueva',
    ...data
  };
}

/**
 * Obtiene las solicitudes según el rol del usuario.
 * - Roles 'admin' y 'operaciones': ven todas las solicitudes del sistema.
 * - Clientes y otros roles: ven solo sus propias solicitudes.
 * @param {number} id_usuario - ID del usuario que solicita la información
 * @param {string} rol        - Rol del usuario autenticado
 * @returns {Promise<Array>} Lista de solicitudes filtrada según el rol
 */
async function getSolicitudes(id_usuario, rol) {
  if (ROLES_GESTION.includes(rol)) {
    // Administradores y operaciones ven todas las solicitudes
    return await solicitudRepo.findAll();
  }
  // Clientes solo ven sus propias solicitudes
  return await solicitudRepo.findByUsuario(id_usuario);
}

/**
 * Actualiza el estado de una solicitud a medida.
 * Solo roles 'admin' y 'operaciones' pueden modificar el estado.
 * @param {number} id     - ID de la solicitud a actualizar
 * @param {string} estado - Nuevo estado de la solicitud
 * @param {string} rol    - Rol del usuario que realiza el cambio
 * @returns {Promise<Object>} Resultado de la actualización
 * @throws {Error} Si el rol no tiene permisos o el estado es inválido
 */
async function actualizarEstado(id, estado, rol) {
  // Verificar que el rol tiene permisos para cambiar estados
  if (!ROLES_GESTION.includes(rol)) {
    const error = new Error('No tienes permisos para actualizar el estado de las solicitudes.');
    error.status = 403;
    throw error;
  }

  // Validar que el estado proporcionado sea uno de los estados válidos
  if (!Solicitud.esEstadoValido(estado)) {
    const error = new Error(`Estado inválido. Los estados válidos son: ${Solicitud.ESTADOS.join(', ')}`);
    error.status = 400;
    throw error;
  }

  // Actualizar el estado en la base de datos
  const result = await solicitudRepo.updateEstado(id, estado);

  // Verificar que la solicitud existía y fue actualizada
  if (result.affectedRows === 0) {
    const error = new Error(`La solicitud con ID ${id} no fue encontrada.`);
    error.status = 404;
    throw error;
  }

  return { id, estado, actualizado: true };
}

module.exports = { crearSolicitud, getSolicitudes, actualizarEstado };
