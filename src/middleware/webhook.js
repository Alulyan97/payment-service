const redis = require("redis");
const { verifySignature } = require("../utils/signature");
const Merchant = require("../models/Merchant");
const Invoice = require("../models/Invoice");

let redisConnect = null;
let redisReady = false;

(async () => {
    try {
        redisConnect = redis.createClient({ url: process.env.REDIS_URL });
        
        redisConnect.on("error", (err) => {
            console.error("Redis error:", err.message);
            redisReady = false;
        });
        
        redisConnect.on("connect", () => {
            console.log("Redis connected");
            redisReady = true;
        });
        
        await redisConnect.connect();
    } catch (err) {
        console.error("Failed to connect to Redis:", err.message);
    }
})();

async function webhook(req, res, next) {
    try {
        const signature = req.headers["x-signature"];
        const timestamp = req.headers["x-timestamp"];
        const nonce = req.headers["x-nonce"];
        
        if (!signature || !timestamp || !nonce) {
            return res.status(400).json({ error: "Missing headers" });
        }

        if (redisReady && redisConnect) {
            const nonceKey = `nonce:${nonce}`;
            const existing = await redisConnect.get(nonceKey);
            if (existing) {
                return res.status(403).json({ error: "Nonce already used" });
            }
        } else {
            console.warn("Redis not ready, skipping nonce check");
        }
        
        const { invoiceId } = req.body;
        const invoice = await Invoice.findOne({ invoiceId });
        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }
        
        const merchant = await Merchant.findOne({ merchantId: invoice.merchantId });
        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }
        
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
        
        if (redisReady && redisConnect) {
            const nonceKey = `nonce:${nonce}`;
            await redisConnect.setEx(nonceKey, 86400, "used");
        }
        
        req.merchant = merchant;
        req.invoice = invoice;
        next();
    } catch (err) {
        console.error("Webhook ошибка:", err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = webhook;