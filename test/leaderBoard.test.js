import { uploadScore, getUsers } from '../src/utils/leaderBoardAPI';

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
