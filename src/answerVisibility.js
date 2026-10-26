// Return the smallest scroll that fits both elements in the usable viewport.
// If the screen is too short for both, keep the answer field accessible.
export function answerScrollDelta(prompt, answer, viewport, gap = 16) {
    const top = viewport.top + gap;
    const bottom = viewport.bottom - gap;
    const first = Math.min(prompt.top, answer.top);
    const last = Math.max(prompt.bottom, answer.bottom);

    if (last - first <= bottom - top) {
        return Math.max(last - bottom, Math.min(0, first - top));
    }

    if (answer.bottom > bottom) return answer.bottom - bottom;
    if (answer.top < top) return answer.top - top;
    return 0;
}

export function observeAnswerVisibility(form, visualMath) {
    const document = form.ownerDocument;
    const view = document.defaultView;
    if (!view.matchMedia("(max-width: 600px), (pointer: coarse)").matches) {
        return () => {};
    }

    const session = form.closest(".session");
    const prompt = session.querySelector(".equation, .derivative-prompt");
    const answer = form.querySelector(visualMath ? "math-field" : "input");
    const viewport = view.visualViewport;
    const keyboard = visualMath ? view.mathVirtualKeyboard : null;
    let fullHeight = Math.max(view.innerHeight, viewport?.height || 0);
    let width = view.innerWidth;
    let nativeKeyboardOpen = fullHeight - (viewport?.height || view.innerHeight) > 100;
    let mathKeyboardOpen = Boolean(keyboard?.visible);
    let userScrolled = false;
    let openingUntil = 0;
    let frame;
    let retry;
    let disposed = false;

    function align() {
        if (disposed || userScrolled || document.activeElement !== answer) return;

        const top = viewport?.offsetTop || 0;
        let bottom = top + (viewport?.height || view.innerHeight);
        if (keyboard?.visible && keyboard.boundingRect.height > 0) {
            bottom = Math.min(bottom, keyboard.boundingRect.top);
        }
        // Leave clearance for native browser input controls above the keys.
        if (!visualMath && nativeKeyboardOpen) bottom -= 48;
        if (bottom - top <= 32) return;

        // iOS can shrink only the visual viewport. Reserve enough document
        // space to scroll the native input above the keyboard in that case.
        const inset = visualMath ? 0 : Math.max(0, view.innerHeight - (viewport?.height || view.innerHeight));
        session.style.setProperty("--answer-keyboard-inset", `${inset}px`);

        const delta = answerScrollDelta(prompt.getBoundingClientRect(), answer.getBoundingClientRect(), { top, bottom });
        if (Math.abs(delta) > 1) view.scrollBy({ top: delta, behavior: "instant" });
    }

    function schedule() {
        if (disposed || userScrolled) return;
        view.cancelAnimationFrame(frame);
        frame = view.requestAnimationFrame(align);
    }

    function cancelPending() {
        view.cancelAnimationFrame(frame);
        view.clearTimeout(retry);
    }

    function beginOpening() {
        userScrolled = false;
        openingUntil = view.performance.now() + 700;
        schedule();
        view.clearTimeout(retry);
        // Safari and MathLive can perform their own focus scroll after the
        // first frame. Recheck after the opening animation, unless interrupted.
        retry = view.setTimeout(schedule, 350);
    }

    function onViewportResize() {
        const height = viewport?.height || view.innerHeight;
        const nextWidth = view.innerWidth;
        const rotated = Math.abs(nextWidth - width) > 1;
        width = nextWidth;
        fullHeight = rotated ? Math.max(view.innerHeight, height) : Math.max(fullHeight, height);
        const open = fullHeight - height > 100;
        if (rotated || (open && !nativeKeyboardOpen && view.performance.now() >= openingUntil)) beginOpening();
        else if (open && view.performance.now() < openingUntil) schedule();
        if (!open && nativeKeyboardOpen) {
            openingUntil = 0;
            cancelPending();
        }
        nativeKeyboardOpen = open;
        if (!open) session.style.removeProperty("--answer-keyboard-inset");
    }

    function onMathKeyboardChange() {
        const open = Boolean(keyboard.visible);
        if (open && !mathKeyboardOpen && view.performance.now() >= openingUntil) beginOpening();
        else if (open && view.performance.now() < openingUntil) schedule();
        if (!open && mathKeyboardOpen) {
            openingUntil = 0;
            cancelPending();
        }
        mathKeyboardOpen = open;
    }

    function onFocus(event) {
        if (event.target === answer) beginOpening();
    }

    function onViewportScroll() {
        // Account for browser panning during focus, only while opening.
        if (view.performance.now() < openingUntil) schedule();
    }

    function onManualScroll() {
        userScrolled = true;
        cancelPending();
    }

    form.addEventListener("focusin", onFocus);
    viewport?.addEventListener("resize", onViewportResize);
    viewport?.addEventListener("scroll", onViewportScroll);
    view.addEventListener("resize", onViewportResize);
    view.addEventListener("touchmove", onManualScroll, { passive: true });
    view.addEventListener("wheel", onManualScroll, { passive: true });
    keyboard?.addEventListener("geometrychange", onMathKeyboardChange);
    keyboard?.addEventListener("virtual-keyboard-toggle", onMathKeyboardChange);
    beginOpening();
    document.fonts?.ready.then(() => {
        if (!disposed && view.performance.now() < openingUntil) schedule();
    });

    return () => {
        disposed = true;
        cancelPending();
        form.removeEventListener("focusin", onFocus);
        viewport?.removeEventListener("resize", onViewportResize);
        viewport?.removeEventListener("scroll", onViewportScroll);
        view.removeEventListener("resize", onViewportResize);
        view.removeEventListener("touchmove", onManualScroll);
        view.removeEventListener("wheel", onManualScroll);
        keyboard?.removeEventListener("geometrychange", onMathKeyboardChange);
        keyboard?.removeEventListener("virtual-keyboard-toggle", onMathKeyboardChange);
        session.style.removeProperty("--answer-keyboard-inset");
    };
}
