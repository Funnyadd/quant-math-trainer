import { answersEqual, parseAnswer } from "./math.js";
import { randomInt as rand, shuffle } from "./random.js";

const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "mixed", label: "Mixed" },
    { value: "hard", label: "Challenging" },
];

// Each family is constructed by differentiating a known antiderivative.
// Definite problems use small bounds and integer-valued endpoints.
function exercise(family, definite) {
    // Each difficulty needs at least 100 distinct prompts, including the
    // smaller definite/challenging pool, so deduplication can finish a full set.
    const a = rand(1, 9), b = rand(1, 9), n = rand(1, 3);
    let integrand, antiderivative, evaluate;
    switch (family) {
        case "constant":
            integrand = `${a}`;
            antiderivative = `${a}x`;
            evaluate = x => a*x;
            break;
        case "linear":
            integrand = `${2*a}x+${b}`;
            antiderivative = `${a}x^2+${b}x`;
            evaluate = x => a*x*x+b*x;
            break;
        case "power":
            integrand = `${a*(n+1)}x^{${n}}`;
            antiderivative = `${a}x^{${n+1}}`;
            evaluate = x => a*x**(n+1);
            break;
        case "polynomial":
            integrand = `${3*a}x^2+${2*b}x`;
            antiderivative = `${a}x^3+${b}x^2`;
            evaluate = x => a*x**3+b*x**2;
            break;
        case "chain-linear": {
            const k = rand(2, 3), m = rand(1, 2), power = rand(2, 3);
            integrand = `${m*k*power}(${k}x+1)^{${power-1}}`;
            antiderivative = `${m}(${k}x+1)^{${power}}`;
            evaluate = x => m*(k*x+1)**power;
            break;
        }
        case "chain-quadratic": {
            const k = rand(1, 2), power = rand(2, 3);
            integrand = `${2*k*power}x(x^2+${b})^{${power-1}}`;
            antiderivative = `${k}(x^2+${b})^{${power}}`;
            evaluate = x => k*(x*x+b)**power;
            break;
        }
        case "product": {
            // Reverse product rule: integral of (x^2 + bx)' * (x + a) + ...
            integrand = `${3*a}x^2+${2*(a*b+b)}x+${b*b}`;
            antiderivative = `(${a}x+${b})(x^2+${b}x)`;
            evaluate = x => (a*x+b)*(x*x+b*x);
            break;
        }
        case "reciprocal": {
            const k = rand(1, 3), shift = rand(1, 3);
            integrand = `-\\frac{${k}}{(x+${shift})^2}`;
            antiderivative = `\\frac{${k}}{x+${shift}}`;
            evaluate = x => k/(x+shift);
            break;
        }
        case "trig": {
            const k = rand(1, 3), coefficient = rand(1, 3);
            integrand = `${coefficient*k}\\cos(${k}x)`;
            antiderivative = `${coefficient}\\sin(${k}x)`;
            evaluate = x => coefficient*Math.sin(k*x);
            break;
        }
        case "exponential": {
            const k = rand(1, 3), coefficient = rand(1, 3);
            integrand = `${coefficient*k}e^{${k}x}`;
            antiderivative = `${coefficient}e^{${k}x}`;
            evaluate = x => coefficient*Math.exp(k*x);
            break;
        }
        default: throw new Error(`Unknown integral family: ${family}`);
    }
    if (!definite) return { functionLatex: `\\int ${integrand}\\,dx`, answerLatex: antiderivative, family };

    // Bounds are chosen to keep exact results reasonably small. Reciprocal,
    // trig and exponential families are indefinite-only.
    const lower = family.startsWith("chain") || family === "product" ? 0 : rand(-1, 0);
    const upper = lower + 1;
    return {
        functionLatex: `\\int_{${lower}}^{${upper}} ${integrand}\\,dx`,
        answerLatex: String(Math.round(evaluate(upper)-evaluate(lower))),
        family, lower, upper,
    };
}

