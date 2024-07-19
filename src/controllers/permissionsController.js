const db = require('../config/db');

// Create User Permission
exports.createUserPermission = async (req, res) => {
    const { permission_id, user_id, create, view, update, delete: del } = req.body;

    if (!permission_id || !user_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Insert into user_permission
        const [result] = await db.query(`
            INSERT INTO user_permission (permission_id, user_id, \`create\`, \`view\`, \`update\`, \`delete\`)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [permission_id, user_id, create, view, update, del]);

        return res.status(200).json({ message: 'User permission created successfully', user_permission_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// View User Permissions
exports.viewUserPermissions = async (req, res) => {
    try {
        const [userPermissions] = await db.query('SELECT * FROM user_permission');
        res.status(200).json(userPermissions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Find One User Permission
exports.findOneUserPermission = async (req, res) => {
    const { user_permission_id } = req.query;

    if (!user_permission_id) {
        return res.status(400).json({ error: 'Missing user_permission_id' });
    }

    try {
        const [userPermission] = await db.query('SELECT * FROM user_permission WHERE user_permission_id = ?', [user_permission_id]);

        if (userPermission.length === 0) {
            return res.status(404).json({ error: 'User permission not found' });
        }

        res.status(200).json(userPermission[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update User Permission
exports.updateUserPermission = async (req, res) => {
    const { user_permission_id } = req.params;
    const { permission_id, user_id, create, view, update, delete: del } = req.body;

    if (!permission_id || !user_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Update the user permission
        const [result] = await db.query(`
            UPDATE user_permission SET permission_id = ?, user_id = ?, \`create\`, \`view\`, \`update\`, \`delete\` = ? WHERE user_permission_id = ?
        `, [permission_id, user_id, create, view, update, del, user_permission_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User permission not found' });
        }

        return res.status(200).json({ message: 'User permission updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete User Permission
exports.deleteUserPermission = async (req, res) => {
    const { user_permission_id } = req.params;

    try {
        // Delete the user permission
        const [result] = await db.query('DELETE FROM user_permission WHERE user_permission_id = ?', [user_permission_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User permission not found' });
        }

        return res.status(200).json({ message: 'User permission deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
