import Phaser from 'phaser';
let player;
let cursors;
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameScene',
    });
  }

  // preload() {
  //   this.load.image('ground', ground);
  // }

  create() {
    this.add.image(400, 225, 'background');
    const platforms = this.physics.add.staticGroup();
    const ground = platforms.create(400, 420, 'ground').setScale(2);

    const {
      body,
    } = ground;
    body.updateFromGameObject();

    player = this.physics.add.sprite(80, 225, 'player').setScale(0.1);
    this.physics.add.collider(platforms, player);
  }

  update() {
    cursors = this.input.keyboard.createCursorKeys();

    if (cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-550);
    }
  }
}