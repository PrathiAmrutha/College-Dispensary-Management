const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

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
        db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role VARCHAR(20) NOT NULL,
                username VARCHAR(100) NOT NULL,
                password VARCHAR(100) NOT NULL,
                roll_no VARCHAR(50) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user (role, username)
            )
        `, (tableErr) => {
            if (tableErr) {
                console.log("User table setup failed", tableErr);
            }
        });

        db.query(`
            CREATE TABLE IF NOT EXISTS student (
                roll_no VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                branch VARCHAR(100) NOT NULL,
                phone VARCHAR(20) DEFAULT NULL,
                email VARCHAR(100) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (studentErr) => {
            if (studentErr) {
                console.log("Student table setup failed", studentErr);
            }
        });

        db.query(`
            CREATE TABLE IF NOT EXISTS doctor (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                username VARCHAR(100) NOT NULL,
                phone VARCHAR(20) DEFAULT NULL,
                email VARCHAR(100) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_doc_username (username)
            )
        `, (docErr) => {
            if (docErr) {
                console.log("Doctor table setup failed", docErr);
            }
        });

        db.query(`
            CREATE TABLE IF NOT EXISTS visited (
                roll_no VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                branch VARCHAR(100) DEFAULT 'Not provided',
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (visErr) => {
            if (visErr) {
                console.log("Visited table setup failed", visErr);
            }
        });

        db.query(`
            CREATE TABLE IF NOT EXISTS health_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_roll_no VARCHAR(50) NOT NULL,
                symptoms TEXT,
                prescription TEXT,
                date_visit DATE,
                doctor_username VARCHAR(100) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (healthErr) => {
            if (healthErr) {
                console.log("Health data table setup failed", healthErr);
            }
        });

        // Upgrade databases created by earlier versions of the project.
        const migrations = [
            ['users', 'roll_no', 'VARCHAR(50) DEFAULT NULL'],
            ['student', 'phone', 'VARCHAR(20) DEFAULT NULL'],
            ['student', 'email', 'VARCHAR(100) DEFAULT NULL'],
            ['health_data', 'doctor_username', 'VARCHAR(100) DEFAULT NULL'],
            ['health_data', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP']
        ];

        migrations.forEach(([tableName, columnName, definition]) => {
            db.query(
                'SELECT COUNT(*) AS columnCount FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
                [tableName, columnName],
                (checkErr, rows) => {
                    if (checkErr) {
                        console.log("Database migration check failed:", checkErr.message);
                        return;
                    }

                    if (rows[0].columnCount === 0) {
                        db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`, (migrationErr) => {
                            if (migrationErr) {
                                console.log("Database migration failed:", migrationErr.message);
                            }
                        });
                    }
                }
            );
        });

        db.query('ALTER TABLE health_data MODIFY COLUMN symptoms TEXT', (migrationErr) => {
            if (migrationErr) console.log("Symptoms column migration failed:", migrationErr.message);
        });
        db.query('ALTER TABLE health_data MODIFY COLUMN prescription TEXT', (migrationErr) => {
            if (migrationErr) console.log("Prescription column migration failed:", migrationErr.message);
        });
        db.query('ALTER TABLE student MODIFY COLUMN name VARCHAR(100) NULL', (migrationErr) => {
            if (migrationErr) console.log("Student name migration failed:", migrationErr.message);
        });
        db.query('ALTER TABLE student MODIFY COLUMN branch VARCHAR(100) NULL', (migrationErr) => {
            if (migrationErr) console.log("Student branch migration failed:", migrationErr.message);
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

app.post('/registerStudent', (req, res) => {
    const { name, roll_no, username, password, phone, email } = req.body;

    if (!name || !roll_no || !username || !password || !phone || !email) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    const safeUsername = username.trim().toLowerCase();
    const safeRollNo = roll_no.toString().trim();

    db.query(
        'SELECT id FROM users WHERE role = ? AND LOWER(username) = ?',
        ['student', safeUsername],
        (err, results) => {
            if (err) return res.status(500).send({ message: err.message });
            if (results.length > 0) {
                return res.status(409).send({ message: 'Account already exists for this username' });
            }

            db.query(
                'INSERT INTO student (roll_no, name, branch, phone, email) VALUES (?, ?, ?, ?, ?)',
                [safeRollNo, name, 'Not provided', phone, email],
                (studentErr) => {
                    if (studentErr) return res.status(500).send({ message: studentErr.message });

                    db.query(
                        'INSERT INTO users (role, username, password, roll_no) VALUES (?, ?, ?, ?)',
                        ['student', safeUsername, password, safeRollNo],
                        (userErr) => {
                            if (userErr) return res.status(500).send({ message: userErr.message });
                            res.send({ message: 'Student account created successfully.' });
                        }
                    );
                }
            );
        }
    );
});

app.post('/register', (req, res) => {
    const { role, username, password, roll_no } = req.body;

    if (!role || !username || !password) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    if (!['doctor', 'student'].includes(role)) {
        return res.status(400).send({ message: 'Unknown role' });
    }

    if (role === 'student' && !roll_no) {
        return res.status(400).send({ message: 'Roll number is required for student accounts' });
    }

    const safeUsername = username.trim().toLowerCase();
    const safeRollNo = roll_no ? roll_no.toString().trim() : null;

    db.query(
        'SELECT id FROM users WHERE role = ? AND LOWER(username) = ?',
        [role, safeUsername],
        (err, results) => {
            if (err) return res.status(500).send({ message: err.message });
            if (results.length > 0) {
                return res.status(409).send({ message: 'Account already exists for this role and username' });
            }

            // If student: ensure student record exists (or create if name/phone/email provided via req.body)
            if (role === 'student') {
                const { name, phone, email, branch } = req.body;
                db.query('SELECT roll_no FROM student WHERE roll_no = ?', [safeRollNo], (studentErr, studentRows) => {
                    if (studentErr) return res.status(500).send({ message: studentErr.message });

                    const insertUser = () => {
                        db.query('INSERT INTO users (role, username, password, roll_no) VALUES (?, ?, ?, ?)',
                            [role, safeUsername, password, safeRollNo],
                            (insertErr) => {
                                if (insertErr) return res.status(500).send({ message: insertErr.message });
                                res.send({ message: 'Student account created successfully. You can now log in.', roll_no: safeRollNo });
                            }
                        );
                    };

                    if (studentRows.length === 0) {
                        // create student record if name provided, otherwise reject
                        if (!name) return res.status(404).send({ message: 'Student record not found for this roll number. Provide name to create.' });

                        db.query('INSERT INTO student (roll_no, name, branch, phone, email) VALUES (?, ?, ?, ?, ?)',
                            [safeRollNo, name, branch || 'Not provided', phone || null, email || null],
                            (insErr) => {
                                if (insErr) return res.status(500).send({ message: insErr.message });
                                insertUser();
                            }
                        );
                    } else {
                        insertUser();
                    }
                });
                return;
            }

            // If doctor: create doctor profile and user
            if (role === 'doctor') {
                const { name, phone, email } = req.body;
                db.query('INSERT INTO doctor (name, username, phone, email) VALUES (?, ?, ?, ?)',
                    [name || safeUsername, safeUsername, phone || null, email || null],
                    (docErr) => {
                        if (docErr) return res.status(500).send({ message: docErr.message });
                        db.query('INSERT INTO users (role, username, password, roll_no) VALUES (?, ?, ?, ?)',
                            [role, safeUsername, password, safeRollNo],
                            (insertErr) => {
                                if (insertErr) return res.status(500).send({ message: insertErr.message });
                                res.send({ message: 'Doctor account created successfully. You can now log in.' });
                            }
                        );
                    }
                );
                return;
            }

            // Fallback: create user record
            db.query(
                'INSERT INTO users (role, username, password, roll_no) VALUES (?, ?, ?, ?)',
                [role, safeUsername, password, safeRollNo],
                (insertErr) => {
                    if (insertErr) return res.status(500).send({ message: insertErr.message });
                    res.send({ message: 'Account created successfully. You can now log in.', roll_no: safeRollNo });
                }
            );
        }
    );
});

app.post('/login', (req, res) => {
    const { role, username, password, roll_no } = req.body;

    if (!role || !username || !password) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    if (!['doctor', 'student'].includes(role)) {
        return res.status(400).send({ message: 'Unknown role' });
    }

    const safeUsername = username.trim().toLowerCase();
    const safeRollNo = roll_no ? roll_no.toString().trim() : null;

    if (role === 'student') {
        db.query('SELECT roll_no FROM student WHERE roll_no = ?', [safeRollNo], (studentErr, studentRows) => {
            if (studentErr) return res.status(500).send({ message: studentErr.message });
            if (studentRows.length === 0) {
                return res.status(404).send({ message: 'Student record not found for this roll number' });
            }

            db.query(
                'SELECT * FROM users WHERE role = ? AND LOWER(username) = ? AND password = ? AND roll_no = ?',
                [role, safeUsername, password, safeRollNo],
                (err, results) => {
                    if (err) return res.status(500).send({ message: err.message });
                    if (results.length === 0) {
                        return res.status(401).send({ message: 'Invalid credentials. Please sign up first.' });
                    }

                    res.send({ message: 'Student login successful', roll_no: results[0].roll_no });
                }
            );
        });
        return;
    }

    db.query(
        'SELECT * FROM users WHERE role = ? AND LOWER(username) = ? AND password = ?',
        [role, safeUsername, password],
        (err, results) => {
            if (err) return res.status(500).send({ message: err.message });
            if (results.length === 0) {
                return res.status(401).send({ message: 'Invalid credentials. Please sign up first.' });
            }

            res.send({ message: 'Doctor login successful', roll_no: results[0].roll_no });
        }
    );
});

app.get('/dashboardData', (req, res) => {
    const doctorFilter = req.query.doctor ? String(req.query.doctor).trim() : null;
    const dashboardQuery = `
        SELECT s.roll_no, s.name, s.branch, h.symptoms, h.date_visit, h.doctor_username
        FROM student s
        LEFT JOIN health_data h ON s.roll_no = h.student_roll_no
        ${doctorFilter ? 'WHERE h.doctor_username = ?' : ''}
        ORDER BY h.date_visit DESC, s.roll_no ASC
    `;

    db.query(dashboardQuery, doctorFilter ? [doctorFilter] : [], (err, rows) => {
        if (err) {
            return res.status(500).send({ error: true, message: err.message });
        }

        const totalStudents = new Set(rows.filter(r => r.roll_no).map(r => r.roll_no)).size;
        const totalVisits = rows.filter(r => r.symptoms).length;
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const todayPatients = rows.filter(r => r.date_visit && r.date_visit.toString().slice(0, 10) === todayStr).length;

        const frequentVisitors = rows
            .filter(r => r.roll_no)
            .reduce((acc, row) => {
                const existing = acc.find(item => item.roll_no === row.roll_no);
                if (existing) {
                    existing.visits += row.symptoms ? 1 : 0;
                } else {
                    acc.push({ roll_no: row.roll_no, name: row.name, visits: row.symptoms ? 1 : 0 });
                }
                return acc;
            }, [])
            .filter(item => item.visits > 0)
            .sort((a, b) => b.visits - a.visits)
            .slice(0, 5);

        const complaintCounts = rows
            .filter(r => r.symptoms)
            .reduce((acc, row) => {
                const key = row.symptoms.toLowerCase();
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});

        const commonComplaints = Object.entries(complaintCounts)
            .map(([symptoms, count]) => ({ symptoms, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const recentRecords = rows
            .filter(r => r.symptoms)
            .slice(0, 8)
            .map(row => ({
                name: row.name,
                symptoms: row.symptoms,
                date_visit: row.date_visit ? new Date(row.date_visit).toISOString().slice(0, 10) : 'N/A'
            }));

        res.send({
            totalStudents,
            totalVisits,
            todayPatients,
            frequentVisitors,
            commonComplaints,
            recentRecords
        });
    });
});

//adds student data into MySQL
app.post('/addStudent', (req, res) => {
    const { roll_no, name, branch } = req.body;

    if (!roll_no || !name || !branch) {
        return res.status(400).send({ message: "All fields are required!" });
    }

    const rollPattern = /^\d{2}(CS|EC|EE|ME|CE|CH|BT|MT|PH)\d{1}[A-Z]\d{2}$/i;
    if (!rollPattern.test(String(roll_no))) {
        return res.status(400).send({ message: "Roll number must follow YYBRC0NO format, e.g. 24CSB01" });
    }

    const query = "INSERT INTO student (roll_no, name, branch) VALUES (?, ?, ?)";
    // Insert into student if not exists, and ensure visited table also contains this student
    db.query('SELECT roll_no FROM student WHERE roll_no = ?', [roll_no], (selErr, rows) => {
        if (selErr) return res.status(500).send({ message: selErr.message });
        const insertStudent = () => {
            db.query('INSERT IGNORE INTO visited (roll_no, name, branch) VALUES (?, ?, ?)', [roll_no, name, branch], () => {
                // ignore visited insert errors for now
                res.send({ message: 'Student added successfully!' });
            });
        };

        if (rows.length === 0) {
            db.query(query, [roll_no, name, branch], (err, result) => {
                if (err) return res.status(500).send({ message: err.message });
                insertStudent();
            });
        } else {
            insertStudent();
        }
    });
});

app.delete('/deleteStudent/:roll_no', (req, res) => {
    const roll_no = req.params.roll_no;

    if (!roll_no) {
        return res.status(400).send({ message: "Roll number required" });
    }

    db.query('DELETE FROM health_data WHERE student_roll_no = ?', [roll_no], (healthErr) => {
        if (healthErr) return res.status(500).send({ message: healthErr.message });

        db.query('DELETE FROM student WHERE roll_no = ?', [roll_no], (studentErr) => {
            if (studentErr) return res.status(500).send({ message: studentErr.message });
            db.query('DELETE FROM users WHERE roll_no = ?', [roll_no], (userErr) => {
                if (userErr) return res.status(500).send({ message: userErr.message });
                res.send({ message: 'Student deleted successfully' });
            });
        });
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

    const { doctor_username } = req.body;

    const sql = `
        INSERT INTO health_data (student_roll_no, symptoms, prescription, date_visit, doctor_username)
        VALUES (?, ?, ?, ?, ?)
    `;

    // ensure visited table has this student
    db.query('INSERT IGNORE INTO visited (roll_no, name, branch) SELECT roll_no, name, branch FROM student WHERE roll_no = ?;', [roll_no], () => {
        db.query(sql, [roll_no, symptoms, prescriptionJSON, date, doctor_username || null], (err, result) => {
            if (err) return res.status(500).send({ message: err.message });
            res.send({ message: "Health record added!" });
        });
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
            if (students.length === 0) {
                // fallback to visited table when student record isn't present
                db.query(
                    "SELECT roll_no, name, branch FROM visited WHERE roll_no = ?",
                    [roll_no],
                    (vErr, visRows) => {
                        if (vErr) return res.status(500).send({ message: vErr.message });
                        if (visRows.length === 0) return res.status(404).send({ message: "Student not found" });

                        const student = visRows[0];

                        db.query(
                            "SELECT symptoms, prescription, date_visit FROM health_data WHERE student_roll_no = ? ORDER BY id DESC",
                            [roll_no],
                            (err, records) => {
                                if (err) return res.status(500).send({ message: err.message });

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
                return;
            }

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