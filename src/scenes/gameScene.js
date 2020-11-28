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

    for (let i = 0; i < 3; i += 1) {
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
        x: 300,
        y: 370,
        stepX: 400,
      },
      repeat: 0,
      allowGravity: false,
      immovable: true,
    });

    this.player = this.physics.add.sprite(50, 350, 'player').setScale(0.1);

    this.player.setBounce(0.15);
    // this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();

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

    this.physics.add.collider(this.platforms, this.player);
    // this.physics.add.collider(this.player, this.stones, this.hitStone(), null, this);

    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.top = false;

    // camera.startFollow(gameObject, roundPx, lerpX, lerpY, offsetX, offsetY);
    this.cameras.main.startFollow(this.player, false, 1, 0, -200, 125);

    this.player.setVelocityX(settings.gameSpeed);
  }

  update() {
    this.movement();
  }

  movement() {
    if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.touching.down) {
      this.jump();
    } else if (this.player.body.touching.down) {
      this.player.anims.play('run', true);
    }
  }

  jump() {
    this.player.setVelocityY(-settings.jumpForce);
    this.player.anims.play('jump', true);
  }

  hitStone() {
    this.physics.pause();
    this.player.setTint(0xff0000);
  }
}