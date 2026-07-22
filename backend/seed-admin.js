const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function seedAdmin() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'clinic_db',
        });

        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Check if admin already exists
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', ['admin@clinic.com']);
        if (existing.length > 0) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        // Insert Admin User
        await pool.query(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            ['admin@clinic.com', hashedPassword, 'admin']
        );

        console.log("Admin seeded successfully: email=admin@clinic.com, password=admin123");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
}

seedAdmin();
