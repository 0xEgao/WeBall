import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, HEAD, MONO, NUM } from '../theme';
import { arg, Backdrop, Body, clamp, Code, Decode, easeInOut, FadeUp, key, Kicker, Logo, Neon, Onion, op, Panel, Pill, Scene, sp, Title, useBeat, useProgress } from '../components';
import { Ring, RingNode } from '../ring';

type D = { duration: number };

export const Intro: React.FC<D> = ({ duration }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 56], [0, 1], { ...clamp, easing: easeInOut });
  return (
    <Scene duration={duration}>
      <Backdrop>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Logo size={230} outline={draw} rotate={frame * 0.25} />
          <div style={{ marginTop: 50 }}>
            <Decode text="OPENSWAP" at={34} speed={0.7} style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 150, color: C.fg, letterSpacing: '0.12em' }} />
          </div>
          <FadeUp at={70}>
            <Body size={36} style={{ textAlign: 'center' }}>An actually decentralized atomic-swap marketplace for bitcoin.</Body>
          </FadeUp>
          <FadeUp at={100} style={{ display: 'flex', gap: 14, marginTop: 34 }}>
            <Pill color={C.azure}>peer to peer</Pill>
            <Pill color={C.violet}>over tor</Pill>
            <Pill color={C.green}>open source</Pill>
          </FadeUp>
        </AbsoluteFill>
      </Backdrop>
    </Scene>
  );
};

const LOOP: RingNode[] = [
  { label: 'You', sub: 'wallet', angle: -90, kind: 'wallet' },
  { label: 'Router A', sub: 'xk3…7fd.onion', angle: 30, kind: 'router' },
  { label: 'Router B', sub: 'm2q…a9e.onion', angle: 150, kind: 'router' },
];

const Bullets: React.FC<{ items: { at: number; text: React.ReactNode }[]; color?: string }> = ({ items, color = C.azure }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26, marginTop: 46 }}>
      {items.map((it, i) => {
        const latest = items.filter((x) => frame >= x.at).length - 1 === i;
        return (
          <FadeUp key={i} at={it.at}>
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <div style={{ width: 10, height: 10, marginTop: 16, borderRadius: 2, background: latest ? color : C.subtle, boxShadow: latest ? `0 0 12px ${color}` : 'none', flexShrink: 0 }} />
              <Body size={32} style={{ color: latest ? C.fg : C.muted }}>{it.text}</Body>
            </div>
          </FadeUp>
        );
      })}
    </div>
  );
};

export const Route: React.FC<D> = ({ duration }) => {
  const frame = useCurrentFrame();
  const hopLen = 84;
  const start = 54;
  const p = Math.max(0, (frame - start) / hopLen);
  const torBox = useProgress(330, 18);
  return (
    <Scene duration={duration}>
      <Backdrop>
        <AbsoluteFill style={{ padding: '110px 0 0 110px', width: 820 }}>
          <Kicker>How a swap works</Kicker>
          <Title size={78} style={{ marginTop: 26 }}>Swap your coins<br />in a circle.</Title>
          <Bullets
            items={[
              { at: 40, text: 'You send coins into a loop of routers.' },
              { at: start + hopLen * 0.6, text: 'Each router hands back different coins.' },
              { at: start + hopLen * 2.6, text: 'You end up with fresh coins. No link back.' },
              { at: start + hopLen * 3.2, text: 'It all completes, or everyone is refunded.' },
            ]}
          />
        </AbsoluteFill>
        <Ring cx={1330} cy={560} r={290} nodes={LOOP} p={p} tor frame={frame} appear={useProgress(6, 30)} ids={['a3f1·9e02', '7c0d·41ba', 'e95b·0c7f', '2d84·b613']} />
        <div style={{ position: 'absolute', left: 110, bottom: 96, opacity: torBox, transform: `translateY(${(1 - torBox) * 20}px)` }}>
          <Panel accent={C.violet} glow={1} style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '22px 30px' }}>
            <Onion size={54} />
            <div>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: C.fg }}>Wrapped in Tor</div>
              <Body size={24}>Every message between you and the routers runs over Tor.</Body>
            </div>
          </Panel>
        </div>
      </Backdrop>
    </Scene>
  );
};

