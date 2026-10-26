export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
}
