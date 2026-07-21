/**
 * Servicio: reservaService
 * Lógica de negocio para la gestión de reservas turísticas.
 * Verifica cupos disponibles, calcula totales y genera códigos QR.
 */

const reservaRepo = require('../repositories/reservaRepository');
const paqueteRepo = require('../repositories/paqueteRepository');
const usuarioRepo = require('../repositories/usuarioRepository');
const Reserva     = require('../models/Reserva');
const emailService= require('./emailService');

// Roles que pueden ver todas las reservas del sistema
const ROLES_GESTION = ['admin', 'operaciones', 'guia'];

// Roles que pueden cambiar el estado de las reservas
const ROLES_CAMBIO_ESTADO = ['admin', 'operaciones'];

/**
 * Crea una nueva reserva verificando disponibilidad de cupos.
 * Calcula el precio total, genera el código QR y actualiza los cupos del paquete.
 * @param {number} id_usuario    - ID del usuario que realiza la reserva
 * @param {number} id_paquete    - ID del paquete a reservar
 * @param {string} fecha_reserva - Fecha del tour (YYYY-MM-DD)
 * @param {number} pasajeros     - Número de pasajeros
 * @param {string} notas         - Notas adicionales (opcional)
 * @returns {Promise<Object>} Datos de la reserva creada con código QR
 * @throws {Error} Si no hay cupos disponibles o el paquete no existe
 */
async function crearReserva(id_usuario, id_paquete, fecha_reserva, pasajeros, notas = null) {
  // Verificar que el paquete existe y está activo
  const paquete = await paqueteRepo.findById(id_paquete);
  if (!paquete || !paquete.activo) {
    const error = new Error('El paquete turístico seleccionado no está disponible.');
    error.status = 404;
    throw error;
  }

  // Validar número de pasajeros
  const numPasajeros = parseInt(pasajeros);
  if (!numPasajeros || numPasajeros < 1) {
    const error = new Error('El número de pasajeros debe ser al menos 1.');
    error.status = 400;
    throw error;
  }

  // Verificar que hay cupos suficientes disponibles
  if (paquete.cupos < numPasajeros) {
    const error = new Error(
      `No hay suficientes cupos disponibles. Cupos actuales: ${paquete.cupos}, pasajeros solicitados: ${numPasajeros}.`
    );
    error.status = 409; // Conflict
    throw error;
  }

  // Validar que se proporcionó fecha de reserva
  if (!fecha_reserva) {
    const error = new Error('La fecha del tour es un campo obligatorio.');
    error.status = 400;
    throw error;
  }

  // Calcular el precio total de la reserva
  const precio_total = parseFloat((paquete.precio * numPasajeros).toFixed(2));

  // Generar código temporal de reserva para el QR (se actualizará con el ID real)
  // El codigo_reserva definitivo lo genera el repositorio
  const fechaFormateada = new Date(fecha_reserva).toISOString().split('T')[0];

  // Crear la reserva en la base de datos
  const result = await reservaRepo.create({
    id_usuario,
    id_paquete,
    fecha_reserva,
    pasajeros: numPasajeros,
    precio_total,
    codigo_qr: null,  // Se actualizará a continuación con el código real
    notas
  });

  // Generar texto del código QR con el código de reserva real: 'QR-RES-XXXX-fecha'
  const codigo_reserva = result.codigo_reserva;
  const codigo_qr = `QR-${codigo_reserva}-${fechaFormateada}`;

  // Actualizar el codigo_qr en la reserva recién creada
  const [updateResult] = await require('../../config/db').execute(
    'UPDATE reservas SET codigo_qr = ? WHERE id = ?',
    [codigo_qr, result.insertId]
  );

  // Reducir los cupos disponibles del paquete
  const nuevos_cupos = paquete.cupos - numPasajeros;
  await paqueteRepo.updateCupos(id_paquete, nuevos_cupos);

  // Obtener y retornar la reserva creada con todos sus datos
  const reservaCreada = await reservaRepo.findById(result.insertId);

  // Enviar correo de confirmación (sin bloquear si falla)
  try {
    const usuario = await usuarioRepo.findById(id_usuario);
    if (usuario) {
      await emailService.enviarCorreoReserva(
        usuario.nombre,
        usuario.email,
        paquete.nombre, // Se asume que el paquete tiene un campo nombre
        fecha_reserva,
        numPasajeros,
        precio_total,
        codigo_reserva
      );
    }
  } catch (error) {
    console.error('[reservaService] Error al enviar correo de reserva:', error.message);
  }

  return reservaCreada;
}

/**
 * Obtiene todas las reservas de un usuario específico.
 * @param {number} id_usuario - ID del usuario
 * @returns {Promise<Array>} Lista de reservas del usuario
 */
async function getReservasUsuario(id_usuario) {
  const reservas = await reservaRepo.findByUsuario(id_usuario);
  return reservas;
}

/**
 * Obtiene todas las reservas del sistema (para roles con acceso global).
 * Solo roles 'admin', 'operaciones' y 'guia' pueden ver todas las reservas.
 * @param {string} rol - Rol del usuario que solicita la información
 * @returns {Promise<Array>} Lista completa de reservas
 * @throws {Error} Si el rol no tiene permisos suficientes
 */
async function getTodasReservas(rol) {
  if (!ROLES_GESTION.includes(rol)) {
    const error = new Error('No tienes permisos para ver todas las reservas.');
    error.status = 403;
    throw error;
  }
  const reservas = await reservaRepo.findAll();
  return reservas;
}

/**
 * Cambia el estado de una reserva existente.
 * Solo roles 'admin' y 'operaciones' pueden cambiar estados.
 * Restaura los cupos del paquete si la reserva se cancela.
 * @param {number} id_reserva   - ID de la reserva a modificar
 * @param {string} nuevo_estado - Nuevo estado ('pendiente','confirmada','cancelada','completada')
 * @param {string} rol          - Rol del usuario que realiza el cambio
 * @returns {Promise<Object>} Datos de la reserva actualizada
 * @throws {Error} Si el rol no tiene permisos o el estado es inválido
 */
async function cambiarEstado(id_reserva, nuevo_estado, rol) {
  // Verificar permisos del rol
  if (!ROLES_CAMBIO_ESTADO.includes(rol)) {
    const error = new Error('No tienes permisos para cambiar el estado de las reservas.');
    error.status = 403;
    throw error;
  }

  // Validar que el nuevo estado sea válido
  if (!Reserva.esEstadoValido(nuevo_estado)) {
    const error = new Error(`Estado inválido. Los estados válidos son: ${Reserva.ESTADOS.join(', ')}`);
    error.status = 400;
    throw error;
  }

  // Verificar que la reserva existe
  const reserva = await reservaRepo.findById(id_reserva);
  if (!reserva) {
    const error = new Error(`La reserva con ID ${id_reserva} no fue encontrada.`);
    error.status = 404;
    throw error;
  }

  // Si se cancela la reserva, restaurar los cupos del paquete
  if (nuevo_estado === 'cancelada' && reserva.estado !== 'cancelada') {
    const paquete = await paqueteRepo.findById(reserva.id_paquete);
    if (paquete) {
      const cupos_restaurados = paquete.cupos + reserva.pasajeros;
      await paqueteRepo.updateCupos(reserva.id_paquete, cupos_restaurados);
    }
  }

  // Actualizar el estado de la reserva
  await reservaRepo.updateEstado(id_reserva, nuevo_estado);
  const reservaActualizada = await reservaRepo.findById(id_reserva);
  return reservaActualizada;
}

module.exports = { crearReserva, getReservasUsuario, getTodasReservas, cambiarEstado };
