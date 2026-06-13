import Phaser from 'phaser';
import config from '../../utils/config';

export const Difficulty = {
    pressure(metres: number) {
        return Phaser.Math.Clamp(metres / config.rampDistance, 0, 1);
    },

    runSpeed(metres: number) {
        const t = this.pressure(metres);
        return Phaser.Math.Linear(config.runSpeedStart, config.runSpeedMax, Phaser.Math.Easing.Sine.Out(t));
    },

    gapChance(metres: number) {
        const t = this.pressure(metres);
        return Phaser.Math.Linear(config.gapChanceStart, config.gapChanceMax, t);
    },

    spawnInterval(metres: number) {
        const t = this.pressure(metres);
        return Phaser.Math.Linear(config.spawn.intervalStart, config.spawn.intervalMin, t);
    },

    skyProgress(metres: number) {
        return Phaser.Math.Clamp(metres / (config.rampDistance * 1.3), 0, 1);
    },
};
