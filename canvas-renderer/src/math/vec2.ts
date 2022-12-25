export type vec2 = [number, number];

export function zero(): vec2 {
    return [0, 0];
}

export function up(): vec2 {
    return [0, 1];
}

export function right(): vec2 {
    return [1, 0];
}

export function isZero(a: vec2): boolean {
    const [x, y] = a;
    return x === 0 && y === 0;
}

export function sub(a: vec2, b: vec2): vec2 {
    const [x, y] = a;
    const [x2, y2] = b;
    return [x - x2, y - y2];
}

export function magnitude(a: vec2): number {
    const [x, y] = a;
    return Math.sqrt(x * x + y * y);
}

export function normalize(a: vec2): vec2 {
    if (isZero(a)) {
        console.warn("[vec2] Trying to normalize a zero vector");
        return a;
    }
    const [x, y] = a;
    const m = magnitude(a);
    return [x / m, y / m];
}

export function dot(a: vec2, b: vec2): vec2 {
    return [a[0] * b[0], a[1] * b[1]];
}
