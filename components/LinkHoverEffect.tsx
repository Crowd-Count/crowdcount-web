'use client';

import { useEffect } from 'react';

const SELECTORS = [
  '.text-box a',
  '.text-box-legal a:not(#big-red-button)',
  '#center a:not(#big-red-button)',
].join(', ');

export default function LinkHoverEffect() {
  useEffect(() => {
    let activeEl: HTMLElement | null = null;

    const handleMove = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest?.(SELECTORS) as HTMLElement | null;

      if (target) {
        const rect = target.getBoundingClientRect();
        target.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        target.style.setProperty('--my', `${e.clientY - rect.top}px`);
        if (target !== activeEl) {
          activeEl?.classList.remove('link-hover-active');
          target.classList.add('link-hover-active');
          activeEl = target;
        }
      } else if (activeEl) {
        activeEl.classList.remove('link-hover-active');
        activeEl = null;
      }
    };

    const handleLeave = () => {
      if (activeEl) {
        activeEl.classList.remove('link-hover-active');
        activeEl = null;
      }
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      activeEl?.classList.remove('link-hover-active');
    };
  }, []);

  return null;
}
