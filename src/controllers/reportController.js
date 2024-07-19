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





