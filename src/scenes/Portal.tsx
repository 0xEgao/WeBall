import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { BAR, BEAT, C, DISPLAY, MONO } from '../theme';
import { Card, Chip, clamp, H, Logo, P, Paper, Rise, Scene, useBeat, useSpring } from '../components';

export const PortalTitle: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 10, mass: 0.9 });
  return (
    <Scene duration={duration} out={6}>
      <AbsoluteFill style={{ background: C.ink, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${s}) rotate(${(1 - s) * 180 + frame * 1.5}deg)` }}>
          <Logo size={170} invert />
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 200, color: C.paper, marginTop: 20 }}>
          <Rise text="Meet Portal" delay={4} style={{ justifyContent: 'center' }} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 30, color: 'rgba(247,242,232,0.7)', letterSpacing: '0.12em', opacity: interpolate(frame, [18, 26], [0, 1], clamp) }}>
          WALLET + ROUTER · ONE APP · DESKTOP & SELF-HOSTED WEB
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

type Shot = { file: string; w: number; h: number; role: 'wallet' | 'router'; title: string; line: string;
  /** Visible region as [x, y, w, h] fractions, panned from `crop` to `cropTo`. */
  crop?: [number, number, number, number];
  cropTo?: [number, number, number, number];
};

export const SHOTS: Shot[] = [
  { file: 'choose-role', w: 1824, h: 1784, role: 'wallet', title: 'Pick Wallet', line: 'To swap your own bitcoin privately.' },
  { file: 'create-wallet', w: 1353, h: 1428, role: 'wallet', title: 'Create a wallet', line: 'Just a name and a password.' },
  { file: 'configure-swap', w: 5959, h: 2658, role: 'wallet', title: 'Choose an amount', line: 'Pick how much to swap, then press Start.', crop: [0, 0.06, 0.46, 0.5], cropTo: [0.54, 0.06, 0.46, 0.5] },
  { file: 'swap-complete', w: 2062, h: 3204, role: 'wallet', title: 'Done', line: 'Fresh coins, with no link to the old ones.' },
  { file: 'create-router', w: 1708, h: 2186, role: 'router', title: 'Set it up', line: 'Give your router a name and a password.' },
  { file: 'fund-fidelity-bond', w: 1622, h: 2064, role: 'router', title: 'Add a deposit', line: 'A locked deposit keeps the market honest.' },
  { file: 'router-overview', w: 2938, h: 1750, role: 'router', title: 'Earn fees', line: "Your router earns from other people's swaps." },
];

const BOX_W = 1080;
const BOX_H = 800;

const ShotWindow: React.FC<{ shot: Shot; local: number; dir: number }> = ({ shot, local, dir }) => {
  const enter = interpolate(local, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.1)) });
  const exit = interpolate(local, [BAR - 8, BAR], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  // A cropped shot pans between two regions; otherwise fit by width and pan a tall one down.
  const pan = interpolate(local, [10, BAR - 6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const a = shot.crop ?? [0, 0, 1, 1];
  const b = shot.cropTo ?? a;
  const [cx, cy, cw, ch] = a.map((v, i) => v + (b[i] - v) * pan);
  const imgW = BOX_W / cw;
  const imgH = (imgW * shot.h) / shot.w;
  const regionH = imgH * ch;
  const winH = Math.min(BOX_H, regionH);
  const overflowY = shot.crop ? 0 : Math.max(0, imgH - winH);
  const offX = cx * imgW;
  const offY = cy * imgH + pan * overflowY;
  const zoom = interpolate(local, [0, BAR], [1.0, 1.05]);
  return (
    <div
      style={{
        width: BOX_W,
        transform: `perspective(1800px) translateX(${(1 - enter) * 700 * dir - exit * 900 * dir}px) rotateY(${(1 - enter) * -28 * dir + exit * 20 * dir}deg) rotateZ(${(1 - enter) * 4 * dir}deg)`,
        opacity: 1 - exit,
      }}
    >
      <div style={{ background: C.ink, borderRadius: '22px 22px 0 0', height: 48, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px' }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
        ))}
        <div style={{ fontFamily: MONO, fontSize: 18, color: 'rgba(247,242,232,0.6)', marginLeft: 16 }}>
          portal · {shot.role === 'wallet' ? 'desktop' : 'self-hosted web'}
        </div>
      </div>
      <div style={{ height: winH, overflow: 'hidden', background: '#0b0e16', border: `3px solid ${C.ink}`, borderTop: 'none', borderRadius: '0 0 22px 22px', boxShadow: `14px 14px 0 ${C.ink}` }}>
        <Img src={staticFile(`portal/${shot.file}.webp`)} style={{ width: imgW, height: imgH, display: 'block', transform: `translate(${-offX}px, ${-offY}px) scale(${zoom})`, transformOrigin: 'top left' }} />
      </div>
    </div>
  );
};

export const PortalShots: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const beat = useBeat();
  const idx = Math.min(SHOTS.length - 1, Math.floor(frame / BAR));
  const local = frame - idx * BAR;
  const shot = SHOTS[idx];
  const dir = idx % 2 ? -1 : 1;
  const textIn = interpolate(local, [4, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const textOut = interpolate(local, [BAR - 8, BAR], [1, 0], clamp);
  const routerStart = SHOTS.findIndex((s) => s.role === 'router');
  const stepNo = shot.role === 'wallet' ? idx + 1 : idx - routerStart + 1;
  const textLeft = dir === 1;
  return (
    <Scene duration={duration}>
      <Paper>
        <AbsoluteFill style={{ padding: '56px 90px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <Chip dark={shot.role === 'wallet'}>wallet</Chip>
            <Chip dark={shot.role === 'router'}>router</Chip>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {SHOTS.map((s, i) => (
              <div key={i} style={{ width: i === idx ? 40 : 14, height: 14, borderRadius: 7, background: i <= idx ? C.ink : C.ink12, marginLeft: i === routerStart ? 18 : 0 }} />
            ))}
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ flexDirection: textLeft ? 'row' : 'row-reverse', alignItems: 'center', padding: '80px 90px 0', gap: 70 }}>
          <div style={{ flex: 1, opacity: textIn * textOut, transform: `translateY(${(1 - textIn) * 40}px)` }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 200, lineHeight: 0.9, color: 'transparent', WebkitTextStroke: `3px ${C.ink}`, transform: `scale(${1 + beat * 0.03})`, transformOrigin: 'left bottom' }}>
              {String(stepNo).padStart(2, '0')}
            </div>
            <H size={84} style={{ marginTop: 18 }}>{shot.title}</H>
            <P size={36} style={{ marginTop: 16, maxWidth: 600 }}>{shot.line}</P>
          </div>
          <ShotWindow key={idx} shot={shot} local={local} dir={dir} />
        </AbsoluteFill>
        {/* Chapter flash when the router half begins. */}
        {idx === routerStart && local < BEAT * 2 && (
          <AbsoluteFill style={{ background: C.ink, alignItems: 'center', justifyContent: 'center', opacity: interpolate(local, [BEAT * 1.2, BEAT * 2], [1, 0], clamp) }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 170, color: C.paper }}>Run a Router</div>
            <div style={{ fontFamily: MONO, fontSize: 30, color: 'rgba(247,242,232,0.7)', letterSpacing: '0.12em' }}>EARN FEES ROUTING OTHER PEOPLE'S SWAPS</div>
          </AbsoluteFill>
        )}
      </Paper>
    </Scene>
  );
};

/** The call to action: download Portal. */
export const PortalCta: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const beat = useBeat();
  const card = useSpring(10, { damping: 12 });
  return (
    <Scene duration={duration}>
      <Paper>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Rise text="Try Portal" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 190, color: C.ink, justifyContent: 'center' }} />
          <P size={40} style={{ marginTop: 6, opacity: interpolate(frame, [8, 16], [0, 1], clamp) }}>
            Free and open source. Swap privately, or run a router and earn.
          </P>
          <div style={{ marginTop: 50, transform: `scale(${card * (1 + beat * 0.015)}) rotate(${(1 - card) * -8}deg)`, opacity: card }}>
            <Card style={{ display: 'flex', alignItems: 'center', gap: 30, padding: '28px 48px' }}>
              <svg width={70} height={70} viewBox="0 0 70 70">
                <circle cx={35} cy={35} r={33} fill={C.ink} />
                <path d="M35 16 L35 44 M23 33 L35 45 L47 33 M21 53 L49 53" stroke={C.paper} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.14em', color: C.ink45 }}>DOWNLOAD</div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: C.ink }}>openswap.live/portal</div>
              </div>
            </Card>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 40, opacity: interpolate(frame, [22, 30], [0, 1], clamp) }}>
            <Chip dark>macOS</Chip>
            <Chip dark>Linux</Chip>
            <Chip>self-hosted web</Chip>
          </div>
          <div style={{ marginTop: 34, display: 'flex', alignItems: 'center', gap: 14, opacity: interpolate(frame, [40, 50], [0, 1], clamp) }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: C.green, boxShadow: `0 0 0 ${4 + beat * 8}px rgba(0,200,83,${0.25 * (1 - beat * 0.6)})` }} />
            <div style={{ fontFamily: MONO, fontSize: 28, color: C.ink70 }}>routers are live on mainnet: openswap.live/market</div>
          </div>
        </AbsoluteFill>
      </Paper>
    </Scene>
  );
};
