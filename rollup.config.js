import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import pkg from './package.json';

export default {
  input: 'lib/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    replace({
      __VERSION__: pkg.version,
    }),
    typescript({
      typescript: require('typescript'),
    }),
  ],
};
