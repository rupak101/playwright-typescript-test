# Framework Guide

How the framework is organised, the rules it follows, and how to add tests. For setup and run commands, see [README.md](README.md).

## Project structure

Specs are grouped by **product domain** under `tests/`. Everything the specs rely on lives under `support/`.

```
configs/index.ts          TEST_ENV → configs/<env>.ts (baseUrl); getCredentials() reads TEST_USERNAME/TEST_PASSWORD from .env
playwright.config.ts      testDir tests/, baseURL from config, reporters (list, html, allure, FailureReporter), output in reports/
support/
  pages/BasePage.ts       abstract parent: navigate (relative to baseURL), click, type, check, waitForUrl
  pages/PageFactory.ts    getPage(PageClass): creates and caches one instance per test, for any class extending BasePage
  pages/*Page.ts          static PATH, readonly locators, user-level actions
  fixtures/test.ts        testPages = baseTest.extend: page override (failure diagnostics), pageFactory, one fixture per page
  data/testData.ts        test inputs: PRODUCTS, INVALID_LOGIN_CASES
  constants/messages.ts   UI text asserted on: LOGIN_ERRORS
  helpers/allure.ts       allureLabels(), attachScreenshot()
  reporters/FailureReporter.ts   reports/failure.json: failures grouped by first error line, with rerun commands
  scripts/run.ts          maps chromium|firefox|webkit|all to Playwright projects
tests/
  login/                  validLogin.spec.ts, invalidLogin.spec.ts
  shop/                   catalogue.spec.ts
```

### Where new code goes

| You are adding…                  | Put it in                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------- |
| Locators and actions for a page  | `support/pages/<Name>Page.ts`                                                     |
| Test inputs (data for a test)    | `support/data/`                                                                   |
| Expected UI text (messages)      | `support/constants/`                                                              |
| A helper shared by several specs | `support/helpers/` (search for an existing one first)                             |
| Environment values (URLs)        | `configs/<env>.ts`                                                                |
| Secrets (usernames, passwords)   | `.env` locally (add an empty entry to `.env.example`), CI secrets in the pipeline |
| A spec                           | `tests/<domain>/<name>.spec.ts`                                                   |

## Page objects

- Every page extends `BasePage` and has a `static readonly PATH`, relative to `baseURL`. Never hard-code full URLs; assertions use `config.baseUrl`.
- Locators are `readonly` fields set in the constructor, taken from the live page. Prefer `id`, then role or `data-*`, then text filters, then CSS class. Avoid absolute XPath, unexplained `nth()` and Angular `_ngcontent-*` attributes.
- Methods describe user actions (`login`, `waitForShopPage`). **They never assert.** ESLint blocks `expect` in `support/pages/`.
- Every page is registered as a fixture in `support/fixtures/test.ts`, created through `pageFactory.getPage(<Name>Page)`. Specs receive it as a parameter (`{ loginPage, shopPage }`) and never call `pageFactory` or `new` themselves.

## Writing a test

If the test needs a new page:

1. Create `support/pages/<Name>Page.ts` as described above.
2. Register it in `support/fixtures/test.ts`: import it, add it to the `Pages` type, and add a fixture:
   `<name>Page: async ({ pageFactory }, use) => { await use(pageFactory.getPage(<Name>Page)); }`.
3. Use it in a spec as a fixture parameter. If step 2 is missed, `npm run typecheck` fails.

Then add the spec as `tests/<domain>/<name>.spec.ts`:

```ts
import { test, expect } from '@/support/fixtures/test';

test.describe('Shop catalogue', { tag: ['@shop', '@regression'] }, () => {
  test('lists "iphone X"', async ({ shopPage }) => {
    await expect(shopPage.getProduct('iphone X')).toBeVisible();
  });
});
```

- Import `test`/`expect` from `@/support/fixtures/test`, never from `@playwright/test`.
- Take page objects as fixture parameters (`{ loginPage, shopPage }`).
- Keep assertions in specs, using web-first assertions (`toBeVisible`, `toHaveText`, `toHaveURL`) and real waits (`waitForURL`, `locator.waitFor`).
- **No conditionals in tests.** Split them into separate tests or table rows.
- For data variations, loop over a table in `support/data/` (expected text in `support/constants/`) instead of copying test blocks.
- Wrap business steps in `test.step(...)` so they show as named steps in Allure.
- Read credentials through `getCredentials()`.

## Tags

Use Playwright's `tag` option, so `--grep` and Allure both pick them up. Put shared tags on the `describe` and distinguishing ones on the `test`:

| Dimension | Examples                 |
| --------- | ------------------------ |
| Suite     | `@smoke`, `@regression`  |
| Domain    | `@login`, `@shop`        |
| Variant   | `@positive`, `@negative` |

```bash
npm test -- -g @smoke
npm test -- -g "@login.*@negative"
```

## Failure diagnostics

The `page` fixture in `support/fixtures/test.ts` wraps Playwright's built-in page. While a test runs, it records
requests to the site that failed or returned 4xx/5xx, plus browser console errors and uncaught page exceptions.
If the test fails, both lists are attached to the Playwright and Allure reports next to the screenshot, video and
trace. Nothing is attached for passing tests, and requests to other domains (analytics, ads) are ignored.

## Quality checks

`npm run check` runs all three, and CI runs it before the tests:

| Command                | Enforces                                                |
| ---------------------- | ------------------------------------------------------- |
| `npm run format:check` | Prettier formatting (`npm run format` fixes it)         |
| `npm run lint:check`   | ESLint with Playwright rules, **zero warnings allowed** |
| `npm run typecheck`    | `tsc --noEmit` in strict mode                           |

ESLint treats these as errors:

- fixed waits (`waitForTimeout`, `waitForSelector`, `networkidle`)
- `force: true`, element handles and `page.pause()`
- conditionals in tests
- un-awaited Playwright calls
- `test.only`
- `expect` in page objects, and importing `test` from `@playwright/test` in specs

Don't raise `--max-warnings` above 0 to get a change through. A pre-commit hook runs Prettier and ESLint on staged files.

## Before you open a PR

1. Run the tests you added or changed and make sure they pass: `npm test -- tests/<domain>/`.
2. Run `npm run check`.
3. Don't commit `.env` or anything in `reports/`.
