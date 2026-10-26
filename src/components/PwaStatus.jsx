import { useRegisterSW } from "virtual:pwa-register/react";

export default function PwaStatus({ activeSession }) {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW();

    if (!offlineReady && !needRefresh) return null;

    function dismiss() {
        setOfflineReady(false);
        setNeedRefresh(false);
    }

    return (
        <aside className="pwa-status" aria-label="App status">
            <p role="status">
                {needRefresh
                    ? activeSession
                        ? "An update is ready. Finish your set before reloading."
                        : "A new version is ready."
                    : "Ready to practice offline."}
            </p>
            {needRefresh && !activeSession && (
                <button type="button" onClick={() => updateServiceWorker(true)}>
                    Update app
                </button>
            )}
            <button type="button" onClick={dismiss}>
                {needRefresh ? "Later" : "Got it"}
            </button>
        </aside>
    );
}
