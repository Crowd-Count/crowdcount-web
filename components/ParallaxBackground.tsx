'use client';

import { useEffect, useRef } from 'react';

export default function ParallaxBackground() {
  const redRef = useRef<HTMLDivElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (isTouchDevice) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (redRef.current) {
        redRef.current.style.transform = `translateY(${scrollY * 0.15}px)`;
      }
      if (whiteRef.current) {
        whiteRef.current.style.transform = `translateY(${scrollY * -0.1}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="parallax-container">
      <div ref={redRef} className="parallax-orb parallax-orb-red" />
      <div ref={whiteRef} className="parallax-orb parallax-orb-white" />
    </div>
  );
}
