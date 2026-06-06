import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('ignores falsy values', () => {
    const condition = false;
    expect(cn('foo', condition && 'bar', undefined, 'baz')).toBe('foo baz');
  });

  it('resolves tailwind conflicts (last wins)', () => {
    // tailwind-merge: p-4 then p-2 → p-2 wins
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('resolves conflicting text colors', () => {
    expect(cn('text-[#0C2E2D]', 'text-white')).toBe('text-white');
  });
});
