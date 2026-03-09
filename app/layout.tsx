import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'aos/dist/aos.css';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AlertBanner from '@/components/AlertBanner';
import AosInit from '@/components/AosInit';
import BootstrapJs from '@/components/BootstrapJs';
import BodyIdSetter from '@/components/BodyIdSetter';

export const metadata: Metadata = {
  metadataBase: new URL('https://crowdcount.tech'),
  title: {
    default: 'CrowdCount',
    template: '%s - CrowdCount',
  },
  description: 'CrowdCount offers accurate crowd counting solutions. Discover the best crowd counting technology for a wide range of applications.',
  keywords: 'Crowd Count, crowd counting, crowdcounting, crowd count, crowd counter, crowd counting solutions, event crowd counter, venue crowd counter, CrowdCount, count crowd, CountCrowd, crowd check, crowdcount app, crowd counting app, crowd check app, app, device',
  openGraph: {
    title: 'CrowdCount',
    description: 'CrowdCount offers accurate crowd counting solutions. Discover the best crowd counting technology for a wide range of applications.',
    type: 'website',
    siteName: 'CrowdCount',
    images: ['/assets/Logos/banner.png'],
  },
  icons: {
    icon: [
      { url: '/assets/Favicon-Icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/Favicon-Icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/Favicon-Icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/Favicon-Icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/assets/Favicon-Icons/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet" />
      </head>
      <body data-aos-easing="ease" data-aos-duration="1000">
        <AosInit />
        <BootstrapJs />
        <BodyIdSetter />
        <AlertBanner />
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
