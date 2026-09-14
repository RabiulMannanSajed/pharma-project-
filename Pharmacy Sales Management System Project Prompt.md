# Pharmacy Sales Management System – Complete Project Requirements

I want to build a modern **Pharmacy Sales Management System** with a powerful backend, responsive frontend, and PWA support.

The system will have two main user roles:

1. **Admin**
2. **Salesman**

The application should be secure, modern, user-friendly, mobile-friendly, and easy to use.

---

## 1. User Roles and Authentication

### Admin
The Admin will have full control over the system.

Admin can:

- Create new salesman accounts
- View all salesman information
- Edit salesman information
- Activate or deactivate salesman accounts
- Monitor all sales
- View sales reports
- View attendance reports
- Monitor individual salesman performance
- Manage user accounts

### Salesman
Salesmen will have limited access based on their own account.

A salesman can:

- Log in securely
- View and update their profile
- Change their password
- Add daily sales
- View their own sales history
- View daily sales
- View weekly sales
- View monthly sales
- Mark their daily attendance
- View their attendance history

---

# 2. Admin User Management

The Admin should be able to create a new salesman with the following information:

- Full Name
- Phone Number
- Email Address
- Password
- Profile Image (optional)
- Account Status

After creating an account:

- The salesman can log in using their credentials
- The salesman can update their personal information
- The salesman can change their password
- The Admin can manage or deactivate the account

---

# 3. Sales Management System

Salesmen should be able to add their daily sales.

Each sale should include information such as:

- Sale Amount
- Date
- Product or Medicine Name (optional for future expansion)
- Quantity (optional)
- Notes (optional)
- Created By
- Created Time

The system should automatically associate every sale with the logged-in salesman.

A salesman must **never be able to see or edit another salesman's sales data**.

---

# 4. Sales Reports

The system should provide automatic sales reports.

## Admin Sales Reports

The Admin should be able to see:

### Daily Sales

- Today's total sales
- Total number of sales
- Sales by each salesman
- Best performing salesman

### Weekly Sales

- Total weekly sales
- Sales comparison by salesman
- Daily sales chart

### Monthly Sales

- Total monthly sales
- Sales comparison by salesman
- Monthly sales chart
- Top-performing salesman

### Custom Reports

The Admin should also be able to filter sales by:

- Specific Date
- Date Range
- Salesman
- Daily
- Weekly
- Monthly

---

# 5. Salesman Sales Dashboard

Each salesman should have their own personal dashboard.

The salesman dashboard should display:

### Today's Information

- Today's total sales
- Number of sales today
- Today's attendance status

### Weekly Information

- Total weekly sales
- Weekly sales chart

### Monthly Information

- Total monthly sales
- Monthly performance chart

### Personal Statistics

- Total sales
- Average daily sales
- Best sales day
- Attendance percentage

The salesman should only see **their own data**.

---

# 6. Attendance Management System

The system should include a daily attendance system.

Salesmen can:

- Mark attendance for the day
- View attendance history

Attendance status can include:

- Present
- Absent
- Late

The system should prevent duplicate attendance for the same day.

## Admin Attendance Dashboard

The Admin should be able to see:

- Today's attendance
- Total Present
- Total Absent
- Total Late
- Attendance by salesman
- Monthly attendance report
- Individual salesman attendance history

The Admin should also be able to filter attendance by:

- Date
- Salesman
- Month
- Attendance Status

---

# 7. Admin Dashboard

The Admin dashboard should be designed in a **modern, smart, professional, and data-driven way**.

The dashboard should display important information at a glance.

## Dashboard Summary Cards

Show:

- Total Sales Today
- Total Sales This Week
- Total Sales This Month
- Total Salesmen
- Present Today
- Absent Today
- Top Salesman
- Recent Sales

---

## Dashboard Charts

Include beautiful and interactive charts such as:

### Sales Chart

- Daily Sales
- Weekly Sales
- Monthly Sales

### Salesman Performance Chart

Compare sales between different salesmen.

### Attendance Chart

Show:

- Present
- Absent
- Late

### Monthly Performance Chart

Compare each salesman's monthly sales.

---

# 8. Salesman Performance System

The Admin should be able to monitor each salesman individually.

For every salesman, show:

- Name
- Phone
- Email
- Profile
- Total Sales
- Today's Sales
- Weekly Sales
- Monthly Sales
- Attendance Percentage
- Present Days
- Absent Days
- Performance Ranking

