import config from '../../utils/config';

export class Score {
    private bonus = 0;
    private multiplier = 1;
    private lastEventAt = -9999;
    private metres = 0;

    setDistance(pixels: number) {
        this.metres = Math.max(0, pixels * config.metresPerPixel);
    }

    private bumpMultiplier(time: number) {
        this.multiplier = Math.min(config.combo.max, this.multiplier + 1);
        this.lastEventAt = time;
    }

    registerGraze(time: number) {
        this.bonus += 5 * this.multiplier;
        this.bumpMultiplier(time);
    }

    registerPickup(time: number) {
        this.bonus += config.pickup.value * this.multiplier;
        this.bumpMultiplier(time);
    }

    update(time: number) {
        if (this.multiplier > 1 && time - this.lastEventAt > config.combo.windowMs) {
            this.multiplier = 1;
        }
    }

    get value() {
        return Math.floor(this.metres) + this.bonus;
    }

    get distanceMetres() {
        return Math.floor(this.metres);
    }

    get comboMultiplier() {
        return this.multiplier;
    }

    comboRemaining(time: number) {
        if (this.multiplier <= 1) return 0;
        return Math.max(0, 1 - (time - this.lastEventAt) / config.combo.windowMs);
    }
}
