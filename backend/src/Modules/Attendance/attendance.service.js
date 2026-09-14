const Attendance = require('./attendance.model');
const User = require('../Users/user.model');
const ApiError = require('../../Utils/ApiError');
const {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
} = require('../../Utils/dateHelpers');

/**
 * Mark attendance for the logged-in salesman.
 * Prevents duplicates for the same day (one record per salesman per date).
 */
const markAttendance = async (userId, { date, status, notes }) => {
  const target = date ? new Date(date) : new Date();
  const dayStart = startOfDay(target);
  const dayEnd = endOfDay(target);

  const existing = await Attendance.findOne({
    salesman: userId,
    date: { $gte: dayStart, $lte: dayEnd },
  });

  if (existing) {
    throw new ApiError(
      409,
      'Attendance already marked for this day. Use PATCH to update it.'
    );
  }

  const record = await Attendance.create({
    salesman: userId,
    date: dayStart,
    status,
    notes,
  });
  return record;
};

/**
 * Admin: list attendance with filters. Salesman: their own.
 */
const listAttendance = async (reqUser, query) => {
  const {
    salesmanId,
    status,
    from,
    to,
    month,
    year,
    page = 1,
    limit = 50,
  } = query;

  const filter = {};
  if (reqUser.role === 'salesman') {
    filter.salesman = reqUser._id;
  } else if (salesmanId) {
    filter.salesman = salesmanId;
  }

  if (status) filter.status = status;

  // Date filtering: month/year takes precedence; else use from/to.
  if (month && year) {
    const start = startOfMonth(new Date(year, month - 1, 1));
    const end = endOfMonth(new Date(year, month - 1, 1));
    filter.date = { $gte: start, $lte: end };
  } else if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Attendance.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('salesman', 'name email phone'),
    Attendance.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

/**
 * Salesman: list my own attendance.
 */
const myAttendance = async (userId, query) => {
  const filter = { salesman: userId };
  const { from, to, month, year } = query;

  if (month && year) {
    const start = startOfMonth(new Date(year, month - 1, 1));
    const end = endOfMonth(new Date(year, month - 1, 1));
    filter.date = { $gte: start, $lte: end };
  } else if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const page = query.page || 1;
  const limit = query.limit || 50;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    Attendance.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

/**
 * Admin: daily attendance summary for a given date (default = today).
 */
const dailySummary = async (reqUser, date) => {
  const day = date ? new Date(date) : new Date();
  const from = startOfDay(day);
  const to = endOfDay(day);

  const filter = { date: { $gte: from, $lte: to } };

  const [records, countsAgg, salesmen] = await Promise.all([
    Attendance.find(filter).populate('salesman', 'name email'),
    Attendance.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    User.countDocuments({ role: 'salesman', isActive: true }),
  ]);

  const counts = { Present: 0, Absent: 0, Late: 0 };
  for (const c of countsAgg) counts[c._id] = c.count;

  const markedSalesmanIds = new Set(records.map((r) => r.salesman?._id?.toString()));
  const absentSalesmen = await User.find({
    role: 'salesman',
    isActive: true,
    _id: { $nin: [...markedSalesmanIds] },
  }).select('name email phone');

  return {
    date: from,
    counts,
    totalSalesmen: salesmen,
    records,
    unmarkedSalesmen: absentSalesmen,
  };
};

/**
 * Admin: monthly summary (counts + per-salesman breakdown).
 */
const monthlySummary = async (reqUser, { month, year }) => {
  const now = new Date();
  const m = month ? month - 1 : now.getMonth();
  const y = year || now.getFullYear();
  const from = startOfMonth(new Date(y, m, 1));
  const to = endOfMonth(new Date(y, m, 1));

  const [overall, bySalesman, salesmen] = await Promise.all([
    Attendance.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Attendance.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: { salesman: '$salesman', status: '$status' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.salesman',
          total: { $sum: '$count' },
          byStatus: { $push: { status: '$_id.status', count: '$count' } },
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
          salesman: { _id: '$salesman._id', name: '$salesman.name', email: '$salesman.email' },
          total: 1,
          byStatus: 1,
          attendancePercentage: {
            $multiply: [
              { $divide: ['$total', { $literal: to.getDate() }] },
              100,
            ],
          },
        },
      },
    ]),
    User.countDocuments({ role: 'salesman', isActive: true }),
  ]);

  const counts = { Present: 0, Absent: 0, Late: 0 };
  for (const c of overall) counts[c._id] = c.count;

  return {
    month: m + 1,
    year: y,
    counts,
    totalSalesmen: salesmen,
    bySalesman,
  };
};

/**
 * Salesman: personal monthly stats.
 */
const myMonthlyStats = async (userId, { month, year }) => {
  const now = new Date();
  const m = month ? month - 1 : now.getMonth();
  const y = year || now.getFullYear();
  const from = startOfMonth(new Date(y, m, 1));
  const to = endOfMonth(new Date(y, m, 1));

  const [countsAgg, total] = await Promise.all([
    Attendance.aggregate([
      { $match: { salesman: userId, date: { $gte: from, $lte: to } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Attendance.countDocuments({ salesman: userId, date: { $gte: from, $lte: to } }),
  ]);

  const counts = { Present: 0, Absent: 0, Late: 0 };
  for (const c of countsAgg) counts[c._id] = c.count;

  const daysInMonth = to.getDate();
  const attendancePercentage = daysInMonth ? Math.round((total / daysInMonth) * 100) : 0;

  return { month: m + 1, year: y, counts, total, attendancePercentage };
};

/**
 * Update attendance (admin or salesman updating own).
 */
const updateAttendance = async (reqUser, id, updates) => {
  const record = await Attendance.findById(id);
  if (!record) throw new ApiError(404, 'Attendance record not found');

  if (reqUser.role !== 'admin' && record.salesman.toString() !== reqUser._id.toString()) {
    throw new ApiError(403, 'You can only modify your own attendance');
  }

  if (updates.status) record.status = updates.status;
  if (updates.notes !== undefined) record.notes = updates.notes;
  if (updates.date) {
    record.date = startOfDay(new Date(updates.date));
  }
  await record.save();
  return record;
};

const deleteAttendance = async (reqUser, id) => {
  const record = await Attendance.findById(id);
  if (!record) throw new ApiError(404, 'Attendance record not found');

  if (reqUser.role !== 'admin' && record.salesman.toString() !== reqUser._id.toString()) {
    throw new ApiError(403, 'You can only delete your own attendance');
  }

  await record.deleteOne();
  return true;
};

module.exports = {
  markAttendance,
  listAttendance,
  myAttendance,
  dailySummary,
  monthlySummary,
  myMonthlyStats,
  updateAttendance,
  deleteAttendance,
};