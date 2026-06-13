import Phaser from 'phaser';
import config from '../../utils/config';

// One place that answers "how hard is it right now?" given distance travelled.
// Run speed, gap frequency and spawn cadence all tighten on the same curve so
// the ramp feels coherent rather than three unrelated dials.
export const Difficulty = {
    // 0 at the start, 1 once the player has earned the hardest steady state.
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

    // The sky keeps shifting a little past the speed cap so long runs still feel
    // like they're sinking deeper into the night.
    skyProgress(metres: number) {
        return Phaser.Math.Clamp(metres / (config.rampDistance * 1.3), 0, 1);
    },
};
