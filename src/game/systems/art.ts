import Phaser from 'phaser';
import config from '../../utils/config';

// Every sprite in the game is drawn here at load time and baked into a texture,
// so the project ships zero image files and the whole world stays on one
// cohesive silhouette palette. Keys live in TEX so scenes never hard-code
// strings.
export const TEX = {
    glow: 'tex-glow',
    ember: 'tex-ember',
    star: 'tex-star',
    moon: 'tex-moon',
    ridgeFar: 'tex-ridge-far',
    ridgeMid: 'tex-ridge-mid',
    ridgeNear: 'tex-ridge-near',
    ground: 'tex-ground',
    groundEdge: 'tex-ground-edge',
    reaper: 'tex-demon-reaper',
    fiend: 'tex-demon-fiend',
    goat: 'tex-demon-goat',
    beast: 'tex-demon-beast',
    birdBody: 'tex-bird-body',
    birdWing: 'tex-bird-wing',
    soul: 'tex-soul',
    feather: 'tex-feather',
    spark: 'tex-spark',
} as const;

// The playable demon skins, in selector order. The default (Reaper) is first.
export const DEMONS = [
    { id: 'reaper', name: 'The Reaper', tex: TEX.reaper },
    { id: 'fiend', name: 'The Fiend', tex: TEX.fiend },
    { id: 'goat', name: 'The Horned', tex: TEX.goat },
    { id: 'beast', name: 'The Beast', tex: TEX.beast },
] as const;

export type DemonId = (typeof DEMONS)[number]['id'];

export function demonTex(id: string) {
    return (DEMONS.find((d) => d.id === id) ?? DEMONS[0]).tex;
}

const T = config.theme;

type DrawFn = (g: Phaser.GameObjects.Graphics) => void;

function bake(scene: Phaser.Scene, key: string, w: number, h: number, draw: DrawFn) {
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
}

// Stacked translucent discs fake a radial gradient — denser in the middle,
// feathered at the rim. Used for every soft light in the game.
function radial(g: Phaser.GameObjects.Graphics, cx: number, cy: number, radius: number, color: number, strength = 0.07) {
    const steps = 26;
    for (let i = steps; i >= 1; i--) {
        g.fillStyle(color, strength);
        g.fillCircle(cx, cy, (radius * i) / steps);
    }
}

function buildLights(scene: Phaser.Scene) {
    bake(scene, TEX.glow, 128, 128, (g) => radial(g, 64, 64, 64, 0xffffff, 0.06));
    bake(scene, TEX.ember, 32, 32, (g) => radial(g, 16, 16, 16, 0xffffff, 0.12));

    // A large, irregular field so the tiled sky doesn't read as a grid.
    bake(scene, TEX.star, 512, 512, (g) => {
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const bright = Math.random();
            g.fillStyle(0xffffff, 0.2 + bright * 0.6);
            g.fillCircle(x, y, bright < 0.85 ? 0.8 : 1.7);
        }
    });

    bake(scene, TEX.moon, 240, 240, (g) => {
        radial(g, 120, 120, 118, 0xffe7c2, 0.04);
        g.fillStyle(0xf3e7cf, 1);
        g.fillCircle(120, 120, 78);
        // A couple of dim craters break up the flat disc.
        g.fillStyle(0x000000, 0.06);
        g.fillCircle(104, 100, 16);
        g.fillCircle(140, 132, 11);
        g.fillCircle(118, 146, 7);
    });
}

// A jagged skyline strip. Endpoints share a height so it tiles seamlessly as a
// TileSprite. `spikiness` leans the silhouette toward spires vs. rolling hills.
function buildRidge(scene: Phaser.Scene, key: string, color: number, height: number, spikiness: number) {
    const w = 1024;
    bake(scene, key, w, height, (g) => {
        g.fillStyle(color, 1);
        const pts: number[] = [0, height];
        const edge = height * 0.55;
        let x = 0;
        pts.push(0, edge);
        while (x < w) {
            const step = 60 + Math.random() * 110;
            x = Math.min(w, x + step);
            const spike = Math.random() < spikiness;
            const y = spike
                ? edge - (height * 0.4 + Math.random() * height * 0.3)
                : edge - Math.random() * height * 0.22;
            if (spike) {
                // A thin spire: rise to a point and drop straight back.
                pts.push(x - 6, edge, x, y, x + 6, edge);
            } else {
                pts.push(x, y);
            }
        }
        pts.push(w, edge, w, height);
        g.fillPoints(
            pts.reduce<Phaser.Geom.Point[]>((acc, _v, i, arr) => {
                if (i % 2 === 0) acc.push(new Phaser.Geom.Point(arr[i], arr[i + 1]));
                return acc;
            }, []),
            true,
        );
    });
}

