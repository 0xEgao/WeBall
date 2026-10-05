import React from 'react';
import { interpolate } from 'remotion';
import { C, HEAD, MONO, NUM } from './theme';
import { clamp, easeInOut, Onion } from './components';

export type RingNode = { label: string; sub?: string; angle: number; kind: 'wallet' | 'router' | 'receiver' };

const rad = (deg: number) => (deg * Math.PI) / 180;
const at = (cx: number, cy: number, r: number, deg: number) => ({ x: cx + r * Math.cos(rad(deg)), y: cy + r * Math.sin(rad(deg)) });
/** Clockwise sweep from a to b, in degrees, always positive. */
const sweep = (a: number, b: number) => ((b - a) % 360 + 360) % 360 || 360;

const arcPath = (cx: number, cy: number, r: number, a: number, b: number) => {
  const p0 = at(cx, cy, r, a);
  const p1 = at(cx, cy, r, b);
  const large = sweep(a, b) > 180 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
};

const Glyph: React.FC<{ kind: RingNode['kind']; color: string }> = ({ kind, color }) => (
  <svg width={46} height={46} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    {kind === 'wallet' && (
      <>
        <rect x={6} y={12} width={36} height={26} rx={6} />
        <path d="M30 25 h12" />
        <circle cx={33} cy={25} r={1.5} fill={color} />
      </>
    )}
    {kind === 'router' && (
      <>
        <rect x={8} y={8} width={32} height={13} rx={4} />
        <rect x={8} y={27} width={32} height={13} rx={4} />
        <circle cx={15} cy={14.5} r={1.6} fill={color} />
        <circle cx={15} cy={33.5} r={1.6} fill={color} />
      </>
    )}
    {kind === 'receiver' && (
      <>
        <path d="M8 20 L12 9 H36 L40 20 Z" />
        <path d="M11 20 V39 H37 V20" />
        <path d="M20 39 V29 H28 V39" />
      </>
    )}
  </svg>
);

/**
 * A swap route on a circle. `p` walks the coin hop by hop: 0 at the first node, 1 at the second,
 * and so on. Edges light as the coin crosses them. `closed` adds the hop back to the first node.
 */
export const Ring: React.FC<{
  cx: number;
  cy: number;
  r: number;
  nodes: RingNode[];
  p: number;
  closed?: boolean;
  tor?: boolean;
  ids?: string[];
  appear?: number;
  frame: number;
  accent?: string;
}> = ({ cx, cy, r, nodes, p, closed = true, tor = false, ids, appear = 1, frame, accent = C.azure }) => {
  const hops = closed ? nodes.length : nodes.length - 1;
  const hop = Math.min(hops - 1, Math.max(0, Math.floor(p)));
  const t = easeInOut(Math.min(1, Math.max(0, p - hop)));
  const a0 = nodes[hop].angle;
  const a1 = nodes[(hop + 1) % nodes.length].angle;
  const coinDeg = a0 + sweep(a0, a1) * t;
  const coin = at(cx, cy, r, coinDeg);
  const moving = p > 0 && p < hops && t > 0.02 && t < 0.98;
  const done = p >= hops;
  const idIdx = done ? hops : t > 0.5 ? hop + 1 : hop;
  return (
    <>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {/* Guide ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.line} strokeWidth={2} strokeDasharray="4 10" opacity={appear} />
        {Array.from({ length: hops }).map((_, i) => {
          const a = nodes[i].angle;
          const b = nodes[(i + 1) % nodes.length].angle;
          const lit = Math.min(1, Math.max(0, p - i));
          const d = arcPath(cx, cy, r, a + 8, a + 8 + (sweep(a, b) - 16) * easeInOut(lit));
          const toReceiver = nodes[(i + 1) % nodes.length].kind === 'receiver';
          const color = toReceiver ? C.green : accent;
          const mid = at(cx, cy, r + 54, a + sweep(a, b) / 2);
          return (
            <g key={i}>
              {lit > 0 && (
                <>
                  <path d={d} fill="none" stroke={color} strokeWidth={14} strokeOpacity={0.1} strokeLinecap="round" />
                  <path d={d} fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
                </>
              )}
              {tor && (
                <g opacity={interpolate(lit, [0, 0.4], [0.35, 1], clamp) * appear} transform={`translate(${mid.x - 16} ${mid.y - 16})`}>
                  <foreignObject width={130} height={34}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Onion size={30} />
                      <span style={{ fontFamily: MONO, fontSize: 18, color: C.violet, letterSpacing: '0.1em' }}>TOR</span>
                    </div>
                  </foreignObject>
                </g>
              )}
            </g>
          );
        })}
        {/* Coin and its onion layers */}
        {p > 0 && !done && (
          <g transform={`translate(${coin.x} ${coin.y})`}>
            {tor &&
              moving &&
              [34, 50, 66].map((rr, k) => (
                <circle
                  key={rr}
                  r={rr}
                  fill="none"
                  stroke={C.violet}
                  strokeWidth={2}
                  strokeDasharray="6 8"
                  opacity={0.7 - k * 0.18}
                  transform={`rotate(${frame * (k % 2 ? -4 : 5)})`}
                />
              ))}
            <circle r={22} fill={C.orange} style={{ filter: `drop-shadow(0 0 14px ${C.orange})` }} />
            <text y={9} textAnchor="middle" fontFamily={NUM} fontWeight={800} fontSize={26} fill={C.bg}>
              ₿
            </text>
          </g>
        )}
      </svg>
      {ids && p > 0 && (
        <div
          style={{
            position: 'absolute',
            left: cx - 130,
            top: cy - 24,
            width: 260,
            textAlign: 'center',
            fontFamily: MONO,
            fontSize: 20,
            color: C.muted,
          }}
        >
          <div style={{ fontSize: 16, letterSpacing: '0.2em', color: C.subtle }}>COIN ID</div>
          <div style={{ fontFamily: NUM, fontSize: 30, color: C.fg, marginTop: 4 }}>{ids[Math.min(ids.length - 1, idIdx)]}</div>
        </div>
      )}
      {nodes.map((n, i) => {
        const pos = at(cx, cy, r, n.angle);
        const reached = done ? true : i <= hop + (t > 0.98 ? 1 : 0);
        const active = !done && (i === hop && t < 0.1);
        const color = n.kind === 'receiver' ? C.green : n.kind === 'wallet' ? accent : C.violet;
        const s = interpolate(appear, [i * 0.12, i * 0.12 + 0.5], [0, 1], clamp);
        return (
          <div key={i} style={{ position: 'absolute', left: pos.x - 70, top: pos.y - 70, width: 140, textAlign: 'center', opacity: s, transform: `scale(${0.85 + 0.15 * s})` }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                background: C.raised,
                border: `2px solid ${reached ? color : C.lineStrong}`,
                boxShadow: reached ? `0 0 ${active ? 50 : 28}px -4px ${color}` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Glyph kind={n.kind} color={reached ? color : C.subtle} />
            </div>
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 24, color: C.fg, marginTop: 14, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{n.label}</div>
            {n.sub && <div style={{ fontFamily: MONO, fontSize: 18, color: C.subtle, whiteSpace: 'nowrap' }}>{n.sub}</div>}
          </div>
        );
      })}
    </>
  );
};
