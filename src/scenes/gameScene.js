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

    this.groundY = 400;
    this.groundX = 900;

    // first ground platform
    this.platforms.create(400, this.groundY + 30, 'ground');

    this.player = this.physics.add.sprite(50, 350, 'player').setScale(0.1);

    this.player.setBounce(0.15);
    // this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(this.platforms, this.player);
    // this.physics.add.collider(this.platforms, this.stones);
    // this.physics.add.collider(this.stones, this.player, this.hitStone(), null, this);

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
    this.input.keyboard.on('keydown-UP', this.jump, this);

    this.player.jumps = settings.jumps;

    // this.platforms.checkWorldBounds = true;
    // this.platforms.outOfBoundsKill = true;
    // console.log(`first platform = ${this.platforms.getChildren()[1].x}`);

    for (let i = 0; i < 20; i += 1) {
      this.addPlatform();
    }
  }

  update() {
    this.movement();

    // check whether to create a platform or reuse
  }

  addPlatform() {
    // if platforms are available
    // if (this.platforms.getLength()) {
    //   // get first platform
    //   const platform = this.platforms.getChildren()[0];
    //   // change position of the platform
    //   platform.x = posX;
    // }
    //  create platforms on the fly if there are none
    const platform = this.platforms.create(this.groundX, this.groundY, 'ground').setOrigin(0);
    platform.displayWidth = Phaser.Math.Between(
      settings.groundSizeRange[0], settings.groundSizeRange[1],
    );
    this.groundX += (platform.displayWidth + Phaser.Math.Between(
      settings.groundSpaceRange[0], settings.groundSpaceRange[1],
    ));

    const {
      body,
    } = platform;
    body.updateFromGameObject();
  }

  movement() {
    if (this.player.body.touching.down) {
      this.player.anims.play('run', true);
      this.player.clearTint();
      this.player.jumps = settings.jumps;
    }
  }

  jump() {
    if (this.player.jumps > 0) {
      this.player.setVelocityY(-settings.jumpForce);
      this.player.anims.play('jump', true);
      this.player.setTint(0xff0000);
      this.player.jumps -= 1;
    }
  }

  hitStone() {
    // this.physics.pause();
    this.player.setTint(0xff1000);
  }
}