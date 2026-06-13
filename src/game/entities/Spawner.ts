import Phaser from 'phaser';
import config from '../../utils/config';
import { Bird, BirdKind, unlockedKinds } from './Bird';
import { Difficulty } from '../systems/difficulty';

export class Spawner {
    readonly group: Phaser.GameObjects.Group;
    private scene: Phaser.Scene;
    private birds: Bird[] = [];
    private nextAt = 0;
    private lastKind: BirdKind | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.group = scene.add.group();
    }

    private obtain(): Bird {
        const free = this.birds.find((b) => !b.active);
        if (free) return free;
        const bird = new Bird(this.scene);
        this.birds.push(bird);
        this.group.add(bird);
        return bird;
    }

    private chooseKind(metres: number): BirdKind {
        const pool = unlockedKinds(metres);
        let kind = Phaser.Utils.Array.GetRandom(pool) as BirdKind;
        if (kind === 'diver' && this.lastKind === 'diver' && pool.length > 1) {
            kind = Phaser.Utils.Array.GetRandom(pool.filter((k) => k !== 'diver')) as BirdKind;
        }
        this.lastKind = kind;
        return kind;
    }

    update(time: number, delta: number, metres: number, playerX: number, scrollLeft: number) {
        if (time >= this.nextAt) {
            const bird = this.obtain();
            bird.launch(playerX + config.width * 1.15, this.chooseKind(metres));
            this.nextAt = time + Difficulty.spawnInterval(metres) * Phaser.Math.FloatBetween(0.85, 1.2);
        }

        for (const bird of this.birds) {
            if (!bird.active) continue;
            bird.advance(time, delta);
            if (bird.x < scrollLeft - 200) bird.deactivate();
        }
    }

    active(): Bird[] {
        return this.birds.filter((b) => b.active);
    }

    reset() {
        this.birds.forEach((b) => b.deactivate());
        this.nextAt = 0;
        this.lastKind = null;
    }
}
