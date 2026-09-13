# Hostel Health Portal - Interview Notes

## 1. Project Introduction

This is a web-based hostel health management system. It helps doctors manage student information and health records, while students can log in and view their own health history.

The application follows a simple client-server architecture:

- Frontend: HTML, CSS, and JavaScript
- Backend: Node.js with Express.js
- Database: MySQL
- Communication: JSON-based HTTP APIs using `fetch`

## 2. Main Features

- Student and doctor registration
- Role-based login
- Student profile management
- Doctor profile management
- Add and view health records
- Store symptoms, visit dates, and prescriptions
- Doctor dashboard with basic statistics
- Student health-history lookup
- Input validation and meaningful HTTP responses
- Database compatibility updates for older table structures

## 3. Application Flow

1. The user opens the login or registration page.
2. The frontend collects the form data.
3. JavaScript sends the data to an Express API using `fetch`.
4. Express validates the request.
5. The server performs the required MySQL operation.
6. The server returns a JSON response.
7. The frontend displays the result or redirects the user.

For example, when adding a health record, the doctor enters the student's roll number, symptoms, date, and medicines. The browser sends this information to `/addHealth`, and the server stores it in MySQL.

## 4. Database Design

The main tables are:

- `users`: login details and role
- `student`: student profile information
- `doctor`: doctor profile information
- `health_data`: health visits and prescriptions
- `visited`: students who have appeared in the health system

The tables separate different types of information and reduce unnecessary duplication. The prescription is currently stored as JSON text because one visit can contain multiple medicines.

## 5. Important Backend Concepts

### Express.js

Express is used to create the server, define routes, serve static files, and process requests.

### Middleware

The application uses middleware for:

- Parsing JSON request bodies
- Enabling CORS
- Serving frontend files

### REST-style APIs

The application uses HTTP methods according to the operation:

- `GET`: retrieve data
- `POST`: create data
- `DELETE`: remove data

Examples include `/login`, `/register`, `/addStudent`, `/addHealth`, and `/viewHealth/:roll_no`.

### Asynchronous programming

Database operations are asynchronous. The application uses callbacks so the Node.js event loop is not blocked while waiting for MySQL.

A future improvement would be converting nested callbacks into Promises and `async/await` for better readability.

### JSON

JSON is used for communication between the browser and server. Prescription medicines are collected as an array, converted into JSON, stored, and converted back when records are displayed.

## 6. Validation and Error Handling

The application validates required fields, allowed roles, roll numbers, duplicate usernames, and missing students.

It uses status codes such as:

- `200`: successful request
- `400`: invalid input
- `401`: invalid credentials
- `404`: data not found
- `409`: duplicate account
- `500`: server or database error

Validation is performed on the server because frontend validation can be bypassed.

## 7. SQL and Database Points

The application uses parameterized SQL queries with `?` placeholders. This is safer than joining user input directly into SQL strings and helps prevent SQL injection.

The dashboard uses a `LEFT JOIN` between students and health records. This allows students without health visits to still appear in the result.

The server also checks and updates older database columns during startup so that an existing database can work with the current application.

## 8. Dashboard Explanation

The doctor dashboard is a summary screen. It displays:

- Number of registered students
- Number of health visits
- Patients visited today
- Frequent visitors
- Common complaints
- Recent health records

The server retrieves the required data and calculates these summaries using JavaScript array methods such as `filter`, `reduce`, `sort`, and `slice`.

## 9. Security Awareness

The current project is a functional academic prototype, not a production medical system. Important future improvements are:

- Hash passwords using bcrypt or Argon2
- Move database credentials to environment variables
- Use server-side sessions or JWT authentication
- Add authorization checks to protected routes
- Prevent students from requesting another student's records
- Use transactions for multi-step database operations
- Add stronger validation, rate limiting, HTTPS, and audit logs
- Safely render user-provided content instead of inserting it directly into HTML

A good interview statement is:

> I implemented the core functionality and used parameterized queries and server-side validation. For production, I would strengthen authentication, authorization, password security, and data privacy before deploying it for real medical information.

## 10. Common Interview Questions

### Why did you choose MySQL?

The application contains related data such as users, students, doctors, and health visits. MySQL is suitable because it supports structured tables, relationships, constraints, joins, and transactions.

### Why did you use Express?

Express is lightweight and makes it easy to create routes, middleware, and APIs in Node.js.

### How did you prevent SQL injection?

I used parameterized queries instead of concatenating user input into SQL statements.

### Why validate on the backend?

Frontend validation improves user experience, but it can be bypassed. Backend validation protects the application and database.

### How does login work?

The server checks the role, username, password, and roll number for students. If the values match a database record, it returns a successful response and the frontend redirects the user.

### Why use JSON for prescriptions?

A single visit can have multiple medicines. JSON provides a simple way to store a list of medicine details in this prototype.

### How would you improve the project?

I would add secure authentication, password hashing, authorization middleware, transactions, environment variables, automated tests, and better separation between routes, controllers, and database logic.

### How would you test it?

I would test registration, login, duplicate accounts, invalid input, adding health records, viewing records, missing students, and unauthorized access. I would use API tests and browser-based tests.

## 11. Short Final Explanation

> I developed a hostel health management portal using HTML, CSS, JavaScript, Node.js, Express, and MySQL. Doctors can manage students and health visits through a dashboard, while students can view their health history. The frontend communicates with REST-style APIs, and the backend validates requests and performs parameterized database queries. The current version is a working prototype, and the main production improvements would be secure authentication, authorization, password hashing, transactions, and automated testing.

## 12. Interview Tips

- Explain one complete flow, such as login or adding a health record.
- Clearly distinguish frontend validation from backend validation.
- Explain why parameterized SQL is important.
- Mention the dashboard as a data-summary feature.
- Be honest that the current authentication needs production-level security improvements.
- Focus on the problem solved, the technology choices, and your future improvement plan.
