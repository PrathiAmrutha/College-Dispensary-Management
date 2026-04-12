const mysql = require('mysql2');

// Create connection
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MySQL2025@',
    database: 'hostel_health'
});

// Connect
conn.connect((err) => {
    if (err) {
        console.log("Database connection failed!", err);
    } else {
        console.log("Connected to MySQL successfully!");
    }
    conn.end();
});
