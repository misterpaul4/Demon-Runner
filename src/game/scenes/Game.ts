import Phaser, { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import config from '../../utils/config';
import { Background } from '../world/Background';
import { Ground } from '../world/Ground';
import { Player } from '../entities/Player';
import { Spawner } from '../entities/Spawner';
import { Pickups } from '../entities/Pickups';
import { Hud } from '../ui/Hud';
import { Score } from '../systems/score';
import { Difficulty } from '../systems/difficulty';
import { applyMute, sfx } from '../systems/audio';
import { burst, shake, vignette } from '../systems/fx';
import { uploadScore } from '../../utils/leaderBoardAPI';

type RunStats = { score: number; metres: number; best: number; isBest: boolean };

export class Game extends Scene {
    private background!: Background;
    private ground!: Ground;
    private player!: Player;
    private spawner!: Spawner;
    private pickups!: Pickups;
    private hud!: Hud;
    private score!: Score;

    private state: 'run' | 'dead' = 'run';
    private startX = 0;
    private metres = 0;
    private pointerStartY = 0;
    private stallMs = 0;

    constructor() {
        super('Game');
    }

    create() {
        this.state = 'run';
        this.stallMs = 0;
        applyMute(this);

        this.background = new Background(this);
        this.ground = new Ground(this);

        this.player = new Player(this, 160, config.groundTop - 160);
        this.startX = this.player.x;

        this.spawner = new Spawner(this);
        this.pickups = new Pickups(this);
        this.score = new Score();

        this.ambientEmbers();
        vignette(this);
        this.hud = new Hud(this);

        // Bounds whose height equals the viewport pin vertical scroll to exactly
        // 0, so the world-space ground always lines up with the screen-pinned
        // ridges. The horizontal range is effectively unbounded for the endless
        // run. (lerpY alone wasn't enough — the camera still crept vertically.)
        const cam = this.cameras.main;
        cam.setBounds(-100000, 0, 200000, config.height);
        cam.startFollow(this.player.sprite, true, 0.12, 0.12);
        cam.setFollowOffset(-300, 0);

        this.physics.add.collider(this.player.sprite, this.ground.group);
        this.physics.add.overlap(this.player.sprite, this.spawner.group, this.onBirdHit, this.birdActive, this);
        this.physics.add.overlap(this.player.sprite, this.pickups.group, this.onSoul, undefined, this);

        this.bindFeedback();
        this.bindInput();

        EventBus.emit('current-scene-ready', this);
    }

    private bindFeedback() {
        this.player.on('jump', () => sfx(this, 'sfx-jump', 0.5));
        this.player.on('airjump', () => {
            sfx(this, 'sfx-jump', 0.4);
            shake(this, 0.003, 90);
        });
        this.player.on('land', (impact: number) => {
            if (impact > 700) {
                sfx(this, 'sfx-land', 0.4);
                shake(this, 0.004, 110);
            }
        });
    }

    private bindInput() {
        const kb = this.input.keyboard;
        if (kb) {
            kb.on('keydown-SPACE', () => this.player.pressJump());
            kb.on('keydown-UP', () => this.player.pressJump());
            kb.on('keyup-SPACE', () => this.player.releaseJump());
            kb.on('keyup-UP', () => this.player.releaseJump());
            kb.on('keydown-DOWN', () => this.player.fastFall());
        }

        this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            this.pointerStartY = p.y;
            if (this.state === 'run') this.player.pressJump();
        });
        this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
            if (p.y - this.pointerStartY > 70) this.player.fastFall();
            this.player.releaseJump();
        });
    }

    // A few slow embers drifting up across the view, locked to the camera.
    private ambientEmbers() {
        this.add.particles(0, 0, 'tex-ember', {
            x: { min: 0, max: config.width },
            y: config.height + 10,
            lifespan: 6000,
            speedY: { min: -40, max: -16 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.4, end: 0 },
            tint: [config.theme.ember, config.theme.emberDeep],
            blendMode: 'ADD',
            frequency: 280,
            quantity: 1,
        }).setScrollFactor(0).setDepth(2);
    }

    private birdActive(_player: object, bird: object) {
        return (bird as Phaser.Physics.Arcade.Sprite).active;
    }

    private onBirdHit = () => {
        if (this.state !== 'run') return;
        this.die();
    };

    private onSoul = (_player: object, soul: object) => {
        if (this.state !== 'run') return;
        const s = soul as Phaser.GameObjects.Sprite;
        burst(this, s.x, s.y, 6);
        this.pickups.collect(soul as Phaser.GameObjects.GameObject);
        this.score.registerPickup(this.time.now);
        sfx(this, 'sfx-jump', 0.25);
    };

    private checkGrazes(time: number) {
        const px = this.player.x;
        const py = this.player.y;
        for (const bird of this.spawner.active()) {
            if (bird.grazed) continue;
            if (Phaser.Math.Distance.Between(px, py, bird.x, bird.y) < config.spawn.grazeRadius) {
                bird.grazed = true;
                this.score.registerGraze(time);
                burst(this, (px + bird.x) / 2, (py + bird.y) / 2, 3);
            }
        }
    }

    update(time: number, delta: number) {
        const cam = this.cameras.main;
        this.player.update(time);
        this.background.update(cam.scrollX, Difficulty.skyProgress(this.metres));

        if (this.state === 'run') {
            this.metres = (this.player.x - this.startX) * config.metresPerPixel;
            this.score.setDistance(this.player.x - this.startX);

            this.player.setRunSpeed(Difficulty.runSpeed(this.metres));
            this.ground.setGapChance(Difficulty.gapChance(this.metres));
            this.ground.update(cam.scrollX);
            this.spawner.update(time, delta, this.metres, this.player.x, cam.scrollX);
            this.pickups.update(time, delta, this.player.x, cam.scrollX);

            this.checkGrazes(time);
            this.score.update(time);
            this.hud.update(this.score, time);

            // A momentary velocity dip at a segment seam shouldn't be fatal, so a
            // wall only counts once the demon has been stalled for a beat.
            const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;
            this.stallMs = body.velocity.x < Difficulty.runSpeed(this.metres) * 0.4 ? this.stallMs + delta : 0;
            const fellInGap = this.player.y > config.groundTop + 220;
            if (fellInGap || this.stallMs > 130) this.die();
        }
    }

    private die() {
        this.state = 'dead';
        this.player.kill();
        sfx(this, 'sfx-over', 0.6);
        shake(this, 0.012, 360);
        burst(this, this.player.x, this.player.y, 18, true);

        const finalScore = this.score.value;
        const isBest = finalScore > config.bestScore;
        if (isBest) {
            config.bestScore = finalScore;
            uploadScore(finalScore).catch(() => {});
        }

        const stats: RunStats = {
            score: finalScore,
            metres: this.score.distanceMetres,
            best: config.bestScore,
            isBest,
        };

        this.time.delayedCall(820, () => {
            this.scene.launch('GameOver', stats);
            this.scene.pause();
        });
    }
}
