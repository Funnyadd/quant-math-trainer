# Quant Math Trainer

A mobile-first React app for timed multiplication, derivative, and integral practice. Exercises are generated and checked in the browser, with feedback after each answer and summaries for complete or partially finished sets.

There is no backend, account system, or session persistence. Reloading or closing the app discards the current set. Production builds support installation and offline practice through a service worker.

## Local development

Use Node.js 22.12+ or Node.js 24, with npm.

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. No environment variables or external services are required.

To test the layout on a phone on the same network:

```bash
npm run dev -- --host 0.0.0.0
```

Open Vite's network URL on the phone and allow access through your computer's firewall if needed. Service workers are disabled in development; use a production build to test offline behavior.

### Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite with hot reload |
| `npm run build` | Generate the production app and service worker in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint |
| `npm test` | Run the Node.js regression tests |

## Practice modes

All modes support preset set sizes of 1, 5, 10, or 20, plus a custom count from 1 to 100. Prompts do not repeat within a set.

| Mode | Content | Setup options |
| --- | --- | --- |
| 2-digit multiplication | Numbers from 10 to 99; reversed pairs count as the same pair | Set size |
| Derivatives | Powers, polynomials, exponentials, roots, reciprocals, fractions, and sums; advanced families cover chain, product, quotient, and trigonometric rules | Difficulty and set size |
| Integrals | Antiderivatives and definite integrals with small bounds | Integral type, difficulty, and set size |

### Calculus options

Difficulty is independent of integral type. Both calculus modes offer **Easy**, **Mixed** (default), and **Challenging**. The internal values passed to generators are `easy`, `mixed`, and `hard`.

- **Easy derivatives** use the basic families listed above. **Challenging derivatives** use the advanced families.
- **Easy integrals** use constants, linear expressions, powers, and polynomials. **Challenging integrals** use substitution-style patterns and reverse product-rule recognition. Indefinite practice also includes reciprocal, trigonometric, and exponential families.
- **Mixed difficulty** draws from both difficulty levels and ensures a challenging-family question in every nonempty generated set. For mixed integral types, this applies to each nonempty type subset before shuffling.

Integrals have a separate type selector, defaulting to **Mixed**:

| Integral type | Expected answer |
| --- | --- |
| Indefinite | An antiderivative; a trailing `+C` or `-C` is optional |
| Definite | The value between the bounds; current generators produce exact integer answers |
| Mixed | Both types, shuffled together; counts differ by at most one, with the extra type chosen randomly for odd set sizes |

The prompt and answer hint adapt to each integral question. Calculus answers use MathLive's visual editor, with toolbar buttons for powers, fractions, roots, parentheses, trigonometry, and the integration constant.

### Answer checking

Multiplication accepts whole-number input and compares numeric values. Calculus input is LaTeX parsed by Cortex Compute Engine. Empty, incomplete, or placeholder-containing expressions cannot be submitted.

Symbolic comparison first checks equality, then simplifies the difference and checks for zero. This accepts many equivalent forms, including reordered terms and simplified fractions, but can reject expressions the engine cannot establish as equivalent. Indefinite integral validation strips a trailing symbolic `±C` before comparison; it does not perform a general comparison modulo arbitrary additive constants.

## Session behavior

The shared session flow is setup → answering → feedback → the next exercise or summary.

- The timer starts when an exercise appears and stops on submission. Feedback and breaks between questions are excluded.
- Confirm an answer with Enter or the confirm button, then advance manually after reviewing the result.
- On mobile, the equation and answer field are brought into view when a question appears or the keyboard reopens. Positioning accounts for the native keyboard and MathLive keyboard. Manual scrolling cancels pending adjustments; unusually short viewports prioritize the answer field.
- After at least one submitted answer, **End set** offers **See results**, **Quit without results**, and **Keep practising**. The timer pauses while this dialog is open. Escape cancels the dialog and resumes practice.
- With no submitted answers, ending a set uses the simple exit confirmation.
- Summaries show accuracy, total and average solving time, solutions, incorrect answers, and individual durations. Partial summaries include only submitted exercises and exclude the unfinished question and its time.
- **Practice again** generates a fresh set with the original requested size and options, including after an early finish.

## Architecture

The project uses React for UI and state, Vite for development and builds, MathLive for editing and rendering, and Cortex Compute Engine for symbolic validation. Interface fonts are bundled with Fontsource; styling is plain CSS. Dependency versions live in [package.json](package.json) and the npm lockfile.

```text
src/
  App.jsx                  Screen selection and end-set actions
  usePractice.js           Session state, timing, answer recording, progression
  answerVisibility.js      Mobile keyboard viewport measurement and positioning
  exercises.js             Multiplication implementation and exercise registry
  derivatives.js           Derivative generators and validation
  integrals.js             Integral generators, type mixing, and validation
  math.js                  Shared parsing and symbolic comparison
  random.js                Shared integer sampling and in-place shuffling
  MathInput.jsx            MathLive editor, toolbar, and read-only displays
  format.js                Time formatting
  index.css                Responsive styles and MathLive theme overrides
  main.jsx                 React entry point and interface font imports
  components/
    Setup.jsx              Mode, integral type, difficulty, and set-size controls
    AnswerForm.jsx         Numeric or symbolic entry and submission
    Session.jsx            Exercise prompt, timer, and feedback
    EndSetDialog.jsx       Quit, review partial results, or resume
    Summary.jsx            Complete and partial results
    PwaStatus.jsx          Offline-ready and update prompts
public/
  fonts/                   MathLive fonts
  sounds/                  MathLive keyboard sounds
  *.svg, *.png             Browser and installable-app icons
tests/
  math.test.js             Parsing, equivalence, generation, and mode tests
  answerVisibility.test.js Keyboard visibility and scroll behavior tests
  integralCapacity.test.js Full-set generation across integral options
vite.config.js             React plugin, PWA manifest, and precache configuration
```

