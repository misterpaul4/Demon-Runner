import { Scene } from 'phaser';
import config from '../../utils/config';
import { Background } from '../world/Background';
import { Button } from '../ui/Button';
import { getUsers } from '../../utils/leaderBoardAPI';

export class Rank extends Scene {
    private background!: Background;

    constructor() {
        super('Rank');
    }

    create() {
        const cx = config.width / 2;
        this.background = new Background(this);

        this.add.text(cx, 92, 'TOP SOULS', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '54px',
            color: config.theme.css.parchment,
            fontStyle: '900',
        }).setOrigin(0.5).setShadow(0, 0, config.theme.css.ember, 18).setDepth(20);

        const loading = this.add.text(cx, 360, 'consulting the ledger…', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '18px',
            color: config.theme.css.ash,
        }).setOrigin(0.5).setDepth(20);

        new Button(this, cx, 660, 'Back', () => this.scene.start('MainMenu'), {
            width: 220, height: 54, variant: 'ghost', fontSize: 18,
        });

        getUsers()
            .then((record) => {
                if (!this.scene.isActive()) return;
                loading.destroy();
                if (!record || Object.keys(record).length === 0) {
                    this.add.text(cx, 360, 'no souls have run yet', {
                        fontFamily: 'Cinzel, Georgia, serif', fontSize: '18px', color: config.theme.css.ash,
                    }).setOrigin(0.5).setDepth(20);
                    return;
                }
                this.renderRows(record);
            })
            .catch(() => {
                if (!this.scene.isActive()) return;
                loading.setText('the ledger is sealed (offline)');
            });
    }

    private renderRows(record: Record<string, number>) {
        const cx = config.width / 2;
        const rows = Object.entries(record).sort((a, b) => b[1] - a[1]).slice(0, config.ranks);
        const top = 190;
        const gap = 42;
        const rowW = 560;

        rows.forEach(([name, score], i) => {
            const y = top + i * gap;
            const mine = name === config.username;
            const T = config.theme;

            const bg = this.add.graphics().setDepth(15);
            bg.fillStyle(mine ? T.emberDeep : 0x0c0a16, mine ? 0.35 : 0.4);
            bg.fillRoundedRect(cx - rowW / 2, y - 16, rowW, 32, 8);
            if (mine) {
                bg.lineStyle(1.5, T.ember, 0.8);
                bg.strokeRoundedRect(cx - rowW / 2, y - 16, rowW, 32, 8);
            }

            const rankColor = i === 0 ? T.css.ember : i < 3 ? T.css.parchment : T.css.ash;
            this.add.text(cx - rowW / 2 + 24, y, `${i + 1}`, {
                fontFamily: 'Cinzel, Georgia, serif', fontSize: '18px', color: rankColor,
            }).setOrigin(0, 0.5).setDepth(16);

            this.add.text(cx - rowW / 2 + 78, y, mine ? `${name}  ·  you` : name, {
                fontFamily: 'Cinzel, Georgia, serif', fontSize: '18px',
                color: mine ? T.css.ember : T.css.parchment,
            }).setOrigin(0, 0.5).setDepth(16);

            this.add.text(cx + rowW / 2 - 24, y, `${score}`, {
                fontFamily: 'Cinzel, Georgia, serif', fontSize: '18px', color: T.css.parchment,
            }).setOrigin(1, 0.5).setDepth(16);
        });
    }

    update(time: number) {
        this.background.update(time * 0.03, 0.5);
    }
}
