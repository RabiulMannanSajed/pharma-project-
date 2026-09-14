import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { markAttendance, myAttendance, updateAttendance, deleteAttendance } from '../../api/attendance';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { CheckCircle2, XCircle, Clock, Plus, Edit2, Trash2 } from 'lucide-react';
import { formatDate, todayISO } from '../../utils/formatters';
import { validateAttendance } from '../../utils/validators';
import { ATTENDANCE_STATUS_OPTIONS } from '../../utils/constants';
import toast from 'react-hot-toast';

const statusColor = (s) => {
  const opt = ATTENDANCE_STATUS_OPTIONS.find((o) => o.value === s);
  return opt ? opt.color : 'bg-slate-100 text-slate-700';
};

const Attendance = () => {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ status: '', date: todayISO(), notes: '' });
  const [errors, setErrors] = useState({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', 'my', { page }],
    queryFn: () => myAttendance({ page, limit: 30 }),
  });

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;

  const todayMarked = items.find((a) => {
    const ad = a.date ? new Date(a.date).toISOString().slice(0, 10) : '';
    return ad === todayISO();
  });

  const markMut = useMutation({
    mutationFn: markAttendance,
    onSuccess: () => {
      toast.success('Attendance marked');
      qc.invalidateQueries({ queryKey: ['attendance'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      closeModal();
    },
    onError: (e) => toast.error(e?.message || 'Failed to mark attendance'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateAttendance(id, payload),
    onSuccess: () => {
      toast.success('Attendance updated');
      qc.invalidateQueries({ queryKey: ['attendance'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      closeModal();
    },
    onError: (e) => toast.error(e?.message || 'Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAttendance,
    onSuccess: () => {
      toast.success('Attendance deleted');
      qc.invalidateQueries({ queryKey: ['attendance'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setConfirmDelete(null);
    },
    onError: (e) => toast.error(e?.message || 'Failed to delete'),
  });

  const openMark = () => {
    setEditing(null);
    setForm({ status: '', date: todayISO(), notes: '' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      status: a.status || '',
      date: a.date ? new Date(a.date).toISOString().slice(0, 10) : '',
      notes: a.notes || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm({ status: '', date: todayISO(), notes: '' });
    setErrors({});
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = validateAttendance(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = {
      status: form.status,
      date: form.date ? new Date(form.date).toISOString() : undefined,
      notes: form.notes || undefined,
    };
    if (editing) {
      updateMut.mutate({ id: editing._id, payload });
    } else {
      markMut.mutate(payload);
    }
  };

  const saving = markMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Attendance</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mark and view your attendance history
          </p>
        </div>
        {!todayMarked && (
          <Button icon={Plus} onClick={openMark}>
            Mark Today's Attendance
          </Button>
        )}
      </div>

      {todayMarked && (
        <Card className="!bg-emerald-50 dark:!bg-emerald-900/20 !border-emerald-200 dark:!border-emerald-700">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                Today's attendance is marked as {todayMarked.status}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                You can only mark once per day
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card padding="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No attendance records"
            description="Mark your first attendance"
            action={
              <Button icon={Plus} onClick={openMark}>
                Mark Attendance
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH>Status</TH>
                  <TH>Notes</TH>
                  <TH className="text-right">Actions</TH>
                </tr>
              </THead>
              <TBody>
                {items.map((a) => (
                  <TR key={a._id}>
                    <TD>{formatDate(a.date)}</TD>
                    <TD>
                      <span className={`badge ${statusColor(a.status)}`}>{a.status}</span>
                    </TD>
                    <TD className="max-w-xs truncate" title={a.notes}>
                      {a.notes || '—'}
                    </TD>
                    <TD>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                          aria-label="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(a)}
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
        title={editing ? 'Edit Attendance' : "Mark Today's Attendance"}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={onSubmit} loading={saving}>
              {editing ? 'Update' : 'Mark'}
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={onChange}
            error={errors.status}
            required
          >
            <option value="">Select status</option>
            {ATTENDANCE_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Input
            label="Date"
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
            maxLength={200}
            placeholder="Any additional notes…"
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMut.mutate(confirmDelete._id)}
        title="Delete attendance?"
        message="This action cannot be undone."
        loading={deleteMut.isPending}
      />
    </div>
  );
};

export default Attendance;