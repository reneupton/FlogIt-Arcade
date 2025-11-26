export function numberWithCommas(amount: number) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatGold(amount?: number) {
    const value = amount ?? 0;
    return `🪙 ${numberWithCommas(value)}`;
}
