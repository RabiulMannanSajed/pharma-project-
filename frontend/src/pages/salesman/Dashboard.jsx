import { useQuery } from '@tanstack/react-query';
import { salesmanDashboard } from '../../api/dashboard';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/StatCard';
import { Spinner } from '../../components/ui/Spinner';
import { SalesLineChart } from '../../components/charts/SalesLineChart';
import { AttendancePieChart } from '../../components/charts/AttendancePieChart';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { DollarSign, ShoppingBag, TrendingUp, CalendarCheck, Target, Award } from 'lucide-react';

const Dashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'salesman'],
    queryFn: salesmanDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <p className="text-rose-600">Failed to load dashboard</p>
      </Card>
    );
  }

  const d = data || {};
  const summary = d.summary || {};
  const charts = d.charts || {};
  const stats = d.personalStats || d.stats || {};

  const weeklyData = (charts.weeklyChart || charts.dailySalesThisWeek || []).map((d) => ({
    date: d.date || d.day,
    totalAmount: d.totalAmount || d.amount,
  }));

  const monthlyData = (charts.monthlyChart || []).map((m) => ({
    date: m.date || m.day,
    totalAmount: m.totalAmount || m.amount,
  }));

  const attendanceData = Object.entries(charts.attendanceThisMonth || charts.attendanceToday || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your personal performance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Today's Sales"
          value={formatCurrency(summary.totalSalesToday)}
          hint={`${summary.numberOfSalesToday || 0} sales`}
          color="emerald"
        />
        <StatCard
          icon={CalendarCheck}
          label="Today's Attendance"
          value={summary.todayAttendanceStatus || 'Not marked'}
          color="sky"
        />
        <StatCard
          icon={TrendingUp}
          label="This Week"
          value={formatCurrency(summary.totalSalesThisWeek)}
          color="brand"
        />
        <StatCard
          icon={ShoppingBag}
          label="This Month"
          value={formatCurrency(summary.totalSalesThisMonth)}
          color="violet"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Award}
          label="Total Sales"
          value={formatCurrency(stats.totalSales)}
          color="amber"
        />
        <StatCard
          icon={Target}
          label="Average Daily Sales"
          value={formatCurrency(stats.averageDailySales)}
          color="brand"
        />
        <StatCard
          icon={TrendingUp}
          label="Best Sales Day"
          value={stats.bestSalesDay ? formatCurrency(stats.bestSalesDay.amount) : '—'}
          hint={stats.bestSalesDay?.date}
          color="emerald"
        />
        <StatCard
          icon={CalendarCheck}
          label="Attendance %"
          value={`${(stats.attendancePercentage || 0).toFixed(1)}%`}
          color="sky"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {weeklyData.length > 0 && (
          <Card title="Weekly Sales">
            <SalesLineChart data={weeklyData} height={260} />
          </Card>
        )}
        {monthlyData.length > 0 && (
          <Card title="Monthly Performance">
            <SalesLineChart data={monthlyData} height={260} />
          </Card>
        )}
        {attendanceData.length > 0 && (
          <Card title="Attendance Overview">
            <AttendancePieChart data={attendanceData} />
          </Card>
        )}
        <Card>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2 text-sm">
            <a href="/salesman/add-sale" className="block p-3 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition">
              ➕ Add a new sale
            </a>
            <a href="/salesman/attendance" className="block p-3 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition">
              📅 Mark today's attendance
            </a>
            <a href="/salesman/my-sales" className="block p-3 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition">
              📊 View your sales history
            </a>
            <a href="/salesman/reports" className="block p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition">
              📈 View your reports
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;