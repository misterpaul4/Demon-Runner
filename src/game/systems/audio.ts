import Phaser from 'phaser';
import config from '../../utils/config';

export function applyMute(scene: Phaser.Scene) {
    scene.sound.mute = !config.sound;
}

export function toggleSound(scene: Phaser.Scene) {
    config.sound = !config.sound;
    localStorage.setItem(config.storageKeys.sound, config.sound ? 'on' : 'off');
    applyMute(scene);
    return config.sound;
}

export function sfx(scene: Phaser.Scene, key: string, volume = 1) {
    if (config.sound && scene.cache.audio.exists(key)) scene.sound.play(key, { volume });
}
