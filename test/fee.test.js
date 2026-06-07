const calculateFee = require("../src/utils/fee");

test("комиссия 2.5% от 1000 = 25", () => {
    const { fee, amountToReceive } = calculateFee(1000, 2.5);
    expect(fee).toBe(25);
    expect(amountToReceive).toBe(975);
});

test("комиссия 0%", () => {
    const { fee, amountToReceive } = calculateFee(1000, 0);
    expect(fee).toBe(0);
    expect(amountToReceive).toBe(1000);
});

test("округление до копеек", () => {
    const { fee, amountToReceive } = calculateFee(100, 3.33);
    expect(fee).toBe(3.33);
    expect(amountToReceive).toBe(96.67);
});