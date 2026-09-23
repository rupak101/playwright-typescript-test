---
description: Explore a flow in the browser, then add a page-object test that follows this framework
argument-hint: <steps or scenario to automate>
---

Automate this scenario: $ARGUMENTS

Follow CLAUDE.md and FRAMEWORK_GUIDE.md. Work in this order:

1. **Explore first.** Walk through the flow in a real browser (a short Playwright script in a scratch location is fine).
   Record the real locators, the URLs you land on, and the exact UI text you will assert on. Never guess a locator.
   If the site behaves differently from the steps (e.g. changed credentials or messages), stop and report it.
2. **Reuse before adding.** Check `support/pages/`, `support/data/`, `support/constants/` and `support/helpers/` for what already exists.
3. **Page objects.** For each new page, create `support/pages/<Name>Page.ts` extending `BasePage`, with a relative
   `PATH`, `readonly` locators and user-level actions. No assertions in page objects. Register it in
   `support/fixtures/test.ts`.
4. **Spec.** Add `tests/<domain>/<name>.spec.ts`. Import `{ test, expect }` from `@/support/fixtures/test`, take pages as
   fixtures, use `test.step` for business steps, add tags with the `tag` option, and add `allureLabels()`.
   Put test inputs in `support/data/` and expected UI text in `support/constants/`, and use a table-driven loop for variations.
5. **Secrets.** Read credentials through `getCredentials()`. If a new secret is needed, add it to `.env.example` with an
   empty value. Never write real secrets into code.
6. **Verify.** Run `npm run check` and `npx playwright test tests/<domain>/<name>.spec.ts`. Fix anything that fails and
   rerun until both pass.
7. **Report.** Summarise the files you added, the locators you used and why, the test results, and anything about
   the site that differed from the requested steps.
