import ReactDOM from "react-dom/client";
import { initializeApp } from "@firebase/app";
import { getDatabase, Database } from "firebase/database";
import App from "./App.tsx";

let firebaseDB: Database | null = null;

const env = import.meta.env;
if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID) {
    try {
        const app = initializeApp({
            apiKey: env.VITE_FIREBASE_API_KEY,
            authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
            databaseURL: env.VITE_FIREBASE_DB_URL
                || env.VITE_FIREBASE_DATABASE_URL
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

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