const easyFamilies = ["constant", "linear", "power", "polynomial"];
const hardIndefinite = ["chain-linear", "chain-quadratic", "product", "reciprocal", "trig", "exponential"];
const hardDefinite = ["chain-linear", "chain-quadratic", "product"];

function buildType(definite) {
    const hardFamilies = definite ? hardDefinite : hardIndefinite;
    return {
        id: definite ? "definite-integrals" : "indefinite-integrals",
        name: definite ? "Definite integrals" : "Indefinite integrals",
        description: definite
            ? "Evaluate integrals with small bounds, from basic powers to substitution and reverse product-rule patterns."
            : "Find antiderivatives, from simple powers to substitution, exponentials and trigonometry. +C is optional.",
        answerLabel: definite ? "Your answer · value" : "Your answer · antiderivative",
        answerHint: definite ? "Enter the exact value of the integral." : "Enter an antiderivative. The +C is optional.",
        invalidHint: "Finish filling in your expression.",
        inputMode: "text", visualMath: true, maxExercises: 100,
        difficultyOptions,
        promptLabel: definite ? "Evaluate the integral" : "Find the antiderivative",
        generateSet(count, options = {}) {
            const difficulty = options.difficulty || "mixed";
            const families = difficulty === "easy" ? easyFamilies
                : difficulty === "hard" ? hardFamilies : [...easyFamilies, ...hardFamilies];
            const set = [], seen = new Set();
            let passes = 0;
            while (set.length < count) {
                const ordered = difficulty === "mixed" && passes === 0
                    ? [hardFamilies[rand(0, hardFamilies.length - 1)], ...shuffle([...families])]
                    : shuffle([...families]);
                for (const family of ordered) {
                    if (set.length === count) break;
                    const item = exercise(family, definite);
                    if (seen.has(item.functionLatex)) continue;
                    seen.add(item.functionLatex);
                    set.push({ id: `integral-${set.length}`, prompt: item.functionLatex, expectedAnswer: item.answerLatex, data: item });
                }
                passes++;
            }
            return set;
        },
        isValidInput: answer => parseAnswer(answer) !== null,
        validate: (item, answer) => {
            const normalized = definite ? answer : answer.replace(/\s*[+-]\s*C\s*$/, "");
            return answersEqual(normalized, item.expectedAnswer);
        },
        formatSolution: item => definite ? `=${item.expectedAnswer}` : `=${item.expectedAnswer}+C`,
    };
}

const indefiniteIntegrals = buildType(false);
const definiteIntegrals = buildType(true);

const typeForExercise = item => item.data.integralType === "definite"
    ? definiteIntegrals : indefiniteIntegrals;

export const integrals = {
    ...indefiniteIntegrals,
    id: "integrals",
    name: "Integrals",
    description: "Practice antiderivatives, definite integrals with bounds, or a mix of both. Choose your difficulty separately.",
    integralTypeOptions: [
        { value: "mixed", label: "Mixed" },
        { value: "definite", label: "Definite" },
        { value: "indefinite", label: "Indefinite" },
    ],
    typeForExercise,
    generateSet(count, options = {}) {
        const mode = options.integralType || "mixed";
        const definiteCount = mode === "definite" ? count : mode === "indefinite" ? 0
            : Math.floor(count / 2) + (count % 2 ? rand(0, 1) : 0);
        const items = [
            ...definiteIntegrals.generateSet(definiteCount, options).map(item => ({
                ...item, data: { ...item.data, integralType: "definite" },
            })),
            ...indefiniteIntegrals.generateSet(count - definiteCount, options).map(item => ({
                ...item, data: { ...item.data, integralType: "indefinite" },
            })),
        ];
        return shuffle(items).map((item, index) => ({ ...item, id: `integral-${index}` }));
    },
    validate: (item, answer) => typeForExercise(item).validate(item, answer),
    formatSolution: item => typeForExercise(item).formatSolution(item),
};
