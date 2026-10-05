import React from 'react';
import { Composition } from 'remotion';
import { OpenSwapVideo, DURATION } from './Video';
import { T } from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="OpenSwapV023" component={OpenSwapVideo} durationInFrames={DURATION} fps={T.fps} width={T.width} height={T.height} />
);
