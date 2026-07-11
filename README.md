# FullStack-EMS

A full-stack Employee Management System (EMS) with separate **Admin** and **Employee** portals — attendance tracking, leave applications, payslip generation, and employee profile management.

- **Client:** React 19 + Vite + Tailwind CSS 4 + React Router 7
- **Server:** Node.js + Express 5 + MongoDB (Mongoose) + JWT auth
- **Extras:** Inngest (background jobs), Nodemailer (email), Multer (form-data parsing)

---

## Overview

QuickEMS is a role-based HR platform for small-to-medium teams. There are two portals reachable from a single landing page (`/login`):

- **Admin Portal** (`/login/admin`) — manage employees, review/approve leave, run attendance, and generate payslips for the whole organization.
- **Employee Portal** (`/login/employee`) — check in/out, view personal attendance history, apply for leave, and download/print personal payslips.

Every account lives in a single `User` collection distinguished by `role` (`ADMIN` / `EMPLOYEE`), and every `Employee` document is linked one-to-one back to its `User` via `userId`. Access control is enforced both in the API (JWT + role middleware) and in the client (route guarding via `AuthContext`).

## Core Features

- **Authentication** — email/password login scoped to a portal (`role_type: "admin" | "employee"`), 7-day JWT sessions, session restore on refresh, and self-service password change.
- **Employee management (admin)** — create/update/soft-delete employee records, assign department, position, salary components (basic salary, allowances, deductions), and status (`ACTIVE`/`INACTIVE`).
- **Attendance** — daily check-in/check-out, automatic working-hours calculation, day-type classification (Full/Three-Quarter/Half/Quarter/Short Day), and per-employee attendance history with one attendance record per employee per day (enforced via a unique compound index).
- **Leave management** — apply for leave across multiple types (Sick, Casual, Annual, Maternity, Paternity, Bereavement, Unpaid, Earned, Emergency), with `PENDING → APPROVED/REJECTED` workflow.
- **Payslips** — generate monthly payslips from an employee's salary components (`basicSalary + allowances − deductions = netSalary`), list payslip history, and print/export a payslip via a dedicated print view (`/print/payslips/:id`).
- **Dashboard** — summary stats view (headcount, attendance, leave, payroll at a glance) for admins.
- **Profile & settings** — employees can view/update their own profile and change their password from Settings.
- **Background jobs** — Inngest is wired up (via `/api/inngest`) for asynchronous/scheduled work (e.g. notifications), separate from the main request/response cycle.

## Authentication & Authorization Flow

1. `POST /api/auth/login` validates credentials against the `User` collection and checks that the submitted `role_type` matches the account's `role`.
2. On success, the API returns a JWT (`jsonwebtoken`, 7-day expiry, payload = `{ userId, role, email }`) which the client stores in `localStorage`.
3. `client/src/context/AuthContext.jsx` restores the session on app load by calling `GET /api/auth/session` with the stored token, and exposes `{ user, loading, login, logout }` to the rest of the app.
4. Protected client routes are wrapped in `Layout.jsx`, which reads `useAuth()` and renders a loading state, redirects to `/login` if unauthenticated, or renders the sidebar + page content if authenticated.
5. On the server, `middleware/auth.js` exports:
   - `protect` — verifies the `Authorization: Bearer <token>` header and attaches the decoded session to `req.session`.
   - `protectAdmin` — used alongside `protect` on admin-only routes to require `role === "ADMIN"`.

## Data Models (MongoDB / Mongoose)

| Model | Key fields |
|---|---|
| `User` | `email`, `password` (hashed), `role` (`ADMIN` \| `EMPLOYEE`) |
| `Employee` | `userId` (ref `User`), `firstName`, `lastName`, `email`, `phone`, `position`, `department`, `basicSalary`, `allowances`, `deductions`, `employeeStatus`, `joinDate`, `isDeleted`, `bio` |
| `Attendance` | `employeeId` (ref `Employee`), `date`, `checkIn`, `checkOut`, `status` (`PRESENT`\|`ABSENT`\|`LATE`), `workingHours`, `dayType` — unique per `(employeeId, date)` |
| `LeaveApplication` | `employeeId` (ref `Employee`), `type`, `startDate`, `endDate`, `reason`, `status` (`PENDING`\|`APPROVED`\|`REJECTED`) |
| `Payslip` | `employeeId` (ref `Employee`), `month`, `year`, `basicSalary`, `allowances`, `deductions`, `netSalary` |

