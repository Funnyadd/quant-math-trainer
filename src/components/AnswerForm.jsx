import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MathInput } from "../MathInput.jsx";
import { observeAnswerVisibility } from "../answerVisibility.js";

function AnswerForm({ type, onSubmit }) {
    const [answer, setAnswer] = useState("");
    const input = useRef(null);
    const form = useRef(null);
    const valid = useMemo(() => type.isValidInput(answer), [type, answer]);

    useLayoutEffect(() => observeAnswerVisibility(form.current, type.visualMath), [type.visualMath]);

    useLayoutEffect(() => {
        if (!type.visualMath) {
            input.current?.focus({ preventScroll: true });
        }
    }, [type.visualMath]);

    function confirm(value) {
        if (type.isValidInput(value)) onSubmit(value);
    }

    return (
        <form
            ref={form}
            className="answer-form"
            onSubmit={(event) => {
                event.preventDefault();
                confirm(answer);
            }}
        >
            {type.visualMath ? (
                <>
                    <p className="answer-label">{type.answerLabel}</p>
                    <MathInput onChange={setAnswer} onConfirm={confirm} />
                </>
            ) : (
                <>
                    <label htmlFor="answer">{type.answerLabel}</label>
                    <input
                        ref={input}
                        id="answer"
                        type="text"
                        inputMode={type.inputMode}
                        autoComplete="off"
                        enterKeyHint="done"
                        value={answer}
                        onChange={(event) => setAnswer(event.target.value)}
                    />
                </>
            )}

            <button className="primary" disabled={!valid}>
                Confirm answer <span aria-hidden="true">→</span>
            </button>

            <p className="hint">
                {answer && !valid ? type.invalidHint : type.answerHint}
            </p>
        </form>
    );
}

export default memo(AnswerForm);
