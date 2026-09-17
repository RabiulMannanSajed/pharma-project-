import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getUser,
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
  adminResetPassword,
} from '../../api/users';
import { listSales, customReport } from '../../api/sales';
import { monthlyAttendance } from '../../api/attendance';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/StatCard';
import { SalesLineChart } from '../../components/charts/SalesLineChart';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';
import { isEmail, isPhone } from '../../utils/validators';
import {
  ArrowLeft, Mail, Phone, Calendar,
  DollarSign, TrendingUp, CalendarCheck, UserCircle,
  ShoppingBag, ShoppingCart, Award, Save, UserCheck, UserX, Trash2, KeyRound,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const currentMonth = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

// Build the 30-day daily series from the actual list of sales so it's
// guaranteed to be filtered to THIS salesman only.
const build30DaySeries = (sales) => {
  const now = new Date();
  const days = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, totalAmount: 0, totalSales: 0 });
  }
  const byKey = Object.fromEntries(days.map((d) => [d.key, d]));
  for (const s of sales) {
    const d = new Date(s.date || s.createdAt);
    if (isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0, 10);
    if (byKey[key]) {
      byKey[key].totalAmount += Number(s.amount || 0);
      byKey[key].totalSales += 1;
    }
  }
  return days.map((d) => ({
    date: d.key.slice(5), // MM-DD for compact axis labels
    totalAmount: d.totalAmount,
    totalSales: d.totalSales,
  }));
};

const SalesmanProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // 1) Salesman info
  const userQuery = useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
    enabled: !!id,
    retry: false,
  });

  // 2) Per-salesman daily / weekly / monthly totals via customReport
  const dailyQ = useQuery({
    queryKey: ['sales', 'salesman-profile', id, 'daily'],
    queryFn: () => customReport({ range: 'daily', salesmanId: id }),
    enabled: !!id,
    retry: false,
  });
  const weeklyQ = useQuery({
    queryKey: ['sales', 'salesman-profile', id, 'weekly'],
    queryFn: () => customReport({ range: 'weekly', salesmanId: id }),
    enabled: !!id,
    retry: false,
  });
  const monthlyQ = useQuery({
    queryKey: ['sales', 'salesman-profile', id, 'monthly'],
    queryFn: () => customReport({ range: 'monthly', salesmanId: id }),
    enabled: !!id,
    retry: false,
  });

  // 3) Lifetime sales (for the chart + recent list). Paginated internally because
  // the backend caps limit at 100.
  const salesQuery = useQuery({
    queryKey: ['sales', 'salesman-profile', id, 'all'],
    queryFn: async () => {
      const collected = [];
      let page = 1;
      let totalPages = 1;
      const MAX_PAGES = 20;
      while (page <= totalPages && page <= MAX_PAGES) {
        const res = await listSales({ page, limit: 100, salesmanId: id });
        collected.push(...(res.items || []));
        totalPages = res.totalPages || 1;
        page += 1;
      }
      return collected;
    },
    enabled: !!id,
    retry: false,
  });

  // 4) Attendance for current month
  const attendanceQuery = useQuery({
    queryKey: ['attendance', 'admin-monthly'],
    queryFn: () => monthlyAttendance(currentMonth()),
    enabled: !!id,
    retry: false,
  });

  const series = useMemo(
    () => build30DaySeries(salesQuery.data || []),
    [salesQuery.data]
  );

  // -------- Edit form state --------
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    if (userQuery.data) {
      const u = userQuery.data;
      setEditForm({
        name: u.name || '',
        phone: u.phone || '',
        email: u.email || '',
      });
    }
  }, [userQuery.data]);

  const updateMut = useMutation({
    mutationFn: (payload) => updateUser(id, payload),
    onSuccess: (data) => {
      toast.success('Salesman updated');
      const fresh = data?.data || data;
      qc.setQueryData(['users', id], fresh);
      qc.invalidateQueries({ queryKey: ['users'] });
      setEditOpen(false);
    },
    onError: (e) => toast.error(e?.message || 'Failed to update'),
  });

  const toggleActiveMut = useMutation({
    mutationFn: () => {
      const u = userQuery.data;
      return u?.isActive ? deactivateUser(id) : activateUser(id);
    },
    onSuccess: (data) => {
      const fresh = data?.data || data;
      toast.success(fresh?.isActive ? 'Salesman activated' : 'Salesman deactivated');
      qc.setQueryData(['users', id], fresh);
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e) => toast.error(e?.message || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteUser(id),
    onSuccess: () => {
      toast.success('Salesman deleted');
      qc.invalidateQueries({ queryKey: ['users'] });
      navigate('/admin/salesmen');
    },
    onError: (e) => toast.error(e?.message || 'Failed to delete'),
  });

  // -------- Password reset modal --------
  const [pwOpen, setPwOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const resetPwMut = useMutation({
    mutationFn: (pw) => adminResetPassword(id, pw),
    onSuccess: () => {
      toast.success('Password reset');
      setPwOpen(false);
      setNewPassword('');
    },
    onError: (e) => toast.error(e?.message || 'Failed to reset password'),
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
        <p className="text-rose-600 dark:text-rose-400">Failed to load salesman</p>
      </Card>
    );
  }

  const user = userQuery.data || {};
  const sales = salesQuery.data || [];
  const daily = dailyQ.data || {};
  const weekly = weeklyQ.data || {};
  const monthly = monthlyQ.data || {};
  const attMonthly = attendanceQuery.data || {};

  // unwrap helper: backend may return the summary resource or wrap under .data
  const unwrap = (r) => (r && typeof r === 'object' && 'totalAmount' in r ? r : r?.data || r || {});
  const dailyR = unwrap(daily);
  const weeklyR = unwrap(weekly);
  const monthlyR = unwrap(monthly);

  const totalSales = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  const bySalesmanRow = (attMonthly.bySalesman || []).find(
    (r) => {
      const sid = r?.salesman?._id ?? r?.salesman ?? r?._id;
      return String(sid) === String(id);
    }
  );
  const presentThisMonth = bySalesmanRow
    ? (bySalesmanRow.byStatus || []).find((s) => s.status === 'Present')?.count || 0
    : 0;
  const attendancePct = bySalesmanRow?.attendancePercentage ?? 0;

  const bestDay = sales.reduce(
    (best, s) => (Number(s.amount || 0) > Number(best.amount || 0) ? s : best),
    {}
  );

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
    if (editErrors[name]) setEditErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onEditSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!editForm.name || editForm.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!editForm.phone) errs.phone = 'Phone is required';
    else if (!isPhone(editForm.phone)) errs.phone = 'Invalid phone';
    if (!editForm.email || !isEmail(editForm.email)) errs.email = 'Invalid email';
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }
    updateMut.mutate({
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/salesmen">
        <Button variant="ghost" size="sm" icon={ArrowLeft}>
          Back to Salesmen
        </Button>
      </Link>

      {/* Profile header + actions */}
      <Card>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {user.name || 'Unknown'}
              </h2>
              {user.isActive ? (
                <Badge color="green">Active</Badge>
              ) : (
                <Badge color="red">Inactive</Badge>
              )}
              <Badge color="brand">{user.role || 'salesman'}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> {user.email || '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" /> {user.phone || '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Joined {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <Button
              variant="secondary"
              icon={Save}
              onClick={() => {
                setEditForm({
                  name: user.name || '',
                  phone: user.phone || '',
                  email: user.email || '',
                });
                setEditErrors({});
                setEditOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              icon={KeyRound}
              onClick={() => {
                setNewPassword('');
                setPwOpen(true);
              }}
            >
              Reset Password
            </Button>
            <Button
              variant="secondary"
              icon={user.isActive ? UserX : UserCheck}
              onClick={() => toggleActiveMut.mutate()}
              loading={toggleActiveMut.isPending}
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => {
                if (window.confirm(`Delete ${user.name}? This cannot be undone.`)) {
                  deleteMut.mutate();
                }
              }}
              loading={deleteMut.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* Sales period breakdown — admin can see daily, weekly, monthly */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Sales Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={DollarSign}
            label="Today's Sales"
            value={formatCurrency(dailyR.totalAmount)}
            hint={`${dailyR.totalSales || 0} transactions`}
            color="emerald"
          />
          <StatCard
            icon={TrendingUp}
            label="This Week"
            value={formatCurrency(weeklyR.totalAmount)}
            hint={`${weeklyR.totalSales || 0} transactions`}
            color="brand"
          />
          <StatCard
            icon={ShoppingCart}
            label="This Month"
            value={formatCurrency(monthlyR.totalAmount)}
            hint={`${monthlyR.totalSales || 0} transactions`}
            color="sky"
          />
        </div>
      </div>

      {/* Personal stats */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Personal Statistics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Award}
            label="Lifetime Sales"
            value={formatCurrency(totalSales)}
            hint={`${sales.length} total transactions`}
            color="emerald"
          />
          <StatCard
            icon={CalendarCheck}
            label="Present (This Month)"
            value={formatNumber(presentThisMonth)}
            color="brand"
          />
          <StatCard
            icon={UserCircle}
            label="Attendance %"
            value={`${Number(attendancePct || 0).toFixed(1)}%`}
            color="sky"
          />
          <StatCard
            icon={ShoppingBag}
            label="Best Sale"
            value={bestDay.amount ? formatCurrency(bestDay.amount) : '—'}
            hint={bestDay.date ? formatDate(bestDay.date) : 'No sales yet'}
            color="amber"
          />
        </div>
      </div>

      {/* 30-day sales chart — per-salesman */}
      <Card title="Daily Sales (Last 30 Days)">
        {series.some((d) => d.totalAmount > 0) ? (
          <SalesLineChart data={series} height={280} />
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No sales in the last 30 days"
            description="This salesman hasn't recorded any sales recently."
          />
        )}
      </Card>

      {/* Recent sales table */}
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
                  <td colSpan={3} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                    No sales recorded yet
                  </td>
                </tr>
              ) : (
                sales.slice(0, 10).map((s) => (
                  <tr key={s._id}>
                    <td className="px-4 py-3">{s.productName || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(s.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs">
                      {formatDate(s.date || s.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Salesman"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={updateMut.isPending}>
              Cancel
            </Button>
            <Button onClick={onEditSubmit} loading={updateMut.isPending}>
              Save
            </Button>
          </>
        }
      >
        <form onSubmit={onEditSubmit} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            name="name"
            value={editForm.name}
            onChange={onEditChange}
            error={editErrors.name}
            required
          />
          <Input
            label="Phone"
            name="phone"
            value={editForm.phone}
            onChange={onEditChange}
            error={editErrors.phone}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={editForm.email}
            onChange={onEditChange}
            error={editErrors.email}
            required
          />
        </form>
      </Modal>

      {/* Password reset modal */}
      <Modal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        title="Reset Password"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPwOpen(false)} disabled={resetPwMut.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newPassword || newPassword.length < 6) {
                  toast.error('Password must be at least 6 characters');
                  return;
                }
                resetPwMut.mutate(newPassword);
              }}
              loading={resetPwMut.isPending}
            >
              Reset
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          Set a new password for <strong>{user.name}</strong>. They can change it again later.
        </p>
        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          helper="At least 6 characters"
        />
      </Modal>
    </div>
  );
};

export default SalesmanProfile;
