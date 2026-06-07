const mongoose = require("mongoose");

const MerchantSchema = new mongoose.Schema({
    merchantId: { type: String, required: true, unique: true },
    secretKey: { type: String, required: true },
    feePercent: { type: Number, default: 2.5 }
});

module.exports = mongoose.model('Merchant', MerchantSchema);