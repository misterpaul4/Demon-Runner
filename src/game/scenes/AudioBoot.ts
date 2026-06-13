import { Scene } from 'phaser';

export class AudioBoot extends Scene {
    constructor() {
        super('AudioBoot');
    }

    preload() {
        this.load.setPath('assets/sound');
        this.load.audio('sfx-caw', 'crow.mp3');
        this.load.audio('sfx-jump', 'jump.mp3');
        this.load.audio('sfx-land', 'hitGround.mp3');
        this.load.audio('sfx-over', 'gameOver.mp3');
        this.load.audio('sfx-step', 'footstep.mp3');
    }

    create() {
        this.scene.stop();
    }
}