function buildGround(scene: Phaser.Scene) {
    const w = 128;
    const h = 220;
    bake(scene, TEX.ground, w, h, (g) => {
        // A touch above pure black so the demon's silhouette has something to
        // contrast against where it runs.
        g.fillStyle(0x16101f, 1);
        g.fillRect(0, 0, w, h);
        // Darken toward the bottom so the ground reads as receding into shadow.
        g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.6, 0.6);
        g.fillRect(0, 0, w, h);
        // Scattered speckles give the rock a little texture without a noise map.
        for (let i = 0; i < 26; i++) {
            g.fillStyle(0x140d22, Math.random() * 0.5);
            g.fillCircle(Math.random() * w, 20 + Math.random() * (h - 30), 1 + Math.random() * 2.5);
        }
    });

    // A thin lit lip that runs along the top edge of every ground segment.
    bake(scene, TEX.groundEdge, w, 12, (g) => {
        g.fillStyle(T.ember, 0.9);
        g.fillRect(0, 4, w, 2);
        g.fillStyle(T.emberHot, 0.5);
        g.fillRect(0, 6, w, 1);
        for (let i = 0; i < w; i += 8) {
            g.fillStyle(T.ember, 0.15 + Math.random() * 0.2);
            g.fillRect(i, 6, 4, 3 + Math.random() * 3);
        }
    });
}

// Shared silhouette fill + cool rim light, the look that keeps every demon
// legible against the dark world. All skins are drawn into a 120x130 box with
// the body mass centred so they share one physics hitbox.
function demonPoly(g: Phaser.GameObjects.Graphics, pts: [number, number][], fill = 0x2b2340) {
    const p = pts.map(([x, y]) => new Phaser.Geom.Point(x, y));
    g.fillStyle(fill, 1);
    g.fillPoints(p, true);
    g.lineStyle(2, 0x6f5d90, 0.55);
    g.strokePoints(p, true);
}

function demonEye(g: Phaser.GameObjects.Graphics, x: number, y: number, core = 0xff7a5a, glow = T.blood) {
    radial(g, x, y, 13, glow, 0.16);
    g.fillStyle(0xffe6c0, 1);
    g.fillCircle(x, y, 3.2);
    g.fillStyle(core, 1);
    g.fillCircle(x, y, 1.8);
}

// Tall hooded figure, big back-swept horns, glowing eyes in the hood, torn hem.
function drawReaper(g: Phaser.GameObjects.Graphics) {
    demonPoly(g, [[46, 44], [34, 22], [22, 6], [18, 5], [27, 17], [39, 35], [45, 43]]);
    demonPoly(g, [[74, 44], [86, 22], [98, 6], [102, 5], [93, 17], [81, 35], [75, 43]]);
    demonPoly(g, [
        [42, 50], [44, 35], [52, 27], [60, 24], [68, 27], [76, 35], [78, 50],
        [84, 84], [90, 120], [82, 122], [74, 110], [66, 123], [58, 110],
        [50, 123], [42, 110], [34, 122], [30, 120], [36, 84],
    ]);
    g.fillStyle(0x140e22, 1);
    g.fillEllipse(60, 52, 32, 28);
    demonEye(g, 54, 52, 0xffc878, T.ember);
    demonEye(g, 66, 52, 0xffc878, T.ember);
}

// Hunched torso with spread bat wings, curved horns, two red eyes and fangs.
function drawFiend(g: Phaser.GameObjects.Graphics) {
    demonPoly(g, [[52, 62], [24, 48], [10, 56], [24, 60], [12, 70], [28, 70], [18, 84], [38, 76], [50, 88]], 0x241d34);
    demonPoly(g, [[68, 62], [96, 48], [110, 56], [96, 60], [108, 70], [92, 70], [102, 84], [82, 76], [70, 88]], 0x241d34);
    demonPoly(g, [[55, 54], [47, 32], [41, 17], [49, 31], [59, 52]]);
    demonPoly(g, [[65, 54], [73, 32], [79, 17], [71, 31], [61, 52]]);
    demonPoly(g, [[52, 54], [60, 47], [68, 54], [74, 84], [70, 114], [60, 122], [50, 114], [46, 84]]);
    demonEye(g, 56, 64);
    demonEye(g, 66, 64);
    g.fillStyle(0xe8dcc0, 1);
    g.fillTriangle(56, 76, 58, 82, 60, 76);
    g.fillTriangle(61, 76, 63, 82, 65, 76);
}

// Broad-shouldered goat-headed demon, big curling ram horns, red slit eyes.
function drawGoat(g: Phaser.GameObjects.Graphics) {
    demonPoly(g, [[56, 44], [40, 33], [23, 37], [15, 50], [28, 45], [41, 49], [34, 63], [49, 54], [57, 52]]);
    demonPoly(g, [[64, 44], [80, 33], [97, 37], [105, 50], [92, 45], [79, 49], [86, 63], [71, 54], [63, 52]]);
    demonPoly(g, [[42, 72], [56, 64], [64, 64], [78, 64], [88, 72], [92, 104], [78, 120], [52, 120], [40, 104]]);
    demonPoly(g, [[54, 42], [52, 62], [58, 80], [66, 88], [74, 80], [80, 62], [78, 42], [70, 32], [62, 32]]);
    demonPoly(g, [[62, 86], [58, 105], [66, 94], [72, 105], [70, 86]]);
    g.fillStyle(T.blood, 0.32);
    g.fillEllipse(62, 58, 12, 6);
    g.fillEllipse(74, 58, 12, 6);
    g.fillStyle(0xff7a5a, 1);
    g.fillEllipse(62, 58, 6, 3);
    g.fillEllipse(74, 58, 6, 3);
}

