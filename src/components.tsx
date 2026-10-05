import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { BEAT, C, HEAD, MONO } from './theme';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const easeOut = Easing.out(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);

/** 0→1 over `len` frames starting at `at`, eased. */
export const useProgress = (at: number, len = 14, easing = easeOut) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing });
};

/** 1 on the beat, decaying to 0 before the next one. */
export const useBeat = () => {
  const f = useCurrentFrame();
  return Math.exp(-(((f % BEAT) + BEAT) % BEAT) / 3.2);
};

/** Dark field with a fine grid, drifting scan lines, faint glows and grain. */
export const Backdrop: React.FC<{ accent?: string; children?: React.ReactNode; grid?: number }> = ({ accent = C.azure, children, grid = 1 }) => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.4) % 80;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 12% 8%, ${accent}1f, transparent 45%), radial-gradient(ellipse at 90% 100%, ${C.violet}14, transparent 50%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: grid,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          backgroundPosition: `0 ${drift}px, 0 ${drift}px`,
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%)',
        }}
      />
      {[0, 1, 2].map((k) => {
        const y = ((frame * (1.2 + k * 0.5) + k * 380) % 1400) - 160;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: y,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${k === 1 ? C.violet : accent}55, transparent)`,
            }}
          />
        );
      })}
      {children}
      <Grain />
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 280px rgba(0,0,0,0.75)', pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const frame = useCurrentFrame();
  const id = `grain${frame % 6}`;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: 'screen', pointerEvents: 'none' }}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 6} />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Scene envelope: fade and de-blur in, fade out. */
export const Scene: React.FC<{ duration: number; children: React.ReactNode; out?: number }> = ({ duration, children, out = 10 }) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: easeOut });
  const outP = interpolate(frame, [duration - out, duration], [1, 0], clamp);
  return <AbsoluteFill style={{ opacity: Math.min(inP, outP), filter: `blur(${(1 - inP) * 6}px)` }}>{children}</AbsoluteFill>;
};

const GLYPHS = '01#$%&*+<>/\\=?@ABCDEFGHJKLMNPQRSTUVWXYZ';

/** Characters decode from noise, left to right. */
export const Decode: React.FC<{ text: string; at?: number; speed?: number; style?: React.CSSProperties }> = ({ text, at = 0, speed = 1.6, style }) => {
  const frame = useCurrentFrame();
  const t = (frame - at) * speed;
  return (
    <span style={{ whiteSpace: 'pre', ...style }}>
      {text.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        if (t < i - 6) return <span key={i} style={{ opacity: 0 }}>{ch}</span>;
        if (t < i) return <span key={i} style={{ opacity: 0.55 }}>{GLYPHS[Math.floor(random(`${text}${i}${frame}`) * GLYPHS.length)]}</span>;
        return <span key={i}>{ch}</span>;
      })}
    </span>
  );
};

/** Terminal typing with a block caret. */
export const Typed: React.FC<{ text: string; at?: number; cps?: number; style?: React.CSSProperties; caret?: boolean }> = ({ text, at = 0, cps = 1.5, style, caret = true }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - at) * cps)));
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <span style={{ fontFamily: MONO, whiteSpace: 'pre', ...style }}>
      {text.slice(0, n)}
      {caret && frame >= at && <span style={{ opacity: blink ? 0.9 : 0 }}>▌</span>}
    </span>
  );
};

/** Rises in from below on a fade. */
export const FadeUp: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; dist?: number }> = ({ at, children, style, dist = 24 }) => {
  const p = useProgress(at, 14);
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * dist}px)`, ...style }}>{children}</div>;
};

/** Portal's surface card: hairline border, lit from the top left. */
export const Panel: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties; accent?: string; glow?: number }> = ({ children, style, accent, glow = 0 }) => (
  <div
    style={{
      position: 'relative',
      background: `linear-gradient(160deg, ${C.raised}, ${C.surface} 60%)`,
      border: `1px solid ${C.line}`,
      borderRadius: 20,
      boxShadow: `inset 1px 1px 0 rgba(255,255,255,0.06)${accent ? `, 0 0 ${30 + glow * 30}px -6px ${accent}${glow ? '88' : '33'}` : ''}`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pill: React.FC<{ children: React.ReactNode; color?: string; solid?: boolean; style?: React.CSSProperties }> = ({ children, color = C.muted, solid, style }) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: 20,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      padding: '7px 16px',
      borderRadius: 999,
      border: `1px solid ${solid ? color : `${color}66`}`,
      background: solid ? color : `${color}12`,
      color: solid ? C.bg : color,
      whiteSpace: 'nowrap',
      display: 'inline-block',
      ...style,
    }}
  >
    {children}
  </span>
);

/** "01 · LEGACY" style kicker with a drawn rule. */
export const Kicker: React.FC<{ children: React.ReactNode; color?: string; at?: number }> = ({ children, color = C.azure, at = 0 }) => {
  const p = useProgress(at, 16);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: p }}>
      <div style={{ width: 70 * p, height: 2, background: color, boxShadow: `0 0 12px ${color}` }} />
      <span style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.3em', color, textTransform: 'uppercase' }}>{children}</span>
    </div>
  );
};

