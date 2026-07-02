import Phaser from 'phaser';
import config from '../../utils/config';

const MAX_LEN = 12;

export class NameEntry {
    private scene: Phaser.Scene;
    private input: HTMLInputElement;
    private container: Phaser.GameObjects.Container;
    private bg: Phaser.GameObjects.Graphics;
    private valueText: Phaser.GameObjects.Text;
    private caret: Phaser.GameObjects.Rectangle;
    private focused = false;
    private width: number;
    private height = 72;

    constructor(scene: Phaser.Scene, x: number, y: number, initial = '', onSubmit?: () => void) {
        this.scene = scene;
        this.width = 420;

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.maxLength = MAX_LEN;
        this.input.value = initial;
        this.input.autocomplete = 'off';
        this.input.setAttribute('autocapitalize', 'off');
        this.input.setAttribute('autocorrect', 'off');
        Object.assign(this.input.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            width: '1px',
            height: '1px',
            opacity: '0',
            border: '0',
            padding: '0',
            pointerEvents: 'none',
        } as CSSStyleDeclaration);
        document.body.appendChild(this.input);

        this.bg = scene.add.graphics();
        this.valueText = scene.add.text(-this.width / 2 + 22, 0, '', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '26px',
            color: config.theme.css.parchment,
        }).setOrigin(0, 0.5);
        this.caret = scene.add.rectangle(0, 0, 2, 30, 0xff8a3c).setOrigin(0, 0.5).setAlpha(0);

        this.container = scene.add
            .container(x, y, [this.bg, this.valueText, this.caret])
            .setSize(this.width, this.height)
            .setDepth(50)
            .setInteractive({ useHandCursor: true });

        this.container.on('pointerdown', () => this.focus());
        this.input.addEventListener('input', () => this.refresh());
        this.input.addEventListener('focus', () => {
            this.focused = true;
            this.refresh();
        });
        this.input.addEventListener('blur', () => {
            this.focused = false;
            this.refresh();
        });
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.input.blur();
                onSubmit?.();
            }
        });

        scene.tweens.add({
            targets: this.caret,
            alpha: { from: 0, to: 1 },
            duration: 500,
            yoyo: true,
            repeat: -1,
            hold: 120,
        });

        this.refresh();
    }

    private refresh() {
        const value = this.input.value;
        const empty = value.length === 0;
        this.valueText.setText(empty && !this.focused ? 'enter thy name' : value);
        this.valueText.setColor(empty && !this.focused ? config.theme.css.ash : config.theme.css.parchment);

        this.caret.setVisible(this.focused);
        this.caret.x = -this.width / 2 + 22 + (empty ? 0 : this.valueText.width) + 3;

        const T = config.theme;
        const x = -this.width / 2;
        const y = -this.height / 2;
        this.bg.clear();
        this.bg.fillStyle(0x0a0712, 0.7);
        this.bg.fillRoundedRect(x, y, this.width, this.height, 12);
        this.bg.lineStyle(2, this.focused ? T.ember : T.ash, this.focused ? 1 : 0.5);
        this.bg.strokeRoundedRect(x, y, this.width, this.height, 12);
    }

    focus() {
        this.input.focus();
    }

    flash() {
        this.scene.tweens.add({
            targets: this.container,
            x: { from: this.container.x - 8, to: this.container.x },
            duration: 70,
            repeat: 3,
            yoyo: true,
        });
        this.bg.clear();
        const x = -this.width / 2;
        const y = -this.height / 2;
        this.bg.fillStyle(0x1a0708, 0.8);
        this.bg.fillRoundedRect(x, y, this.width, this.height, 12);
        this.bg.lineStyle(2, config.theme.blood, 1);
        this.bg.strokeRoundedRect(x, y, this.width, this.height, 12);
        this.scene.time.delayedCall(500, () => this.refresh());
    }

    get value() {
        return this.input.value.trim();
    }

    setPosition(x: number, y: number) {
        this.container.setPosition(x, y);
    }

    destroy() {
        this.input.remove();
        this.container.destroy();
    }
}
