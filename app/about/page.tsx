import type { Metadata } from 'next';
import MenuLinks from '@/components/MenuLinks';
import TypewriterText from '@/components/TypewriterText';

export const metadata: Metadata = { title: 'About & Contact' };

export default function AboutPage() {
  return (
    <>
      <header className="d-flex flex-column" data-aos="fade-down">
        <div className="text-center">
          <div id="MediumHomeTitle" className="d-inline-block">
            <TypewriterText text="About & Contact" id="CrowdCountABOUT" hideCursorAfter={3800} />
          </div>
        </div>
        <MenuLinks />
      </header>

      <h3 id="center" data-aos="fade-up">
        <div id="secondary"><div id="primary">Thank you for your interest</div>, here is some more information about us!</div>
      </h3>
      <br />
      <h3 id="center">
        <div id="secondary">
          <p data-aos="fade-up">
            Our mission is to provide businesses and locations with accurate crowd population count. This can be used as simple analytical data, to inform customers of store population, to ensure that a location is not overpopulated, and much more...
          </p>
          <div data-aos="fade-up" data-aos-delay="0">
            <div className="text-box">
              <img src="/assets/Icons/bubble.left.and.text.bubble.right.fill.png" alt="Contact Bubble" className="scaled-image" /><br />
              Feel absolutely free to contact us at <a href="mailto:elkan@crowdcount.tech" id="primary">elkan@crowdcount.tech</a>
              <br />And while you&apos;re at it, come visit our linkedin page at <a href="https://www.crowdcount.tech/linkedin" target="_blank" rel="noopener noreferrer" id="primary">crowdcount.tech/linkedin</a>
            </div>
          </div>

          <div data-aos="fade-up" data-aos-delay="100">
            <div className="text-box">
              <img src="/assets/Icons/person.3.fill.png" alt="Team Icon" className="scaled-image" /><br />
              Our small startup team consists of the following:
              <br /><a href="https://www.linkedin.com/in/elkanbruha" target="_blank" rel="noopener noreferrer" id="primary">Elkan Bruha</a> - Founder and Lead Engineer
              <br /><a href="https://www.linkedin.com/in/hayden-forbes" target="_blank" rel="noopener noreferrer" id="primary">Hayden Forbes</a> - Co-Founder and Business Lead
              <br /><a href="https://www.linkedin.com/in/josh-d'annunzio-3b0171227/" target="_blank" rel="noopener noreferrer" id="primary">Josh D&apos;Annunzio</a> - Computer Vision Lead
              <br /><a href="https://www.linkedin.com/in/jake-pechart-2516732b9/" target="_blank" rel="noopener noreferrer" id="primary">Jake Pechart</a> - Legal Support
              <br /><a href="https://www.linkedin.com/in/eric-neverdasovs-6a11b925a/" target="_blank" rel="noopener noreferrer" id="primary">Eric Neverdasovs</a> - Product Designer &amp; Manufacturer
              <br />We are always looking for help, so if you want to join our team, feel free to <a href="mailto:info@crowdcount.tech"> contact us</a>.
            </div>
          </div>

          <div data-aos="fade-up" data-aos-delay="200">
            <div className="text-box">
              <img src="/assets/Icons/hand.raised.fill.png" alt="Privacy Icon" className="scaled-image-hand" /><br />
              <div id="primary">Your privacy is important to us.</div> We collect as little information about you as possible to make your (and frankly our) experience even better. See how your data is managed in our <a href="/legal/privacy-policy" id="primary">Privacy Policy</a>.
            </div>
          </div>

          <div data-aos="fade-up" data-aos-delay="300">
            <div className="text-box">
              <img src="/assets/Icons/leaf.fill.png" alt="Leaf Icon" className="scaled-image-leaf" /><br />
              <div id="primary">We are committed to remaining carbon neutral.</div> We are building toward net zero or better by reducing our emissions where we can and offsetting the remainder of our footprint, such as server usage, through high quality carbon reduction and removal projects. More information and details to come.
            </div>
          </div>

          <div data-aos="fade-up" data-aos-delay="400">
            <div className="text-box">
              <img src="/assets/Icons/building-columns-solid.png" alt="Building with Columns" className="scaled-image" /><br />
              If you would like to see our legal documents such as our Terms of Use, please click here: <br /><a href="/legal" id="primary"> crowdcount.tech/legal</a>
            </div>
          </div>
        </div>
      </h3>
    </>
  );
}
