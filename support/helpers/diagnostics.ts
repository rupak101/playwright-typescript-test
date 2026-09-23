import type { Page, TestInfo } from '@playwright/test';

type FailedRequest = { method: string; url: string; status?: number; error?: string };
type ConsoleError = { source: 'console' | 'pageerror'; text: string; url?: string };

// Collects requests to the site under test that failed at the network level or returned HTTP 4xx/5xx.
// Third-party calls (analytics, ads) are ignored so the report shows only what matters for debugging.
export function collectFailedRequests(page: Page, baseURL?: string): FailedRequest[] {
  const failed: FailedRequest[] = [];
  const siteHost = baseURL ? new URL(baseURL).hostname : undefined;
  const isSiteRequest = (url: string) => !siteHost || new URL(url).hostname.endsWith(siteHost);

  page.on('requestfailed', (request) => {
    if (!isSiteRequest(request.url())) return;
    failed.push({ method: request.method(), url: request.url(), error: request.failure()?.errorText });
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && isSiteRequest(response.url())) {
      failed.push({ method: response.request().method(), url: response.url(), status: response.status() });
    }
  });
  return failed;
}

// Collects console.error output and uncaught exceptions thrown by the page.
export function collectConsoleErrors(page: Page): ConsoleError[] {
  const errors: ConsoleError[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push({ source: 'console', text: message.text(), url: message.location().url });
    }
  });
  page.on('pageerror', (error) => {
    errors.push({ source: 'pageerror', text: error.message });
  });
  return errors;
}

// Attaches what was collected, but only when the test did not end as expected, so passing runs stay clean.
export async function attachDiagnosticsOnFailure(
  testInfo: TestInfo,
  failedRequests: FailedRequest[],
  consoleErrors: ConsoleError[],
) {
  if (testInfo.status === testInfo.expectedStatus) return;

  if (failedRequests.length > 0) {
    await testInfo.attach('Failed network requests', {
      body: JSON.stringify(failedRequests, null, 2),
      contentType: 'application/json',
    });
  }
  if (consoleErrors.length > 0) {
    await testInfo.attach('Console errors', {
      body: JSON.stringify(consoleErrors, null, 2),
      contentType: 'application/json',
    });
  }
}
