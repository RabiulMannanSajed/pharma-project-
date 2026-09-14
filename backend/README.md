# Pharmacy Sales Management - Backend

Node.js + Express + MongoDB + Mongoose backend for the Pharmacy Sales Management System.

## Quick start

```bash
cd backend
cp .env.example .env       # edit MONGODB_URI + JWT_SECRET + admin creds
npm install
npm run seed               # creates the default admin from .env
npm run dev                # http://localhost:5000
```

## Project layout

```
backend/
├── src/
│   ├── Config/        # env + DB connection
│   ├── Utils/         # ApiError, ApiResponse, asyncHandler, JWT, date helpers
│   ├── Middleware/    # auth (JWT), role (RBAC), validate (Joi), errorHandler
│   ├── Modules/
│   │   ├── Auth/      # login, change-password, /me
│   │   ├── Users/     # admin manages salesman accounts
│   │   ├── Sales/     # CRUD + daily/weekly/monthly/custom reports
│   │   ├── Attendance/# mark + reports
│   │   └── Dashboard/ # admin & salesman dashboards
│   ├── app.js
│   ├── server.js
│   └── seed.js
├── .env.example
└── package.json
```

## API base

`http://localhost:5000/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | – | Login, returns `{ user, token }` |
| GET  | `/auth/me` | any | Current user |
| POST | `/auth/change-password` | any | Change own password |
| POST | `/users/create-salesman` | admin | Create salesman |
| GET  | `/users` | admin | List users (filter/paginate) |
| GET  | `/users/:id` | admin | Get one user |
| PATCH| `/users/:id` | admin | Update user |
| PATCH| `/users/:id/activate` | admin | Activate user |
| PATCH| `/users/:id/deactivate` | admin | Deactivate user |
| DELETE| `/users/:id` | admin | Delete user |
| POST | `/sales` | any | Create sale (auto-attached to salesman) |
| GET  | `/sales` | any | List sales (admin: all, salesman: own) |
| GET  | `/sales/my-sales` | salesman | My sales |
| GET  | `/sales/daily` | any | Daily report |
| GET  | `/sales/weekly` | any | Weekly report |
| GET  | `/sales/monthly` | any | Monthly report |
| GET  | `/sales/reports/custom?range=daily\|weekly\|monthly\|custom&startDate&endDate&salesmanId` | any | Custom report |
| GET  | `/sales/reports/daily-series?from&to` | any | Day-by-day series for charts |
| PATCH| `/sales/:id` | own/admin | Update sale |
| DELETE| `/sales/:id` | own/admin | Delete sale |
| POST | `/attendance` | salesman | Mark attendance |
| GET  | `/attendance` | admin | List attendance |
| GET  | `/attendance/my-attendance` | salesman | My attendance |
| GET  | `/attendance/daily` | admin | Daily summary |
| GET  | `/attendance/monthly` | admin | Monthly summary |
| GET  | `/attendance/my-monthly-stats` | salesman | My monthly stats |
| PATCH| `/attendance/:id` | own/admin | Update |
| DELETE| `/attendance/:id` | own/admin | Delete |
| GET  | `/dashboard/admin` | admin | Admin overview |
| GET  | `/dashboard/salesman` | salesman | Salesman overview |

## Security

- Passwords hashed with **bcryptjs**
- **JWT** authentication (configurable expiry)
- **Role-based** authorization (`admin`, `salesman`)
- **Joi** input validation on every route
- Salesmen can only ever read/update/delete their **own** sales & attendance
- Centralized error handler maps Mongoose/JWT/Joi errors to clean JSON

## Default admin (from .env)

- email: `ADMIN_EMAIL` (default `admin@pharmacy.com`)
- password: `ADMIN_PASSWORD` (default `Admin@12345`)

Change these in `.env` **before** running `npm run seed`.