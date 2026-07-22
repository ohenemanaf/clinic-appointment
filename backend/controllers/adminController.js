const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getDashboardStats = async (req, res) => {
    try {
        const [studentCount] = await pool.query('SELECT COUNT(*) as count FROM students');
        const [staffCount] = await pool.query('SELECT COUNT(*) as count FROM staff');
        const [appointmentStats] = await pool.query(`
            SELECT status, COUNT(*) as count 
            FROM appointments 
            GROUP BY status
        `);
        const [recentAppointments] = await pool.query(`
            SELECT a.appointment_id, a.status, a.created_at,
                   st.first_name as student_first, st.last_name as student_last,
                   sf.first_name as staff_first, sf.last_name as staff_last
            FROM appointments a
            JOIN students st ON a.student_id = st.student_id
            JOIN time_slots t ON a.slot_id = t.slot_id
            JOIN staff sf ON t.staff_id = sf.staff_id
            ORDER BY a.created_at DESC
            LIMIT 5
        `);

        // Format appointment stats into a key-value object
        const appointments = {
            total: 0,
            pending: 0,
            completed: 0,
            cancelled: 0,
            confirmed: 0
        };

        appointmentStats.forEach(stat => {
            appointments[stat.status] = stat.count;
            appointments.total += stat.count;
        });

        res.json({
            students: studentCount[0].count,
            staff: staffCount[0].count,
            appointments,
            recentAppointments
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ message: 'Error fetching admin statistics', error: error.message });
    }
};

exports.addStaff = async (req, res) => {
    const { email, password, firstName, lastName, specialization, roomNumber } = req.body;
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Create User account
            const hashedPassword = await bcrypt.hash(password, 10);
            const [userResult] = await connection.query(
                'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
                [email, hashedPassword, 'staff']
            );
            
            const userId = userResult.insertId;

            // 2. Create Staff profile
            await connection.query(
                'INSERT INTO staff (user_id, first_name, last_name, specialization, room_number) VALUES (?, ?, ?, ?, ?)',
                [userId, firstName, lastName, specialization, roomNumber]
            );

            await connection.commit();
            res.status(201).json({ message: 'Staff member added successfully!' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }
        res.status(500).json({ message: 'Error adding staff member', error: error.message });
    }
};
