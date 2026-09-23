import { LOGIN_ERRORS } from '../constants/messages';

export type Credentials = { username: string; password: string };

export const PRODUCTS = ['iphone X', 'Samsung Note 8', 'Nokia Edge', 'Blackberry'] as const;

// Each case derives its credentials from the valid ones, so secrets stay in .env.
export const INVALID_LOGIN_CASES: {
  title: string;
  credentials: (valid: Credentials) => Credentials;
  error: string;
}[] = [
  {
    title: 'wrong password',
    credentials: (valid) => ({ username: valid.username, password: 'wrong-password' }),
    error: LOGIN_ERRORS.incorrect,
  },
  {
    title: 'unknown username',
    credentials: (valid) => ({ username: 'unknown-user', password: valid.password }),
    error: LOGIN_ERRORS.incorrect,
  },
  {
    title: 'empty username and password',
    credentials: () => ({ username: '', password: '' }),
    error: LOGIN_ERRORS.empty,
  },
];