const LEGACY_SCRIPT = [
  [op('OP_SIZE'), sp, op('OP_SWAP'), sp, op('OP_HASH160'), sp, arg('<hash>'), sp, op('OP_EQUAL')],
  [op('OP_IF')],
  [{ t: '  ' }, key('<claim_pubkey>'), sp, arg('32 0')],
  [op('OP_ELSE')],
  [{ t: '  ' }, key('<refund_pubkey>'), sp, arg('0 <locktime>')],
  [op('OP_ENDIF')],
  [op('OP_CSV'), sp, op('OP_DROP'), sp, op('OP_ROT')],
  [op('OP_EQUALVERIFY'), sp, op('OP_CHECKSIG')],
];

const Tag: React.FC<{ at: number; color: string; children: React.ReactNode; top: number }> = ({ at, color, children, top }) => {
  const p = useProgress(at, 12);
  return (
    <div style={{ position: 'absolute', right: -24, top, transform: `translateX(${(1 - p) * 30}px) translateX(100%)`, opacity: p, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 30, height: 2, background: color }} />
      <Pill color={color}>{children}</Pill>
    </div>
  );
};

export const Legacy: React.FC<D> = ({ duration }) => {
  const frame = useCurrentFrame();
  const hl = frame > 200 && frame < 260 ? [1, 2] : frame >= 260 && frame < 330 ? [3, 4] : [];
  const hlColor = frame < 260 ? C.green : C.amber;
  return (
    <Scene duration={duration}>
      <Backdrop accent={C.amber}>
        <AbsoluteFill style={{ padding: '110px 0 0 110px', width: 840 }}>
          <Kicker color={C.amber}>01 · Legacy</Kicker>
          <Title size={80} style={{ marginTop: 26 }}>The original<br />atomic swap.</Title>
          <Bullets
            color={C.amber}
            items={[
              { at: 24, text: 'The OG CoinSwap idea, first described by Greg Maxwell in 2013.' },
              { at: 60, text: 'Both sides lock coins in a 2-of-2: nobody can move them alone.' },
              { at: 96, text: 'A contract decides: claim with the secret, or get a refund after a timeout.' },
            ]}
          />
        </AbsoluteFill>
        <div style={{ position: 'absolute', left: 900, top: 170, width: 600 }}>
          <FadeUp at={40}>
            <Panel accent={C.amber} style={{ padding: '26px 26px 30px' }}>
              <div style={{ fontFamily: MONO, fontSize: 18, color: C.subtle, letterSpacing: '0.2em', marginBottom: 16 }}>CONTRACT SCRIPT · P2WSH</div>
              <Code lines={LEGACY_SCRIPT} at={70} perLine={6} size={25} hl={hl} hlColor={hlColor} />
            </Panel>
          </FadeUp>
          <Tag at={200} color={C.green} top={120}>claim with secret</Tag>
          <Tag at={260} color={C.amber} top={216}>refund after timeout</Tag>
        </div>
        <div style={{ position: 'absolute', left: 110, right: 110, bottom: 90, display: 'flex', gap: 24 }}>
          {[
            { at: 330, t: 'The OG protocol', s: 'Battle-tested, simple, well understood.' },
            { at: 350, t: 'A huge crowd to hide in', s: '2-of-2 multisig, like Lightning channels, is everywhere on-chain.' },
          ].map((c) => (
            <FadeUp key={c.t} at={c.at} style={{ flex: 1 }}>
              <Panel accent={C.amber} style={{ padding: '22px 30px' }}>
                <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 32, color: C.amber }}>{c.t}</div>
                <Body size={24}>{c.s}</Body>
              </Panel>
            </FadeUp>
          ))}
        </div>
      </Backdrop>
    </Scene>
  );
};

export const Better: React.FC<D> = ({ duration }) => {
  const frame = useCurrentFrame();
  const glow = useBeat();
  return (
    <Scene duration={duration} out={6}>
      <Backdrop accent={C.violet} grid={0.4}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Decode text="BUT…" at={2} speed={0.5} style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 170, color: C.fg, letterSpacing: '0.1em' }} />
          <div style={{ opacity: frame >= 34 ? 1 : 0, marginTop: 10 }}>
            <Decode text="we can do better." at={34} speed={1.2} style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 84, color: C.violet, textShadow: `0 0 ${24 + glow * 30}px ${C.violet}` }} />
          </div>
        </AbsoluteFill>
      </Backdrop>
    </Scene>
  );
};

