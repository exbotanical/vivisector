import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

import babelrc from './build/babel.config'; // must import, as base babelrc is needed by jest

import pkg from './package.json';

export default [
  {
    /* CommonJS */
    input: 'lib/index.js',
    output: {
      file: pkg.main,
      format: 'cjs'
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
        babelrc: false, // override browserslistrc
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
    input: 'lib/index.js',
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'Vx'
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        ...babelrc
      })
    ]
  },
  {
    /* Minified UMD */
    input: 'lib/index.js',
    output: {
      file: pkg.browser.replace(/\.js$/, '.min.js'),
      format: 'umd',
      name: 'Vx'
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        ...babelrc
      }),
      terser()
    ]
  },
  {
    /* ESM */
    input: 'lib/index.js',
    output: {
      file: pkg.module,
      format: 'es'
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        ...babelrc
      })
    ]
  }
];
