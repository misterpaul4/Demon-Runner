import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText: Phaser.GameObjects.Text;

    constructor() {
        super('GameOver');
    }

    create() {
        this.add.image(400, 180, 'gameOver').setScale(0.4).setScrollFactor(0, 1);
        const restartBtn = this.add.image(250, 350, 'restartBtn').setScrollFactor(0, 1);
        const quitBtn = this.add.image(520, 350, 'quitBtn').setScrollFactor(0, 1);

        quitBtn.setInteractive();
        restartBtn.setInteractive();

        quitBtn.on('pointerup', () => {
          this.scene.stop('Game');
          this.scene.start('MainMenu');
        });

        restartBtn.on('pointerup', () => {
          this.scene.stop('Game');
          this.scene.start('Game');
        });

        EventBus.emit('current-scene-ready', this);
    }

    changeScene() {
        this.scene.start('MainMenu');
    }
}
