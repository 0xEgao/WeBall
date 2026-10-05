import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame, Easing } from 'remotion';
import { BEAT, C, DISPLAY, MONO, T } from '../theme';
import { clamp, H, Logo, P, Paper, Rise, Scene, useBeat } from '../components';

const STAMP_RED = '#d7263d';

/** A quiet beat before the reveal. */
export const OneMore: React.FC<{ duration: number }> = ({ duration }) => (
  <Scene duration={duration} out={6}>
    <Paper>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Rise text="One more thing…" delay={2} stagger={4} style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 130, color: C.ink, justifyContent: 'center' }} />
      </AbsoluteFill>
    </Paper>
  </Scene>
);

// ---- The reveal machine ------------------------------------------------------
const CELL_W = 118;
const CELL_H = 150;
const GAP = 14;
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ₿⚡0123456789';
const RC = T.reel;
const LETTERS = RC.words.join('').split('');
const LAST_LOCK = RC.firstLock + (LETTERS.length - 1) * RC.lockEvery;
const WON = LAST_LOCK + 6;

const reelPos = (i: number, f: number) => {
  const lockF = RC.firstLock + i * RC.lockEvery;
  const span = lockF - RC.spinStart;
  const travel = Math.round((1.4 * span) / 3);
  if (f <= RC.spinStart) return { p: 0, travel, lockF };
  const x = Math.min(1, (f - RC.spinStart) / span);
  return { p: travel * Easing.out(Easing.back(0.9))(x), travel, lockF };
};

const Reel: React.FC<{ i: number; target: string }> = ({ i, target }) => {
  const frame = useCurrentFrame();
  const { p, travel, lockF } = reelPos(i, frame);
  const speed = Math.abs(p - reelPos(i, frame - 1).p);
  const glyph = (k: number) => (k === travel ? target : CHARSET[Math.floor(random(`r${i}-${k}`) * CHARSET.length)]);
  const base = Math.floor(p);
  const locked = frame >= lockF;
  const pop = interpolate(frame, [lockF, lockF + 8], [1, 0], clamp);
  // After the last letter, a wave of orange runs across the tiles.
  const wave = interpolate(frame, [WON + i * 1.5, WON + i * 1.5 + 6], [0, 1], clamp);
  const bg = !locked ? '#fffdf8' : wave > 0.5 ? C.orange : C.ink;
  const fg = !locked ? C.ink : wave > 0.5 ? C.ink : C.paper;
  return (
    <div
      style={{
        width: CELL_W,
        height: CELL_H,
        borderRadius: 18,
        overflow: 'hidden',
        position: 'relative',
        background: bg,
        border: `4px solid ${C.ink}`,
        boxShadow: locked ? `5px 5px 0 ${C.ink}` : 'inset 0 16px 20px rgba(0,0,0,0.12), inset 0 -16px 20px rgba(0,0,0,0.12)',
        transform: `translateY(${-pop * 10}px) scale(${1 + pop * 0.1})`,
      }}
    >
      {[-1, 0, 1, 2].map((d) => {
        const k = base + d;
        return (
          <div
            key={d}
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translateY(${(p - k) * CELL_H}px)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 104,
              color: fg,
              filter: locked ? 'none' : `blur(${Math.min(4, speed * 2)}px)`,
            }}
          >
            {glyph(k)}
          </div>
        );
      })}
    </div>
  );
};

const Lights: React.FC<{ w: number; h: number; spinning: boolean; won: boolean }> = ({ w, h, spinning, won }) => {
  const frame = useCurrentFrame();
  const n = 34;
  const per = 2 * (w + h);
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        let d = (k / n) * per;
        let x = 0;
        let y = 0;
        if (d < w) { x = d; } else if ((d -= w) < h) { x = w; y = d; } else if ((d -= h) < w) { x = w - d; y = h; } else { d -= w; y = h - d; }
        const chase = spinning ? Math.floor(frame / 2) : Math.floor(frame / BEAT);
        const on = won ? Math.floor(frame / 4) % 2 === k % 2 : (k + chase) % 3 === 0;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: x - 10,
              top: y - 10,
              width: 20,
              height: 20,
              borderRadius: 10,
              background: on ? (won ? C.orange : C.ink) : 'transparent',
              border: `3px solid ${C.ink}`,
            }}
          />
        );
      })}
    </>
  );
};

