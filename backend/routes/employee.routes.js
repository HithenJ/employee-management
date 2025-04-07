const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const connection = require('../config/db'); // DB connection

// GET all employees
router.get('/', employeeController.getAll);

// GET employee by email
router.get('/email/:email', (req, res) => {
    const email = decodeURIComponent(req.params.email);
    const cleanedEmail = email.toLowerCase().trim();

    connection.query('SELECT * FROM employees WHERE LOWER(TRIM(email)) = ?', [cleanedEmail], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'DB Error' });
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    });
});

// POST new employee
router.post('/', employeeController.create);

// PUT update employee by ID
router.put('/:id', employeeController.update);

// DELETE employee by ID (Fixed)
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    connection.query('DELETE FROM employees WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database Error' });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee deleted successfully' });
    });
});

module.exports = router;
