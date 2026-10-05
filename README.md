# OpenSwap v0.2.3 motion video

A 70-second launch video for OpenSwap, written entirely in code with
[Remotion](https://www.remotion.dev/). It uses the openswap.live day theme: cream
drafting paper, black ink, Fredoka, Nunito Sans and IBM Plex Mono.

```sh
npm install
npm run studio   # live preview with a scrubbable timeline
npm run render   # out/openswap-v0.2.3.mp4 (1920×1080, 30 fps)
npm run render:4k # out/openswap-v0.2.3-4k.mp4 (3840×2160)
```

## Story (120 BPM, one cut per bar)

| Bars  | Scene |
|-------|-------|
| 0–4   | Logo spins in: OpenSwap |
| 4–9   | What is OpenSwap: a coin hops through two routers over Tor and gets a new txid at each hop |
| 9–15  | Taproot, Legacy, PaySwap |
| 15–23 | Meet Portal: a short walkthrough of the wallet, then the router (7 screenshots) |
| 23–25 | Try Portal: download from openswap.live/portal |
| 25–29 | One more thing: the lever is pulled, the reels lock four letters per beat into LIGHTNING SWAPS, and a red COMING SOON stamp lands |
| 29–35 | Thank you to the contributors, then a closing quote |

All timing lives in `src/timeline.json`. The video and the music both read it,
so if you change a section length, the cuts and the beat stay in sync.

## Music

`npm run music` synthesizes `public/audio/score.wav` from the timeline: a beat
over Am–F–C–G, plus every slot-machine effect (lever ratchet, reel clatter, a
thunk as each letter locks, the thunder-and-shimmer reveal, the stamp thud). `render` and `studio` regenerate
it automatically.

### Your own track for the finale

The finale can play a track you supply, such as the peak of Скриптонит –
"Не расслабляйся". Use a copy you have the rights to:

1. Save it as `public/audio/lightning.mp3`.
2. In `src/timeline.json`, set `lightningTrack.enabled` to `true` and set
   `peakAtSec` to the second in the song where the peak starts.
3. Run `npm run render`.

The peak lands on the moment the reels start spinning. The synthesized finale
music is then left out, but the slot-machine effects stay on top of your track.
