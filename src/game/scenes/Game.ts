import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

import Phaser from 'phaser';
import settings, { getPlayerJumpCount, getStoredStars, setStoredStars } from '../../utils/config';

export class Game extends Scene {
    background: Phaser.GameObjects.Image;
    platforms: Phaser.Physics.Arcade.StaticGroup;
    starsGroup: Phaser.Physics.Arcade.Group;
    spearGroup: Phaser.Physics.Arcade.Group;
    scoreLabel: Phaser.GameObjects.Text;
    scoreValueLabel: Phaser.GameObjects.Text;
    score: number;
    stars: number;
    starsValueLabel: Phaser.GameObjects.Text;
    bestScore: number;
    bestScoreLabel: Phaser.GameObjects.Text;
    bestScoreValueLabel: Phaser.GameObjects.Text;
    groundY: number;
    groundX: number;
    player: Phaser.Physics.Arcade.Sprite;
    warden: Phaser.GameObjects.Sprite;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    hitGround?: boolean;
    jumps: number;
    bird: Phaser.Physics.Arcade.Sprite;
    newPlatform: Phaser.Physics.Arcade.Sprite;
    isPaused: boolean;
    pauseLabel: Phaser.GameObjects.Text;
    currentSpeed: number;
    currentGroundSpaceRange: [number, number];
    currentGroundSizeRange: [number, number];
    currentSpearChance: number;
    currentBirdModulo: number | null;
    pointerJumpHandler: (pointer: Phaser.Input.Pointer) => void;

