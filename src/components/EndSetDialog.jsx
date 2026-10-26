import { useEffect, useRef } from "react";

export default function EndSetDialog({ completed, onCancel, onQuit, onResults }) {
    const dialog = useRef(null);
    const cancelButton = useRef(null);

    useEffect(() => {
        const element = dialog.current;
        element.showModal();
        cancelButton.current.focus();
        return () => element.close();
    }, []);

    return (
        <dialog
            ref={dialog}
            className="end-set-dialog"
            aria-labelledby="end-set-title"
            aria-describedby="end-set-description"
            onCancel={(event) => {
                event.preventDefault();
                onCancel();
            }}
        >
            <h2 id="end-set-title">End this set?</h2>
            <p id="end-set-description" className="intro">
                You’ve answered {completed} {completed === 1 ? "exercise" : "exercises"}.
                View your results so far, or quit and discard them.
            </p>
            <button className="primary" onClick={onResults}>See results</button>
            <button className="secondary" onClick={onQuit}>Quit without results</button>
            <button ref={cancelButton} className="secondary" onClick={onCancel}>
                Keep practising
            </button>
        </dialog>
    );
}
