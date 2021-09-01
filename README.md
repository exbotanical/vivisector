![Vivisector Logo](/documentation/vx.png)

# Vivisector | Compact observables and event-driven datatypes

[![Build Status](https://travis-ci.com/MatthewZito/vivisector.svg?branch=master)](https://travis-ci.com/MatthewZito/vivisector)
[![Coverage Status](https://coveralls.io/repos/github/MatthewZito/vivisector/badge.svg?branch=master)](https://coveralls.io/github/MatthewZito/vivisector?branch=master)
[![npm version](https://badge.fury.io/js/vivisector.svg)](https://badge.fury.io/js/vivisector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

- Vivisected objects are COPIED by value
- don't mutate state in callbacks
- batched operations are individual events e.g. push(1,2,3) is three 'add' events
- nested objects become their own proxies
