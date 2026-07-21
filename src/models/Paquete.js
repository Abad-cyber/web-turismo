/**
 * Modelo: Paquete
 * Representa un paquete turístico ofrecido por la agencia.
 * Categorías: 'Tradicional', 'Joya Oculta', 'Vivencial'
 * Dificultades: 'Fácil', 'Moderado', 'Difícil'
 */
class Paquete {
  /**
   * @param {number}  id          - ID autoincremental
   * @param {string}  nombre      - Nombre del paquete turístico
   * @param {string}  categoria   - Categoría del paquete
   * @param {number}  precio      - Precio en soles (S/.)
   * @param {string}  duracion    - Duración del recorrido (ej: '1 Día', '½ Día')
   * @param {string}  altitud     - Altitud sobre el nivel del mar
   * @param {string}  dificultad  - Nivel de dificultad física del recorrido
   * @param {number}  cupos       - Número de cupos disponibles
   * @param {string}  descripcion - Descripción detallada del paquete
   * @param {string}  imagen      - Nombre del archivo de imagen
   * @param {boolean} activo      - Si el paquete está disponible para reserva
   * @param {string}  created_at  - Fecha de creación
   * @param {string}  updated_at  - Última actualización
   */
  constructor(id, nombre, categoria, precio, duracion, altitud, dificultad, cupos, descripcion, imagen, activo, created_at, updated_at) {
    this.id          = id;
    this.nombre      = nombre;
    this.categoria   = categoria;
    this.precio      = parseFloat(precio);  // Asegurar tipo numérico
    this.duracion    = duracion;
    this.altitud     = altitud || null;
    this.dificultad  = dificultad;
    this.cupos       = parseInt(cupos);     // Asegurar tipo entero
    this.descripcion = descripcion || null;
    this.imagen      = imagen || null;
    this.activo      = Boolean(activo);
    this.created_at  = created_at;
    this.updated_at  = updated_at;
  }

  /**
   * Categorías válidas de paquetes
   */
  static CATEGORIAS = ['Tradicional', 'Joya Oculta', 'Vivencial'];

  /**
   * Niveles de dificultad válidos
   */
  static DIFICULTADES = ['Fácil', 'Moderado', 'Difícil'];

  /**
   * Valida si hay cupos disponibles para una cantidad de pasajeros
   * @param {number} pasajeros - Número de pasajeros a reservar
   * @returns {boolean}
   */
  tieneCuposDisponibles(pasajeros) {
    return this.cupos >= pasajeros;
  }

  /**
   * Calcula el precio total para un grupo de pasajeros
   * @param {number} pasajeros - Número de pasajeros
   * @returns {number} Precio total calculado
   */
  calcularTotal(pasajeros) {
    return parseFloat((this.precio * pasajeros).toFixed(2));
  }
}

module.exports = Paquete;
