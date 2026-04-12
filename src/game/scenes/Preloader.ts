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

        const { width } = this.cameras.main;
        const { height } = this.cameras.main;
        const boxWidth = 420;
        const boxHeight = 56;
        const boxX = width / 2 - boxWidth / 2;
        const boxY = height / 2 + 10;
        progressBox.fillRect(boxX, boxY, boxWidth, boxHeight);
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                fontFamily: 'BrushScriptStd',
                fontSize: '20px',
                color: '#ffffff',
            },
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                fontFamily: 'BrushScriptStd',
                fontSize: '28px',
                color: '#ffffff',
            },
        });
        percentText.setOrigin(0.5, 0.5);

        const assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                fontFamily: 'BrushScriptStd',
                fontSize: '18px',
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
            progressBar.fillRect(boxX + 10, boxY + 10, (boxWidth - 20) * value, boxHeight - 20);
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

        this.load.image('ground', 'ground.png');
        this.load.image('spear', 'simplespear.png');
        this.load.image('star', 'star.png');
    }

    create() {
        void this.startMainMenuWhenFontsReady();
    }

    private async startMainMenuWhenFontsReady() {
        if ('fonts' in document) {
            try {
                const fontFaceSet = document.fonts;
                await Promise.race([
                    Promise.all([
                        fontFaceSet.load('84px "Bushiroad"'),
                        fontFaceSet.load('28px "BrushScriptStd"'),
                    ]),
                    new Promise((resolve) => {
                        window.setTimeout(resolve, 3000);
                    }),
                ]);
            } catch {
                // Continue into the menu even if the browser cannot pre-load fonts explicitly.
            }
        }

        this.scene.start('MainMenu');
    }
}
