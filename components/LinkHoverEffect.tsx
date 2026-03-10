'use client';

import { useEffect } from 'react';

const SELECTOR = [
  '.text-box a',
  '.text-box-legal a:not(#big-red-button):not(.text-box-a)',
  '#center a:not(#big-red-button):not(.text-box-a)',
].join(', ');

const RANGE = 80;
const CARD_RANGE = 120;

function distToRect(x: number, y: number, rect: DOMRect): number {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.sqrt(dx * dx + dy * dy);
}

export default function LinkHoverEffect() {
  useEffect(() => {
    const activeEls = new Set<HTMLElement>();
    const activeCards = new Set<HTMLElement>();
    let links: HTMLElement[] = [];
    let cards: HTMLElement[] = [];
    let linksStale = true;

    const observer = new MutationObserver(() => { linksStale = true; });
    observer.observe(document.body, { childList: true, subtree: true });

    const refreshLinks = () => {
      links = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
      cards = Array.from(document.querySelectorAll<HTMLElement>('.feature-card'));
      linksStale = false;
    };

    const handleMove = (e: MouseEvent) => {
      if (linksStale) refreshLinks();

      const stillActive = new Set<HTMLElement>();

      for (const link of links) {
        const rect = link.getBoundingClientRect();
        const dist = distToRect(e.clientX, e.clientY, rect);

        if (dist <= RANGE) {
          link.style.setProperty('--mx', `${e.clientX - rect.left}px`);
          link.style.setProperty('--my', `${e.clientY - rect.top}px`);
          if (!activeEls.has(link)) {
            link.classList.add('link-hover-active');
            activeEls.add(link);
          }
          stillActive.add(link);
        }
      }

      // Deactivate links that moved out of range
      for (const el of activeEls) {
        if (!stillActive.has(el)) {
          el.classList.remove('link-hover-active');
          activeEls.delete(el);
        }
      }

      // Feature card cursor glow (proximity-based, multiple at once)
      const stillActiveCards = new Set<HTMLElement>();
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const dist = distToRect(e.clientX, e.clientY, rect);

        if (dist <= CARD_RANGE) {
          card.style.setProperty('--card-mx', `${e.clientX - rect.left}px`);
          card.style.setProperty('--card-my', `${e.clientY - rect.top}px`);
          if (!activeCards.has(card)) {
            card.classList.add('card-glow-active');
            activeCards.add(card);
          }
          stillActiveCards.add(card);
        }
      }
      for (const el of activeCards) {
        if (!stillActiveCards.has(el)) {
          el.classList.remove('card-glow-active');
          activeCards.delete(el);
        }
      }
    };

    const handleLeave = () => {
      for (const el of activeEls) {
        el.classList.remove('link-hover-active');
      }
      activeEls.clear();
      for (const el of activeCards) {
        el.classList.remove('card-glow-active');
      }
      activeCards.clear();
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      observer.disconnect();
      for (const el of activeEls) {
        el.classList.remove('link-hover-active');
      }
      for (const el of activeCards) {
        el.classList.remove('card-glow-active');
      }
    };
  }, []);

  return null;
}
