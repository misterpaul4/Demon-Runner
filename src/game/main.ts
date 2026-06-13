import { AUTO, Game, Scale } from 'phaser';

import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { AudioBoot } from './scenes/AudioBoot';
import { MainMenu } from './scenes/MainMenu';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { Rank } from './scenes/Rank';
import config from '../utils/config';
import '../../public/style.css';

const phaserConfig: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: config.width,
    height: config.height,
    parent: 'game-container',
    backgroundColor: '#05040a',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
        width: config.width,
        height: config.height,
    },
    render: {
        antialias: true,
        roundPixels: false,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: config.gravity },
            debug: false,
        },
    },
    scene: [Boot, Preloader, AudioBoot, MainMenu, MainGame, GameOver, Rank],
};

const StartGame = (parent: string) => new Game({ ...phaserConfig, parent });

export default StartGame;
