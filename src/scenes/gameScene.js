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
    this.platforms = this.physics.add.staticGroup({

      // once a platform is removed, it's added to the pool
      removeCallback(platform) {
        platform.scene.platformPool.add(platform);
      },
    });

    // pool
    this.platformPool = this.add.group({

      // once a platform is removed from the pool, it's added to the active platforms group
      removeCallback(platform) {
        platform.scene.platforms.add(platform);
      },
    });

    // const groundY = 420;
    const groundY = 420;
    let groundX = 0;

    // add 5 ground
    for (let i = 0; i < 25; i += 1) {
      const platform = this.platforms.create(groundX, groundY, 'ground').setOrigin(0);
      platform.displayWidth = Phaser.Math.Between(50, 801);
      groundX += (platform.displayWidth + settings.groundSpace);

      const {
        body,
      } = platform;
      body.updateFromGameObject();
    }

    // this.stones = this.physics.add.group({
    //   key: 'stone',
    //   setXY: {
    //     x: 1000,
    //     y: 30,
    //     stepX: 400,
    //   },
    //   repeat: 2,
    // });
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
    // console.log(`first platform = ${this.platforms.getChildren()[1].x}`);
  }

  update() {
    this.movement();
  }

  // addPlatform(platformWidth, posX) {
  //   let platform;
  //   if (this.platformPool.getLength()) {
  //     platform = this.platformPool.getFirst();
  //     platform.x = posX;
  //     platform.active = true;
  //     platform.visible = true;
  //     this.platformPool.remove(platform);
  //   }
  //   else {
  //     platform = this.physics.add.sprite(posX, game.config.height * 0.8, "platform");
  //     platform.setImmovable(true);
  //     platform.setVelocityX(gameOptions.platformStartSpeed * -1);
  //     this.platformGroup.add(platform);
  //   }
  //   platform.displayWidth = platformWidth;
  //   this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);
  // }

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