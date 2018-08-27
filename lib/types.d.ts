declare module 'shallowequal' {
  const shallowequal: (a: any, b: any) => boolean;
  export default shallowequal;
}

declare module 'raf' {
  const raf: {
    (tick: Function): NodeJS.Timer;
    cancel: (id: NodeJS.Timer) => void;
  };

  export default raf;
}