// Low, hunched, forward-leaning beast with a spined back, forward horns, fangs.
function drawBeast(g: Phaser.GameObjects.Graphics) {
    demonPoly(g, [[40, 72], [32, 53], [47, 67]], 0x241d34);
    demonPoly(g, [[51, 62], [43, 43], [59, 57]], 0x241d34);
    demonPoly(g, [[63, 57], [57, 40], [71, 55]], 0x241d34);
    demonPoly(g, [[38, 76], [54, 62], [70, 60], [82, 68], [88, 98], [78, 122], [58, 124], [42, 114], [36, 92]]);
    demonPoly(g, [[80, 66], [101, 60], [109, 68], [100, 80], [84, 80]]);
    demonPoly(g, [[82, 62], [90, 43], [96, 31], [92, 45], [86, 62]]);
    demonPoly(g, [[72, 60], [78, 41], [82, 31], [80, 45], [74, 60]]);
    g.fillStyle(0xe8dcc0, 1);
    g.fillTriangle(96, 78, 98, 84, 100, 78);
    demonEye(g, 91, 70, 0xffc878, T.ember);
    demonPoly(g, [[58, 122], [56, 130], [65, 124]]);
    demonPoly(g, [[76, 121], [79, 130], [85, 123]]);
}

function buildDemons(scene: Phaser.Scene) {
    bake(scene, TEX.reaper, 120, 130, drawReaper);
    bake(scene, TEX.fiend, 120, 130, drawFiend);
    bake(scene, TEX.goat, 120, 130, drawGoat);
    bake(scene, TEX.beast, 120, 130, drawBeast);
}

function buildBird(scene: Phaser.Scene) {
    // Birds are the threat — lifted off black with a rim and a hot glowing eye so
    // they're never lost against the sky or the ridges behind them.
    const ink = 0x2a2138;
    const rim = 0x5e4d77;
    bake(scene, TEX.birdBody, 64, 40, (g) => {
        const body: [number, number][] = [
            [6, 22], [22, 14], [40, 14], [54, 8], [58, 16], [50, 22],
            [58, 30], [40, 28], [22, 28],
        ];
        const pts = body.map(([x, y]) => new Phaser.Geom.Point(x, y));
        g.fillStyle(ink, 1);
        g.fillPoints(pts, true);
        // Tail fan.
        g.fillTriangle(6, 22, 0, 12, 4, 24);
        g.fillTriangle(6, 22, 0, 32, 4, 22);
        g.lineStyle(1.5, rim, 0.5);
        g.strokePoints(pts, true);
        // Glowing blood eye.
        radial(g, 50, 16, 9, T.blood, 0.2);
        g.fillStyle(0xff6a5a, 1);
        g.fillCircle(50, 16, 3);
    });

    bake(scene, TEX.birdWing, 56, 44, (g) => {
        g.fillStyle(ink, 1);
        // Swept wing, anchored at the shoulder (top-right of the box).
        const wing: [number, number][] = [[52, 6], [30, 2], [6, 16], [22, 22], [4, 38], [34, 26], [48, 18]];
        g.fillPoints(wing.map(([x, y]) => new Phaser.Geom.Point(x, y)), true);
    });
}

function buildFx(scene: Phaser.Scene) {
    bake(scene, TEX.soul, 48, 48, (g) => {
        radial(g, 24, 24, 23, T.soul, 0.08);
        g.fillStyle(0xeaffff, 0.95);
        g.fillCircle(24, 24, 6);
        g.fillStyle(T.soul, 0.5);
        g.fillCircle(24, 24, 11);
    });

    bake(scene, TEX.feather, 20, 28, (g) => {
        g.fillStyle(0x09060f, 1);
        const f: [number, number][] = [[10, 0], [16, 12], [12, 26], [10, 28], [8, 26], [4, 12]];
        g.fillPoints(f.map(([x, y]) => new Phaser.Geom.Point(x, y)), true);
    });

    bake(scene, TEX.spark, 12, 12, (g) => {
        g.fillStyle(0xffffff, 1);
        g.fillTriangle(6, 0, 8, 6, 6, 12);
        g.fillTriangle(6, 0, 4, 6, 6, 12);
    });
}

export function buildTextures(scene: Phaser.Scene) {
    buildLights(scene);
    buildRidge(scene, TEX.ridgeFar, T.ridgeFar, 220, 0.25);
    buildRidge(scene, TEX.ridgeMid, T.ridgeMid, 300, 0.5);
    buildRidge(scene, TEX.ridgeNear, T.ridgeNear, 380, 0.7);
    buildGround(scene);
    buildDemons(scene);
    buildBird(scene);
    buildFx(scene);
}
