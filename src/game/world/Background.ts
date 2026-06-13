import Phaser from 'phaser';
import config from '../../utils/config';
import { TEX } from '../systems/art';

function lerpColor(a: number, b: number, t: number) {
    const ar = (a >> 16) & 255;
    const ag = (a >> 8) & 255;
    const ab = a & 255;
    const br = (b >> 16) & 255;
    const bg = (b >> 8) & 255;
    const bb = b & 255;
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return (r << 16) | (g << 8) | bl;
}

export class Background {
    private scene: Phaser.Scene;
    private sky: Phaser.GameObjects.Graphics;
    private stars: Phaser.GameObjects.TileSprite;
    private moon: Phaser.GameObjects.Image;
    private ridgeFar: Phaser.GameObjects.TileSprite;
    private ridgeMid: Phaser.GameObjects.TileSprite;
    private ridgeNear: Phaser.GameObjects.TileSprite;
    private lastProgress = -1;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        const w = config.width;
        const h = config.height;
        const horizon = config.groundTop;

        this.sky = scene.add.graphics().setScrollFactor(0).setDepth(-100);

        this.stars = scene.add
            .tileSprite(0, 0, w, horizon - 40, TEX.star)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(-90)
            .setAlpha(0.2);

        this.moon = scene.add
            .image(w * 0.76, 150, TEX.moon)
            .setScrollFactor(0)
            .setDepth(-85)
            .setScale(0.9);

        this.ridgeFar = this.makeRidge(TEX.ridgeFar, horizon, -80, 220);
        this.ridgeMid = this.makeRidge(TEX.ridgeMid, horizon, -70, 300);
        this.ridgeNear = this.makeRidge(TEX.ridgeNear, horizon, -60, 380);

        scene.add
            .rectangle(0, horizon, w, h - horizon + 4, config.theme.ink, 1)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(-15);

        this.setProgress(0);
    }

    private makeRidge(key: string, horizonY: number, depth: number, texHeight: number) {
        return this.scene.add
            .tileSprite(0, horizonY, config.width, texHeight, key)
            .setOrigin(0, 1)
            .setScrollFactor(0)
            .setDepth(depth);
    }

    update(scrollX: number, progress: number) {
        this.ridgeFar.tilePositionX = scrollX * 0.04;
        this.ridgeMid.tilePositionX = scrollX * 0.1;
        this.ridgeNear.tilePositionX = scrollX * 0.22;
        this.stars.tilePositionX = scrollX * 0.015;

        if (Math.abs(progress - this.lastProgress) > 0.008) {
            this.setProgress(progress);
        }
    }

    private setProgress(progress: number) {
        this.lastProgress = progress;
        const p = Phaser.Math.Clamp(progress, 0, 1);
        const phases = config.skyPhases;

        let lo = phases[0];
        let hi = phases[phases.length - 1];
        for (let i = 0; i < phases.length - 1; i++) {
            if (p >= phases[i].at && p <= phases[i + 1].at) {
                lo = phases[i];
                hi = phases[i + 1];
                break;
            }
        }
        const span = hi.at - lo.at || 1;
        const t = Phaser.Math.Clamp((p - lo.at) / span, 0, 1);
        const top = lerpColor(lo.top, hi.top, t);
        const bottom = lerpColor(lo.bottom, hi.bottom, t);

        this.sky.clear();
        this.sky.fillGradientStyle(top, top, bottom, bottom, 1);
        this.sky.fillRect(0, 0, config.width, config.height);

        this.stars.setAlpha(Phaser.Math.Clamp(0.7 - Math.abs(p - 0.5) * 1.0, 0.12, 0.7));
        this.moon.setTint(lerpColor(config.theme.moon, config.theme.bloodMoon, Phaser.Math.Clamp((p - 0.4) / 0.6, 0, 1)));
        this.moon.y = 150 - p * 30;
    }
}
