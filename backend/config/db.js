// config/db.js
const mysql = require('mysql2/promise');

// Création du pool de connexions
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'revente_tickets_can2025',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = { pool };