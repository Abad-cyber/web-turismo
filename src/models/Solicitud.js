/**
 * Modelo: Solicitud
 * Representa una solicitud de paquete turístico personalizado a medida.
 * El cliente puede pedir un tour con destinos, servicios y presupuesto específico.
 * Estados: 'nueva', 'en_revision', 'cotizada', 'aceptada', 'rechazada'
 */
class Solicitud {
  /**
   * @param {number} id                  - ID autoincremental
   * @param {number} id_usuario          - ID del usuario que realizó la solicitud
   * @param {string} nombre_contacto     - Nombre del solicitante
   * @param {string} email_contacto      - Email de contacto para respuesta
   * @param {string} telefono_contacto   - Teléfono de contacto (opcional)
   * @param {number} num_personas        - Cantidad de personas en el grupo
   * @param {string} fecha_viaje         - Fecha tentativa del viaje (YYYY-MM-DD)
   * @param {string} destinos            - Destinos o lugares de interés solicitados
   * @param {string} servicios           - Servicios adicionales requeridos
   * @param {string} presupuesto         - Rango de presupuesto estimado
   * @param {string} mensaje             - Mensaje adicional o requerimientos especiales
   * @param {string} estado              - Estado actual de la solicitud
   * @param {string} created_at          - Fecha de creación
   * @param {string} updated_at          - Última actualización
   */
  constructor(
    id, id_usuario, nombre_contacto, email_contacto, telefono_contacto,
    num_personas, fecha_viaje, destinos, servicios, presupuesto,
    mensaje, estado, created_at, updated_at
  ) {
    this.id                 = id;
    this.id_usuario         = id_usuario;
    this.nombre_contacto    = nombre_contacto;
    this.email_contacto     = email_contacto;
    this.telefono_contacto  = telefono_contacto || null;
    this.num_personas       = parseInt(num_personas) || 1;
    this.fecha_viaje        = fecha_viaje || null;
    this.destinos           = destinos;
    this.servicios          = servicios || null;
    this.presupuesto        = presupuesto || null;
    this.mensaje            = mensaje || null;
    this.estado             = estado;
    this.created_at         = created_at;
    this.updated_at         = updated_at;
  }

  /**
   * Estados válidos de una solicitud a medida
   */
  static ESTADOS = ['nueva', 'en_revision', 'cotizada', 'aceptada', 'rechazada'];

  /**
   * Valida si un estado es válido para las solicitudes
   * @param {string} estado
   * @returns {boolean}
   */
  static esEstadoValido(estado) {
    return Solicitud.ESTADOS.includes(estado);
  }
}

module.exports = Solicitud;
