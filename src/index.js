import Phaser from 'phaser';
import BootScene from './scenes/bootScene';
import PreloaderScene from './scenes/preloaderScene';
import TitleScene from './scenes/titleScene';
import GameScene from './scenes/gameScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,

  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 300,
      },
      debug: false,
    },
  },

  scene: [
    BootScene,
    PreloaderScene,
    TitleScene,
    GameScene,
  ],
};

const game = new Phaser.Game(config);

export default {
  game,
};