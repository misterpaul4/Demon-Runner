import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameScene',
    });

    this.jumps = 0;
  }
  // preload() {
  //   this.load.image('ground', ground);
  // }

  create() {
    this.add.image(400, 225, 'background');
    const platforms = this.physics.add.staticGroup();
    platforms.create(405, 420, 'ground');

    this.stones = this.physics.add.group({
      key: 'stone',
      setXY: {
        x: 300,
        y: 370,
      },
      allowGravity: false,
    });

    // this.stones = platforms.create(300, 370, 'stone');
    // const {
    //   body,
    // } = ground;
    // body.updateFromGameObject();

    this.player = this.physics.add.sprite(80, 180, 'player').setScale(0.1);
    this.physics.add.collider(platforms, this.player);
    // this.physics.add.collider(this.player, this.stone, this.hitStone(), null, this);
    this.player.setBounce(0.15);

    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();

    // this.player.body.checkCollision.up = false;
    // this.player.body.checkCollision.left = false;
    // this.player.body.checkCollision.right = false;

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
    if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.touching.down) {
      this.jump();
      // this.player.setVelocityX(70);
    } else if (this.player.body.touching.down) {
      this.player.anims.play('run', true);
      // this.player.setVelocityX(70);
    }
  }

  jump() {
    this.player.setVelocityY(-450);
    this.player.anims.play('jump', true);
  }

  // static hitStone() {
  //   this.physics.pause();
  //   this.player.setTint(0xff0000);
  //   this.player.anims.play('jump');
  //   console.log('dead');
  // }
}