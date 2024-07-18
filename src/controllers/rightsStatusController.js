const db = require('../config/db');

// Create new rights status to user
exports.createRightsStatus = async (req, res) => {

    const { rights_status } = req.body;
    try {
        const [result] = await db.query('INSERT INTO rights_status(rights_status) VALUES (?)', [rights_status]);
        return res.status(200).json({ id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.ViewRightsStatus = async (req,res) => {
    try{
        const [rows, fields] = await db.query('SELECT rights_status.rights_status_id,rights_status.rights_status FROM rights_status');
       
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    
    }
}
exports.RightsStatusFindOne = async (req, res) => {
        const { rights_status_id } = req.body;

    try {
        const [rows, fields] = await db.query('SELECT rights_status.rights_status_id,rights_status.rights_status FROM rights_status WHERE rights_status_id = ?', [rights_status_id]);
        
        if (rows.length > 0) {
            res.json(rows[0]); // Return the first row since role_id should be unique
        } else {
            res.status(404).json({ error: 'Rights Status not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.UpdateRightsStatus = async (req, res) => {
    const { rights_status_id } = req.params; // Assuming role_id is passed as a URL parameter
    const { rights_status } = req.body; // Assuming role_name is passed in the request body

    if (!role_name) {
        return res.status(400).json({ error: 'Rights Name is required' });
    }

    try {
        const [result] = await db.query('UPDATE rights_status SET rights_status = ? WHERE rights_status_id = ?', [rights_status, rights_status_id]);
        
        if (result.affectedRows > 0) {
            res.json({ message: 'Rights Status updated successfully' });
        } else {
            res.status(404).json({ error: 'Role not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.DeleteRightsStatus = async (req, res) => {
    const { rights_status_id } = req.params; // Assuming role_id is passed as a URL parameter

    try {
        const [result] = await db.query('DELETE FROM rights_status WHERE rights_status_id = ?', [rights_status_id]);
        
        if (result.affectedRows > 0) {
            res.json({ message: 'Rights Status deleted successfully' });
        } else {
            res.status(404).json({ error: 'Rights Status not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};