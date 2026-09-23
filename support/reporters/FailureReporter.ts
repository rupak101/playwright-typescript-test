import fs from 'fs';
import path from 'path';
import type { FullResult, Reporter, Suite, TestCase } from '@playwright/test/reporter';

type FailedTest = { title: string; project: string; location: string; rerun: string };

const OUTPUT_FILE = path.join('reports', 'failure.json');
// Strips terminal colour codes from Playwright error messages.
// eslint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;]*m/g;

// Writes reports/failure.json: failures grouped by the first line of the error, each with a rerun command.
export default class FailureReporter implements Reporter {
  private rootSuite?: Suite;

  onBegin(_config: unknown, suite: Suite) {
    this.rootSuite = suite;
  }

  onEnd(_result: FullResult) {
    const groups = new Map<string, FailedTest[]>();

    for (const test of this.rootSuite?.allTests() ?? []) {
      if (test.outcome() !== 'unexpected') continue;
      const reason = this.firstErrorLine(test);
      const project = test.parent.project()?.name ?? '';
      const location = `${path.relative(process.cwd(), test.location.file)}:${test.location.line}`;
      const entry = { title: test.titlePath().slice(3).join(' › '), project, location, rerun: '' };
      entry.rerun = `npx playwright test ${location}${project ? ` --project=${project}` : ''}`;
      groups.set(reason, [...(groups.get(reason) ?? []), entry]);
    }

    const failures = [...groups].map(([reason, tests]) => ({
      reason,
      totalTestsFailedWithThisReason: tests.length,
      tests,
    }));
    const report = {
      totalFailedTests: failures.reduce((sum, f) => sum + f.totalTestsFailedWithThisReason, 0),
      totalUniqueFailures: failures.length,
      failures,
    };

    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
  }

  private firstErrorLine(test: TestCase): string {
    const lastResult = test.results[test.results.length - 1];
    const message = lastResult?.error?.message ?? lastResult?.status ?? 'unknown';
    return message.replace(ANSI, '').split('\n')[0].trim();
  }

  printsToStdio() {
    return false;
  }
}
