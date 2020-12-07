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
// import '../style.css';
import username from '../utils/usernameForm';

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
    // const gameTitle = this.add.text(230, 20, 'Demon Runner');
    // gameTitle.setFontSize('50px');

    const startBtn = this.add.image(400, 150, 'startBtn');
    const leaderboard = this.add.image(400, 300, 'leaderboard');

    // Add hover effects
    setMouseScale(startBtn, 1.05);
    setMouseScale(leaderboard, 1.05);

    const usname = localStorage.getItem('username');

    if (usname) {
      username.display(usname, this);
    } else {
      username.enter(this);
    }

    startBtn.on('pointerup', () => {
      if (localStorage.getItem('username')) {
        this.scene.start('GameScene');
      }
    });
  }
}