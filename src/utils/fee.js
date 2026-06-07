function calculateFee(amount, feePercent) {
    const fee = amount * (feePercent / 100);
    const roundedFee = Math.round(fee * 100) / 100;
    const amountToReceive = Math.round((amount - roundedFee) * 100) / 100;
    
    return { fee: roundedFee, amountToReceive };
}

module.exports = calculateFee;