function calculate(amount, feePercent) {
    const fee = amount * (feePercent / 100);
    const rounded = Math.round(fee * 100) / 100;
    const totalSum = Math.round((amount - rounded) * 100) / 100;
    
    return { fee: roundedFee, totalSum };
}

module.exports = calculate;