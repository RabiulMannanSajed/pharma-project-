import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listAttendance } from '../../api/attendance';
import { listUsers } from '../../api/users';
import { Card } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';
import { ATTENDANCE_STATUS_OPTIONS } from '../../utils/constants';
import { CalendarCheck } from 'lucide-react';

const Attendance = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    salesmanId: '',
    status: '',
    from: '',
    to: '',
    month: '',
    year: '',
  });

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const { data: usersData } = useQuery({
    queryKey: ['users', 'for-filter'],
    queryFn: () => listUsers({ limit: 100 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', { page, ...filters }],
    queryFn: () =>
      listAttendance({
        page,
        limit: 30,
        salesmanId: filters.salesmanId || undefined,
        status: filters.status || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        month: filters.month || undefined,
        year: filters.year || undefined,
      }),
  });

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;

  const statusColor = (s) => {
    const opt = ATTENDANCE_STATUS_OPTIONS.find((o) => o.value === s);
    return opt ? opt.color : 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Attendance</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View and filter attendance records
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Select
            label="Salesman"
            value={filters.salesmanId}
            onChange={(e) => updateFilter('salesmanId', e.target.value)}
          >
            <option value="">All</option>
            {(usersData?.items || [])
              .filter((u) => u.role === 'salesman')
              .map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
          </Select>
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="">All</option>
            {ATTENDANCE_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Input
            label="From"
            type="date"
            value={filters.from}
            onChange={(e) => updateFilter('from', e.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={filters.to}
            onChange={(e) => updateFilter('to', e.target.value)}
          />
          <Select
            label="Month"
            value={filters.month}
            onChange={(e) => updateFilter('month', e.target.value)}
          >
            <option value="">All</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
              </option>
            ))}
          </Select>
          <Input
            label="Year"
            type="number"
            value={filters.year}
            onChange={(e) => updateFilter('year', e.target.value)}
            placeholder="e.g. 2026"
          />
        </div>
      </Card>

      <Card padding="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No attendance records" />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>Salesman</TH>
                  <TH>Date</TH>
                  <TH>Status</TH>
                  <TH>Notes</TH>
                </tr>
              </THead>
              <TBody>
                {items.map((a) => (
                  <TR key={a._id}>
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-semibold">
                          {a.salesman?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{a.salesman?.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{a.salesman?.email}</p>
                        </div>
                      </div>
                    </TD>
                    <TD>{formatDate(a.date)}</TD>
                    <TD>
                      <span className={`badge ${statusColor(a.status)}`}>{a.status}</span>
                    </TD>
                    <TD className="text-slate-600 dark:text-slate-400">{a.notes || '—'}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <div className="p-4">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Attendance;