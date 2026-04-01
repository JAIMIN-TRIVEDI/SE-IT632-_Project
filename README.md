# Hostezy

Hostezy is a role-based MERN stack web application for managing hostel and mess operations in colleges and institutions. It provides secure authentication, room workflows, complaint handling, mess subscriptions, Razorpay payments, notifications, and analytics-focused dashboards for operational teams.

## Overview

Hostezy is designed for real-world institutional operations where multiple stakeholders need different levels of access and responsibility. The platform separates concerns by role and centralizes daily hostel and mess administration tasks.

Core goals:
- Streamline room and hostel management lifecycle
- Digitize complaint and request tracking
- Simplify mess plan subscriptions and payment flow
- Improve transparency with dashboards and notifications
- Maintain secure, scalable backend APIs

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based protected routes (student, warden, hostel admin, mess admin)
- Password reset flow support

### Hostel & Room Operations
- Hostel and room management APIs
- Room allocation and room request workflows
- Vacate request support

### Complaint Management
- Complaint registration and tracking
- Status updates and role-based handling

### Mess Operations
- Mess menu management
- Mess plan subscription flow
- Student mess plan application

### Payments
- Razorpay order creation and verification
- Payment history and transaction records

### Communication & Visibility
- Notification handling
- Dashboard pages for each role
- Analytics/reporting endpoints and charts

## Tech Stack

### Frontend
- React 19 + Vite
- React Router
- Material UI (MUI)
- Axios
- Recharts

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Razorpay integration
- Nodemailer (email utilities)
- Swagger tooling (configured in backend)

## Project Structure

```text
Hostezy/
|- backend/
|  |- server.js
|  |- seed.js
|  |- src/
|     |- app.js
|     |- config/
|     |- controllers/
|     |- middlewares/
|     |- models/
|     |- routes/
|     |- utils/
|- frontend/
|  |- src/
|     |- api/
|     |- components/
|     |- layouts/
|     |- pages/
|     |- services/
|     |- styles/
```

## Getting Started

## 1. Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB (local or cloud instance)
- Razorpay account (for payment testing)

## 2. Install Dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## 3. Environment Variables

Create a `.env` file inside `backend/` with values similar to:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
```

## 4. Run the Application

Start backend (Terminal 1):

```bash
cd backend
npm run dev
```

Start frontend (Terminal 2):

```bash
cd frontend
npm run dev
```

Default local URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 5. Seed Sample Data (Optional)

```bash
cd backend
npm run seed
```

## Role-Based Access

Hostezy uses guarded frontend routes and backend role checks for the following roles:
- `student`
- `warden`
- `hostel_admin`
- `mess_admin`

Each role receives dedicated dashboards and feature scopes.

## API Base Path

Backend API base prefix:

```text
/api/v1
```

Frontend Axios instance (default) points to:

```text
http://localhost:5000/api/v1
```

## Security Notes

- JWT token-based access control
- Role-aware route guarding
- CORS configured for frontend origin
- Sensitive keys managed via environment variables

## Scalability Direction

Hostezy is structured with clear module boundaries (`controllers`, `models`, `routes`, `middlewares`) to support:
- Feature expansion by domain modules
- Better maintainability in larger teams
- Easier migration toward production-grade deployment and monitoring

## Future Enhancements

- Stronger audit/event logging
- Advanced occupancy and mess analytics
- Fine-grained permissions per institution
- Queue/background jobs for notifications
- CI/CD and containerized deployment

## License

This project is currently intended for academic/institutional development usage. Add a formal license before public distribution.