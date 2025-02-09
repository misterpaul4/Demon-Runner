import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import hoverEffect from '../../utils/hoverEffect';
import Form from '../../utils/usernameForm';
import config from '../../utils/config';
import { fetchUserBestScore } from '../../utils/leaderBoardAPI';
export class MainMenu extends Scene {
    background: GameObjects.Image;
    startBtn: GameObjects.Image;
    resetBtn: GameObjects.Image;
    leaderboardBtn: GameObjects.Image;

    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.setPath('assets');

        this.load.spritesheet('player', 'characterSprite2.png', {
          frameWidth: 500,
          frameHeight: 632,
        });
        this.load.spritesheet('bird', 'birdSprite.png', {
          frameHeight: 416,
          frameWidth: 416,
        });
      }

    create() {
        this.background = this.add.image(400, 225, 'background');
        this.startBtn = this.add.image(400, 150, 'startBtn');
        this.resetBtn = this.add.image(400, 230, 'resetBtn');
        this.leaderboardBtn = this.add.image(400, 350, 'leaderboard');

        // Add hover effects
        hoverEffect(this.startBtn, 1.05);
        hoverEffect(this.resetBtn, 1.05);
        hoverEffect(this.leaderboardBtn, 1.05);

        EventBus.emit('current-scene-ready', this);

    if (config.username) {
      Form.display(config.username, this);
    } else {
      Form.enter(this);
    }

    this.startBtn.on('pointerup', this.changeScene.bind(this));

    this.resetBtn.on('pointerup', () => {
      localStorage.clear();
      window.location.reload();
    });

    this.leaderboardBtn.on('pointerup', () => {
      this.scene.start('Rank');
    });
    }

    async changeScene() {
        if (config.username) {
            if (!config.bestScore) {
                await fetchUserBestScore();
            }
            this.scene.start('Game');
          } else {
            // display warning
            const alertBox = document.querySelector('.username-alert');
            alertBox?.classList.add('show-warning');
          }
    }
}
