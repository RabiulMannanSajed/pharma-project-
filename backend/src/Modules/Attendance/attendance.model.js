const mongoose = require('mongoose');

const ATTENDANCE_STATUS = ['Present', 'Absent', 'Late'];

const attendanceSchema = new mongoose.Schema(
  {
    salesman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Salesman reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ATTENDANCE_STATUS,
        message: `Status must be one of: ${ATTENDANCE_STATUS.join(', ')}`,
      },
      required: [true, 'Attendance status is required'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 200,
    },
  },
  { timestamps: true }
);

// One attendance record per salesman per day.
attendanceSchema.index({ salesman: 1, date: -1 }, { unique: true });
// Admin-wide date-range scans.
attendanceSchema.index({ date: -1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
module.exports.ATTENDANCE_STATUS = ATTENDANCE_STATUS;
