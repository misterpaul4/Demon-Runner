import Phaser from 'phaser';
import { getUsers } from '../utils/leaderBoardAPI';
import settings from '../config/gameConfig';
import backBtn from '../assets/back_btn.png';

export default class RankScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'RankScene',
    });
  }

  preload() {
    this.load.image('backBtn', backBtn);
    const formContainer = document.getElementById('userForm');
    document.body.removeChild(formContainer);
  }

  create() {
    this.add.image(400, 225, 'background');
    const backBtn = this.add.image(80, 400, 'backBtn').setScale(0.2);

    backBtn.setInteractive();
    backBtn.on('pointerup', () => {
      this.scene.start('TitleScene');
    });

    this.add
      .text(settings.gameWidth / 2, 100, `TOP ${settings.ranks} SCORES`, {
        font: '25px Ariel',
        fill: '#ffffff',
        fontStyle: 'bolder',
      })
      .setOrigin(0.5);

    const loadingText = this.add
      .text(settings.gameWidth / 2, 260, 'Loading...', {
        font: '18px',
        fill: '#ffffff',
      })
      .setOrigin(0.5);

    const multiplier = 25;

    getUsers()
      .then((players) => {
        loadingText.setVisible(false);

        players = Object.values(
          players.reduce((acc, el) => {
            acc[el.user] = acc[el.user] || {
              user: el.user,
              score: 0,
            };
            acc[el.user].score = acc[el.user].score < el.score ? el.score : acc[el.user].score;
            return acc;
          }, {}),
        );

        players = players.sort((a, b) => b.score - a.score);
        players = players.slice(0, settings.ranks);

        players.forEach((player, index) => {
          this.add
            .text(
              settings.gameWidth / 2.6,
              multiplier * (index + 6),
              `${index + 1}`,
              {
                font: '15px Sans-serif',
                fill: '#ffffff',
              },
            )
            .setOrigin(1, 0.5);

          this.add
            .text(
              settings.gameWidth / 2.6 + 10,
              multiplier * (index + 6),
              `${player.user}`,
              {
                font: '15px Sans-serif',
                fill: '#ffffff',
              },
            )
            .setOrigin(0, 0.5);

          this.add
            .text(
              settings.gameWidth / 2.6 + 200,
              multiplier * (index + 6),
              `${player.score}`,
              {
                font: '15px Sans-serif',
                fill: '#ffffff',
              },
            )
            .setOrigin(1, 0.5);
        });
      })
      .catch(() => {});
  }
}
