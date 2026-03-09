'use client';

import MenuLinks from '@/components/MenuLinks';
import TypewriterText from '@/components/TypewriterText';
import PhotoGallery from '@/components/PhotoGallery';
import Link from 'next/link';

const counterPhotos = [
  { src: '/assets/CounterPhotos/gen-3-1.png', alt: 'Crowd Counter Gen 1.3 - Photo 1' },
  { src: '/assets/CounterPhotos/gen-3-2.png', alt: 'Crowd Counter Gen 1.3 - Photo 2' },
  { src: '/assets/CounterPhotos/gen-3-3.png', alt: 'Crowd Counter Gen 1.3 - Photo 3' },
  { src: '/assets/CounterPhotos/gen-3-4.png', alt: 'Crowd Counter Gen 1.3 - Photo 4' },
  { src: '/assets/CounterPhotos/gen-3-5.png', alt: 'Crowd Counter Gen 1.3 - Photo 5' },
  { src: '/assets/CounterPhotos/gen-3-6.png', alt: 'Crowd Counter Gen 1.3 - Photo 6' },
];

const appPhotos = [
  { src: '/assets/AppPhotos/WelcomePage.png', alt: 'Welcome Page' },
  { src: '/assets/AppPhotos/MapAds.png', alt: 'Map View' },
  { src: '/assets/AppPhotos/AdDetailView.png', alt: 'Detailed View of Promotions on Map' },
  { src: '/assets/AppPhotos/MapListView.png', alt: 'Map List View' },
  { src: '/assets/AppPhotos/DeviceViewOvercrowding.png', alt: 'Device View' },
  { src: '/assets/AppPhotos/LiveHistoricView.png', alt: 'Live Count History View' },
  { src: '/assets/AppPhotos/InsightsView.png', alt: 'Info for Historic View Average' },
  { src: '/assets/AppPhotos/OvercrowdingView.png', alt: 'Historic Count Page, scrolled down' },
  { src: '/assets/AppPhotos/AddaCounter.png', alt: 'Page when you want to add a counter' },
  { src: '/assets/AppPhotos/LocationSettings.png', alt: 'Total Count from multiple devices' },
  { src: '/assets/AppPhotos/DisconnectedDevice.png', alt: 'Disconnected device view' },
  { src: '/assets/AppPhotos/SettingsView.png', alt: 'Settings Page' },
  { src: '/assets/AppPhotos/AddDevice.png', alt: 'Add Device View' },
  { src: '/assets/AppPhotos/CreateAd.png', alt: 'View to Create a Promotion' },
  { src: '/assets/AppPhotos/CreateAdLower.png', alt: 'View to Create a Promotion, scrolled down' },
  { src: '/assets/AppPhotos/DeviceView.png', alt: 'Device View when not on Map' },
  { src: '/assets/AppPhotos/MapInfo.png', alt: 'Map Info Page' },
  { src: '/assets/AppPhotos/InfoPage.png', alt: 'Information Page' },
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
        <div id="secondary">We are <div id="primary">proud</div> to present...</div>
      </h3>
      <br />
      <h3 id="center" data-aos="fade-up">
        <div id="secondary">
          {/* Crowd Counter 1 */}
          <div className="text-box-legal" data-aos="fade-up">
            <img src="/assets/Icons/ellipsis.rectangle.fill.png" alt="Crowd Counter Icon" className="scaled-image-counter" /><br />
            <div id="primaryTitleBold">Crowd Counter 1</div>
            <br /><br />
            <div id="primary">Our flagship product</div>, complete and available to anyone. The Crowd Counter 1 is engineered to allow seamless install and use by anybody.
            <br />
            <br />The Crowd Counter 1 counts the number of people entering and exiting your location, <div id="primary">providing you with a live count of the number of people inside and the amount of entries.</div>
            <br />
            <br />Simply <div id="primary">place the small device above your door and let it do the rest.</div> Using its camera, it sends the footage to our powerful custom built in house NVIDIA servers (where we have consistently reached <div id="primary">99% accuracy</div>) for us to do the processing. That way, the device can remain inexpensive and reliable for our customers. In addition, we restrict our own access to the footage, ensuring your privacy is maintained at all times.
            <br />
            <br />Integrated with our wonderful <a id="primary" href="https://crowdcount.tech/app">iOS App</a> which allows you to access this information from anywhere and anytime. The app also serves as a tool to help you set it up for the first time, and add multiple if you have multiple entrances. If you would like to manage your existing counter on desktop or without the mobile app, we also have a <a href="https://counter.crowdcount.tech" target="_blank" rel="noopener noreferrer" id="primary">web interface</a> at your disposal.
            <br />
            <br />Check out our <div id="primary">beautiful design!</div> Gen 1.3 - Created January 27th, 2026
            <div data-aos="fade-up">
              <div className="text-box-legal gallery-container" id="counter-gallery">
                <PhotoGallery images={counterPhotos} />
              </div>
            </div>
            <br />While we are not yet shipping, <div id="primary">we are currently doing free installs in the Boulder/Denver area!</div> Send us an email at <a href="mailto:info@crowdcount.tech">info@crowdcount.tech</a> to learn more about it and potentially receive your own.
            <br />
            <br /><a href="mailto:info@crowdcount.tech" target="_blank" rel="noopener noreferrer" id="big-red-button" className="ripple">Apply</a>
            <br />
            <br />
          </div>

          {/* CrowdCount App */}
          <div className="text-box-legal" data-aos="fade-up">
            <img src="/assets/Logos/CrowdCount App Logo-iOS-Default-1024x1024@2x.png" alt="App Logo" className="scaled-image-app" /><br />
            <div id="primaryTitleBold">CrowdCount App</div><br /><br />
            <div id="primary">Our very own mobile App</div>, your personal companion for your Crowd Counter.
            <br />
            <br />The beautiful app, available for iOS, lets you seamlessly interact with your devices.
            <br />
            <br /><div id="primary">Features included</div> are, the ability to set up one or multiple devices, view live and historic counter data, modify it if needed, see total counts if you have multiple devices, run business promotions on the map, etc... <div id="primary">The list goes on.</div>
            <br />
            <br />Additionally, you can <div id="primary">view all public Crowd Counters on a map!</div> And be able to see how many people are in that location!
            <br />
            <div data-aos="fade-up">
              <div className="text-box-legal gallery-container" id="app-gallery">
                <PhotoGallery images={appPhotos} galleryId="photo-gallery" />
              </div>
            </div>
            Now available on the App Store!
            <br />
            <br /><a href="https://www.crowdcount.tech/app" target="_blank" rel="noopener noreferrer" id="big-red-button" className="ripple">Download Now</a>
            <br />
            <br />
            <div id="secondarySmall" style={{ display: 'block' }}>Want to help improve our app? <a href="https://www.crowdcount.tech/beta-app" target="_blank" rel="noopener noreferrer">Join our beta</a></div>
            <div id="secondarySmall" style={{ display: 'block', marginTop: '5px' }}>Want to manage your counters without the app? <a href="https://counter.crowdcount.tech" target="_blank" rel="noopener noreferrer">Use our web interface</a></div>
          </div>
        </div>
      </h3>
    </>
  );
}
