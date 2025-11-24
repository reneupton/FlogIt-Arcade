export function numberWithCommas(amount: number) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatFlog(amount?: number) {
    const value = amount ?? 0;
    return `FLOG ${numberWithCommas(value)}`;
}
