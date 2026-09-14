import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-2 mt-4">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="btn-secondary !px-3 !py-1.5 text-sm disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <span className="text-sm text-slate-600 dark:text-slate-400">
        Page <strong className="text-slate-900 dark:text-slate-100">{page}</strong> of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="btn-secondary !px-3 !py-1.5 text-sm disabled:opacity-50"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};