import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listUsers } from '../../api/users';
import { performanceBySalesman } from '../../api/sales';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { PerformanceChart } from '../../components/charts/PerformanceChart';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { TrendingUp, Award, Eye } from 'lucide-react';

const Performance = () => {
  const [range, setRange] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Active salesmen — to show in the list even when they have no sales yet.
  const usersQuery = useQuery({
    queryKey: ['users', 'performance'],
    queryFn: () => listUsers({ limit: 100, role: 'salesman' }),
  });

  // Single aggregate call — no client-side paging of full sales collection.
  const salesQuery = useQuery({
    queryKey: ['sales', 'performance', { range, from, to }],
    queryFn: () =>
      performanceBySalesman({
        from: range === 'all' || !from ? undefined : from,
        to: range === 'all' || !to ? undefined : to,
      }),
  });

  if (usersQuery.isLoading || salesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (usersQuery.isError || salesQuery.isError) {
    return (
      <Card>
        <p className="text-rose-600 dark:text-rose-400">
          Failed to load performance data. Please retry.
        </p>
      </Card>
    );
  }

  // Merge: every active salesman with zeros, plus any with sales from the aggregate.
  const allSalesmen = (usersQuery.data?.items || []).filter((u) => u.role === 'salesman');
  const perfMap = new Map((salesQuery.data || []).map((p) => [p.salesman._id, p]));

  const performanceData = allSalesmen
    .map((u) => {
      const p = perfMap.get(u._id);
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        isActive: u.isActive,
        totalSales: p?.totalSales || 0,
        totalAmount: p?.totalAmount || 0,
      };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount);

  const chartData = performanceData
    .filter((p) => p.totalAmount > 0)
    .map((p) => ({ name: p.name, totalAmount: p.totalAmount }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Performance</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Compare salesmen performance and rankings
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="label">Range</label>
            <select
              className="input"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="all">All time</option>
              <option value="custom">Custom date range</option>
            </select>
          </div>
          {range === 'custom' && (
            <>
              <div>
                <label className="label">From</label>
                <input
                  type="date"
                  className="input"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="label">To</label>
                <input
                  type="date"
                  className="input"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {performanceData.length === 0 ? (
        <Card>
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            No salesmen to compare
          </p>
        </Card>
      ) : (
        <>
          {chartData.length > 0 ? (
            <Card title="Total Sales by Salesman">
              <PerformanceChart data={chartData} height={320} />
            </Card>
          ) : (
            <Card>
              <p className="text-center text-slate-500 dark:text-slate-400 py-6">
                No sales in the selected period.
              </p>
            </Card>
          )}

          <Card title="Leaderboard" padding="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Rank</th>
                    <th className="px-4 py-3 text-left font-semibold">Salesman</th>
                    <th className="px-4 py-3 text-right font-semibold">Sales</th>
                    <th className="px-4 py-3 text-right font-semibold">Total Amount</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {performanceData.map((p, i) => (
                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {i === 0 ? (
                            <Award className="h-5 w-5 text-amber-500" />
                          ) : i === 1 ? (
                            <Award className="h-5 w-5 text-slate-400" />
                          ) : i === 2 ? (
                            <Award className="h-5 w-5 text-amber-700" />
                          ) : (
                            <span className="w-5 text-center text-slate-500">{i + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-xs font-semibold">
                            {p.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">{p.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                        {formatNumber(p.totalSales)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                        {formatCurrency(p.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.isActive ? (
                          <Badge color="green">Active</Badge>
                        ) : (
                          <Badge color="red">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/salesmen/${p._id}`}
                          className="inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:underline"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Performance;
