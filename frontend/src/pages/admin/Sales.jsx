import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listSales, createSale, updateSale, deleteSale } from '../../api/sales';
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
      quantity: s.quantity ?? '',
      date: s.date ? new Date(s.date).toISOString().slice(0, 10) : '',
      notes: s.notes || '',
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
                  <TH>Product</TH>
                  <TH>Quantity</TH>
                  <TH className="text-right">Amount</TH>
                  <TH>Date</TH>
                  <TH className="text-right">Actions</TH>
                </tr>
              </THead>
              <TBody>
                {items.map((s) => (
                  <TR key={s._id}>
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-semibold">
                          {s.salesman?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{s.salesman?.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{s.salesman?.email}</p>
                        </div>
                      </div>
                    </TD>
                    <TD>{s.productName || '—'}</TD>
                    <TD>{s.quantity ?? '—'}</TD>
                    <TD className="text-right font-semibold text-slate-800 dark:text-slate-100">
                      {formatCurrency(s.amount)}
                    </TD>
                    <TD>{formatDate(s.date || s.createdAt)}</TD>
                    <TD>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                          aria-label="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(s)}
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
        title={editing ? 'Edit Sale' : 'New Sale'}
        size="md"
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
              min="0"
              step="1"
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
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMut.mutate(confirmDelete._id)}
        title="Delete sale?"
        message="This action cannot be undone."
        loading={deleteMut.isPending}
      />
    </div>
  );
};

export default Sales;