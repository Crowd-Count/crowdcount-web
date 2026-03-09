'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { NAV_LINKS } from '@/lib/constants';

export default function Navigation() {
  const [visible, setVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const tickingRef = useRef(false);

  const updateStickyNav = useCallback(() => {
    const scrollY = window.scrollY;
    const threshold = window.innerHeight * 0.5;
    if (scrollY > threshold) {
      setVisible(true);
    } else {
      setVisible(false);
      setMobileOpen(false);
    }
    tickingRef.current = false;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(updateStickyNav);
        tickingRef.current = true;
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [updateStickyNav]);

  const toggleMobile = () => setMobileOpen(prev => !prev);

  const navClasses = [
    'sticky-nav',
    visible ? 'visible' : '',
    mobileOpen ? 'mobile-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <nav id="sticky-nav" className={navClasses}>
      <div className="sticky-nav-content">
        <Link href="/" className="nav-logo">
          <img src="/assets/Logos/TransparentLogoCropped.png" alt="CrowdCount" />
          CrowdCount
        </Link>
        <ul className="nav-menu">
          {NAV_LINKS.map(link =>
            link.external ? (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="ripple">
                  {link.label}
                </a>
              </li>
            ) : (
              <li key={link.href}>
                <Link href={link.href} className="ripple">{link.label}</Link>
              </li>
            )
          )}
        </ul>
        <button className={`nav-toggle${mobileOpen ? ' active' : ''}`} onClick={toggleMobile}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <ul className={`nav-menu-mobile${mobileOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(link =>
          link.external ? (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
            </li>
          ) : (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          )
        )}
      </ul>
    </nav>
  );
}
