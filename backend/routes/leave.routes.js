const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// Employee applies for leave
router.post('/apply', (req, res) => {
    const { employeeId, name, reason, fromDate, toDate } = req.body;

    if (!employeeId || !name || !reason || !fromDate || !toDate) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const sql = `INSERT INTO leaves (employeeId, name, reason, fromDate, toDate, status) VALUES (?, ?, ?, ?, ?, 'Pending')`;
    connection.query(sql, [employeeId, name, reason, fromDate, toDate], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', err });
        res.status(201).json({ message: 'Leave applied successfully', leaveId: result.insertId });
    });
});

// Admin: Approve or Reject Leave by ID
router.put('/admin/leave/:id', (req, res) => {
    const leaveId = req.params.id;
    const { status } = req.body; // Expected 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    const sql = `UPDATE leaves SET status = ? WHERE id = ?`;
    connection.query(sql, [status, leaveId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        res.json({ message: `Leave ${status.toLowerCase()} successfully` });
    });
});

// Admin: Get all leave applications + employee name (JOIN)
router.get('/admin/all', (req, res) => {
    const sql = `
        SELECT l.*, e.name AS employeeName, e.email AS employeeEmail 
        FROM leaves l 
        JOIN employees e ON l.employeeId = e.id
    `;
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', err });
        res.json(results);
    });
});

// Get pending leaves for a specific employee
router.get('/pending/:employeeId', (req, res) => {
    const employeeId = req.params.employeeId;

    const sql = `SELECT * FROM leaves WHERE employeeId = ? AND status = 'Pending'`;
    connection.query(sql, [employeeId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', err });
        res.json(results);
    });
});

// Get full leave history for an employee
router.get('/:employeeId/history', (req, res) => {
    const employeeId = req.params.employeeId;

    const sql = `SELECT * FROM leaves WHERE employeeId = ? ORDER BY fromDate DESC`;
    connection.query(sql, [employeeId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', err });
        res.json(results);
    });
});

module.exports = router;
