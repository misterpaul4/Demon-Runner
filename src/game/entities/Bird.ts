import Phaser from 'phaser';
import config from '../../utils/config';
import { TEX } from '../systems/art';

export type BirdKind = 'crow' | 'diver' | 'floater';

type KindSpec = {
    speed: number;
    scale: number;
    flap: number;
    unlock: number;
    pick: () => { y: number; targetY: number };
};

const runLane = config.groundTop - 44;

const KINDS: Record<BirdKind, KindSpec> = {
    crow: {
        speed: 250,
        scale: 0.95,
        flap: 0.42,
        unlock: 0,
        pick: () => {
            const y = Phaser.Math.Between(runLane - 36, runLane + 8);
            return { y, targetY: y };
        },
    },
    diver: {
        speed: 300,
        scale: 0.95,
        flap: 0.5,
        unlock: 260,
        pick: () => ({ y: Phaser.Math.Between(230, 300), targetY: runLane }),
    },
    floater: {
        speed: 155,
        scale: 1.18,
        flap: 0.18,
        unlock: 520,
        pick: () => {
            const y = Phaser.Math.Between(360, 430);
            return { y, targetY: y };
        },
    },
};

export function unlockedKinds(metres: number): BirdKind[] {
    return (Object.keys(KINDS) as BirdKind[]).filter((k) => metres >= KINDS[k].unlock);
}

export class Bird extends Phaser.Physics.Arcade.Sprite {
    kind: BirdKind = 'crow';
    grazed = false;
    private wing: Phaser.GameObjects.Image;
    private glow: Phaser.GameObjects.Image;
    private phase = 0;
    private flapSpeed = 0.4;
    private targetY = 0;

    constructor(scene: Phaser.Scene) {
        super(scene, -999, -999, TEX.birdBody);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(4).setFlipX(true);
        (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        (this.body as Phaser.Physics.Arcade.Body).setSize(40, 22).setOffset(14, 9);

        this.wing = scene.add.image(-999, -999, TEX.birdWing).setOrigin(0.1, 0.2).setFlipX(true).setDepth(5);
        this.glow = scene.add.image(-999, -999, TEX.glow)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setTint(config.theme.blood)
            .setDepth(3);
        this.deactivate();
    }

    launch(x: number, kind: BirdKind) {
        const spec = KINDS[kind];
        const { y, targetY } = spec.pick();
        this.kind = kind;
        this.targetY = targetY;
        this.flapSpeed = spec.flap;
        this.grazed = false;
        this.phase = Math.random() * Math.PI * 2;

        this.setActive(true).setVisible(true);
        this.wing.setVisible(true);
        this.glow.setVisible(true).setAlpha(0.4).setScale(spec.scale * 1.4);
        this.setScale(spec.scale).setPosition(x, y);
        (this.body as Phaser.Physics.Arcade.Body).enable = true;
        this.setVelocity(-spec.speed, 0);
    }

    deactivate() {
        this.setActive(false).setVisible(false);
        this.wing.setVisible(false);
        this.glow.setVisible(false).setPosition(-999, -999);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.enable = false;
        this.setPosition(-999, -999);
    }

    advance(_time: number, delta: number) {
        if (!this.active) return;

        if (this.kind === 'diver') {
            this.y = Phaser.Math.Linear(this.y, this.targetY, 0.018);
        } else if (this.kind === 'floater') {
            this.y += Math.sin(this.phase) * 0.4;
        }

        const tilt = this.kind === 'diver' ? Phaser.Math.Clamp((this.targetY - this.y) * -0.1, -18, 18) : 0;
        this.setAngle(tilt);

        this.phase += this.flapSpeed * (delta / 16.67);
        const beat = Math.sin(this.phase);
        this.wing.setPosition(this.x + 2, this.y - 6 * this.scale);
        this.wing.setScale(this.scale);
        this.wing.setAngle(tilt + beat * 30);
        this.glow.setPosition(this.x, this.y);
    }
}
