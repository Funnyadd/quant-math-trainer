import { derivatives } from "./derivatives.js";

function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }

    return items;
}

const multiplication = {
    id: "two-digit-multiplication",
    name: "2-digit multiplication",
    description: "Two numbers. One answer. Find your rhythm.",
    inputMode: "numeric",
    answerLabel: "Your answer",
    answerHint: "Press Enter or tap confirm.",
    invalidHint: "Enter a whole number.",
    maxExercises: 100,

    generateSet(count) {
        const pairs = [];

        for (let a = 10; a <= 99; a++) {
            for (let b = a; b <= 99; b++) {
                pairs.push({ a, b });
            }
        }

        return shuffle(pairs)
            .slice(0, count)
            .map(({ a, b }, index) => {
                if (Math.random() < 0.5) [a, b] = [b, a];

                return {
                    id: `${index}-${a}-${b}`,
                    prompt: `${a} × ${b}`,
                    expectedAnswer: String(a * b),
                    data: { a, b },
                };
            });
    },

    formatSolution(exercise) {
        return `${exercise.prompt} = ${exercise.expectedAnswer}`;
    },

    isValidInput(answer) {
        return /^\d+$/.test(answer.trim());
    },

    validate(exercise, answer) {
        return Number(answer.trim()) === Number(exercise.expectedAnswer);
    },
};

export const exerciseTypes = [multiplication, derivatives];
