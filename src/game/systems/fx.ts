import Phaser from 'phaser';
import config from '../../utils/config';
import { TEX } from './art';

// A one-shot scatter of feathers and embers — fired on near-misses and the
// killing blow. The emitter cleans itself up once the burst has faded.
export function burst(scene: Phaser.Scene, x: number, y: number, count = 10, hot = false) {
    const feathers = scene.add.particles(x, y, TEX.feather, {
        lifespan: { min: 400, max: 900 },
        speed: { min: 60, max: 240 },
        angle: { min: 0, max: 360 },
        gravityY: 600,
        rotate: { min: 0, max: 360 },
        scale: { start: 1, end: 0.4 },
        alpha: { start: 1, end: 0 },
        emitting: false,
    }).setDepth(20);
    feathers.explode(count, x, y);

    const sparks = scene.add.particles(x, y, TEX.spark, {
        lifespan: { min: 250, max: 500 },
        speed: { min: 80, max: 300 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.9, end: 0 },
        alpha: { start: 0.9, end: 0 },
        tint: hot ? [config.theme.blood, config.theme.ember] : [config.theme.ember, config.theme.emberHot],
        blendMode: 'ADD',
        emitting: false,
    }).setDepth(21);
    sparks.explode(Math.ceil(count * 0.8), x, y);

    scene.time.delayedCall(1000, () => {
        feathers.destroy();
        sparks.destroy();
    });
}

// Dark frame fading inward, pinned to the camera. Sells the gothic mood and
// keeps the eye on the action in the middle of the screen.
export function vignette(scene: Phaser.Scene) {
    const w = config.width;
    const h = config.height;
    const g = scene.add.graphics().setScrollFactor(0).setDepth(900);
    const band = 150;
    const a = 0.55;

    g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, a, a, 0, 0);
    g.fillRect(0, 0, w, band);
    g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, a, a);
    g.fillRect(0, h - band, w, band);
    g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, a, 0, a, 0);
    g.fillRect(0, 0, band, h);
    g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, a, 0, a);
    g.fillRect(w - band, 0, band, h);

    return g;
}

export function shake(scene: Phaser.Scene, intensity = 0.006, duration = 180) {
    scene.cameras.main.shake(duration, intensity);
}
