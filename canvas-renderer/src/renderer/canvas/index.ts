import { getStateAtTick } from "../../interpolator";
import {
    BULLET_SIZE,
    DEFAULT_SETTINGS,
    PLAYER_SIZE,
    TICK_RATE_MS,
} from "./consts";
import {
    Bullet,
    Entity,
    GameState,
    Map,
    Match,
    Player,
    Settings,
} from "./types";
import { isBullet, isPlayer, posOutOfBounds, range } from "./utils";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

let settings: Settings;

// Play state
let startTime: number;
let timerRef: number;
let match: Match;

// Performs side effects on the DOM to initialize the renderer
export function init(
    m: Match,
    container: HTMLElement,
    userSettings: Partial<Settings>
) {
    if (!container) {
        throw new Error("Container is not defined");
    }
    settings = { ...DEFAULT_SETTINGS, ...userSettings };
    canvas = document.createElement("canvas");
    canvas.width = container.clientWidth * settings.renderScaling;
    canvas.height = container.clientHeight * settings.renderScaling;
    const maybeContext = canvas.getContext("2d");
    if (!maybeContext) {
        throw new Error("Could not get context");
    }
    match = m;
    ctx = maybeContext;
    ctx.setTransform(1, 0, 0, 1, canvas.width / 2, canvas.height / 2);
    ctx.transform(1, 0, 0, 1, -m.map.size[0] / 2, -m.map.size[1] / 2);

    // Origin
    ctx.strokeStyle = `rgb(255, 0, 0)`;
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, 2 * Math.PI);
    ctx.stroke();

    renderTick(0);
    container.appendChild(canvas);
}

function renderTick(tick: number) {
    const tickState = getStateAtTick(match, tick);
    renderState(tickState);
}

export function play() {
    startTime = performance.now();
    requestAnimationFrame(renderPlay);
}

export function stop() {
    cancelAnimationFrame(timerRef);
}

function getCurrentTick(playTime: number) {
    // will loop for now
    return (playTime * TICK_RATE_MS) % match.ticks.length;
}

function renderPlayer({ health, pos }: Player) {
    const healthBar = range(0, 100, 0, 2 * Math.PI, health);
    const green = range(0, 100, 0, 255, health);
    const red = 255 - green;
    ctx.strokeStyle = `rgb(${red}, ${green}, 0)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], PLAYER_SIZE * 1.2, 0, healthBar);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], PLAYER_SIZE, 0, 2 * Math.PI);
    ctx.fillStyle = "rgb(255,255,255)";
    if (posOutOfBounds(match.map.size, pos)) {
        ctx.fillStyle = "rgb(255,125,125)";
    }
    ctx.fill();
}

function renderBullet({ pos }: Bullet) {
    ctx.strokeStyle = `rgb(${200}, ${200}, 0)`;
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], BULLET_SIZE, 0, 2 * Math.PI);
    ctx.fillStyle = "rgb(255,255,100)";
    ctx.fill();
}

function renderUnknown({ pos }: Entity) {
    ctx.strokeStyle = `rgb(200, 200, 200)`;
    ctx.beginPath();
    ctx.moveTo(...pos);
    ctx.arc(pos[0], pos[1], 3, 0, 2 * Math.PI);
    ctx.fillStyle = "rgb(125,125,125)";
    ctx.fill();
}

function renderEntity(e: Entity) {
    if (isPlayer(e)) {
        renderPlayer(e);
    } else if (isBullet(e)) {
        renderBullet(e);
    } else {
        renderUnknown(e);
    }
}

function renderMap(map: Map) {
    ctx.fillStyle = "rgb(90,90,90)";
    ctx.fillRect(0, 0, ...map.size);
}

function renderState(state: GameState) {
    renderMap(match.map);
    state.entities.forEach(renderEntity);
}

function renderPlay() {
    const timestamp = performance.now();
    const timeSinceStart = timestamp - startTime;
    const currentTick = getCurrentTick(timeSinceStart);
    const currentState = getStateAtTick(match, currentTick);
    renderState(currentState);
    timerRef = requestAnimationFrame(renderPlay);
}
