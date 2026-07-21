/**
 * Modelo: Reserva
 * Representa una reserva realizada por un cliente para un paquete turístico.
 * Estados: 'pendiente', 'confirmada', 'cancelada', 'completada'
 */
class Reserva {
  /**
   * @param {number} id              - ID autoincremental
   * @param {string} codigo_reserva  - Código único de reserva (ej: 'RES-0001')
   * @param {number} id_usuario      - ID del usuario que realizó la reserva
   * @param {number} id_paquete      - ID del paquete turístico reservado
   * @param {string} fecha_reserva   - Fecha del tour (YYYY-MM-DD)
   * @param {number} pasajeros       - Número de pasajeros incluidos
   * @param {number} precio_total    - Precio total calculado (precio * pasajeros)
   * @param {string} estado          - Estado actual de la reserva
   * @param {string} codigo_qr       - Texto del código QR para verificación
   * @param {string} notas           - Notas o comentarios adicionales
   * @param {string} created_at      - Fecha de creación de la reserva
   * @param {string} updated_at      - Última actualización
   */
  constructor(id, codigo_reserva, id_usuario, id_paquete, fecha_reserva, pasajeros, precio_total, estado, codigo_qr, notas, created_at, updated_at) {
    this.id             = id;
    this.codigo_reserva = codigo_reserva;
    this.id_usuario     = id_usuario;
    this.id_paquete     = id_paquete;
    this.fecha_reserva  = fecha_reserva;
    this.pasajeros      = parseInt(pasajeros);
    this.precio_total   = parseFloat(precio_total);
    this.estado         = estado;
    this.codigo_qr      = codigo_qr || null;
    this.notas          = notas || null;
    this.created_at     = created_at;
    this.updated_at     = updated_at;
  }

  /**
   * Estados válidos de una reserva
   */
  static ESTADOS = ['pendiente', 'confirmada', 'cancelada', 'completada'];

  /**
   * Valida si un estado es válido
   * @param {string} estado
   * @returns {boolean}
   */
  static esEstadoValido(estado) {
    return Reserva.ESTADOS.includes(estado);
  }

  /**
   * Verifica si la reserva puede ser cancelada
   * Solo se puede cancelar si está en estado 'pendiente' o 'confirmada'
   * @returns {boolean}
   */
  puedeSerCancelada() {
    return ['pendiente', 'confirmada'].includes(this.estado);
  }
}

module.exports = Reserva;
