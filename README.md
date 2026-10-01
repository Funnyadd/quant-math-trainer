# Quant Math Trainer

A mobile-first mental math practice app built with React and Vite. Practice two-digit multiplication and easy derivatives at your own pace, with timed exercises and a detailed summary of each set.

## Features

- **Two-digit multiplication:** numbers from 10 to 99, with no repeated pairs within a set.
- **Easy derivatives:** polynomials, powers, exponentials, square roots, reciprocals, fractions, and simple sums.
- **Flexible sets:** choose 1, 5, 10, or 20 exercises, or a custom count from 1 to 100.
- **Individual timing:** the timer starts when each exercise appears and stops when you confirm your answer. Breaks between exercises are excluded.
- **Manual progression:** review your answer before starting the next exercise.
- **Set summaries:** total time, average time, accuracy, and per-exercise answers and durations.
- **Installable and offline:** practice after the first successful online load, including locally cached fonts.
- **Visual math input:** insert variables, powers, exponentials, roots, and fractions with dedicated buttons and a math keyboard.
- **Accidental-exit protection:** confirmation before ending an unfinished set.

No accounts or backend are required. Sessions run in the browser and are not saved after a page reload.

## Tech stack

| Technology | Purpose |
| --- | --- |
| React | UI and session state |
| Vite | Development server and production builds |
| MathLive | Visual math input and equation rendering |
| Cortex Compute Engine | Parsing and symbolic answer comparison |
| CSS | Responsive layout and styling |
| Oxlint | JavaScript linting |
| Node.js test runner | Regression tests |

## Getting started

### Requirements

- Node.js **22.12 or later**; Node.js 24 is also supported.
- npm, included with Node.js.

### Install and run

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite.

To access the development server from a phone on the same network:

```bash
npm run dev -- --host 0.0.0.0
```

Open the network URL printed by Vite on your phone. Your computer's firewall must allow access to the development server.

## How to use

1. Choose a practice mode and set size.
2. Select **Start practice** to display the first exercise and start its timer.
3. Enter your answer and select **Confirm answer**, or press Enter.
4. Review the result, then select **Next exercise** when ready.
5. After the last exercise, select **View summary** to review the set.

For derivatives, use the toolbar to insert structured expressions. Tap the empty slots in a fraction, power, or root to fill them in. The math keyboard provides additional symbols.

Derivative answers are checked mathematically rather than by text alone. For example, reordered polynomial terms and simplified fractions can be accepted as equivalent answers. Symbolic comparison is conservative: some complex equivalent expressions may still be rejected when the engine cannot establish equality.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the production app into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |
| `npm test` | Run the regression tests |

## Project structure

```text
public/
  favicon.svg             Browser icon
  apple-touch-icon.png    iPhone/iPad home-screen icon
  fonts/                  Locally served MathLive fonts
  sounds/                 Locally served math keyboard sounds
  pwa-*.png               Installable app icons
src/
  components/
    Setup.jsx             Mode and set-size selection
    AnswerForm.jsx        Answer entry and submission
    Session.jsx           Active exercise and feedback
    Summary.jsx           Completed-set results
  App.jsx                 App shell and screen selection
  exercises.js            Multiplication definition and exercise registry
  derivatives.js          Derivative exercise generators
  usePractice.js          Timing and session progression
  MathInput.jsx           Math editor and read-only displays
  math.js                 Parsing and symbolic comparison
  format.js               Time formatting
  index.css               App styles
  main.jsx                React entry point
tests/
  math.test.js            Answer validation and set-generation tests
vite.config.js
```

## Adding a practice mode

Define a new exercise type and add it to `exerciseTypes` in `src/exercises.js`. Each type supplies its own set generator, input validation, answer checking, and solution formatting. Timing, progression, and summaries are shared by all modes.

Exercise records include an ID, prompt, expected answer, and mode-specific data. Answers are stored as strings so modes can support either numeric or symbolic input.

The current visual math screens use the derivative record's `data.functionLatex` field. A new visual exercise mode should update that display contract if its prompts are not functions to differentiate.

## Deploying to Vercel

1. Push the project to a Git repository.
2. Import the repository into Vercel.
3. Select the **Vite** framework preset.
4. Use `npm run build` as the build command and `dist` as the output directory.
5. Deploy.

No environment variables or database configuration are required.

## Assets and network access

The favicon and Apple touch icon use the app's green **q.** logo. MathLive fonts are served from `public/fonts/`. Interface fonts are bundled locally with Fontsource and cached for offline use.

The math editor and symbolic engine add significant weight to the production JavaScript bundle. Vite may report a bundle-size warning; this does not prevent a successful build.

## Install and use offline

The production app is a Progressive Web App (PWA). Its generated service worker precaches the app shell, JavaScript, styles, icons, and math/interface fonts. Both practice modes work offline after the first successful online load and the **Ready to practice offline** message.

- **iPhone/iPad:** open the deployed HTTPS URL in Safari, then Share → Add to Home Screen.
- **Android/Desktop:** use the browser's Install app or Add to Home Screen option when offered.

Installation is optional; offline caching works in the browser too. Browser storage can be cleared or evicted, requiring another online load. Sessions remain in memory: closing or reloading the app resets the current set.

Updates show a prompt instead of forcibly reloading an active set. Finish your set, then choose **Update app** when offered. New versions require an internet connection to download.

### Local offline check

```bash
npm run build
npm run preview
```

Open the localhost URL online and wait for the offline-ready message. Switch the browser's DevTools Network panel to Offline, reload, and try both modes. Service workers require HTTPS or localhost. A plain HTTP LAN address opened from your phone is insufficient. PWA caching is intentionally disabled during `npm run dev`.

PWA production verification: build, lint, and math regression tests passed. The generated cache was inspected for the app bundle, HTML, styles, icons, fonts, and keyboard sounds. An actual offline browser run was not available in the review environment.
