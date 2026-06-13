import { Scene } from 'phaser';
import { buildTextures } from '../systems/art';
import config from '../../utils/config';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        this.add.text(cx, cy - 70, 'DEMON RUNNER', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '46px',
            color: config.theme.css.parchment,
        }).setOrigin(0.5).setAlpha(0.9);

        const barW = 360;
        const barX = cx - barW / 2;
        const barY = cy + 10;

        const frame = this.add.graphics();
        frame.lineStyle(2, config.theme.ember, 0.8);
        frame.strokeRect(barX - 2, barY - 2, barW + 4, 16);

        const fill = this.add.graphics();
        fill.fillStyle(config.theme.ember, 1);
        fill.fillRect(barX, barY, barW, 12);

        this.add.text(cx, barY + 38, 'summoning…', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '15px',
            color: config.theme.css.ash,
        }).setOrigin(0.5);
    }

    preload() {
        // Only the procedurally generated art is needed before the menu. Audio
        // is handled by the AudioBoot scene, which runs in parallel so a slow or
        // stalled audio load can never hold up the menu.
        buildTextures(this);
    }

    async create() {
        // Give the display font a moment to arrive (it's baked into text at
        // creation), but never wait on it indefinitely.
        await Promise.race([this.loadFonts(), this.delay(2000)]);
        this.scene.launch('AudioBoot');
        this.scene.start('MainMenu');
    }

    private delay(ms: number) {
        return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
    }

    private async loadFonts() {
        const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
        if (!fonts?.load) return;
        try {
            await Promise.all([fonts.load('700 40px Cinzel'), fonts.load('400 20px Cinzel')]);
        } catch {
            // Serif fallback is fine if the font CDN is unreachable.
        }
    }
}
