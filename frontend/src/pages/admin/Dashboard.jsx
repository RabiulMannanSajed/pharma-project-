import { useQuery } from '@tanstack/react-query';
import { adminDashboard } from '../../api/dashboard';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/StatCard';
import { Spinner } from '../../components/ui/Spinner';
import { SalesLineChart } from '../../components/charts/SalesLineChart';
import { PerformanceChart } from '../../components/charts/PerformanceChart';
import { formatCurrency, formatDateTime, formatNumber } from '../../utils/formatters';

import {
  DollarSign,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Clock,
  Trophy,
  ShoppingBag,
} from 'lucide-react';

const Dashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: adminDashboard,
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
        <p className="text-rose-600 dark:text-rose-400">Failed to load dashboard data</p>
      </Card>
    );
  }

  const d = data || {};
  const summary = d.summary || {};
  const charts = d.charts || {};
  const recentSales = d.recentSales || [];

  const performanceData = (charts.monthlySalesPerformance || []).map((m) => ({
    name: m.salesman?.name || 'Unknown',
    totalAmount: m.totalAmount,
  }));
  const weeklyChartData = (charts.dailySalesThisWeek || []).map((d) => ({
    date: d.date,
    totalAmount: d.totalAmount,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Admin Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Overview of your pharmacy business
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Sales Today"
          value={formatCurrency(summary.totalSalesToday)}
          hint={`${summary.numberOfSalesToday || 0} transactions`}
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Sales This Week"
          value={formatCurrency(summary.totalSalesThisWeek)}
          color="brand"
        />
        <StatCard
          icon={ShoppingBag}
          label="Sales This Month"
          value={formatCurrency(summary.totalSalesThisMonth)}
          color="sky"
        />
        <StatCard
          icon={Users}
          label="Total Salesmen"
          value={formatNumber(summary.totalSalesmen)}
          hint={`${summary.activeSalesmen || 0} active`}
          color="violet"
        />
        <StatCard
          icon={UserCheck}
          label="Present Today"
          value={formatNumber(summary.presentToday)}
          color="emerald"
        />
        <StatCard
          icon={UserX}
          label="Absent Today"
          value={formatNumber(summary.absentToday)}
          color="rose"
        />
        <StatCard
          icon={Clock}
          label="Late Today"
          value={formatNumber(summary.lateToday)}
          color="amber"
        />
        <StatCard
          icon={Trophy}
          label="Top Salesman"
          value={summary.topSalesman?.salesman?.name || '—'}
          hint={
            summary.topSalesman
              ? formatCurrency(summary.topSalesman.totalAmount)
              : 'No data yet'
          }
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Daily Sales (This Week)">
          <SalesLineChart data={weeklyChartData} height={260} />
        </Card>
        <Card title="Monthly Performance by Salesman">
          <PerformanceChart data={performanceData} height={280} />
        </Card>

        <Card title="Daily Sales This Week" padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Sales</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {weeklyChartData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No sales yet this week
                    </td>
                  </tr>
                ) : (
                  weeklyChartData.map((d, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{d.date}</td>
                      <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                        {d.totalSales || 0}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                        {formatCurrency(d.totalAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card title="Recent Sales" padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Salesman</th>
                <th className="px-4 py-3 text-left font-semibold">Product</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 text-right font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                    No recent sales
                  </td>
                </tr>
              ) : (
                recentSales.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-semibold">
                          {s.salesman?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{s.salesman?.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{s.salesman?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{s.productName || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                      {formatCurrency(s.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 text-xs">
                      {formatDateTime(s.date || s.createdAt)}
                    </td>
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

export default Dashboard;