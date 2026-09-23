import { spawnSync } from 'child_process';

// Usage: tsx support/scripts/run.ts <chromium|firefox|webkit|all> [extra playwright args...]
const browserMap: Record<string, string[]> = {
  chromium: ['chromium'],
  firefox: ['firefox'],
  webkit: ['webkit'],
  all: ['chromium', 'firefox', 'webkit'],
};

const [browserArg = 'chromium', ...passthrough] = process.argv.slice(2);
const projects = browserMap[browserArg];
if (!projects) {
  console.error(`Unknown browser "${browserArg}". Choose one of: ${Object.keys(browserMap).join(', ')}`);
  process.exit(1);
}

const args = ['playwright', 'test', ...projects.map((p) => `--project=${p}`), ...passthrough];
const result = spawnSync('npx', args, { stdio: 'inherit' });
process.exit(result.status ?? 1);
