const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connection = require('./config/db'); // DB connection

const employeeRoutes = require('./routes/employee.routes');
const leaveRoutes = require('./routes/leave.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// --------------------- API ROUTES --------------------- 
app.use('/api', employeeRoutes);
// Employee Routes
app.use('/api/employees', employeeRoutes);

// Attendance Routes
app.use('/api/attendance', attendanceRoutes);

// Get attendance history by employeeId
app.get('/api/attendance/:employeeId', (req, res) => {
    const employeeId = req.params.employeeId;
    connection.query(
        'SELECT date, status FROM attendance WHERE employee_id = ? ORDER BY date DESC',
        [employeeId],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        }
    );
});

// Leave Routes
app.use('/api/leave', leaveRoutes);

// Get employee by email
app.get('/api/employees/email/:email', (req, res) => {
    const email = decodeURIComponent(req.params.email);
    connection.query('SELECT * FROM employees WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server Error' });
        if (results.length > 0) {
            // Assuming the role is in the employee data, send the full employee data including the role
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    });
});

// Get employee role by email
app.get('/api/employees/role/:email', (req, res) => {
    const email = req.params.email;
    connection.query('SELECT role FROM employees WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server Error' });
        if (results.length > 0) {
            res.json(results[0].role); // Return the role only
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

// Approve/Reject Leave Request
app.put('/api/leave/admin/leave/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    connection.query('UPDATE leave_requests SET status = ? WHERE id = ?', [status, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database Error' });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Leave application not found' });
        }
        res.json({ message: `Leave ${status.toLowerCase()} successfully` });
    });
});

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;

    connection.query('DELETE FROM employees WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database Error' });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee deleted successfully' });
    });
});

// Today's attendance status
app.get('/api/attendance/:employeeId', (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const query = `
        SELECT status FROM attendance 
        WHERE employeeId = ? AND DATE(date) = ?
        LIMIT 1
    `;

    connection.query(query, [id, today], (err, results) => {
        if (err) {
            console.error('Error fetching attendance:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length > 0) {
            res.json({ status: results[0].status });
        } else {
            res.json({ status: 'Not Marked' });
        }
    });
});

// --------------------- SERVER --------------------- 
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
