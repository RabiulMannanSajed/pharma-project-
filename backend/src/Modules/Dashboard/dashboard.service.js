/**
 * Dashboard aggregator: combines sales + attendance + user data
 * for the admin overview and salesman's personal dashboard.
 */
const mongoose = require('mongoose');
const Sale = require('../Sales/sale.model');
const Attendance = require('../Attendance/attendance.model');
const User = require('../Users/user.model');
const {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} = require('../../Utils/dateHelpers');

const sumAgg = async (match) => {
  const [res] = await Sale.aggregate([
    { $match: match },
    { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalSales: { $sum: 1 } } },
  ]);
  return res || { totalAmount: 0, totalSales: 0 };
};

const attendanceAgg = async (match) => {
  const res = await Attendance.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const counts = { Present: 0, Absent: 0, Late: 0 };
  for (const c of res) counts[c._id] = c.count;
  return counts;
};

const dailySalesSeries = async (from, to) => {
  return Sale.aggregate([
    { $match: { date: { $gte: from, $lte: to } } },
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
};

/**
 * Admin dashboard summary.
 */
const adminDashboard = async () => {
  const now = new Date();
  const today = { from: startOfDay(now), to: endOfDay(now) };
  const week = { from: startOfWeek(now), to: endOfWeek(now) };
  const month = { from: startOfMonth(now), to: endOfMonth(now) };

  const [
    todayAgg,
    weekAgg,
    monthAgg,
    todayAttendance,
    totalSalesmen,
    activeSalesmen,
    topMonth,
    recentSales,
    salesChart,
    attendanceChart,
    monthlyPerformance,
  ] = await Promise.all([
    sumAgg({ date: { $gte: today.from, $lte: today.to } }),
    sumAgg({ date: { $gte: week.from, $lte: week.to } }),
    sumAgg({ date: { $gte: month.from, $lte: month.to } }),
    attendanceAgg({ date: { $gte: today.from, $lte: today.to } }),
    User.countDocuments({ role: 'salesman' }),
    User.countDocuments({ role: 'salesman', isActive: true }),
    Sale.aggregate([
      { $match: { date: { $gte: month.from, $lte: month.to } } },
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
    ]),
    Sale.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('salesman', 'name email'),
    dailySalesSeries(week.from, week.to),
    Promise.resolve(null), // placeholder so the tuple stays aligned
    Sale.aggregate([
      { $match: { date: { $gte: month.from, $lte: month.to } } },
      { $group: { _id: '$salesman', totalAmount: { $sum: '$amount' } } },
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
      { $sort: { totalAmount: -1 } },
    ]),
  ]);

  return {
    summary: {
      totalSalesToday: todayAgg.totalAmount,
      totalSalesThisWeek: weekAgg.totalAmount,
      totalSalesThisMonth: monthAgg.totalAmount,
      numberOfSalesToday: todayAgg.totalSales,
      totalSalesmen,
      activeSalesmen,
      presentToday: todayAttendance.Present,
      absentToday: todayAttendance.Absent,
      lateToday: todayAttendance.Late,
      topSalesman: topMonth[0] || null,
    },
    charts: {
      dailySalesThisWeek: salesChart,
      attendanceToday: todayAttendance,
      monthlySalesPerformance: monthlyPerformance,
    },
    recentSales,
  };
};

/**
 * Salesman personal dashboard.
 */
const salesmanDashboard = async (userId) => {
  // Coerce to ObjectId so aggregation $match against `salesman: ObjectId` works.
  const oid = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const today = { from: startOfDay(now), to: endOfDay(now) };
  const week = { from: startOfWeek(now), to: endOfWeek(now) };
  const month = { from: startOfMonth(now), to: endOfMonth(now) };

  const [todayAgg, weekAgg, monthAgg, todayAttendance, allTimeAgg, bestDayAgg] =
    await Promise.all([
      sumAgg({ salesman: oid, date: { $gte: today.from, $lte: today.to } }),
      sumAgg({ salesman: oid, date: { $gte: week.from, $lte: week.to } }),
      sumAgg({ salesman: oid, date: { $gte: month.from, $lte: month.to } }),
      Attendance.findOne({
        salesman: oid,
        date: { $gte: today.from, $lte: today.to },
      }),
      sumAgg({ salesman: oid }),
      Sale.aggregate([
        { $match: { salesman: oid } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, totalAmount: { $sum: '$amount' } } },
        { $sort: { totalAmount: -1 } },
        { $limit: 1 },
      ]),
    ]);

  const daysWithSales = await Sale.distinct('date', { salesman: oid });
  const days = daysWithSales.length;
  const avgDaily = days ? allTimeAgg.totalAmount / days : 0;

  // Attendance percentage for the current month
  const monthRecords = await Attendance.countDocuments({
    salesman: oid,
    date: { $gte: month.from, $lte: month.to },
  });
  const monthDays = month.to.getDate();
  const attendancePercentage = monthDays ? Math.round((monthRecords / monthDays) * 100) : 0;

  return {
    today: {
      totalSales: todayAgg.totalAmount,
      numberOfSales: todayAgg.totalSales,
      attendanceStatus: todayAttendance ? todayAttendance.status : 'Not Marked',
    },
    week: {
      totalSales: weekAgg.totalAmount,
      numberOfSales: weekAgg.totalSales,
    },
    month: {
      totalSales: monthAgg.totalAmount,
      numberOfSales: monthAgg.totalSales,
    },
    stats: {
      totalSales: allTimeAgg.totalAmount,
      totalNumberOfSales: allTimeAgg.totalSales,
      averageDailySales: Math.round(avgDaily * 100) / 100,
      bestSalesDay: bestDayAgg[0] || null,
      attendancePercentage,
    },
  };
};

module.exports = { adminDashboard, salesmanDashboard };