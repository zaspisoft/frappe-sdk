/**
 * Used `self` insted of `window` for PWA Compatibility
 */
export const runtimeName =
  (typeof self === 'object' && self.self === self && 'browser') ||
  (typeof global === 'object' && global.global === global && 'node');
