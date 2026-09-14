# Pharmacy Sales Management System

A full-stack **Pharmacy Sales & Employee Management System** with two roles (Admin and Salesman). Backend is Node/Express/MongoDB, frontend is a React + Vite + Tailwind **Progressive Web App** you can install on a phone.

---

## 🚀 Run it locally in 5 minutes

### 1. Prerequisites
- **Node.js ≥ 18** ([download](https://nodejs.org))
- **Git**
- A **MongoDB database** — either:
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, OR
  - a local MongoDB on `mongodb://127.0.0.1:27017`

### 2. Clone & install
```bash
git clone https://github.com/<your-username>/pharmacy-sell-management.git
cd pharmacy-sell-management

# backend deps
cd backend && npm install && cd ..

# frontend deps
cd frontend && npm install && cd ..
```

### 3. Configure environment

Two files to create (one per app), starting from the templates:

```bash
cp backend/.env.example  backend/.env
cp frontend/.env.example frontend/.env
```

Open **`backend/.env`** and fill in:
```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pharma?retryWrites=true&w=majority
JWT_SECRET=<paste a long random string>
```
Generate a JWT secret quickly:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**`frontend/.env`** — the default value `VITE_API_URL=/api` is correct for local dev. Leave it alone unless you deploy.

### 4. Seed the database (creates the default admin)
```bash
cd backend
npm run seed
cd ..
```
You should see:
```
Default admin created:
  Email:    admin@pharmacy.com
  Password: Admin@12345
```

### 5. Start both servers (in two terminals)
```bash
# Terminal 1 — backend on http://localhost:5000
cd backend && npm run dev

# Terminal 2 — frontend on http://localhost:5173
cd frontend && npm run dev
```

Open **http://localhost:5173** and log in:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@pharmacy.com` | `Admin@12345` |

Create salesmen from the admin panel (Salesmen → New Salesman). Change the admin password after first login.

> 💡 The frontend (Vite) automatically forwards `/api/*` calls to the backend on port 5000, so you only ever visit `http://localhost:5173` in your browser.

---

## ✨ What it does

### Admin
- 📊 Dashboard with KPIs, daily/weekly/monthly sales charts, attendance pie chart, monthly performance ranking
- 👥 Salesmen management (create, edit, activate/deactivate, delete)
- 💰 All sales — view, create, edit, delete
- 📈 Reports — daily / weekly / monthly / custom with date-range & per-salesman filters
- 🗓️ Attendance oversight — filter by date, salesman, status, month, year
- 🏆 Performance leaderboard with sales comparison charts

### Salesman
- 🏠 Personal dashboard — today's / weekly / monthly totals + personal stats (avg daily sales, best day, attendance %)
- ➕ Add sale, view & edit own sales history
- 📊 Personal sales reports
- 📅 Mark today's attendance (Present / Absent / Late) — only once per day
- 👤 Profile + change password

### Security
JWT auth, bcrypt password hashing, role-based access control (admin / salesman), Joi input validation on every endpoint.

### PWA
Installable on Android & iOS, offline-friendly (Workbox caches the app shell, NetworkFirst caches API responses).

---

## 🧱 Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 · Vite 5 · Tailwind CSS 3 · React Router 6 · TanStack Query 5 · Axios · Recharts · react-hot-toast · lucide-react |
| PWA | vite-plugin-pwa (Workbox) |
| Backend | Node.js · Express 4 · Mongoose 8 · JWT · bcryptjs · Joi · Helmet · Morgan · CORS |
| Database | MongoDB ≥ 5 (Atlas or local) |

---

## 📁 Project layout

```
pharmacy-sell-management/
├── backend/                     Express + Mongoose API
│   ├── src/
│   │   ├── Config/              env + DB connection
│   │   ├── Middleware/          auth, role, validate, errorHandler
│   │   ├── Modules/             Auth, Users, Sales, Attendance, Dashboard
│   │   ├── Utils/               ApiError, ApiResponse, asyncHandler, JWT, date helpers
│   │   ├── app.js               Express app
│   │   ├── server.js            entry point
│   │   └── seed.js              creates default admin
│   ├── .env.example             ← copy to .env, fill in your values
│   ├── package.json
│   └── README.md                backend-specific notes
├── frontend/                    React + Vite PWA
│   ├── public/                  manifest, icons, favicon
│   ├── src/
│   │   ├── api/                 axios client + resource modules
│   │   ├── context/             AuthContext, ThemeContext
│   │   ├── layouts/             Sidebar, Topbar, DashboardLayout
│   │   ├── components/          ProtectedRoute, UI primitives, charts
│   │   ├── pages/               Login + admin/* + salesman/*
│   │   ├── utils/               constants, formatters, validators
│   │   ├── hooks/               useAuth, useDebounce
│   │   ├── App.jsx              routes
│   │   ├── main.jsx             providers (QueryClient, Theme, Auth)
│   │   └── index.css            Tailwind + custom layer
│   ├── .env.example             ← copy to .env (default values work)
│   ├── index.html
│   ├── vite.config.js           PWA + /api proxy → backend
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── .gitignore                   excludes .env, node_modules, dist, etc.
└── README.md                    (you are here)
```

---

## 🌐 API at a glance

| Method | Endpoint | Roles |
|---|---|---|
| POST | `/api/auth/login` | – |
| GET | `/api/auth/me` | any |
| POST | `/api/auth/change-password` | any |
| POST | `/api/users/create-salesman` | admin |
| GET / PATCH / DELETE | `/api/users[/:id]` | admin |
| PATCH | `/api/users/:id/activate` `/deactivate` | admin |
| POST / GET | `/api/sales` | any |
| PATCH / DELETE | `/api/sales/:id` | own/admin |
| GET | `/api/sales/daily` `/weekly` `/monthly` | any |
| GET | `/api/sales/reports/custom` | any |
| POST / GET | `/api/attendance` | salesman (mark) / admin (list) |
| GET | `/api/attendance/my-attendance` | salesman |
| GET | `/api/dashboard/admin` `/salesman` | admin / salesman |

Full table with response shapes is in [`backend/README.md`](./backend/README.md).

---

## 📦 Build for production

```bash
# Frontend — produces a static, PWA-enabled bundle
cd frontend && npm run build
#  → outputs frontend/dist/  (service worker + manifest auto-generated)

# Backend — no build step
cd backend && NODE_ENV=production npm start
```

To point the built frontend at a remote backend:
```bash
cd frontend
VITE_API_URL=https://api.yourdomain.com/api npm run build
```

---

## 🛠 Troubleshooting

| Problem | Fix |
|---|---|
| `MongooseServerSelectionError: connect ECONNREFUSED` | Your `MONGODB_URI` is wrong, or your IP isn't whitelisted in Atlas (Atlas → Network Access → add your IP or `0.0.0.0/0` for dev). |
| `Port 5000 already in use` | Change `PORT=5000` in `backend/.env`. |
| `Port 5173 already in use` | Vite auto-picks the next free port; check the terminal output. |
| Login works but `/api/*` 404s from the frontend | Make sure the backend is running and reachable on `localhost:5000`. |
| CORS errors in the browser console | Backend already enables CORS for all origins in dev; check that you really hit the backend and not some other server. |
| `npm run seed` says "Admin already exists" | That's fine — the seed is idempotent. |
| Forgot admin password | Update it directly in MongoDB (Atlas → Browse Collections → users) OR set new values in `backend/.env` then drop the old admin user from Atlas. |

---

## 📄 License

ISC — see [`backend/package.json`](./backend/package.json).
