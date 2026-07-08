# FullStack-EMS — Employee Management System

A full-stack Employee Management System (EMS) with separate **Admin** and **Employee** portals. Built with a React + Vite frontend and a Node.js/Express + MongoDB backend, with background jobs handled via Inngest and transactional emails via Brevo SMTP.

## Features

- **Authentication** — JWT-based login for Admin and Employee roles, session check, and change-password flow
- **Employee Management** (Admin) — create, update, soft-delete, and list employees across departments
- **Attendance** — clock in/out, attendance history, and stats; automatic "late/half-day" marking and reminder emails via background jobs
- **Leave Management** — apply for leave (sick, casual, annual, maternity, paternity, bereavement, unpaid, earned, emergency), approve/reject (Admin), pending-leave reminder emails
- **Payslips** — generate and view payslips, printable payslip view
- **Dashboard** — summary view for both roles
- **Profile** — view/update personal profile

## Tech Stack

### Frontend (`/client`)
- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- Axios (API calls)
- React Hot Toast (notifications)
- Lucide React (icons)
- date-fns (date utilities)

### Backend (`/server`)
- Node.js + Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`) for auth
- bcrypt for password hashing
- Multer (form-data parsing)
- Inngest (background jobs / cron / event-driven functions)
- Nodemailer (via Brevo SMTP relay) for emails
- Nodemon (dev server auto-reload)

## Project Structure

```
FullStack-EMS/
├── client/                        # React frontend
│   ├── src/
│   │   ├── api/                   # Axios instance/config
│   │   ├── assets/                # Static assets, global CSS
│   │   ├── components/            # Reusable UI components
│   │   │   ├── attendance/
│   │   │   ├── leave/
│   │   │   └── payslip/
│   │   ├── pages/                 # Route-level pages
│   │   ├── App.jsx                # Route definitions
│   │   └── main.jsx                # App entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json                # SPA rewrite config for Vercel
│   └── package.json
│
└── server/                        # Express backend
    ├── config/
    │   ├── db.js                  # MongoDB connection
    │   └── nodemailer.js          # SMTP transporter
    ├── constants/
    │   └── departments.js         # Department enum list
    ├── controllers/                # Route handler logic
    ├── inngest/
    │   └── index.js               # Background jobs (auto-checkout, reminders, cron)
    ├── middleware/
    │   └── auth.js                # `protect` / `protectAdmin` JWT middleware
    ├── models/                    # Mongoose schemas (User, Employee, Attendance, LeaveApplication, Payslip)
    ├── routes/                    # Express routers
    ├── seed.js                    # Creates the initial admin user
    ├── server.js                  # App entry point
    ├── vercel.json                # Vercel deployment config
    └── package.json
```

## Prerequisites

- Node.js 18+ and npm
- A MongoDB database (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- An SMTP account for sending emails (this project is configured for [Brevo](https://www.brevo.com/) SMTP relay, but any SMTP provider works with minor changes to `server/config/nodemailer.js`)
- An [Inngest](https://www.inngest.com/) account (free tier is fine) for background jobs — only required in production; Inngest also provides a local dev server

## Setup

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd FullStack-EMS

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment variables

#### `server/.env`

Create a `.env` file inside `server/` with the following keys:

```env
PORT=4000
JWT_SECRET=your-jwt-secret

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/fullstack-ems

ADMIN_EMAIL=admin@example.com

INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SENDER_EMAIL=your-sender-email@example.com
```

> ⚠️ **Security note:** This project's uploaded `server/.env` contains what appear to be **live** database credentials, JWT secret, Inngest keys, and SMTP credentials. Treat these as compromised — **rotate/regenerate all of them** (MongoDB Atlas password, JWT secret, Inngest keys, SMTP password) and make sure `.env` is listed in `.gitignore` and is never committed to a public repository going forward.

#### `client/.env`

```env
VITE_BASE_URL="http://localhost:4000"
```

Point this at your backend's URL (use the deployed backend URL in production).

### 3. Seed the admin user

This creates the first Admin account using `ADMIN_EMAIL` from your `.env` and a temporary password (`admin123` by default — change it in `server/seed.js` before running, or change the password after first login):

```bash
cd server
npm run seed
```

You should see the created admin email and temporary password printed in the console. **Log in and change this password immediately** via the "Change Password" flow.

### 4. Run the backend

```bash
cd server
npm run server     # dev mode with nodemon (auto-reload)
# or
npm start           # production mode
```

The API will be available at `http://localhost:4000` (or your configured `PORT`).

### 5. Run the frontend

```bash
cd client
npm run dev
```

The app will be available at `http://localhost:5173` (Vite's default port).

### 6. (Optional) Run Inngest locally

For local development of background jobs (auto-checkout, leave reminders, attendance cron), run the Inngest Dev Server alongside the backend:

```bash
npx inngest-cli@latest dev
```

Then open the Inngest Dev Server UI (usually `http://localhost:8288`) to inspect and trigger functions. The app registers its functions at the `/api/inngest` endpoint on the backend.

## Available Scripts

### Backend (`server/package.json`)

| Script | Description |
|---|---|
| `npm run server` | Start backend in dev mode with nodemon |
| `npm start` | Start backend in production mode |
| `npm run seed` | Create the initial Admin user |

### Frontend (`client/package.json`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## API Overview

All routes are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header; admin-only routes additionally require the `ADMIN` role.

| Route | Method(s) | Access |
|---|---|---|
| `/api/auth/login` | GET | Public |
| `/api/auth/session` | GET | Authenticated |
| `/api/auth/change-password` | POST | Authenticated |
| `/api/employees` | GET, POST | Admin |
| `/api/employees/:id` | PUT, DELETE | Admin |
| `/api/profile` | GET, PUT | Authenticated |
| `/api/attendance` | GET, POST | Authenticated |
| `/api/leave` | GET, POST | Authenticated |
| `/api/leave/:id` | PATCH | Admin |
| `/api/payslips` | GET, POST | Authenticated (POST is Admin) |
| `/api/payslips/:id` | GET | Authenticated |
| `/api/dashboard` | GET | Authenticated |
| `/api/inngest` | GET/PUT/POST | Inngest webhook endpoint |

## Background Jobs (Inngest)

Defined in `server/inngest/index.js`:

- **`auto-check-out`** — triggered on `employee/check-out`; after 9 hours without a checkout, sends a reminder email, then auto-marks the day as a "Half Day"/"LATE" checkout after a further 1 hour if still not checked out.
- **`leave-application-reminder`** — triggered on `leave/pending`; if a leave application is still pending after 24 hours, emails the admin a reminder.
- **`attendance-reminder-cron`** — runs daily at 11:30 AM IST; emails any active employee who hasn't checked in and isn't on approved leave.

## Deployment

Both `client/` and `server/` include `vercel.json` files for deployment on [Vercel](https://vercel.com/):

- **Frontend**: deploy `client/` as a Vercel static/SPA project (rewrites all routes to `index.html`).
- **Backend**: deploy `server/` as a Vercel Node.js project (routes all requests through `server.js`).

Remember to set all environment variables (from both `.env` files above) in your Vercel project settings rather than committing them, and update `client`'s `VITE_BASE_URL` to point at the deployed backend URL.

## Roles

| Role | Capabilities |
|---|---|
| **ADMIN** | Manage employees, approve/reject leave, generate payslips, view all dashboards |
| **EMPLOYEE** | Clock in/out, apply for leave, view own attendance/payslips/profile |

## Notes

- Passwords are hashed with bcrypt before being stored.
- JWT tokens are verified via the `protect` middleware; `protectAdmin` additionally checks `role === "ADMIN"`.
- The `Employee` model is soft-deletable (`isDeleted` flag) rather than hard-deleted.
