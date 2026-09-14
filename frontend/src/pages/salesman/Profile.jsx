import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Mail, Phone, Calendar, KeyRound } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();

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

      <Card>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Contact your administrator if you need to update your name, phone, or email.
        </p>
      </Card>
    </div>
  );
};

export default Profile;