const Lever: React.FC = () => {
  const frame = useCurrentFrame();
  const pull = interpolate(frame, [RC.leverFrame, RC.leverFrame + 6], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const back = interpolate(frame, [RC.leverFrame + 8, RC.leverFrame + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.elastic(1.2)) });
  const angle = -18 + 120 * pull * (1 - back);
  return (
    <div style={{ position: 'absolute', right: -118, top: 140, width: 120, height: 420 }}>
      <div style={{ position: 'absolute', left: 0, top: 170, width: 64, height: 110, background: C.card, border: `5px solid ${C.ink}`, borderRadius: '0 20px 20px 0' }} />
      <div style={{ position: 'absolute', left: 46, top: 225, width: 0, height: 0, transform: `rotate(${angle}deg)`, transformOrigin: '0 0' }}>
        <div style={{ position: 'absolute', left: -9, top: -250, width: 18, height: 250, background: C.ink, borderRadius: 9 }} />
        <div style={{ position: 'absolute', left: -38, top: -300, width: 76, height: 76, borderRadius: 38, background: C.orange, border: `5px solid ${C.ink}`, boxShadow: `5px 5px 0 ${C.ink}` }} />
      </div>
    </div>
  );
};

const Confetti: React.FC<{ at: number; count?: number }> = ({ at, count = 60 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, k) => {
        const a = random(`a${k}`) * Math.PI * 2;
        const v = 8 + random(`v${k}`) * 20;
        const x = 960 + Math.cos(a) * v * t;
        const y = 500 + Math.sin(a) * v * t + 0.7 * t * t;
        const o = interpolate(t, [0, 36], [1, 0], clamp);
        const s = 8 + random(`s${k}`) * 12;
        return (
          <div
            key={k}
            style={{ position: 'absolute', left: x, top: y, width: s, height: s * 0.6, background: k % 3 ? C.ink : C.orange, opacity: o, transform: `rotate(${t * 14 + k * 30}deg)` }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** A red rubber stamp: ring lettering, a bolt, distressed ink. */
const Stamp: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 400 400">
    <defs>
      <filter id="rough">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="warp" />
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" />
      </filter>
      <filter id="speckle">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" />
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -6 4.6" />
      </filter>
      <mask id="wear">
        <rect width="400" height="400" filter="url(#speckle)" />
      </mask>
      <path id="ring" d="M200 200 m-136 0 a136 136 0 1 1 272 0 a136 136 0 1 1 -272 0" />
    </defs>
    <g filter="url(#rough)" mask="url(#wear)">
      <g fill="none" stroke={STAMP_RED}>
        <circle cx={200} cy={200} r={186} strokeWidth={14} />
        <circle cx={200} cy={200} r={164} strokeWidth={5} />
      </g>
      <text fill={STAMP_RED} fontFamily={DISPLAY} fontWeight={700} fontSize={38} letterSpacing={5}>
        <textPath href="#ring" startOffset="0">★ LIGHTNING SWAPS ★ OPENSWAP ★ LIGHTNING SWAPS</textPath>
      </text>
      <rect x={70} y={150} width={260} height={100} rx={10} fill={STAMP_RED} />
      <text x={200} y={196} textAnchor="middle" fill="#f7f2e8" fontFamily={DISPLAY} fontWeight={700} fontSize={46} letterSpacing={4}>COMING</text>
      <text x={200} y={238} textAnchor="middle" fill="#f7f2e8" fontFamily={DISPLAY} fontWeight={700} fontSize={46} letterSpacing={10}>SOON</text>
    </g>
  </svg>
);

/** Lever pull → letters lock four per beat → the stamp lands on the downbeat. */
export const Finale: React.FC<{ reelDuration: number; duration: number }> = ({ reelDuration, duration }) => {
  const frame = useCurrentFrame();
  const beat = useBeat();
  const spinning = frame >= RC.spinStart && frame < LAST_LOCK;
  const won = frame >= WON;
  const afterDrop = frame - reelDuration;
  const lockIdx = Math.floor((frame - RC.firstLock) / RC.lockEvery);
  const sinceLock = frame >= RC.firstLock && lockIdx < LETTERS.length ? (frame - RC.firstLock) % RC.lockEvery : 99;
  const shakeAmp = (sinceLock < 3 ? 4 : 0) + (afterDrop >= 0 && afterDrop < 12 ? 22 * (1 - afterDrop / 12) : 0);
  const sx = (random(`x${frame}`) - 0.5) * shakeAmp;
  const sy = (random(`y${frame}`) - 0.5) * shakeAmp;
  const enter = interpolate(frame, [0, 12], [0.9, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const stamp = interpolate(afterDrop, [0, 7], [2.6, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const stampO = interpolate(afterDrop, [0, 3], [0, 1], clamp);
  const row1 = RC.words[0].length;
  const cabW = 1420;
  const cabH = 620;
  return (
    <Scene duration={duration}>
      <Paper>
        <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 40, transform: `scale(${enter})` }}>
            <div style={{ position: 'relative', width: cabW, height: cabH }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 48, background: C.card, border: `6px solid ${C.ink}`, boxShadow: `16px 16px 0 ${C.ink}` }} />
              <div style={{ position: 'absolute', left: 40, top: 40, right: 40, bottom: 40 }}>
                <Lights w={cabW - 80} h={cabH - 80} spinning={spinning} won={won} />
              </div>
              <div style={{ position: 'absolute', left: '50%', top: -46, transform: 'translateX(-50%)', background: C.ink, borderRadius: 999, padding: '14px 44px', display: 'flex', alignItems: 'center', gap: 18 }}>
                <Logo size={50} invert rotate={frame * (spinning ? 14 : 2)} />
                <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, color: C.paper, letterSpacing: '0.04em' }}>OpenSwap</span>
              </div>
              <div style={{ position: 'absolute', left: 90, right: 90, top: 100, bottom: 100, background: C.paperDeep, borderRadius: 28, border: `5px solid ${C.ink}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
                {RC.words.map((w, r) => (
                  <div key={w} style={{ display: 'flex', gap: GAP }}>
                    {w.split('').map((ch, j) => (
                      <Reel key={j} i={r === 0 ? j : row1 + j} target={ch} />
                    ))}
                  </div>
                ))}
              </div>
              <Lever />
            </div>
          </AbsoluteFill>
          <Confetti at={WON} />
          {afterDrop >= 0 && (
            <div
              style={{
                position: 'absolute',
                right: 100,
                bottom: -10,
                opacity: stampO,
                transform: `scale(${stamp * (1 + beat * 0.02)}) rotate(${-14 + (stamp - 1) * 10}deg)`,
                mixBlendMode: 'multiply',
              }}
            >
              <Stamp size={560} />
            </div>
          )}
        </AbsoluteFill>
      </Paper>
    </Scene>
  );
};

// Core team first in the requested order, then by contribution score.
const CREW = ['mojoX911', 'stark-3k', 'keraliss', '0xEgao', 'ManthanNimodiya', 'Godzilla-oss', 'uqlidi', 'Atishyy27', 'NeoZ666', 'Supremesv715', 'YoganshSharma', 'hulxv', 'tanishkaa08'];

export const EndCard: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const quote = 165;
  const swap = interpolate(frame, [quote - 8, quote + 8], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const fade = interpolate(frame, [duration - 24, duration], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Paper>
        <AbsoluteFill style={{ opacity: fade }}>
        {/* Thank you. */}
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `translateY(${-swap * 1080}px)` }}>
          <Rise text="Thank you" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 130, color: C.ink, justifyContent: 'center' }} />
          <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.24em', color: C.ink45, margin: '20px 0 34px' }}>BUILT IN THE OPEN BY</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px 46px', padding: '0 220px' }}>
            {CREW.map((n, i) => {
              const at = 14 + i * 3;
              const pop = interpolate(frame, [at, at + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
              return (
                <div key={n} style={{ transform: `translateY(${(1 - pop) * 30}px)`, opacity: pop }}>
                  <H size={48} style={{ color: i % 2 ? C.ink70 : C.ink }}>{n}</H>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 50, opacity: interpolate(frame, [70, 82], [0, 1], clamp) }}>
            <P size={38} style={{ textAlign: 'center' }}>…and thank you to everyone else who contributed.</P>
          </div>
        </AbsoluteFill>

        {/* The quote. */}
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 240px', transform: `translateY(${(1 - swap) * 1080}px)` }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 200, lineHeight: 0.6, color: C.ink12 }}>“</div>
          <Rise
            text="Privacy is necessary for an open society in the electronic age."
            delay={quote + 6}
            stagger={2}
            style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 74, lineHeight: 1.15, color: C.ink, justifyContent: 'center', textAlign: 'center' }}
          />
          <div style={{ fontFamily: MONO, fontSize: 28, color: C.ink45, letterSpacing: '0.12em', marginTop: 30, opacity: interpolate(frame, [quote + 30, quote + 40], [0, 1], clamp) }}>
            — ERIC HUGHES, A CYPHERPUNK'S MANIFESTO, 1993
          </div>
          <div style={{ marginTop: 80, display: 'flex', alignItems: 'center', gap: 22, opacity: interpolate(frame, [quote + 56, quote + 66], [0, 1], clamp), transform: `scale(${interpolate(frame, [quote + 56, quote + 68], [0.8, 1], { ...clamp, easing: Easing.out(Easing.back(2)) })})` }}>
            <Logo size={70} rotate={frame * 2} />
            <H size={64}>Much more to come.</H>
          </div>
          <div style={{ marginTop: 20, fontFamily: MONO, fontSize: 30, color: C.ink70, opacity: interpolate(frame, [quote + 70, quote + 80], [0, 1], clamp) }}>openswap.live</div>
        </AbsoluteFill>
        </AbsoluteFill>
      </Paper>
    </AbsoluteFill>
  );
};
