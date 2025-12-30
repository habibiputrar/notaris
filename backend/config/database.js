const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',  // Default XAMPP MySQL password kosong
    database: 'notaris_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Get promise-based pool
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error connecting to MySQL:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database');
    connection.release();
});

module.exports = promisePool;