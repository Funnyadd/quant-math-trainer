import { useState } from "react";
import { exerciseTypes } from "./exercises.js";
import { usePractice } from "./usePractice.js";
import PwaStatus from "./components/PwaStatus.jsx";
import Setup from "./components/Setup.jsx";
import Session from "./components/Session.jsx";
import Summary from "./components/Summary.jsx";
import EndSetDialog from "./components/EndSetDialog.jsx";
import "./index.css";

export default function App() {
    const [typeId, setTypeId] = useState(exerciseTypes[0].id);
    const type = exerciseTypes.find((item) => item.id === typeId);
    const practice = usePractice(type);
    const [endDialogOpen, setEndDialogOpen] = useState(false);

    function requestEndSet() {
        if (practice.session?.results.length) {
            practice.pause();
            setEndDialogOpen(true);
            return;
        }

        if (window.confirm("End this set? Your current progress will be lost.")) {
            practice.reset();
        }
    }

    return (
        <div className="app">
            <header>
                <a
                    className="brand"
                    href="./"
                    onClick={(event) => {
                        event.preventDefault();

                        if (practice.session && practice.session.phase !== "summary") {
                            requestEndSet();
                        } else {
                            practice.reset();
                        }
                    }}
                >
                    <span className="brand-icon" aria-hidden="true">
                        q.
                    </span>
                    Quant Math Trainer
                </a>
                <span className="header-note">A sharper mind, one set at a time.</span>
            </header>

            <main>
                {!practice.session ? (
                    <Setup
                        type={type}
                        onTypeChange={setTypeId}
                        onStart={practice.start}
                    />
                ) : practice.session.phase === "summary" ? (
                    <Summary
                        type={type}
                        results={practice.session.results}
                        plannedCount={practice.session.exercises.length}
                        onRepeat={() => practice.start(practice.session.exercises.length, practice.session.options)}
                        onReset={practice.reset}
                    />
                ) : (
                    <Session
                        type={type}
                        session={practice.session}
                        elapsedMs={practice.elapsedMs}
                        onSubmit={practice.submit}
                        onNext={practice.next}
                        onReset={requestEndSet}
                    />
                )}
            </main>

            {endDialogOpen && (
                <EndSetDialog
                    completed={practice.session.results.length}
                    onCancel={() => {
                        setEndDialogOpen(false);
                        practice.resume();
                    }}
                    onQuit={() => {
                        setEndDialogOpen(false);
                        practice.reset();
                    }}
                    onResults={() => {
                        setEndDialogOpen(false);
                        practice.finish();
                    }}
                />
            )}

            <PwaStatus
                activeSession={Boolean(
                    practice.session && practice.session.phase !== "summary",
                )}
            />

            <footer>No rush between exercises. Just you and the numbers.</footer>
        </div>
    );
}
