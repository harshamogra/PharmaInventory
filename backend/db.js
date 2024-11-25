const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,     // usually 'localhost'
  user: process.env.DB_USER,     // 'root'
  password: process.env.DB_PASS,  // your password
  database: process.env.DB_NAME,  // 'PharmaInventory'
  port: 3306                       // default MySQL port, adjust if needed
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed: ', err);
    return;
  }
  console.log('Database connected successfully.');
});

module.exports = connection;