const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Agrega esto al final de tu archivo db.js
pool.getConnection()
  .then(connection => {
    console.log('✅ Conexión exitosa a la base de datos MySQL');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión a MySQL:', err.message);
  });
module.exports = pool;