---

## Tools & Packages Used

**Frontend (`client/package.json`)**
| Package | Purpose |
|---|---|
| `react`, `react-dom` | UI library (v19) |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP requests to the API |
| `tailwindcss`, `@tailwindcss/vite` | Utility-first CSS styling |
| `react-hot-toast` | Toast notifications |
| `lucide-react` | Icon set |
| `date-fns` | Date formatting/manipulation |
| `vite`, `@vitejs/plugin-react` | Dev server & build tool |
| `eslint` + plugins | Linting |

**Backend (`server/package.json`)**
| Package | Purpose |
|---|---|
| `express` | Web server / REST API framework (v5) |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT auth token generation/verification |
| `bcrypt` | Password hashing |
| `cors` | Cross-origin request handling |
| `dotenv` | Loads `.env` environment variables |
| `multer` | Parses `multipart/form-data` requests |
| `nodemailer` | Sends emails (password reset, payslip notices, etc.) |
| `inngest` | Background/scheduled job processing |
| `nodemon` (dev) | Auto-restarts server on file changes |

---

## Project Structure

```
FullStack-EMS/
├── client/               # React front-end (Vite)
│   └── src/
│       ├── api/          # Axios instance
│       ├── components/   # Reusable UI components
│       ├── context/      # AuthContext (session/JWT state)
│       └── pages/        # Route-level pages
└── server/               # Express back-end
    ├── config/           # DB + Nodemailer config
    ├── controllers/      # Route handlers
    ├── middleware/       # Auth middleware
    ├── models/           # Mongoose schemas
    ├── routes/           # Express routers
    └── inngest/          # Background job functions
```

---

## Prerequisites

- Node.js 18+ and npm
- A MongoDB connection string (e.g. MongoDB Atlas)

---

## Setup

### 1. Clone & install

```bash
git clone <your-fork-url>
cd FullStack-EMS

# install server deps
cd server
npm install

# install client deps
cd ../client
npm install
```

### 2. Configure environment variables

**`server/.env`**

```env
JWT_SECRET="your-jwt-secret"
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/fullstack-ems"
ADMIN_EMAIL="admin@example.com"
PORT=4000

# Optional — only needed if you use these features
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
SMTP_USER=""
SMTP_PASS=""
SENDER_EMAIL=""
```

**`client/.env`**

```env
VITE_BASE_URL=http://localhost:4000
```

> ⚠️ **Security note:** The `.env` files in this repo currently contain **real, committed credentials** (MongoDB password, SMTP password, Inngest keys). Rotate/revoke those credentials and add `.env` to `.gitignore` (it's already ignored for `client/`, but `server/.env` is tracked) before pushing this repo anywhere public.

### 3. Seed the database (optional)

```bash
cd server
npm run seed
```

### 4. Run the app

In two terminals:

```bash
# Terminal 1 — API server (http://localhost:4000)
cd server
npm run server     # nodemon, auto-restart
# or: npm start    # plain node

# Terminal 2 — client (http://localhost:5173)
cd client
npm run dev
```

Visit `http://localhost:5173` and choose the Admin or Employee portal to sign in.

---

## Available Scripts

**Server** (`server/package.json`)
| Script | Description |
|---|---|
| `npm run server` | Start the API with nodemon (auto-reload) |
| `npm start` | Start the API with plain `node` |
| `npm run seed` | Seed the database with initial data |

**Client** (`client/package.json`)
| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## API Overview

All routes are mounted under `http://localhost:4000/api`:

| Base path | Purpose |
|---|---|
| `/auth` | Login, session check |
| `/employees` | Employee CRUD (admin) |
| `/profile` | Logged-in user's profile |
| `/attendance` | Check-in/out, attendance history |
| `/leave` | Leave applications |
| `/payslips` | Payslip generation & listing |
| `/dashboard` | Dashboard summary stats |
| `/inngest` | Inngest webhook endpoint (background jobs) |

---

## Troubleshooting

- **CORS / network errors in the browser console:** confirm `VITE_BASE_URL` in `client/.env` matches where the server is actually running, and that the server is up.
- **401s on every request:** the JWT may be missing/expired — log out and back in, or clear `localStorage`.
- **MongoDB connection errors:** double-check `MONGODB_URI` in `server/.env` and that your IP is allow-listed in MongoDB Atlas.
