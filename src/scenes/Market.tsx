import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { C, HEAD, MONO, NUM } from '../theme';
import { Backdrop, Body, clamp, easeInOut, easeOut, FadeUp, Kicker, Neon, Panel, Pill, Scene, Title } from '../components';

type D = { duration: number };

const CHAPTER = 165;

const CHAPTERS = [
  { title: 'No middleman.\nNothing to shut down.', lines: ['Routers announce themselves on Nostr.', 'Your wallet finds them directly.', 'No central server: the market can even be rebuilt from the Bitcoin blockchain.'] },
  { title: 'Fidelity bonds\nkeep it honest.', lines: ['Every router locks up bitcoin for months.', 'Faking a thousand routers would cost a fortune.', 'Bigger bond, more trust.'] },
  { title: 'Cheaters get\nbanned.', lines: ['If a router provably cheats, your wallet bans it for good.', 'A router that is just offline is never punished.'] },
  { title: 'Routers set\ntheir own fees.', lines: ['A flat fee, plus a small cut by amount and time.', 'Your wallet picks the cheapest routers first.'] },
];

// Mesh of routers and relays, spread over the right side.
const MESH = Array.from({ length: 20 })
  .map((_, i) => ({
    x: 1080 + (i % 5) * 175 + (random(`mx${i}`) - 0.5) * 90,
    y: 200 + Math.floor(i / 5) * 210 + (random(`my${i}`) - 0.5) * 90,
    relay: i % 5 === 2 || i === 11,
  }))
  .filter((n) => Math.hypot(n.x - 1430, n.y - 530) > 150);
const EDGES = MESH.flatMap((a, i) =>
  MESH.map((b, j) => ({ i, j, d: Math.hypot(a.x - b.x, a.y - b.y) })).filter((e) => e.j > i && e.d < 260),
);

const Mesh: React.FC<{ local: number }> = ({ local }) => {
  const xOut = interpolate(local, [70, 90], [0, 1], { ...clamp, easing: easeOut });
  return (
    <>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {EDGES.map((e, k) => {
          const a = MESH[e.i];
          const b = MESH[e.j];
          const p = interpolate(local, [10 + k * 1.2, 30 + k * 1.2], [0, 1], { ...clamp, easing: easeInOut });
          const pulse = (local * 0.02 + k * 0.13) % 1;
          return (
            <g key={k}>
              <Neon d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} color={a.relay || b.relay ? C.violet : C.azure} progress={p} width={1.5} opacity={0.6} />
              {p >= 1 && <circle cx={a.x + (b.x - a.x) * pulse} cy={a.y + (b.y - a.y) * pulse} r={3} fill={C.fg} opacity={0.7} />}
            </g>
          );
        })}
      </svg>
      {MESH.map((n, i) => {
        const s = interpolate(local, [4 + i * 2, 16 + i * 2], [0, 1], clamp);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: n.x - (n.relay ? 26 : 18),
              top: n.y - (n.relay ? 26 : 18),
              width: n.relay ? 52 : 36,
              height: n.relay ? 52 : 36,
              borderRadius: n.relay ? 10 : 18,
              background: C.raised,
              border: `2px solid ${n.relay ? C.violet : C.azure}`,
              boxShadow: `0 0 18px -2px ${n.relay ? C.violet : C.azure}`,
              opacity: s,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: MONO,
              fontSize: 12,
              color: C.violet,
            }}
          >
            {n.relay ? 'NOSTR' : ''}
          </div>
        );
      })}
      {/* The central server that isn't there. */}
      <div style={{ position: 'absolute', left: 1430 - 90, top: 530 - 90, width: 180, height: 180, opacity: interpolate(local, [50, 64], [0, 1], clamp) }}>
        <Panel style={{ width: 180, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderColor: `${C.red}66` }}>
          <svg width={70} height={70} viewBox="0 0 48 48" fill="none" stroke={C.muted} strokeWidth={3}>
            <rect x={8} y={6} width={32} height={14} rx={4} />
            <rect x={8} y={28} width={32} height={14} rx={4} />
          </svg>
          <div style={{ fontFamily: MONO, fontSize: 15, color: C.muted, marginTop: 6 }}>central server</div>
        </Panel>
        <svg width={180} height={180} style={{ position: 'absolute', inset: 0 }}>
          <Neon d="M 20 20 L 160 160" color={C.red} progress={xOut} width={6} />
          <Neon d="M 160 20 L 20 160" color={C.red} progress={xOut} width={6} />
        </svg>
      </div>
    </>
  );
};

const BONDS = [
  { name: 'nightowl', btc: 0.25 },
  { name: 'blockbarn', btc: 0.12 },
  { name: 'coldfront', btc: 0.4 },
  { name: 'quietnode', btc: 0.08 },
];

