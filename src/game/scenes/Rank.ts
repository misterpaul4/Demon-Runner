import { Scene } from 'phaser';
import settings from '../../utils/config';
import { getUsers } from '../../utils/leaderBoardAPI';

export class Rank extends Scene {
    constructor() {
        super('Rank');
    }

    async create() {
        this.add.image(400, 225, 'background');
        const backBtn = this.add.image(80, 400, 'backBtn').setScale(0.2);

        backBtn.setInteractive();
        backBtn.on('pointerup', () => {
            this.scene.start('MainMenu');
        });

        this.add
            .text(settings.gameWidth / 2, 100, `TOP ${settings.ranks} SCORES`, {
                font: '25px Ariel',
                color: '#ffffff',
                fontStyle: 'bolder',
            })
            .setOrigin(0.5);

        const loadingText = this.add
            .text(settings.gameWidth / 2, 260, 'Loading...', {
                font: '18px',
                color: '#ffffff',
            })
            .setOrigin(0.5);

            const multiplier = 25;

        getUsers().then((record) => {
            loadingText.destroy();

            if (record) {
                const sortedRecord = Object.fromEntries(
                    Object.entries(record).sort((a, b) => b[1] - a[1])
                );

                let index = 0;
                for (const user in sortedRecord) {
                    this.add
                        .text(
                            settings.gameWidth / 2.6,
                            multiplier * (index + 6),
                            `${index + 1}`,
                            {
                                font: '15px Sans-serif',
                                color: '#ffffff',
                            },
                        )
                        .setOrigin(1, 0.5);

                    this.add
                        .text(
                            settings.gameWidth / 2.6 + 10,
                            multiplier * (index + 6),
                            `${user === settings.username ? '\u{1F464}  ' : ''}${user}`,
                            {
                                font: '15px Sans-serif',
                                color: '#ffffff',
                            },
                        )
                        .setOrigin(0, 0.5);

                    this.add
                        .text(
                            settings.gameWidth / 2.6 + 200,
                            multiplier * (index + 6),
                            `${record[user]}`,
                            {
                                font: '15px Sans-serif',
                                color: '#ffffff',
                            },
                        )
                        .setOrigin(1, 0.5);

                    index++;
                }
            }
        });
    }
}
