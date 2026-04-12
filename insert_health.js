const mysql = require("mysql2");
const readline = require("readline-sync");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "MySQL2025@",   // your password
    database: "hostel_health"
});

db.connect((err) => {
    if (err) {
        console.log("Connection error:", err);
        return;
    }

    console.log("Connected!");

    let student_roll_no = readline.question("Enter student ID: ");
    let symptoms = readline.question("Enter symptoms: ");
    let prescription = readline.question("Enter prescription: ");

    const query = "INSERT INTO health_data (student_roll_no, symptoms, prescription) VALUES (?, ?, ?)";

    db.query(query, [student_roll_no, symptoms, prescription], (err, result) => {
        if (err) {
            console.log("Insert error:", err);
        } else {
            console.log("Health record added successfully!");
        }
        db.end();
    });
});
