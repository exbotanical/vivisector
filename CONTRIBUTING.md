# Contribution and Local Development Guidelines

This document outlines everything you need to know to contribute to *Vivisector*.

## Installation and Local Dev Setup
Clone or fork the repository; you'll need several files that are not included in the NPM package.

Run `npm install` to grab all the dev deps. The entire repo is configured for you and should work straight away. 

If you're running an old version of Node (and don't feel like upgrading), you can use `nvm` or install the necessary Babel plugins.

## Scripts
### Dev Scripts (good to know)
  - `test` Run Jest test suites.
  - `coverage` Run Jest coverage. Creates coverage output for assessment if exit status is *not* 0.
  - `testmon` Run Jest in monitored / watch mode. Useful for developing new tests.
  - `lint` Runs Eslint config.

### Maintainer Scripts (ignore)
  - `coveralls` For automated coverage reporting.
  - `build` Transpile entire source.
  - `clean` Remove all build and/or coverage artifacts.
  - `prerelease` Used to locally assess what release will look like w/out publishing.
  - `semantic-release` Handles automated SemVersioning.

## Best Practices and Formatting
If you are contributing to *Vivisector*, please use the configs included in the remote repository. The general workflow *before* submitting a PR should look like this:
  1. Run linter via `npm run lint`
  2. Run tests via `npm run coverage`
  3. IF everything is passing, submit PR

There's a pre-push hook that runs the linter and tests for you. You can disable this if you wish, but the linter and tests need to be passing before you push your code up. How you do this is up to you.

Code coverage thresholds must be maintained; this necessitates tests. If you are extending functionality, you'll need to submit tests as well. Note we run the linter on the test suites, too.

## Processes

### Commits

We use `Husky` to manage commits. This repo is preconfigured with a hook that runs on all commits. This hook will take you through *commitizen's* brief prompt to ensure your commit message is properly formatted. *This process is imperative, as our release schedule and Changelog are automated using metadata from commits.*

If you haven't used *commitizen* before, don't fret! The aforementioned 'prompt' is interactive; it will give you a few choices to select from and build your commit message for you. 

If you're not a fan of these prompts: well, we all like to flex our Vim/Emacs/<your-preferred-text-editor> skills, but using these prompts ensures uniformity across our version control. Please be mindful of this, and don't hesitate to *ask* if you aren't sure how to label your commits.

Generally, we do our best to adhere to the [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0-beta.4/).

### Pull Requests

PRs need to be correlated to an issue. If you're submitting a PR, it should be coupled with the issue it resolves. 

If a new feature is being added, an issue should have been filed outlining the purpose of that new feature. 

Our *commitizen* configuration anticipates that you will note the issue number in the commit message, e.g. `Closes #11`. Again, the prompt will ask you to complete such a field.

If you are about to submit a PR for which there is no issue (for whatever reason), simply file one and reference it so your PR can be reviewed. This may seem arbitrary at times, but it helps us keep better record of the development process.

### Comments and Code Documentation

We encourage you write comments liberally, insofar as your commentary is effectual and relevant. They'll be stripped from the actual transpiled build released on NPM anyway, so they're there for your fellow developers - use them!

If using Visual Studio Code, we highly recommend that you install the `Code Spell Checker` extension, else something comparable. All we ask on this front is that you do your due diligence to ensure comments are comprehensible.


Code documentation is pretty important here. We use a JSDocs format, albeit liberally. Constructors, modules, et al should be preceded by a JSDocs style comment block that provides a summary and any params/return values, if applicable.

# TL;DR
1. Fork + Clone repo
2. Install dependencies: `npm install` 
3. Checkout a feature branch: `git checkout -b <issue number>-<concise but descriptive feature name>` *e.g. `git checkout -b 27-fix-tests`*
4. Write your code (and tests, if applicable)
5. Commit + push changes; open a PR against master branch. Pre-push hook will run linter/tests.