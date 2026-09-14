const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    salesman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Salesman reference is required'],
      index: true,
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
      index: true,
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

saleSchema.index({ salesman: 1, date: 1 });

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;