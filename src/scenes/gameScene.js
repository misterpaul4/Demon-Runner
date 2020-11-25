import Phaser from 'phaser';

// TODO: add animation for player spritesheet
// TODO: add jumping image and animation to spritesheet

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
    const ground = platforms.create(400, 420, 'ground');

    const {
      body,
    } = ground;
    body.updateFromGameObject();

    player = this.physics.add.sprite(80, 180, 'player').setScale(0.4);
    this.physics.add.collider(platforms, player);

    player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 11,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: 'jump',
      frames: [{
        key: 'player',
        frame: 12,
      }],
    });
  }

  update() {
    cursors = this.input.keyboard.createCursorKeys();

    if ((cursors.space.isDown || cursors.up.isDown) && player.body.touching.down) {
      player.setVelocityY(-550);
      player.anims.play('jump', true);
    } else if (player.body.touching.down) {
      player.anims.play('run', true);
    }
  }
}