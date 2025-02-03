/* eslint-disable @typescript-eslint/no-explicit-any */

const baseUrl = 'https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/vNNYorW3U7bLbVIMpbN7/scores/';

const uploadScore = async (username: any, score: any) => {
  const data = {
    user: username,
    score,
  };

  const response = await fetch(baseUrl, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.ok;
};

const getUsers = async () => {
  const scores = await fetch(baseUrl, { method: 'GET' });
  const response = await scores.json();
  const allScores = response.result;
  return allScores;
};

const fetchUserBestScore = async (username: string) => {
  let bestScore = 0;
  const scores = await fetch(baseUrl, { method: 'GET' });
  const response = await scores.json();
  const allScores = response.result;
  allScores.forEach((name: any) => {
    if (name.user === username) {
      if (name.score > bestScore) {
        bestScore = name.score;
      }
    }
  });

  localStorage.setItem('best score', `${bestScore}`);
  return bestScore;
};

export { uploadScore, getUsers, fetchUserBestScore };