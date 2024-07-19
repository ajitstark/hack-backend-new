const db = require('../config/db');

// Create new rights status to user
exports.createRights = async (req, res) => {
    const { users_id, user_roles_id, UID, rights_status_ids } = req.body; // rights_status_ids is expected to be an array
    const connection = await db.getConnection(); // Assuming you're using a connection pool

    try {
        await connection.beginTransaction(); // Start a new transaction

        // Insert into user_rights
        const [userRightsResult] = await connection.query('INSERT INTO user_rights (users_id, user_roles_id, UID) VALUES (?, ?, ?)', [users_id, user_roles_id, UID]);
        const user_rights_id = userRightsResult.insertId; // Get the insert ID

        // Insert into userwise_rights for each rights_status_id in the array
        for (const rights_status_id of rights_status_ids) {
            await connection.query('INSERT INTO userwise_rights (user_rights_id, rights_status_id) VALUES (?, ?)', [user_rights_id, rights_status_id]);
        }

        await connection.commit(); // Commit the transaction

        return res.status(200).json({ message: 'Rights created successfully', user_rights_id });
    } catch (err) {
        await connection.rollback(); // Roll back the transaction in case of an error
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        connection.release(); // Release the connection back to the pool
    }
};

exports.RightsFindOne = async (req, res) => {
    const { users_id } = req.body; // Extract users_id from the request body

    if (!users_id) {
        return res.status(400).json({ error: 'users_id is required' });
    }

    try {
        // First query
        const [result1] = await db.query(`
            SELECT user_rights.user_rights_id, user_rights.user_roles_id, user_role.role_name, users.user_name, users.email
            FROM user_rights
            INNER JOIN userwise_rights ON user_rights.user_rights_id = userwise_rights.user_rights_id
            INNER JOIN users ON users.users_id = user_rights.users_id
            INNER JOIN user_role ON user_role.user_role_id = user_rights.user_roles_id
            WHERE user_rights.users_id = ?
        `, [users_id]);

        // Second query
        const [result2] = await db.query(`
            SELECT * FROM user_rights
            INNER JOIN userwise_rights ON user_rights.user_rights_id = userwise_rights.user_rights_id
            WHERE user_rights.users_id = ?
        `, [users_id]);

        // Check if results are found
        if (result1.length === 0 || result2.length === 0) {
            return res.status(404).json({ error: 'No records found for the given user ID' });
        }

        // Combine results
        const rightsMap = {};

        result1.forEach(row => {
            if (!rightsMap[row.user_rights_id]) {
                rightsMap[row.user_rights_id] = {
                    user_rights_id: row.user_rights_id,
                    user_roles_id: row.user_roles_id,
                    role_name: row.role_name,
                    user_name: row.user_name,
                    email: row.email,
                    userwise_rights: []
                };
            }
        });

        result2.forEach(row => {
            if (rightsMap[row.user_rights_id]) {
                rightsMap[row.user_rights_id].userwise_rights.push(row.rights_status_id);
            }
        });

        const response = {
            user_rights: Object.values(rightsMap)
        };

        // Send combined response
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.UpdateRights = async (req, res) => {
    const { rights_id } = req.params;
    const { users_id, user_roles_id, UID, rights_status_ids } = req.body;

    if (!users_id || !user_roles_id || !UID || !Array.isArray(rights_status_ids)) {
        return res.status(400).json({ error: 'Missing required fields or invalid rights_status_ids' });
    }

    const connection = await db.getConnection(); // Assuming you're using a connection pool

    try {
        await connection.beginTransaction(); // Start a new transaction

        // Update the user_rights record
        const [updateRightsResult] = await connection.query(
            'UPDATE user_rights SET users_id = ?, user_roles_id = ?, UID = ? WHERE user_rights_id = ?',
            [users_id, user_roles_id, UID, rights_id]
        );

        // Check if the update affected any rows
        if (updateRightsResult.affectedRows === 0) {
            await connection.rollback(); // Roll back the transaction if no rows were updated
            return res.status(404).json({ error: 'Rights not found' });
        }

        // Delete existing entries in userwise_rights for this rights_id
        await connection.query(
            'DELETE FROM userwise_rights WHERE user_rights_id = ?',
            [rights_id]
        );

        // Insert new entries in userwise_rights
        for (const rights_status_id of rights_status_ids) {
            await connection.query(
                'INSERT INTO userwise_rights (user_rights_id, rights_status_id) VALUES (?, ?)',
                [rights_id, rights_status_id]
            );
        }

        await connection.commit(); // Commit the transaction

        return res.status(200).json({ message: 'Rights updated successfully' });
    } catch (err) {
        await connection.rollback(); // Roll back the transaction in case of an error
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        connection.release(); // Release the connection back to the pool
    }
};


exports.DeleteRights = async (req, res) => {
    const { rights_id } = req.params; // Extract rights_id from URL parameters

    const connection = await db.getConnection(); // Assuming you're using a connection pool

    try {
        await connection.beginTransaction(); // Start a new transaction

        // Delete from userwise_rights
        const [deleteUserwiseRightsResult] = await connection.query(
            'DELETE FROM userwise_rights WHERE user_rights_id = ?',
            [rights_id]
        );

        // Delete from user_rights
        const [deleteUserRightsResult] = await connection.query(
            'DELETE FROM user_rights WHERE user_rights_id = ?',
            [rights_id]
        );

        // Check if the delete affected any rows
        if (deleteUserRightsResult.affectedRows === 0) {
            await connection.rollback(); // Roll back the transaction if no rows were deleted
            return res.status(404).json({ error: 'Rights not found' });
        }

        await connection.commit(); // Commit the transaction

        return res.status(200).json({ message: 'Rights deleted successfully' });
    } catch (err) {
        await connection.rollback(); // Roll back the transaction in case of an error
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        connection.release(); // Release the connection back to the pool
    }
};


