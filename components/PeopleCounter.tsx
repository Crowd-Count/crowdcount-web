'use client';

import { useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/constants';

function formatNumberWithCommas(num: number): string {
  return num.toLocaleString('en-US');
}

function scaleCounterFont(el: HTMLElement, count: number) {
  const formattedCount = formatNumberWithCommas(count);
  const charCount = formattedCount.length;
  const viewportWidth = window.innerWidth;
  const padding = 20;
  const availableWidth = viewportWidth - padding;
  const digitCount = count.toString().length;
  const commaCount = charCount - digitCount;
  const effectiveWidth = (digitCount * 0.6) + (commaCount * 0.3);
  const maxFitSize = availableWidth / effectiveWidth;
  const maxSize = 240;
  const fontSize = Math.min(maxFitSize, maxSize);
  const finalSize = Math.max(fontSize, 24);
  el.style.fontSize = `${finalSize}px`;
}

export default function PeopleCounter() {
  const counterRef = useRef<HTMLDivElement>(null);
  const currentCountRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animateCounter = useCallback((targetCount: number, callback?: () => void) => {
    const counter = counterRef.current;
    if (!counter) return;

    let currentCount = currentCountRef.current;
    const duration = 2000;
    const frameRate = 50;
    const totalFrames = duration / frameRate;
    let frame = 0;

    scaleCounterFont(counter, targetCount);

    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      currentCount = Math.round(currentCount + (targetCount - currentCount) * progress);
      counter.textContent = formatNumberWithCommas(currentCount);
      currentCountRef.current = currentCount;

      if (frame >= totalFrames) {
        clearInterval(interval);
        counter.textContent = formatNumberWithCommas(targetCount);
        currentCountRef.current = targetCount;
        if (callback) callback();
      }
    }, frameRate);
  }, []);

  const updateCounter = useCallback(() => {
    fetch(`${API_BASE_URL}/totalcount`, {
      headers: { 'Accept': 'application/json' },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        animateCounter(data.total_count, () => {
          timeoutRef.current = setTimeout(updateCounter, 3000);
        });
      })
      .catch(() => {
        animateCounter(404, () => {
          timeoutRef.current = setTimeout(updateCounter, 3000);
        });
      });
  }, [animateCounter]);

  useEffect(() => {
    updateCounter();

    const handleResize = () => {
      const counter = counterRef.current;
      if (counter && currentCountRef.current > 0) {
        scaleCounterFont(counter, currentCountRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCounter]);

  return <div id="peopleCounter" ref={counterRef}>0</div>;
}
