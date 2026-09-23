# Playwright UI Automation

UI tests for [rahulshettyacademy.com](https://rahulshettyacademy.com), written in **Playwright + TypeScript** using the Page Object Model.

For how the framework is built, its rules, and how to add a test, see [FRAMEWORK_GUIDE.md](FRAMEWORK_GUIDE.md).

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

## Setup

Requires Node.js 22.22.1 or newer (`.nvmrc` pins major version 22) and Java 8+ (Java is only needed to build the Allure report).

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
npm run test:firefox          # or test:webkit
npm run test:all-browsers     # Chromium, Firefox, WebKit (run `npx playwright install` first)
npm test -- -g @negative      # any Playwright args pass through
npm run check                 # format, lint (0 warnings), typecheck
```

## Reports

```bash
npm run test:allure           # run tests and build reports/allure-report
npm run allure:open           # open the Allure report
npm run report:html           # open the Playwright HTML report
```

All output goes to `reports/` (git-ignored). When a test fails, the reports include a screenshot, video, trace,
the site's failed network requests (4xx/5xx) and browser console errors. `reports/failure.json` groups failed
tests by their first error line, with a rerun command for each.

## CI and Docker

CI (`.github/workflows/playwright.yml`) runs `npm run check` and the tests, then uploads the reports. It needs the
repository secrets `TEST_USERNAME` and `TEST_PASSWORD`.

```bash
docker build -t playwright-tests .
docker run --rm --env-file .env -v "$PWD/reports:/app/reports" playwright-tests
```

## AI-assisted workflow

The repo is set up for [Claude Code](https://claude.com/claude-code):

- **`CLAUDE.md`** loads the framework guide into the agent's context, so generated code follows the same rules.
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
