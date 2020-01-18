import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';

export default {
	input: 'src/index.ts',
	plugins: [
		json(),
		typescript({
			tsconfig: './tsconfig.json'
		})
	],
	output: [
		{
			format: 'umd',
			name: 'Fetcher',
			file: 'build/Fetcher.js',
			sourceMap: true,
			indent: '\t',
			globals: {
				"@valeera/eventdispatcher": "EventDispatcher"
			}
		},
		{
			format: 'es',
			file: 'build/Fetcher.module.js',
			sourceMap: true,
			indent: '\t',
			globals: {
				"@valeera/eventdispatcher": "EventDispatcher"
			}
		}
	]
};
