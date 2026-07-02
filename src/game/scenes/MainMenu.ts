import Phaser, { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import config from '../../utils/config';
import { TEX, DEMONS, demonTex } from '../systems/art';
import { Background } from '../world/Background';
import { Button } from '../ui/Button';
import { NameEntry } from '../ui/NameEntry';
import { applyMute, toggleSound } from '../systems/audio';
import { buzz } from '../systems/haptics';
import { fetchUserBestScore } from '../../utils/leaderBoardAPI';
import { installAvailable, onInstallAvailability, promptInstall } from '../../utils/installPrompt';

export class MainMenu extends Scene {
    private background!: Background;
    private demonImg!: Phaser.GameObjects.Image;
    private demonGlow!: Phaser.GameObjects.Image;
    private demonName!: Phaser.GameObjects.Text;
    private dots: Phaser.GameObjects.Arc[] = [];
    private nameEntry!: NameEntry;
    private soundBtn!: Button;
    private resetBtn!: Button;
    private resetArmed = false;
    private resetTimer?: Phaser.Time.TimerEvent;
    private installBtn: Button | null = null;
    private offInstall?: () => void;
    private heroX = 0;
    private heroBaseY = 380;
    private swipeStartX = 0;

    constructor() {
        super('MainMenu');
    }

    create() {
        applyMute(this);
        const w = config.width;
        const cx = w / 2;
        // landscape two-column layout: character carousel left, actions right —
        // a single centred stack turns into ~29px touch targets on a phone
        this.heroX = Math.round(w * 0.28);
        const rx = Math.round(w * 0.72);

        this.background = new Background(this);

        this.add.text(cx, 84, 'DEMON RUNNER', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '64px',
            color: config.theme.css.parchment,
            fontStyle: '900',
        }).setOrigin(0.5).setShadow(0, 0, config.theme.css.ember, 24).setDepth(20);

        this.add.text(cx, 134, 'dodge the murder · outrun the dark', {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '17px',
            color: config.theme.css.ash,
        }).setOrigin(0.5).setDepth(20);

        this.buildHero(this.heroX, this.heroBaseY);

        // right column — the primary path: name, play, leaderboard
        this.nameEntry = new NameEntry(this, rx, 306, config.username, () => this.play());
        new Button(this, rx, 424, 'Play', () => this.play(), { width: 380, height: 92, fontSize: 30 });
        new Button(this, rx, 528, 'Leaderboard', () => this.scene.start('Rank'), {
            width: 380, height: 62, variant: 'ghost', fontSize: 18,
        });

        // bottom utility row
        this.resetBtn = new Button(this, 132, 668, 'Reset', () => this.confirmReset(), {
            width: 175, height: 52, variant: 'ghost', fontSize: 15,
        });
        this.soundBtn = new Button(this, w - 132, 668, this.soundLabel(), () => {
            toggleSound(this);
            this.soundBtn.setText(this.soundLabel());
        }, { width: 175, height: 52, variant: 'ghost', fontSize: 15 });
        this.buildInstallButton(cx);

        // desktop niceties — arrow keys cycle the demon
        this.input.keyboard?.on('keydown-LEFT', () => this.cycleDemon(-1));
        this.input.keyboard?.on('keydown-RIGHT', () => this.cycleDemon(1));

        this.events.once('shutdown', () => {
            this.nameEntry.destroy();
            this.offInstall?.();
            this.offInstall = undefined;
            this.installBtn = null;
            this.dots = [];
        });
        EventBus.emit('current-scene-ready', this);
    }

    // shown only when the browser reports the PWA is installable —
    // tapping it replays the native install dialog
    private buildInstallButton(cx: number) {
        const sync = (available: boolean) => {
            if (available && !this.installBtn) {
                this.installBtn = new Button(this, cx, 668, 'Install App', () => promptInstall(), {
                    width: 220, height: 52, variant: 'ghost', fontSize: 15,
                });
            } else if (!available && this.installBtn) {
                this.installBtn.destroy();
                this.installBtn = null;
            }
        };
        sync(installAvailable());
        this.offInstall = onInstallAvailability(sync);
    }

    private soundLabel() {
        return config.sound ? '♪  sound on' : '♪  sound off';
    }

    // wiping progress used to be a single accidental tap — arm first, confirm second
    private confirmReset() {
        if (!this.resetArmed) {
            this.resetArmed = true;
            this.resetBtn.setText('sure?');
            this.resetTimer = this.time.delayedCall(2600, () => {
                this.resetArmed = false;
                this.resetBtn.setText('Reset');
            });
            return;
        }
        this.resetTimer?.remove();
        localStorage.clear();
        config.username = '';
        config.bestScore = 0;
        config.character = 'reaper';
        this.scene.restart();
    }

    private buildHero(x: number, y: number) {
        // the whole hero area is a carousel: swipe to cycle, tap for next.
        // arrows sit at higher depth so they win input inside the zone.
        this.add.zone(x, y, 470, 380).setInteractive({ useHandCursor: true })
            .on('pointerdown', (p: Phaser.Input.Pointer) => {
                this.swipeStartX = p.x;
            })
            .on('pointerup', (p: Phaser.Input.Pointer) => {
                const dx = p.x - this.swipeStartX;
                if (Math.abs(dx) > 36) this.cycleDemon(dx < 0 ? 1 : -1);
                else this.cycleDemon(1);
            });

        this.demonGlow = this.add.image(x, y, TEX.glow)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setTint(config.theme.ember)
            .setAlpha(0.32)
            .setScale(2.6)
            .setDepth(9);

        this.demonImg = this.add.image(x, y, demonTex(config.character)).setScale(1.7).setDepth(11);

        this.add.particles(x, y + 92, TEX.ember, {
            speed: { min: 10, max: 36 },
            angle: { min: 240, max: 300 },
            lifespan: { min: 500, max: 1100 },
            scale: { start: 0.7, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: [config.theme.ember, config.theme.emberHot],
            blendMode: 'ADD',
            frequency: 60,
        }).setDepth(10);

        this.demonName = this.add.text(x, y + 138, this.currentDemon().name, {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '24px',
            color: config.theme.css.ember,
        }).setOrigin(0.5).setDepth(20);

        const dotSpan = (DEMONS.length - 1) * 26;
        DEMONS.forEach((_d, i) => {
            this.dots.push(this.add.circle(x - dotSpan / 2 + i * 26, y + 176, 5, 0xffffff).setDepth(20));
        });
        this.refreshDots();

        this.makeArrow(x - 196, y, '‹', -1);
        this.makeArrow(x + 196, y, '›', 1);
    }

    private makeArrow(x: number, y: number, glyph: string, dir: number) {
        const arrow = this.add.text(x, y, glyph, {
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '84px',
            color: config.theme.css.ash,
        }).setOrigin(0.5).setDepth(20);

        // a bare glyph is a sliver of a touch target — pad the hit area
        // far beyond the visible character (local coords, origin top-left)
        arrow.setInteractive(
            new Phaser.Geom.Rectangle(-34, -60, arrow.width + 68, arrow.height + 120),
            Phaser.Geom.Rectangle.Contains,
        );
        if (arrow.input) arrow.input.cursor = 'pointer';

        arrow.on('pointerover', () => arrow.setColor(config.theme.css.ember));
        arrow.on('pointerout', () => arrow.setColor(config.theme.css.ash));
        arrow.on('pointerdown', () => {
            this.tweens.add({ targets: arrow, scale: 0.82, duration: 70, ease: 'Quad.easeOut' });
        });
        arrow.on('pointerup', () => {
            this.tweens.add({ targets: arrow, scale: 1, duration: 140, ease: 'Back.easeOut' });
            this.cycleDemon(dir);
        });
    }

    private currentDemon() {
        return DEMONS.find((d) => d.id === config.character) ?? DEMONS[0];
    }

    private refreshDots() {
        const active = DEMONS.findIndex((d) => d.id === config.character);
        this.dots.forEach((dot, i) => {
            dot.setFillStyle(i === active ? config.theme.ember : config.theme.ash);
            dot.setAlpha(i === active ? 1 : 0.35);
            dot.setRadius(i === active ? 6 : 4.5);
        });
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
        this.refreshDots();
        buzz(6);

        // slide in from the direction of travel
        this.demonImg.x = this.heroX + dir * 26;
        this.demonImg.setScale(1.45);
        this.tweens.add({
            targets: this.demonImg,
            x: this.heroX,
            scale: 1.7,
            duration: 240,
            ease: 'Back.easeOut',
        });
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
        this.demonImg.y = this.heroBaseY + bob;
        this.demonGlow.y = this.heroBaseY + bob;
    }
}
