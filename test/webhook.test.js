const { generateSignature } = require("../src/utils/signature");

test("проверка подписи работает", () => {
    const body = { invoiceId: "123", status: "paid" };
    const timestamp = "1234567890";
    const nonce = "abc";
    const secret = "mysecret";
    
    const data = `${timestamp}${nonce}${JSON.stringify(body)}`;
    const signature = generateSignature(data, secret);
    
    expect(signature).toBeDefined();
    expect(typeof signature).toBe("string");
    expect(signature.length).toBe(64);
});