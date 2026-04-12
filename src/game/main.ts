import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Shop } from './scenes/Shop';
import { AUTO, Game, Scale } from 'phaser';
import { Preloader } from './scenes/Preloader';
import cg from '../utils/config';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: cg.gameWidth,
    height: cg.gameHeight,
    parent: 'game-container',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
        width: cg.gameWidth,
        height: cg.gameHeight,
    },
    dom: {
        createContainer: true,
    },
    physics: {
        default: 'arcade',
        arcade: {
          gravity: {
            y: cg.playerGravity,
            x: 0
          },
          debug: false,
        },
      },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Shop,
        MainGame,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
