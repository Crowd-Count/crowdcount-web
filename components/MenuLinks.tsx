import Link from 'next/link';
import { NAV_LINKS } from '@/lib/constants';

export default function MenuLinks() {
  return (
    <ul id="menu" className="list-inline mt-3">
      {NAV_LINKS.map(link =>
        link.external ? (
          <li key={link.href} className="list-inline-item">
            <a href={link.href} target="_blank" rel="noopener noreferrer" className="ripple">
              {link.label}
            </a>
          </li>
        ) : (
          <li key={link.href} className="list-inline-item">
            <Link href={link.href} className="ripple">{link.label}</Link>
          </li>
        )
      )}
    </ul>
  );
}
