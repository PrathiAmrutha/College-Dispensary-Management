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

    let roll_no = readline.question("Enter roll number of student: ");

    db.query(
        "SELECT name, branch, roll_no FROM student WHERE roll_no = ?",
        [roll_no],
        (err, students) => {
            if (err) {
                console.log("Error fetching student:", err);
                db.end();
                return;
            }

            if (students.length === 0) {
                console.log("No student found with this roll number.");
                db.end();
                return;
            }

            let student = students[0];
            console.log(`\nHealth history for ${student.name} (Branch: ${student.branch}):\n`);

            // Now fetch health records using roll number
            db.query(
                "SELECT symptoms, prescription FROM health_data WHERE student_roll_no = ? ORDER BY id DESC",
                [student.roll_no],
                (err, records) => {
                    if (err) {
                        console.log("Error fetching records:", err);
                    } else if (records.length === 0) {
                        console.log("No health records found for this student.");
                    } else {
                        records.forEach((rec, index) => {
                            console.log(
                                `${index + 1}. Symptoms: ${rec.symptoms}, Prescription: ${rec.prescription}`
                            );
                        });
                    }
                    db.end();
                }
            );
        }
    );
});
