'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

function OdometerDigit({ digit }: { digit: string }) {
  if (digit === ',') {
    return <span className="odometer-comma">,</span>;
  }

  const d = parseInt(digit, 10);

  return (
    <span className="odometer-digit-wrapper">
      <span
        className="odometer-digit-column"
        style={{ transform: `translateY(-${d * 1}em)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <span key={n}>{n}</span>
        ))}
      </span>
    </span>
  );
}

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.id = 'secondarypage';
    return () => { document.body.id = ''; };
  }, []);

  return (
    <div className="not-found-container" ref={containerRef}>
      <div className="not-found-counter" style={{ fontSize: 'min(15rem, 60vw)' }}>
        <OdometerDigit digit="4" />
        <OdometerDigit digit="0" />
        <OdometerDigit digit="4" />
      </div>
      <div className="not-found-subtitle">
        <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Page Not Found
        </span>
      </div>
      <p style={{ color: 'var(--gray-color)', maxWidth: '400px' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="not-found-home-btn ripple">
        Go Home
      </Link>
    </div>
  );
}