    constructor() {
        super({
            key: 'Game',
        });
        this.pointerJumpHandler = (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) {
                return;
            }

            this.jump();
        };
    }

    create() {
        this.isPaused = false;
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.background = this.add.image(width / 2, height / 2, 'background')
            .setScrollFactor(0, 1);
        
        const scaleX = width / this.background.width;
        const scaleY = height / this.background.height;
        const scale = Math.max(scaleX, scaleY);
        this.background.setScale(scale);
        this.background.setDepth(-10);
        this.platforms = this.physics.add.staticGroup();
        this.starsGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });
        this.spearGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });

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
        this.stars = getStoredStars();
        this.currentSpeed = settings.gameSpeed;
        this.currentGroundSpaceRange = [...settings.groundSpaceRange] as [number, number];
        this.currentGroundSizeRange = [...settings.groundSizeRange] as [number, number];
        this.currentSpearChance = 0;
        this.currentBirdModulo = null;
        this.syncDifficulty();

        this.add.image(settings.gameWidth - 138, 52, 'star')
            .setScale(0.5)
            .setAngle(-12)
            .setScrollFactor(0, 1);
        this.starsValueLabel = this.add.text(settings.gameWidth - 92, 58, `${this.stars}`, {
            fontFamily: 'BrushScriptStd',
            fontSize: '50px',
            color: '#fff4cf',
        }).setOrigin(0, 0.5).setScrollFactor(0, 1);

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
        const initialPlatform = this.platforms.create(-120, this.groundY, 'ground').setOrigin(0);
        initialPlatform.displayWidth = settings.gameWidth + 520;
        const initialPlatformBody = initialPlatform.body as Phaser.Physics.Arcade.StaticBody;
        initialPlatformBody.updateFromGameObject();
        this.groundX = initialPlatform.x + initialPlatform.displayWidth;

        this.player = this.physics.add.sprite(110, settings.gameHeight - 170, 'player').setScale(0.1);
        this.player.setDepth(6);

        this.player.setBounce(0.15);

        this.warden = this.add.sprite(this.player.x - 340, this.groundY + 18, 'warden');
        this.warden.setOrigin(0.5, 1);
        this.warden.setScale(1);
        this.warden.setDepth(4);

        this.cameras.main.startFollow(this.player, false, 1, 0, -320, 180);

        // set player velocity
        this.player.setVelocityX(this.currentSpeed);

        if (this.input.keyboard) {
            // set space key and up-arrow key for jumping
            this.cursors = this.input.keyboard.createCursorKeys();
            this.input.keyboard.on('keydown-SPACE', this.jump, this);
            this.input.keyboard.on('keydown-UP', this.jump, this);
            this.input.keyboard.on('keydown-P', this.togglePause, this);
            this.input.keyboard.on('keydown-ESC', this.togglePause, this);
        }

        this.input.on('pointerdown', this.pointerJumpHandler, this);

        // initialize number of jumps for the player
        this.jumps = getPlayerJumpCount();

        // create 4 platforms
        Array.from({ length: 4 }).forEach(() => this.createPlatform());

        // RAVEN
        this.bird = this.physics.add.sprite(settings.gameWidth + 100, 180, 'bird').setScale(0.17);
        this.bird.setFlipX(true);
        (this.bird.body as Phaser.Physics.Arcade.Body)?.setAllowGravity(false);
        (this.bird.body as Phaser.Physics.Arcade.Body).enable = false;
        this.bird.setActive(false).setVisible(false);

        // set raven velocity 50 dist/s less than player speed
        this.bird.setVelocityX(0);

        // set collisions
        this.physics.add.collider(this.platforms, this.player, this.hitFloor, undefined, this);
        this.physics.add.collider(this.bird, this.player, this.hitRaven, undefined, this);
        this.physics.add.collider(this.player, this.spearGroup, this.hitSpear, undefined, this);
        this.physics.add.overlap(this.player, this.starsGroup, this.collectStar, undefined, this);
        this.syncDifficulty();

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
                    end: 8,
                }),
                frameRate: 8,
                repeat: -1,
            });
        }

        if (!this.anims.exists("warden-run")) {
            this.anims.create({
                key: 'warden-run',
                frames: this.anims.generateFrameNumbers('warden', {
                    frames: [0, 3, 6, 9, 12, 15],
                }),
                frameRate: 16,
                repeat: -1,
            });
        }

        this.warden.anims.play('warden-run');

        EventBus.emit('current-scene-ready', this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off('pointerdown', this.pointerJumpHandler, this);
        });
    }

    update() {
        if (this.isPaused) {
            return;
        }
        this.movement();
        this.updateWardenChase();
        this.checkPlatform();
        this.checkStars();
        this.checkSpears();
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        if (body && (this.player.y > settings.gameHeight + 40 || body.velocity.x < this.currentSpeed - 40)) {
            this.die();
        }
    }

    checkPlatform() {
        this.platforms.getChildren().forEach((platform) => {
            const platformSprite = platform as Phaser.Physics.Arcade.Sprite;
            const platformRightEdge = platformSprite.x + platformSprite.displayWidth;

            if (this.player.x > (platformRightEdge + 320)) {
                this.createPlatform();
                this.platforms.remove(platform, true);
            }
        });
    }

    checkStars() {
        this.starsGroup.getChildren().forEach((starObject) => {
            const star = starObject as Phaser.Physics.Arcade.Image;

            if (this.player.x > star.x + 1000) {
                this.starsGroup.remove(star, true, true);
            }
        });
    }

    checkSpears() {
        this.spearGroup.getChildren().forEach((spearObject) => {
            const spear = spearObject as Phaser.Physics.Arcade.Image;

            if (this.player.x > spear.x + 1000) {
                this.spearGroup.remove(spear, true, true);
            }
        });
    }

    movement() {
        if (this.bird.active) {
            this.bird.anims.play('fly', true);
        }
        if (this.player.body?.touching.down) {
            this.player.anims.play('run', true);
            this.player.clearTint();
            // reset jumps
            this.jumps = getPlayerJumpCount();
        }
    }

    updateWardenChase() {
        const pressure = Math.min(150, this.score * 1.4);
        const targetOffset = Math.max(140, 300 - pressure);
        const targetX = this.player.x - targetOffset;
        const followRate = this.player.body?.touching.down ? 0.032 : 0.05;

        this.warden.x = Phaser.Math.Linear(this.warden.x, targetX, followRate);
        this.warden.y = this.groundY  - 0;

        if ((this.player.x - this.warden.x) < 96) {
            this.die();
        }
    }

    createPlatform() {
        const platformX = this.groundX;
        this.newPlatform = this.platforms.create(platformX, this.groundY, 'ground').setOrigin(0);
        this.newPlatform.displayWidth = Phaser.Math.Between(
            this.currentGroundSizeRange[0], this.currentGroundSizeRange[1],
        );

        const spawnedSpear = this.spawnSpearForPlatform(platformX, this.newPlatform.displayWidth);
        if (!spawnedSpear) {
            this.spawnStarsForPlatform(platformX, this.newPlatform.displayWidth);
        }
        this.groundX += (this.newPlatform.displayWidth + Phaser.Math.Between(
            this.currentGroundSpaceRange[0], this.currentGroundSpaceRange[1],
        ));

        const {
            body,
        } = this.newPlatform;
        body?.updateFromGameObject();
    }

    spawnSpearForPlatform(platformX: number, platformWidth: number) {
        if (this.currentSpearChance <= 0 || platformWidth < 180 || Phaser.Math.Between(0, 100) > this.currentSpearChance) {
            return false;
        }

        const spear = this.spearGroup.create(
            Phaser.Math.Between(platformX + 80, platformX + platformWidth - 80),
            this.groundY + 4,
            'spear',
        ) as Phaser.Physics.Arcade.Image;

        spear.setOrigin(0.5, 1);
        spear.setScale(0.12);
        spear.setAngle(90);

        const body = spear.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setImmovable(true);
        body.setSize(42, 126, true);

        return true;
    }

    spawnStarsForPlatform(platformX: number, platformWidth: number) {
        if (platformWidth < 150 || Phaser.Math.Between(0, 100) > 62) {
            return;
        }

        const maxStars = Phaser.Math.Clamp(Math.floor(platformWidth / 210), 1, 3);
        const starCount = Phaser.Math.Between(1, maxStars);
        const spacing = starCount === 1 ? 0 : Phaser.Math.Clamp(platformWidth / (starCount + 1), 64, 104);
        const startX = platformX + platformWidth / 2 - (spacing * (starCount - 1)) / 2;
        const baseY = this.groundY - Phaser.Math.Between(70, 132);

        Array.from({ length: starCount }).forEach((_, index) => {
            const arcOffset = starCount > 1 ? Math.abs(index - (starCount - 1) / 2) * 10 : 0;
            this.createStar(startX + spacing * index, baseY - arcOffset);
        });
    }

    createStar(x: number, y: number) {
        const star = this.starsGroup.create(x, y, 'star') as Phaser.Physics.Arcade.Image;
        star.setScale(0.085);
        star.setAngle(Phaser.Math.Between(-14, 14));

        const body = star.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setImmovable(true);
        body.setSize(star.width * 0.72, star.height * 0.72, true);

        this.tweens.add({
            targets: star,
            y: y - 10,
            angle: star.angle + 10,
            duration: Phaser.Math.Between(850, 1200),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
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

    hitSpear() {
        this.die();
    }

    collectStar(_player: Phaser.GameObjects.GameObject, starObject: Phaser.GameObjects.GameObject) {
        const star = starObject as Phaser.Physics.Arcade.Image;
        this.stars += 1;
        setStoredStars(this.stars);
        this.starsValueLabel.setText(`${this.stars}`);

        // Pulse effect for stars label
        this.tweens.add({
            targets: this.starsValueLabel,
            scale: 1.4,
            duration: 100,
            yoyo: true,
            ease: 'Back.easeOut'
        });

        this.tweens.killTweensOf(star);
        star.disableBody(true, true);
    }

    die() {
        !settings.sound && this.sound.play('gameOver');
        
        // Impact shake on death
        this.cameras.main.shake(400, 0.015);
        this.cameras.main.flash(200, 201, 58, 47, 0.6); // Red flash

        this.player.anims.pause();
        this.bird.anims.pause();
        this.warden.anims.pause();
        
        this.time.delayedCall(300, () => {
            this.scene.pause('Game');
            const bestScore = Math.max(this.score, Number(settings.bestScore));
            settings.bestScore = bestScore;
            localStorage.setItem('bestScore', String(bestScore));
            this.scene.launch('GameOver', this);
        });
    }


    ravenAttack() {
        const body = this.bird.body as Phaser.Physics.Arcade.Body;
        body.enable = true;
        this.bird.setActive(true).setVisible(true);
        // reposition raven position
        this.bird.x = this.player.x + 1000;
        this.bird.y = Phaser.Math.Between(180, settings.gameHeight - 170);
        this.bird.setVelocityX(-(this.currentSpeed - 40));
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

            // Add slight camera shake on jump for impact
            this.cameras.main.shake(100, 0.002);
        }
    }

    updateTimer() {
        this.score += 1;
        this.scoreValueLabel.setText(`${this.score}`);
        
        // Subtle pulse for every second passed
        this.tweens.add({
            targets: this.scoreValueLabel,
            scale: 1.15,
            duration: 80,
            yoyo: true
        });

        // check for new best
        if (this.score > Number(this.bestScore)) {
            this.bestScore = this.score;
            this.bestScoreValueLabel.setText(`${this.score}`);
            this.bestScoreValueLabel.setTint(0xffea00); // Highlight best score
        }

        this.syncDifficulty();
        if (this.currentBirdModulo && this.score >= 10 && this.score % this.currentBirdModulo === 0) {
            this.ravenAttack();
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
            this.warden.anims.pause();
            return;
        }

        this.player.anims.resume();
        this.bird.anims.resume();
        this.warden.anims.resume();
    }

    syncDifficulty() {
        const difficulty = this.getDifficultyState();
        this.currentSpeed = difficulty.speed;
        this.currentGroundSpaceRange = difficulty.groundSpaceRange;
        this.currentGroundSizeRange = difficulty.groundSizeRange;
        this.currentSpearChance = difficulty.spearChance;
        this.currentBirdModulo = difficulty.birdModulo;

        if (this.player?.body) {
            this.player.setVelocityX(this.currentSpeed);
        }

        if (this.bird?.body && this.bird.active) {
            this.bird.setVelocityX(-(this.currentSpeed - 40));
        }
    }

    getDifficultyState() {
        if (this.score < 30) {
            return {
                speed: 330,
                groundSpaceRange: [120, 220] as [number, number],
                groundSizeRange: [320, 820] as [number, number],
                spearChance: 0,
                birdModulo: null,
            };
        }

        if (this.score < 60) {
            return {
                speed: 360,
                groundSpaceRange: [130, 240] as [number, number],
                groundSizeRange: [240, 700] as [number, number],
                spearChance: 0,
                birdModulo: 10,
            };
        }

        if (this.score < 120) {
            return {
                speed: 385,
                groundSpaceRange: [140, 260] as [number, number],
                groundSizeRange: [190, 620] as [number, number],
                spearChance: 26,
                birdModulo: 8,
            };
        }

        const overtime = this.score - 120;
        const speedBoost = Math.min(120, Math.floor(overtime * 1.8));
        const birdModulo = Math.max(4, 7 - Math.floor(overtime / 25));

        return {
            speed: 405 + speedBoost,
            groundSpaceRange: [150, 300] as [number, number],
            groundSizeRange: [160, 540] as [number, number],
            spearChance: 38,
            birdModulo,
        };
    }
}
