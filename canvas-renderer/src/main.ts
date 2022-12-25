import "./style.css";
import * as CanvasRenderer from "./renderer/canvas";
import { Match } from "./renderer/canvas/types";
import { mapTracesToFrontend } from "./renderer/canvas/utils";

type View = "select-match" | "player";
let match: Match;

const IDS = {
    matchInput: "match-input",
    container: "canvas-container",
};

document.addEventListener("DOMContentLoaded", () => {
    setView("select-match");
});

const registerViewMap = {
    "select-match": initSelectMatch,
    player: initPlayer,
};

async function onMatchChange(e: Event) {
    const t = <HTMLInputElement>e.target;
    const content = await t?.files?.[0].text();
    if (!content) {
        alert("No content found in file");
        return;
    }
    match = mapTracesToFrontend(JSON.parse(content));
    console.log(match);
    setView("player");
}

function initSelectMatch() {
    const input = document.getElementById(IDS.matchInput);
    if (!input) {
        alert("Input not found");
        return;
    }
    input.addEventListener("change", onMatchChange);
}

function initPlayer() {
    const canvasContainer = document.getElementById(IDS.container);
    if (!canvasContainer) {
        alert("No container found");
        return;
    }
    CanvasRenderer.init(match, canvasContainer, {});
    initAction("play", () => {
        CanvasRenderer.play();
    });
    initAction("stop", () => {
        CanvasRenderer.stop();
    });
}

function getButtons(action: string) {
    return document.querySelectorAll(`[data-action=${action}]`);
}

function initAction(action: string, cb: (ev: Event) => void) {
    Array.from(getButtons(action)).map((b) => b.addEventListener("click", cb));
}

function setView(view: View) {
    const t = document.getElementById(view) as HTMLTemplateElement | null;
    const node = t?.content.cloneNode(true);
    if (!node) {
        alert("No node");
        return;
    }
    document.body.innerHTML = "";
    document.body.appendChild(node);
    registerViewMap[view]();
}
