import Phaser from 'phaser';
import config from '../../utils/config';
import { Score } from '../systems/score';

export class Hud {
    private scene: Phaser.Scene;
    private scoreText: Phaser.GameObjects.Text;
    private bestText: Phaser.GameObjects.Text;
    private comboText: Phaser.GameObjects.Text;
    private comboRing: Phaser.GameObjects.Graphics;
    private comboBox: Phaser.GameObjects.Container;
    private shownMultiplier = 1;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        const css = config.theme.css;

        this.scoreText = scene.add.text(30, 22, '0', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '44px',
            color: css.parchment,
        }).setScrollFactor(0).setDepth(1000).setShadow(0, 2, '#000000', 6);

        this.bestText = scene.add.text(32, 74, '', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '16px',
            color: css.ash,
        }).setScrollFactor(0).setDepth(1000);

        this.comboRing = scene.add.graphics();
        this.comboText = scene.add.text(0, 0, '', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '30px',
            color: css.ember,
        }).setOrigin(0.5);
        this.comboBox = scene.add
            .container(config.width / 2, 52, [this.comboRing, this.comboText])
            .setScrollFactor(0)
            .setDepth(1000)
            .setAlpha(0);

        const best = config.bestScore || 0;
        this.bestText.setText(best > 0 ? `best · ${best}` : '');
    }

    update(score: Score, time: number) {
        this.scoreText.setText(`${score.value}`);

        const best = config.bestScore || 0;
        if (score.value > best) {
            this.bestText.setText('new high');
            this.bestText.setColor(config.theme.css.ember);
        }

        const mult = score.comboMultiplier;
        if (mult > 1) {
            this.comboBox.setAlpha(1);
            this.comboText.setText(`×${mult}`);

            this.comboRing.clear();
            this.comboRing.lineStyle(3, config.theme.ember, 0.9);
            const sweep = -Math.PI / 2 + Math.PI * 2 * score.comboRemaining(time);
            this.comboRing.beginPath();
            this.comboRing.arc(0, 0, 26, -Math.PI / 2, sweep, false);
            this.comboRing.strokePath();

            if (mult !== this.shownMultiplier) {
                this.scene.tweens.add({
                    targets: this.comboBox,
                    scale: { from: 1.35, to: 1 },
                    duration: 220,
                    ease: 'Back.easeOut',
                });
            }
        } else {
            this.comboBox.setAlpha(0);
        }
        this.shownMultiplier = mult;
    }
}
