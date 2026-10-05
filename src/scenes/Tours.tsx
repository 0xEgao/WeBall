import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, HEAD, MONO } from '../theme';
import { Backdrop, Body, clamp, easeInOut, Kicker, Scene } from '../components';

type D = { duration: number };
type Rect = [number, number, number, number];

/** A real Portal screenshot placed on the tour canvas. `w` is its width in canvas px. */
type Shot = { id: string; src: string; nat: [number, number]; x: number; y: number; w: number };
/** Where the camera goes: a shot (optionally a region of it) reached at frame `at`. */
type Stop = { at: number; shot?: string; rect?: Rect; title?: string; sub?: string; color?: string };

const VIEW_W = 1920;
const VIEW_H = 1080;
const MOVE = 26;

const shotBox = (s: Shot) => ({ x: s.x, y: s.y, w: s.w, h: (s.w * s.nat[1]) / s.nat[0] });

const targetOf = (stop: Stop, shots: Shot[]) => {
  let box: { x: number; y: number; w: number; h: number };
  if (!stop.shot) {
    const all = shots.map(shotBox);
    const x0 = Math.min(...all.map((b) => b.x));
    const y0 = Math.min(...all.map((b) => b.y));
    const x1 = Math.max(...all.map((b) => b.x + b.w));
    const y1 = Math.max(...all.map((b) => b.y + b.h));
    box = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  } else {
    const b = shotBox(shots.find((s) => s.id === stop.shot)!);
    const [rx, ry, rw, rh] = stop.rect ?? [0, 0, 1, 1];
    box = { x: b.x + rx * b.w, y: b.y + ry * b.h, w: rw * b.w, h: rh * b.h };
  }
  // Leave room for the caption along the bottom.
  const scale = Math.min((VIEW_W * 0.8) / box.w, (VIEW_H * 0.66) / box.h, 2.4);
  return { cx: box.x + box.w / 2, cy: box.y + box.h / 2, scale, box };
};

