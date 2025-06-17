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
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);

// ✅ Upload profile picture + update name & email
app.post('/api/employees/profile-pic/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { profilePic, name, email } = req.body;

    if (!profilePic) {
        return res.status(400).json({ message: 'No profile picture provided' });
    }

    const query = `
        UPDATE employees 
        SET profilePic = ?, name = ?, email = ? 
        WHERE id = ?
    `;

    connection.query(query, [profilePic, name, email, id], (err, result) => {
        if (err) {
            console.error('Error updating profile:', err);
            return res.status(500).json({ message: 'Error updating profile' });
        }
        res.json({ message: 'Profile updated successfully' });
    });
});

// ✅ Get employee by email
app.get('/api/employees/email/:email', (req, res) => {
    const email = decodeURIComponent(req.params.email);
    connection.query('SELECT * FROM employees WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server Error' });
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    });
});

// ✅ Get employee role by email
app.get('/api/employees/role/:email', (req, res) => {
    const email = req.params.email;
    connection.query('SELECT role FROM employees WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server Error' });
        if (results.length > 0) {
            res.json(results[0].role);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

// ✅ Approve or reject leave
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

// ✅ Delete employee
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

// ✅ Get today's attendance status
app.get('/api/attendance/status/today', (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    const today = new Date().toISOString().split('T')[0];

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

// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
