import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getUser } from '../../api/users';
import { mySales } from '../../api/sales';
import { myMonthlyStats } from '../../api/attendance';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/StatCard';
import { SalesLineChart } from '../../components/charts/SalesLineChart';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, TrendingUp, CalendarCheck, UserCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const SalesmanProfile = () => {
  const { id } = useParams();

  const userQuery = useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });

  const salesQuery = useQuery({
    queryKey: ['sales', 'my', id],
    queryFn: () => mySales({ limit: 100 }),
    enabled: !!id,
  });

  const attendanceQuery = useQuery({
    queryKey: ['attendance', 'my-stats', id],
    queryFn: () => myMonthlyStats({}),
    enabled: !!id,
  });

  if (userQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (userQuery.isError) {
    return (
      <Card>
        <p className="text-rose-600">Failed to load user</p>
      </Card>
    );
  }

  const user = userQuery.data || {};
  const sales = salesQuery.data?.items || [];
  const attStats = attendanceQuery.data || {};

  const totalSales = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  return (
    <div className="space-y-6">
      <Link to="/admin/salesmen">
        <Button variant="ghost" size="sm" icon={ArrowLeft}>
          Back to Salesmen
        </Button>
      </Link>

      <Card>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{user.name}</h2>
              {user.isActive ? <Badge color="green">Active</Badge> : <Badge color="red">Inactive</Badge>}
              <Badge color="brand">{user.role}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {user.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {user.phone}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Sales"
          value={formatCurrency(totalSales)}
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Number of Sales"
          value={formatNumber(sales.length)}
          color="brand"
        />
        <StatCard
          icon={CalendarCheck}
          label="Present (This Month)"
          value={formatNumber(attStats.totalPresent || 0)}
          color="sky"
        />
        <StatCard
          icon={UserCircle}
          label="Attendance %"
          value={`${(attStats.attendancePercentage || 0).toFixed(1)}%`}
          color="amber"
        />
      </div>

      {sales.length > 0 && (
        <Card title="Sales Over Time">
          <SalesLineChart
            data={sales
              .slice()
              .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))
              .map((s) => ({
                date: formatDate(s.date || s.createdAt),
                totalAmount: Number(s.amount || 0),
              }))}
            height={280}
          />
        </Card>
      )}

      <Card title="Recent Sales" padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Product</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 text-right font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No sales recorded yet
                  </td>
                </tr>
              ) : (
                sales.slice(0, 10).map((s) => (
                  <tr key={s._id}>
                    <td className="px-4 py-3">{s.productName || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(s.amount)}</td>
                    <td className="px-4 py-3 text-right text-xs">{formatDate(s.date || s.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SalesmanProfile;