const LeafCode: React.FC<{ lines: ReturnType<typeof op>[][]; at: number }> = ({ lines, at }) => <Code lines={lines} at={at} perLine={4} size={16} />;

export const Taproot: React.FC<D> = ({ duration }) => {
  const frame = useCurrentFrame();
  const tree = (at: number) => interpolate(frame, [at, at + 22], [0, 1], { ...clamp, easing: easeInOut });
  const keyLit = useProgress(150, 14);
  const fees = useProgress(250, 20);
  const left1 = 1 - fees;
  const legacyW = interpolate(frame, [280, 316], [0, 150 * 2.9], { ...clamp, easing: easeInOut });
  const tapW = interpolate(frame, [300, 336], [0, 112 * 2.9], { ...clamp, easing: easeInOut });
  // Tree layout
  const R = { x: 1360, y: 210 };
  const K = { x: 1090, y: 450 };
  const S = { x: 1590, y: 450 };
  const H = { x: 1415, y: 700 };
  const L = { x: 1745, y: 700 };
  const node = (pt: { x: number; y: number }, w: number, label: string, sub: string, color: string, at: number, dim = 0) => {
    const p = tree(at);
    return (
      <div style={{ position: 'absolute', left: pt.x - w / 2, top: pt.y - 50, width: w, opacity: p * (1 - dim * 0.55), transform: `scale(${0.9 + 0.1 * p})` }}>
        <Panel accent={color} glow={label.startsWith('Key') ? keyLit : 0} style={{ padding: '16px 20px', textAlign: 'center', borderColor: `${color}66` }}>
          <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 24, color }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 17, color: C.muted, marginTop: 2 }}>{sub}</div>
        </Panel>
      </div>
    );
  };
  const dimScripts = keyLit;
  return (
    <Scene duration={duration}>
      <Backdrop accent={C.violet}>
        <AbsoluteFill style={{ padding: '110px 0 0 110px', width: 780 }}>
          <Kicker color={C.violet}>02 · Taproot</Kicker>
          <Title size={80} style={{ marginTop: 26 }}>Smaller.<br />Cheaper.<br />Just as safe.</Title>
          <div style={{ opacity: left1 }}>
            <Bullets
              color={C.violet}
              items={[
                { at: 30, text: 'One contract output per hop. No extra contract transaction.' },
                { at: 150, text: 'Normal swaps take the key path: one signature.' },
                { at: 190, text: 'The backup scripts stay hidden unless they are needed.' },
              ]}
            />
          </div>
        </AbsoluteFill>

        {/* Taproot tree */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <Neon d={`M ${R.x} ${R.y + 40} L ${K.x} ${K.y - 50}`} color={C.green} progress={tree(30)} width={keyLit > 0 ? 4 : 2.5} />
          <Neon d={`M ${R.x} ${R.y + 40} L ${S.x} ${S.y - 50}`} color={C.violet} progress={tree(50)} opacity={1 - dimScripts * 0.5} />
          <Neon d={`M ${S.x} ${S.y + 40} L ${H.x} ${H.y - 10}`} color={C.violet} progress={tree(80)} opacity={1 - dimScripts * 0.5} />
          <Neon d={`M ${S.x} ${S.y + 40} L ${L.x} ${L.y - 10}`} color={C.violet} progress={tree(90)} opacity={1 - dimScripts * 0.5} />
        </svg>
        {node(R, 340, 'Taproot output', 'one output per hop', C.fg, 10)}
        {node(K, 400, 'Key path', 'both sign together · MuSig2', C.green, 40)}
        {node(S, 300, 'Script tree', 'backup only', C.violet, 60, dimScripts)}
        <div style={{ position: 'absolute', left: H.x - 160, top: H.y, width: 320, opacity: tree(100) * (1 - dimScripts * 0.5) }}>
          <Panel style={{ padding: '14px 18px' }}>
            <div style={{ fontFamily: MONO, fontSize: 16, color: C.green, letterSpacing: '0.18em', marginBottom: 6 }}>HASHLOCK LEAF</div>
            <LeafCode at={110} lines={[[op('OP_SHA256'), sp, arg('<hash>')], [op('OP_EQUALVERIFY')], [key('<pubkey>'), sp, op('OP_CHECKSIG')]]} />
          </Panel>
        </div>
        <div style={{ position: 'absolute', left: L.x - 160, top: L.y, width: 320, opacity: tree(110) * (1 - dimScripts * 0.5) }}>
          <Panel style={{ padding: '14px 18px' }}>
            <div style={{ fontFamily: MONO, fontSize: 16, color: C.amber, letterSpacing: '0.18em', marginBottom: 6 }}>TIMELOCK LEAF</div>
            <LeafCode at={120} lines={[[arg('<locktime>'), sp, op('OP_CLTV')], [op('OP_DROP')], [key('<pubkey>'), sp, op('OP_CHECKSIG')]]} />
          </Panel>
        </div>

        {/* The selling point: fees */}
        <div style={{ position: 'absolute', left: 110, top: 560, width: 820, opacity: fees, transform: `translateY(${(1 - fees) * 30}px)` }}>
          <Panel accent={C.green} glow={fees} style={{ padding: '30px 36px' }}>
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 46, color: C.green }}>Taproot cuts fees.</div>
            <Body size={24} style={{ marginTop: 4 }}>Block space to claim a swap</Body>
            {[
              { l: 'Legacy', w: legacyW, v: 150, c: C.amber },
              { l: 'Taproot', w: tapW, v: 112, c: C.violet },
            ].map((b) => (
              <div key={b.l} style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 20 }}>
                <div style={{ width: 120, fontFamily: MONO, fontSize: 24, color: C.muted }}>{b.l}</div>
                <div style={{ height: 34, width: b.w, borderRadius: 8, background: b.c, boxShadow: `0 0 20px -4px ${b.c}` }} />
                <div style={{ fontFamily: NUM, fontSize: 26, color: C.fg, opacity: b.w > 10 ? 1 : 0 }}>{b.v} vB</div>
              </div>
            ))}
            <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 34, color: C.fg, marginTop: 22, opacity: useProgress(345, 12) }}>≈25% less block space → lower fees</div>
          </Panel>
        </div>
      </Backdrop>
    </Scene>
  );
};

