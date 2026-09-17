const Sale = require('./sale.model');
const mongoose = require('mongoose');
const ApiError = require('../../Utils/ApiError');
const { buildDateRange, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } =
  require('../../Utils/dateHelpers');

/**
 * Create a new sale.
 * - Salesmen: the sale is always attached to themselves (salesmanId in body, if any, is ignored).
 * - Admins: they may pass `salesmanId` in the body to attribute the sale to a specific
 *   salesman; otherwise it is attributed to the admin themselves.
 */
const createSale = async (reqUser, payload) => {
  let salesmanId;
  if (reqUser.role === 'admin') {
    salesmanId = payload.salesmanId || reqUser._id.toString();
  } else {
    // Salesman can only create sales for themselves; ignore any salesmanId they pass.
    salesmanId = reqUser._id.toString();
  }

  // Strip any extra fields so unknown keys never sneak into Mongo.
  const sale = await Sale.create({
    amount: payload.amount,
    productName: payload.productName,
    quantity: payload.quantity,
    notes: payload.notes,
    salesman: salesmanId,
    date: payload.date ? new Date(payload.date) : new Date(),
  });
  return sale;
};

/**
 * Admin: list all sales; Salesman: list only their own.
 * Filters: salesmanId (admin only), from/to date, pagination.
 */
const listSales = async (reqUser, { salesmanId, from, to, page = 1, limit = 20 }) => {
  const query = {};
  if (reqUser.role === 'salesman') {
    query.salesman = reqUser._id;
  } else if (salesmanId) {
    query.salesman = salesmanId;
  }

  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Sale.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('salesman', 'name email phone'),
    Sale.countDocuments(query),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

/**
 * Salesman: list my own sales.
 */
const mySales = async (userId, { from, to, page = 1, limit = 20 }) => {
  const query = { salesman: userId };
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Sale.find(query).sort({ date: -1 }).skip(skip).limit(limit),
    Sale.countDocuments(query),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

/**
 * Salesman can update only own sale. Admin can update any.
 */
const updateSale = async (reqUser, saleId, updates) => {
  const sale = await Sale.findById(saleId);
  if (!sale) throw new ApiError(404, 'Sale not found');

  if (reqUser.role !== 'admin' && sale.salesman.toString() !== reqUser._id.toString()) {
    throw new ApiError(403, 'You can only modify your own sales');
  }

  Object.assign(sale, updates);
  if (updates.date) sale.date = new Date(updates.date);
  await sale.save();
  return sale;
};

/**
 * Salesman can delete only own sale. Admin can delete any.
 */
const deleteSale = async (reqUser, saleId) => {
  const sale = await Sale.findById(saleId);
  if (!sale) throw new ApiError(404, 'Sale not found');

  if (reqUser.role !== 'admin' && sale.salesman.toString() !== reqUser._id.toString()) {
    throw new ApiError(403, 'You can only delete your own sales');
  }

  await sale.deleteOne();
  return true;
};

/**
 * Compute totals for a salesman or all salesmen within a date range.
 */
const summarizeRange = async (reqUser, range) => {
  const { from, to } = range;
  const baseMatch = { date: { $gte: from, $lte: to } };
  const salesmanMatch =
    reqUser.role === 'salesman' ? { ...baseMatch, salesman: reqUser._id } : baseMatch;

  const [overall, bySalesman, topSalesmen] = await Promise.all([
    Sale.aggregate([
      { $match: salesmanMatch },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalSales: { $sum: 1 } } },
    ]),
    Sale.aggregate([
      { $match: salesmanMatch },
      {
        $group: {
          _id: '$salesman',
          totalAmount: { $sum: '$amount' },
          totalSales: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'salesman',
        },
      },
      { $unwind: '$salesman' },
      {
        $project: {
          _id: 0,
          salesman: { _id: '$salesman._id', name: '$salesman.name', email: '$salesman.email' },
          totalAmount: 1,
          totalSales: 1,
        },
      },
    ]),
    reqUser.role === 'admin'
      ? Sale.aggregate([
          { $match: baseMatch },
          { $group: { _id: '$salesman', totalAmount: { $sum: '$amount' } } },
          { $sort: { totalAmount: -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'salesman',
            },
          },
          { $unwind: '$salesman' },
          {
            $project: {
              _id: 0,
              salesman: { _id: '$salesman._id', name: '$salesman.name' },
              totalAmount: 1,
            },
          },
        ])
      : Promise.resolve([]),
  ]);

  return {
    from,
    to,
    totalAmount: overall[0]?.totalAmount || 0,
    totalSales: overall[0]?.totalSales || 0,
    bySalesman,
    topSalesman: topSalesmen[0] || null,
  };
};

