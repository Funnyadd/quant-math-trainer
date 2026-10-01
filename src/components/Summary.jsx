import { MathDisplay } from "../MathInput.jsx";
import { seconds } from "../format.js";

export default function Summary({ type, results, onRepeat, onReset }) {
  const total = results.reduce((sum, result) => sum + result.durationMs, 0);
  const correct = results.filter((result) => result.correct).length;
  const accuracy = Math.round((correct / results.length) * 100);

  return (
    <section className="card summary">
      <span className="eyebrow">SET COMPLETE</span>
      <h1>Nicely done.</h1>
      <p className="intro">
        {correct} of {results.length} exercises correct. Keep the momentum.
      </p>

      <div className="stats">
        <div>
          <span>Total time</span>
          <strong>{seconds(total)}</strong>
        </div>
        <div>
          <span>Average</span>
          <strong>{seconds(total / results.length)}</strong>
        </div>
        <div>
          <span>Accuracy</span>
          <strong>{accuracy}%</strong>
        </div>
      </div>

      <h2>Your exercises</h2>

      <ol className="results">
        {results.map((result, index) => (
          <li key={result.id}>
            <span className="result-number">{index + 1}</span>
            <div className="result-detail">
              {type.visualMath ? (
                <>
                  <MathDisplay latex={`f(x)=${result.data.functionLatex}`} />
                  <MathDisplay latex={type.formatSolution(result)} />
                </>
              ) : (
                <strong>{type.formatSolution(result)}</strong>
              )}

              <span
                className={result.correct ? "correct-text" : "incorrect-text"}
              >
                {result.correct ? "Correct" : "Incorrect"}
              </span>

              {!result.correct &&
                (type.visualMath ? (
                  <>
                    <span>Your answer:</span>
                    <MathDisplay latex={result.userAnswer} />
                  </>
                ) : (
                  <span>Your answer: {result.userAnswer}</span>
                ))}
            </div>
            <span className="result-time">{seconds(result.durationMs)}</span>
          </li>
        ))}
      </ol>

      <button className="primary" onClick={onRepeat}>
        Practice again <span aria-hidden="true">→</span>
      </button>
      <button className="secondary" onClick={onReset}>
        Change set size
      </button>
      <p className="hint">{type.name} · Breaks excluded from total time</p>
    </section>
  );
}
