import * as React from 'react';
import styled, { css, keyframes } from 'styled-components';

import { IDevToolListener } from './types';
import Field from './Field';
import {
  formatDuration,
  PlayStateType,
  getPlayStateSingle,
  playStateColors,
} from './utils';

const percentageSkippedIterations = (iterations: number, skipped: number) => {
  const total = iterations + skipped;
  if (total === 0) {
    return 0;
  }
  return ((skipped / total) * 100).toFixed(1);
};

const highlight = (color: string) => keyframes`
  from {
    background: ${color};
  }
`;

const highlights = {
  good: highlight(playStateColors.good),
  okay: highlight(playStateColors.okay),
  bad: highlight(playStateColors.bad),
};

const Wrapper = styled.tr<{ playState: PlayStateType; odd?: boolean }>`
  padding: 0;
  ${({ playState }: { playState: PlayStateType }) =>
    playState !== null &&
    css`
      animation: ${highlights[playState]} 0.7s linear 1;
    `}
  ${({ odd }: { odd?: boolean }) =>
    !odd &&
    css`
      background: #f1f1f1;
    `}
`;

interface IProps extends IDevToolListener {
  odd?: boolean;
}

const useShouldPlay = (
  props: IProps,
  ref: React.RefObject<HTMLTableRowElement>,
): PlayStateType => {
  const [playState, setPlaying] = React.useState<PlayStateType>(null);
  React.useEffect(() => {
    const reset = () => setPlaying(null);
    setPlaying(getPlayStateSingle(props.lastExecutionCost));
    if (ref.current) {
      ref.current.addEventListener('animationend', reset);
    }
    return () => {
      if (ref.current) {
        ref.current.removeEventListener('animationend', reset);
      }
    };
  }, [props.iterations]);
  return playState;
};

const Cell = (props: IProps) => {
  const ref = React.createRef<HTMLTableRowElement>();
  const playState = useShouldPlay(props, ref);
  const name = props.displayName || props.type || 'unknown';
  return (
    <Wrapper key={props.id} ref={ref} odd={props.odd} playState={playState}>
      <Field>{props.id}</Field>
      <Field>{name}</Field>
      <Field>
        {props.iterations} /{' '}
        {percentageSkippedIterations(
          props.iterations,
          props.totalSkippedIterations,
        )}
        %
      </Field>
      <Field>{formatDuration(props.averageExecutionCost)}</Field>
      <Field>{formatDuration(props.averageLayoutCost)}</Field>
      <Field>{props.priority}</Field>
    </Wrapper>
  );
};

export default Cell;
