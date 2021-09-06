import path from 'path';

import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

import pkg from './package.json';

const resolve = fp => path.resolve(__dirname, fp);

const inputFileName = 'lib/index.ts';
const moduleName = pkg.name.replace(/^@.*\//, '');
const author = pkg.author;
const banner = `
  /**
   * @license
   * author: ${author}
   * ${moduleName}.js v${pkg.version}
   * Released under the ${pkg.license} license.
   */
`;

export default [
  {
    /* CommonJS */
    input: inputFileName,
    output: {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
			banner
    },
		external: [
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.devDependencies || {}),
		],
    plugins: [
			typescript(),
			nodeResolve({
				jsnext: true,
				browser: true,
			}),
      commonjs({
        extensions: ['.js', '.ts'],
      }),

      babel({
				babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
          [
            '@babel/env',
            {
              modules: false,
              useBuiltIns: 'usage',
              targets: 'maintained node versions'
            }
          ]
        ]
      })
    ]
  },
  {
    /* UMD */
    input: inputFileName,
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'vivisector',
			banner
    },
    plugins: [
			typescript(),
      nodeResolve({
				jsnext: true,
				browser: true,
			}),
      commonjs({
        extensions: ['.js', '.ts'],
      }),
			babel({
				babelHelpers: 'bundled',
				configFile: resolve('build/babel.config')
			})
    ]
  },
  {
    /* Minified UMD */
    input: inputFileName,
    output: {
      file: pkg.browser.replace(/\.js$/, '.min.js'),
      format: 'umd',
      name: 'vivisector',
			banner
    },
    plugins: [
			typescript(),
      nodeResolve({
				jsnext: true,
				browser: true,
			}),
      commonjs({
        extensions: ['.js', '.ts'],
      }),
			babel({
				babelHelpers: 'bundled',
				configFile: resolve('build/babel.config')
			}),
      terser()
    ]
  },
  {
    /* ESM */
    input: inputFileName,
    output: {
      file: pkg.module,
      format: 'es',
			exports: 'named',
			banner
    },
		external: [
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.devDependencies || {}),
		],
    plugins: [
			typescript(),
			nodeResolve({
				jsnext: true,
				browser: true,
			}),
      commonjs({
        extensions: ['.js', '.ts'],
      }),
			babel({
				babelHelpers: 'bundled',
				configFile: resolve('build/babel.config')
			})
    ]
  }
];
