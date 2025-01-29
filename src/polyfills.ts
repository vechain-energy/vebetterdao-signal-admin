// Global polyfills to handle window.ethereum and Buffer
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  // Polyfill for Buffer
  if (!window.Buffer) {
    window.Buffer = Buffer;
  }

  // Polyfill for process
  if (!window.process) {
    window.process = {
      env: {},
      nextTick: (fn: Function) => setTimeout(fn, 0),
      browser: true
    } as any;
  }

  // Create a more permissive ethereum property descriptor
  const _global = window as any;
  if (!_global.ethereum) {
    try {
      Object.defineProperty(window, 'ethereum', {
        value: null,
        writable: true,
        configurable: true,
        enumerable: true
      });
    } catch (e) {
      console.warn('Failed to set ethereum property:', e);
    }
  }
}