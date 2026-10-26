import test from "node:test";
import assert from "node:assert/strict";
import { answersEqual, parseAnswer } from "../src/math.js";
import { exerciseTypes } from "../src/exercises.js";

for (const [actual, expected] of [
    ["x^2\\cdot3", "3x^2"],
    ["2\\cdot3e^{3x}", "6e^{3x}"],
    ["\\frac{4}{2\\sqrt{x}}", "\\frac{2}{\\sqrt{x}}"],
    ["-6x^{-3}", "-\\frac{6}{x^3}"],
    ["4+6x", "6x+4"],
])
    test(`Equivalent answer: ${actual}`, () =>
        assert.equal(answersEqual(actual, expected), true));

test("Reject incomplete answers", () => {
    for (const value of ["", "\\placeholder{}", "\\frac{1}{}", "x+"])
        assert.equal(parseAnswer(value), null);
});

test("Reject incorrect answers", () => {
    assert.equal(answersEqual("6x", "6x+4"), false);
    assert.equal(answersEqual("6x^3", "6x^2"), false);
});

for (const type of exerciseTypes)
    test(`${type.name}: unique sets and valid expected answers`, () => {
        for (let i = 0; i < 3; i++) {
            const set = type.generateSet(100);
            assert.equal(set.length, 100);
            assert.equal(new Set(set.map((e) => e.prompt)).size, 100);
            for (const e of set)
                assert.equal(type.validate(e, e.expectedAnswer), true);
        }
    });


test("Derivative difficulty modes generate their designated families", () => {
    const type = exerciseTypes.find((item) => item.id === "easy-derivatives");
    const easy = new Set(["polynomial", "power", "exponential", "root", "reciprocal", "fraction", "mixed"]);
    const advanced = new Set(["chain", "chain-square", "chain-exp", "product", "quotient", "product-exp", "trig", "trig-chain"]);
    assert.ok(type.generateSet(20, { difficulty: "easy" }).every((item) => easy.has(item.data.family)));
    assert.ok(type.generateSet(20, { difficulty: "hard" }).every((item) => advanced.has(item.data.family)));
    assert.ok(type.generateSet(5, { difficulty: "mixed" }).some((item) => advanced.has(item.data.family)));
});

test("Integral modes have correct forms and accept their generated solutions", () => {
    for (const integralType of ["indefinite", "definite", "mixed"]) {
        const type = exerciseTypes.find((item) => item.id === "integrals");
        const exercises = type.generateSet(30, { integralType });
        assert.equal(exercises.length, 30);
        assert.ok(exercises.every((item) => item.data.functionLatex.startsWith("\\int")));
        assert.ok(exercises.every((item) => type.validate(item, item.expectedAnswer)));
        if (integralType === "mixed") {
            assert.equal(exercises.filter(item => item.data.integralType === "definite").length, 15);
            assert.equal(new Set(exercises.map(item => item.id)).size, 30);
        } else {
            assert.ok(exercises.every(item => item.data.integralType === integralType));
        }
        if (integralType === "indefinite") {
            assert.ok(exercises.every((item) => type.validate(item, `${item.expectedAnswer}+C`)));
        } else if (integralType === "definite") {
            assert.ok(exercises.every((item) => Number.isInteger(Number(item.expectedAnswer))));
        }
    }
});

test("Integral type and difficulty can be selected independently", () => {
    const type = exerciseTypes.find(item => item.id === "integrals");
    const easy = new Set(["constant", "linear", "power", "polynomial"]);
    for (const integralType of ["definite", "indefinite", "mixed"]) {
        for (const difficulty of ["easy", "hard"]) {
            const set = type.generateSet(20, { integralType, difficulty });
            assert.ok(set.every(item => easy.has(item.data.family) === (difficulty === "easy")));
            for (const item of set) {
                const definite = item.data.integralType === "definite";
                assert.equal(type.typeForExercise(item).answerLabel, definite ? "Your answer · value" : "Your answer · antiderivative");
                assert.equal(type.formatSolution(item).endsWith("+C"), !definite);
                assert.equal(type.validate(item, `${item.expectedAnswer}+C`), !definite);
            }
        }
    }
});
