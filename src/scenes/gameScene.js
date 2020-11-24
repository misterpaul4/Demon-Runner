import Phaser from 'phaser';
import ground from '../assets/ground.png';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameScene',
    });
  }

  preload() {
    this.load.image('ground', ground);
  }

  create() {
    this.add.image(400, 225, 'background');
    const platforms = this.physics.add.staticGroup();
    const ground = platforms.create(400, 420, 'ground');
    ground.scale = 2;

    const {
      body,
    } = ground;
    body.updateFromGameObject();
  }
}