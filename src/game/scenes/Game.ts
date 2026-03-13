import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

import Phaser from 'phaser';
import settings from '../../utils/config';

export class Game extends Scene {
    background: Phaser.GameObjects.Image;
    platforms: Phaser.Physics.Arcade.StaticGroup;
    scoreLabel: Phaser.GameObjects.Text;
    scoreValueLabel: Phaser.GameObjects.Text;
    score: number;
    bestScore: number;
    bestScoreLabel: Phaser.GameObjects.Text;
    bestScoreValueLabel: Phaser.GameObjects.Text;
    groundY: number;
    groundX: number;
    player: Phaser.Physics.Arcade.Sprite;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    hitGround?: boolean;
    jumps: number;
    bird: Phaser.Physics.Arcade.Sprite;
    newPlatform: Phaser.Physics.Arcade.Sprite;
    isPaused: boolean;
    pauseLabel: Phaser.GameObjects.Text;

    constructor() {
        super({
            key: 'Game',
        });
    }

    create() {
        this.isPaused = false;
        this.background = this.add.image(settings.gameWidth / 2, settings.gameHeight / 2, 'background')
            .setScrollFactor(0, 1);
        this.background.setDisplaySize(settings.gameWidth, settings.gameHeight);
        this.platforms = this.physics.add.staticGroup();

        // score label
        this.scoreLabel = this.add.text(30, 20, 'Time:', {
            fontFamily: 'BrushScriptStd',
            fontSize: '42px',
            color: '#fff',
        }).setScrollFactor(0, 1);

        this.scoreValueLabel = this.add.text(150, 16, '0', {
            fontFamily: 'BrushScriptStd',
            fontSize: '42px',
            color: '#fff',
        }).setScrollFactor(0, 1);

        // initialize score
        this.score = 0;

        // get user best score
        this.bestScore = settings.bestScore
        this.bestScoreLabel = this.add.text(30, 60, 'Best Time:', {
            fontFamily: 'BrushScriptStd',
            fontSize: '30px',
            color: '#fff',
        }).setScrollFactor(0, 1);

        this.bestScoreValueLabel = this.add.text(195, 56, `${this.bestScore}`, {
            fontFamily: 'BrushScriptStd',
            fontSize: '42px',
            color: '#fff',
        }).setScrollFactor(0, 1);

        this.pauseLabel = this.add.text(settings.gameWidth / 2, settings.gameHeight / 2 - 30, 'PAUSED', {
            fontFamily: 'Bushiroad',
            fontSize: '72px',
            color: '#f4f0d8',
        }).setOrigin(0.5).setScrollFactor(0, 1).setVisible(false);

        // timer to increase score
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true,
        });

        // timer for running sound
        this.time.addEvent({
            delay: 285,
            callback: () => {
                if (!settings.sound && this.player.body?.touching.down) {
                    this.sound.play('run');
                }
            },
            callbackScope: this,
            loop: true,
        });

        // initial ground position
        this.groundY = settings.gameHeight - 110;
        this.groundX = settings.gameWidth + 100;

        // first ground platform
        this.platforms.create(settings.gameWidth / 2, this.groundY + 30, 'ground');

        this.player = this.physics.add.sprite(110, settings.gameHeight - 170, 'player').setScale(0.1);

        this.player.setBounce(0.15);

        this.cameras.main.startFollow(this.player, false, 1, 0, -320, 180);

        // set player velocity
        this.player.setVelocityX(settings.gameSpeed);

        if (this.input.keyboard) {
            // set space key and up-arrow key for jumping
            this.cursors = this.input.keyboard.createCursorKeys();
            this.input.keyboard.on('keydown-SPACE', this.jump, this);
            this.input.keyboard.on('keydown-UP', this.jump, this);
            this.input.keyboard.on('keydown-P', this.togglePause, this);
            this.input.keyboard.on('keydown-ESC', this.togglePause, this);
        }

        // initialize number of jumps for the player
        this.jumps = settings.jumps;

        // timer for raven attack
        this.time.addEvent({
            delay: 3000,
            callback: this.ravenAttack,
            callbackScope: this,
            loop: true,
        });

        // create 4 platforms
        Array.from({ length: 4 }).forEach(() => this.createPlatform());

        // RAVEN
        this.bird = this.physics.add.sprite(settings.gameWidth + 100, 180, 'bird').setScale(0.17);
        (this.bird.body as Phaser.Physics.Arcade.Body)?.setAllowGravity(false);

        // set raven velocity 50 dist/s less than player speed
        this.bird.setVelocityX(-(settings.gameSpeed - 50));

        // set collisions
        this.physics.add.collider(this.platforms, this.player, this.hitFloor, undefined, this);
        this.physics.add.collider(this.bird, this.player, this.hitRaven, undefined, this);

        if (!this.anims.exists("run")) {
            this.anims.create({
                key: 'run',
                frames: this.anims.generateFrameNumbers('player', {
                    start: 0,
                    end: 11,
                }),
                frameRate: 25,
                repeat: -1,
            });
        }

        if (!this.anims.exists("jump")) {
            this.anims.create({
                key: 'jump',
                frames: [{
                    key: 'player',
                    frame: 12,
                }],
            });
        }

        if (!this.anims.exists("fly")) {
            this.anims.create({
                key: 'fly',
                frames: this.anims.generateFrameNumbers('bird', {
                    start: 0,
                    end: 10,
                }),
                frameRate: 8,
                repeat: -1,
            });
        }

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        if (this.isPaused) {
            return;
        }
        this.movement();
        this.checkPlatform();
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        if (body && (this.player.y > settings.gameHeight + 40 || body.velocity.x < settings.gameSpeed)) {
            this.die();
        }
    }

    checkPlatform() {
        this.platforms.getChildren().forEach((platform) => {
            const platformSprite = platform as Phaser.Physics.Arcade.Sprite;

            if (this.player.x > (platformSprite.x + 1000)) {
                this.createPlatform();
                this.platforms.remove(platform, true);
            }
        });
    }

    movement() {
        this.bird.anims.play('fly', true);
        if (this.player.body?.touching.down) {
            this.player.anims.play('run', true);
            this.player.clearTint();
            // reset jumps
            this.jumps = settings.jumps;
        }
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
        body?.updateFromGameObject();
    }

    hitFloor() {
        if (this.hitGround === false) {
            !settings.sound && this.sound.play('hitGround');
            this.hitGround = true;
        }
    }

    hitRaven() {
        this.bird.setTint(0xff1000);
        this.die();
    }

    die() {
        !settings.sound && this.sound.play('gameOver');
        this.scene.pause('Game');
        const bestScore = Math.max(this.score, Number(settings.bestScore));
        settings.bestScore = bestScore;
        localStorage.setItem('bestScore', String(bestScore));
        this.scene.launch('GameOver', this);
    }


    ravenAttack() {
        // reposition raven position
        this.bird.x = this.player.x + 1000;
        this.bird.y = Phaser.Math.Between(180, settings.gameHeight - 170);
        !settings.sound && this.sound.play('bird');
    }


    jump() {
        if (this.isPaused) {
            return;
        }
        if (this.jumps > 0) {
            !settings.sound && this.sound.play('jump');
            this.player.setVelocityY(-settings.jumpForce);
            this.player.anims.play('jump', true);
            this.player.setTint(0xff0000);
            this.jumps -= 1;
            this.hitGround = false;
        }
    }

    updateTimer() {
        this.score += 1;
        this.scoreValueLabel.setText(`${this.score}`);
        // check for new best
        if (this.score > Number(this.bestScore)) {
            this.bestScore = this.score;
            this.bestScoreValueLabel.setText(`${this.score}`);
        }
    }

    changeScene() {
        this.scene.start('GameOver');
    }

    togglePause() {
        if (!this.scene.isActive('Game')) {
            return;
        }

        this.isPaused = !this.isPaused;
        this.physics.world.isPaused = this.isPaused;
        this.time.timeScale = this.isPaused ? 0 : 1;
        this.pauseLabel.setVisible(this.isPaused);

        if (this.isPaused) {
            this.player.anims.pause();
            this.bird.anims.pause();
            return;
        }

        this.player.anims.resume();
        this.bird.anims.resume();
    }
}
