const db = require('../config/db');

// Mark or update attendance and update employee status
exports.create = (req, res) => {
  console.log("Incoming data:", req.body);
  const { name, email, phone, department, salary } = req.body;
  if (!name || !email || !phone || !department || !salary) {
      return res.status(400).json({ message: 'All fields are required.' });
  }

  const sql = 'INSERT INTO employees (name, email, phone, department, salary) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, email, phone, department, salary], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      // 👇 Add this line to log
      logAdminAction(db, 'ADD_EMPLOYEE', `Added employee ${name}`);
      
      res.status(201).json({ message: 'Employee added successfully', employeeId: result.insertId });
  });
};


// Fetch all attendance with employee name
exports.getAll = (req, res) => {
  const query = `
    SELECT a.id, a.employeeId, e.name as employeeName, a.date, a.status
    FROM attendance a
    JOIN employees e ON a.employeeId = e.id
    ORDER BY a.date DESC`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching attendance:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};

// Fetch attendance for a specific employee
exports.getByEmployeeId = (req, res) => {
  const empId = req.params.id;

  const sql = `
    SELECT a.*, e.name AS employee_name
    FROM attendance a
    JOIN employees e ON a.employeeId = e.id
    WHERE a.employeeId = ?
    ORDER BY a.date DESC`;

  db.query(sql, [empId], (err, results) => {
    if (err) {
      console.error('Error fetching attendance history:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};

// Get today's attendance for an employee
exports.getTodayAttendance = (req, res) => {
  const employeeId = req.query.id;

  if (!employeeId) {
    return res.status(400).json({ message: 'Employee ID is required' });
  }

  const today = new Date().toISOString().split('T')[0];
  const sql = `SELECT * FROM attendance WHERE employeeId = ? AND date = ?`;

  db.query(sql, [employeeId, today], (err, results) => {
    if (err) {
      console.error("Error fetching today's attendance:", err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No attendance found for today' });
    }

    res.json(results[0]);
  });
};
function logAdminAction(db, action_type, message, actor = 'Admin') {
  const sql = 'INSERT INTO notif (action_type, message, actor) VALUES (?, ?, ?)';
  db.query(sql, [action_type, message, actor], (err) => {
      if (err) {
          console.error('Error logging admin action:', err);
      }
  });
}
exports.update = (req, res) => {
  const { id } = req.params;
  const { name, email, phone, department, salary } = req.body;

  if (!name || !email || !phone || !department || !salary) {
      return res.status(400).json({ message: 'All fields are required.' });
  }

  const sql = 'UPDATE employees SET name = ?, email = ?, phone = ?, department = ?, salary = ? WHERE id = ?';
  db.query(sql, [name, email, phone, department, salary, id], (err, result) => {
      if (err) {
          console.error('Error updating employee:', err);
          return res.status(500).json({ error: 'Failed to update employee' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Employee not found' });
      }

      // 👇 Add this line to log
      logAdminAction(db, 'UPDATE_EMPLOYEE', `Updated employee ID ${id}`);
      
      res.json({ message: 'Employee updated successfully' });
  });
};

exports.getAdminLogs = (req, res) => {
  const sql = 'SELECT * FROM notif ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch logs' });
      res.json(results);
  });
};
