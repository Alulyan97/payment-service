const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Bill = require("../models/Invoice");
const Vendor = require("../models/Merchant");
const getCommission = require("../utils/fee");
const webhook = require("../middleware/webhook");
const router = express.Router();

// POST /invoice
router.post("/invoice", async (req, res) => {
    try {
        const { amount, currency, merchantId } = req.body;
        
        if (!amount || !merchantId) {
            return res.status(400).json({ error: "требуется указать сумму и идентификатор товара" });
        }
        
        const vendor = await Vendor.findOne({ merchantId });
        if (!vendor) {
            return res.status(404).json({ error: "Мерчант не найден" });
        }
        
        const { fee, amountToReceive } = getCommission(amount, vendor.feePercent);
        
        const bill = new Bill({
            invoiceId: uuidv4(),
            merchantId,
            amount,
            currency: currency || "RUB",
            fee,
            amountToReceive,
            status: "pending"
        });
        
        await bill.save();
        
        res.status(201).json({
            invoiceId: bill.invoiceId,
            amount: bill.amount,
            fee: bill.fee,
            amountToReceive: bill.amountToReceive,
            status: bill.status
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Внутренняя ошибка" });
    }
});

// POST /webhook
router.post("/webhook", webhook, async (req, res) => {
    try {
        const { status } = req.body;
        const bill = req.invoice;
        
        if (status === "paid") {
            const result = await Bill.findOneAndUpdate(
                { invoiceId: bill.invoiceId, status: "pending" },
                { status: "paid", paidAt: new Date() },
                { new: true }
            );
            
            if (!result) {
                return res.status(200).json({ message: "Обработка завершена" });
            }
            
            return res.status(200).json({ message: "Платеж обработан" });
        }
        
        if (status === "failed") {
            await Bill.findOneAndUpdate(
                { invoiceId: bill.invoiceId, status: "pending" },
                { status: "failed" }
            );
            return res.status(200).json({ message: "failed processed" });
        }
        
        res.status(400).json({ error: "Invalid status" });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal error" });
    }
});

// GET /invoice/:id
router.get("/invoice/:id", async (req, res) => {
    try {
        const bill = await Bill.findOne({ invoiceId: req.params.id });
        if (!bill) {
            return res.status(404).json({ error: "Invoice not found" });
        }
        
        res.json({
            invoiceId: bill.invoiceId,
            status: bill.status,
            amount: bill.amount,
            fee: bill.fee,
            amountToReceive: bill.amountToReceive,
            createdAt: bill.createdAt,
            paidAt: bill.paidAt
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal error" });
    }
});

module.exports = router;