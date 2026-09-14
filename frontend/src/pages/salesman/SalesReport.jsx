import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dailyReport, weeklyReport, monthlyReport } from '../../api/sales';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { SalesLineChart } from '../../components/charts/SalesLineChart';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { BarChart3 } from 'lucide-react';

const TABS = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
];

const SalesReport = () => {
  const [tab, setTab] = useState('daily');

  const query = useQuery({
    queryKey: ['report', tab],
    queryFn: () => {
      if (tab === 'daily') return dailyReport();
      if (tab === 'weekly') return weeklyReport();
      return monthlyReport();
    },
  });

  const report = query.data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Sales Report</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your personal sales performance
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

      {query.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : !report ? (
        <Card>
          <EmptyState icon={BarChart3} title="No data available" />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                Total Sales
              </p>
              <p className="text-3xl font-bold text-brand-700 dark:text-brand-400 mt-2">
                {formatCurrency(report.totalAmount)}
              </p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                Number of Sales
              </p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">
                {formatNumber(report.totalSales)}
              </p>
            </Card>
          </div>

          {report.bySalesman && report.bySalesman.length > 0 && (
            <Card title="Performance">
              <SalesLineChart
                data={report.bySalesman.map((b) => ({
                  date: b.salesman?.name || '',
                  totalAmount: b.totalAmount,
                }))}
                height={260}
              />
            </Card>
          )}

          <Card title="Period Details">
            <div className="space-y-2 text-sm">
              {report.from && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">From</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {new Date(report.from).toLocaleString()}
                  </span>
                </div>
              )}
              {report.to && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">To</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {new Date(report.to).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Average per sale</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {formatCurrency(
                    report.totalSales > 0 ? report.totalAmount / report.totalSales : 0
                  )}
                </span>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default SalesReport;