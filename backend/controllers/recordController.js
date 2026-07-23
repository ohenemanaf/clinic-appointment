const pool = require('../config/db');

exports.createRecord = async (req, res) => {
    const { studentId, staffId, appointmentId, diagnosis, prescription, notes } = req.body;
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Insert Medical Record
            await connection.query(
                'INSERT INTO medical_records (student_id, appointment_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?)',
                [studentId, appointmentId, diagnosis, prescription, notes]
            );
            
            // 2. Mark appointment as completed
            await connection.query(
                'UPDATE appointments SET status = ? WHERE appointment_id = ?',
                ['completed', appointmentId]
            );

            await connection.commit();
            res.status(201).json({ message: 'Medical record created successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating record', error: error.message });
    }
};

exports.getStudentRecords = async (req, res) => {
    const { studentId: userId } = req.params; // we passed user.userId as the param
    try {
        // Find the student_id from user_id
        const [student] = await pool.query('SELECT student_id FROM students WHERE user_id = ?', [userId]);
        if (student.length === 0) return res.status(404).json({ message: 'Student not found' });
        
        const actualStudentId = student[0].student_id;

        const [records] = await pool.query(`
            SELECT m.*, 
                   s.first_name as staff_first_name, s.last_name as staff_last_name, s.specialization,
                   t.slot_date
            FROM medical_records m
            JOIN appointments a ON m.appointment_id = a.appointment_id
            JOIN time_slots t ON a.slot_id = t.slot_id
            JOIN staff s ON t.staff_id = s.staff_id
            WHERE m.student_id = ?
            ORDER BY m.created_at DESC
        `, [actualStudentId]);
        
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching records', error: error.message });
    }
};
