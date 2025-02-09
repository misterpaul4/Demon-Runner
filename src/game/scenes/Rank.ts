import { Scene } from 'phaser';
import settings from '../../utils/config';
import { getUsers } from '../../utils/leaderBoardAPI';

export class Rank extends Scene
{
    constructor ()
    {
        super('Rank');
    }

    async create ()
    {
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

        // experimental
        getUsers().then((res) => console.log("Data", res));
    }
}
