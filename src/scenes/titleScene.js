import Phaser from 'phaser';
import setMouseScale from '../utils/hoverEffect';
import ground from '../assets/ground.png';
import player from '../assets/characterSprite.png';
// import player from '../assets/character.png';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'TitleScene',
    });
  }

  preload() {
    this.load.image('ground', ground);
    this.load.spritesheet('player', player, {
      frameWidth: 200,
      frameHeight: 160,
    });
    // this.load.image('player', player);
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