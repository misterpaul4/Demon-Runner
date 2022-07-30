import Phaser from 'phaser';
import setMouseScale from '../utils/hoverEffect';
import ground from '../assets/ground.png';
import player from '../assets/characterSprite2.png';
import bird from '../assets/birdSprite.png';
import jumpSound from '../assets/sound/jump.mp3';
import birdSound from '../assets/sound/crow.mp3';
import runSound from '../assets/sound/footstep.mp3';
import hitGroundSound from '../assets/sound/hitGround.mp3';
import gameOverSound from '../assets/sound/gameOver.mp3';
import username from '../utils/usernameForm';
import gameOverImg from '../assets/gameOver.png';
import restartBtn from '../assets/restart_btn.png';
import quitBtn from '../assets/quit_btn.png';
import backBtn from '../assets/back_btn.png';
import resetBtn from '../assets/reset_btn.png';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'TitleScene',
    });
  }

  preload() {
    this.load.audio('jumpSound', jumpSound);
    this.load.audio('birdSound', birdSound);
    this.load.audio('runSound', runSound);
    this.load.audio('hitGroundSound', hitGroundSound);
    this.load.audio('gameOverSound', gameOverSound);

    this.load.image('ground', ground);
    this.load.image('gameOverImage', gameOverImg);
    this.load.image('restartBtn', restartBtn);
    this.load.image('quitBtn', quitBtn);
    this.load.image('backBtn', backBtn);
    this.load.image('resetBtn', resetBtn);

    this.load.spritesheet('player', player, {
      frameWidth: 500,
      frameHeight: 632,
    });
    this.load.spritesheet('bird', bird, {
      frameHeight: 416,
      frameWidth: 416,
    });
  }

  create() {
    this.add.image(400, 225, 'background');

    const startBtn = this.add.image(400, 150, 'startBtn');
    const resetBtn = this.add.image(400, 230, 'resetBtn');
    const leaderboardBtn = this.add.image(400, 350, 'leaderboard');

    // Add hover effects
    setMouseScale(startBtn, 1.05);
    setMouseScale(resetBtn, 1.05);
    setMouseScale(leaderboardBtn, 1.05);

    const usname = localStorage.getItem('username') || '';

    if (usname) {
      username.display(usname, this);
    } else {
      username.enter(this);
    }

    startBtn.on('pointerup', () => {
      if (localStorage.getItem('username')) {
        this.scene.start('GameScene');
      } else {
        // display warning
        const alertBox = document.querySelector('.username-alert');
        alertBox.classList.add('show-warning');
      }
    });

    resetBtn.on('pointerup', () => {
      localStorage.clear();
      window.location.reload();
    });

    leaderboardBtn.on('pointerup', () => {
      this.scene.start('RankScene');
    });
  }
}