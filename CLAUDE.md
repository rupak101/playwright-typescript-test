# CLAUDE.md

Playwright + TypeScript UI automation for https://rahulshettyacademy.com, built on the Page Object Model with `BasePage`, `PageFactory` and page-object fixtures. See README.md for how to set up and run it.

## Commands

- `npm test`: Chromium, headless (`support/scripts/run.ts` picks the browser project; extra args pass through)
- `npm run test:headed` / `test:smoke` / `test:all-browsers`
- `npm run test:allure` then `npm run allure:open`: Allure report in `reports/allure-report`
- `npm run check`: format:check → lint:check (0 warnings) → typecheck. Run it before calling a change done.

## Architecture

```
configs/index.ts          TEST_ENV → configs/<env>.ts (baseUrl); getCredentials() reads RSA_USERNAME/RSA_PASSWORD from .env
playwright.config.ts      testDir tests/, baseURL from config, reporters (list, html, allure, FailureReporter), output in reports/
support/
  pages/BasePage.ts       abstract parent: navigate (relative to baseURL), click, type, check, waitForUrl
  pages/PageFactory.ts    getPage(PageClass): creates and caches one instance per test
  pages/*Page.ts          static PATH, readonly locators, user-level actions
  fixtures/test.ts        test.extend: page override (failure diagnostics), pageFactory, one fixture per page
  data/testData.ts        PRODUCTS, INVALID_LOGIN_CASES (test inputs)
  constants/messages.ts   LOGIN_ERRORS (UI text asserted on)
  helpers/allure.ts       allureLabels(), attachScreenshot()
  helpers/diagnostics.ts  collects failed site requests + console errors; attached only when a test fails
  reporters/FailureReporter.ts   reports/failure.json: failures grouped by first error line, with rerun commands
  scripts/run.ts          maps chromium|firefox|webkit|all to Playwright projects
tests/<domain>/*.spec.ts  login/, shop/ (one folder per product domain)
```

## Do's

- **Do** get locators from the live page before writing a page object. Prefer `id`, then role or `data-*`, then text filters, then CSS class.
- **Do** keep locators and interactions in page objects, and assertions in specs.
- **Do** extend `BasePage` for every page and register it as a fixture in `support/fixtures/test.ts`.
- **Do** import `test`/`expect` from `@/support/fixtures/test` in specs.
- **Do** use web-first assertions (`toBeVisible`, `toHaveText`, `toHaveURL`) and real waits (`waitForURL`, `locator.waitFor`).
- **Do** use table-driven loops for data variations, with test inputs in `support/data/` and expected UI text in `support/constants/`.
- **Do** tag tests with the `tag` option (`@smoke`, `@regression`, `@positive`/`@negative`, a feature tag).
- **Do** read credentials through `getCredentials()`. New secrets go in `.env.example` (with an empty value) and in CI secrets.

## Don'ts (most are enforced by ESLint)

- **Don't** import `test` from `@playwright/test` in specs, or `expect` in page objects.
- **Don't** use `waitForTimeout`, `waitForSelector`, `networkidle`, `force: true`, element handles or `page.pause()`.
- **Don't** add conditionals in tests. Split them into separate tests or table rows.
- **Don't** hard-code full URLs. Use a relative `PATH` (baseURL comes from config) or `config.baseUrl` in assertions.
- **Don't** use brittle locators: absolute XPath, unexplained `nth()`, or Angular `_ngcontent-*` attributes.
- **Don't** commit `.env` or anything in `reports/`.
- **Don't** raise `--max-warnings` above 0 to get a change through.
