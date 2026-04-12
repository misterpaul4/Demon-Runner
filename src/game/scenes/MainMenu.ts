import { GameObjects, Scene } from 'phaser';
import { createElement, ShoppingBag, Volume2, VolumeX } from 'lucide';

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

const createShopIconMarkup = (stars: number) => `${createElement(ShoppingBag, {
    width: 22,
    height: 22,
    color: '#fff0cf',
    stroke: '#fff0cf',
    'stroke-width': 2.1,
    'aria-hidden': 'true',
}).outerHTML}<span class="menu-shop-badge"><img src="assets/star.png" alt="" /><span>${stars}</span></span>`;

export class MainMenu extends Scene {
    background: GameObjects.Image;
    startBtn: Phaser.GameObjects.Container;
    resetBtn: Phaser.GameObjects.Container;
    audioBtn: Phaser.GameObjects.DOMElement;
    shopBtn: Phaser.GameObjects.DOMElement;

    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.setPath('assets');

        this.load.spritesheet('player', 'characterSprite.png', {
          frameWidth: 905,
          frameHeight: 1035,
        });
        this.load.spritesheet('bird', 'bird.png', {
          frameHeight: 341,
          frameWidth: 341,
        });
        this.load.spritesheet('warden', 'kanshou.png', {
          frameHeight: 256,
          frameWidth: 256,
        });
      }

    create() {
        const centerX = config.gameWidth / 2;
        const centerY = config.gameHeight / 2;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.background = this.add.image(width / 2, height / 2, 'background');
        
        // Calculate scale to fill screen while keeping aspect ratio (Cover)
        const scaleX = width / this.background.width;
        const scaleY = height / this.background.height;
        const scale = Math.max(scaleX, scaleY);
        this.background.setScale(scale).setScrollFactor(0);
        this.background.setDepth(-10);

        const title = this.add.text(centerX, 150, 'HIRO RUN', {
            fontFamily: 'Bushiroad',
            fontSize: '92px',
            color: '#c93a2f',
        }).setOrigin(0.5);

        // Add a floating animation to the title
        this.tweens.add({
            targets: title,
            y: 160,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add a slight color shift/glow to the title
        this.tweens.add({
            targets: title,
            alpha: 0.8,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Quad.easeInOut'
        });

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
        const startY = centerY - totalHeight / 2;
        this.startBtn.setY(startY + this.startBtn.height / 2);
        this.resetBtn.setY(this.startBtn.y + this.startBtn.height / 2 + buttonGap + this.resetBtn.height / 2);

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

        this.shopBtn = this.add.dom(config.gameWidth - 82, config.gameHeight - 76, 'button');
        this.shopBtn.setScrollFactor(0);
        this.shopBtn.setDepth(20);

        const shopButtonNode = this.shopBtn.node as HTMLButtonElement;
        const stars = Number(localStorage.getItem('stars') || '0');
        shopButtonNode.type = 'button';
        shopButtonNode.className = 'menu-shop-toggle';
        shopButtonNode.setAttribute('aria-label', 'Open shop');
        shopButtonNode.innerHTML = createShopIconMarkup(stars);

        EventBus.emit('current-scene-ready', this);

        audioButtonNode.addEventListener('click', () => {
            config.sound = !config.sound;
            this.sound.mute = config.sound;
            localStorage.setItem('sound', String(config.sound));
            updateAudioButton();
        });

        shopButtonNode.addEventListener('click', () => {
            this.openShop();
        });
    }

    changeScene() {
        this.scene.start('Game');
    }

    openShop() {
        this.scene.start('Shop');
    }
}
