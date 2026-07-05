'use client';

import MenuLinks from '@/components/MenuLinks';
import TypewriterText from '@/components/TypewriterText';
import PhotoGallery from '@/components/PhotoGallery';

const counterPhotos = [
  { src: '/assets/CounterPhotos/gen-3-1.png', alt: 'Crowd Counter Gen 1.3 - Photo 1' },
  { src: '/assets/CounterPhotos/gen-3-2.png', alt: 'Crowd Counter Gen 1.3 - Photo 2' },
  { src: '/assets/CounterPhotos/gen-3-3.png', alt: 'Crowd Counter Gen 1.3 - Photo 3' },
  { src: '/assets/CounterPhotos/gen-3-4.png', alt: 'Crowd Counter Gen 1.3 - Photo 4' },
  { src: '/assets/CounterPhotos/gen-3-5.png', alt: 'Crowd Counter Gen 1.3 - Photo 5' },
  { src: '/assets/CounterPhotos/gen-3-6.png', alt: 'Crowd Counter Gen 1.3 - Photo 6' },
];

const appPhotos = [
  { src: '/assets/AppPhotos/MapView.png', alt: 'Live map showing nearby locations and their crowds' },
  { src: '/assets/AppPhotos/MapAds.png', alt: 'A business promotion running on the public map' },
  { src: '/assets/AppPhotos/AdDetailView.png', alt: 'Detailed view of a promotion on the map' },
  { src: '/assets/AppPhotos/CreateAd.png', alt: 'Creating a promotion from the app' },
  { src: '/assets/AppPhotos/CreateAdLower.png', alt: 'Creating a promotion, scrolled down' },
  { src: '/assets/AppPhotos/MapListView.png', alt: 'Map list view of nearby locations' },
  { src: '/assets/AppPhotos/WelcomePage.png', alt: 'Welcome Page' },
  { src: '/assets/AppPhotos/DeviceView.png', alt: 'Live count for your location' },
  { src: '/assets/AppPhotos/HistoricView.png', alt: 'Count History View' },
  { src: '/assets/AppPhotos/InsightsViewTop.png', alt: 'Insights: averages and trends' },
  { src: '/assets/AppPhotos/InsightsViewBottom.png', alt: 'Insights: averages and trends, scrolled down' },
  { src: '/assets/AppPhotos/OvercrowdingView.png', alt: 'Overcrowding limit view' },
  { src: '/assets/AppPhotos/LocationSettings.png', alt: 'Total count from multiple devices' },
  { src: '/assets/AppPhotos/SettingsView.png', alt: 'Settings Page' },
  { src: '/assets/AppPhotos/AddDevice.png', alt: 'Add Device View' },
  { src: '/assets/AppPhotos/MapInfo.png', alt: 'Map Info Page' },
  { src: '/assets/AppPhotos/InfoPage.png', alt: 'Information Page' },
];

const appFeatures = [
  { title: 'Get Discovered', desc: 'Your business on the live public map' },
  { title: 'Run Promotions', desc: 'Put your specials in front of people picking a spot' },
  { title: 'Live Data', desc: 'Real-time counts from anywhere' },
  { title: 'Insights', desc: 'Know your peak hours & slow nights' },
  { title: 'Multi-Location', desc: 'Every venue in one place' },
  { title: 'CSV Export', desc: 'Your data, yours to keep' },
];