const dailyReport = (reqUser, date) =>
  summarizeRange(reqUser, { from: startOfDay(date), to: endOfDay(date) });

const weeklyReport = (reqUser, date) =>
  summarizeRange(reqUser, { from: startOfWeek(date), to: endOfWeek(date) });

const monthlyReport = (reqUser, date) =>
  summarizeRange(reqUser, { from: startOfMonth(date), to: endOfMonth(date) });

/**
 * Custom report: range (daily/weekly/monthly/custom) + optional salesmanId.
 */
const customReport = async (reqUser, { range, startDate, endDate, salesmanId, date }) => {
  const built = buildDateRange({ range, startDate, endDate, date });
  if (!built) throw new ApiError(400, 'Invalid range. Use daily | weekly | monthly | custom');

  let result = await summarizeRange(reqUser, built);

  if (reqUser.role === 'admin' && salesmanId) {
    const match = {
      date: { $gte: built.from, $lte: built.to },
      salesman: new mongoose.Types.ObjectId(salesmanId),
    };
    const [agg] = await Sale.aggregate([
      { $match: match },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalSales: { $sum: 1 } } },
    ]);
    result = {
      ...result,
      totalAmount: agg?.totalAmount || 0,
      totalSales: agg?.totalSales || 0,
      bySalesman: result.bySalesman.filter((b) => b.salesman._id.toString() === salesmanId),
      topSalesman: agg
        ? {
            salesman: result.bySalesman.find((b) => b.salesman._id.toString() === salesmanId)?.salesman,
            totalAmount: agg.totalAmount,
          }
        : null,
    };
  }

  return { range, ...result };
};

/**
 * Per-day aggregated series (for charts).
 * Optional salesmanId is honored for admin requests; ignored (overridden by reqUser._id) for salesmen.
 */
const dailySeries = async (reqUser, { from, to, salesmanId }) => {
  const match = { date: { $gte: from, $lte: to } };
  if (reqUser.role === 'salesman') match.salesman = reqUser._id;
  else if (salesmanId) match.salesman = new mongoose.Types.ObjectId(salesmanId);

  const series = await Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalAmount: { $sum: '$amount' },
        totalSales: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', totalAmount: 1, totalSales: 1 } },
  ]);

  return series;
};

/**
 * Admin: per-salesman aggregate over an optional date range.
 */
const performanceBySalesman = async ({ from, to } = {}) => {
  const match = {};
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = new Date(to);
  }
  return Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$salesman',
        totalAmount: { $sum: '$amount' },
        totalSales: { $sum: 1 },
        lastSaleAt: { $max: '$date' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'salesman',
      },
    },
    { $unwind: '$salesman' },
    {
      $project: {
        _id: 0,
        salesman: {
          _id: '$salesman._id',
          name: '$salesman.name',
          email: '$salesman.email',
          isActive: '$salesman.isActive',
        },
        totalAmount: 1,
        totalSales: 1,
        lastSaleAt: 1,
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);
};

module.exports = {
  createSale,
  listSales,
  mySales,
  updateSale,
  deleteSale,
  dailyReport,
  weeklyReport,
  monthlyReport,
  customReport,
  dailySeries,
  performanceBySalesman,
};
