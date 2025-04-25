// routes/attendance.routes.js
const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// ✅ Create or update attendance
router.post('/', (req, res) => {
  const { employeeId, date, status } = req.body;

  if (!employeeId || !date || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const checkQuery = 'SELECT * FROM attendance WHERE employeeId = ? AND date = ?';
  connection.query(checkQuery, [employeeId, date], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length > 0) {
      // Update if exists
      const updateQuery = 'UPDATE attendance SET status = ? WHERE employeeId = ? AND date = ?';
      connection.query(updateQuery, [status, employeeId, date], (err) => {
        if (err) return res.status(500).json({ message: 'Database error on update' });
        return res.status(200).json({ message: 'Attendance updated successfully' });
      });
    } else {
      // Insert if not exists
      const insertQuery = 'INSERT INTO attendance (employeeId, date, status) VALUES (?, ?, ?)';
      connection.query(insertQuery, [employeeId, date, status], (err) => {
        if (err) return res.status(500).json({ message: 'Database error on insert' });
        return res.status(201).json({ message: 'Attendance marked successfully' });
      });
    }
  });
});

// ✅ Get all attendance with employee name
router.get('/', (req, res) => {
  const sql = `
    SELECT a.id, a.date, a.status, e.name AS employeeName
    FROM attendance a
    JOIN employees e ON a.employeeId = e.id
    ORDER BY a.date DESC`;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching attendance:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// ✅ Get today's attendance by employee ID (Updated to use :id param)
// ✅ GET today's attendance
router.get('/today/:id', (req, res) => {
  const id = req.params.id;
  const today = new Date().toISOString().split('T')[0];

  connection.query(
    'SELECT status FROM attendance WHERE employeeId = ? AND date = ?',
    [id, today],
    (err, rows) => {
      if (err) {
        console.error('Error fetching today attendance:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (rows.length === 0) {
        return res.status(200).json({ status: 'Not Marked' });
      }

      const attendanceStatus = rows[0].status;

      connection.query(
        'UPDATE employees SET status = ? WHERE id = ?',
        [attendanceStatus, id],
        () => {}
      );

      res.json({ status: attendanceStatus });
    }
  );
});

// ✅ GET attendance history by employee ID
router.get('/employee/:id', (req, res) => {
  const empId = req.params.id;

  connection.query('SELECT * FROM attendance WHERE employeeId = ?', [empId], (err, results) => {
    if (err) {
      console.error('Error fetching history:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});


module.exports = router;