const Bonds: React.FC<{ local: number }> = ({ local }) => {
  const lock = interpolate(local, [10, 40], [0, 1], { ...clamp, easing: easeInOut });
  const blocks = Math.round(interpolate(local, [30, 160], [25920, 25790], clamp));
  return (
    <div style={{ position: 'absolute', left: 1060, top: 190, width: 740 }}>
      <Panel accent={C.amber} glow={lock} style={{ padding: '30px 34px', display: 'flex', alignItems: 'center', gap: 30 }}>
        <svg width={120} height={120} viewBox="0 0 120 120">
          <circle cx={60} cy={60} r={52} fill="none" stroke={C.line} strokeWidth={8} />
          <circle cx={60} cy={60} r={52} fill="none" stroke={C.amber} strokeWidth={8} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - lock} transform="rotate(-90 60 60)" style={{ filter: `drop-shadow(0 0 8px ${C.amber})` }} />
          <rect x={42} y={56} width={36} height={28} rx={5} fill={C.amber} />
          <path d={`M 48 56 V ${48 - (1 - lock) * 10} A 12 12 0 0 1 72 ${48 - (1 - lock) * 10} V 56`} fill="none" stroke={C.amber} strokeWidth={6} />
        </svg>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.2em', color: C.subtle }}>FIDELITY BOND</div>
          <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 52, color: C.fg }}>0.25 BTC locked</div>
          <div style={{ fontFamily: NUM, fontSize: 24, color: C.amber }}>unlocks in {blocks.toLocaleString('en-US')} blocks</div>
        </div>
      </Panel>
      <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {BONDS.map((b, i) => {
          const w = interpolate(local, [40 + i * 8, 70 + i * 8], [0, b.btc / 0.4], { ...clamp, easing: easeOut });
          return (
            <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 160, fontFamily: MONO, fontSize: 22, color: C.muted }}>{b.name}</div>
              <div style={{ flex: 1, height: 20, background: C.surface, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.line}` }}>
                <div style={{ height: '100%', width: `${w * 100}%`, background: `linear-gradient(90deg, ${C.amber}88, ${C.amber})` }} />
              </div>
              <div style={{ width: 120, fontFamily: NUM, fontSize: 22, color: C.fg, textAlign: 'right' }}>{b.btc.toFixed(2)} ₿</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ROUTERS = ['nightowl', 'blockbarn', 'coldfront', 'quietnode', 'harbor'];

const Bans: React.FC<{ local: number }> = ({ local }) => {
  const caught = 3;
  const flag = interpolate(local, [50, 62], [0, 1], clamp);
  return (
    <div style={{ position: 'absolute', left: 1060, top: 210, width: 740, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {ROUTERS.map((r, i) => {
        const s = interpolate(local, [i * 5, 12 + i * 5], [0, 1], { ...clamp, easing: easeOut });
        const bad = i === caught;
        const offline = i === 1;
        return (
          <div key={r} style={{ opacity: s, transform: `translateX(${(1 - s) * 40}px)` }}>
            <Panel style={{ padding: '18px 26px', display: 'flex', alignItems: 'center', gap: 20, borderColor: bad && flag ? `${C.red}aa` : C.line, boxShadow: bad && flag ? `0 0 30px -6px ${C.red}` : undefined }}>
              <div style={{ width: 14, height: 14, borderRadius: 7, background: bad && flag ? C.red : offline ? C.subtle : C.green, boxShadow: `0 0 10px ${bad && flag ? C.red : offline ? 'transparent' : C.green}` }} />
              <div style={{ flex: 1, fontFamily: MONO, fontSize: 26, color: bad && flag ? C.red : C.fg, textDecoration: bad && flag > 0.9 ? 'line-through' : 'none' }}>{r}</div>
              {bad && flag > 0 && <Pill color={C.red} solid style={{ opacity: flag }}>banned · proven cheat</Pill>}
              {offline && local > 90 && <Pill color={C.muted} style={{ opacity: interpolate(local, [90, 100], [0, 1], clamp) }}>offline · no penalty</Pill>}
            </Panel>
          </div>
        );
      })}
    </div>
  );
};

const TABLE = [
  { name: 'nightowl', base: 500, pct: '0.0025', time: '0.0001', max: '0.50', bond: '0.25' },
  { name: 'coldfront', base: 300, pct: '0.0030', time: '0.0001', max: '1.20', bond: '0.40' },
  { name: 'harbor', base: 450, pct: '0.0020', time: '0.0002', max: '0.30', bond: '0.10' },
  { name: 'blockbarn', base: 800, pct: '0.0040', time: '0.0001', max: '0.75', bond: '0.12' },
];
const COLS = ['Router', 'Base Fee', 'Fee %', 'Time Rate', 'Max Swap', 'Fidelity Bond'];

const Fees: React.FC<{ local: number }> = ({ local }) => {
  const sorted = local > 70;
  const order = sorted ? [1, 2, 0, 3] : [0, 1, 2, 3];
  return (
    <div style={{ position: 'absolute', left: 940, top: 230, width: 900 }}>
      <Panel style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 28, color: C.fg }}>Market</div>
          <Pill color={C.azure} style={{ opacity: sorted ? 1 : 0.4 }}>sorted · cheapest first</Pill>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr 1.2fr', padding: '10px 12px', borderBottom: `1px solid ${C.line}` }}>
          {COLS.map((c) => (
            <div key={c} style={{ fontFamily: MONO, fontSize: 15, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.subtle }}>{c}</div>
          ))}
        </div>
        <div style={{ position: 'relative', height: 4 * 64 }}>
          {TABLE.map((r, i) => {
            const rank = order.indexOf(i);
            const y = interpolate(local, [70, 86], [i * 64, rank * 64], { ...clamp, easing: easeInOut });
            const s = interpolate(local, [6 + i * 5, 18 + i * 5], [0, 1], clamp);
            const best = sorted && rank === 0;
            return (
              <div
                key={r.name}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: y,
                  height: 60,
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr 1.2fr',
                  alignItems: 'center',
                  padding: '0 12px',
                  opacity: s,
                  borderRadius: 12,
                  background: best ? `${C.azure}14` : 'transparent',
                  border: `1px solid ${best ? `${C.azure}55` : 'transparent'}`,
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: 22, color: C.fg }}>{r.name}</div>
                <div style={{ fontFamily: NUM, fontSize: 21, color: C.fg }}>{r.base} sats</div>
                <div style={{ fontFamily: NUM, fontSize: 21, color: C.fg }}>{r.pct}%</div>
                <div style={{ fontFamily: NUM, fontSize: 21, color: C.muted }}>{r.time}%</div>
                <div style={{ fontFamily: NUM, fontSize: 21, color: C.muted }}>{r.max} ₿</div>
                <div style={{ fontFamily: NUM, fontSize: 21, color: C.amber }}>{r.bond} ₿</div>
              </div>
            );
          })}
        </div>
      </Panel>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 30, opacity: interpolate(local, [100, 112], [0, 1], clamp) }}>
        <Pill color={C.azure}>flat fee</Pill>
        <span style={{ fontFamily: NUM, fontSize: 30, color: C.subtle }}>+</span>
        <Pill color={C.violet}>% of amount</Pill>
        <span style={{ fontFamily: NUM, fontSize: 30, color: C.subtle }}>+</span>
        <Pill color={C.amber}>% per block locked</Pill>
      </div>
    </div>
  );
};

export const Market: React.FC<D> = ({ duration }) => {
  const frame = useCurrentFrame();
  const ch = Math.min(CHAPTERS.length - 1, Math.floor(frame / CHAPTER));
  const local = frame - ch * CHAPTER;
  const inP = interpolate(local, [0, 14], [0, 1], { ...clamp, easing: easeOut });
  const outP = ch === CHAPTERS.length - 1 ? 1 : interpolate(local, [CHAPTER - 10, CHAPTER], [1, 0], clamp);
  const fade = Math.min(inP, outP);
  const c = CHAPTERS[ch];
  return (
    <Scene duration={duration}>
      <Backdrop accent={[C.violet, C.amber, C.red, C.azure][ch]}>
        <AbsoluteFill style={{ padding: '110px 0 0 110px', width: 800 }}>
          <Kicker color={C.azure}>The marketplace</Kicker>
          <div style={{ opacity: fade, transform: `translateY(${(1 - inP) * 20}px)` }}>
            <Title size={70} style={{ marginTop: 26, whiteSpace: 'pre-line' }}>{c.title}</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 40 }}>
              {c.lines.map((l, i) => (
                <FadeUp key={`${ch}-${i}`} at={ch * CHAPTER + 16 + i * 22}>
                  <Body size={30}>{l}</Body>
                </FadeUp>
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', left: 110, bottom: 96, display: 'flex', gap: 12 }}>
            {['Discovery', 'Fidelity bonds', 'Bans', 'Fees'].map((t, i) => (
              <Pill key={t} color={i === ch ? C.azure : C.subtle} solid={i === ch}>
                {t}
              </Pill>
            ))}
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ opacity: fade }}>
          {ch === 0 && <Mesh local={local} />}
          {ch === 1 && <Bonds local={local} />}
          {ch === 2 && <Bans local={local} />}
          {ch === 3 && <Fees local={local} />}
        </AbsoluteFill>
      </Backdrop>
    </Scene>
  );
};

