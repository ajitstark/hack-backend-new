const db = require('../config/db');
const { checkPermission } = require('./permissionHelper');

exports.TaskList = async (req, res) => {
    const user_id = req.user.id; // Get user_id from session
    const company_id = req.user.company_user_id;
    const { project_id } = req.body; // Get project_id from query parameters

    if (!project_id) {
        return res.status(400).json({ error: 'Missing project_id' });
    }

    try {
        // Check permission
        const hasPermission = await checkPermission(user_id, 'view');
        if (!hasPermission) {
            return res.status(403).json({ error: 'User does not have permission to view tasks' });
        }

        // Get the task list for the given project
        const [tasks] = await db.query(`
            SELECT task_master.task_master_id, task_master.task_title 
            FROM task_master 
            WHERE task_master.project_id = ?
        `, [project_id]);

        res.status(200).json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.listRightsStatus = async (req, res) => {
    try {
        const [rightsStatus] = await db.query('SELECT * FROM rights_status');
        res.status(200).json(rightsStatus);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getTotalTimeSpentOnTasks = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                task_master.task_master_id,
                task_master.task_title,
                SUM(TIMESTAMPDIFF(SECOND, task_time_tracker.start_time, task_time_tracker.end_time)) AS total_time_spent_seconds
            FROM
                task_master
            JOIN
                task_time_tracker ON task_master.task_master_id = task_time_tracker.task_master_id
            GROUP BY
                task_master.task_master_id, task_master.task_title;
        `);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getTimeSpentByEachUser = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                users.user_id,
                users.username,
                SUM(TIMESTAMPDIFF(SECOND, task_time_tracker.start_time, task_time_tracker.end_time)) AS total_time_spent_seconds
            FROM
                users
            JOIN
                task_time_tracker ON users.user_id = task_time_tracker.user_id
            GROUP BY
                users.user_id, users.username;
        `);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getTasksWithMostTimeSpent = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                task_master.task_master_id,
                task_master.task_title,
                SUM(TIMESTAMPDIFF(SECOND, task_time_tracker.start_time, task_time_tracker.end_time)) AS total_time_spent_seconds
            FROM
                task_master
            JOIN
                task_time_tracker ON task_master.task_master_id = task_time_tracker.task_master_id
            GROUP BY
                task_master.task_master_id, task_master.task_title
            ORDER BY
                total_time_spent_seconds DESC
            LIMIT 10;
        `);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getTaskStatusChangesOverTime = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                task_master.task_master_id,
                task_master.task_title,
                task_time_tracker.rights_status_id,
                task_time_tracker.start_time
            FROM
                task_master
            JOIN
                task_time_tracker ON task_master.task_master_id = task_time_tracker.task_master_id
            ORDER BY
                task_master.task_master_id, task_time_tracker.start_time;
        `);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getTimeSpentOnTasksByProject = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                project_master.project_name,
                task_master.task_master_id,
                task_master.task_title,
                SUM(TIMESTAMPDIFF(SECOND, task_time_tracker.start_time, task_time_tracker.end_time)) AS total_time_spent_seconds
            FROM
                project_master
            JOIN
                task_master ON project_master.project_master_id = task_master.project_id
            JOIN
                task_time_tracker ON task_master.task_master_id = task_time_tracker.task_master_id
            GROUP BY
                project_master.project_name, task_master.task_master_id, task_master.task_title;
        `);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get Overall Project Report
exports.getOverallProjectReport = async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT
        project_master.project_master_id,
        project_master.project_name,
        task_master.task_master_id,
        task_master.task_title,
        users.users_id,
        users.user_name,
        SUM(TIMESTAMPDIFF(SECOND, task_time_tracker.start_time, task_time_tracker.end_time)) AS total_time_spent_seconds,
        COUNT(DISTINCT task_time_tracker.task_master_id) AS total_tasks,
        COUNT(DISTINCT task_time_tracker.user_id) AS total_users,
        task_master.due_date
    FROM
        project_master
    JOIN
        task_master ON project_master.project_master_id = task_master.project_id
    JOIN
        task_time_tracker ON task_master.task_master_id = task_time_tracker.task_master_id
    JOIN
        users ON task_time_tracker.user_id = users.users_id
    GROUP BY
        project_master.project_master_id, project_master.project_name, task_master.task_master_id, task_master.task_title, users.users_id, users.user_name;
    
        `);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};






