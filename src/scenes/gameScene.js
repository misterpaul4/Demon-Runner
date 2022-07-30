import Phaser from 'phaser';
import settings from '../config/gameConfig';
import { uploadScore } from '../utils/leaderBoardAPI';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameScene',
    });
  }

  create() {
    this.add.image(400, 225, 'background').setScrollFactor(0, 1);
    this.platforms = this.physics.add.staticGroup();

    // score label
    this.scoreLabel = this.add.text(30, 20, 'Time:\t\t\t0', {
      font: '30px Arial',
      fill: '#fff',
    }).setScrollFactor(0, 1);

    // initialize score
    this.score = 0;

    // get user best score
    this.bestScore = localStorage.getItem('best score') || 0;
    this.bestScoreLabel = this.add.text(30, 60, `Best Time:\t\t\t${this.bestScore}`, {
      font: '30px Arial',
      fill: '#fff',
    }).setScrollFactor(0, 1);

    // timer to increase score
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // initial ground position
    this.groundY = 400;
    this.groundX = 900;

    // first ground platform
    this.platforms.create(400, this.groundY + 30, 'ground');

    this.player = this.physics.add.sprite(50, 350, 'player').setScale(0.1);

    this.player.setBounce(0.15);
    // this.player.setCollideWorldBounds(true);

    // camera.startFollow(gameObject, roundPx, lerpX, lerpY, offsetX, offsetY);
    this.cameras.main.startFollow(this.player, false, 1, 0, -200, 125);

    // set player velocity
    this.player.setVelocityX(settings.gameSpeed);

    // checks if player landed on the floor
    this.player.hitGround = false;

    // set space key and up-arrow key for jumping
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', this.jump, this);
    this.input.keyboard.on('keydown-UP', this.jump, this);

    // initialize number of jumps for the player
    this.player.jumps = settings.jumps;

    this.player.body.pushable = false;

    // timer for raven attack
    this.time.addEvent({
      delay: 3000,
      callback: this.ravenAttack,
      callbackScope: this,
      loop: true,
    });

    // create 4 platforms
    for (let i = 0; i < 4; i += 1) {
      this.createPlatform();
    }

    // RAVEN
    this.bird = this.physics.add.sprite(900, 100, 'bird').setScale(0.17);
    this.bird.body.setAllowGravity(false);

    // set raven velocity 50 dist/s less than player speed
    this.bird.setVelocityX(-(settings.gameSpeed - 50));

    // set collisions
    this.physics.add.collider(this.platforms, this.player, this.hitFloor, null, this);
    this.physics.add.collider(this.bird, this.player, this.hitRaven, null, this);

    // player animation
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

    // bird animation
    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('bird', {
        start: 0,
        end: 10,
      }),
      frameRate: 8,
      repeat: -1,
    });

    // timer for running sound
    this.time.addEvent({
      delay: 285,
      callback: () => {
        if (this.player.body.touching.down) {
          this.sound.play('runSound');
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    this.movement();
    this.checkPlatform();
    // check if player fell down or is moving backward due to impact
    if (this.player.y > 480 || this.player.body.velocity.x < settings.gameSpeed) {
      this.die();
    }
  }

  ravenAttack() {
    // reposition raven position
    this.bird.x = this.player.x + 1000;
    this.bird.y = Phaser.Math.Between(150, 370);
    this.sound.play('birdSound');
  }

  checkPlatform() {
    // destroy and reposition the ground platform
    this.platforms.getChildren().forEach((platform) => {
      if (this.player.x > (platform.x + 1000)) {
        this.createPlatform();
        this.platforms.killAndHide(platform);
        this.platforms.remove(platform);
      }
    });
  }

  createPlatform() {
    this.newPlatform = this.platforms.create(this.groundX, this.groundY, 'ground').setOrigin(0);
    this.newPlatform.displayWidth = Phaser.Math.Between(
      settings.groundSizeRange[0], settings.groundSizeRange[1],
    );
    this.groundX += (this.newPlatform.displayWidth + Phaser.Math.Between(
      settings.groundSpaceRange[0], settings.groundSpaceRange[1],
    ));

    const {
      body,
    } = this.newPlatform;
    body.updateFromGameObject();
  }

  movement() {
    this.bird.anims.play('fly', true);
    if (this.player.body.touching.down) {
      this.player.anims.play('run', true);
      this.player.clearTint();
      // reset jumps
      this.player.jumps = settings.jumps;
    }
  }

  jump() {
    if (this.player.jumps > 0) {
      this.player.setVelocityY(-settings.jumpForce);
      this.player.anims.play('jump', true);
      this.player.setTint(0xff0000);
      this.player.jumps -= 1;
      this.sound.play('jumpSound');
      this.player.hitGround = true;
    }
  }

  hitRaven() {
    this.bird.setTint(0xff1000);
    this.die();
  }

  hitFloor() {
    if (this.player.hitGround) {
      this.sound.play('hitGroundSound');
      this.player.hitGround = false;
    }
  }

  updateTimer() {
    this.score += 1;
    this.scoreLabel.setText(`Time:\t\t\t${this.score}`);
    // check for new best
    if (this.score > Number(this.bestScore)) {
      this.bestScoreLabel.setText(`Best Time:\t\t\t${this.score}`);
    }
  }

  die() {
    this.sound.play('gameOverSound');
    this.scene.pause('GameScene');

    // upload score
    uploadScore(localStorage.getItem('username'), this.score).then(() => {
      // update bestscore
      if (this.score > Number(this.bestScore)) {
        localStorage.setItem('best score', this.score);
      }
      this.scene.launch('GameOverScene', this);
    }).catch(() => {});
  }
}