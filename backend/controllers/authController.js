const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.register = async (req, res) => {
    const { email, password, role, firstName, lastName, dob, studentNumber } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            [email, hashedPassword, role]
        );
        const userId = result.insertId;

        if (role === 'student') {
            await pool.query(
                'INSERT INTO students (user_id, student_number, first_name, last_name, dob) VALUES (?, ?, ?, ?, ?)',
                [userId, studentNumber, firstName, lastName, dob]
            );
        }

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        
        const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role, userId: user.user_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    const { userId } = req.body;
    try {
        const [users] = await pool.query('SELECT email, role, created_at FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const user = users[0];
        let profileData = { ...user };

        if (user.role === 'student') {
            const [students] = await pool.query('SELECT student_number, first_name, last_name, dob, contact_number FROM students WHERE user_id = ?', [userId]);
            if (students.length > 0) profileData = { ...profileData, ...students[0] };
        } else if (user.role === 'staff') {
            const [staff] = await pool.query('SELECT first_name, last_name, specialization, room_number FROM staff WHERE user_id = ?', [userId]);
            if (staff.length > 0) profileData = { ...profileData, ...staff[0] };
        }

        res.json(profileData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};
