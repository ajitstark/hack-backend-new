const db = require('../config/db');
const { checkPermission } = require('./permissionHelper');

// Create Epic
exports.createEpic = async (req, res) => {
    const { epic_name, description, project_id, start_date, end_date, due_date } = req.body;
    const inserted_userid = req.user_id; // Get user_id from session
    const updated_userid = req.user_id; // Set updated_userid to same user

    if (!epic_name || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check permission
        const hasPermission = await checkPermission(inserted_userid, 'create');
        if (!hasPermission) {
            return res.status(403).json({ error: 'User does not have permission to create epics' });
        }

        // Insert into epic_master
        const [result] = await db.query(`
            INSERT INTO epic_master (epic_name, description, project_id, start_date, end_date, due_date, inserted_userid, updated_userid, inserted_timestamp, updated_timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [epic_name, description, project_id, start_date, end_date, due_date, inserted_userid, updated_userid]);

        return res.status(200).json({ message: 'Epic created successfully', epic_master_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// View Epics
exports.ViewEpics = async (req, res) => {
    const user_id = req.user_id; // Get user_id from session

    try {
        // Check permission
        const hasPermission = await checkPermission(user_id, 'view');
        if (!hasPermission) {
            return res.status(403).json({ error: 'User does not have permission to view epics' });
        }

        const [epics] = await db.query('SELECT * FROM epic_master');
        res.status(200).json(epics);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Find One Epic
exports.epicFindOne = async (req, res) => {
    const { epic_id } = req.query;
    const user_id = req.user_id; // Get user_id from session

    if (!epic_id) {
        return res.status(400).json({ error: 'Missing epic_id' });
    }

    try {
        // Check permission
        const hasPermission = await checkPermission(user_id, 'view');
        if (!hasPermission) {
            return res.status(403).json({ error: 'User does not have permission to view epics' });
        }

        const [epic] = await db.query('SELECT * FROM epic_master WHERE epic_master_id = ?', [epic_id]);

        if (epic.length === 0) {
            return res.status(404).json({ error: 'Epic not found' });
        }

        res.status(200).json(epic[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update Epic
exports.UpdateEpic = async (req, res) => {
    const { epic_id } = req.params;
    const { epic_name, description, project_id, start_date, end_date, due_date } = req.body;
    const updated_userid = req.user_id; // Get user_id from session

    if (!epic_name || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check permission
        const hasPermission = await checkPermission(updated_userid, 'update');
        if (!hasPermission) {
            return res.status(403).json({ error: 'User does not have permission to update epics' });
        }

        // Update the epic
        const [result] = await db.query(`
            UPDATE epic_master SET epic_name = ?, description = ?, project_id = ?, start_date = ?, end_date = ?, due_date = ?, updated_userid = ?, updated_timestamp = NOW() WHERE epic_master_id = ?
        `, [epic_name, description, project_id, start_date, end_date, due_date, updated_userid, epic_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Epic not found' });
        }

        return res.status(200).json({ message: 'Epic updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete Epic
exports.DeleteEpic = async (req, res) => {
    const { epic_id } = req.params;
    const user_id = req.user_id; // Get user_id from session

    try {
        // Check permission
        const hasPermission = await checkPermission(user_id, 'delete');
        if (!hasPermission) {
            return res.status(403).json({ error: 'User does not have permission to delete epics' });
        }

        // Delete the epic
        const [result] = await db.query('DELETE FROM epic_master WHERE epic_master_id = ?', [epic_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Epic not found' });
        }

        return res.status(200).json({ message: 'Epic deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
