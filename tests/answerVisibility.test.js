import test from "node:test";
import assert from "node:assert/strict";
import { answerScrollDelta, observeAnswerVisibility } from "../src/answerVisibility.js";

test("Visibility scroll fits the equation and full answer field with minimal movement", () => {
    const cases = [
        { prompt: { top: 80, bottom: 180 }, answer: { top: 240, bottom: 320 }, viewport: { top: 0, bottom: 400 }, expected: 0 },
        { prompt: { top: 200, bottom: 300 }, answer: { top: 350, bottom: 450 }, viewport: { top: 0, bottom: 350 }, expected: 116 },
        { prompt: { top: -50, bottom: 20 }, answer: { top: 80, bottom: 150 }, viewport: { top: 0, bottom: 400 }, expected: -66 },
        { prompt: { top: 80, bottom: 140 }, answer: { top: 240, bottom: 320 }, viewport: { top: 100, bottom: 500 }, expected: -36 },
    ];
    for (const { prompt, answer, viewport, expected } of cases) {
        const delta = answerScrollDelta(prompt, answer, viewport);
        assert.equal(delta, expected);
        assert.ok(prompt.top - delta >= viewport.top + 16);
        assert.ok(answer.bottom - delta <= viewport.bottom - 16);
    }
});

test("Very short viewports prioritize keeping the answer field visible", () => {
    assert.equal(answerScrollDelta({ top: 0, bottom: 200 }, { top: 350, bottom: 450 }, { top: 0, bottom: 300 }), 166);
    assert.equal(answerScrollDelta({ top: -200, bottom: -50 }, { top: 20, bottom: 100 }, { top: 0, bottom: 200 }), 0);
});

function createScreen({ visualMath = false, mobile = true, height = 800 } = {}) {
    const frames = new Map();
    const timers = new Map();
    const styles = new Map();
    const scrolls = [];
    let id = 0;
    let now = 0;
    const promptRect = { top: 250, bottom: 330 };
    const answerRect = { top: 400, bottom: 474 };
    const answer = { getBoundingClientRect: () => answerRect };
    const prompt = { getBoundingClientRect: () => promptRect };
    const viewport = Object.assign(new EventTarget(), { height, width: 390, offsetTop: 0 });
    const keyboard = Object.assign(new EventTarget(), {
        visible: false,
        boundingRect: { top: 800, height: 0 },
    });
    const session = {
        querySelector: () => prompt,
        style: {
            setProperty: (key, value) => styles.set(key, value),
            removeProperty: key => styles.delete(key),
        },
    };
    function move(delta) {
        for (const rect of [promptRect, answerRect]) {
            rect.top -= delta;
            rect.bottom -= delta;
        }
    }
    const view = Object.assign(new EventTarget(), {
        innerHeight: 800,
        innerWidth: 390,
        visualViewport: viewport,
        mathVirtualKeyboard: keyboard,
        matchMedia: () => ({ matches: mobile }),
        performance: { now: () => now },
        requestAnimationFrame: callback => { frames.set(++id, callback); return id; },
        cancelAnimationFrame: key => frames.delete(key),
        setTimeout: callback => { timers.set(++id, callback); return id; },
        clearTimeout: key => timers.delete(key),
        scrollBy: ({ top }) => { scrolls.push(top); move(top); },
    });
    const document = { defaultView: view, activeElement: answer };
    const form = Object.assign(new EventTarget(), {
        ownerDocument: document,
        closest: () => session,
        querySelector: () => answer,
    });
    const cleanup = observeAnswerVisibility(form, visualMath);
    function flush() {
        const pending = [...frames.values()];
        frames.clear();
        for (const callback of pending) callback();
    }
    function resize(nextHeight) {
        viewport.height = nextHeight;
        viewport.dispatchEvent(new Event("resize"));
        flush();
    }
    function toggleMath(visible) {
        keyboard.visible = visible;
        keyboard.boundingRect = visible ? { top: 400, height: 400 } : { top: 800, height: 0 };
        keyboard.dispatchEvent(new Event("geometrychange"));
        keyboard.dispatchEvent(new Event("virtual-keyboard-toggle"));
        flush();
    }
    function settle() {
        now += 350;
        const pending = [...timers.values()];
        timers.clear();
        for (const callback of pending) callback();
        flush();
    }
    return { answerRect, promptRect, scrolls, view, viewport, keyboard, styles, document, flush, resize, toggleMath, settle, move, cleanup };
}

