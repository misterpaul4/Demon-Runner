import Phaser, { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import config from '../../utils/config';
import { TEX, DEMONS, demonTex } from '../systems/art';
import { Background } from '../world/Background';
import { Button } from '../ui/Button';
import { NameEntry } from '../ui/NameEntry';
import { applyMute, toggleSound } from '../systems/audio';
import { fetchUserBestScore } from '../../utils/leaderBoardAPI';

export class MainMenu extends Scene {
    private background!: Background;
    private demonImg!: Phaser.GameObjects.Image;
    private demonGlow!: Phaser.GameObjects.Image;
    private demonName!: Phaser.GameObjects.Text;
    private nameEntry!: NameEntry;
    private soundBtn!: Button;
    private demonBaseY = 296;

    constructor() {
        super('MainMenu');
    }

    create() {
        applyMute(this);
        const cx = config.width / 2;

        this.background = new Background(this);
        this.buildHero(cx, this.demonBaseY);

        this.add.text(cx, 112, 'DEMON RUNNER', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '74px',
            color: config.theme.css.parchment,
            fontStyle: '900',
        }).setOrigin(0.5).setShadow(0, 0, config.theme.css.ember, 24).setDepth(20);

        this.add.text(cx, 166, 'dodge the murder · outrun the dark', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '18px',
            color: config.theme.css.ash,
        }).setOrigin(0.5).setDepth(20);

        this.nameEntry = new NameEntry(this, cx, 452, config.username, () => this.play());

        new Button(this, cx, 530, 'Play', () => this.play(), { width: 300, height: 64, fontSize: 26 });
        new Button(this, cx, 604, 'Leaderboard', () => this.scene.start('Rank'), {
            width: 300, height: 54, variant: 'ghost', fontSize: 18,
        });

        this.soundBtn = new Button(this, config.width - 110, 668, this.soundLabel(), () => {
            toggleSound(this);
            this.soundBtn.setText(this.soundLabel());
        }, { width: 168, height: 46, variant: 'ghost', fontSize: 15 });

        new Button(this, 110, 668, 'Reset', () => {
            localStorage.clear();
            config.username = '';
            config.bestScore = 0;
            config.character = 'reaper';
            this.scene.restart();
        }, { width: 168, height: 46, variant: 'ghost', fontSize: 15 });

        this.events.once('shutdown', () => this.nameEntry.destroy());
        EventBus.emit('current-scene-ready', this);
    }

    private soundLabel() {
        return config.sound ? '♪  sound on' : '♪  sound off';
    }

    private buildHero(x: number, y: number) {
        this.demonGlow = this.add.image(x, y, TEX.glow)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setTint(config.theme.ember)
            .setAlpha(0.32)
            .setScale(2.4)
            .setDepth(9);

        this.demonImg = this.add.image(x, y, demonTex(config.character)).setScale(1.5).setDepth(11);

        this.add.particles(x, y + 78, TEX.ember, {
            speed: { min: 10, max: 36 },
            angle: { min: 240, max: 300 },
            lifespan: { min: 500, max: 1100 },
            scale: { start: 0.7, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: [config.theme.ember, config.theme.emberHot],
            blendMode: 'ADD',
            frequency: 60,
        }).setDepth(10);

        this.demonName = this.add.text(x, y + 116, this.currentDemon().name, {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '22px',
            color: config.theme.css.ember,
        }).setOrigin(0.5).setDepth(20);

        this.makeArrow(x - 152, y, '‹', -1);
        this.makeArrow(x + 152, y, '›', 1);
    }

    private makeArrow(x: number, y: number, glyph: string, dir: number) {
        const arrow = this.add.text(x, y, glyph, {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '60px',
            color: config.theme.css.ash,
        }).setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true });

        arrow.on('pointerover', () => arrow.setColor(config.theme.css.ember));
        arrow.on('pointerout', () => arrow.setColor(config.theme.css.ash));
        arrow.on('pointerup', () => this.cycleDemon(dir));
    }

    private currentDemon() {
        return DEMONS.find((d) => d.id === config.character) ?? DEMONS[0];
    }

    private cycleDemon(dir: number) {
        const ids = DEMONS.map((d) => d.id);
        let i = ids.indexOf(config.character as (typeof ids)[number]);
        if (i < 0) i = 0;
        i = (i + dir + ids.length) % ids.length;

        config.character = ids[i];
        localStorage.setItem(config.storageKeys.character, config.character);

        this.demonImg.setTexture(DEMONS[i].tex);
        this.demonName.setText(DEMONS[i].name);
        this.demonImg.setScale(1.25);
        this.tweens.add({ targets: this.demonImg, scale: 1.5, duration: 240, ease: 'Back.easeOut' });
    }

    private play() {
        const name = this.nameEntry.value.toLowerCase().replace(/[.#$[\]/]/g, '').trim();
        if (!name) {
            this.nameEntry.flash();
            return;
        }
        this.requestFullscreen();
        config.username = name;
        localStorage.setItem(config.storageKeys.username, name);
        fetchUserBestScore().finally(() => this.scene.start('Game'));
    }

    // in the browser (pre-install) the address bar eats screen space — go
    // fullscreen on touch devices when the run starts. No-op when already
    // fullscreen (installed PWA) or unsupported (iOS Safari).
    private requestFullscreen() {
        const isTouch = this.sys.game.device.input.touch;
        const standalone = window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;
        if (!isTouch || standalone || !this.scale.fullscreen.available || this.scale.isFullscreen) return;
        try {
            this.scale.startFullscreen();
        } catch {
            // fullscreen denied — the game still works, just with browser chrome
        }
    }

    update(time: number) {
        this.background.update(time * 0.04, 0);
        const bob = Math.sin(time * 0.002) * 10;
        this.demonImg.y = this.demonBaseY + bob;
        this.demonGlow.y = this.demonBaseY + bob;
    }
}