const PAY: RingNode[] = [
  { label: 'You', sub: 'wallet', angle: -90, kind: 'wallet' },
  { label: 'Router A', sub: 'over tor', angle: 10, kind: 'router' },
  { label: 'Router B', sub: 'over tor', angle: 110, kind: 'router' },
  { label: 'Receiver', sub: 'bc1q…7x2m', angle: 210, kind: 'receiver' },
];

export const PaySwap: React.FC<D> = ({ duration }) => {
  const frame = useCurrentFrame();
  const start = 50;
  const hopLen = 78;
  const p = Math.max(0, (frame - start) / hopLen);
  const done = useProgress(start + hopLen * 3, 14);
  const sats = Math.round(250000 * interpolate(frame, [start, start + hopLen * 3], [0, 1], { ...clamp, easing: easeInOut }));
  return (
    <Scene duration={duration}>
      <Backdrop accent={C.green}>
        <AbsoluteFill style={{ padding: '110px 0 0 110px', width: 820 }}>
          <Kicker color={C.green}>03 · PaySwap</Kicker>
          <Title size={80} style={{ marginTop: 26 }}>Swap and pay<br />in one go.</Title>
          <Bullets
            color={C.green}
            items={[
              { at: 26, text: 'Send bitcoin to anyone through an OpenSwap.' },
              { at: start + hopLen * 0.8, text: 'All they need is a normal bitcoin address.' },
              { at: start + hopLen * 1.8, text: 'They receive exactly the amount you set.' },
              { at: start + hopLen * 2.8, text: 'One step, not two: no extra payment afterwards, so less fees and less waiting.' },
              { at: start + hopLen * 3.6, text: 'Works with Legacy and Taproot.' },
            ]}
          />
        </AbsoluteFill>
        <Ring cx={1340} cy={560} r={290} nodes={PAY} p={p} closed={false} frame={frame} appear={useProgress(6, 30)} />
        <div style={{ position: 'absolute', left: 1340 - 170, top: 520, width: 340, textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: '0.2em', color: C.subtle }}>{done > 0.5 ? 'RECEIVED' : 'SENDING'}</div>
          <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 46, color: done > 0.5 ? C.green : C.fg, textShadow: done > 0.5 ? `0 0 20px ${C.green}` : 'none' }}>
            {sats.toLocaleString('en-US')}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 20, color: C.muted }}>{done > 0.5 ? 'sats · exact ✓' : 'sats'}</div>
        </div>
      </Backdrop>
    </Scene>
  );
};

