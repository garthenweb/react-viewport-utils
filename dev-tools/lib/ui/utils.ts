export const formatDuration = (duration: number) => `${duration.toFixed(3)}ms`;

export type PlayStateType = 'good' | 'okay' | 'bad' | null;

export const playStateColors = {
  good: '#92ff86',
  bad: '#ff8686',
  okay: '#fcff86',
};

export const getPlayStateSingle = (duration: number): PlayStateType => {
  if (duration >= 16) {
    return 'bad';
  }
  if (duration >= 4) {
    return 'okay';
  }
  return 'good';
};

export const getPlayState = (duration: number): PlayStateType => {
  if (duration >= 32) {
    return 'bad';
  }
  if (duration >= 16) {
    return 'okay';
  }
  return 'good';
};
