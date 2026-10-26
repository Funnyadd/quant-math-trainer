import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { isMainThread, parentPort, Worker } from "node:worker_threads";
import { integrals } from "../src/integrals.js";

// A worker lets the timeout stop a synchronous generator if it ever exhausts
// its unique question pool, instead of hanging the entire test runner.
if (isMainThread) {
    test("Every integral type and difficulty supports a full 100-question set", { timeout: 5000 }, async (context) => {
        const worker = new Worker(new URL(import.meta.url));
        context.after(() => worker.terminate());
        const [checkedSets] = await once(worker, "message");
        assert.equal(checkedSets, 9);
    });
} else {
    let checkedSets = 0;
    for (const integralType of ["definite", "indefinite", "mixed"]) {
        for (const difficulty of ["easy", "mixed", "hard"]) {
            const exercises = integrals.generateSet(100, { integralType, difficulty });
            assert.equal(exercises.length, 100);
            assert.equal(new Set(exercises.map(item => item.prompt)).size, 100);
            assert.equal(new Set(exercises.map(item => item.id)).size, 100);
            assert.ok(exercises.every(item => integrals.validate(item, item.expectedAnswer)));
            checkedSets++;
        }
    }
    parentPort.postMessage(checkedSets);
}
