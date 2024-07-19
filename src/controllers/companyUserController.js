const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')


// Create a new user
exports.createCompanyUser = async (req, res) => {
    const { user_name, email, password } = req.body;
    try {
        const [result] = await db.query('INSERT INTO company_user (name, email) VALUES (?, ?)', [user_name, email]);
        if(result.affectedRows === 1){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const companyUserId = result.insertId
            const [resultCreateUser] = await db.query('INSERT INTO users (company_user_id, user_name, email, password) VALUES (?, ?, ?, ?)', [companyUserId, user_name, email, hashedPassword]);
            if(resultCreateUser.affectedRows === 1){
                const token = jwt.sign({ id: result.insertId, company_user_id: companyUserId, user_name, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
                return res.status(201).json({ id: result.insertId, user_name, email, token });
            }
        }
        return res.status(200).json({ id: result.insertId, name, email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};