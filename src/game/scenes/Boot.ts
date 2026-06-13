import { Scene } from 'phaser';

// All visuals are generated procedurally in the Preloader, so Boot has nothing
// to fetch from disk. It exists only to hand off cleanly to the loading screen.
export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    create() {
        this.scene.start('Preloader');
    }
}
