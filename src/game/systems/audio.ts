import Phaser from 'phaser';
import config from '../../utils/config';

// The original had an inverted mute flag (`!settings.sound && play`). Routing all
// playback through here keeps the meaning straight: config.sound === true means
// the player wants sound.
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
    // Audio loads in parallel (AudioBoot), so a key may not be ready in the first
    // moments of a session — just skip it silently rather than warning.
    if (config.sound && scene.cache.audio.exists(key)) scene.sound.play(key, { volume });
}
