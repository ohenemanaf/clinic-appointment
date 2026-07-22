const pool = require('../config/db');

exports.updateProfile = async (req, res) => {
    // Note: req.params.id is the user_id from the Auth token
    const userId = req.params.id;
    const { contactNumber } = req.body;
    
    try {
        await pool.query(
            'UPDATE students SET contact_number = ? WHERE user_id = ?',
            [contactNumber, userId]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};
