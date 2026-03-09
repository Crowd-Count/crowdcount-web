import type { Metadata } from 'next';
import Link from 'next/link';
import MenuLinks from '@/components/MenuLinks';
import TypewriterText from '@/components/TypewriterText';

export const metadata: Metadata = { title: 'Legal' };

export default function LegalPage() {
  return (
    <>
      <header className="d-flex flex-column" data-aos="fade-down">
        <div className="text-center">
          <div id="MediumHomeTitle" className="d-inline-block">
            <TypewriterText text="Legal Information" id="CrowdCountLEGAL" hideCursorAfter={3500} />
          </div>
        </div>
        <MenuLinks />
      </header>
      <br />

      <h3 id="center" data-aos="fade-up">
        <div id="secondary">Welcome, <div id="primary">feel free to explore our legal documents</div>.</div>
      </h3>
      <br />
      <h3 id="center">
        <div id="secondary">
          <div className="text-box-legal" data-aos="fade-up">
            <img src="/assets/Icons/building-columns-solid.png" alt="Privacy" className="scaled-image-hand-legal" /><br />
            <div id="primaryTitleBold">Legal Documents</div><br /><br />
            <div className="text-box-container">
              <Link href="/legal/privacy-policy" className="text-box-a">
                <img src="/assets/Icons/hand.raised.fill.png" alt="Privacy" className="scaled-image-hand" /><br />
                Click here to visit our <div id="primary">Privacy Policy</div>
              </Link>
              <Link href="/legal/terms-of-use" className="text-box-a">
                <img src="/assets/Icons/book-solid.png" alt="Terms of Use" className="scaled-image-hand" /><br />
                Click here to visit our <div id="primary">Terms of Use</div>
              </Link>
            </div>
          </div>
        </div>
      </h3>
    </>
  );
}
