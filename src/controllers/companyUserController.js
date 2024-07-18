const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')


// Create a new user
exports.createCompanyUser = async (req, res) => {

    const { name, email } = req.body;
    try {
        const [result] = await db.query('INSERT INTO company_user (name, email) VALUES (?, ?)', [name, email]);
        return res.status(200).json({ id: result.insertId, name, email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
