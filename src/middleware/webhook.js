const redis = require("redis");
const { verifySignature } = require("../utils/signature");
const Merchant = require("../models/Merchant");

const redisConnect = redis.createClient({ url: process.env.REDIS_URL });
redisConnect.connect();

async function webhook(req, res, next) {
    try {
        const signature = req.headers["x-signature"];
        const timestamp = req.headers["x-timestamp"];
        const nonce = req.headers["x-nonce"];
        
        // проверка заголовков
        if (!signature || !timestamp || !nonce) {
            return res.status(400).json({ error: "Missing headers" });
        }
        
        // проверка timestamp 
        const now = Math.floor(Date.now() / 1000);
        if (Math.abs(now - parseInt(timestamp)) > 300) {
            return res.status(403).json({ error: "Timestamp expired" });
        }
        
        // проверка времени в Redis
        const nonceKey = `nonce:${nonce}`;
        const existing = await redisConnect.get(nonceKey);
        if (existing) {
            return res.status(403).json({ error: "Nonce already used" });
        }
        
        // получаем мерчанта по invoiceId 
        const { invoiceId } = req.body;
        const invoice = await Invoice.findOne({ invoiceId });
        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }
        
        const merchant = await Merchant.findOne({ merchantId: invoice.merchantId });
        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }
        
        // проверка подписи
        const isValid = verifySignature(
            req.body, 
            timestamp, 
            nonce, 
            signature, 
            merchant.secretKey
        );
        
        if (!isValid) {
            return res.status(403).json({ error: "Invalid signature" });
        }
        
        // сохраняем nonce
        await redisClient.setEx(nonceKey, 86400, "used");
        
        req.merchant = merchant;
        req.invoice = invoice;
        next();
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal error" });
    }
}

module.exports = webhook;