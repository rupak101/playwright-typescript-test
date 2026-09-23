# Framework Guide

How the framework is organised, and how to add and maintain tests in it. For setup and run commands, see [README.md](README.md).

## Project structure

Specs are grouped by **product domain** under `tests/`. Everything the specs rely on lives under `support/`.

```
configs/                  environment config (TEST_ENV → configs/<env>.ts) and getCredentials()
support/
  pages/                  BasePage, PageFactory and one page object per page
  fixtures/test.ts        exposes every page object as a fixture; specs import { test, expect } from here
  data/                   test inputs (products, invalid-login cases)
  constants/              UI text the tests assert on (error messages)
  helpers/                reusable helpers (Allure labels, failure diagnostics)
  reporters/              custom Playwright reporters (FailureReporter → reports/failure.json)
  scripts/run.ts          picks the browser project for npm test
tests/
  login/                  validLogin.spec.ts, invalidLogin.spec.ts
  shop/                   catalogue.spec.ts
```

### Where new code goes

| You are adding…                  | Put it in                                  |
| -------------------------------- | ------------------------------------------ |
| Locators and actions for a page  | `support/pages/<Name>Page.ts`              |
| Test inputs (data for a test)    | `support/data/`                            |
| Expected UI text (messages)      | `support/constants/`                       |
| A helper shared by several specs | `support/helpers/`                         |
| Environment values (URLs)        | `configs/<env>.ts`                         |
| Secrets (usernames, passwords)   | `.env` locally, CI secrets in the pipeline |
| A spec                           | `tests/<domain>/<name>.spec.ts`            |

Before adding a helper, search `support/` for one that already does the job.

## Writing a new test

If the test needs a new page:

1. Create `support/pages/<Name>Page.ts` extending `BasePage`, with a `PATH` and locators from the live page.
2. Register it in `support/fixtures/test.ts`: import it, add it to the `Pages` type, and add a fixture that
   returns `pageFactory.getPage(<Name>Page)`.
3. Use it in a spec as a fixture parameter. If step 2 is missed, `npm run typecheck` fails.

Then add the spec as `tests/<domain>/<name>.spec.ts`. A spec looks like this:

```ts
import { test, expect } from '@/support/fixtures/test';

test.describe('Shop catalogue', { tag: ['@shop', '@regression'] }, () => {
  test('lists "iphone X"', async ({ shopPage }) => {
    await expect(shopPage.getProduct('iphone X')).toBeVisible();
  });
});
```

- Import `test`/`expect` from `@/support/fixtures/test`, never from `@playwright/test`.
- Take page objects as fixture parameters (`{ loginPage, shopPage }`). Don't create them with `new`.
- For data variations, loop over a table in `support/data/` instead of copying test blocks.
- Wrap business steps in `test.step(...)` so they show as named steps in Allure.

## The page object pattern

1. Each page extends `BasePage` and has a `static readonly PATH` (relative, resolved against `baseURL`).
2. Locators are `readonly` fields set in the constructor. Take them from the live page, preferring `id`, then role or `data-*`, then text, then CSS class.
3. Methods describe user actions (`login`, `waitForShopPage`). **They never assert.** ESLint blocks `expect` in `support/pages/`.
4. Each page is registered in `support/fixtures/test.ts`.

## Failure diagnostics

The `page` fixture in `support/fixtures/test.ts` wraps Playwright's built-in page. While a test runs, it records
requests to the site that failed or returned 4xx/5xx, plus browser console errors and uncaught page exceptions.
If the test fails, both lists are attached to the report next to the screenshot, video and trace. Nothing is
attached for passing tests. The logic lives in `support/helpers/diagnostics.ts`.

## Tags

Put tags in Playwright's `tag` option. Put shared tags on the `describe` and distinguishing ones on the `test`:

| Dimension | Examples                 |
| --------- | ------------------------ |
| Suite     | `@smoke`, `@regression`  |
| Domain    | `@login`, `@shop`        |
| Variant   | `@positive`, `@negative` |

```bash
npm test -- -g @smoke
npm test -- -g "@login.*@negative"
```

## Quality checks

```bash
npm run check
```

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

A pre-commit hook runs Prettier and ESLint on staged files.

## Before you open a PR

1. Run the tests you added or changed, and make sure they pass: `npm test -- tests/<domain>/`.
2. Run `npm run check`.
3. Reuse existing page objects and helpers instead of duplicating them.