The Admin should be able to click on a salesman and view their complete profile and performance history.

---

# 9. Frontend Design Requirements

The frontend should have a **modern, clean, smart, and professional dashboard design**.

## Design Style

Use:

- Modern UI
- Clean layout
- Responsive design
- Smooth animations
- Professional dashboard cards
- Interactive charts
- Mobile-first design
- Easy navigation
- Dark mode support (optional)

---

## Admin Navigation

Admin sidebar should include:

- Dashboard
- Sales
- Sales Reports
- Salesmen
- Attendance
- Performance
- Profile
- Settings
- Logout

---

## Salesman Navigation

Salesman sidebar should include:

- Dashboard
- Add Sale
- My Sales
- Sales Report
- Attendance
- My Profile
- Settings
- Logout

---

# 10. Progressive Web App (PWA)

The frontend must be converted into a **Progressive Web App (PWA)**.

The application should:

- Work on Android
- Work on iOS
- Be installable from the browser
- Have an app-like experience
- Support offline functionality where possible
- Cache important application resources
- Have a mobile-friendly interface
- Support app icons
- Include a splash screen
- Support responsive layouts

Users should be able to install the system on their phone and use it like a native application.

---

# 11. Backend Requirements

The backend should use a clean and scalable architecture.

Recommended structure:

```text
Backend
│
├── Modules
│   ├── Auth
│   ├── Users
│   ├── Sales
│   └── Attendance
│
├── Routes
├── Controllers
├── Services
├── Models
├── Middleware
├── Utils
└── Config
```

Use:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Role-Based Authorization

---

# 12. Database Models

## User Model

```text
User
├── name
├── phone
├── email
├── password
├── role
│   ├── admin
│   └── salesman
├── profileImage
├── isActive
├── createdAt
└── updatedAt
```

---

## Sales Model

```text
Sale
├── salesmanId
├── amount
├── date
├── notes
├── createdAt
└── updatedAt
```

---

## Attendance Model

```text
Attendance
├── salesmanId
├── date
├── status
│   ├── Present
│   ├── Absent
│   └── Late
├── createdAt
└── updatedAt
```

---

# 13. Security Requirements

The system should include:

- JWT Authentication
- Secure Password Hashing
- Role-Based Access Control
- Protected Routes
- Input Validation
- Error Handling
- Secure API Structure

Important rules:

- Admin can access all data.
- Salesmen can only access their own data.
- Salesmen cannot view another salesman's sales.
- Salesmen cannot edit another user's information.
- Only Admin can create new salesman accounts.

---

# 14. API Requirements

Create a clean REST API.

Example modules:

## Authentication

```text
POST   /auth/login
POST   /auth/change-password
```

## Users

```text
POST   /users/create-salesman
GET    /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

## Sales

```text
POST   /sales
GET    /sales
GET    /sales/my-sales
GET    /sales/daily
GET    /sales/weekly
GET    /sales/monthly
```

## Attendance

```text
POST   /attendance
GET    /attendance
GET    /attendance/my-attendance
GET    /attendance/daily
GET    /attendance/monthly
```

---

# 15. Recommended Frontend Technology

Use:

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- React Query or Redux Toolkit
- Recharts or Chart.js
- PWA Configuration

---

# 16. Recommended Backend Technology

Use:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Zod or Joi for validation

---

# 17. Main Project Goal

Build a complete **Pharmacy Sales and Employee Management System** where:

### Admin Can

- Manage all salesmen
- Monitor daily sales
- Monitor weekly sales
- Monitor monthly sales
- Compare salesman performance
- Track daily attendance
- Track monthly attendance
- View smart reports
- View charts and analytics
- Manage all users

### Salesman Can

- Log in
- Manage their profile
- Change password
- Mark daily attendance
- Add daily sales
- View today's sales
- View weekly sales
- View monthly sales
- View personal performance
- View attendance history

---

# Final Requirement

The system should be:

- Modern
- Professional
- Smart
- Secure
- Fast
- Mobile Responsive
- Scalable
- Easy to Use
- PWA Ready
- Android Compatible
- iOS Compatible

The Admin Dashboard should provide a complete overview of the business, while the Salesman Dashboard should provide a simple and focused experience for managing personal sales and attendance.

The project should follow **clean code principles, scalable architecture, reusable components, proper error handling, secure authentication, role-based authorization, and professional UI/UX design**.