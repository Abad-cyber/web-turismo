/**
 * Servicio: paqueteService
 * Lógica de negocio para la gestión del catálogo de paquetes turísticos.
 * Valida datos, verifica permisos y coordina con el repositorio.
 */

const paqueteRepo = require('../repositories/paqueteRepository');
const Paquete     = require('../models/Paquete');

/**
 * Obtiene el catálogo de paquetes activos, con opción de filtrar por categoría.
 * @param {string|null} categoria - Categoría a filtrar o null para todos
 * @returns {Promise<Array>} Lista de paquetes disponibles
 */
async function getCatalogo(categoria = null) {
  // Si se proporciona categoría, validar que sea una válida
  if (categoria && !Paquete.CATEGORIAS.includes(categoria)) {
    const error = new Error(`Categoría inválida. Las categorías válidas son: ${Paquete.CATEGORIAS.join(', ')}`);
    error.status = 400;
    throw error;
  }
  const paquetes = await paqueteRepo.findAll(categoria);
  return paquetes;
}

/**
 * Obtiene el detalle completo de un paquete turístico por su ID.
 * @param {number} id - ID del paquete a buscar
 * @returns {Promise<Object>} Datos del paquete
 * @throws {Error} Si el paquete no existe
 */
async function getDetalle(id) {
  const paquete = await paqueteRepo.findById(id);
  if (!paquete) {
    const error = new Error(`El paquete con ID ${id} no fue encontrado.`);
    error.status = 404;
    throw error;
  }
  return paquete;
}

/**
 * Crea un nuevo paquete turístico en el catálogo.
 * Solo permitido para usuarios con rol 'admin'.
 * @param {Object} data     - Datos del nuevo paquete
 * @param {string} adminRol - Rol del usuario que realiza la acción
 * @returns {Promise<Object>} Datos del paquete creado
 * @throws {Error} Si el rol no es admin o los datos son inválidos
 */
async function crearPaquete(data, adminRol) {
  // Verificar que el usuario tiene permisos de administrador
  if (adminRol !== 'admin') {
    const error = new Error('Solo los administradores pueden crear paquetes turísticos.');
    error.status = 403;
    throw error;
  }

  // Validar campos obligatorios
  const { nombre, categoria, precio, duracion } = data;
  if (!nombre || !categoria || !precio || !duracion) {
    const error = new Error('Los campos nombre, categoría, precio y duración son obligatorios.');
    error.status = 400;
    throw error;
  }

  // Validar que la categoría sea válida
  if (!Paquete.CATEGORIAS.includes(categoria)) {
    const error = new Error(`Categoría inválida. Las categorías válidas son: ${Paquete.CATEGORIAS.join(', ')}`);
    error.status = 400;
    throw error;
  }

  // Validar que el precio sea positivo
  if (parseFloat(precio) <= 0) {
    const error = new Error('El precio debe ser un valor positivo mayor a 0.');
    error.status = 400;
    throw error;
  }

  // Crear el paquete en la base de datos
  const result = await paqueteRepo.create(data);
  const nuevoPaquete = await paqueteRepo.findById(result.insertId);
  return nuevoPaquete;
}

/**
 * Actualiza los datos de un paquete turístico existente.
 * Solo permitido para usuarios con rol 'admin'.
 * @param {number} id       - ID del paquete a actualizar
 * @param {Object} data     - Nuevos datos del paquete
 * @param {string} adminRol - Rol del usuario que realiza la acción
 * @returns {Promise<Object>} Datos del paquete actualizado
 * @throws {Error} Si el rol no es admin, el paquete no existe o los datos son inválidos
 */
async function actualizarPaquete(id, data, adminRol) {
  // Verificar permisos de administrador
  if (adminRol !== 'admin') {
    const error = new Error('Solo los administradores pueden modificar paquetes turísticos.');
    error.status = 403;
    throw error;
  }

  // Verificar que el paquete existe
  const paqueteExistente = await paqueteRepo.findById(id);
  if (!paqueteExistente) {
    const error = new Error(`El paquete con ID ${id} no fue encontrado.`);
    error.status = 404;
    throw error;
  }

  // Validar campos obligatorios en los datos de actualización
  const { nombre, categoria, precio, duracion } = data;
  if (!nombre || !categoria || !precio || !duracion) {
    const error = new Error('Los campos nombre, categoría, precio y duración son obligatorios.');
    error.status = 400;
    throw error;
  }

  // Actualizar el paquete en la base de datos
  await paqueteRepo.update(id, data);
  const paqueteActualizado = await paqueteRepo.findById(id);
  return paqueteActualizado;
}

/**
 * Elimina (desactiva) un paquete turístico del catálogo.
 * Solo permitido para usuarios con rol 'admin'.
 * La eliminación es lógica: el paquete se marca como inactivo.
 * @param {number} id       - ID del paquete a eliminar
 * @param {string} adminRol - Rol del usuario que realiza la acción
 * @returns {Promise<void>}
 * @throws {Error} Si el rol no es admin o el paquete no existe
 */
async function eliminarPaquete(id, adminRol) {
  // Verificar permisos de administrador
  if (adminRol !== 'admin') {
    const error = new Error('Solo los administradores pueden eliminar paquetes turísticos.');
    error.status = 403;
    throw error;
  }

  // Verificar que el paquete existe
  const paqueteExistente = await paqueteRepo.findById(id);
  if (!paqueteExistente) {
    const error = new Error(`El paquete con ID ${id} no fue encontrado.`);
    error.status = 404;
    throw error;
  }

  // Realizar la eliminación lógica (marcar como inactivo)
  await paqueteRepo.delete(id);
}

module.exports = { getCatalogo, getDetalle, crearPaquete, actualizarPaquete, eliminarPaquete };
