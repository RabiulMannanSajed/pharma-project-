import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Info } from 'lucide-react';

const Settings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customize your experience</p>
      </div>

      <Card title="Appearance">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Theme</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={theme === 'light' ? 'primary' : 'secondary'}
              icon={Sun}
              onClick={() => setTheme('light')}
              size="sm"
            >
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'primary' : 'secondary'}
              icon={Moon}
              onClick={() => setTheme('dark')}
              size="sm"
            >
              Dark
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">About</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pharmacy Sales Management System v1.0.0 — built with React, Vite, Tailwind,
              and PWA support.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;