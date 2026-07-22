const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });
const fs = require('fs');

async function testConnection() {
    try {
        console.log("Connecting to MySQL...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });
        console.log("Connected successfully to MySQL instance.");
        
        const [rows] = await connection.query("SHOW DATABASES LIKE 'clinic_db'");
        if (rows.length === 0) {
            console.log("Database 'clinic_db' does not exist. The schema script was likely not run.");
        } else {
            console.log("Database 'clinic_db' exists.");
            await connection.query("USE clinic_db");
            const [tables] = await connection.query("SHOW TABLES");
            console.log("Tables in clinic_db:", tables);
        }
        await connection.end();
    } catch (err) {
        console.error("Connection failed:", err.message);
    }
}
testConnection();
