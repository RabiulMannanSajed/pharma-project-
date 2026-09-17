import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listSales, createSale, updateSale, deleteSale } from '../../api/sales';
import { listUsers } from '../../api/users';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Plus, Edit2, Trash2, ShoppingCart } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { validateSale } from '../../utils/validators';
import toast from 'react-hot-toast';

const emptyForm = {
  amount: '',
  productName: '',
  quantity: '',
  date: '',
  notes: '',
  salesmanId: '',
};

const Sales = () => {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['sales', { page }],
    queryFn: () => listSales({ page, limit: 20 }),
  });

  // Salesman picker for the create/edit form (admins attribute sales to salesmen).
  const { data: salesmenData } = useQuery({
    queryKey: ['salesmen-for-sales'],
    queryFn: () => listUsers({ page: 1, limit: 100, role: 'salesman' }),
    staleTime: 60_000,
  });
  const salesmen = (salesmenData?.items || []).filter((u) => u.isActive);
  const salesmanOptions = [
    { value: '', label: '— Self (admin) —' },
    ...salesmen.map((s) => ({ value: s._id, label: s.name })),
  ];

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;

  const createMut = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      toast.success('Sale created');
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      closeModal();
    },
    onError: (e) => toast.error(e?.message || 'Failed to create'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateSale(id, payload),
    onSuccess: () => {
      toast.success('Sale updated');
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      closeModal();
    },
    onError: (e) => toast.error(e?.message || 'Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteSale,
    onSuccess: () => {
      toast.success('Sale deleted');
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setConfirmDelete(null);
    },
    onError: (e) => toast.error(e?.message || 'Failed to delete'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      amount: String(s.amount ?? ''),
      productName: s.productName || '',
      quantity: s.quantity != null ? String(s.quantity) : '',
      date: s.date ? new Date(s.date).toISOString().slice(0, 10) : '',
      notes: s.notes || '',
      salesmanId: s.salesman?._id || s.salesman || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
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
    const errs = validateSale(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = {
      amount: Number(form.amount),
      productName: form.productName || undefined,
      quantity: form.quantity === '' ? undefined : Number(form.quantity),
      date: form.date || undefined,
      notes: form.notes || undefined,
      salesmanId: form.salesmanId || undefined,
    };
    if (editing) {
      updateMut.mutate({ id: editing._id, payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">All Sales</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View, create, and manage all sales records
          </p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          New Sale
        </Button>
      </div>

      <Card padding="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No sales yet"
            description="Create your first sale to get started"
            action={
              <Button icon={Plus} onClick={openCreate}>
                New Sale
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>Salesman</TH>
                  <TH>Amount</TH>
                  <TH>Product</TH>
                  <TH>Qty</TH>
                  <TH>Date</TH>
                  <TH>Notes</TH>
                  <TH className="text-right">Actions</TH>
                </tr>
              </THead>
              <TBody>
                {items.map((s) => (
                  <TR key={s._id}>
                    <TD>
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                        {s.salesman?.name || '—'}
                      </div>
                    </TD>
                    <TD>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(s.amount)}
                      </span>
                    </TD>
                    <TD>{s.productName || '—'}</TD>
                    <TD>{s.quantity ?? '—'}</TD>
                    <TD>{formatDate(s.date)}</TD>
                    <TD className="max-w-xs truncate">{s.notes || '—'}</TD>
                    <TD className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-700 dark:hover:text-emerald-400"
                          aria-label="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(s)}
                          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-700 dark:hover:text-rose-400"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            {totalPages > 1 && (
              <div className="border-t border-slate-200 p-3 dark:border-slate-700">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Sale' : 'New Sale'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={onSubmit} loading={saving}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            name="amount"
            value={form.amount}
            onChange={onChange}
            error={errors.amount}
            required
          />
          <Select
            label="Salesman"
            name="salesmanId"
            value={form.salesmanId}
            onChange={onChange}
            options={salesmanOptions}
            help="Optional. Leave blank to attribute this sale to yourself (admin)."
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Product Name (optional)"
              name="productName"
              value={form.productName}
              onChange={onChange}
              maxLength={120}
              placeholder="e.g. Paracetamol 500mg"
            />
            <Input
              label="Quantity (optional)"
              type="number"
              step="1"
              min="0"
              name="quantity"
              value={form.quantity}
              onChange={onChange}
              error={errors.quantity}
            />
          </div>
          <Input
            label="Date (optional)"
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
            help="Leave blank for today."
          />
          <Textarea
            label="Notes (optional)"
            name="notes"
            value={form.notes}
            onChange={onChange}
            maxLength={500}
            rows={3}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete sale?"
        message={
          confirmDelete
            ? `This sale of ${formatCurrency(confirmDelete.amount)} will be permanently removed.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteMut.mutate(confirmDelete._id)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Sales;
