const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create admin user
exports.createAdminUser = async (req, res) => {
  const { user_name, email, company_user_id, password } = req.body;

  if (!user_name || !email || !company_user_id || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
  }

  try {

      const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
          return res.status(400).json({ error: 'Email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [result] = await db.query('INSERT INTO users (company_user_id, user_name, email, password) VALUES (?, ?, ?, ?)', [company_user_id, user_name, email, hashedPassword]);

      const token = jwt.sign({ id: result.insertId, company_user_id: company_user_id, user_name, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.status(201).json({ id: result.insertId, user_name, email, token });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.createUser = async (req, res) => {
  const { user_name, email, password } = req.body;

  // Validate input fields
  if (!user_name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
  }

  // Extract the token from the Authorization header
  const token = req.header('Authorization');
  if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {

    // Check if the email already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Email already exists.' });
    }


      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [getCompanyUserId] = await db.query('SELECT * FROM users WHERE email = ?', [decoded.email]);
      let companyUserId = getCompanyUserId[0]['company_user_id']

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert the new user into the database
      const [result] = await db.query('INSERT INTO users (company_user_id, user_name, email, password) VALUES (?, ?, ?, ?)', [companyUserId, user_name, email, hashedPassword]);

      // Generate a new JWT token
      //const newToken = jwt.sign({ id: result.insertId, company_user_id, user_name, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.status(201).json({ id: result.insertId, company_user_id: companyUserId, user_name, email });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(400).json({ message: 'Invalid email or password.' });

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password.' });

    const token = jwt.sign({ id: user.users_id, company_user_id: user.company_user_id, user_name: user.user_name, email: user.email }, process.env.JWT_SECRET);
    return res.status(200).json({ id: user.id, name: user.name, email: user.email, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
