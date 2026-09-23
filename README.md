# Playwright UI Automation

UI tests for [rahulshettyacademy.com](https://rahulshettyacademy.com), written in **Playwright + TypeScript** using the Page Object Model.

## What is covered

| Spec                         | Scenarios                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `login/validLogin.spec.ts`   | Valid login lands on `/angularpractice/shop` and shows **iphone X** (`@smoke`)        |
| `login/invalidLogin.spec.ts` | Wrong password, unknown user and empty fields each show the right error (data-driven) |
| `shop/catalogue.spec.ts`     | Shop lists each expected product, and exactly those products (data-driven)            |

## Tech stack

- Playwright Test (Chromium by default; Firefox and WebKit available)
- TypeScript (strict mode)
- Allure reporting, plus Playwright's HTML report and a custom failure summary
- ESLint (with `eslint-plugin-playwright`), Prettier, Husky and lint-staged
- Docker and GitHub Actions

## Project structure

```
configs/                    environment config (base URL), credentials read from .env
support/
  pages/                    BasePage (shared actions), PageFactory, one class per page
  fixtures/test.ts          page objects as fixtures, plus failure diagnostics on the page fixture
  data/testData.ts          test inputs: products, invalid-login cases
  constants/messages.ts     UI text the tests assert on
  helpers/                  Allure labels, failure diagnostics
  reporters/                FailureReporter → reports/failure.json
  scripts/run.ts            picks the browser project for npm test
tests/
  login/                    valid and invalid login
  shop/                     product catalogue
```

See [FRAMEWORK_GUIDE.md](FRAMEWORK_GUIDE.md) for where new code goes and how to add a test.

## Setup

Requires Node.js 18+ and Java 8+ (Java is only needed to build the Allure report).

```bash
npm install
npx playwright install chromium
cp .env.example .env          # add TEST_USERNAME and TEST_PASSWORD
```

## How to run

```bash
npm test                      # Chromium, headless
npm run test:headed           # visible browser
npm run test:smoke            # @smoke tests only
npm run test:all-browsers     # Chromium, Firefox, WebKit (run `npx playwright install` first)
npm test -- -g @negative      # any Playwright args pass through
```

## Reports

```bash
npm run test:allure           # run tests and build reports/allure-report
npm run allure:open           # open the Allure report
npm run report:html           # open the Playwright HTML report
```

All output goes to `reports/`. `reports/failure.json` groups failed tests by their first error line, with a
rerun command for each test. On failure, a screenshot, video and trace are kept in `reports/test-results/`.

## Quality checks

```bash
npm run check                 # format, lint (0 warnings), typecheck
```

A pre-commit hook runs Prettier and ESLint on staged files. CI (`.github/workflows/playwright.yml`) runs
`check` and the tests, then uploads the reports.

## Design decisions

- **Page objects as fixtures.** Specs get `loginPage` and `shopPage` from the fixture, which uses a `PageFactory`
  to create them once per test. Every page extends `BasePage`.
- **Assertions only in specs.** ESLint blocks `expect` in page objects, and blocks importing `test` from
  `@playwright/test` in specs.
- **No fixed waits.** Tests use web-first assertions and `waitForURL`. `waitForTimeout` is a lint error.
- **Data-driven tests.** Products and login error cases each run as one test looped over a table (data in
  `support/data/`), not as copy-pasted test blocks.
- **Failure diagnostics.** When a test fails, the `page` fixture attaches the site's failed network requests
  (4xx/5xx or network errors) and browser console errors to the Playwright and Allure reports, next to the
  screenshot, video and trace. Passing tests stay clean, and third-party noise such as analytics is filtered out.
- **No secrets in code.** Credentials come from `.env` (git-ignored) or CI secrets.
- **Tags** (`@smoke`, `@regression`, `@negative`, …) use Playwright's `tag` option, so `--grep` and Allure both pick
  them up.

## AI-assisted workflow

The repo is set up for [Claude Code](https://claude.com/claude-code):

- **`CLAUDE.md`** gives the agent the architecture and the do's and don'ts, so generated code follows the framework.
- **`/add-test <scenario>`** (`.claude/commands/add-test.md`) is the workflow used to build these tests: explore the
  flow in a real browser to get real locators, reuse or add page objects, write the spec, then run `npm run check` and
  the test until both pass. This is how the changed password was caught before any test code was written.
- **`.claude/settings.json`** pre-approves the test and quality commands, blocks the agent from reading `.env`, and
  runs Prettier on every file the agent edits.

The guardrails don't depend on the agent. ESLint, the type-check and the tests reject generated code that breaks the
framework's rules, the same way they would for code written by hand.

## Note on the test data

The task specified the password `learning`, but the site now rejects it with _"Old password "learning" is no longer
valid"_ and shows the new password in the same message. The tests read the password from `.env`, so a future change
only needs a config update.

## Docker

```bash
docker build -t playwright-tests .
docker run --rm --env-file .env -v "$PWD/reports:/app/reports" playwright-tests
```
