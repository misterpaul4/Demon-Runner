import Phaser from 'phaser';
import setMouseScale from '../utils/hoverEffect';
import ground from '../assets/ground.png';
import player from '../assets/characterSprite2.png';
import bird from '../assets/birdSprite.png';
import jumpSound from '../assets/sound/jump.mp3';
import birdSound from '../assets/sound/crow.mp3';
import '../style.css';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'TitleScene',
    });
  }

  preload() {
    this.load.audio('jumpSound', jumpSound);
    this.load.audio('birdSound', birdSound);

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

    startBtn.on('pointerup', () => {
      this.scene.start('GameScene');
    });

    const formContainer = document.createElement('form');
    const userInput = document.createElement('input');
    const submitBtn = document.createElement('input');
    userInput.id = 'username';
    userInput.placeholder = 'username';
    submitBtn.type = 'submit';

    formContainer.appendChild(userInput);
    formContainer.appendChild(submitBtn);
    document.body.appendChild(formContainer);
  }
}