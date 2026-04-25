const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log("Kết nối PostgreSQL thành công thông qua Pool");
});

pool.on('error', (err) => {
  console.error("Lỗi kết nối database bất ngờ", err);
});

module.exports = pool;