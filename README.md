# OpenSwap master video

A 3-minute master video for OpenSwap and Portal, written entirely in code with
[Remotion](https://www.remotion.dev/). It uses Portal's own design: the `#0b0e13` dark
field, azure for the wallet and violet for the router, Space Mono, IBM Plex Mono and
JetBrains Mono, with cypherpunk neon line work over it.

## Quick start

You need [Node.js](https://nodejs.org/) 18 or newer, and `ffmpeg` on your PATH
(`brew install ffmpeg` on macOS). The voice-over uses the built-in macOS `say`
command, so the narrated version builds on a Mac.

### 1. Install

```sh
npm install
```

### 2. Watch it in the browser

```sh
npm run studio
```

This generates the music and voice clips, then starts Remotion Studio. Open
<http://localhost:3000>, pick a composition from the left sidebar, and press play:

- **OpenSwapMaster**: the video with music, no voice-over
- **OpenSwapNarrated**: the video with voice-over; music plays only between lines
- **Cut-…**: any single scene on its own

Edits to the code reload instantly. If port 3000 is taken, Studio picks the next free one
and prints the address.

### 3. Render to a file

Without voice-over (music only):

```sh
npm run render       # out/openswap-master-1080p.mp4
npm run render:4k    # out/openswap-master-4k.mp4 (3840×2160)
```

With voice-over:

```sh
npm run render:narrated      # out/openswap-narrated-1080p.mp4
npm run render:narrated:4k   # out/openswap-narrated-4k.mp4 (3840×2160)
```

A 1080p render takes a few minutes; 4K takes around half an hour on an M-series Mac.

## Cutting shorter videos

Every scene is also its own composition, `Cut-<scene>`, with its slice of the music,
so the master can be cut into short videos for different audiences:

```sh
npm run cut -- Cut-taproot out/taproot.mp4
npm run cut -- Cut-router out/router-earn-fees.mp4 --scale=2
```

## Story (120 BPM, 90 bars)

| Bars  | Scene | What it says |
|-------|-------|--------------|
| 0–4   | `intro` | The logo draws itself in neon; OpenSwap |
| 4–12  | `route` | How a swap works: coins go round a circle of routers and come back fresh; every message over Tor |
| 12–19 | `legacy` | The OG atomic swap: the real P2WSH contract script, claim vs refund branches, a huge crowd of 2-of-2 outputs to hide in |
| 19–21 | `better` | "BUT… we can do better." |
| 21–29 | `taproot` | The Taproot tree (key path plus hashlock and timelock leaves), then the selling point: 112 vB vs 150 vB to claim, so lower fees |
| 29–36 | `payswap` | Swap and pay in one go: the route ends at a receiver; exact amount, one step |
| 36–47 | `market` | No middleman (Nostr), fidelity bonds, bans for proven cheats, maker fees and the market table |
| 47–49 | `portal` | Meet Portal |
| 49–54 | `deploy` | Desktop (macOS, Linux) or server (VPS, Raspberry Pi, Umbrel), reached from any browser |
| 54–59 | `backend` | Electrum or Bitcoin Core; Electrum over Tor for more security |
| 59–67 | `wallet` | A camera tour over real Portal screens: connect (Electrum over Tor), the wallet, swap setup, the swap ring, the report |
| 67–76 | `router` | The real router screens, built around earning: add a router, fund the bond, net earnings, a +508-sat swap, a fleet, then live on the market |
| 76–79 | `cta` | Try Portal: openswap.live/portal |
| 79–83 | `thanks` | Contributors |
| 83–86 | `lightning` | Lightning swaps, coming soon |
| 86–90 | `outro` | The closing quote |

All timing lives in `src/timeline.json`. The video and the music both read it, so if
you change a section's length, the cuts and the beat stay in sync.

## Music

`npm run music` synthesizes `public/audio/score.wav` from the timeline: a dark A-minor
progression (Am–F–Dm–E), sub bass, a filtered sixteenth-note arpeggio, half-time drums
under the story scenes and four-on-the-floor in the driving ones. `render`, `studio`
and `cut` regenerate it automatically.

## Real app screens

The wallet and router tours fly a camera over real Portal screenshots in
`public/real/` (from the Portal repo and its docs). The router dashboard and market
captures were cropped out of their macOS and Safari windows, and a local file path on
the dashboard is blurred. Each tour is a list of camera stops in `src/scenes/Tours.tsx`:
a screen, a region of it, and a caption.

## Narration

The script lives in `src/narration.json`, one plain-spoken line per scene.
`npm run narration` voices each line with the macOS voice named there (Samantha),
at a natural pace with short pauses, and records where each clip starts. In the
narrated video no music plays under the voice: a calm ambient track
(`npm run music` builds it as `score-ambient.wav`) fades in only between lines.

To use a real voice-over instead, record each line and save it over the file of the
same name in `public/narration/` (for example `router.wav`), then render without
`npm run narration` so your files are kept:

```sh
npm run music && npx remotion render src/index.ts OpenSwapNarrated out/openswap-narrated-1080p.mp4
```

## History

The earlier cream day-theme cut is the first commit in this repo.
