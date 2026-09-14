import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { changePassword } from '../../api/auth';
import { validateChangePassword } from '../../utils/validators';
import { KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validateChangePassword(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully');
      navigate(-1);
    } catch (err) {
      toast.error(err?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Change Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Update your account password</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={onChange}
            error={errors.currentPassword}
            required
          />
          <Input
            label="New Password"
            type="password"
            name="newPassword"
            autoComplete="new-password"
            helper="At least 6 characters"
            value={form.newPassword}
            onChange={onChange}
            error={errors.newPassword}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={onChange}
            error={errors.confirmPassword}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Change Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword;