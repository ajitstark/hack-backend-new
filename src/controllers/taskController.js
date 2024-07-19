const db = require('../config/db');

// Create Task and Task Time Tracker
exports.createTask = async (req, res) => {
    const { task_title, task_description, due_date, task_time, task_type_id, epic_id, project_id, assigned_userid } = req.body;
    const rights_status_id = req.body.rights_status_id || 1; // Default to 1 if not provided
    const insertted_userid = req.user.id; // Get user_id from session
    const updatde_userid = req.user.id; // Set updated_userid to same user
    const company_userid = req.user.company_user_id; // Get company_userid from req.user.company_user_id

    if (!task_title || !task_description || !due_date || !task_time || !task_type_id || !project_id || !company_userid ) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Insert into task_master
        const [taskResult] = await connection.query(`
            INSERT INTO task_master (task_title, task_description, due_date, task_time, rights_status_id, task_type_id, epic_id, project_id, assigned_userid, insertted_userid, updatde_userid, inserted_timestamp, updated_timestamp, company_userid)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
        `, [task_title, task_description, due_date, task_time, rights_status_id, task_type_id, epic_id, project_id, assigned_userid, insertted_userid, updatde_userid, company_userid]);

        const task_master_id = taskResult.insertId;

        // Insert into task_time_tracker
        const [timeTrackerResult] = await connection.query(`
            INSERT INTO task_time_tracker (task_master_id, user_id, rights_status_id, start_time, end_time)
            VALUES (?, ?, ?, ?, ?)
        `, [task_master_id, insertted_userid, rights_status_id, "00:00:00", "00:00:00"]);

        await connection.commit();
        connection.release();

        return res.status(200).json({ message: 'Task and task time tracker created successfully', task_master_id: task_master_id, task_time_tracker_id: timeTrackerResult.insertId });
    } catch (err) {
        await connection.rollback();
        connection.release();
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// View Tasks
exports.ViewTasks = async (req, res) => {
    const user_id = req.user.id; // Get user_id from session
    const { project_id } = req.query; // Get project_id from query parameters
    const company_userid = req.user.company_user_id; // Get company_userid from req.user.company_user_id

    if (!project_id || !company_userid) {
        return res.status(400).json({ error: 'Missing project_id or company_userid' });
    }

    try {
        const [tasks] = await db.query(`
            SELECT task_master.task_master_id, task_master.task_title, task_master.task_description, task_master.due_date, task_master.task_time, task_master.rights_status_id, task_master.task_type_id, task_master.epic_id, task_master.project_id, task_master.assigned_userid
            FROM task_master 
            WHERE task_master.project_id = ? AND task_master.company_userid = ?
        `, [project_id, company_userid]);

        res.status(200).json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Find One Task
exports.taskFindOne = async (req, res) => {
    const { task_id, project_id } = req.query;
    const user_id = req.user.id; // Get user_id from session
    const company_userid = req.user.company_user_id; // Get company_userid from req.user.company_user_id

    if (!task_id || !project_id || !company_userid) {
        return res.status(400).json({ error: 'Missing task_id, project_id, or company_userid' });
    }

    try {
        const [task] = await db.query('SELECT * FROM task_master WHERE task_master_id = ? AND project_id = ? AND company_userid = ?', [task_id, project_id, company_userid]);

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
    const { task_title, task_description, due_date, task_time, rights_status_id, task_type_id, epic_id, project_id, assigned_userid } = req.body;
    const updatde_userid = req.user.id; // Get user_id from session
    const company_userid = req.user.company_user_id; // Get company_userid from req.user.company_user_id

    if (!task_title || !task_description || !due_date || !task_time || !rights_status_id || !task_type_id || !project_id || !company_userid) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Update the task
        const [result] = await db.query(`
            UPDATE task_master SET task_title = ?, task_description = ?, due_date = ?, task_time = ?, rights_status_id = ?, task_type_id = ?, epic_id = ?, project_id = ?, assigned_userid = ?, updatde_userid = ?, updated_timestamp = NOW() WHERE task_master_id = ? AND project_id = ? AND company_userid = ?
        `, [task_title, task_description, due_date, task_time, rights_status_id, task_type_id, epic_id, project_id, assigned_userid, updatde_userid, task_id, project_id, company_userid]);

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
    const { project_id } = req.query;
    const user_id = req.user.id; // Get user_id from session
    const company_userid = req.user.company_user_id; // Get company_userid from req.user.company_user_id

    if (!project_id || !company_userid) {
        return res.status(400).json({ error: 'Missing project_id or company_userid' });
    }

    try {
        // Delete the task
        const [result] = await db.query('DELETE FROM task_master WHERE task_master_id = ? AND project_id = ? AND company_userid = ?', [task_id, project_id, company_userid]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create Task Time Tracker
exports.createTaskTimeTracker = async (req, res) => {
    const { task_master_id, user_id, start_time, end_time } = req.body;
    const rights_status_id = req.body.rights_status_id || 1; // Default to 1 if not provided

    if (!task_master_id || !user_id || !start_time || !end_time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Insert into task_time_tracker
        const [result] = await db.query(`
            INSERT INTO task_time_tracker (task_master_id, user_id, rights_status_id, start_time, end_time)
            VALUES (?, ?, ?, ?, ?)
        `, [task_master_id, user_id, rights_status_id, start_time, end_time]);

        return res.status(200).json({ message: 'Task time tracker created successfully', task_time_tracker_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// View Task Time Trackers
exports.ViewTaskTimeTrackers = async (req, res) => {
    const user_id = req.user.id; // Get user_id from session

    try {
        const [taskTimeTrackers] = await db.query(`
            SELECT task_time_tracker.*
            FROM task_time_tracker
            JOIN task_master ON task_time_tracker.task_master_id = task_master.task_master_id
            WHERE task_master.company_userid = ?
        `, [user_id]);

        res.status(200).json(taskTimeTrackers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
