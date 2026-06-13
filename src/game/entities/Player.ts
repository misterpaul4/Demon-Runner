import Phaser from 'phaser';
import config from '../../utils/config';
import { TEX, demonTex } from '../systems/art';

// The demon. Physics lives on an invisible sprite (`sprite`) while the look — the
// chosen demon skin plus an ember wake — rides on a separate container that
// mirrors the body each frame. Splitting the two lets the visual tilt, squash
// and trail react to motion without fighting the collider.
//
// Emits: 'jump', 'airjump', 'land' (with impact velocity) for the scene to hang
// sound and screen-shake off of.
export class Player extends Phaser.Events.EventEmitter {
    readonly sprite: Phaser.Physics.Arcade.Sprite;
    private scene: Phaser.Scene;
    private arcade: Phaser.Physics.Arcade.Body;
    private rig: Phaser.GameObjects.Container;
    private glow: Phaser.GameObjects.Image;
    private trail: Phaser.GameObjects.Particles.ParticleEmitter;

    private jumps = config.maxJumps;
    private jumpBufferedAt = -9999;
    private wasGrounded = true;
    private runSpeed = config.runSpeedStart;
    private alive = true;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super();
        this.scene = scene;

        // All skins share one 120x130 frame, so the hitbox is identical whichever
        // demon the player picked.
        const skin = demonTex(config.character);
        this.sprite = scene.physics.add.sprite(x, y, skin).setVisible(false);
        this.arcade = this.sprite.body as Phaser.Physics.Arcade.Body;
        this.arcade.setSize(46, 84);
        this.arcade.setOffset(32, 20);
        this.sprite.setBounce(0.08);
        this.sprite.setMaxVelocity(2400, 2600);
        this.sprite.setVelocityX(this.runSpeed);

        // A soft ember aura that keeps the demon legible against the dark world.
        this.glow = scene.add.image(x, y, TEX.glow)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setTint(config.theme.ember)
            .setAlpha(0.3)
            .setScale(1.5)
            .setDepth(4);

        const bodyImg = scene.add.image(0, 0, skin).setOrigin(0.5);
        this.rig = scene.add.container(x, y, [bodyImg]).setDepth(6);

        this.trail = scene.add.particles(0, 0, TEX.ember, {
            follow: this.sprite,
            followOffset: { x: -12, y: 24 },
            speed: { min: 8, max: 30 },
            angle: { min: 200, max: 340 },
            lifespan: { min: 280, max: 680 },
            scale: { start: 0.55, end: 0 },
            alpha: { start: 0.55, end: 0 },
            tint: [config.theme.ember, config.theme.emberHot, config.theme.emberDeep],
            blendMode: 'ADD',
            frequency: 38,
            quantity: 1,
        }).setDepth(5);
    }

    get x() {
        return this.sprite.x;
    }

    get y() {
        return this.sprite.y;
    }

    setRunSpeed(speed: number) {
        this.runSpeed = speed;
    }

    isGrounded() {
        return this.arcade.blocked.down || this.arcade.touching.down;
    }

    pressJump() {
        this.jumpBufferedAt = this.scene.time.now;
    }

    // Releasing mid-rise clips upward speed, so a tap hops and a hold soars.
    releaseJump() {
        if (!this.alive) return;
        if (this.arcade.velocity.y < 0) {
            this.arcade.setVelocityY(this.arcade.velocity.y * 0.42);
        }
    }

    fastFall() {
        if (!this.alive) return;
        if (!this.isGrounded()) this.arcade.setVelocityY(config.fastFallForce);
    }

    private doJump() {
        const used = config.maxJumps - this.jumps;
        const force = config.jumpForce * Math.pow(config.multiJumpFalloff, used);
        this.arcade.setVelocityY(-force);
        this.jumps -= 1;
        this.jumpBufferedAt = -9999;

        this.scene.tweens.add({
            targets: this.rig,
            scaleY: 1.16,
            scaleX: 0.88,
            duration: 130,
            yoyo: true,
            ease: 'Quad.easeOut',
        });

        this.emit(used === 0 ? 'jump' : 'airjump');
    }

    kill() {
        this.alive = false;
        this.trail.stop();
        this.sprite.setVelocity(this.runSpeed * 0.2, -260);
        this.arcade.setAngularVelocity?.(0);
    }

    update(time: number) {
        const ab = this.arcade;
        const grounded = this.isGrounded();

        if (this.alive) {
            if (grounded) {
                this.jumps = config.maxJumps;
                if (!this.wasGrounded) {
                    this.emit('land', this.landImpact);
                    this.scene.tweens.add({
                        targets: this.rig,
                        scaleY: 0.84,
                        scaleX: 1.14,
                        duration: 110,
                        yoyo: true,
                        ease: 'Quad.easeOut',
                    });
                }
            }
            this.landImpact = ab.velocity.y;
            this.wasGrounded = grounded;

            if (time - this.jumpBufferedAt <= config.jumpBufferMs && this.jumps > 0) {
                this.doJump();
            }

            // Keep driving forward unless a gap wall is in the way — that stall is
            // what the scene reads as death.
            if (!ab.blocked.right && !ab.touching.right) {
                this.sprite.setVelocityX(this.runSpeed);
            }
        }

        // Lean into the arc: nose up while rising, tipping forward on the fall.
        const targetTilt = Phaser.Math.Clamp(ab.velocity.y * 0.022, -16, 24);
        this.rig.angle = Phaser.Math.Linear(this.rig.angle, targetTilt, 0.18);

        this.rig.x = this.sprite.x;
        this.rig.y = this.sprite.y;
        this.glow.setPosition(this.sprite.x, this.sprite.y);
    }

    private landImpact = 0;
}
