const db = require('../config/db');

// 📥 Get all employees
exports.getAll = (req, res) => {
    db.query('SELECT * FROM employees', (err, results) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        res.json(results);
    });
};

// 🟢 Create new employee
// employee.controller.js
exports.create = (req, res) => {
    const { name, email, phone, department, salary, role } = req.body;

    if (!name || !email || !phone || !department || !salary || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const sql = 'INSERT INTO employees (name, email, phone, department, salary, role) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, email, phone, department, salary, role], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // Log action
        // const logQuery = 'INSERT INTO admin_logs (action_type, message, actor) VALUES (?, ?, ?)';
        // db.query(logQuery, ['ADD_EMPLOYEE', `Added employee ${name}`, 'Admin']);

        res.status(201).json({ message: 'Employee added successfully', employeeId: result.insertId });
    });
};


// ✅ Update employee attendance status
exports.updateStatus = (req, res) => {
    const { id } = req.params;
    const { attendanceStatus } = req.body;

    const query = 'UPDATE employees SET attendanceStatus = ? WHERE id = ?';
    db.query(query, [attendanceStatus, id], (err, result) => {
        if (err) {
            console.error('Error updating status:', err);
            return res.status(500).json({ error: 'Failed to update status' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Log action
        const logQuery = 'INSERT INTO admin_logs (action_type, message, actor) VALUES (?, ?, ?)';
        db.query(logQuery, ['UPDATE_ATTENDANCE', `Updated attendance for employee ID ${id}`, 'Admin']);

        res.json({ message: 'Employee status updated successfully' });
    });
};

// ✏️ Update employee details
exports.update = (req, res) => {
    const { id } = req.params;
    const { name, email, phone, department, salary, role, actorRole } = req.body;

    // Disallow editing admin if the user is not superadmin
    if (role === 'admin' && actorRole !== 'superadmin') {
        return res.status(403).json({ message: 'You are not allowed to update admin details.' });
    }

    if (!name || !email || !phone || !department || !salary || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const sql = `
        UPDATE employees 
        SET name = ?, email = ?, phone = ?, department = ?, salary = ?, role = ?
        WHERE id = ?
    `;

    db.query(sql, [name, email, phone, department, salary, role, id], (err, result) => {
        if (err) {
            console.error('Error updating employee:', err);
            return res.status(500).json({ error: 'Failed to update employee' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json({ message: 'Employee updated successfully' });
    });
};

