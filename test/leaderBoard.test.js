import { uploadScore, getUsers, fetchUserBestScore } from '../src/utils/leaderBoardAPI';

describe('uploading player score', () => {
  test('expect score to be uploaded and retrieved from service', () => {
    // upload score
    uploadScore('joe', 2);
    getUsers().then((players) => {
      // last uploaded player
      const player = players.slice(players.length - 1, players.length);
      expect(player.user).toBe('joe');
      expect(player.score).toBe(2);
    });
  });
});

describe('fetching user highest score', () => {
  test("expect user's highest score to be 8", () => {
    uploadScore('joe', 2);
    uploadScore('joe', 8);
    uploadScore('joe', 7);
    fetchUserBestScore('joe').then(score => {
      expect(score).toBe(8);
    });
  });
});
