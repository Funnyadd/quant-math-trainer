import { answersEqual, parseAnswer } from "./math.js";
import { randomInt, shuffle } from "./random.js";

function createExercise(family) {
    const a = randomInt(1, 6);
    const b = randomInt(1, 5);
    const n = randomInt(2, 5);
    const c = randomInt(1, 9);
    switch (family) {
        case "polynomial": return { functionLatex: `${a}x^3+${b}x^2-${c}x`, answerLatex: `${3*a}x^2+${2*b}x-${c}` };
        case "power": return { functionLatex: `${a}x^{${n}}`, answerLatex: `${a*n}x^{${n-1}}` };
        case "exponential": return { functionLatex: `${a}e^{${b}x}`, answerLatex: `${a*b}e^{${b}x}` };
        case "root": return { functionLatex: `${a}\\sqrt{x}`, answerLatex: `\\frac{${a}}{2\\sqrt{x}}` };
        case "reciprocal": return { functionLatex: `\\frac{${a}}{x^{${n}}}`, answerLatex: `-\\frac{${a*n}}{x^{${n+1}}}` };
        case "fraction": return { functionLatex: `\\frac{x^{${n}}}{${b+1}}`, answerLatex: `\\frac{${n}x^{${n-1}}}{${b+1}}` };
        case "mixed": return { functionLatex: `${a}x^2+${b}e^x+${c}`, answerLatex: `${2*a}x+${b}e^x` };
        case "chain": return { functionLatex: `(${a}x+${b})^{${n}}`, answerLatex: `${a*n}(${a}x+${b})^{${n-1}}` };
        case "chain-square": return { functionLatex: `(${a}x^2+${b})^{${n}}`, answerLatex: `${2*a*n}x(${a}x^2+${b})^{${n-1}}` };
        case "chain-exp": return { functionLatex: `e^{${a}x^2+${b}x}`, answerLatex: `(${2*a}x+${b})e^{${a}x^2+${b}x}` };
        case "product": return { functionLatex: `x^{${n}}(${a}x+${b})`, answerLatex: `${a*(n+1)}x^{${n}}+${b*n}x^{${n-1}}` };
        case "quotient": return { functionLatex: `\\frac{${a}x+${b}}{x+${c}}`, answerLatex: `\\frac{${a*c-b}}{(x+${c})^2}` };
        case "product-exp": return { functionLatex: `x^{${n}}e^{${a}x}`, answerLatex: `(${n}x^{${n-1}}+${a}x^{${n}})e^{${a}x}` };
        case "trig": return { functionLatex: `${a}\\sin(${b}x)`, answerLatex: `${a*b}\\cos(${b}x)` };
        case "trig-chain": return { functionLatex: `\\cos(${a}x+${b})`, answerLatex: `-${a}\\sin(${a}x+${b})` };
        default: throw new Error(`Unknown derivative family: ${family}`);
    }
}

const easy = ["polynomial", "power", "exponential", "root", "reciprocal", "fraction", "mixed"];
const hard = ["chain", "chain-square", "chain-exp", "product", "quotient", "product-exp", "trig", "trig-chain"];

export const derivatives = {
    id: "easy-derivatives",
    name: "Derivatives",
    description: "Differentiate functions from basic powers to mental-friendly chain, product and quotient rules.",
    answerLabel: "Your answer · f′(x)",
    answerHint: "Use the buttons or math keyboard to build your answer.",
    invalidHint: "Finish filling in your expression.",
    inputMode: "text", visualMath: true, maxExercises: 100,
    difficultyOptions: [
        { value: "easy", label: "Easy" },
        { value: "mixed", label: "Mixed" },
        { value: "hard", label: "Challenging" },
    ],
    generateSet(count, options = {}) {
        const difficulty = options.difficulty || "mixed";
        const families = difficulty === "easy" ? easy : difficulty === "hard" ? hard : [...easy, ...hard];
        const exercises = [];
        const seen = new Set();
        let passes = 0;
        while (exercises.length < count) {
            // The mixed mode includes harder exercises even in small sets.
            const ordered = difficulty === "mixed" && passes === 0
                ? [hard[randomInt(0, hard.length - 1)], ...shuffle([...families])]
                : shuffle([...families]);
            for (const family of ordered) {
                if (exercises.length === count) break;
                const exercise = createExercise(family);
                if (seen.has(exercise.functionLatex)) continue;
                seen.add(exercise.functionLatex);
                exercises.push({ id: `derivative-${exercises.length}`, prompt: `f(x) = ${exercise.functionLatex}`, expectedAnswer: exercise.answerLatex, data: { ...exercise, family } });
            }
            passes++;
        }
        return exercises;
    },
    isValidInput: (answer) => parseAnswer(answer) !== null,
    validate: (exercise, answer) => answersEqual(answer, exercise.expectedAnswer),
    formatSolution: (exercise) => `f'(x)=${exercise.expectedAnswer}`,
    promptLabel: "Differentiate f(x)",
};
