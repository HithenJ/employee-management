const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const connection = require('../config/db');
const attendanceController = require('../controllers/attendance.controller');
const path = require('path');

// -------------------- ROUTES --------------------

// ✅ GET all employees
router.get('/', employeeController.getAll);

// ✅ GET employee by email
router.get('/email/:email', (req, res) => {
    const email = decodeURIComponent(req.params.email);
    const cleanedEmail = email.toLowerCase().trim();

    connection.query('SELECT * FROM employees WHERE LOWER(TRIM(email)) = ?', [cleanedEmail], (err, results) => {
        if (err) return res.status(500).json({ message: 'DB Error' });
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    });
});

// ✅ POST new employee
router.post('/', employeeController.create);

// ✅ PUT update employee info by ID
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;

    connection.query('UPDATE employees SET ? WHERE id = ?', [updatedData, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating employee' });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee updated successfully' });
    });
});

// ✅ PATCH update employee status
router.patch('/:id', employeeController.updateStatus);

// ✅ DELETE employee
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

// ✅ POST: Update profile picture and name/email
router.post('/profile-pic/:id', (req, res) => {
    const { profilePic, name, email } = req.body;
    const { id } = req.params;

    if (!profilePic) {
        return res.status(400).json({ message: 'No profile picture data provided' });
    }

    const sql = `
        UPDATE employees 
        SET profilePic = ?, name = ?, email = ?
        WHERE id = ?
    `;
    const values = [profilePic, name, email, id];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating profile picture:', err);
            return res.status(500).json({ message: 'Error updating profile' });
        }

        res.status(200).json({ message: 'Profile updated successfully' });
    });
});

// ✅ POST: Update additional personal details (phone, dob, gender, address, optional photo)
router.post('/update/:employeeId', (req, res) => {
    const { phone, dob, gender, address } = req.body;
    const { employeeId } = req.params;
    const photo = req.file ? req.file.filename : null;

    let query = `
        UPDATE employees
        SET phone = ?, dob = ?, gender = ?, address = ?
        ${photo ? ', photo = ?' : ''}
        WHERE employeeId = ?
    `;

    const params = photo
        ? [phone, dob, gender, address, photo, employeeId]
        : [phone, dob, gender, address, employeeId];

    connection.query(query, params, (err, result) => {
        if (err) {
            console.error('Error updating personal details:', err);
            return res.status(500).json({ message: 'Error updating employee' });
        }

        res.json({ message: 'Employee personal details updated successfully' });
    });
});

module.exports = router;
