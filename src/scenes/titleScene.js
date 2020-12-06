import Phaser from 'phaser';
import setMouseScale from '../utils/hoverEffect';
import ground from '../assets/ground.png';
import player from '../assets/characterSprite2.png';
import bird from '../assets/birdSprite.png';
import jumpSound from '../assets/sound/jump.mp3';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'TitleScene',
    });
  }

  preload() {
    this.load.audio('jumpSound', jumpSound);
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
    this.add.text(350, 90, 'Demon Runner');

    const startBtn = this.add.image(400, 150, 'startBtn');
    const leaderboard = this.add.image(400, 300, 'leaderboard');

    // Add hover effects
    setMouseScale(startBtn, 1.05);
    setMouseScale(leaderboard, 1.05);

    startBtn.on('pointerup', () => {
      this.scene.start('GameScene');
    });
  }
}