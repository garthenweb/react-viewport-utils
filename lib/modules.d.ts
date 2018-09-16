declare module 'raf' {
  const raf: {
    (tick: Function): NodeJS.Timer;
    cancel: (id: NodeJS.Timer) => void;
  };
  export = raf;
}