const Tour: React.FC<{ duration: number; shots: Shot[]; stops: Stop[]; accent: string; kicker: string }> = ({ duration, shots, stops, accent, kicker }) => {
  const frame = useCurrentFrame();
  const i = Math.max(0, stops.filter((s) => s.at <= frame).length - 1);
  const cur = targetOf(stops[i], shots);
  const prev = targetOf(stops[Math.max(0, i - 1)], shots);
  const t = easeInOut(interpolate(frame, [stops[i].at, stops[i].at + MOVE], [0, 1], clamp));
  // Pull back a little mid-move when hopping between screens, like a camera on a crane.
  const hop = stops[i].shot !== stops[Math.max(0, i - 1)].shot ? 0.28 : 0.06;
  const scale = Math.exp(Math.log(prev.scale) + (Math.log(cur.scale) - Math.log(prev.scale)) * t) * (1 - hop * Math.sin(Math.PI * t));
  const cx = prev.cx + (cur.cx - prev.cx) * t;
  const cy = prev.cy + (cur.cy - prev.cy) * t;
  const camY = -60; // the caption sits low, so frame the focus slightly high
  const settled = interpolate(frame, [stops[i].at + MOVE - 4, stops[i].at + MOVE + 14], [0, 1], clamp);
  const stop = stops[i];
  const color = stop.color ?? accent;
  const next = stops[i + 1]?.at ?? duration;
  const capOut = interpolate(frame, [next - 6, next], [1, 0], clamp);
  const b = cur.box;
  return (
    <Scene duration={duration}>
      <Backdrop accent={accent}>
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${VIEW_W / 2 - cx * scale}px, ${VIEW_H / 2 + camY - cy * scale}px) scale(${scale})` }}>
            {shots.map((s) => {
              const bx = shotBox(s);
              const focused = !stop.shot || stop.shot === s.id;
              return (
                <div
                  key={s.id}
                  style={{
                    position: 'absolute',
                    left: bx.x,
                    top: bx.y,
                    width: bx.w,
                    height: bx.h,
                    borderRadius: 18 / Math.max(0.5, scale) * 1.5,
                    overflow: 'hidden',
                    border: `${2 / scale}px solid ${focused ? `${accent}66` : C.line}`,
                    boxShadow: `0 ${40 / scale}px ${120 / scale}px rgba(0,0,0,0.7)`,
                    opacity: focused ? 1 : 0.28,
                  }}
                >
                  <Img src={staticFile(`real/${s.src}`)} style={{ width: '100%', height: '100%', display: 'block' }} />
                </div>
              );
            })}
            {/* Neon outline around the focus area, drawn once the camera settles. */}
            {stop.shot && stop.rect && (
              <svg style={{ position: 'absolute', left: b.x, top: b.y, overflow: 'visible' }} width={b.w} height={b.h}>
                <rect
                  x={-8 / scale}
                  y={-8 / scale}
                  width={b.w + 16 / scale}
                  height={b.h + 16 / scale}
                  rx={14 / scale}
                  fill="none"
                  stroke={color}
                  strokeWidth={3 / scale}
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1 - settled}
                  style={{ filter: `drop-shadow(0 0 ${8 / scale}px ${color})` }}
                />
              </svg>
            )}
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,14,19,0.85), transparent 18%, transparent 70%, rgba(11,14,19,0.95))', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 110, top: 70 }}>
          <Kicker color={accent}>{kicker}</Kicker>
        </div>
        {stop.title && (
          <div style={{ position: 'absolute', left: 110, bottom: 80, opacity: settled * capOut, transform: `translateY(${(1 - settled) * 16}px)` }}>
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 54, color: C.fg, display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: color, boxShadow: `0 0 14px ${color}` }} />
              {stop.title}
            </div>
            {stop.sub && <Body size={28} style={{ marginTop: 6, marginLeft: 30 }}>{stop.sub}</Body>}
          </div>
        )}
        <div style={{ position: 'absolute', right: 110, bottom: 92, display: 'flex', gap: 8 }}>
          {stops.map((_, k) => (
            <div key={k} style={{ width: k === i ? 34 : 10, height: 10, borderRadius: 5, background: k <= i ? accent : C.lineStrong }} />
          ))}
        </div>
        <div style={{ position: 'absolute', right: 110, top: 74, fontFamily: MONO, fontSize: 18, letterSpacing: '0.2em', color: C.subtle }}>REAL PORTAL SCREENS</div>
      </Backdrop>
    </Scene>
  );
};

const WALLET_SHOTS: Shot[] = [
  { id: 'connect', src: 'connect.jpg', nat: [1400, 864], x: 0, y: 0, w: 1400 },
  { id: 'wallet', src: 'wallet.jpg', nat: [2000, 971], x: 1600, y: -140, w: 2000 },
  { id: 'config', src: 'configure-swap.webp', nat: [5959, 2658], x: 200, y: 1150, w: 3200 },
  { id: 'complete', src: 'swap-complete.webp', nat: [2062, 3204], x: 3650, y: 950, w: 1150 },
  { id: 'report', src: 'report.webp', nat: [1888, 956], x: 5050, y: 1250, w: 1888 },
];

const WALLET_STOPS: Stop[] = [
  { at: 0 },
  { at: 24, shot: 'connect', rect: [0.075, 0.26, 0.81, 0.52], title: 'Connect', sub: 'Electrum or your own node. Tor starts on its own.' },
  { at: 84, shot: 'connect', rect: [0.09, 0.59, 0.37, 0.09], title: 'Electrum over Tor', sub: 'One switch hides your IP from the server.', color: C.violet },
  { at: 134, shot: 'wallet', rect: [0.018, 0.022, 0.964, 0.36], title: 'Your wallet', sub: 'Regular coins and swapped coins, side by side.' },
  { at: 194, shot: 'config', rect: [0.0, 0.12, 0.45, 0.33], title: 'Set up a swap', sub: 'Pick an amount and how many routers.' },
  { at: 254, shot: 'config', rect: [0.78, 0.24, 0.215, 0.3], title: 'Fees up front', sub: 'Taproot picked. You see exactly what you will receive.', color: C.green },
  { at: 304, shot: 'complete', rect: [0.13, 0.13, 0.74, 0.42], title: 'Round the circle', sub: 'Three routers, four hops, all over Tor.', color: C.green },
  { at: 384, shot: 'report', rect: [0.008, 0.155, 0.983, 0.53], title: 'Every sat accounted for', sub: 'Fees, partners and the coins you got back.' },
];

const ROUTER_SHOTS: Shot[] = [
  { id: 'create', src: 'create-router.webp', nat: [1708, 2186], x: 0, y: 0, w: 1100 },
  { id: 'fund', src: 'fund-fidelity-bond.webp', nat: [1622, 2064], x: 1250, y: 120, w: 1100 },
  { id: 'dash', src: 'dashboard.jpg', nat: [2940, 1726], x: 2550, y: -80, w: 2400 },
  { id: 'fleet', src: 'fleet.jpg', nat: [1600, 1214], x: 2700, y: 1450, w: 1800 },
  { id: 'market', src: 'market.jpg', nat: [2940, 1570], x: 4750, y: 1350, w: 2400 },
];

const ROUTER_STOPS: Stop[] = [
  { at: 0 },
  { at: 22, shot: 'create', rect: [0.12, 0.19, 0.68, 0.53], title: 'Add a router', sub: 'Pick a public name. Portal encrypts its wallet.' },
  { at: 82, shot: 'fund', rect: [0.15, 0.2, 0.57, 0.4], title: 'Lock a fidelity bond', sub: 'Time-locked bitcoin that earns you trust.', color: C.amber },
  { at: 152, shot: 'dash', rect: [0.031, 0.145, 0.939, 0.4], title: 'Your router, running', sub: 'Balance, bond and earnings in one place.' },
  { at: 206, shot: 'dash', rect: [0.704, 0.145, 0.265, 0.18], title: 'Net earnings', sub: 'Fees from every swap it routes.', color: C.green },
  { at: 262, shot: 'dash', rect: [0.031, 0.816, 0.939, 0.135], title: '+508 sats', sub: 'One routed swap, one fee. Automatically.', color: C.green },
  { at: 322, shot: 'fleet', rect: [0.017, 0.157, 0.937, 0.085], title: 'Run a fleet', sub: 'Four routers, 12,901 sats earned so far.', color: C.green },
  { at: 384, shot: 'fleet', rect: [0.017, 0.312, 0.937, 0.33], title: 'Each one earning', sub: 'Every card shows what that router has made.', color: C.green },
  { at: 440, shot: 'market', rect: [0.022, 0.299, 0.955, 0.6], title: 'Live on the market', sub: 'Every wallet sees your router and its fees.' },
  { at: 494, shot: 'market', rect: [0.022, 0.775, 0.955, 0.085], title: 'Asteroid Destroyer', sub: 'The same router, now routing swaps for others.', color: C.violet },
];

export const WalletTour: React.FC<D> = ({ duration }) => <Tour duration={duration} shots={WALLET_SHOTS} stops={WALLET_STOPS} accent={C.azure} kicker="Portal · Wallet" />;

export const RouterTour: React.FC<D> = ({ duration }) => <Tour duration={duration} shots={ROUTER_SHOTS} stops={ROUTER_STOPS} accent={C.violet} kicker="Portal · Router" />;

