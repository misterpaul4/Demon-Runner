import { ref, get, orderByValue, query, limitToLast, set } from "firebase/database";
import { firebaseDB } from "../main";
import config from "./config";

const ROOT = "demonRunner";

// The caller decides whether this score is worth persisting (a new best); this
// just writes it. Keeping the "is it a best?" decision in one place avoids the
// trap of comparing against a config.bestScore the caller already bumped.
const uploadScore = async (score: number) => {
    if (!firebaseDB || !config.username) return score;
    await set(ref(firebaseDB, `${ROOT}/${config.username}`), score);
    return score;
};

const getUsers = async (): Promise<Record<string, number> | undefined> => {
    if (!firebaseDB) return undefined;
    try {
        const snapshot = await get(
            query(ref(firebaseDB, ROOT), orderByValue(), limitToLast(config.ranks)),
        );
        return snapshot.exists() ? snapshot.val() : undefined;
    } catch (error) {
        console.error("Could not read leaderboard:", error);
        return undefined;
    }
};

const fetchUserBestScore = async () => {
    if (!firebaseDB || !config.username) return;
    try {
        const data = await get(ref(firebaseDB, `${ROOT}/${config.username}`));
        if (data.exists()) config.bestScore = data.val();
    } catch (error) {
        console.error("Could not read best score:", error);
    }
};

export { uploadScore, getUsers, fetchUserBestScore };
