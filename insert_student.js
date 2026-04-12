const mysql = require("mysql2");
const readline = require("readline-sync");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "MySQL2025@",
    database: "hostel_health"
});

db.connect((err) => {
    if (err) {
        console.log("Connection error:", err);
        return;
    }

    console.log("Connected!");

    let id = readline.question('Enter id no: ');
    let roll_no = readline.question("Enter roll number: ");
    let name = readline.question("Enter name: ");
    let branch = readline.question("Enter branch: ");

    const query = "INSERT INTO student (id, roll_no, name, branch) VALUES (?, ?, ?, ?)";
    
    db.query(query, [id, roll_no, name, branch], (err, result) => {
        if (err) {
            console.log("Insert error:", err);
        } else {
            console.log("Student added successfully!");
        }
        db.end();
    });
});
