// Tiny vibration cues — a large part of what makes a game feel native on
// Android. iOS ignores navigator.vibrate, so this is a silent no-op there.
export function buzz(pattern: number | number[]) {
    try {
        navigator.vibrate?.(pattern);
    } catch {
        // vibration blocked or unsupported — never let feedback crash the game
    }
}
