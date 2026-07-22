const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    try {
        console.log("Connecting to MySQL to seed data...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'clinic_db',
        });
        
        console.log("Checking for existing staff...");
        const [existing] = await connection.query("SELECT * FROM users WHERE email = 'doctor@clinic.com'");
        if (existing.length > 0) {
            console.log("Dummy staff already exists.");
        } else {
            // Insert User
            const hash = await bcrypt.hash('password123', 10);
            const [userRes] = await connection.query(
                "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'staff')",
                ['doctor@clinic.com', hash]
            );
            const userId = userRes.insertId;

            // Insert Staff
            const [staffRes] = await connection.query(
                "INSERT INTO staff (user_id, first_name, last_name, specialization, room_number) VALUES (?, 'John', 'Smith', 'General Physician', 'Room 101')",
                [userId]
            );
            const staffId = staffRes.insertId;

            // Insert Slots (Today and Tomorrow)
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            
            const slots = [
                [staffId, today, '09:00:00', '09:30:00'],
                [staffId, today, '10:00:00', '10:30:00'],
                [staffId, tomorrow, '11:00:00', '11:30:00'],
                [staffId, tomorrow, '14:00:00', '14:30:00'],
            ];

            for (const slot of slots) {
                await connection.query(
                    "INSERT INTO time_slots (staff_id, slot_date, start_time, end_time) VALUES (?, ?, ?, ?)",
                    slot
                );
            }
            console.log("Dummy staff and slots inserted!");
        }

        await connection.end();
    } catch (err) {
        console.error("Seed execution failed:", err.message);
    }
}
seedDatabase();
