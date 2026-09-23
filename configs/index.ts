import path from 'path';
import dotenv from 'dotenv';
import staging from './staging';

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

// Add another environment by creating configs/<name>.ts and registering it here.
const environments = { staging } as const;

export type EnvName = keyof typeof environments;

const envName = (process.env.TEST_ENV ?? 'staging') as EnvName;
if (!(envName in environments)) {
  throw new Error(`Unknown TEST_ENV "${envName}". Choose one of: ${Object.keys(environments).join(', ')}`);
}

const config = environments[envName];
export default config;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

// Read lazily so commands that never log in (lint, --list) don't need a .env.
export function getCredentials() {
  return {
    username: requireEnv('RSA_USERNAME'),
    password: requireEnv('RSA_PASSWORD'),
  };
}
