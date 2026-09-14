import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listUsers,
  createSalesman,
  deactivateUser,
  activateUser,
  deleteUser,
} from '../../api/users';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import {
  Plus,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  Users as UsersIcon,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { validateSalesman } from '../../utils/validators';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const emptyForm = { name: '', phone: '', email: '', password: '' };

const Salesmen = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, search }],
    queryFn: () => listUsers({ page, limit: 20, search: search || undefined }),
  });

  const items = (data?.items || []).filter((u) => u.role === 'salesman');
  const totalPages = data?.totalPages || 1;

  const createMut = useMutation({
    mutationFn: createSalesman,
    onSuccess: () => {
      toast.success('Salesman created');
      qc.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: (e) => toast.error(e?.message || 'Failed to create'),
  });

  const toggleActiveMut = useMutation({
    mutationFn: ({ id, activate }) =>
      activate ? activateUser(id) : deactivateUser(id),
    onSuccess: (_, vars) => {
      toast.success(vars.activate ? 'Salesman activated' : 'Salesman deactivated');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e) => toast.error(e?.message || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Salesman deleted');
      qc.invalidateQueries({ queryKey: ['users'] });
      setConfirmDelete(null);
    },
    onError: (e) => toast.error(e?.message || 'Failed to delete'),
  });

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
    setErrors({});
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = validateSalesman(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    createMut.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Salesmen</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your sales team
          </p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          New Salesman
        </Button>
      </div>

      <Card>
        <Input
          placeholder="Search by name, phone, or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </Card>

      <Card padding="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No salesmen yet"
            description="Add your first salesman to start tracking sales"
            action={
              <Button icon={Plus} onClick={openCreate}>
                New Salesman
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>Name</TH>
                  <TH>Phone</TH>
                  <TH>Email</TH>
                  <TH>Status</TH>
                  <TH>Joined</TH>
                  <TH className="text-right">Actions</TH>
                </tr>
              </THead>
              <TBody>
                {items.map((u) => (
                  <TR key={u._id}>
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-xs font-semibold">
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{u.name}</p>
                      </div>
                    </TD>
                    <TD>{u.phone}</TD>
                    <TD>{u.email}</TD>
                    <TD>
                      {u.isActive ? (
                        <Badge color="green">Active</Badge>
                      ) : (
                        <Badge color="red">Inactive</Badge>
                      )}
                    </TD>
                    <TD className="text-xs">{formatDate(u.createdAt)}</TD>
                    <TD>
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/admin/salesmen/${u._id}`}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {u.isActive ? (
                          <button
                            onClick={() =>
                              toggleActiveMut.mutate({ id: u._id, activate: false })
                            }
                            className="p-1.5 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                            aria-label="Deactivate"
                            title="Deactivate"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              toggleActiveMut.mutate({ id: u._id, activate: true })
                            }
                            className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                            aria-label="Activate"
                            title="Activate"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDelete(u)}
                          className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TD>
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

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="New Salesman"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={createMut.isPending}>
              Cancel
            </Button>
            <Button onClick={onSubmit} loading={createMut.isPending}>
              Create
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={onChange}
            error={errors.name}
            required
          />
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            error={errors.phone}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            error={errors.email}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            error={errors.password}
            helper="At least 6 characters"
            required
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMut.mutate(confirmDelete._id)}
        title="Delete salesman?"
        message={`This will permanently delete ${confirmDelete?.name}. This cannot be undone.`}
        loading={deleteMut.isPending}
      />
    </div>
  );
};

export default Salesmen;