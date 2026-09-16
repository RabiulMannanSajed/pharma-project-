// Bangladeshi Taka (Tk) formatter. en-IN grouping for lakh-style numbers (1,00,000).
export const formatCurrency = (amount) => {
  const n = Number(amount || 0);
  try {
    const grouped = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
    return `Tk ${grouped}`;
  } catch {
    return `Tk ${n.toFixed(2)}`;
  }
};

// Compact variant — no decimals, for small dashboard cards
export const formatCurrencyCompact = (amount) => {
  const n = Number(amount || 0);
  try {
    const grouped = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
    return `Tk ${grouped}`;
  } catch {
    return `Tk ${Math.round(n)}`;
  }
};

export const formatNumber = (n) =>
  new Intl.NumberFormat('en-IN').format(Number(n || 0));

export const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
};

export const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

export const todayISO = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

export const initials = (name = '') => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
};