export default function ProductsPage() {
  return (
    <>
      <header className="d-flex flex-column" data-aos="fade-down">
        <div className="text-center">
          <div id="MediumHomeTitle" className="d-inline-block">
            <TypewriterText text="CrowdCount Products" id="CrowdCountPRODUCTS" hideCursorAfter={3300} />
          </div>
        </div>
        <MenuLinks />
      </header>
      <br />

      <h3 id="center" data-aos="fade-up">
        <div id="secondary">Built to bring <div id="primary">more people</div> through your door.</div>
      </h3>
      <br />
      <h3 id="center">
        <div id="secondary">
          {/* CrowdCount App & Map */}
          <div className="text-box-legal" data-aos="fade-up" data-aos-delay="0">
            <img src="/assets/Logos/CrowdCount App Logo-iOS-Default-1024x1024@2x.png" alt="App Logo" className="scaled-image-app" /><br />
            <div id="primaryTitleBold">Get On The Map</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', marginTop: '4px', marginBottom: '8px' }}>The CrowdCount App</div>
            <br />
            When people decide where to go out, <div id="primary">they check where the crowd is.</div> The CrowdCount map shows every public location live: how busy it is right now, and when it usually fills up. If your bar or business is on the map, you&apos;re part of that decision.
            <br />
            <br /><div id="primary">Run promotions right where people are looking.</div> Happy hour, live music, game night: your specials appear on the map at the exact moment someone nearby is choosing their next stop. Create one from the app in minutes and watch the night fill up.

            {/* Feature cards */}
            <div className="feature-grid" data-aos="fade-up">
              {appFeatures.map((f, i) => (
                <div key={i} className="feature-card" data-aos="fade-up" data-aos-delay={i * 80}>
                  <div className="feature-card-title">{f.title}</div>
                  <div className="feature-card-desc">{f.desc}</div>
                </div>
              ))}
            </div>

            Everything you need to run the night is in there too: live counts from anywhere, history and insights, totals across multiple entrances or venues, and your data exportable anytime.
            <br />
            <div data-aos="fade-up">
              <div className="text-box-legal gallery-container" id="app-gallery">
                <PhotoGallery images={appPhotos} galleryId="photo-gallery" />
              </div>
            </div>
            Now available on the App Store!
            <br />
            <br /><a href="https://www.crowdcount.tech/app" target="_blank" rel="noopener noreferrer" id="big-red-button" className="ripple">Download</a>
            <br />
            <br />
            <div id="secondarySmall" style={{ display: 'block' }}>Your spot on the map starts with a <a href="#counter">Crowd Counter</a></div>
            <div id="secondarySmall" style={{ display: 'block', marginTop: '5px' }}>Want to help improve our app? <a href="https://www.crowdcount.tech/beta-app" target="_blank" rel="noopener noreferrer">Join our beta</a></div>
            <div id="secondarySmall" style={{ display: 'block', marginTop: '5px' }}>Want to manage your counters without the app? <a href="https://counter.crowdcount.tech" target="_blank" rel="noopener noreferrer">Use our web interface</a></div>
          </div>

          {/* Crowd Counter 1 */}
          <div className="text-box-legal" id="counter" data-aos="fade-up" data-aos-delay="200">
            <img src="/assets/Icons/ellipsis.rectangle.fill.png" alt="Crowd Counter Icon" className="scaled-image-counter" /><br />
            <div id="primaryTitleBold">Know Your Numbers</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', marginTop: '4px', marginBottom: '8px' }}>Crowd Counter 1 · $39.99/mo <span style={{ color: 'rgba(255,255,255,0.3)' }}>· free during pilot</span></div>
            <br />
            Your live spot on the map, and every insight behind it, is powered by <div id="primary">the Crowd Counter 1.</div> It sits above your door and counts everyone walking in and out, so you always know exactly how many people are inside.
            <br />
            <div className="specs-layout" data-aos="fade-up">
              <div className="specs-table-wrapper">
                <div id="primary" style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Technical Specs</div>
                <table className="specs-table">
                  <tbody>
                    <tr><td className="specs-label">Accuracy</td><td className="specs-value"><span className="specs-highlight">Up to 99%</span></td></tr>
                    <tr><td className="specs-label">Processing</td><td className="specs-value">Cloud (In-House NVIDIA Server)</td></tr>
                    <tr><td className="specs-label">Connectivity</td><td className="specs-value">Wi-Fi & Bluetooth</td></tr>
                    <tr><td className="specs-label">Setup Time</td><td className="specs-value"><span className="specs-highlight">~5 minutes</span></td></tr>
                    <tr><td className="specs-label">Entrances</td><td className="specs-value">Unlimited (1 per door)</td></tr>
                    <tr><td className="specs-label">App Support</td><td className="specs-value">iOS, Web</td></tr>
                    <tr><td className="specs-label">Data</td><td className="specs-value">Live count, entries, history, insights</td></tr>
                    <tr><td className="specs-label">Generation</td><td className="specs-value">Gen 1.3 (Jan 2026)</td></tr>
                    <tr><td className="specs-label">Price</td><td className="specs-value"><span className="specs-highlight">$39.99/mo</span> <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>(free during pilot)</span></td></tr>
                  </tbody>
                </table>
              </div>
              <div className="specs-text">
                That one number changes how you run the place. <div id="primary">Staff the nights that are actually busy,</div> spot your true peak hours and slow ones, keep an eye on capacity, and see in the data whether last week&apos;s promotion actually brought people in.
                <br />
                <br />Setup is simple: <div id="primary">place the small device above your door and let it do the rest.</div> Its camera sends footage to our powerful custom built in-house NVIDIA servers for processing, which keeps the device inexpensive and reliable. We restrict our own access to the footage, ensuring your privacy is maintained at all times.
                <br />
                <br />Manage everything from our wonderful <a id="primary" href="https://crowdcount.tech/app">iOS App</a>, from first-time setup to adding counters for extra entrances, or use the <a href="https://counter.crowdcount.tech" target="_blank" rel="noopener noreferrer" id="primary">web interface</a> if you prefer desktop.
              </div>
            </div>

            Check out our <div id="primary">beautiful design!</div>
            <div data-aos="fade-up">
              <div className="text-box-legal gallery-container" id="counter-gallery">
                <PhotoGallery images={counterPhotos} />
              </div>
            </div>
            <br />While we are not yet shipping, <div id="primary">we are currently doing free installs in the Boulder/Denver area!</div>
            <br />
            <br /><a href="https://crowdcount.tech/order" target="_blank" rel="noopener noreferrer" id="big-red-button" className="ripple">Order</a>
            <br />
            <br />
          </div>
        </div>
      </h3>
    </>
  );
}
