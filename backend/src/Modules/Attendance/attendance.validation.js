const Joi = require('joi');
const { ATTENDANCE_STATUS } = require('./attendance.model');

const objectId = Joi.string().hex().length(24).message('Invalid id');

const markAttendanceSchema = Joi.object({
  date: Joi.date().iso().optional(),
  status: Joi.string()
    .valid(...ATTENDANCE_STATUS)
    .required(),
  notes: Joi.string().trim().max(200).allow('').optional(),
});

const updateAttendanceSchema = Joi.object({
  status: Joi.string()
    .valid(...ATTENDANCE_STATUS)
    .optional(),
  notes: Joi.string().trim().max(200).allow('').optional(),
  date: Joi.date().iso().optional(),
})
  .min(1)
  .messages({ 'object.min': 'At least one field must be provided' });

const idParam = Joi.object({ id: objectId.required() });

const listQuery = Joi.object({
  salesmanId: objectId.optional(),
  status: Joi.string().valid(...ATTENDANCE_STATUS).optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2000).max(3000).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

const myAttendanceQuery = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2000).max(3000).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

const dailyQuery = Joi.object({
  date: Joi.date().iso().optional(),
});

const monthlyQuery = Joi.object({
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2000).max(3000).optional(),
});

module.exports = {
  markAttendance: { body: markAttendanceSchema },
  updateAttendance: { body: updateAttendanceSchema, params: idParam },
  idParam: { params: idParam },
  listQuery: { query: listQuery },
  myAttendanceQuery: { query: myAttendanceQuery },
  dailyQuery: { query: dailyQuery },
  monthlyQuery: { query: monthlyQuery },
};