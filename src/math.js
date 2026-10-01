import { ComputeEngine } from "@cortex-js/compute-engine";

export const computeEngine = new ComputeEngine();

export function parseAnswer(latex) {
    if (!latex.trim() || latex.includes("\\placeholder")) return null;

    try {
        const expression = computeEngine.parse(latex);
        return expression.isValid ? expression : null;
    }
    catch {
        return null;
    }
}

export function answersEqual(actual, expected) {
    const answer = parseAnswer(actual);
    const solution = parseAnswer(expected);

    if (!answer || !solution) return false;

    try {
        if (answer.isEqual(solution) === true) return true;

        // Normalize the difference: reciprocal powers and fractions may
        // have different canonical forms even when they are equivalent.
        const difference = computeEngine
            .box(["Subtract", answer.json, solution.json])
            .simplify();
        return difference.isSame(computeEngine.box(0));
    }
    catch {
        return false;
    }
}
