import type { Metadata } from 'next';
import Link from 'next/link';
import MenuLinks from '@/components/MenuLinks';
import TypewriterText from '@/components/TypewriterText';

export const metadata: Metadata = { title: 'How do we manage reports?' };

export default function ReportInfoPage() {
  return (
    <>
      <header className="d-flex flex-column" data-aos="fade-down">
        <div className="text-center">
          <div id="MediumHomeTitle" className="d-inline-block">
            <TypewriterText text="How do we manage reports?" id="CrowdCountHDWMR" hideCursorAfter={4000} />
          </div>
        </div>
        <MenuLinks />
      </header>
      <br />

      <h3 id="center" data-aos="fade-up">
        <div id="secondary">Let us <div id="primary">explain</div>...</div>
      </h3>
      <br />
      <h3 id="center">
        <div id="secondary">
          <div className="text-box-legal" data-aos="fade-up">
            <img src="/assets/Icons/comment-dots-solid.png" alt="Bubble with dots" className="scaled-image-hand-legal" /><br />
            <div id="primaryTitleBold">Map Data and Reports</div><br /><br />
            <div id="secondary">
              Reports are taken very seriously here at CrowdCount.
              <br />
              <br />Currently, reports are solely built for our map, where locations can show their population count publicly for anyone to see. We are aware that some places may benefit from a different population count, and while we have not yet seen any sign of it, they might want to falsify their numbers. This is why we have created the report mechanism so that our users can use our application and products with confidence.
              <br />
              <br /><div id="primary">Each report is read and acknowledged by our team</div>, and if multiple reports appear for the same location, we will open a larger inquiry into the location itself.
              <br />
              <br />Users have the following options when reporting:
              <li>This location is falsifying its count data</li>
              <li>This location&apos;s counter is malfunctioning</li>
              <li>This location has moved or no longer exists</li>
              <li>Other (to which the user must add additional information)</li>
              <br />
              The first three options are direct infringement on our <Link href="/legal/terms-of-use">Terms of Use</Link>.
              <br />We will see appropriate response to locations who infringe on our ToS. Responses may look something like warnings, removal from the public map, or anything we see fit.
            </div>
          </div>
          <div className="text-box-legal" data-aos="fade-up">
            If you have any questions about any of this, please contact us at: <a href="mailto:info@crowdcount.tech">info@crowdcount.tech</a>
          </div>
        </div>
      </h3>
    </>
  );
}
