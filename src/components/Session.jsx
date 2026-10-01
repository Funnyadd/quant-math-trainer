import AnswerForm from "./AnswerForm.jsx";
import { MathDisplay } from "../MathInput.jsx";
import { seconds } from "../format.js";

export default function Session({
  type,
  session,
  elapsedMs,
  onSubmit,
  onNext,
  onReset,
}) {
  const exercise = session.exercises[session.index];
  const result = session.results.at(-1);
  const answering = session.phase === "answering";
  const last = session.index === session.exercises.length - 1;
  const completed = session.results.length;

  return (
    <section className="card session">
      <div className="session-heading">
        <span className="eyebrow">
          Exercise {session.index + 1} of {session.exercises.length}
        </span>
        <button className="text-button" onClick={onReset}>
          End set
        </button>
      </div>

      <progress
        aria-label="Completed exercises"
        max={session.exercises.length}
        value={completed}
      />

      <p className="exercise-label">{type.name}</p>
      {type.visualMath ? (
        <div className="derivative-prompt">
          <span className="function-label">Differentiate f(x)</span>
          <MathDisplay latex={exercise.data.functionLatex} />
        </div>
      ) : (
        <h1 className="equation">{exercise.prompt}</h1>
      )}

      <div className="timer" aria-label={`Elapsed time: ${seconds(elapsedMs)}`}>
        <span className={answering ? "timer-dot running" : "timer-dot"} />
        {seconds(elapsedMs)}
        <span className="timer-label">
          {answering ? "elapsed" : "recorded"}
        </span>
      </div>

      {answering ? (
        <AnswerForm key={exercise.id} type={type} onSubmit={onSubmit} />
      ) : (
        <div className="feedback" role="status">
          <div
            className={`verdict ${result.correct ? "correct" : "incorrect"}`}
          >
            {result.correct ? "✓ Correct" : "✕ Not quite"}
          </div>

          <div className="solution">
            {type.visualMath ? (
              <MathDisplay latex={type.formatSolution(exercise)} />
            ) : (
              <strong>{type.formatSolution(exercise)}</strong>
            )}
          </div>

          {!result.correct && (
            <div className="muted">
              <span>Your answer:</span>
              {type.visualMath ? (
                <MathDisplay latex={result.userAnswer} />
              ) : (
                <span> {result.userAnswer}</span>
              )}
            </div>
          )}

          <button className="primary" onClick={onNext}>
            {last ? "View summary" : "Next exercise"}
            <span aria-hidden="true">→</span>
          </button>

          <p className="hint">Timer stopped. Continue when you're ready.</p>
        </div>
      )}
    </section>
  );
}
