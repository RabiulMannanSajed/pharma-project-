export const ROLES = {
  ADMIN: 'admin',
  SALESMAN: 'salesman',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
};

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: ATTENDANCE_STATUS.PRESENT, label: 'Present', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { value: ATTENDANCE_STATUS.ABSENT, label: 'Absent', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  { value: ATTENDANCE_STATUS.LATE, label: 'Late', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
];

export const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Sales', path: '/admin/sales', icon: 'ShoppingCart' },
  { label: 'Sales Reports', path: '/admin/reports', icon: 'BarChart3' },
  { label: 'Salesmen', path: '/admin/salesmen', icon: 'Users' },
  { label: 'Attendance', path: '/admin/attendance', icon: 'CalendarCheck' },
  { label: 'Performance', path: '/admin/performance', icon: 'TrendingUp' },
  { label: 'Profile', path: '/admin/profile', icon: 'UserCircle' },
  { label: 'Settings', path: '/admin/settings', icon: 'Settings' },
];

export const SALESMAN_NAV = [
  { label: 'Dashboard', path: '/salesman/dashboard', icon: 'LayoutDashboard' },
  { label: 'Add Sale', path: '/salesman/add-sale', icon: 'PlusCircle' },
  { label: 'My Sales', path: '/salesman/my-sales', icon: 'Receipt' },
  { label: 'Sales Report', path: '/salesman/reports', icon: 'BarChart3' },
  { label: 'Attendance', path: '/salesman/attendance', icon: 'CalendarCheck' },
  { label: 'My Profile', path: '/salesman/profile', icon: 'UserCircle' },
  { label: 'Settings', path: '/salesman/settings', icon: 'Settings' },
];

export const ATTENDANCE_STATUS_COLORS = {
  Present: '#10b981',
  Absent: '#ef4444',
  Late: '#f59e0b',
};