[`usePractice`](src/usePractice.js) owns a session's `phase`, generated `exercises`, selected `options`, current `index`, and submitted `results`. Each result retains the exercise record and adds `userAnswer`, `correct`, and `durationMs`. The UI renders from this state; exercise types supply the mathematics.

### Adding or extending a practice mode

Implement a type object and register it in `exerciseTypes` in [`src/exercises.js`](src/exercises.js). The shared screens and session hook use this interface:

| Field or method | Contract |
| --- | --- |
| `id`, `name`, `description` | Stable identifier and setup copy |
| `maxExercises` | Upper bound accepted by setup and the session hook |
| `inputMode`, `visualMath` | Numeric keyboard hint or visual math editor |
| `answerLabel`, `answerHint`, `invalidHint` | Answer-entry copy |
| `generateSet(count, options)` | Return exactly `count` exercise records with unique IDs and prompts |
| `isValidInput(answer)` | Determine whether an answer can be submitted |
| `validate(exercise, answer)` | Return whether a submitted answer is correct |
| `formatSolution(exercise)` | Return plain text or LaTeX according to `visualMath` |
| `promptLabel` | Prompt heading for visual math questions |
| `difficultyOptions` | Optional array of `{ value, label }` entries for the difficulty selector |
| `typeForExercise(exercise)` | Optional per-question type for prompts and answer-entry behavior in a mixed set |

Exercise records have this shape:

```js
{
  id: "unique-within-the-set",
  prompt: "Display or deduplication text",
  expectedAnswer: "Answer as a string",
  data: { /* mode-specific fields */ },
}
```

Visual math screens render `data.functionLatex` as the question. Despite its name, this field contains the full integral expression for integral questions. Preserve that contract when adding another visual mode, or update [`Session.jsx`](src/components/Session.jsx) and [`Summary.jsx`](src/components/Summary.jsx) together.

The registered integral type delegates generation and checking to definite and indefinite implementations. Its records carry `data.integralType`; `typeForExercise` resolves the correct prompt and answer hint. `integralTypeOptions` drives the additional setup selector, and `options.integralType` carries its value to the generator. Difficulty travels separately as `options.difficulty`.

The derivative type retains the legacy ID `easy-derivatives`, even though it supports all three difficulty settings.

## Validation

Before submitting code changes, run:

```bash
npm test
npm run lint
npm run build
```

The existing tests cover symbolic equivalence, incomplete and incorrect input, unique generated prompts, acceptance of generated expected answers, difficulty-family selection, and integral type mixing. Full 100-question integral sets are checked for every type and difficulty in a worker, so a stalled generator can be stopped by the test timeout. Keyboard positioning tests simulate viewport changes, keyboard toggles, and manual scrolling. These tests do not run in a real browser or independently verify every generated mathematical solution.

Use `npm audit --omit=dev` to check production dependency advisories and `npm audit` to include the build tools. Commit `package-lock.json` with dependency changes; `npm ci` installs those locked versions.

For UI or session changes, manually check correct and incorrect feedback, Enter submission, next-question timing, and the final summary. Check early exit with no answers and with submitted answers, including cancelling the dialog and viewing partial results. On a phone, check that both the equation and full input are visible on each question and after hiding and reopening either keyboard, and that subsequent manual scrolling is respected. For MathLive styling changes, check fractions, nested expressions, narrow screens, and a device using dark mode.

## Production and offline support

Build with `npm run build` and serve `dist/` from a static host. For Vercel, use the Vite preset, `npm run build` as the build command, and `dist` as the output directory. No database or runtime environment configuration is needed. The manifest currently uses root-relative URLs and a `/` scope; serving under a subpath requires updating those settings as well as Vite's base path.

Vercel Web Analytics is mounted once in `src/main.jsx` for production builds. It tracks visits and page views; practice screens share the same URL. The component is disabled during `npm run dev`.

To activate collection, open the Vercel project's **Analytics** tab, select **Enable**, and deploy the updated app. Analytics endpoints are supplied by Vercel hosting, so local production previews do not provide the collection service. See the [Vercel Web Analytics setup guide](https://vercel.com/docs/analytics/quickstart).

[`vite.config.js`](vite.config.js) configures `vite-plugin-pwa` to generate the manifest and service worker. The precache includes HTML, JavaScript, CSS, icons, fonts, and keyboard sounds. MathLive assets are served from `public/`, and Fontsource interface fonts are bundled locally. All practice modes work offline once the production assets have been cached and **Ready to practice offline** appears.

Updates use a prompt. During a set, the app asks the user to finish before reloading; **Update app** becomes available outside an active set. Cached assets can be cleared or evicted by the browser, and downloading an update requires a connection. Offline support does not persist session progress.

Installation is optional. On iPhone/iPad, open the deployed HTTPS app in Safari and use Share → Add to Home Screen. On other supported browsers, use the install option when offered.

### Checking offline behavior locally

```bash
npm run build
npm run preview
```

1. Open the localhost URL online and wait for the offline-ready message.
2. Set the browser's DevTools Network panel to Offline and reload.
3. Try multiplication, derivatives, and both integral types; check math fonts and input.
4. Return online when checking update prompts with a subsequent build.

Service workers require HTTPS or localhost. A plain HTTP LAN URL opened on a phone does not satisfy this requirement.

MathLive and the symbolic engine make the JavaScript bundle relatively large. Vite can emit a chunk-size warning on successful builds. The service worker's maximum precache file size is explicitly set to 8 MiB; revisit it if the bundle grows or is split.
