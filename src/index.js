import Phaser from 'phaser';
import BootScene from './scenes/bootScene';
import PreloaderScene from './scenes/preloaderScene';
import titleScene from './scenes/titleScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  scene: [
    BootScene,
    PreloaderScene,
    titleScene,
  ],
};

const game = new Phaser.Game(config);
