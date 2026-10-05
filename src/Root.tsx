import React from 'react';
import { Composition } from 'remotion';
import { Cut, DURATION, OpenSwapVideo, SCENES } from './Video';
import { SectionName, sectionFrames, T } from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="OpenSwapMaster" component={OpenSwapVideo} durationInFrames={DURATION} fps={T.fps} width={T.width} height={T.height} />
    <Composition id="OpenSwapNarrated" component={OpenSwapVideo} defaultProps={{ narrated: true }} durationInFrames={DURATION} fps={T.fps} width={T.width} height={T.height} />
    {(Object.keys(SCENES) as SectionName[]).map((name) => (
      <Composition
        key={name}
        id={`Cut-${name}`}
        component={Cut}
        defaultProps={{ name }}
        durationInFrames={sectionFrames(name).duration}
        fps={T.fps}
        width={T.width}
        height={T.height}
      />
    ))}
  </>
);
