export const Table = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
      <table className="w-full text-sm text-left">
        {children}
      </table>
    </div>
  );
};

export const THead = ({ children }) => (
  <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
    {children}
  </thead>
);

export const TBody = ({ children }) => (
  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">{children}</tbody>
);

export const TR = ({ children, onClick, className = '' }) => (
  <tr
    onClick={onClick}
    className={`${onClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50' : ''} transition-colors ${className}`}
  >
    {children}
  </tr>
);

export const TH = ({ children, className = '' }) => (
  <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>
);

export const TD = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-slate-700 dark:text-slate-300 ${className}`}>{children}</td>
);
