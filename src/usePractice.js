import { useCallback, useLayoutEffect, useRef, useState } from "react";

export function usePractice(type) {
    const [session, setSession] = useState(null);
    const [elapsedMs, setElapsedMs] = useState(0);

    const startedAt = useRef(null);
    const pausedAt = useRef(null);
    const locked = useRef(false);

    useLayoutEffect(() => {
        if (session?.phase !== "answering") return;

        startedAt.current = performance.now();
        pausedAt.current = null;
        locked.current = false;

        let frame;

        function tick() {
            if (startedAt.current !== null) {
                setElapsedMs((pausedAt.current ?? performance.now()) - startedAt.current);
            }
            frame = requestAnimationFrame(tick);
        }

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [session?.phase, session?.index, session?.exercises]);

    const start = useCallback((count, options = {}) => {
        if (!Number.isInteger(count) || count < 1 || count > type.maxExercises) {
            return;
        }

        locked.current = true;
        startedAt.current = null;
        pausedAt.current = null;

        setElapsedMs(0);
        setSession({
            phase: "answering",
            exercises: type.generateSet(count, options),
            options,
            index: 0,
            results: [],
        });
    }, [type]);

    const submit = useCallback((answer) => {
        if (
            session?.phase !== "answering" ||
            locked.current ||
            pausedAt.current !== null ||
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
        if (session?.phase !== "feedback") return;

        setElapsedMs(0);
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
    }, [session?.phase]);

    const pause = useCallback(() => {
        if (session?.phase === "answering" && startedAt.current !== null && pausedAt.current === null) {
            pausedAt.current = performance.now();
        }
    }, [session?.phase]);

    const resume = useCallback(() => {
        if (pausedAt.current !== null && startedAt.current !== null) {
            startedAt.current += performance.now() - pausedAt.current;
            pausedAt.current = null;
        }
    }, []);

    const finish = useCallback(() => {
        if (!session?.results.length) return;

        locked.current = true;
        startedAt.current = null;
        pausedAt.current = null;
        setSession(current => ({ ...current, phase: "summary" }));
    }, [session]);

    const reset = useCallback(() => {
        locked.current = true;
        startedAt.current = null;
        pausedAt.current = null;
        setSession(null);
        setElapsedMs(0);
    }, []);

    return { session, elapsedMs, start, submit, next, pause, resume, finish, reset };
}
