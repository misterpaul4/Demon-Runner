import Phaser from 'phaser';
import setMouseScale from '../utils/hoverEffect';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'TitleScene',
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