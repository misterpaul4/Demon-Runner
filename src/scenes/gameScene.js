import Phaser from 'phaser';
import settings from '../config/gameConfig';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameScene',
    });
  }

  create() {
    this.add.image(400, 225, 'background').setScrollFactor(0, 1);
    this.platforms = this.physics.add.staticGroup();
    // first platform

    // const groundY = 420;
    const groundY = 420;
    let groundX = 0;

    // add 5 ground
    for (let i = 0; i < 5; i += 1) {
      const platform = this.platforms.create(groundX, groundY, 'ground');
      groundX += (platform.displayWidth + 80);

      const {
        body,
      } = platform;
      body.updateFromGameObject();
    }

    this.stones = this.physics.add.group({
      key: 'stone',
      setXY: {
        x: 1000,
        y: 30,
        stepX: 400,
      },
      repeat: 2,
    });
    this.player = this.physics.add.sprite(50, 350, 'player').setScale(0.1);

    this.player.setBounce(0.15);
    // this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(this.platforms, this.player);
    this.physics.add.collider(this.platforms, this.stones);
    this.physics.add.collider(this.stones, this.player, this.hitStone(), null, this);

    // camera.startFollow(gameObject, roundPx, lerpX, lerpY, offsetX, offsetY);
    this.cameras.main.startFollow(this.player, false, 1, 0, -200, 125);

    this.player.setVelocityX(settings.gameSpeed);

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 11,
      }),
      frameRate: 22,
      repeat: -1,
    });

    this.anims.create({
      key: 'jump',
      frames: [{
        key: 'player',
        frame: 12,
      }],
    });

    this.input.keyboard.on('keydown-SPACE', this.jump, this);
  }

  update() {
    this.movement();
  }

  movement() {
    if (this.player.body.touching.down) {
      this.player.anims.play('run', true);
      this.player.clearTint();
      settings.jumps = 2;
    }
  }

  jump() {
    if (settings.jumps > 0) {
      this.player.setVelocityY(-settings.jumpForce);
      this.player.anims.play('jump', true);
      this.player.setTint(0xff0000);
      settings.jumps -= 1;
    }
  }

  hitStone() {
    // this.physics.pause();
    this.player.setTint(0xff1000);
  }
}