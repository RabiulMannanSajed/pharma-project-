import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { updateMe } from '../../api/auth';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Mail, Phone, Calendar, KeyRound } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { isEmail, isPhone } from '../../utils/validators';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
    });
  }, [user]);

  const updateMut = useMutation({
    mutationFn: updateMe,
    onSuccess: (data) => {
      const fresh = data?.data || data;
      updateProfile(fresh);
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Profile updated');
    },
    onError: (e) => toast.error(e?.message || 'Failed to update'),
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.phone) errs.phone = 'Phone is required';
    else if (!isPhone(form.phone)) errs.phone = 'Invalid phone';
    if (!form.email || !isEmail(form.email)) errs.email = 'Invalid email';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    updateMut.mutate({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your account details</p>
      </div>

      <Card>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{user?.name}</h3>
              <Badge color="brand">{user?.role}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {user?.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {user?.phone}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Joined {formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Edit Details">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input label="Name" name="name" value={form.name} onChange={onChange} error={errors.name} />
          <Input label="Phone" name="phone" value={form.phone} onChange={onChange} error={errors.phone} />
          <Input label="Email" type="email" name="email" value={form.email} onChange={onChange} error={errors.email} />
          <div className="flex justify-end">
            <Button type="submit" loading={updateMut.isPending}>Save</Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Password</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Change your account password</p>
            </div>
          </div>
          <Link to="/change-password">
            <Button variant="secondary">Change Password</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
