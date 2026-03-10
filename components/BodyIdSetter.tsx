'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function BodyIdSetter() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.id = pathname === '/' ? 'home' : 'secondarypage';
  }, [pathname]);

  return null;
}
