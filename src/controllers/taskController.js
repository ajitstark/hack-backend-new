const db = require('../config/db');
const { checkPermission } = require('./permissionHelper');

// Create Task
exports.createTask = async (req, res) => {
    const { task_title, task_description, due_date, task_time, task_type_id, epic_id, project_id, assigned_userid } = req.body;
    const insertted_userid = req.user_id; // Get user_id from session
    const updatde_userid = req.user_id; // Set updated_userid to same user

    if (!task_title || !task_description || !due_date || !task_time || !task_type_id || !project_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check permission
        const hasPermission = await checkPermission(insertted_userid, 'create');
        if (!hasPermission) {
            return res.status(403).json({ error: 'User does not have permission to create tasks' });
        }

        // Insert into task_master
        const [result] = await db.query(`
            INSERT INTO task_master (task_title, task_description, due_date, task_time, task_type_id, epic_id, project_id, assigned_userid, insertted_userid, updatde_userid, inserted_timestamp, updated_timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [task_title, task_description, due_date, task_time, task_type_id, epic_id, project_id, assigned_userid, insertted_userid, updatde_userid]);

        return res.status(200).json({ message: 'Task created successfully', task_master_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// View Tasks
exports.ViewTasks = async (req, res) => {
    const user_id = req.user_id; // Get user_id from session

    try {
        // Check permission
        const hasPermission = await checkPermission(user_id, 'view');
        if (!hasPermission) {
            return res.status(403).json({ error: 'User does not have permission to view tasks' });
        }

        const [tasks] = await db.query('SELECT * FROM task_master');
        res.status(200).json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Find One Task
exports.taskFindOne = async (req, res) => {
    const { task_id } = req.query;
    const user_id = req.user_id; // Get user_id from session

    if (!task_id) {
        return res.status(400).json({ error: 'Missing task_id' });
    }

    try {
        // Check permission
        const hasPermission = await checkPermission(user_id, 'view');
        if (!hasPermission) {
            return res.status(403).json({ error: 'User does not have permission to view tasks' });
        }

        const [task] = await db.query('SELECT * FROM task_master WHERE task_master_id = ?', [task_id]);

        if (task.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json(task[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update Task
exports.UpdateTask = async (req, res) => {
    const { task_id } = req.params;
    const { task_title, task_description, due_date, task_time, task_type_id, epic_id, project_id, assigned_userid } = req.body;
    const updatde_userid = req.user_id; // Get user_id from session

    if (!task_title || !task_description || !due_date || !task_time || !task_type_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check permission
        const hasPermission = await checkPermission(updatde_userid, 'update');
        if (!hasPermission) {
            return res.status(403).json({ error: 'User does not have permission to update tasks' });
        }

        // Update the task
        const [result] = await db.query(`
            UPDATE task_master SET task_title = ?, task_description = ?, due_date = ?, task_time = ?, task_type_id = ?, epic_id = ?, project_id = ?, assigned_userid = ?, updatde_userid = ?, updated_timestamp = NOW() WHERE task_master_id = ?
        `, [task_title, task_description, due_date, task_time, task_type_id, epic_id, project_id, assigned_userid, updatde_userid, task_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        return res.status(200).json({ message: 'Task updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete Task
exports.DeleteTask = async (req, res) => {
    const { task_id } = req.params;
    const user_id = req.user_id; // Get user_id from session

    try {
        // Check permission
        const hasPermission = await checkPermission(user_id, 'delete');
        if (!hasPermission) {
            return res.status(403).json({ error: 'User does not have permission to delete tasks' });
        }

        // Delete the task
        const [result] = await db.query('DELETE FROM task_master WHERE task_master_id = ?', [task_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
