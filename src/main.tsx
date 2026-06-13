import ReactDOM from "react-dom/client";
import { initializeApp } from "@firebase/app";
import { getDatabase, Database } from "firebase/database";
import App from "./App.tsx";

// The leaderboard is optional. Without Firebase env vars the game still runs in
// full — it just keeps scores locally and the online board stays empty, instead
// of crashing on boot the way an unguarded getDatabase() would.
let firebaseDB: Database | null = null;

const env = import.meta.env;
if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID) {
    try {
        const app = initializeApp({
            apiKey: env.VITE_FIREBASE_API_KEY,
            authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
            // Realtime Database needs a URL. Use an explicit one if given,
            // otherwise fall back to the project's default instance — which is
            // what the original build relied on (it never set this).
            databaseURL: env.VITE_FIREBASE_DATABASE_URL
                || `https://${env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
            projectId: env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: env.VITE_FIREBASE_APP_ID,
        });
        firebaseDB = getDatabase(app);
    } catch (err) {
        console.warn("Leaderboard disabled — Firebase failed to initialise.", err);
    }
}

export { firebaseDB };

// No StrictMode: its dev-only double-mount creates and tears down the Phaser
// game twice, which leaves orphaned canvases and a stalled loader.
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
