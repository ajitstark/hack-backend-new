const db = require('../config/db');

// Create User Rights
exports.createUserRights = async (req, res) => {
    const { users_id, user_roles_id, UID } = req.body;
    const created_by = req.user.id; // Get user_id from session
    const updated_by = req.user.id; // Set updated_by to same user
    const company_userid = req.user.company_user_id; // Get company_userid from req.user.company_user_id

    if (!users_id || !user_roles_id || !UID || !company_userid) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Insert into user_rights
        const [result] = await db.query(`
            INSERT INTO user_rights (users_id, user_roles_id, UID, created_timestamp, updated_timestamp, company_userid)
            VALUES (?, ?, ?, NOW(), NOW(), ?)
        `, [users_id, user_roles_id, UID, company_userid]);

        return res.status(200).json({ message: 'User rights created successfully', user_rights_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// View User Rights
exports.ViewUserRights = async (req, res) => {
    const company_userid = req.user.company_user_id; // Get company_userid from req.user.company_user_id

    if (!company_userid) {
        return res.status(400).json({ error: 'Missing company_userid' });
    }

    try {
        const [userRights] = await db.query(`
            SELECT * 
            FROM user_rights 
            WHERE company_userid = ?
        `, [company_userid]);

        res.status(200).json(userRights);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Find One User Rights
exports.userRightsFindOne = async (req, res) => {
    const { user_rights_id } = req.query;
    const company_userid = req.user.company_user_id; // Get company_userid from req.user.company_user_id

    if (!user_rights_id || !company_userid) {
        return res.status(400).json({ error: 'Missing user_rights_id or company_userid' });
    }

    try {
        const [userRight] = await db.query('SELECT * FROM user_rights WHERE user_rights_id = ? AND company_userid = ?', [user_rights_id, company_userid]);

        if (userRight.length === 0) {
            return res.status(404).json({ error: 'User rights not found' });
        }

        res.status(200).json(userRight[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update User Rights
exports.UpdateUserRights = async (req, res) => {
    const { user_rights_id } = req.params;
    const { users_id, user_roles_id, UID } = req.body;
    const updated_by = req.user.id; // Get user_id from session
    const company_userid = req.user.company_user_id; // Get company_userid from req.user.company_user_id

    if (!users_id || !user_roles_id || !UID || !company_userid) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Update the user rights
        const [result] = await db.query(`
            UPDATE user_rights SET users_id = ?, user_roles_id = ?, UID = ?, updated_timestamp = NOW() WHERE user_rights_id = ? AND company_userid = ?
        `, [users_id, user_roles_id, UID, user_rights_id, company_userid]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User rights not found' });
        }

        return res.status(200).json({ message: 'User rights updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete User Rights
exports.DeleteUserRights = async (req, res) => {
    const { user_rights_id } = req.params;
    const company_userid = req.user.company_user_id; // Get company_userid from req.user.company_user_id

    if (!company_userid) {
        return res.status(400).json({ error: 'Missing company_userid' });
    }

    try {
        // Delete the user rights
        const [result] = await db.query('DELETE FROM user_rights WHERE user_rights_id = ? AND company_userid = ?', [user_rights_id, company_userid]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User rights not found' });
        }

        return res.status(200).json({ message: 'User rights deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
