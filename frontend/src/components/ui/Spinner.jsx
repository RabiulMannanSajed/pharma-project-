import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  };
  return (
    <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-brand-600 ${className}`} />
  );
};

export const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <Spinner size="lg" />
  </div>
);