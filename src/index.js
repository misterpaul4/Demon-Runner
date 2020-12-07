import Phaser from 'phaser';
import config from './config/phaserConfig';
import './style.css';

const game = new Phaser.Game(config);

export default {
  game,
};