test("Native keyboard opening reveals the whole answer and equation, including after reopening", () => {
    const screen = createScreen();
    screen.flush();
    assert.equal(screen.scrolls.length, 0);
    screen.resize(400);
    assert.ok(screen.promptRect.top >= 16);
    assert.ok(screen.answerRect.bottom <= 400 - 48 - 16);
    assert.equal(screen.styles.get("--answer-keyboard-inset"), "400px");

    screen.resize(800);
    assert.equal(screen.styles.has("--answer-keyboard-inset"), false);
    screen.move(-200);
    const beforeReopen = screen.scrolls.length;
    screen.resize(400);
    assert.equal(screen.scrolls.length, beforeReopen + 1);
    assert.ok(screen.answerRect.bottom <= 400 - 48 - 16);
    screen.cleanup();
});

test("A new question aligns even when the native keyboard is already open", () => {
    const screen = createScreen({ height: 400 });
    screen.flush();
    assert.ok(screen.promptRect.top >= 16);
    assert.ok(screen.answerRect.bottom <= 400 - 48 - 16);
    screen.cleanup();
});

test("MathLive keyboard geometry is respected on opening and reopening", () => {
    const screen = createScreen({ visualMath: true });
    screen.flush();
    screen.toggleMath(true);
    assert.ok(screen.promptRect.top >= 16);
    assert.ok(screen.answerRect.bottom <= 384);
    screen.toggleMath(false);
    screen.move(-150);
    const beforeReopen = screen.scrolls.length;
    screen.toggleMath(true);
    assert.equal(screen.scrolls.length, beforeReopen + 1);
    assert.ok(screen.answerRect.bottom <= 384);
    screen.cleanup();
});

test("Manual scrolling cancels pending corrections without fighting later viewport changes", () => {
    const screen = createScreen();
    screen.flush();
    screen.resize(400);
    screen.view.dispatchEvent(new Event("touchmove"));
    screen.move(-80);
    const before = screen.scrolls.length;
    screen.settle();
    screen.resize(380);
    assert.equal(screen.scrolls.length, before);
    screen.cleanup();
});

test("Scrolling during the first keyboard animation is also respected", () => {
    const screen = createScreen();
    screen.flush();
    screen.view.dispatchEvent(new Event("touchmove"));
    screen.resize(400);
    screen.settle();
    assert.equal(screen.scrolls.length, 0);
    screen.cleanup();
});

test("Browser panning is corrected during opening and left alone afterward", () => {
    const screen = createScreen({ height: 400 });
    screen.flush();
    screen.viewport.offsetTop = 150;
    screen.viewport.dispatchEvent(new Event("scroll"));
    screen.flush();
    assert.ok(screen.promptRect.top >= 166);
    assert.ok(screen.answerRect.bottom <= 550 - 48 - 16);

    screen.settle();
    screen.settle();
    screen.move(-200);
    const before = screen.scrolls.length;
    screen.viewport.dispatchEvent(new Event("scroll"));
    screen.flush();
    assert.equal(screen.scrolls.length, before);
    screen.cleanup();
});

test("Desktop layouts and unfocused answer fields do not trigger automatic scrolling", () => {
    const desktop = createScreen({ mobile: false, height: 400 });
    desktop.flush();
    desktop.resize(300);
    assert.equal(desktop.scrolls.length, 0);
    desktop.cleanup();

    const unfocused = createScreen({ height: 400 });
    unfocused.document.activeElement = null;
    unfocused.flush();
    unfocused.settle();
    assert.equal(unfocused.scrolls.length, 0);
    unfocused.cleanup();
});

test("Leaving an exercise removes listeners, retries, and reserved scroll space", () => {
    const screen = createScreen({ height: 400 });
    screen.flush();
    screen.cleanup();
    screen.move(-200);
    const before = screen.scrolls.length;
    screen.resize(300);
    screen.toggleMath(true);
    screen.settle();
    assert.equal(screen.scrolls.length, before);
    assert.equal(screen.styles.has("--answer-keyboard-inset"), false);
});
