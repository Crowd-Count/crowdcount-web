'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { API_BASE_URL } from '@/lib/constants';

function formatNumberWithCommas(num: number): string {
  return num.toLocaleString('en-US');
}

function OdometerDigit({ digit, fontSize }: { digit: number; fontSize: number }) {
  return (
    <span className="odometer-digit-wrapper" style={{ fontSize: `${fontSize}px` }}>
      <span
        className="odometer-digit-column"
        style={{ transform: `translateY(-${digit}em)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <span key={n}>{n}</span>
        ))}
      </span>
    </span>
  );
}

function OdometerComma({ fontSize }: { fontSize: number }) {
  return (
    <span className="odometer-comma" style={{ fontSize: `${fontSize}px` }}>
      ,
    </span>
  );
}

function computeFontSize(count: number): number {
  const formatted = formatNumberWithCommas(count);
  const charCount = formatted.length;
  const digitCount = count.toString().length;
  const commaCount = charCount - digitCount;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const padding = 20;
  const availableWidth = viewportWidth - padding;
  const effectiveWidth = (digitCount * 0.6) + (commaCount * 0.3);
  const maxFitSize = availableWidth / effectiveWidth;
  const maxSize = 240;
  return Math.max(Math.min(maxFitSize, maxSize), 24);
}

export default function PeopleCounter() {
  const [displayCount, setDisplayCount] = useState(0);
  const [fontSize, setFontSize] = useState(240);
  const currentCountRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const animateCounter = useCallback((targetCount: number, callback?: () => void) => {
    if (animFrameRef.current) clearInterval(animFrameRef.current);

    const startCount = currentCountRef.current;
    const duration = 2000;
    const frameRate = 50;
    const totalFrames = duration / frameRate;
    let frame = 0;

    setFontSize(computeFontSize(targetCount));

    animFrameRef.current = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const current = Math.round(startCount + (targetCount - startCount) * progress);
      currentCountRef.current = current;
      setDisplayCount(current);

      if (frame >= totalFrames) {
        if (animFrameRef.current) clearInterval(animFrameRef.current);
        animFrameRef.current = null;
        currentCountRef.current = targetCount;
        setDisplayCount(targetCount);
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
      if (currentCountRef.current > 0) {
        setFontSize(computeFontSize(currentCountRef.current));
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animFrameRef.current) clearInterval(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCounter]);

  const formatted = formatNumberWithCommas(displayCount);
  const chars = formatted.split('');

  return (
    <div id="peopleCounter" className="odometer">
      {chars.map((char, i) =>
        char === ',' ? (
          <OdometerComma key={`c-${i}`} fontSize={fontSize} />
        ) : (
          <OdometerDigit key={`d-${i}`} digit={parseInt(char, 10)} fontSize={fontSize} />
        )
      )}
    </div>
  );
}
