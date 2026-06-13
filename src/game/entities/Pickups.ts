import Phaser from 'phaser';
import config from '../../utils/config';
import { TEX } from '../systems/art';

const runLane = config.groundTop - 44;

class Soul extends Phaser.Physics.Arcade.Image {
    private phase = 0;
    private baseY = 0;

    constructor(scene: Phaser.Scene) {
        super(scene, -999, -999, TEX.soul);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setCircle(16, 8, 8);
        this.deactivate();
    }

    launch(x: number, y: number, vx: number) {
        this.setActive(true).setVisible(true);
        this.baseY = y;
        this.phase = Math.random() * Math.PI * 2;
        this.setPosition(x, y);
        (this.body as Phaser.Physics.Arcade.Body).enable = true;
        this.setVelocity(vx, 0);
    }

    advance(delta: number) {
        if (!this.active) return;
        this.phase += 0.06 * (delta / 16.67);
        this.y = this.baseY + Math.sin(this.phase) * 6;
        this.setScale(0.9 + Math.sin(this.phase * 2) * 0.08);
    }

    deactivate() {
        this.setActive(false).setVisible(false);
        (this.body as Phaser.Physics.Arcade.Body).enable = false;
        this.setPosition(-999, -999);
    }
}

// Drifting souls to harvest. They tend to hang above the running lane so the
// reward usually costs the player a jump into bird territory.
export class Pickups {
    readonly group: Phaser.GameObjects.Group;
    private scene: Phaser.Scene;
    private souls: Soul[] = [];
    private nextAt = 1200;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.group = scene.add.group();
    }

    private obtain(): Soul {
        const free = this.souls.find((s) => !s.active);
        if (free) return free;
        const soul = new Soul(this.scene);
        this.souls.push(soul);
        this.group.add(soul);
        return soul;
    }

    update(time: number, delta: number, playerX: number, scrollLeft: number) {
        if (time >= this.nextAt) {
            this.nextAt = time + Phaser.Math.Between(1300, 2200);
            if (Math.random() < config.pickup.chance) {
                this.spawnCluster(playerX + config.width * 1.1);
            }
        }

        for (const soul of this.souls) {
            if (!soul.active) continue;
            soul.advance(delta);
            if (soul.x < scrollLeft - 120) soul.deactivate();
        }
    }

    private spawnCluster(x: number) {
        // Either a single low soul or a short rising arc that pays off a jump.
        const arc = Math.random() < 0.45;
        const count = arc ? 3 : 1;
        const topY = Phaser.Math.Between(runLane - 150, runLane - 60);
        for (let i = 0; i < count; i++) {
            const y = arc ? topY + Math.abs(i - 1) * 46 : Phaser.Math.Between(runLane - 90, runLane - 10);
            this.obtain().launch(x + i * 70, y, -170);
        }
    }

    collect(soul: Phaser.GameObjects.GameObject) {
        (soul as Soul).deactivate();
    }

    reset() {
        this.souls.forEach((s) => s.deactivate());
        this.nextAt = 1200;
    }
}
