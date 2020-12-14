import Phaser from 'phaser';
import background from '../assets/background.jpg';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'BootScene',
    });
  }

  preload() {
    this.load.image('background', background);
  }

  create() {
    this.scene.start('PreloaderScene');
  }
}