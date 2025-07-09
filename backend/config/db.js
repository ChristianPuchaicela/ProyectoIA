const sql = require('mssql');
require('dotenv').config();
console.log('DB_PORT:', process.env.DB_PORT);
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433, // <-- así nunca será undefined
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('🔗 Conectado a SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('❌ Error al conectar a SQL Server:', err);
  });

module.exports = {
  sql, poolPromise
};