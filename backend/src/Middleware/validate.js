const ApiError = require('../Utils/ApiError');

/**
 * Joi validation middleware factory.
 * Usage: validate(schema)  where schema has properties { body, query, params }.
 */
const validate = (schema) => (req, res, next) => {
  const errors = [];

  if (schema.body) {
    const { error, value } = schema.body.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) errors.push({ source: 'body', details: error.details });
    else req.body = value;
  }

  if (schema.query) {
    const { error, value } = schema.query.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) errors.push({ source: 'query', details: error.details });
    else req.query = value;
  }

  if (schema.params) {
    const { error, value } = schema.params.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) errors.push({ source: 'params', details: error.details });
    else req.params = value;
  }

  if (errors.length > 0) {
    const formatted = errors.flatMap((e) =>
      e.details.map((d) => ({
        source: e.source,
        message: d.message,
        path: d.path,
      }))
    );
    return next(new ApiError(400, 'Validation failed', formatted));
  }

  next();
};

module.exports = validate;