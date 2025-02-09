import { ref, get, orderByValue, query, limitToLast, set } from "firebase/database";
import { firebaseDB } from "../main";
import config from './config'

const uploadScore = async (score: number) => {
    if (score > config.bestScore) {
        const scoresRef = ref(firebaseDB, `demonRunner/${config.username}`);
        await set(scoresRef, score);
        config.bestScore = score
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

const fetchUserBestScore = async () => {
    const scoresRef = ref(firebaseDB, `demonRunner/${config.username}`);
    const data = await get(scoresRef);

    if (data.exists()) {
        config.bestScore = data.val();
    }
};

export { uploadScore, getUsers, fetchUserBestScore };