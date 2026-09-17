const Joi = require('joi');

const objectId = Joi.string().hex().length(24).message('Invalid id');

const createSaleSchema = Joi.object({
  amount: Joi.number().greater(0).required(),
  salesmanId: objectId.optional(),
  date: Joi.date().iso().optional(),
  productName: Joi.string().trim().max(120).allow('').optional(),
  quantity: Joi.number().integer().min(0).allow(null).optional(),
  notes: Joi.string().trim().max(500).allow('').optional(),
});

const updateSaleSchema = Joi.object({
  amount: Joi.number().greater(0).optional(),
  date: Joi.date().iso().optional(),
  productName: Joi.string().trim().max(120).allow('').optional(),
  quantity: Joi.number().integer().min(0).allow(null).optional(),
  notes: Joi.string().trim().max(500).allow('').optional(),
})
  .min(1)
  .messages({ 'object.min': 'At least one field must be provided' });

const idParam = Joi.object({ id: objectId.required() });

const listQuery = Joi.object({
  salesmanId: objectId.optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const rangeQuery = Joi.object({
  range: Joi.string().valid('daily', 'weekly', 'monthly', 'custom').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  date: Joi.date().iso().optional(),
});

const customReportQuery = Joi.object({
  range: Joi.string().valid('daily', 'weekly', 'monthly', 'custom').default('custom'),
  startDate: Joi.date().iso().when('range', {
    is: 'custom',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  endDate: Joi.date().iso().when('range', {
    is: 'custom',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  salesmanId: objectId.optional(),
});

const dailySeriesQuery = Joi.object({
  from: Joi.date().iso().required(),
  to: Joi.date().iso().required(),
  salesmanId: objectId.optional(),
});

module.exports = {
  createSale: { body: createSaleSchema },
  updateSale: { body: updateSaleSchema, params: idParam },
  idParam: { params: idParam },
  listQuery: { query: listQuery },
  rangeQuery: { query: rangeQuery },
  customReportQuery: { query: customReportQuery },
  dailySeriesQuery: { query: dailySeriesQuery },
};
