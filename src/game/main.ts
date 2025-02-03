import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import cg from '../utils/config';
import '../../public/style.css';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: cg.gameWidth,
    height: cg.gameHeight,
    parent: 'game-container',
    backgroundColor: cg.backgroundColor,
    physics: {
        default: 'arcade',
        arcade: {
          gravity: {
            y: cg.playerGravity,
            x: 0
          },
          debug: true,
        },
      },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
