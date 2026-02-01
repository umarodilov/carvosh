export function getMultiplier(type, count = 1) {
    if (type === "day") return 1 * count;
    if (type === "week") return 7 * count;
    if (type === "month") return 30 * count; // 1 моҳ = 30 рӯз
    return 1;
}

export function calculateTotal({ services, selected, periodType, periodCount, discount }) {
    let perDay = 0;

    if (selected.wash) perDay += services.wash;
    if (selected.clean) perDay += services.clean;
    if (selected.vacuum) perDay += services.vacuum;

    const multiplier = getMultiplier(periodType, periodCount);
    const subtotal = perDay * multiplier;

    return Math.max(0, subtotal - discount);
}
