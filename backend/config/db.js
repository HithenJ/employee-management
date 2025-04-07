// const mysql = require('mysql2');

// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'lbpas@1501', // your password here
//     database: 'employee_db'
// });

// db.connect((err) => {
//     if (err) throw err;
//     console.log('MySQL connected');
// });

// module.exports = db;
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',      // same as in HeidiSQL
    user: 'root',           // same
    password: 'root',           // same
    database: 'employee_db' // same
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected');
});

module.exports = db;
