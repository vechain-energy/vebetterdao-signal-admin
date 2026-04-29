// Global polyfills to handle window.ethereum and Buffer
import { Buffer } from 'buffer';

declare global {
  interface Window {
    Buffer?: typeof Buffer;
    process?: {
      env: Record<string, string | undefined>;
      nextTick: (fn: () => void) => number;
      browser: true;
    };
    ethereum?: unknown;
  }
}

if (typeof window !== 'undefined') {
  // Polyfill for Buffer
  if (!window.Buffer) {
    window.Buffer = Buffer;
  }

  // Polyfill for process
  if (!window.process) {
    window.process = {
      env: {},
      nextTick: (fn: () => void) => setTimeout(fn, 0),
      browser: true
    };
  }

  // Create a more permissive ethereum property descriptor
  if (!window.ethereum) {
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
