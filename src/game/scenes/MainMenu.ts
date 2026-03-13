import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import hoverEffect from '../../utils/hoverEffect';
import config from '../../utils/config';
export class MainMenu extends Scene {
    background: GameObjects.Image;
    startBtn: GameObjects.Image;
    resetBtn: GameObjects.Image;
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
        this.background = this.add.image(400, 225, 'background');
        this.startBtn = this.add.image(400, 170, 'startBtn');
        this.resetBtn = this.add.image(400, 290, 'resetBtn');
        this.audioBtn = this.add.image(80, 400, config.sound ? 'muteBtn' : 'unmuteBtn');
        this.sound.mute = config.sound;

        // Add hover effects
        hoverEffect(this.startBtn, 1.05);
        hoverEffect(this.resetBtn, 1.05);
        hoverEffect(this.audioBtn, 1.05);

        EventBus.emit('current-scene-ready', this);

    this.startBtn.on('pointerup', this.changeScene.bind(this));

    this.resetBtn.on('pointerup', () => {
      localStorage.removeItem('bestScore');
      window.location.reload();
    });

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
