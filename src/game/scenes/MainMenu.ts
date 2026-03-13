import { GameObjects, Scene } from 'phaser';
import { createElement, Volume2, VolumeX } from 'lucide';

import { EventBus } from '../EventBus';
import config from '../../utils/config';
import createTextLink from '../../utils/createTextLink';

const createAudioIconMarkup = (muted: boolean) => createElement(muted ? VolumeX : Volume2, {
    width: 22,
    height: 22,
    color: muted ? '#f3d7d0' : '#eff4ee',
    stroke: muted ? '#f3d7d0' : '#eff4ee',
    'stroke-width': 2.1,
    'aria-hidden': 'true',
}).outerHTML;

export class MainMenu extends Scene {
    background: GameObjects.Image;
    startBtn: Phaser.GameObjects.Container;
    resetBtn: Phaser.GameObjects.Container;
    audioBtn: Phaser.GameObjects.DOMElement;

    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.setPath('assets');

        this.load.spritesheet('player', 'characterSprite2.png', {
          frameWidth: 500,
          frameHeight: 632,
        });
        this.load.spritesheet('bird', 'birdSprite.png', {
          frameHeight: 416,
          frameWidth: 416,
        });
      }

    create() {
        const centerX = config.gameWidth / 2;
        const centerY = config.gameHeight / 2;

        this.background = this.add.image(centerX, centerY, 'background');
        this.background.setDisplaySize(config.gameWidth, config.gameHeight);

        this.add.text(centerX, 150, 'HIRO RUN', {
            fontFamily: 'Bushiroad',
            fontSize: '84px',
            color: '#c93a2f',
        }).setOrigin(0.5);

        this.startBtn = createTextLink(this, centerX, 0, 'start game', this.changeScene.bind(this), {
            fontSize: 40,
            color: '#ffffff',
            backgroundPaddingX: 56,
            underlineOffsetY: 18,
        });
        this.resetBtn = createTextLink(this, centerX, 0, 'clear record', () => {
            localStorage.removeItem('bestScore');
            window.location.reload();
        }, {
            fontSize: 40,
            color: '#ffffff',
            backgroundPaddingX: 56,
            underlineOffsetY: 18,
        });

        const buttonGap = 28;
        const totalHeight = this.startBtn.height + this.resetBtn.height + buttonGap;
        this.startBtn.setY(centerY - totalHeight / 2 + this.startBtn.height / 2);
        this.resetBtn.setY(centerY + totalHeight / 2 - this.resetBtn.height / 2);

        this.audioBtn = this.add.dom(82, config.gameHeight - 76, 'button');
        this.audioBtn.setScrollFactor(0);
        this.audioBtn.setDepth(20);

        const audioButtonNode = this.audioBtn.node as HTMLButtonElement;
        audioButtonNode.type = 'button';
        audioButtonNode.className = 'menu-audio-toggle';

        const updateAudioButton = () => {
            audioButtonNode.classList.toggle('is-muted', config.sound);
            audioButtonNode.setAttribute('aria-label', config.sound ? 'Unmute sound' : 'Mute sound');
            audioButtonNode.innerHTML = createAudioIconMarkup(config.sound);
        };

        this.sound.mute = config.sound;
        updateAudioButton();

        EventBus.emit('current-scene-ready', this);

        audioButtonNode.addEventListener('click', () => {
            config.sound = !config.sound;
            this.sound.mute = config.sound;
            localStorage.setItem('sound', String(config.sound));
            updateAudioButton();
        });
    }

    changeScene() {
        this.scene.start('Game');
    }
}
