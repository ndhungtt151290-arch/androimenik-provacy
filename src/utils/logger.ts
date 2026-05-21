/**
 * Logger utility — wraps console with __DEV__ guard.
 * In dev builds, logs are printed normally.
 * In Release/Production builds, __DEV__ is false and all logs are silently stripped.
 */
export const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (__DEV__) console.error(...args);
  },
};
