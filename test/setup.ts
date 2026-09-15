import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
