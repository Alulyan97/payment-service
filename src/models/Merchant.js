const mongoose = require("mongoose");

const MerchantSchema = new mongoose.Schema({
    shopId: { type: String, required: true, unique: true },
    apiSecret: { type: String, required: true },
    commissionRate: { type: Number, default: 2.5 }
});

module.exports = mongoose.model('Merchant', MerchantSchema );