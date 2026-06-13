import { Scene } from 'phaser';

// Audio loads here, in a scene that runs in parallel with the menu and game
// rather than gating either of them. If decoding stalls (a locked AudioContext,
// a slow or flaky connection) the rest of the game is unaffected — sound simply
// comes online whenever this finishes. Keys land in the global cache, so every
// other scene can play them once loaded.
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
