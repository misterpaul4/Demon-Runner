const STORAGE_KEYS = {
    username: 'dr_username',
    sound: 'dr_sound',
    character: 'dr_character',
};

const theme = {
    ink: 0x05040a,
    inkSoft: 0x0d0a16,
    ridgeFar: 0x130d20,
    ridgeMid: 0x0c0814,
    ridgeNear: 0x05030a,

    ember: 0xff6a1a,
    emberHot: 0xff9d3c,
    emberDeep: 0xc7361b,
    blood: 0xe23a2e,
    soul: 0x7fd4ff,

    moon: 0xf3e7cf,
    bloodMoon: 0xd8553a,

    parchment: 0xf3e9da,
    ash: 0x8a8190,

    css: {
        parchment: '#f3e9da',
        ember: '#ff8a3c',
        ash: '#8a8190',
        blood: '#ff5145',
        soul: '#9fe0ff',
        ink: '#05040a',
    },
};

const skyPhases = [
    { at: 0.0, top: 0x140a22, bottom: 0x4a1d33 },
    { at: 0.45, top: 0x070611, bottom: 0x1a1030 },
    { at: 1.0, top: 0x1a0509, bottom: 0x661414 },
];

const fromStorage = {
    username: localStorage.getItem(STORAGE_KEYS.username) ?? '',
    sound: localStorage.getItem(STORAGE_KEYS.sound) !== 'off',
    character: localStorage.getItem(STORAGE_KEYS.character) ?? 'reaper',
};

const config = {
    storageKeys: STORAGE_KEYS,
    theme,
    skyPhases,

    width: 1280,
    height: 720,

    groundTop: 600,

    runSpeedStart: 360,
    runSpeedMax: 760,
    rampDistance: 2600,

    gravity: 2200,
    jumpForce: 880,
    maxJumps: 3,
    multiJumpFalloff: 0.86,
    coyoteMs: 110,
    jumpBufferMs: 130,
    fastFallForce: 1500,

    segmentRange: [320, 720],
    gapRange: [140, 240],
    gapChanceStart: 0.18,
    gapChanceMax: 0.4,

    metresPerPixel: 0.025,

    spawn: {
        intervalStart: 1500,
        intervalMin: 620,
        grazeRadius: 64,
    },

    pickup: {
        chance: 0.55,
        value: 25,
    },

    combo: {
        windowMs: 2600,
        max: 8,
    },

    ranks: 10,

    username: fromStorage.username,
    bestScore: 0,
    sound: fromStorage.sound,
    character: fromStorage.character,
};

export type GameConfig = typeof config;
export default config;
