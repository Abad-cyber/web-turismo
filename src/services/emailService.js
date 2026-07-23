/**
 * Servicio: emailService
 * Gestiona el envío de correos electrónicos a través de Nodemailer y Gmail.
 */

const nodemailer = require('nodemailer');

const { EMAIL_USER, EMAIL_PASS } = process.env;

// Configurar el transporter (cliente SMTP)
let transporter = null;

if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
} else {
  console.warn('⚠️  ADVERTENCIA: EMAIL_USER y EMAIL_PASS no están configurados en .env. Los correos no se enviarán.');
}

/**
 * Función interna para enviar correos manejando graceful degradation
 * @param {Object} mailOptions 
 */
async function sendMailSafely(mailOptions) {
  if (!transporter) {
    console.log(`[Email Service] Simulación de envío a ${mailOptions.to}: Asunto: "${mailOptions.subject}"`);
    return false;
  }
  
  try {
    await transporter.sendMail({
      from: `"SisturPuno" <${EMAIL_USER}>`,
      ...mailOptions
    });
    return true;
  } catch (error) {
    console.error(`[Email Service] Error al enviar correo a ${mailOptions.to}:`, error.message);
    return false;
  }
}

/**
 * Envía un correo de bienvenida al registrarse.
 * @param {string} nombre - Nombre del usuario
 * @param {string} email - Correo del usuario
 */
async function enviarCorreoRegistro(nombre, email) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d4af37; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1a1a1a; color: #d4af37; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">¡Bienvenido a SisturPuno!</h1>
      </div>
      <div style="padding: 20px; color: #333;">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Gracias por registrarte en SisturPuno. Estamos emocionados de tenerte con nosotros y esperamos que encuentres las mejores aventuras en Puno.</p>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <br>
        <p>Atentamente,<br>El equipo de SisturPuno</p>
      </div>
    </div>
  `;

  await sendMailSafely({
    to: email,
    subject: '¡Bienvenido a SisturPuno!',
    html
  });
}

/**
 * Envía un correo de confirmación de reserva.
 * @param {string} nombre - Nombre del usuario
 * @param {string} email - Correo del usuario
 * @param {string} tourNombre - Nombre del paquete/tour
 * @param {string} fecha - Fecha de la reserva
 * @param {number} pasajeros - Número de pasajeros
 * @param {number} monto - Costo total
 * @param {string} codigoReserva - Código de la reserva
 */
async function enviarCorreoReserva(nombre, email, tourNombre, fecha, pasajeros, monto, codigoReserva) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d4af37; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1a1a1a; color: #d4af37; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Confirmación de Reserva</h1>
      </div>
      <div style="padding: 20px; color: #333;">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Tu reserva se ha procesado exitosamente. Aquí tienes los detalles de tu aventura:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tour:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${tourNombre}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Fecha:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${fecha}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pasajeros:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${pasajeros}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Pagado:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">S/. ${monto.toFixed(2)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Código Reserva:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${codigoReserva}</td></tr>
        </table>
        <p>Te recomendamos guardar este correo. Muestra el código de reserva a nuestro personal al momento del tour.</p>
        <br>
        <p>¡Nos vemos pronto!<br>El equipo de SisturPuno</p>
      </div>
    </div>
  `;

  await sendMailSafely({
    to: email,
    subject: `Confirmación de Reserva: ${tourNombre} - SisturPuno`,
    html
  });
}

module.exports = {
  enviarCorreoRegistro,
  enviarCorreoReserva
};
