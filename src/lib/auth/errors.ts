/**
 * Sign-in error codes and the messages the login page shows. Shared by the
 * server (options.ts throws these codes) and the client login form, so this
 * module must stay free of secrets and server-only imports.
 *
 * next-auth v4 forwards a thrown `authorize` error as `?error=<message>` and a
 * rejected `signIn` callback as `?error=AccessDenied`
 * (node_modules/next-auth/core/routes/callback.js).
 */
export const LOGIN_ERROR = {
  /** Wrong email or password (next-auth's own code when authorize returns null). */
  credentials: 'CredentialsSignin',
  /** Our code: more than 5 attempts in 15 minutes from this IP. */
  rateLimited: 'RateLimited',
  /** Our code: the rate limiter could not be checked, so login fails closed. */
  unavailable: 'LoginUnavailable',
  /** next-auth's code when the signIn callback returns false. */
  accessDenied: 'AccessDenied',
} as const;

export const loginErrorMessages = {
  credentials: 'Email or password is incorrect.',
  rateLimited: 'Too many attempts. Try again in 15 minutes.',
  googleRejected: 'This Google account is not allowed.',
  unavailable: 'Sign-in is temporarily unavailable. Please try again later.',
  generic: 'Sign-in failed. Please try again.',
} as const;

/** Maps an error code from the URL or `signIn()` result to a safe message. */
export function getLoginErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  switch (code) {
    case LOGIN_ERROR.credentials:
      return loginErrorMessages.credentials;
    case LOGIN_ERROR.rateLimited:
      return loginErrorMessages.rateLimited;
    case LOGIN_ERROR.accessDenied:
      return loginErrorMessages.googleRejected;
    case LOGIN_ERROR.unavailable:
      return loginErrorMessages.unavailable;
    default:
      return loginErrorMessages.generic;
  }
}
