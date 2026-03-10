'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { API_BASE_URL } from '@/lib/constants';

function formatNumberWithCommas(num: number): string {
  return num.toLocaleString('en-US');
}

// 4 full rotations of 0-9 + trailing 0 for wrap = 41 slots
const REPETITIONS = 4;
const TOTAL_SLOTS = REPETITIONS * 10 + 1;
const DIGIT_SLOTS = Array.from({ length: TOTAL_SLOTS }, (_, i) => i % 10);
const SLOT_PERCENT = 100 / TOTAL_SLOTS;

function OdometerDigit({ digit, spins, duration }: { digit: number; spins: number; duration: string }) {
  const prevDigitRef = useRef(0);
  const [position, setPosition] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState('0s');
  const hasSpunRef = useRef(false);

  // First mount: wait for browser to paint position 0, then spin to target
  useEffect(() => {
    if (hasSpunRef.current) return;
    hasSpunRef.current = true;
    const timer = setTimeout(() => {
      setTransitionDuration(duration);
      setPosition(spins * 10 + digit);
      prevDigitRef.current = digit;
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subsequent digit changes (after initial spin)
  useEffect(() => {
    if (!hasSpunRef.current) return;

    const prev = prevDigitRef.current;
    if (prev === digit) return;
    prevDigitRef.current = digit;

    setTransitionDuration(duration);
    if (prev > digit) {
      // Wrap (9→0): roll forward to slot 10
      setPosition(10);
    } else {
      setPosition(digit);
    }
  }, [digit, duration]);

  // After spin or wrap lands, silently snap to base position (0-9)
  const handleTransitionEnd = useCallback(() => {
    if (position > 9) {
      setTransitionDuration('0s');
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
          transitionDuration,
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
  const currentCountRef = useRef(0);

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
        currentCountRef.current = target;
        setDisplayCount(target);
        if (isFirstLoad) {
          // Wait for spin animation to finish before switching to live mode
          setTimeout(() => setIsFirstLoad(false), 1800);
          timeoutRef.current = setTimeout(updateCounter, 5000);
        } else {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCounter]);

  // Show plain 0 until real data arrives, so all odometer digits mount fresh together
  if (displayCount === 0) {
    return <div id="peopleCounter" ref={counterRef}>0</div>;
  }

  const formatted = formatNumberWithCommas(displayCount);
  const chars = formatted.split('');
  const totalDigits = chars.filter(c => c !== ',').length;
  const duration = isFirstLoad ? '1.5s' : '0.8s';
  let digitIndex = 0;

  return (
    <div id="peopleCounter" ref={counterRef}>
      {chars.map((char, i) => {
        if (char === ',') {
          return <span key={`c-${i}`} className="odometer-comma">,</span>;
        }
        const posFromRight = totalDigits - 1 - digitIndex;
        // Every digit spins at least 1 full rotation; rightmost spin more
        const spins = isFirstLoad ? Math.max(1, 3 - posFromRight) : 0;
        digitIndex++;
        return (
          <OdometerDigit
            key={`d-${i}`}
            digit={parseInt(char, 10)}
            spins={spins}
            duration={duration}
          />
        );
      })}
    </div>
  );
}
