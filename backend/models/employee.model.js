// employee.model.js
const db = require('../config/db');

const Employee = function(employee) {
    this.name = employee.name;
    this.email = employee.email;
    this.phone = employee.phone;
    this.department = employee.department;
    this.salary = employee.salary;
    this.salary = employee.role;

};

Employee.create = (newEmployee, result) => {
    db.query('INSERT INTO employee SET ?', newEmployee, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        result(null, { id: res.insertId, ...newEmployee });
    });
};

module.exports = Employee;
