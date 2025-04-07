let leaveRequests = [];
let adminNotifications = [];

// Employee applies for leave
app.post('/api/leave', (req, res) => {
  const newLeave = {
    id: Date.now(),
    employeeName: req.body.employeeName,
    reason: req.body.reason,
    status: 'Pending'
  };
  leaveRequests.push(newLeave);

  // Notify admin
  adminNotifications.push({
    message: `${req.body.employeeName} applied for leave.`,
    leaveId: newLeave.id
  });

  res.status(201).send({ message: 'Leave request submitted', leave: newLeave });
});

// Admin gets notifications
app.get('/api/admin/notifications', (req, res) => {
  res.send(adminNotifications);
});
