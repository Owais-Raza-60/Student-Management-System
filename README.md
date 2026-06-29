# Student Management System

A full-stack web application for managing students, teachers, courses, and learning resources. The system provides separate dashboards for students and teachers with role-based authentication and course management features.

## Live Demo

**Application:** https://student-management-system-tgto.onrender.com/

---

## Features

### Authentication

* User registration and login
* Role-based authentication (Student and Teacher)
* Teacher registration protected with an access code
* Password encryption

### Student Module

* Student dashboard
* View available courses
* Access course resources
* Open learning resources in a new browser tab

### Teacher Module

* Teacher dashboard
* Create, update, and delete courses
* Upload course cover images
* Add multiple resources to a course
* Manage YouTube, documentation, website, and Google Drive links

---

## Technology Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

---

## Project Structure

```text
Student-Management-System/
│
├── config/
├── controllers/
├── models/
├── public/
│   ├── css/
│   ├── images/
│   └── js/
├── routes/
├── views/
├── .env
├── server.js
├── package.json
└── README.md
```

---

## Installation

### Clone the repository

```bash
git clone <repository-url>
```

### Navigate to the project directory

```bash
cd Student-Management-System
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root.

```env
MONGO_URI=your_mongodb_connection_string
```

### Run the application

```bash
node server.js
```

The application will be available at:

```text
http://localhost:3000
```

---

## Future Enhancements

* Assignment management
* Attendance management
* Online examination module
* Result management
* Email-based password recovery
* Admin dashboard
* File upload support

---

## Author

**Owais Raza**

B.Tech Computer Science and Engineering

---

## License

This project is intended for educational and learning purposes.
