# CLAUDE.md

Playwright + TypeScript UI automation for https://rahulshettyacademy.com, built on the Page Object Model. Setup and run instructions are in README.md.

## Commands

- `npm test`: Chromium, headless (`support/scripts/run.ts` picks the browser project; extra args pass through)
- `npm run test:headed` / `test:smoke` / `test:all-browsers`
- `npm run test:allure` then `npm run allure:open`: Allure report in `reports/allure-report`
- `npm run check`: format:check → lint:check (0 warnings) → typecheck. Run it before calling a change done.

## Working in this repo

- Get locators from the live page before writing a page object (`/add-test` does this).
- Follow the structure and rules in the framework guide below; most are enforced by ESLint.

@FRAMEWORK_GUIDE.md
