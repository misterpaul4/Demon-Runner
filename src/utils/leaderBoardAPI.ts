import { ref, get, orderByValue, query, limitToLast, set } from "firebase/database";
import { firebaseDB } from "../main";
import config from './config'

const uploadScore = async (username: string, score: number) => {
    const bestScore = await fetchUserBestScore(username);

    if (score > bestScore) {
        const scoresRef = ref(firebaseDB, `demonRunner/${username}`);
        await set(scoresRef, score);
    }

    return score
};

const getUsers = async (): Promise<Record<string, number> | undefined> => {
    const scoresRef = ref(firebaseDB, "demonRunner/");

    try {
        const snapshot = await get(query(scoresRef, orderByValue(), limitToLast(config.ranks)));
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            throw new Error("No data available");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

const fetchUserBestScore = async (username: string) => {
    const scoresRef = ref(firebaseDB, `demonRunner/${username}`);
    const data = await get(scoresRef);
    let bestScore = 0;

    if (data.exists()) {
        bestScore = data.val();
    }

    return bestScore;
};

export { uploadScore, getUsers, fetchUserBestScore };