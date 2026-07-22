const pool = require('../config/db');

exports.getNotifications = async (req, res) => {
    const { userId } = req.params;
    try {
        const [notifications] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE notification_id = ?',
            [id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
};
