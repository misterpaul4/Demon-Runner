import Phaser from 'phaser';
import startBtn from '../assets/start_btn.png';
import leaderBoard from '../assets/leaderboard.png';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'BootScene',
    });
  }

  preload() {
    this.load.image('start', startBtn);
    this.load.image('leaderboard', leaderBoard);
  }

  create() {
    this.scene.start('PreloaderScene');
  }
}