/**
 * Middleware: authMiddleware
 * Verifica la autenticidad de los tokens JWT y controla el acceso por roles.
 * Se aplica a todas las rutas que requieren autenticación.
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware: verificarToken
 * Valida el token JWT enviado en el header Authorization de la petición.
 * Formato esperado del header: 'Authorization: Bearer <token>'
 * Si el token es válido, inyecta req.usuario con el payload decodificado.
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function verificarToken(req, res, next) {
  // Extraer el header de autorización
  const authHeader = req.headers['authorization'];

  // Verificar que el header existe y tiene el formato 'Bearer <token>'
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      mensaje: 'Acceso denegado. Se requiere token de autenticación. Formato: Bearer <token>'
    });
  }

  // Extraer el token del header (eliminar el prefijo 'Bearer ')
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      mensaje: 'Token de autenticación no proporcionado.'
    });
  }

  try {
    // Verificar y decodificar el token usando la clave secreta del .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Inyectar los datos del usuario en el objeto request para uso posterior
    req.usuario = decoded;

    // Pasar al siguiente middleware o controlador
    next();
  } catch (error) {
    // Manejar los diferentes tipos de error de JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        mensaje: 'El token de autenticación ha expirado. Por favor, inicia sesión nuevamente.'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        mensaje: 'Token de autenticación inválido o malformado.'
      });
    }
    // Error genérico de verificación
    return res.status(401).json({
      success: false,
      mensaje: 'Error al verificar el token de autenticación.'
    });
  }
}

/**
 * Middleware: verificarRol
 * Función de orden superior que retorna un middleware de verificación de rol.
 * Se usa después de verificarToken, ya que depende de req.usuario.
 * @param {...string} roles - Lista de roles permitidos para acceder a la ruta
 * @returns {Function} Middleware que verifica si el usuario tiene uno de los roles permitidos
 *
 * Uso en rutas:
 *   router.get('/ruta', verificarToken, verificarRol('admin', 'operaciones'), controlador)
 */
function verificarRol(...roles) {
  return (req, res, next) => {
    // Verificar que el middleware verificarToken fue ejecutado antes
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        mensaje: 'No autenticado. Ejecuta verificarToken antes de verificarRol.'
      });
    }

    // Comprobar si el rol del usuario está en la lista de roles permitidos
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        mensaje: `Acceso prohibido. Tu rol '${req.usuario.rol}' no tiene permisos para esta acción. Roles permitidos: ${roles.join(', ')}`
      });
    }

    // El usuario tiene el rol correcto, continuar
    next();
  };
}

module.exports = { verificarToken, verificarRol };
