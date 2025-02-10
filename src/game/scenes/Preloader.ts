import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        // display progress bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        const { width } = this.cameras.main;
        const { height } = this.cameras.main;
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                color: '#ffffff',
            },
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                color: '#ffffff',
            },
        });
        percentText.setOrigin(0.5, 0.5);

        const assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px monospace',
                color: '#ffffff',
            },
        });
        assetText.setOrigin(0.5, 0.5);

        // update progress bar
        this.load.on('progress', (value: number) => {
            // eslint-disable-next-line radix
            percentText.setText(`${parseInt(String(value * 100))}%`);
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        // update file progress text
        this.load.on('fileprogress', (file: { key: string }) => {
            assetText.setText(`Loading asset: ${file.key}`);
        });

        // remove progress bar when complete
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });
    }

    preload() {
        this.load.setPath('assets');

        this.load.audio('bird', 'sound/crow.mp3');
        this.load.audio('hitGround', 'sound/hitGround.mp3');
        this.load.audio('gameOver', 'sound/gameOver.mp3');
        this.load.audio('jump', 'sound/jump.mp3');
        this.load.audio('run', 'sound/footstep.mp3');

        this.load.image('startBtn', 'start_btn.png');
        this.load.image('leaderboard', 'leaderboard.png');
        this.load.image('ground', 'ground.png');
        this.load.image('gameOver', 'gameOver.png');
        this.load.image('restartBtn', 'restart_btn.png');
        this.load.image('quitBtn', 'quit_btn.png');
        this.load.image('backBtn', 'back_btn.png');
        this.load.image('resetBtn', 'reset_btn.png');
        this.load.image('muteBtn', 'mute.png');
        this.load.image('unmuteBtn', 'unmute.png');
    }

    create() {
        this.scene.start('MainMenu');
    }
}
