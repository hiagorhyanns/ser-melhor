import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

describe('useDebouncedValue()', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 200));
    expect(result.current).toBe('hello');
  });

  it('does not update before delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('a');
  });

  it('updates after delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('b');
  });

  it('skips intermediate values (debounce cancellation)', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    act(() => { vi.advanceTimersByTime(100); }); // partial — b not committed
    rerender({ v: 'c' });
    act(() => { vi.advanceTimersByTime(200); }); // c committed
    expect(result.current).toBe('c'); // 'b' was cancelled
  });
});
