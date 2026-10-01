import { answersEqual, parseAnswer } from "./math.js";

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [items[i], items[j]] = [items[j], items[i]];
    }

    return items;
}

function createExercise(family) {
    const a = randomInt(1, 6);
    const b = randomInt(1, 5);
    const n = randomInt(2, 5);
    const c = randomInt(1, 9);

    switch (family) {
        case "polynomial":
            return {
                functionLatex: `${a}x^3+${b}x^2-${c}x`,
                answerLatex: `${3 * a}x^2+${2 * b}x-${c}`,
            };

        case "power":
            return {
                functionLatex: `${a}x^{${n}}`,
                answerLatex: `${a * n}x^{${n - 1}}`,
            };

        case "exponential":
            return {
                functionLatex: `${a}e^{${b}x}`,
                answerLatex: `${a * b}e^{${b}x}`,
            };

        case "root":
            return {
                functionLatex: `${a}\\sqrt{x}`,
                answerLatex: `\\frac{${a}}{2\\sqrt{x}}`,
            };

        case "reciprocal":
            return {
                functionLatex: `\\frac{${a}}{x^{${n}}}`,
                answerLatex: `-\\frac{${a * n}}{x^{${n + 1}}}`,
            };

        case "fraction":
            return {
                functionLatex: `\\frac{x^{${n}}}{${b + 1}}`,
                answerLatex: `\\frac{${n}x^{${n - 1}}}{${b + 1}}`,
            };

        case "mixed":
            return {
                functionLatex: `${a}x^2+${b}e^x+${c}`,
                answerLatex: `${2 * a}x+${b}e^x`,
            };

        default:
            throw new Error(`Unknown derivative family: ${family}`);
    }
}

export const derivatives = {
    id: "easy-derivatives",
    name: "Easy derivatives",
    description: "Powers, exponentials, roots, and fractions.",
    answerLabel: "Your answer · f′(x)",
    answerHint: "Use the buttons or the math keyboard to build your answer.",
    invalidHint: "Finish filling in your expression.",
    inputMode: "text",
    visualMath: true,
    maxExercises: 100,

    generateSet(count) {
        const families = [
            "polynomial",
            "power",
            "exponential",
            "root",
            "reciprocal",
            "fraction",
            "mixed",
        ];

        const exercises = [];
        const seen = new Set();

        while (exercises.length < count) {
        for (const family of shuffle([...families])) {
            if (exercises.length === count) break;

            const exercise = createExercise(family);
            if (seen.has(exercise.functionLatex)) continue;

            seen.add(exercise.functionLatex);

            exercises.push({
                id: `derivative-${exercises.length}`,
                prompt: `f(x) = ${exercise.functionLatex}`,
                expectedAnswer: exercise.answerLatex,
                data: { ...exercise, family },
            });
        }
        }

        return exercises;
    },

    isValidInput(answer) {
        return parseAnswer(answer) !== null;
    },

    validate(exercise, answer) {
        return answersEqual(answer, exercise.expectedAnswer);
    },

    formatSolution(exercise) {
        return `f'(x)=${exercise.expectedAnswer}`;
    },
};
