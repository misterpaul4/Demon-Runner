import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameOverScene',
    });
  }

  create() {
    this.add.image(400, 180, 'gameOverImage').setScale(0.4).setScrollFactor(0, 1);
    const restartBtn = this.add.image(250, 350, 'restartBtn').setScrollFactor(0, 1);
    const quitBtn = this.add.image(520, 350, 'quitBtn').setScrollFactor(0, 1);

    quitBtn.setInteractive();
    restartBtn.setInteractive();

    quitBtn.on('pointerup', () => {
      this.scene.stop('GameScene');
      this.scene.start('TitleScene');
    });

    restartBtn.on('pointerup', () => {
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    });
  }
}