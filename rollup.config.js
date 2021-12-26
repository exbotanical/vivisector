import path from 'path';

import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve'; // eslint-disable-line import/namespace
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const resolve = (fp) => path.resolve(__dirname, fp);

const inputFileName = 'src/index.ts';
const moduleName = pkg.name.replace(/^@.*\//, '');
const author = pkg.author;
const banner = `
/**
 * @license
 * author: ${author}
 * ${moduleName} v${pkg.version}
 * Released under the ${pkg.license} license.
 */
`;

const external = [...Object.keys(pkg.dependencies || {})];

const pluginsBase = [
	typescript({
		outputToFilesystem: false
	}),
	nodeResolve({
		browser: true,
		jsnext: true
	}),
	commonjs({
		extensions: ['.js', '.ts']
	}),
	babel({
		babelHelpers: 'bundled',
		configFile: resolve('.babelrc')
	})
];

/* Main Config */
export default [
	/* CommonJS */
	{
		external,
		input: inputFileName,
		output: {
			banner,
			exports: 'named',
			file: pkg.main,
			format: 'cjs'
		},
		plugins: [...pluginsBase]
	},

	/* UMD */
	{
		input: inputFileName,
		output: {
			banner,
			file: pkg.browser,
			format: 'umd',
			name: 'vivisector'
		},
		plugins: [...pluginsBase]
	},

	/* Minified UMD */
	{
		input: inputFileName,
		output: {
			banner,
			file: pkg.browser.replace(/\.js$/, '.min.js'),
			format: 'umd',
			name: 'vivisector'
		},
		plugins: [...pluginsBase, terser()]
	},

	/* ESM */
	{
		external,
		input: inputFileName,
		output: {
			banner,
			exports: 'named',
			file: pkg.module,
			format: 'es'
		},
		plugins: [...pluginsBase]
	},

	/* Types Declarations */
	{
		input: './.build/index.d.ts',
		output: {
			file: 'dist/vivisector.d.ts',
			format: 'es'
		},
		plugins: [dts()]
	}
];
