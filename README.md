# Demon Runner

Demon Runner is a gothic-flavoured endless runner. You play a levitating demon
sprinting through a darkening world — dodge the murder of birds, leap the gaps in
the ground, harvest souls for combo points, and survive as long as you can while
the sky bleeds from dusk to a blood-red night.

This is **v3**, a ground-up rebuild of a game I first made years ago. The
original was a Chrome-T-Rex-style hop-over-one-bird runner; this version keeps
that DNA but rebuilds it on a modern stack with a hand-built look, varied
enemies, a difficulty ramp, pickups, and a combo system.

## Built with

- **Phaser 3** — game engine (Arcade physics)
- **TypeScript**
- **React 18** — thin shell hosting the canvas
- **Vite** — dev server and bundler
- **Firebase Realtime Database** — optional online leaderboard

There are **no image files** in this project. Every sprite — the demon, the
birds, the parallax skyline, the moon, the ground, the particles — is drawn
procedurally into textures at load time (see [`src/game/systems/art.ts`](src/game/systems/art.ts)),
so the whole game ships on one cohesive silhouette palette and stays razor sharp
at any resolution.

## Gameplay

- Enter a name, hit **Play**, and the demon starts running on its own.
- **Jump** to clear gaps in the ground and to dodge birds. The demon has a
  **triple jump** with variable height (tap for a hop, hold for a soar), coyote
  time, and a fast-fall.
- Three bird types escalate as you go: a straight-flying **crow** that blocks the
  lane, a high **floater** you run beneath, and a **diver** that swoops out of
  the sky. New types unlock by distance, and speed + spawn rate climb the further
  you get.
- **Souls** (glowing orbs) drift in, often just above the lane so grabbing them
  costs you a jump. Souls and near-misses build a **combo multiplier** that
  decays if you stop taking risks.
- Your score is **distance in metres + combo-boosted bonus**. Beat your best and
  you'll see it land on the leaderboard.

### Controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Jump | `Space` / `↑` / click | tap |
| Fast-fall | `↓` | swipe down |
| Restart (on game over) | `Space` / `Enter` | tap **Run Again** |

The game plays best in **landscape**; on a portrait phone it'll ask you to
rotate.

## Getting started

```bash
git clone https://github.com/misterpaul4/Demon-Runner
cd Demon-Runner
yarn install        # or: npm install
yarn dev            # starts Vite on http://localhost:8080
```

Then open <http://localhost:8080>.

> `yarn dev` pings Phaser's anonymous telemetry first; use `yarn dev-nolog` to
> skip it.

### Leaderboard (optional)

The game runs fully without any configuration — without Firebase credentials it
just keeps your best score locally and the online board stays empty. To enable
the shared leaderboard, copy [`.env.example`](.env.example) to `.env` and fill in
your Firebase web-app config:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
# Optional — inferred from the project id if your Realtime Database is the
# default instance; set it explicitly for a non-US region.
VITE_FIREBASE_DATABASE_URL=...
```

Restart the dev server after adding `.env`. Scores are stored per username under
a `demonRunner` node in the Realtime Database.

### Build

```bash
yarn build          # outputs to dist/
yarn vite preview --config vite/config.prod.mjs   # serve the build
```

## How it's put together

```
src/
  game/
    main.ts              Phaser config (responsive Scale.FIT, Arcade physics)
    scenes/              Boot · Preloader · MainMenu · Game · GameOver · Rank
    entities/            Player (demon) · Bird · Spawner · Pickups
    world/               Background (parallax + sky progression) · Ground
    systems/             art (texture generation) · difficulty · score · audio · fx
    ui/                  Button · NameEntry · Hud
  utils/
    config.ts            all tuning knobs + the gothic-ember theme
    leaderBoardAPI.ts    Firebase reads/writes (safely no-ops without creds)
```

- **Scenes** follow the standard Phaser flow. `Preloader` generates all textures
  and shows the loading bar; everything else is a screen.
- **The demon** decouples physics from visuals: an invisible body drives the
  collisions while a separate container handles tilt, squash-and-stretch, the
  flowing cloak, and the ember trail.
- **The world** scrolls horizontally only; the ground is a recycled ribbon of
  segments with gaps, and the parallax skyline + sky gradient shift with
  distance.
- **Difficulty** is a single curve ([`systems/difficulty.ts`](src/game/systems/difficulty.ts))
  that drives speed, gap frequency, spawn cadence, and the sky's mood together.

## Author

👤 **Chukwuebuka Paul Ajuizeogu**

- GitHub: [@misterpaul4](https://github.com/misterpaul4)
- Twitter: [@paulajuze](https://twitter.com/paulajuze)
- LinkedIn: [Chukwuebuka Paul Ajuizeogu](https://www.linkedin.com/in/chukwuebuka-paul-ajuizeogu/)

## Acknowledgments

- [Phaser](https://phaser.io/)
- [Microverse](https://www.microverse.org/)
- Sound effects from [OpenGameArt](https://opengameart.org/)

## License

This project is [MIT](LICENSE) licensed.
