import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import config from '../../utils/config';
import createTextLink from '../../utils/createTextLink';
export class MainMenu extends Scene {
    background: GameObjects.Image;
    startBtn: Phaser.GameObjects.Container;
    resetBtn: Phaser.GameObjects.Container;
    audioBtn: GameObjects.Image;

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
        const centerX = config.gameWidth / 2;
        const centerY = config.gameHeight / 2;

        this.background = this.add.image(centerX, centerY, 'background');
        this.background.setDisplaySize(config.gameWidth, config.gameHeight);

        this.add.text(centerX, 150, 'HIRO RUN', {
            fontFamily: 'Bushiroad',
            fontSize: '84px',
            color: '#c93a2f',
        }).setOrigin(0.5);

        this.startBtn = createTextLink(this, centerX, 0, 'start game', this.changeScene.bind(this), {
            fontSize: 40,
            color: '#ffffff',
            backgroundPaddingX: 56,
            underlineOffsetY: 18,
        });
        this.resetBtn = createTextLink(this, centerX, 0, 'clear record', () => {
            localStorage.removeItem('bestScore');
            window.location.reload();
        }, {
            fontSize: 40,
            color: '#ffffff',
            backgroundPaddingX: 56,
            underlineOffsetY: 18,
        });

        const buttonGap = 28;
        const totalHeight = this.startBtn.height + this.resetBtn.height + buttonGap;
        this.startBtn.setY(centerY - totalHeight / 2 + this.startBtn.height / 2);
        this.resetBtn.setY(centerY + totalHeight / 2 - this.resetBtn.height / 2);

        this.audioBtn = this.add.image(100, config.gameHeight - 70, config.sound ? 'muteBtn' : 'unmuteBtn');
        this.sound.mute = config.sound;
        this.audioBtn.setInteractive();
        this.audioBtn.on('pointerover', () => {
            this.audioBtn.setScale(1.05);
        });
        this.audioBtn.on('pointerout', () => {
            this.audioBtn.setScale(1);
        });

        EventBus.emit('current-scene-ready', this);

    this.audioBtn.on('pointerup', () => {
      config.sound = !config.sound;
      this.sound.mute = config.sound;

      if (config.sound) {
        this.audioBtn.setTexture('muteBtn');
      } else {
        this.audioBtn.setTexture('unmuteBtn');
      }

      localStorage.setItem('sound', String(config.sound));
    });
    }

    changeScene() {
        this.scene.start('Game');
    }
}
