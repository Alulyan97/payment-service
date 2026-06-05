const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
    invoiceId: { type: String, required: true, unique: true },
    merchantId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'RUB' },
    fee: { type: Number, required: true },
    amountToReceive: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'paid', 'failed'], 
        default: 'pending' 
    },
    paidAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);