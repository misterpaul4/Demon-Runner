import Phaser from 'phaser';
import BootScene from './scenes/bootScene';
import PreloaderScene from './scenes/preloaderScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  scene: [
    BootScene,
    PreloaderScene,
  ],
};

const game = new Phaser.Game(config);
