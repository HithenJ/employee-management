const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connection = require('./config/db'); // Your DB connection file

const employeeRoutes = require('./routes/employee.routes');
const leaveRoutes = require('./routes/leave.routes'); // Leave route file

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
// Employee Routes
app.use('/api/employees', employeeRoutes);

// Leave Routes
app.use('/api/leave', leaveRoutes);

// Get employee by email
app.get('/api/employees/email/:email', (req, res) => {
    const email = decodeURIComponent(req.params.email);
    connection.query('SELECT * FROM employees WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server Error' });
        if (results.length > 0) res.json(results[0]);
        else res.status(404).json({ message: 'Employee not found' });
    });
});

// PUT endpoint for admin to approve/reject leave
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

  
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
