import Phaser from 'phaser';
import config from '../../utils/config';

type Variant = 'primary' | 'ghost';

interface ButtonOpts {
    width?: number;
    height?: number;
    variant?: Variant;
    fontSize?: number;
}

export class Button extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Graphics;
    private label: Phaser.GameObjects.Text;
    private boxW: number;
    private boxH: number;
    private variant: Variant;
    private hovered = false;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        onClick: () => void,
        opts: ButtonOpts = {},
    ) {
        super(scene, x, y);
        this.boxW = opts.width ?? 260;
        this.boxH = opts.height ?? 62;
        this.variant = opts.variant ?? 'primary';

        this.bg = scene.add.graphics();
        this.label = scene.add
            .text(0, 0, text.toUpperCase(), {
                fontFamily: 'Cinzel, Georgia, serif',
                fontSize: `${opts.fontSize ?? 22}px`,
                color: config.theme.css.parchment,
            })
            .setOrigin(0.5);
        this.label.setLetterSpacing(2);

        this.add([this.bg, this.label]);
        this.draw();

        this.setSize(this.boxW, this.boxH);
        // hit area is padded past the visible box — fingers are not cursors.
        // NOTE: container hit areas are tested in top-left space (Phaser adds
        // displayOrigin = size/2 to the local point), so the rect starts at
        // (-pad, -pad), NOT at (-w/2 - pad, -h/2 - pad)
        this.setInteractive(
            new Phaser.Geom.Rectangle(-14, -12, this.boxW + 28, this.boxH + 24),
            Phaser.Geom.Rectangle.Contains,
        );
        if (this.input) this.input.cursor = 'pointer';

        this.on('pointerover', () => {
            this.hovered = true;
            this.draw();
            scene.tweens.add({ targets: this, scale: 1.05, duration: 120, ease: 'Quad.easeOut' });
        });
        this.on('pointerout', () => {
            this.hovered = false;
            this.draw();
            scene.tweens.add({ targets: this, scale: 1, duration: 120, ease: 'Quad.easeOut' });
        });
        this.on('pointerdown', () => {
            scene.tweens.add({ targets: this, scale: 0.97, duration: 70, yoyo: true });
        });
        this.on('pointerup', onClick);

        scene.add.existing(this);
    }

    setText(text: string) {
        this.label.setText(text.toUpperCase());
        return this;
    }

    private draw() {
        const T = config.theme;
        const r = 14;
        const x = -this.boxW / 2;
        const y = -this.boxH / 2;
        this.bg.clear();

        if (this.variant === 'primary') {
            this.bg.fillStyle(this.hovered ? T.emberDeep : 0x2a0f10, this.hovered ? 0.95 : 0.85);
            this.bg.fillRoundedRect(x, y, this.boxW, this.boxH, r);
            this.bg.lineStyle(2, T.ember, this.hovered ? 1 : 0.8);
            this.bg.strokeRoundedRect(x, y, this.boxW, this.boxH, r);
            this.label.setColor(this.hovered ? '#fff3e2' : T.css.parchment);
        } else {
            this.bg.fillStyle(0x0d0a16, this.hovered ? 0.85 : 0.55);
            this.bg.fillRoundedRect(x, y, this.boxW, this.boxH, r);
            this.bg.lineStyle(1.5, T.ash, this.hovered ? 0.9 : 0.5);
            this.bg.strokeRoundedRect(x, y, this.boxW, this.boxH, r);
            this.label.setColor(this.hovered ? T.css.parchment : T.css.ash);
        }
    }
}
