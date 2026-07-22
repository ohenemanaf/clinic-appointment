const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    try {
        console.log("Connecting to MySQL to initialize schema...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });
        
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log("Executing schema.sql...");
        await connection.query(schemaSql);
        
        console.log("Schema execution successful! Database is ready.");
        await connection.end();
    } catch (err) {
        console.error("Schema execution failed:", err.message);
    }
}
setupDatabase();
