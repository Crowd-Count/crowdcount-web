'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { API_BASE_URL } from '@/lib/constants';

function formatNumberWithCommas(num: number): string {
  return num.toLocaleString('en-US');
}

// 11 slots: 0-9 plus a duplicate 0 at position 10 so 9→0 rolls forward
const DIGIT_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const SLOT_PERCENT = 100 / DIGIT_SLOTS.length;

function OdometerDigit({ digit, smooth }: { digit: number; smooth: boolean }) {
  const prevDigitRef = useRef(digit);
  const [position, setPosition] = useState(digit);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const prev = prevDigitRef.current;
    prevDigitRef.current = digit;

    if (!smooth) {
      // During count-up: just snap, no CSS transition
      setAnimate(false);
      setPosition(digit);
    } else if (prev > digit) {
      // Wrap (9→0): roll forward to slot 10
      setAnimate(true);
      setPosition(10);
    } else if (prev !== digit) {
      setAnimate(true);
      setPosition(digit);
    }
  }, [digit, smooth]);

  const handleTransitionEnd = useCallback(() => {
    if (position === 10) {
      setAnimate(false);
      setPosition(digit);
    }
  }, [position, digit]);

  return (
    <span className="odometer-digit-wrapper">
      <span
        className="odometer-digit-column"
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translateY(-${position * SLOT_PERCENT}%)`,
          transitionDuration: animate ? '0.8s' : '0s',
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
  const [smooth, setSmooth] = useState(false); // CSS transitions off during count-up
  const counterRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentCountRef = useRef(0);
  const isFirstLoadRef = useRef(true);

  const animateCountUp = useCallback((target: number, callback?: () => void) => {
    if (animRef.current) clearInterval(animRef.current);

    setSmooth(false);
    const start = currentCountRef.current;
    const duration = 2000;
    const frameRate = 30;
    const totalFrames = duration / frameRate;
    let frame = 0;

    // Set font size for the target immediately so it doesn't jump at the end
    if (counterRef.current) {
      scaleCounterFont(counterRef.current, target);
    }

    animRef.current = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease-out: fast start, slow end
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);
      currentCountRef.current = current;
      setDisplayCount(current);

      if (frame >= totalFrames) {
        if (animRef.current) clearInterval(animRef.current);
        animRef.current = null;
        currentCountRef.current = target;
        setDisplayCount(target);
        // Enable CSS transitions for future small updates
        setSmooth(true);
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
        const target = data.total_count;
        if (isFirstLoadRef.current) {
          // First load: count up from 0
          isFirstLoadRef.current = false;
          animateCountUp(target, () => {
            timeoutRef.current = setTimeout(updateCounter, 3000);
          });
        } else {
          // Subsequent updates: just set the value, CSS transitions handle the roll
          if (counterRef.current) {
            scaleCounterFont(counterRef.current, target);
          }
          currentCountRef.current = target;
          setDisplayCount(target);
          timeoutRef.current = setTimeout(updateCounter, 5000);
        }
      })
      .catch(() => {
        if (counterRef.current) {
          scaleCounterFont(counterRef.current, 404);
        }
        currentCountRef.current = 404;
        setDisplayCount(404);
        timeoutRef.current = setTimeout(updateCounter, 5000);
      });
  }, [animateCountUp]);

  useEffect(() => {
    updateCounter();

    const handleResize = () => {
      if (counterRef.current && currentCountRef.current > 0) {
        scaleCounterFont(counterRef.current, currentCountRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animRef.current) clearInterval(animRef.current);
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
          <OdometerDigit key={`d-${i}`} digit={parseInt(char, 10)} smooth={smooth} />
        )
      )}
    </div>
  );
}
