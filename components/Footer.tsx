import Link from 'next/link';

export default function Footer() {
  return (
    <div id="bottom-note">
      &copy; 2026 CrowdCount LLC. All rights reserved. |{' '}
      <Link href="/legal/privacy-policy" id="bottom-color">Privacy Policy</Link> |{' '}
      <Link href="/legal/terms-of-use" id="bottom-color">Terms of Use</Link>
    </div>
  );
}
