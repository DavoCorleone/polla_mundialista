import { describe, it, expect } from 'vitest';
import { isValidFlagImageUrl } from '@/lib/flag-url';

describe('isValidFlagImageUrl', () => {
  it('acepta http(s) con extensión permitida', () => {
    expect(isValidFlagImageUrl('https://cdn.example.com/flags/ec.svg')).toBe(true);
    expect(isValidFlagImageUrl('http://x.org/a.png')).toBe(true);
    expect(isValidFlagImageUrl('https://x.org/b.jpg')).toBe(true);
    expect(isValidFlagImageUrl('https://x.org/c.jpeg')).toBe(true);
    expect(isValidFlagImageUrl('https://x.org/d.webp')).toBe(true);
    expect(isValidFlagImageUrl('https://x.org/e.PNG?v=2')).toBe(true);
  });

  it('rechaza sin extensión de imagen válida', () => {
    expect(isValidFlagImageUrl('https://example.com/flag')).toBe(false);
    expect(isValidFlagImageUrl('https://example.com/img.gif')).toBe(false);
  });

  it('rechaza vacío o no URL', () => {
    expect(isValidFlagImageUrl('')).toBe(false);
    expect(isValidFlagImageUrl('   ')).toBe(false);
    expect(isValidFlagImageUrl('not-a-url')).toBe(false);
  });
});
