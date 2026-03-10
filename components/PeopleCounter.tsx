'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { API_BASE_URL } from '@/lib/constants';

function formatNumberWithCommas(num: number): string {
  return num.toLocaleString('en-US');
}

// 11 slots: 0-9 plus a duplicate 0 at position 10 so 9→0 rolls forward
const DIGIT_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const SLOT_PERCENT = 100 / DIGIT_SLOTS.length; // ~9.09% per slot

function OdometerDigit({ digit, firstLoad }: { digit: number; firstLoad: boolean }) {
  const prevDigitRef = useRef(0);
  const [position, setPosition] = useState(0); // always mount at 0
  const [animate, setAnimate] = useState(false); // no transition on mount

  useEffect(() => {
    const prev = prevDigitRef.current;
    prevDigitRef.current = digit;

    // Use double rAF to ensure the browser paints position 0 first,
    // then we animate to the target digit
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (prev > digit && prev !== 0) {
          // Wrap case (e.g. 9→0): roll forward to slot 10 (the duplicate 0)
          setAnimate(true);
          setPosition(10);
        } else {
          setAnimate(true);
          setPosition(digit);
        }
      });
    });
  }, [digit]);

  // After wrapping to slot 10, silently snap back to slot 0
  const handleTransitionEnd = useCallback(() => {
    if (position === 10) {
      setAnimate(false);
      setPosition(0);
    }
  }, [position]);

  return (
    <span className="odometer-digit-wrapper">
      <span
        className="odometer-digit-column"
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translateY(-${position * SLOT_PERCENT}%)`,
          transitionDuration: animate ? (firstLoad ? '1.2s' : '0.8s') : '0s',
        }}
      >
        {DIGIT_SLOTS.map((n, i) => (
          <span key={i}>{n}</span>
        ))}
      </span>
    </span>
  );
}

function scaleCounterFont(el: HTMLElement, count: number) {
  const formattedCount = formatNumberWithCommas(count);
  const charCount = formattedCount.length;
  const digitCount = count.toString().length;
  const commaCount = charCount - digitCount;
  const viewportWidth = window.innerWidth;
  const padding = 20;
  const availableWidth = viewportWidth - padding;
  const effectiveWidth = (digitCount * 0.6) + (commaCount * 0.3);
  const maxFitSize = availableWidth / effectiveWidth;
  const maxSize = 240;
  const fontSize = Math.min(maxFitSize, maxSize);
  const finalSize = Math.max(fontSize, 24);
  el.style.fontSize = `${finalSize}px`;
}

export default function PeopleCounter() {
  const [displayCount, setDisplayCount] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const counterRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoadRef = useRef(true);

  const updateCounter = useCallback(() => {
    fetch(`${API_BASE_URL}/totalcount`, {
      headers: { 'Accept': 'application/json' },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const target = data.total_count;
        if (counterRef.current) {
          scaleCounterFont(counterRef.current, target);
        }
        setDisplayCount(target);
        if (isFirstLoadRef.current) {
          isFirstLoadRef.current = false;
          setTimeout(() => setIsFirstLoad(false), 1500);
        }
        timeoutRef.current = setTimeout(updateCounter, 5000);
      })
      .catch(() => {
        if (counterRef.current) {
          scaleCounterFont(counterRef.current, 404);
        }
        setDisplayCount(404);
        timeoutRef.current = setTimeout(updateCounter, 5000);
      });
  }, []);

  useEffect(() => {
    updateCounter();

    const handleResize = () => {
      if (counterRef.current && displayCount > 0) {
        scaleCounterFont(counterRef.current, displayCount);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCounter]);

  const formatted = formatNumberWithCommas(displayCount);
  const chars = formatted.split('');

  return (
    <div id="peopleCounter" ref={counterRef}>
      {chars.map((char, i) =>
        char === ',' ? (
          <span key={`c-${i}`} className="odometer-comma">,</span>
        ) : (
          <OdometerDigit key={`d-${i}`} digit={parseInt(char, 10)} firstLoad={isFirstLoad} />
        )
      )}
    </div>
  );
}
