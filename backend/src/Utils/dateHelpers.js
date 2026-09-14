/**
 * Date helpers for daily / weekly / monthly report filters.
 * All ranges are based on local server time.
 */

const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfWeek = (date = new Date()) => {
  // Monday as week start
  const d = startOfDay(date);
  const day = d.getDay(); // 0=Sun ... 6=Sat
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  d.setDate(d.getDate() + diff);
  return d;
};

const endOfWeek = (date = new Date()) => {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const startOfMonth = (date = new Date()) => {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
};

const endOfMonth = (date = new Date()) => {
  const d = startOfDay(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Build a date range based on a `range` query: daily | weekly | monthly | custom.
 * Supports `startDate` and `endDate` for custom.
 */
const buildDateRange = ({ range, startDate, endDate, date }) => {
  const reference = date ? new Date(date) : new Date();

  switch (range) {
    case 'daily':
      return { from: startOfDay(reference), to: endOfDay(reference) };
    case 'weekly':
      return { from: startOfWeek(reference), to: endOfWeek(reference) };
    case 'monthly':
      return { from: startOfMonth(reference), to: endOfMonth(reference) };
    case 'custom': {
      const from = startDate ? startOfDay(new Date(startDate)) : startOfMonth(reference);
      const to = endDate ? endOfDay(new Date(endDate)) : endOfDay(reference);
      return { from, to };
    }
    default:
      return null;
  }
};

module.exports = {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  buildDateRange,
};