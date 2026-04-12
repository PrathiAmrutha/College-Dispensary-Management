const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MySQL2025@', // your MySQL password
    database: 'hostel_health'
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed!", err);
    } else {
        console.log("Connected to MySQL successfully!");
    }
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

//adds student data into MySQL
app.post('/addStudent', (req, res) => {
    const { roll_no, name, branch } = req.body;

    if (!roll_no || !name || !branch) {
        return res.status(400).send({ message: "All fields are required!" });
    }

    const query = "INSERT INTO student (roll_no, name, branch) VALUES (?, ?, ?)";
    db.query(query, [roll_no, name, branch], (err, result) => {
        if (err) return res.status(500).send({ message: err.message });
        res.send({ message: "Student added successfully!" });
    });
});

//adds health record
app.post('/addHealth', (req, res) => {
    const { roll_no, symptoms, prescription, date } = req.body;

    // Validate all fields
    if (!roll_no || !symptoms || !prescription || !date) {
        return res.status(400).send({ message: "All fields are required" });
    }

    // Ensure prescription is stored as JSON string
    let prescriptionJSON;
    try {
        prescriptionJSON = typeof prescription === "string" ? prescription : JSON.stringify(prescription);
    } catch (err) {
        return res.status(400).send({ message: "Invalid prescription format" });
    }

    const sql = `
        INSERT INTO health_data (student_roll_no, symptoms, prescription, date_visit)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [roll_no, symptoms, prescriptionJSON, date], (err, result) => {
        if (err) return res.status(500).send({ message: err.message });
        res.send({ message: "Health record added!" });
    });
});

//view health link
app.get('/viewHealth/:roll_no', (req, res) => {
    const roll_no = req.params.roll_no;

    if (!roll_no) {
        return res.status(400).send({ message: "Roll number required" });
    }

    // Step 1: Get student details
    db.query(
        "SELECT roll_no, name, branch FROM student WHERE roll_no = ?",
        [roll_no],
        (err, students) => {
            if (err) return res.status(500).send({ message: err.message });
            if (students.length === 0)
                return res.status(404).send({ message: "Student not found" });

            const student = students[0];

            // Step 2: Fetch health records
            db.query(
                "SELECT symptoms, prescription, date_visit FROM health_data WHERE student_roll_no = ? ORDER BY id DESC",
                [roll_no],
                (err, records) => {
                    if (err) return res.status(500).send({ message: err.message });

                    // Convert prescription JSON string into array
                    records = records.map(rec => ({
                        symptoms: rec.symptoms,
                        date: rec.date_visit,
                        prescription: JSON.parse(rec.prescription || "[]")
                    }));

                    res.send({ student, records });
                }
            );
        }
    );
});