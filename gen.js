const crypto = require("crypto");

const secretKey = "test_secret_key_123";
const invoiceId = "2eb755ac-9b99-423c-836f-56bab1b9fe07";
const status = "paid";
const timestamp = Math.floor(Date.now() / 1000).toString();
const nonce = "unique-nonce-789";

const body = { invoiceId, status };
const data = `${timestamp}${nonce}${JSON.stringify(body)}`;
const signature = crypto.createHmac("sha256", secretKey).update(data).digest("hex");

console.log("X-Signature:", signature);
console.log("X-Timestamp:", timestamp);
console.log("X-Nonce:", nonce);
console.log("Body:", JSON.stringify(body));