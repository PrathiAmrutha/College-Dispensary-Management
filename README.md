# Hostel Health Management System

A web-based health record management system designed for hostel students and doctors. The system stores student information, health visits, symptoms, and prescriptions in a MySQL database.

## Current Features

Current Features
Student and doctor login
Student and doctor role separation
Add student details
Add health records
Store symptoms and date of visit
View student health history using roll number
Prescription table with:
Medicine name
Dose
Time of intake
MySQL database for storing records

## Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MySQL

## Database

Main tables:

* `student` — stores student details
* `health_data` — stores health visit records
* `prescription` — stores individual medicine details

The health records are associated with students using their **roll number**.

## How to Run

1. Start MySQL and make sure the `hostel_health` database exists.
2. Start the Node.js server:

```bash
node server.js
```

3. Open `index.html` in the browser.
4. Use the available options to add students, add health records, and view health history.

**Planned Improvements**
Role-based student and doctor dashboards
Doctor dashboard with:
Total registered students
Total health visits
Recent visits
Common reasons for visits
Student dashboard
Health chatbot for students
Better UI and responsive design
Improved authentication and security

## Project Status

🚧 **Currently under development**
