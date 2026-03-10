'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollProgress() {
  const [width, setWidth] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      setWidth(0);
      return;
    }

    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        setWidth((scrollTop / scrollHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  if (pathname === '/') return null;

  return <div className="scroll-progress" style={{ width: `${width}%` }} />;
}
