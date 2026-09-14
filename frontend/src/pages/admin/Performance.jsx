import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listUsers } from '../../api/users';
import { mySales } from '../../api/sales';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { PerformanceChart } from '../../components/charts/PerformanceChart';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { TrendingUp, Award, Eye } from 'lucide-react';

const Performance = () => {
  const usersQuery = useQuery({
    queryKey: ['users', 'performance'],
    queryFn: () => listUsers({ limit: 100, role: 'salesman' }),
  });

  const salesmen = (usersQuery.data?.items || []).filter((u) => u.role === 'salesman');

  const salesQueries = useQuery({
    queryKey: ['sales', 'all-for-performance'],
    queryFn: async () => {
      const all = [];
      let page = 1;
      while (true) {
        const res = await fetch(`/api/sales?page=${page}&limit=100`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('psm_token')}` },
        });
        const json = await res.json();
        // Backend wraps as { success, statusCode, message, data: { items, pagination } }
        const d = json?.data || json;
        all.push(...(d.items || []));
        if (!d.pagination || page >= d.pagination.totalPages) break;
        page += 1;
        if (page > 50) break;
      }
      return all;
    },
  });

  if (usersQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const allSales = salesQueries.data || [];
  const performanceData = salesmen.map((u) => {
    const uSales = allSales.filter((s) => (s.salesman?._id || s.salesman) === u._id);
    const totalAmount = uSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    return {
      _id: u._id,
      name: u.name,
      email: u.email,
      isActive: u.isActive,
      totalSales: uSales.length,
      totalAmount,
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount);

  const chartData = performanceData.map((p) => ({
    name: p.name,
    totalAmount: p.totalAmount,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Performance</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Compare salesmen performance and rankings
        </p>
      </div>

      {performanceData.length === 0 ? (
        <Card>
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            No salesmen to compare
          </p>
        </Card>
      ) : (
        <>
          <Card title="Total Sales by Salesman">
            <PerformanceChart data={chartData} height={320} />
          </Card>

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
                        {p.isActive ? <Badge color="green">Active</Badge> : <Badge color="red">Inactive</Badge>}
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