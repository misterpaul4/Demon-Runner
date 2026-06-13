import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import config from '../../utils/config';
import { Button } from '../ui/Button';

type RunStats = { score: number; metres: number; best: number; isBest: boolean };

export class GameOver extends Scene {
    private stats!: RunStats;

    constructor() {
        super('GameOver');
    }

    init(data: RunStats) {
        this.stats = data;
    }

    create() {
        const cx = config.width / 2;
        const T = config.theme;

        this.add.rectangle(0, 0, config.width, config.height, 0x05040a, 0.66)
            .setOrigin(0)
            .setScrollFactor(0);

        const panel = this.add.container(cx, config.height / 2).setScrollFactor(0);

        const card = this.add.graphics();
        card.fillStyle(0x0a0712, 0.92);
        card.fillRoundedRect(-300, -210, 600, 420, 18);
        card.lineStyle(2, T.ember, 0.6);
        card.strokeRoundedRect(-300, -210, 600, 420, 18);
        panel.add(card);

        panel.add(this.add.text(0, -158, this.stats.isBest ? 'A NEW LEGEND' : 'YOU WERE SLAIN', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '34px',
            color: this.stats.isBest ? T.css.ember : T.css.parchment,
        }).setOrigin(0.5));

        panel.add(this.add.text(0, -70, `${this.stats.score}`, {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '92px',
            color: T.css.parchment,
        }).setOrigin(0.5).setShadow(0, 0, T.css.ember, 18));

        panel.add(this.add.text(0, 6, 'SOULS HARVESTED', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '14px',
            color: T.css.ash,
        }).setOrigin(0.5));

        panel.add(this.add.text(-150, 64, `${this.stats.metres} m`, {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '26px',
            color: T.css.parchment,
        }).setOrigin(0.5));
        panel.add(this.add.text(-150, 92, 'distance', {
            fontFamily: 'Cinzel, Georgia, serif', fontSize: '13px', color: T.css.ash,
        }).setOrigin(0.5));

        panel.add(this.add.text(150, 64, `${this.stats.best}`, {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '26px',
            color: this.stats.isBest ? T.css.ember : T.css.parchment,
        }).setOrigin(0.5));
        panel.add(this.add.text(150, 92, 'best', {
            fontFamily: 'Cinzel, Georgia, serif', fontSize: '13px', color: T.css.ash,
        }).setOrigin(0.5));

        new Button(this, cx - 110, config.height / 2 + 158, 'Run Again', () => this.retry(), {
            width: 220, height: 58, fontSize: 20,
        });
        new Button(this, cx + 110, config.height / 2 + 158, 'Menu', () => this.toMenu(), {
            width: 200, height: 58, variant: 'ghost', fontSize: 20,
        });

        panel.setScale(0.92).setAlpha(0);
        this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 240, ease: 'Back.easeOut' });

        this.input.keyboard?.once('keydown-SPACE', () => this.retry());
        this.input.keyboard?.once('keydown-ENTER', () => this.retry());

        EventBus.emit('current-scene-ready', this);
    }

    private retry() {
        this.scene.stop('GameOver');
        this.scene.stop('Game');
        this.scene.start('Game');
    }

    private toMenu() {
        this.scene.stop('GameOver');
        this.scene.stop('Game');
        this.scene.start('MainMenu');
    }
}
