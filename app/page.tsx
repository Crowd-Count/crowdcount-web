'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PeopleCounter from '@/components/PeopleCounter';
import { NAV_LINKS } from '@/lib/constants';
import { API_BASE_URL } from '@/lib/constants';
export default function HomePage() {
  const [loginText, setLoginText] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/login-text`)
      .then(res => res.json())
      .then(data => {
        if (data.text) setLoginText(data.text);
      })
      .catch(err => console.error('Error fetching login text:', err));
  }, []);

  return (
    <header className="d-flex flex-column align-items-center justify-content-center text-center vh-100 homeheader">
      <div>
        <div data-aos="fade-down">
          <div id="LargeHomeText">Total People Counted with <div className="gradient-text">CrowdCount</div></div>
        </div>
        <PeopleCounter />
        <div id="loginText" style={{ fontStyle: 'italic', fontSize: '0.9rem', opacity: 0.3, marginBottom: '0.5rem' }} data-aos="fade-up">
          {loginText}
        </div>
      </div>
      <div data-aos="fade-up">
        <ul id="menu" className="list-inline mt-3">
          {NAV_LINKS.map(link =>
            link.external ? (
              <li key={link.href} className="list-inline-item">
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="ripple">{link.label}</a>
              </li>
            ) : (
              <li key={link.href} className="list-inline-item">
                <Link href={link.href} className="ripple">{link.label}</Link>
              </li>
            )
          )}
        </ul>
      </div>
    </header>
  );
}
