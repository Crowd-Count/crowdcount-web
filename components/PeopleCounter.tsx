'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { API_BASE_URL } from '@/lib/constants';

function formatNumberWithCommas(num: number): string {
  return num.toLocaleString('en-US');
}

// 4 full rotations of 0-9 (40 slots) + trailing 0 for wrap = 41 slots
// Enough room for rightmost digits to spin through 3 full rotations on first load
const REPETITIONS = 4;
const TOTAL_SLOTS = REPETITIONS * 10 + 1;
const DIGIT_SLOTS = Array.from({ length: TOTAL_SLOTS }, (_, i) => i % 10);
const SLOT_PERCENT = 100 / TOTAL_SLOTS;

function OdometerDigit({ digit, firstLoad, spins }: { digit: number; firstLoad: boolean; spins: number }) {
  const prevDigitRef = useRef(0);
  const [position, setPosition] = useState(0);
  const [animate, setAnimate] = useState(false);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const prev = prevDigitRef.current;
    prevDigitRef.current = digit;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true);
        if (!hasAnimatedRef.current) {
          // First load: spin through full rotations then land on target
          hasAnimatedRef.current = true;
          setPosition(spins * 10 + digit);
        } else if (prev > digit) {
          // Wrap case (e.g. 9→0): roll forward to next 0 at slot 10
          setPosition(10);
        } else {
          setPosition(digit);
        }
      });
    });
  }, [digit, spins]);

  // After first-load spin or wrap, silently snap back to base position (0-9)
  const handleTransitionEnd = useCallback(() => {
    if (position > 9) {
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

  // Don't render odometer digits until we have real data —
  // this ensures ALL digits mount fresh together and spin uniformly
  if (displayCount === 0) {
    return <div id="peopleCounter" ref={counterRef}>0</div>;
  }

  const formatted = formatNumberWithCommas(displayCount);
  const chars = formatted.split('');
  const totalDigits = chars.filter(c => c !== ',').length;
  let digitIndex = 0;

  return (
    <div id="peopleCounter" ref={counterRef}>
      {chars.map((char, i) => {
        if (char === ',') {
          return <span key={`c-${i}`} className="odometer-comma">,</span>;
        }
        const posFromRight = totalDigits - 1 - digitIndex;
        // Every digit spins at least 1 full rotation; rightmost spin more
        const spins = Math.max(1, 3 - posFromRight);
        digitIndex++;
        return (
          <OdometerDigit
            key={`d-${i}`}
            digit={parseInt(char, 10)}
            firstLoad={isFirstLoad}
            spins={spins}
          />
        );
      })}
    </div>
  );
}
