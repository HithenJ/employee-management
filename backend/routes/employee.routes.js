const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const connection = require('../config/db'); // DB connection
const attendanceController = require('../controllers/attendance.controller');
const db = require('../config/db'); // adjust path based on your folder structure

const path = require('path');

// Multer config for photo upload


// -------------------- ROUTES --------------------

// GET all employees
router.get('/', employeeController.getAll);
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

// PATCH update employee status
router.patch('/:id', employeeController.updateStatus);

// POST new employee
router.post('/', employeeController.create);

// PUT update employee by ID
router.put('/:id', employeeController.update);

// DELETE employee by ID
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

// ✅ UPDATE personal details with optional photo upload
// PUT personal details with optional photo upload
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
        console.error(err);
        return res.status(500).json({ message: 'Error updating employee' });
      }
      res.json({ message: 'Employee updated successfully' });
    });
  });
  router.put('/:id', employeeController.update);

  // router.put('/employees/:id', (req, res) => {
  //   const { id } = req.params;
  //   const { name, email, phone, dob, gender, address, profilePic} = req.body;
  
  //   const sql = `
  //     UPDATE employees SET 
  //       name = ?, email = ?, phone = ?, dob = ?, gender = ?, address = ?, profilePic = ?,
  //     WHERE id = ?
  //     WHERE id = ?
  //   `;
  
  //   db.query(sql, [name, email, phone, dob, gender, address, profilePic, id], (err, result) => {
  //     if (err) {
  //       console.error('Error updating employee:', err);
  //       return res.status(500).json({ message: 'Error updating employee' });
  //     }
  //     res.json({ message: 'Employee updated successfully' });
  //   });
  // });
module.exports = router;
