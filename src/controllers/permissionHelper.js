const db = require('../config/db');

exports.checkPermission = async (user_id, project_id, company_userid, permission_type) => {
    try {
        const [rows] = await db.query(`
            SELECT \`${permission_type}\` FROM user_permission 
            WHERE user_id = ? AND project_id = ? AND company_userid = ?
        `, [user_id, project_id, company_userid]);

        if (rows.length > 0) {
            return rows[0][permission_type] === 1;
        }

        return false;
    } catch (err) {
        console.error(err);
        throw new Error('Error checking permissions');
    }
};