export const Title: React.FC<{ size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size = 92, children, style }) => (
  <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: size, lineHeight: 1.08, color: C.fg, letterSpacing: '-0.01em', ...style }}>{children}</div>
);

export const Body: React.FC<{ size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size = 32, children, style }) => (
  <div style={{ fontFamily: MONO, fontSize: size, lineHeight: 1.5, color: C.muted, ...style }}>{children}</div>
);

/** A stroke that draws itself, with a neon glow. Uses pathLength so no measuring is needed. */
export const Neon: React.FC<{ d: string; color: string; progress: number; width?: number; dash?: string; opacity?: number }> = ({ d, color, progress, width = 3, dash, opacity = 1 }) => (
  <g opacity={opacity}>
    <path d={d} fill="none" stroke={color} strokeWidth={width * 4} strokeOpacity={0.12} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - progress} strokeLinecap="round" />
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      pathLength={dash ? undefined : 1}
      strokeDasharray={dash ?? '1'}
      strokeDashoffset={dash ? undefined : 1 - progress}
      strokeLinecap="round"
      style={{ filter: `drop-shadow(0 0 6px ${color})` }}
    />
  </g>
);

/** The yin-yang mark from openswap-bw.svg, in fill or neon-outline form. */
export const Logo: React.FC<{ size: number; rotate?: number; outline?: number; color?: string }> = ({ size, rotate = 0, outline, color = C.fg }) => {
  const fillO = outline === undefined ? 1 : interpolate(outline, [0.7, 1], [0, 1], clamp);
  const draw = outline === undefined ? 1 : Math.min(1, outline / 0.75);
  const yin = 'M 479.5 12 A 467.5 467.5 0 0 1 479.5 947 L 479.5 935.8 A 228.3 228.3 0 0 1 479.5 479.2 L 479.5 479.8 A 228.3 228.3 0 0 0 479.5 23.2 L 479.5 12 Z';
  return (
    <svg width={size} height={size} viewBox="-20 -20 1000 1000" style={{ transform: `rotate(${rotate}deg)`, overflow: 'visible' }}>
      <g opacity={fillO}>
        <circle cx="479.5" cy="479.5" r="467.5" fill={color} />
        <path fill={C.bg} d={yin} />
        <circle cx="479.5" cy="251.5" r="59.75" fill={C.bg} />
        <circle cx="479.5" cy="707.5" r="59.75" fill={color} />
      </g>
      {outline !== undefined && (
        <g style={{ filter: `drop-shadow(0 0 14px ${C.azure})` }} opacity={1 - fillO * 0.6}>
          <circle cx="479.5" cy="479.5" r="467.5" fill="none" stroke={C.azure} strokeWidth={10} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
          <path d={yin} fill="none" stroke={C.azure} strokeWidth={10} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
        </g>
      )}
    </svg>
  );
};

/** Tor onion glyph. */
export const Onion: React.FC<{ size: number; color?: string }> = ({ size, color = C.violet }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <g fill="none" stroke={color} strokeWidth={5}>
      <ellipse cx={50} cy={58} rx={36} ry={36} />
      <ellipse cx={50} cy={58} rx={24} ry={26} />
      <ellipse cx={50} cy={58} rx={12} ry={16} />
      <path d="M50 22 C 50 12, 60 6, 66 4" strokeLinecap="round" />
    </g>
  </svg>
);

type Tok = { t: string; c?: string };
/** A script listing that types in token by token; `hl` lines glow in `hlColor`. */
export const Code: React.FC<{ lines: Tok[][]; at?: number; perLine?: number; size?: number; hl?: number[]; hlColor?: string }> = ({ lines, at = 0, perLine = 4, size = 26, hl = [], hlColor = C.azure }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ fontFamily: MONO, fontSize: size, lineHeight: 1.55 }}>
      {lines.map((line, i) => {
        const on = frame >= at + i * perLine;
        const lit = hl.includes(i);
        return (
          <div
            key={i}
            style={{
              opacity: on ? 1 : 0,
              transform: `translateX(${on ? 0 : -10}px)`,
              display: 'flex',
              gap: 14,
              background: lit ? `${hlColor}14` : 'transparent',
              borderLeft: `3px solid ${lit ? hlColor : 'transparent'}`,
              paddingLeft: 14,
            }}
          >
            <span style={{ color: C.subtle, width: 34, textAlign: 'right' }}>{String(i + 1).padStart(2, '0')}</span>
            <span>
              {line.map((tok, k) => (
                <span key={k} style={{ color: tok.c ?? C.fg }}>
                  {tok.t}
                </span>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const op = (t: string): Tok => ({ t, c: C.violet });
export const arg = (t: string): Tok => ({ t, c: C.amber });
export const key = (t: string): Tok => ({ t, c: C.azure });
export const sp: Tok = { t: ' ' };
