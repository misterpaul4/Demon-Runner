// Central tuning + theme for Demon Runner v3.
// Numbers here are the knobs worth touching during balancing; everything in the
// scenes reads from this so the game can be re-tuned without hunting through code.

const STORAGE_KEYS = {
    username: 'dr_username',
    sound: 'dr_sound',
    character: 'dr_character',
};

// Gothic-ember palette. Colours are 0xRRGGBB for Phaser objects; the `css`
// block holds the same family as strings for Text styles and DOM.
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

// Sky keyframes the run bleeds through as distance climbs: dusk -> night -> blood.
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

    // Design resolution. The Scale Manager fits this to any viewport, so the
    // gameplay reasons in these fixed coordinates regardless of screen size.
    width: 1280,
    height: 720,

    // The ground's top surface sits here; everything vertical is measured from it.
    groundTop: 600,

    // Run pacing. Speed eases from start toward max over `rampDistance` metres.
    runSpeedStart: 360,
    runSpeedMax: 760,
    rampDistance: 2600,

    gravity: 2200,
    jumpForce: 880,
    maxJumps: 3,
    // The second and third jumps give a little less lift than the first.
    multiJumpFalloff: 0.86,
    coyoteMs: 110,
    jumpBufferMs: 130,
    fastFallForce: 1500,

    // Ground is emitted as segments with occasional gaps to leap.
    segmentRange: [320, 720],
    gapRange: [140, 240],
    gapChanceStart: 0.18,
    gapChanceMax: 0.4,

    // Distance bookkeeping: pixels travelled -> metres shown to the player.
    metresPerPixel: 0.025,

    spawn: {
        intervalStart: 1500,
        intervalMin: 620,
        // Near-miss window (px) that awards a combo tick without a collision.
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

    // Runtime state, seeded from storage. Mutated as the player progresses.
    username: fromStorage.username,
    bestScore: 0,
    sound: fromStorage.sound,
    character: fromStorage.character,
};

export type GameConfig = typeof config;
export default config;
