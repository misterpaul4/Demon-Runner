const STARS_STORAGE_KEY = 'stars';
const TRIPLE_JUMP_STORAGE_KEY = 'upgrade_triple_jump';
const BASE_JUMPS = 2;

export const getStoredStars = () => Number(localStorage.getItem(STARS_STORAGE_KEY) || '0');

export const setStoredStars = (stars: number) => {
    localStorage.setItem(STARS_STORAGE_KEY, String(Math.max(0, stars)));
};

export const hasTripleJumpUpgrade = () => localStorage.getItem(TRIPLE_JUMP_STORAGE_KEY) === 'true';

export const unlockTripleJumpUpgrade = () => {
    localStorage.setItem(TRIPLE_JUMP_STORAGE_KEY, 'true');
};

export const getPlayerJumpCount = () => (hasTripleJumpUpgrade() ? 3 : BASE_JUMPS);

export default {
    groundSpaceRange: [100, 200],
    groundSizeRange: [50, 801],
    playerGravity: 900,
    jumpForce: 450,
    jumps: BASE_JUMPS,
    gameWidth: 1280,
    gameHeight: 720,
    gameSpeed: 450,
    bestScore: Number(localStorage.getItem('bestScore') || '0'),
    sound: Boolean(localStorage.getItem('sound') === 'true') ?? true
};
