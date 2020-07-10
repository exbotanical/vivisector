# Contribution Guidelines and Local Development

This document outlines everything you need to know to contribute to *Vivisector*.

## Installation and Local Dev Setup
Clone or fork the repository; you'll need several files that are not included in the NPM package.

Run `npm install` to grab all the dev deps. The entire repo is configured for you and should work straight away. 

If you're running an old version of Node (and don't feel like upgrading), you can use `nvm` or install necessary Babel plugins.

## Scripts
  - `test` Run Jest test suites.
  - `coverage` Run Jest coverage. Creates coverage output for assessment if exit status is *not* 0.
  - `coveralls` For automated testing. Ignore.
  - `testmon` Run Jest in monitored / watch mode.
  - `repl` Maintainer local dev script. Ignore.
  - `lint` Runs Eslint config.
  - `build` Transpile entire source.
  - `clean` Remove all build and/or coverage artifacts.

## Best Practices and Formatting

If you are contributing to *Vivisector*, please use the `.editorconfig` and `eslintrc` configs included in the repository. The general workflow *before* submitting a PR should look like this:
  1. Run linter via `npm run lint`
  2. Run tests via `npm run coverage`
  3. IF everything is passing, submit PR

Code coverage thresholds must be maintained; this necessitates tests. If you are extending functionality, you'll need to submit tests as well. Note we run the linter on the test suites, too.

## Processes

PRs need to be correlated to an issue. If you're submitting a PR, it should be coupled with the issue it resolves. If a new feature is being added, an issue should have been filed outlining the purpose of that new feature. 

If you have submitted a PR for which there is no issue (for whatever reason), simply file one and reference it so your PR can be reviewed. This may seem arbitrary at times, but it helps me keep record of the development process and changelog. 

# TL;DR
1. Fork + Clone repo
2. Install dependencies: `npm install` 
3. Checkout a feature branch: `git checkout -b <issue number>-<concise but descriptive feature name>` *e.g. `git checkout -b 27-fix-tests`*
4. Write your code (and tests, if applicable)
5. Run linter: `npm run lint`
6. Run tests: `npm run coverage`
7. Commit and push changes; make a PR against master branch