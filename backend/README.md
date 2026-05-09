# TaskApp — Scalable REST API with JWT Auth, RBAC, MongoDB + React Frontend

Scalable, production-grade full-stack app with secure JWT access tokens, refresh-token rotation, role-based access control (RBAC), MongoDB (Mongoose ODM), Swagger docs, and a React (Vite + React Router v6) frontend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20 + Express.js |
| Database | MongoDB (Atlas/local) + Mongoose ODM |
| Auth | JWT (accessToken 15m + refreshToken 7d) |
| Frontend HTTP | Axios with interceptors |
| Docs | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Security | bcrypt, helmet, cors, express-rate-limit, express-validator |
| Optional | Redis (caching), Docker + docker-compose, Winston logger |

---

## Features

- JWT authentication (access token + refresh token)
- Refresh token rotation + token hashing (SHA-256)
- RBAC authorization (`user` and `admin`)
- User CRUD (soft delete) and profile management
- Task CRUD with filtering, full-text search on title, and pagination
- Admin-only task statistics using MongoDB aggregation pipeline
- Swagger UI documentation at `/api/docs`
- Seed script to load sample users + tasks
- Docker support (MongoDB + Redis + API backend)

---

## Prerequisites

- Node.js 20+
- MongoDB:
  - Local MongoDB, or MongoDB Atlas connection string
- Optional:
  - Redis (or disable via `REDIS_URL` in backend `.env`)
  - Docker + Docker Compose

---

## Local Setup

### 1. Backend

1. Open a terminal:
   `cd e:\\ASSIGN\\backend`
2. Install dependencies:
   `npm install`
3. Create env file:
   - Copy `backend/.env.example` to `backend/.env`
4. (Optional) Seed the database:
   `npm run seed`
5. Start the API server:
   `npm run dev`

### 2. Frontend

1. Open another terminal:
   `cd e:\\ASSIGN\\frontend`
2. Install dependencies:
   `npm install`
3. Create env file:
   - Copy `frontend/.env.example` to `frontend/.env`
4. Start the frontend:
   `npm run dev`

---

## Environment Setup

### Backend

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | API server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/taskapp` |
| `JWT_SECRET` | Secret for signing access tokens (min 32 chars) | `your_super_secret_min_32_chars_here_please_change` |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (min 32 chars) | `another_super_secret_min_32_chars_here_please_change` |
| `JWT_ACCESS_EXPIRES` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES` | Refresh token lifetime | `7d` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |
| `REDIS_URL` | Redis connection string (optional) | `redis://localhost:6379` |

### Frontend

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend base URL for Axios | `http://localhost:5000/api/v1` |

---

## Running with Docker

From the project root (`e:\\ASSIGN`):

1. Start all services:
   `docker-compose up --build`
2. API docs:
   - `http://localhost:5000/api/docs`

---

## API Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/api/v1/auth/register` | No | Public | Register user and issue tokens |
| POST | `/api/v1/auth/login` | No | Public | Login user and issue tokens |
| POST | `/api/v1/auth/refresh` | No | Public | Refresh access token using refresh token |
| POST | `/api/v1/auth/logout` | Yes | user/admin | Logout (delete refresh token) |
| GET | `/api/v1/users/me` | Yes | user/admin | Get current profile |
| PUT | `/api/v1/users/me` | Yes | user/admin | Update name/email |
| PUT | `/api/v1/users/me/password` | Yes | user/admin | Change password |
| GET | `/api/v1/users` | Yes | admin | Paginated list of all users |
| GET | `/api/v1/users/:id` | Yes | admin | Get a specific user (profile) |
| PUT | `/api/v1/users/:id` | Yes | admin | Update a user's role and/or isActive |
| DELETE | `/api/v1/users/:id` | Yes | admin | Soft delete (isActive=false) |
| POST | `/api/v1/tasks` | Yes | user/admin | Create task owned by the authenticated user |
| GET | `/api/v1/tasks` | Yes | user/admin | List tasks (user sees own tasks; admin sees all) |
| GET | `/api/v1/tasks/:id` | Yes | user/admin | Get a task by id |
| PUT | `/api/v1/tasks/:id` | Yes | user/admin | Update a task (ownership rules apply) |
| DELETE | `/api/v1/tasks/:id` | Yes | user/admin | Hard delete a task (ownership rules apply) |
| GET | `/api/v1/tasks/admin/stats` | Yes | admin | Aggregated task + user statistics |
| GET | `/api/v1/tasks/admin/by-owner/:ownerId` | Yes | admin | Paginated task list for a specific owner |

---

## API Docs URL

`http://localhost:5000/api/docs`

---

## Project Structure Explanation

### Backend

- `backend/src/config/`: environment validation, Mongo connection, Swagger configuration
- `backend/src/models/`: Mongoose schemas for `User`, `Task`, and `RefreshToken`
- `backend/src/utils/`: token helpers, response helpers, error helpers, async wrapper, Winston logger
- `backend/src/middlewares/`: JWT auth middleware, RBAC role middleware, express-validator error formatting, global error handler
- `backend/src/services/`: business logic (auth/user/task)
- `backend/src/controllers/`: request/response orchestration
- `backend/src/routes/v1/`: versioned routes mounted at `/api/v1`

### Frontend

- `frontend/src/context/`: authentication state + session restore via refresh token
- `frontend/src/api/`: Axios instance with refresh-token retry logic
- `frontend/src/pages/`: Register/Login/Dashboard
- `frontend/src/components/`: navbar, task cards/forms, private route spinner + toast

---

## Scalability Note

- **Stateless JWT**: access tokens contain the user identity/role, enabling horizontal scaling behind a load balancer with no server-side session state.
- **Mongoose connection pooling**: Mongoose maintains a connection pool (default size is typically 5); increase pool size for higher concurrency and load.
- **Redis caching for GET `/tasks`**: cache-aside strategy with TTL of 60 seconds; cache keys are derived from role, owner, pagination, and filters. Cache is invalidated on task writes (create/update/delete) to keep results consistent.
- **Microservices split**: the backend can be split into `auth-service`, `task-service`, and an `api-gateway` that handles routing, shared middleware (rate limiting, security headers), and JWT validation.
- **MongoDB indexing strategy**: indexes are defined on `User.email` (unique), `Task.owner`, `Task.status`, and the compound `{ owner, status }` for filtered queries; a text index on `Task.title` supports search.
- **Rate limiting per user vs per IP**: current configuration limits auth endpoints per IP. For production, you can key rate limiting by user id after authentication (per-user) and also apply IP-based limits (defense in depth).

