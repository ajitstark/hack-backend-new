const db = require('../config/db');

// Create new roles to user
exports.createRoles = async (req, res) => {

    const { role_name } = req.body;
    try {
        const [result] = await db.query('INSERT INTO user_role(role_name) VALUES (?)', [role_name]);
        return res.status(200).json({ id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.ViewRoles = async (req,res) => {
    try{
        const [rows, fields] = await db.query('SELECT user_role.user_role_id, user_role.role_name FROM user_role');
       
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    
    }
}
exports.RoleFindOne = async (req, res) => {
        const { role_id } = req.body;

    try {
        const [rows, fields] = await db.query('SELECT user_role_id, role_name FROM user_role WHERE user_role_id = ?', [role_id]);
        
        if (rows.length > 0) {
            res.json(rows[0]); // Return the first row since role_id should be unique
        } else {
            res.status(404).json({ error: 'Role not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.UpdateRole = async (req, res) => {
    const { role_id } = req.params; // Assuming role_id is passed as a URL parameter
    const { role_name } = req.body; // Assuming role_name is passed in the request body

    if (!role_name) {
        return res.status(400).json({ error: 'role_name is required' });
    }

    try {
        const [result] = await db.query('UPDATE user_role SET role_name = ? WHERE user_role_id = ?', [role_name, role_id]);
        
        if (result.affectedRows > 0) {
            res.json({ message: 'Role updated successfully' });
        } else {
            res.status(404).json({ error: 'Role not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.DeleteRole = async (req, res) => {
    const { role_id } = req.params; // Assuming role_id is passed as a URL parameter

    try {
        const [result] = await db.query('DELETE FROM user_role WHERE user_role_id = ?', [role_id]);
        
        if (result.affectedRows > 0) {
            res.json({ message: 'Role deleted successfully' });
        } else {
            res.status(404).json({ error: 'Role not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};