const db = require('../config/db');

// Create new employee
exports.create = (req, res) => {
    console.log("Incoming data:", req.body); // 👈 Add this

    const { name, email, phone, department, salary } = req.body;
    if (!name || !email || !phone || !department || !salary) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const sql = 'INSERT INTO employees (name, email, phone, department, salary) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, email, phone, department, salary], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Employee added successfully', employeeId: result.insertId });
    });
};


// Get all employees (for list)
exports.getAll = (req, res) => {
    db.query('SELECT * FROM employees', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};
// Update employee
exports.update = (req, res) => {
    const id = req.params.id;
    const { name, email, phone, department, salary } = req.body;

    if (!name || !email || !phone || !department || !salary) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const sql = 'UPDATE employees SET name = ?, email = ?, phone = ?, department = ?, salary = ? WHERE id = ?';
    db.query(sql, [name, email, phone, department, salary, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        res.status(200).json({ message: 'Employee updated successfully!' });
    });
};


