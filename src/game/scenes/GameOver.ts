import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import settings from '../../utils/config';
import createTextLink from '../../utils/createTextLink';

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText: Phaser.GameObjects.Text;

    constructor() {
        super('GameOver');
    }

    create() {
        const centerX = settings.gameWidth / 2;
        const centerY = settings.gameHeight / 2;
        const buttonY = centerY + 18;

        this.add.rectangle(centerX, centerY, settings.gameWidth, settings.gameHeight, 0x040404, 0.42).setScrollFactor(0, 1);
        this.add.text(centerX, centerY - 120, 'GAME OVER', {
            fontFamily: 'Bushiroad',
            fontSize: '92px',
            color: '#f4f0d8',
        }).setOrigin(0.5).setScrollFactor(0, 1);

        const retryButton = createTextLink(this, 0, buttonY, 'retry game', () => {
            this.scene.stop('Game');
            this.scene.start('Game');
        }, {
            fontSize: 40,
            color: '#ffffff',
            backgroundPaddingX: 56,
            underlineOffsetY: 18,
        }).setScrollFactor(0, 1);

        const menuButton = createTextLink(this, 0, buttonY, 'back menu', () => {
            this.scene.stop('Game');
            this.scene.start('MainMenu');
        }, {
            fontSize: 40,
            color: '#ffffff',
            backgroundPaddingX: 56,
            underlineOffsetY: 18,
        }).setScrollFactor(0, 1);

        const buttonGap = 108;
        const totalWidth = retryButton.width + menuButton.width + buttonGap;
        retryButton.setX(centerX - totalWidth / 2 + retryButton.width / 2);
        menuButton.setX(centerX + totalWidth / 2 - menuButton.width / 2);

        EventBus.emit('current-scene-ready', this);
    }

    changeScene() {
        this.scene.start('MainMenu');
    }
}
