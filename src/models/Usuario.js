/**
 * Modelo: Usuario
 * Representa un usuario registrado en el sistema.
 * Roles disponibles: 'admin', 'operaciones', 'guia', 'cliente'
 */
class Usuario {
  /**
   * @param {number} id         - ID autoincremental
   * @param {string} nombre     - Nombre completo del usuario
   * @param {string} email      - Correo electrónico (único)
   * @param {string} password   - Contraseña hasheada con bcrypt
   * @param {string} rol        - Rol del usuario en el sistema
   * @param {string} telefono   - Número de teléfono (opcional)
   * @param {string} created_at - Fecha de registro
   * @param {string} updated_at - Última actualización
   */
  constructor(id, nombre, email, password, rol, telefono, created_at, updated_at) {
    this.id         = id;
    this.nombre     = nombre;
    this.email      = email;
    this.password   = password;         // Siempre almacenado como hash bcrypt
    this.rol        = rol;
    this.telefono   = telefono || null;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  /**
   * Retorna una representación segura del usuario (sin password)
   * Útil para enviar en respuestas JSON
   */
  toJSON() {
    return {
      id:         this.id,
      nombre:     this.nombre,
      email:      this.email,
      rol:        this.rol,
      telefono:   this.telefono,
      created_at: this.created_at,
      updated_at: this.updated_at
      // 'password' excluido intencionalmente por seguridad
    };
  }

  /**
   * Roles válidos en el sistema
   */
  static ROLES = ['admin', 'operaciones', 'guia', 'cliente'];

  /**
   * Valida si un string es un rol válido
   * @param {string} rol
   * @returns {boolean}
   */
  static esRolValido(rol) {
    return Usuario.ROLES.includes(rol);
  }
}

module.exports = Usuario;
