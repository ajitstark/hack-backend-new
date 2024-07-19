const db = require('../config/db');

// Create Project
exports.createProject = async (req, res) => {
    const { project_name } = req.body;
    const inserted_userid = req.user.id; // Get user_id from session
    const updated_userid = req.user_id; // Set updated_userid to same user

    if (!project_name) {
        return res.status(400).json({ error: 'Missing project_name' });
    }

    try {
        // Insert into project_master
        const [result] = await db.query(`
            INSERT INTO project_master (project_name, inserted_userid, updated_userid, created_timestamp, updated_timestamp)
            VALUES (?, ?, ?, NOW(), NOW())
        `, [project_name, inserted_userid, updated_userid]);

        return res.status(200).json({ message: 'Project created successfully', project_master_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// View Projects
exports.ViewProject = async (req, res) => {
    try {
        const [projects] = await db.query('SELECT * FROM project_master');
        res.status(200).json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Find One Project
exports.projectFindOne = async (req, res) => {
    const { project_id } = req.body;

    if (!project_id) {
        return res.status(400).json({ error: 'Missing project_id' });
    }

    try {
        const [project] = await db.query('SELECT * FROM project_master WHERE project_master_id = ?', [project_id]);

        if (project.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json(project[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update Project
exports.UpdateProject = async (req, res) => {
    const { project_id } = req.params;
    const { project_name } = req.body;
    const updated_userid = req.user_id; // Get user_id from session

    if (!project_name) {
        return res.status(400).json({ error: 'Missing project_name' });
    }

    try {
        // Update the project
        const [result] = await db.query(`
            UPDATE project_master SET project_name = ?, updated_userid = ?, updated_timestamp = NOW() WHERE project_master_id = ?
        `, [project_name, updated_userid, project_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        return res.status(200).json({ message: 'Project updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete Project
exports.DeleteProject = async (req, res) => {
    const { project_id } = req.params;
    const updated_userid = req.user_id; // Get user_id from session

    try {
        // Delete the project
        const [result] = await db.query('DELETE FROM project_master WHERE project_master_id = ?', [project_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        return res.status(200).json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
