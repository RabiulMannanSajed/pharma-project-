import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  dailyReport,
  weeklyReport,
  monthlyReport,
  customReport,
  dailySeries,
} from '../../api/sales';
import { listUsers } from '../../api/users';
import { Card } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { SalesBarChart } from '../../components/charts/SalesBarChart';
import { SalesLineChart } from '../../components/charts/SalesLineChart';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { BarChart3, Trophy, TrendingUp, Calendar, ListFilter } from 'lucide-react';

const TABS = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
];

const ReportSummary = ({ report }) => {
  if (!report) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
          Total Sales
        </p>
        <p className="text-2xl font-bold text-brand-700 dark:text-brand-400 mt-2">
          {formatCurrency(report.totalAmount)}
        </p>
      </Card>
      <Card>
        <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
          Number of Sales
        </p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">
          {formatNumber(report.totalSales)}
        </p>
      </Card>
      <Card>
        <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
          Top Salesman
        </p>
        <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-2">
          {report.topSalesman?.salesman?.name || '—'}
        </p>
        {report.topSalesman && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatCurrency(report.topSalesman.totalAmount)}
          </p>
        )}
      </Card>
    </div>
  );
};

const ReportTable = ({ report }) => {
  const bySalesman = report?.bySalesman || [];
  if (bySalesman.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No sales in this period"
        description="Try a different date range or check back later"
      />
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">#</th>
            <th className="px-4 py-3 text-left font-semibold">Salesman</th>
            <th className="px-4 py-3 text-right font-semibold">Sales</th>
            <th className="px-4 py-3 text-right font-semibold">Total Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {bySalesman.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{i + 1}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-semibold">
                    {row.salesman?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{row.salesman?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{row.salesman?.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                {formatNumber(row.totalSales)}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                {formatCurrency(row.totalAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Reports = () => {
  const [tab, setTab] = useState('daily');
  const [range, setRange] = useState('custom');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesmanId, setSalesmanId] = useState('');

  const { data: usersData } = useQuery({
    queryKey: ['users', 'for-filter'],
    queryFn: () => listUsers({ limit: 100 }),
  });

  // Build a stable query key so any filter change refetches.
  const queryKey = ['report', tab, { startDate, endDate, range, salesmanId }];

  const reportQuery = useQuery({
    queryKey,
    queryFn: async () => {
      // If a salesman is picked, use customReport for daily/weekly/monthly too,
      // because dailyReport/weeklyReport/monthlyReport don't accept salesmanId.
      const sid = salesmanId || undefined;
      if (sid) {
        if (tab === 'daily') return customReport({ range: 'daily', salesmanId: sid });
        if (tab === 'weekly') return customReport({ range: 'weekly', salesmanId: sid });
        if (tab === 'monthly') return customReport({ range: 'monthly', salesmanId: sid });
        return customReport({
          range,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          salesmanId: sid,
        });
      }
      if (tab === 'daily') return dailyReport();
      if (tab === 'weekly') return weeklyReport();
      if (tab === 'monthly') return monthlyReport();
      return customReport({
        range,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
    },
    enabled: tab !== 'custom' || (!!startDate && !!endDate),
  });

  const report = reportQuery.data;

  // Daily breakdown chart for the chosen period (uses daily-series which already filters by salesman if needed).
  const rangeForSeries = useMemo(() => {
    if (tab === 'daily') return 'daily';
    if (tab === 'weekly') return 'weekly';
    if (tab === 'monthly') return 'monthly';
    return range; // custom
  }, [tab, range]);

  const seriesQuery = useQuery({
    queryKey: ['report-series', rangeForSeries, salesmanId, startDate, endDate],
    queryFn: async () => {
      // Build explicit from/to from the chosen range and use the daily-series endpoint
      const today = new Date();
      let from, to;
      const day = (d) => new Date(new Date(d).setHours(0, 0, 0, 0));
      const end = (d) => new Date(new Date(d).setHours(23, 59, 59, 999));
      if (rangeForSeries === 'daily') {
        from = day(today); to = end(today);
      } else if (rangeForSeries === 'weekly') {
        const ws = new Date(today); ws.setDate(today.getDate() - 6); from = day(ws); to = end(today);
      } else if (rangeForSeries === 'monthly') {
        const ms = new Date(today.getFullYear(), today.getMonth(), 1); from = day(ms); to = end(today);
      } else {
        from = startDate ? day(startDate) : null;
        to = endDate ? end(endDate) : null;
        if (!from || !to) return [];
      }
      const fmt = (d) => d.toISOString();
      return dailySeries({ from: fmt(from), to: fmt(to), salesmanId: salesmanId || undefined });
    },
  });

  const chartData = (report?.bySalesman || []).map((r) => ({
    name: r.salesman?.name || 'Unknown',
    totalAmount: r.totalAmount,
  }));

  const lineData = (seriesQuery.data || []).map((d) => ({
    date: d.date,
    totalAmount: d.totalAmount,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Sales Reports</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Analyze sales performance across periods and salesmen
        </p>
      </div>

      <Card padding="p-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap ${
                tab === t.id
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Filters — shown on every tab */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select
            label="Salesman"
            value={salesmanId}
            onChange={(e) => setSalesmanId(e.target.value)}
          >
            <option value="">All salesmen</option>
            {(usersData?.items || [])
              .filter((u) => u.role === 'salesman')
              .map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
          </Select>

          {tab === 'custom' && (
            <>
              <Select
                label="Range"
                value={range}
                onChange={(e) => setRange(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Range</option>
              </Select>
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </>
          )}
        </div>
      </Card>

      {reportQuery.isLoading || reportQuery.isFetching ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : !report ? (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="No data"
            description="Try adjusting the filters or pick a date range for Custom."
          />
        </Card>
      ) : (
        <>
          <ReportSummary report={report} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Sales by Salesman">
              {chartData.length > 0 ? (
                <SalesBarChart data={chartData} height={280} />
              ) : (
                <EmptyState icon={BarChart3} title="No data" />
              )}
            </Card>
            <Card title={salesmanId ? 'Sales Trend (this salesman)' : 'Sales Trend'}>
              {lineData.length > 0 ? (
                <SalesLineChart data={lineData} height={280} />
              ) : (
                <EmptyState icon={TrendingUp} title="No data" />
              )}
            </Card>
          </div>

          <Card title="Breakdown by Salesman" padding="p-0">
            <ReportTable report={report} />
          </Card>
        </>
      )}
    </div>
  );
};

export default Reports;
