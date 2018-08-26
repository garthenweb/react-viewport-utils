import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

export default [
	{
		input: 'lib/index.ts',
		plugins: [
			typescript({
        jsx: true,
				typescript: require('typescript')
			})
		],
		output: {
			file: 'dist/index.js',
			format: 'umd',
			name: 'react-viewport-utils',
      sourcemap: true
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
	},
];
