import Phaser from 'phaser';
import BootScene from './scenes/bootScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  scene: [
    BootScene,
  ],
};

const game = new Phaser.Game(config);
