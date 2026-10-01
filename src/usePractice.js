import { useCallback, useLayoutEffect, useRef, useState } from "react";

export function usePractice(type) {
    const [session, setSession] = useState(null);
    const [elapsedMs, setElapsedMs] = useState(0);

    const startedAt = useRef(null);
    const locked = useRef(false);

    useLayoutEffect(() => {
        if (session?.phase !== "answering") return;

        startedAt.current = performance.now();
        locked.current = false;
        setElapsedMs(0);

        let frame;

        function tick() {
            setElapsedMs(performance.now() - startedAt.current);
            frame = requestAnimationFrame(tick);
        }

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [session?.phase, session?.index, session?.exercises]);

    const start = useCallback((count) => {
        if (!Number.isInteger(count) || count < 1 || count > type.maxExercises) {
            return;
        }

        locked.current = true;
        startedAt.current = null;

        setSession({
            phase: "answering",
            exercises: type.generateSet(count),
            index: 0,
            results: [],
        });
    }, [type]);

    const submit = useCallback((answer) => {
        if (
            session?.phase !== "answering" ||
            locked.current ||
            startedAt.current === null ||
            !type.isValidInput(answer)
        ) {
            return;
        }

        locked.current = true;

        const exercise = session.exercises[session.index];
        const durationMs = performance.now() - startedAt.current;

        const result = {
            ...exercise,
            typeId: type.id,
            userAnswer: answer.trim(),
            correct: type.validate(exercise, answer),
            durationMs,
        };

        setElapsedMs(durationMs);

        setSession((current) => ({
            ...current,
            phase: "feedback",
            results: [...current.results, result],
        }));
    }, [session, type]);

    const next = useCallback(() => {
        setSession((current) => {
            if (current?.phase !== "feedback") return current;

            if (current.index === current.exercises.length - 1) {
                return { ...current, phase: "summary" };
            }

            return {
                ...current,
                phase: "answering",
                index: current.index + 1,
            };
        });
    }, []);

    const reset = useCallback(() => {
        locked.current = true;
        startedAt.current = null;
        setSession(null);
        setElapsedMs(0);
    }, []);

    return { session, elapsedMs, start, submit, next, reset };
}
