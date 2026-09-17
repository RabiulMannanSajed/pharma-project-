const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    salesman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Salesman reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Sale amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Sale date is required'],
      default: Date.now,
    },
    productName: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      min: 0,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Single-field indexes for admin-wide date-range queries.
saleSchema.index({ date: 1 });
// Compound index for the most common query: a salesman's sales within a date range.
saleSchema.index({ salesman: 1, date: -1 });

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
