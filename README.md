# 🏥 MedCare - Hospital Management System

A full-stack **MERN** (MongoDB, Express.js, React.js, Node.js) Hospital Management System with a modern, responsive UI.

## Features

- **Authentication** - Login/Register with JWT tokens
- **Email OTP Auth** - Login with email + OTP
- **Forgot Password** - Reset password via OTP
- **Account Security** - Change email (OTP verify) and change password
- **Welcome Email** - Sent on first successful authentication
- **Dashboard** - Real-time stats, recent appointments, department overview
- **Patient Management** - Full CRUD with search & filters
- **Doctor Management** - Card-based view with specialization & department
- **Appointment Scheduling** - Book, complete, cancel appointments
- **Department Management** - Create & manage hospital departments
- **Responsive UI** - Works on desktop & mobile with Tailwind CSS
- **Seed Data** - Pre-populated with sample data for demo

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | React 18, Vite, Tailwind CSS       |
| Backend    | Node.js, Express.js                |
| Database   | MongoDB with Mongoose              |
| Auth       | JWT (JSON Web Tokens), bcryptjs    |
| UI         | React Icons, React Hot Toast       |
| Routing    | React Router v6                    |

## Prerequisites

- **Node.js** v16+ installed
- **MongoDB** running locally on port 27017 (or update `.env`)
  - Download: https://www.mongodb.com/try/download/community

## Quick Start

### 1. Install Dependencies

```bash
cd hospital-management-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 1.1 Configure Backend Environment

Create `backend/.env` and set:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hospital_management
JWT_SECRET=your_jwt_secret_here

# Optional SMTP for real emails. Without these, app logs email preview to backend console.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_smtp_password
SMTP_FROM=MedCare <no-reply@medcare.com>
```

### 2. Seed the Database (Recommended)

This populates the database with sample departments, doctors, patients, and appointments:

```bash
cd backend
npm run seed
```

### 3. Start the Application

Open **two terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

### 4. Open in Browser

Visit **http://localhost:5173** and login with:

| Role         | Email                    | Password      |
| ------------ | ------------------------ | ------------- |
| Admin        | admin@hospital.com       | admin123      |
| Receptionist | reception@hospital.com   | reception123  |

## Project Structure

```
hospital-management-system/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── models/
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   └── Department.js
│   ├── routes/
│   │   ├── auth.js            # Login/Register
│   │   ├── patients.js        # Patient CRUD
│   │   ├── doctors.js         # Doctor CRUD
│   │   ├── appointments.js    # Appointment CRUD
│   │   ├── departments.js     # Department CRUD
│   │   └── dashboard.js       # Stats & analytics
│   ├── server.js              # Express server
│   ├── seed.js                # Database seeder
│   └── .env                   # Environment config
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js       # API client
│   │   ├── components/
│   │   │   ├── Auth/          # Login & Register
│   │   │   ├── Dashboard/     # Dashboard with stats
│   │   │   ├── Patients/      # Patient list & form
│   │   │   ├── Doctors/       # Doctor list & form
│   │   │   ├── Appointments/  # Appointment list & form
│   │   │   ├── Departments/   # Department list & form
│   │   │   └── Layout/        # Sidebar, Navbar, Layout
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state management
│   │   ├── App.jsx            # Routes
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Tailwind + custom styles
│   ├── index.html
│   └── vite.config.js
└── README.md
```

## API Endpoints

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| POST   | /api/auth/register     | Register new user      |
| POST   | /api/auth/login        | Login                  |
| POST   | /api/auth/login-otp/request | Request login OTP |
| POST   | /api/auth/login-otp/verify  | Verify login OTP  |
| POST   | /api/auth/forgot-password/request | Request reset OTP |
| POST   | /api/auth/forgot-password/verify  | Verify reset OTP + set new password |
| POST   | /api/auth/change-password | Change current password |
| POST   | /api/auth/change-email/request | Request email-change OTP |
| POST   | /api/auth/change-email/verify  | Verify email-change OTP |
| GET    | /api/auth/profile      | Get user profile       |
| GET    | /api/dashboard/stats   | Dashboard statistics   |
| GET    | /api/patients          | List all patients      |
| POST   | /api/patients          | Create patient         |
| PUT    | /api/patients/:id      | Update patient         |
| DELETE | /api/patients/:id      | Delete patient         |
| GET    | /api/doctors           | List all doctors       |
| POST   | /api/doctors           | Create doctor          |
| PUT    | /api/doctors/:id       | Update doctor          |
| DELETE | /api/doctors/:id       | Delete doctor          |
| GET    | /api/appointments      | List all appointments  |
| POST   | /api/appointments      | Create appointment     |
| PUT    | /api/appointments/:id  | Update appointment     |
| DELETE | /api/appointments/:id  | Delete appointment     |
| GET    | /api/departments       | List all departments   |
| POST   | /api/departments       | Create department      |
| PUT    | /api/departments/:id   | Update department      |
| DELETE | /api/departments/:id   | Delete department      |

## License

MIT
