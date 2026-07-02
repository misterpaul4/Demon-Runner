// Captures the browser's install prompt so the menu can offer a proper
// "install app" button. Chrome fires `beforeinstallprompt` once the PWA
// criteria are met — we stash it (the default mini-infobar is suppressed)
// and replay it when the player taps install.

type BeforeInstallPromptEvent = Event & {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(available: boolean) => void>();

function notify() {
    listeners.forEach((fn) => fn(deferred !== null));
}

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferred = e as BeforeInstallPromptEvent;
        notify();
    });
    window.addEventListener('appinstalled', () => {
        deferred = null;
        notify();
    });
}

export function installAvailable() {
    return deferred !== null;
}

export async function promptInstall() {
    if (!deferred) return false;
    const event = deferred;
    // a stashed prompt is single-use; Chrome refires beforeinstallprompt
    // later if the user dismisses, which re-shows the button via notify()
    deferred = null;
    notify();
    await event.prompt();
    const choice = await event.userChoice;
    return choice.outcome === 'accepted';
}

export function onInstallAvailability(fn: (available: boolean) => void) {
    listeners.add(fn);
    return () => {
        listeners.delete(fn);
    };
}
