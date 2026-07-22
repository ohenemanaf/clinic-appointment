const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

async function seedTestData() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'clinic_db',
        });

        const hashedPassword = await bcrypt.hash('test1234', 10);

        // 1. Create Staff
        const [staffUser] = await pool.query(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            ['staff_test@clinic.com', hashedPassword, 'staff']
        );
        const staffUserId = staffUser.insertId;
        const [staffRow] = await pool.query(
            'INSERT INTO staff (user_id, first_name, last_name, specialization, room_number) VALUES (?, ?, ?, ?, ?)',
            [staffUserId, 'Test', 'Doctor', 'General', '101']
        );
        const staffId = staffRow.insertId;

        // 2. Create Slot
        const [slotRow] = await pool.query(
            'INSERT INTO time_slots (staff_id, slot_date, start_time, end_time) VALUES (?, ?, ?, ?)',
            [staffId, '2026-08-01', '10:00:00', '11:00:00']
        );
        const slotId = slotRow.insertId;

        // 3. Create Student
        const [stuUser] = await pool.query(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            ['student_test@clinic.com', hashedPassword, 'student']
        );
        const stuUserId = stuUser.insertId;
        const [stuRow] = await pool.query(
            'INSERT INTO students (user_id, student_number, first_name, last_name, dob) VALUES (?, ?, ?, ?, ?)',
            [stuUserId, 'STU001', 'Test', 'Student', '2000-01-01']
        );
        const studentId = stuRow.insertId;

        // 4. Book Appointment
        const [appRow] = await pool.query(
            'INSERT INTO appointments (student_id, slot_id, reason) VALUES (?, ?, ?)',
            [studentId, slotId, 'Headache']
        );
        const appointmentId = appRow.insertId;
        await pool.query('UPDATE time_slots SET is_booked = TRUE WHERE slot_id = ?', [slotId]);

        console.log(`Seeded successfully!`);
        console.log(`Appointment ID: ${appointmentId}`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding:", error);
        process.exit(1);
    }
}

seedTestData();
