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
]);
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
