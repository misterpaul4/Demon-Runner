export default {
    groundSpaceRange: [100, 200],
    groundSizeRange: [50, 801],
    playerGravity: 900,
    jumpForce: 450,
    jumps: 3,
    gameWidth: 800,
    gameHeight: 450,
    gameSpeed: 450,
    bestScore: Number(localStorage.getItem('bestScore') || '0'),
    sound: Boolean(localStorage.getItem('sound') === 'true') ?? true
};
