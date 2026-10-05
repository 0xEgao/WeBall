# OpenSwap master video

A 2 min 56 s master video for OpenSwap and Portal, written entirely in code with
[Remotion](https://www.remotion.dev/). It uses Portal's own design: the `#0b0e13` dark
field, azure for the wallet and violet for the router, Space Mono, IBM Plex Mono and
JetBrains Mono, with cypherpunk neon line work over it.

```sh
npm install
npm run studio     # live preview with a scrubbable timeline
npm run render     # out/openswap-master-1080p.mp4
npm run render:4k  # out/openswap-master-4k.mp4 (3840×2160)
```

## Cutting shorter videos

Every scene is also its own composition, `Cut-<scene>`, with its slice of the music,
so the master can be cut into short videos for different audiences:

```sh
npm run cut -- Cut-taproot out/taproot.mp4
npm run cut -- Cut-router out/router-earn-fees.mp4 --scale=2
```

## Story (120 BPM, 88 bars)

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
| 59–66 | `wallet` | The wallet UI starting a swap and running the route |
| 66–74 | `router` | The router UI: earning fees on every routed swap |
| 74–77 | `cta` | Try Portal: openswap.live/portal |
| 77–81 | `thanks` | Contributors |
| 81–84 | `lightning` | Lightning swaps, coming soon |
| 84–88 | `outro` | The closing quote |

All timing lives in `src/timeline.json`. The video and the music both read it, so if
you change a section's length, the cuts and the beat stay in sync.

## Music

`npm run music` synthesizes `public/audio/score.wav` from the timeline: a dark A-minor
progression (Am–F–Dm–E), sub bass, a filtered sixteenth-note arpeggio, half-time drums
under the story scenes and four-on-the-floor in the driving ones. `render`, `studio`
and `cut` regenerate it automatically.

## History

The earlier cream day-theme cut is the first commit in this repo.
