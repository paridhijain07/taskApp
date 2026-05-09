# TaskApp

A full-stack task management application built using Node.js, Express, MongoDB, JWT Authentication, and React.

## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Auth
* Swagger UI

### Frontend

* React.js
* Vite
* Axios

### Deployment

* Render
* MongoDB Atlas

---

# Features

* User Authentication (JWT)
* Role-Based Access Control (Admin/User)
* Task CRUD Operations
* Protected Routes
* Swagger API Docs
* Refresh Tokens
* Helmet + CORS + Rate Limiting

---

# Project Structure

```bash
backend/
frontend/
```

---

# Environment Variables

## Backend `.env`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:5173
```

## Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

# Local Setup

## Clone Repo

```bash
git clone https://github.com/paridhijain07/taskApp.git
cd taskApp
```

## Backend

```bash
cd backend
npm install
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# Swagger Docs

Local:

```bash
http://localhost:5000/api/docs
```

Production:

```bash
https://taskapp-j73b.onrender.com/api/docs
```

---

# Main API Routes

## Auth

* POST `/api/v1/auth/register`
* POST `/api/v1/auth/login`
* POST `/api/v1/auth/refresh`
* POST `/api/v1/auth/logout`

## Users

* GET `/api/v1/users/me`
* GET `/api/v1/users`

## Tasks

* POST `/api/v1/tasks`
* GET `/api/v1/tasks`
* PUT `/api/v1/tasks/:id`
* DELETE `/api/v1/tasks/:id`

---

# Deployment

## Backend

```bash
https://taskapp-j73b.onrender.com
```

## Database

MongoDB Atlas

---

# Security Features

* JWT Authentication
* bcrypt Password Hashing
* Helmet.js
* Rate Limiting
* Protected Routes
* Input Validation

---

# Author

Paridhi Jain

GitHub:

```bash
https://github.com/paridhijain07
```
