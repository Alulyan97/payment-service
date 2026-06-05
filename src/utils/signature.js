const crypto = require('crypto');

function generateSignature(data, secretKey) {
    return crypto
        .createHmac('sha256', secretKey)
        .update(data)
        .digest('hex');
}

function verifySignature(body, timestamp, nonce, signature, secretKey) {
    const data = `${timestamp}${nonce}${JSON.stringify(body)}`;
    const expected = generateSignature(data, secretKey);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

module.exports = { generateSignature, verifySignature };