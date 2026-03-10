'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/map') return;

    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (isTouchDevice) return;

    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      el.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(253, 64, 64, 0.04), transparent 40%)`;
    };

    const handleLeave = () => {
      el.style.background = 'none';
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, [pathname]);

  if (pathname === '/map') return null;

  return <div ref={ref} className="cursor-glow" />;
}
