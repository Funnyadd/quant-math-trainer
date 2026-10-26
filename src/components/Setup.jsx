import { useState } from "react";
import { exerciseTypes } from "../exercises.js";

export default function Setup({ type, onTypeChange, onStart }) {
    const [selection, setSelection] = useState(5);
    const [custom, setCustom] = useState("5");
    const [difficulty, setDifficulty] = useState("mixed");
    const [integralType, setIntegralType] = useState("mixed");

    const count = selection === "custom" ? Number(custom) : selection;
    const valid =
        Number.isInteger(count) && count >= 1 && count <= type.maxExercises;

    return (
        <section className="card setup">
            <span className="eyebrow">A LITTLE PRACTICE, EVERY DAY</span>
            <h1>
                Keep your mind
                <br />
                in motion.
            </h1>
            <p className="intro">{type.description}</p>

            <div className="type-picker">
                <label htmlFor="exercise-type">Practice mode</label>
                <div className="select-wrap">
                    <select
                        id="exercise-type"
                        value={type.id}
                        onChange={(event) => onTypeChange(event.target.value)}
                    >
                        {exerciseTypes.map((exerciseType) => (
                            <option key={exerciseType.id} value={exerciseType.id}>
                                {exerciseType.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {type.integralTypeOptions && (
                <div className="type-picker">
                    <label htmlFor="integral-type">Integral type</label>
                    <div className="select-wrap">
                        <select id="integral-type" value={integralType} onChange={(event) => setIntegralType(event.target.value)}>
                            {type.integralTypeOptions.map((option) => (
                                <option value={option.value} key={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {type.difficultyOptions && (
                <div className="type-picker">
                    <label htmlFor="difficulty">Difficulty</label>
                    <div className="select-wrap">
                        <select id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                            {type.difficultyOptions.map((option) => (
                                <option value={option.value} key={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (valid) onStart(count, { difficulty, integralType });
                }}
            >
                <fieldset>
                    <legend>How many exercises?</legend>
                    <div className="presets">
                        {[1, 5, 10, 20, "custom"].map((value) => (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={selection === value}
                                className={selection === value ? "selected" : ""}
                                onClick={() => setSelection(value)}
                            >
                                {value === "custom" ? "Custom" : value}
                            </button>
                        ))}
                    </div>
                </fieldset>

                {selection === "custom" && (
                    <div className="custom-count">
                        <label htmlFor="count">
                            Number of exercises (1–{type.maxExercises})
                        </label>
                        <input
                            id="count"
                            type="number"
                            inputMode="numeric"
                            min="1"
                            max={type.maxExercises}
                            step="1"
                            required
                            value={custom}
                            onChange={(event) => setCustom(event.target.value)}
                        />
                    </div>
                )}

                <button className="primary" disabled={!valid}>
                    Start practice <span aria-hidden="true">→</span>
                </button>
            </form>

            <p className="hint">
                Your timer runs only while you solve. Take a breath between exercises.
            </p>
        </section>
    );
}
