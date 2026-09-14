import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Pill, Moon, Sun, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateLogin } from '../utils/validators';
import { ROLES } from '../utils/constants';

const Login = () => {
  const { login, isAuthenticated, role, bootstrapping } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    const target = role === ROLES.ADMIN ? '/admin/dashboard' : '/salesman/dashboard';
    return <Navigate to={target} replace />;
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLogin(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name?.split(' ')[0] || ''}!`);
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        const target = user.role === ROLES.ADMIN ? '/admin/dashboard' : '/salesman/dashboard';
        navigate(target, { replace: true });
      }
    } catch (err) {
      toast.error(err?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-brand-50/40 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow-sm hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30 mb-4">
            <Pill className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Pharmacy Sales Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your account</p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              error={errors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              error={errors.password}
              required
            />

            <Button type="submit" loading={submitting} className="w-full" size="lg">
              {submitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-medium">Contact your administrator if you need access.</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Pharmacy Sales & Employee Management System
        </p>
      </div>
    </div>
  );
};

export default Login;