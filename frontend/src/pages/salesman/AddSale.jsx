import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSale } from '../../api/sales';
import { Card } from '../../components/ui/Card';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { validateSale } from '../../utils/validators';
import { DollarSign, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const AddSale = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    amount: '',
    productName: '',
    quantity: '',
    date: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const createMut = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      toast.success('Sale recorded successfully');
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/salesman/my-sales');
    },
    onError: (e) => toast.error(e?.message || 'Failed to create sale'),
  });

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
    createMut.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add Sale</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Record a new sale entry</p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Sale Amount"
            type="number"
            step="0.01"
            min="0"
            name="amount"
            value={form.amount}
            onChange={onChange}
            error={errors.amount}
            placeholder="0.00"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            placeholder="Any additional notes…"
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <Button variant="secondary" type="button" onClick={() => navigate(-1)} disabled={createMut.isPending}>
              Cancel
            </Button>
            <Button type="submit" icon={Save} loading={createMut.isPending}>
              Save Sale
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddSale;