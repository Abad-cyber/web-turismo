const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

// Configuración del Pool de Conexiones MySQL con reconexión automática
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rutas_puno_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Prueba de conexión inicial
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a la Base de Datos MySQL (rutas_puno_db)');
    connection.release();
  } catch (error) {
    console.error('⚠️ Error al conectar con MySQL:', error.message);
    console.log('💡 Recuerda crear la base de datos executando docs/schema.sql en MySQL Workbench y revisar tu archivo config/.env');
  }
}

testConnection();

module.exports = pool;
