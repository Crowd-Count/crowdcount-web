'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import MenuLinks from '@/components/MenuLinks';
import TypewriterText from '@/components/TypewriterText';
import { API_BASE_URL, MAPKIT_TOKEN } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  MapKit JS global type declarations                                 */
/* ------------------------------------------------------------------ */
declare global {
  namespace mapkit {
    function init(options: { authorizationCallback: (done: (token: string) => void) => void }): void;
    class Coordinate {
      constructor(latitude: number, longitude: number);
      latitude: number;
      longitude: number;
    }
    class CoordinateSpan {
      constructor(latitudeDelta: number, longitudeDelta: number);
    }
    class CoordinateRegion {
      constructor(center: Coordinate, span: CoordinateSpan);
    }
    class Map {
      constructor(elementId: string, options?: any);
      addAnnotation(annotation: any): void;
      removeAnnotations(annotations: any[]): void;
      setRegionAnimated(region: CoordinateRegion, animate?: boolean): void;
      annotations: any[];
      static readonly ColorSchemes: { Dark: string; Light: string };
    }
    class MarkerAnnotation {
      constructor(coordinate: Coordinate, options?: any);
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface LocationData {
  location_id: string;
  location_name: string;
  location_latitude: number;
  location_longitude: number;
  current_count: number;
  location_comparison: string;
  location_color: string;
  overcrowding_limit: number | null;
  is_closed: boolean;
  devices?: [string, ...unknown[]][];
}

interface Ad {
  id?: string;
  title: string;
  description: string;
  image_path?: string;
  imagePath?: string;
  device_id?: string;
  deviceId?: string;
  primary_device?: string;
  primaryDevice?: string;
  cta_text?: string;
  ctaText?: string;
  cta_link_type?: string;
  ctaLinkType?: string;
  cta_url?: string;
  ctaURL?: string;
  expiration_date?: string;
  expirationDate?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getAdField(ad: Ad, camelCase: string, snakeCase: string): string | undefined {
  return (ad as any)[camelCase] ?? (ad as any)[snakeCase];
}

function getComparisonSymbol(comparison: string): string {
  switch (comparison) {
    case 'up': return '\u2191';
    case 'down': return '\u2193';
    default: return '';
  }
}

function getComparisonClass(comparison: string): string {
  switch (comparison) {
    case 'up': return 'comparison-up';
    case 'down': return 'comparison-down';
    default: return '';
  }
}

function getMarkerColor(colorName: string): string {
  const colorMap: Record<string, string> = {
    red: '#FF3B30', orange: '#FF9500', yellow: '#FFCC00', green: '#34C759',
    mint: '#00C7BE', teal: '#30B0C7', cyan: '#32ADE6', blue: '#007AFF',
    indigo: '#5856D6', purple: '#AF52DE', pink: '#FF2D55', brown: '#A2845E',
    gray: '#8E8E93', primary: '#007AFF',
  };
  return colorMap[colorName?.toLowerCase()] || '#007AFF';
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getAdImageUrl(imagePath: string | undefined): string | null {
  if (!imagePath) return null;
  const filename = imagePath.split('/').pop();
  return `${API_BASE_URL}/ad-images/${filename}`;
}

function parseExpirationDate(dateString: string | undefined): Date | null {
  if (!dateString) return null;
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) return date;
  date = new Date(dateString.replace(/\.\d+/, ''));
  if (!isNaN(date.getTime())) return date;
  return null;
}

function formatCountdown(expirationDate: string | undefined): { text: string; isExpiringSoon: boolean } {
  const expDate = parseExpirationDate(expirationDate);
  if (!expDate) return { text: 'N/A', isExpiringSoon: false };
  const diff = expDate.getTime() - Date.now();
  if (diff <= 0) return { text: 'Expired', isExpiringSoon: true };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  if (hours >= 1) return { text: `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, isExpiringSoon: false };
  return { text: `${minutes}:${seconds.toString().padStart(2, '0')}`, isExpiringSoon: true };
}

function generateReferenceNumber(adId: string): string {
  let hash = 0;
  for (let i = 0; i < adId.length; i++) {
    hash = ((hash << 5) - hash) + adId.charCodeAt(i);
    hash = hash & hash;
  }
  return 'REF-' + Math.abs(hash).toString().slice(0, 8).padStart(8, '0');
}

async function trackAdClick(adId: string) {
  try {
    await fetch(`${API_BASE_URL}/track-ad-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId }),
    });
  } catch { /* silent */ }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function MapPage() {
  const mapRef = useRef<mapkit.Map | null>(null);
  const mapInitializedRef = useRef(false);

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [listVisible, setListVisible] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [modalAd, setModalAd] = useState<Ad | null>(null);

  /* ---- Fetch locations ---- */
  const fetchLocations = useCallback(async (): Promise<LocationData[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/get_all_location_data_with_extra`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      return data.locations || [];
    } catch {
      return [];
    }
  }, []);

  /* ---- Fetch ads ---- */
  const fetchAds = useCallback(async (): Promise<Ad[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/get-active-ads`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      let adsList: Ad[] = Array.isArray(data) ? data : (data.ads || data.data || []);
      adsList = adsList.map((ad, index) => {
        if (!ad.id) {
          const deviceId = ad.device_id || ad.deviceId;
          ad.id = deviceId ? `ad-${deviceId}` : `ad-${index}-${Date.now()}`;
        }
        return ad;
      });
      return adsList;
    } catch {
      return [];
    }
  }, []);

  /* ---- Get user location ---- */
  const getUserLocation = useCallback((): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('Not supported')); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    });
  }, []);

  /* ---- Sort ads by distance ---- */
  const sortAdsByDistance = useCallback((adsList: Ad[], userLat: number, userLon: number, allLocs: LocationData[]): Ad[] => {
    if (!allLocs.length) return adsList;
    const deviceLocationMap = new Map<string, { lat: number; lon: number }>();
    allLocs.forEach(loc => {
      if (loc.devices && Array.isArray(loc.devices)) {
        loc.devices.forEach(([did]) => {
          deviceLocationMap.set(did as string, { lat: loc.location_latitude, lon: loc.location_longitude });
        });
      }
    });
    return [...adsList].sort((a, b) => {
      const dA = getAdField(a, 'primaryDevice', 'primary_device') || getAdField(a, 'deviceId', 'device_id');
      const dB = getAdField(b, 'primaryDevice', 'primary_device') || getAdField(b, 'deviceId', 'device_id');
      const locA = dA ? deviceLocationMap.get(dA) : undefined;
      const locB = dB ? deviceLocationMap.get(dB) : undefined;
      if (!locA && !locB) return 0;
      if (!locA) return 1;
      if (!locB) return -1;
      return calculateDistance(userLat, userLon, locA.lat, locA.lon) - calculateDistance(userLat, userLon, locB.lat, locB.lon);
    });
  }, []);

  /* ---- Fit all markers ---- */
  const fitAllMarkers = useCallback((locs: LocationData[]) => {
    if (!locs.length || !mapRef.current) return;
    let minLat = locs[0].location_latitude, maxLat = locs[0].location_latitude;
    let minLon = locs[0].location_longitude, maxLon = locs[0].location_longitude;
    locs.forEach(l => {
      minLat = Math.min(minLat, l.location_latitude);
      maxLat = Math.max(maxLat, l.location_latitude);
      minLon = Math.min(minLon, l.location_longitude);
      maxLon = Math.max(maxLon, l.location_longitude);
    });
    const region = new mapkit.CoordinateRegion(
      new mapkit.Coordinate((minLat + maxLat) / 2, (minLon + maxLon) / 2),
      new mapkit.CoordinateSpan(Math.max(0.01, (maxLat - minLat) * 1.5), Math.max(0.01, (maxLon - minLon) * 1.5))
    );
    mapRef.current.setRegionAnimated(region);
  }, []);

  /* ---- MapKit init + load everything ---- */
  const onMapkitLoad = useCallback(() => {
    if (mapInitializedRef.current) return;
    mapInitializedRef.current = true;

    mapkit.init({ authorizationCallback: (done) => done(MAPKIT_TOKEN) });

    const map = new mapkit.Map('map', {
      center: new mapkit.Coordinate(39.8283, -98.5795),
      colorScheme: mapkit.Map.ColorSchemes.Dark,
      showsZoomControl: false,
      showsMapTypeControl: false,
    });
    mapRef.current = map;

    (async () => {
      const locs = await fetchLocations();
      setLocations(locs);
      const adsList = await fetchAds();

      // Add annotations
      locs.forEach(loc => {
        let subtitle: string;
        if (loc.is_closed) {
          subtitle = 'Closed';
        } else {
          subtitle = `Count: ${loc.current_count}`;
          if (loc.overcrowding_limit != null) subtitle += ` / ${loc.overcrowding_limit}`;
          const sym = getComparisonSymbol(loc.location_comparison);
          if (sym) subtitle += ` ${sym}`;
        }
        map.addAnnotation(new mapkit.MarkerAnnotation(
          new mapkit.Coordinate(loc.location_latitude, loc.location_longitude),
          { title: loc.location_name, subtitle, color: getMarkerColor(loc.location_color) }
        ));
      });

      // Try user location for map center + sorting
      let userLoc: { lat: number; lon: number } | null = null;
      try {
        userLoc = await getUserLocation();
        setUserLocation(userLoc);
        map.setRegionAnimated(new mapkit.CoordinateRegion(
          new mapkit.Coordinate(userLoc.lat, userLoc.lon),
          new mapkit.CoordinateSpan(0.05, 0.05)
        ));
      } catch {
        fitAllMarkers(locs);
      }

      let sortedAds = adsList;
      if (userLoc && locs.length > 0) {
        sortedAds = sortAdsByDistance(adsList, userLoc.lat, userLoc.lon, locs);
      }
      setAds(sortedAds);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Auto-refresh locations every 30s ---- */
  useEffect(() => {
    const interval = setInterval(async () => {
      const locs = await fetchLocations();
      setLocations(locs);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchLocations]);

  /* ---- Center map on a location ---- */
  const centerMapOnLocation = useCallback((lat: number, lon: number) => {
    if (!mapRef.current) return;
    mapRef.current.setRegionAnimated(new mapkit.CoordinateRegion(
      new mapkit.Coordinate(lat, lon),
      new mapkit.CoordinateSpan(0.003, 0.003)
    ));
    document.getElementById('map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  /* ---- Get ad location from allLocations ---- */
  const getAdLocation = useCallback((ad: Ad): { name: string; lat: number; lon: number } | null => {
    const deviceId = getAdField(ad, 'primaryDevice', 'primary_device') || getAdField(ad, 'deviceId', 'device_id');
    if (!deviceId) return null;
    const loc = locations.find(l => l.devices?.some(([did]) => did === deviceId));
    if (loc) return { name: loc.location_name, lat: loc.location_latitude, lon: loc.location_longitude };
    return null;
  }, [locations]);

  /* ---- Handle ad CTA click ---- */
  const handleAdCtaClick = useCallback((ad: Ad) => {
    trackAdClick(ad.id || '');
    const ctaLinkType = getAdField(ad, 'ctaLinkType', 'cta_link_type');
    const ctaURL = getAdField(ad, 'ctaURL', 'cta_url');
    if (ctaLinkType === 'custom' && ctaURL) {
      window.open(ctaURL, '_blank');
    } else {
      setModalAd(ad);
    }
  }, []);

  /* ---- Filter & sort locations ---- */
  const filteredLocations = searchTerm
    ? locations.filter(l => l.location_name.toLowerCase().includes(searchTerm.toLowerCase()))
    : locations;

  const sortedLocations = [...filteredLocations].sort((a, b) => {
    if (userLocation) {
      return calculateDistance(userLocation.lat, userLocation.lon, a.location_latitude, a.location_longitude) -
             calculateDistance(userLocation.lat, userLocation.lon, b.location_latitude, b.location_longitude);
    }
    return a.location_name.localeCompare(b.location_name);
  });

  return (
    <>
      <Script
        src="https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js"
        strategy="afterInteractive"
        onLoad={onMapkitLoad}
      />

      <header className="d-flex flex-column" data-aos="fade-down">
        <div className="text-center">
          <div id="MediumHomeTitle" className="d-inline-block">
            <TypewriterText text="Map" id="CrowdCountMAP" />
          </div>
        </div>
        <MenuLinks />
      </header>

      <h3 id="center" data-aos="fade-up">
        <div id="secondary">Here is a map of all our public users! <div id="primary">See the live counts by clicking on the locations.</div></div>
      </h3>
      <br />

      <h3 id="center" data-aos="fade-up">
        <div id="secondary">
          <div id="map-container">
            <div id="map" data-aos="fade-up"></div>
          </div>
        </div>
      </h3>

      <br />

      {/* Promo Carousel - only shown when promotions exist */}
      {ads.length > 0 && (
        <h3 id="center">
          <PromoCarousel
            ads={ads}
            onCardClick={handleAdCtaClick}
          />
        </h3>
      )}

      {/* Location List */}
      <h3 id="center">
        <div className="text-box-legal" data-aos="fade-up" data-aos-delay="150">
          <div id="secondary">
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <div style={{ flex: 1 }}></div>
              <div id="primary" style={{ flex: '0 0 auto' }}>Location List</div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <span
                  onClick={() => setListVisible(!listVisible)}
                  style={{ cursor: 'pointer', color: 'var(--gray-color)', transition: 'color 0.3s ease' }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--light-color)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--gray-color)')}
                >
                  {listVisible ? 'Hide' : 'Show'}
                </span>
              </div>
            </div>
            <br />
            {listVisible && (
              <div id="location-list-content">
                <input
                  type="text"
                  id="location-search"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="location-list" id="locations-container">
                  {locations.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--gray-color)' }}>Loading locations...</div>
                  ) : sortedLocations.length === 0 ? (
                    <div className="no-results">
                      <div className="no-results-icon"></div>
                      <p>No locations found</p>
                    </div>
                  ) : (
                    sortedLocations.map(loc => (
                      <div
                        key={loc.location_id}
                        className="location-item"
                        onClick={() => centerMapOnLocation(loc.location_latitude, loc.location_longitude)}
                      >
                        <span className="location-color-dot" style={{ backgroundColor: getMarkerColor(loc.location_color || '') }}></span>
                        <span className="location-name">{loc.location_name}</span>
                        <div className="location-stats">
                          {loc.is_closed ? (
                            <span className="location-closed">Closed</span>
                          ) : (
                            <>
                              <span className="location-count-label">Count:</span>
                              <span className="location-count-number">{loc.current_count}</span>
                              {loc.overcrowding_limit != null && (
                                <span className="location-overcrowding"> / {loc.overcrowding_limit}</span>
                              )}
                              {getComparisonSymbol(loc.location_comparison) && (
                                <span className={getComparisonClass(loc.location_comparison)}>
                                  {getComparisonSymbol(loc.location_comparison)}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="location-sort-footer">
                  {userLocation ? 'Sorted by distance' : 'Sorted alphabetically'}
                </div>
              </div>
            )}
          </div>
        </div>
      </h3>

      <h3 id="center">
        <div className="text-box-container" data-aos="fade-up" data-aos-delay="250">
          <div className="text-box">
            <div id="secondary"><div id="primary">Something wrong?</div> Please fill out a report at <Link href="/report">crowdcount.tech/report</Link></div>
          </div>
          <div className="text-box">
            <div id="secondary"><div id="primary">Want to see a better map?</div> Start using our new iOS App today at <Link href="/app">crowdcount.tech/app</Link></div>
          </div>
          <div className="text-box">
            <div id="secondary"><div id="primary">Want to add your own location?</div> Please send a message to <a href="mailto:info@crowdcount.tech">info@crowdcount.tech</a></div>
          </div>
        </div>
        <div className="text-box-legal" data-aos="fade-up" data-aos-delay="300">
          <div id="secondary">
            Here is some information regarding the map
            <br /><br /><div id="primary">{'\u2191\u2193'} Comparisons</div>
            <br />These arrows indicate whether the current location population is more or less crowded than usual at this given time and day ({'\u00B1'}25%).
            <br /><br /><div id="primary">/ # Overcrowding Indicator</div>
            <br />The number that can be displayed after the slash on certain locations shows the maximum amount of people that this location can hold (it is inputted by the business and is in no way an official or legal limit).
            <br /><br /><div id="primary">Sponsored Promotions</div>
            <br />The promotions carousel displays sponsored content from local businesses. All promotions are reviewed and approved by our team before appearing. Each promotion runs for a set duration shown by the countdown timer. Promotions are sorted by distance, so you&apos;ll see the closest ones first.
          </div>
        </div>
      </h3>

      {/* Promo Detail Modal */}
      {modalAd && (
        <PromoModal
          ad={modalAd}
          adLocation={getAdLocation(modalAd)}
          onClose={() => setModalAd(null)}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Promo Carousel                                                     */
/* ------------------------------------------------------------------ */
function PromoCarousel({ ads, onCardClick }: { ads: Ad[]; onCardClick: (ad: Ad) => void }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  const updateDots = useCallback(() => {
    const el = carouselRef.current;
    if (!el || ads.length <= 1) return;
    const total = el.scrollWidth - el.clientWidth;
    const fraction = total > 0 ? el.scrollLeft / total : 0;
    setActiveDot(Math.round(fraction * (ads.length - 1)));
  }, [ads.length]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateDots);
    return () => el.removeEventListener('scroll', updateDots);
  }, [updateDots]);

  const moveGallery = (direction: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const total = el.scrollWidth - el.clientWidth;
    const step = ads.length > 1 ? total / (ads.length - 1) : total;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  const scrollToDot = (index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const total = el.scrollWidth - el.clientWidth;
    const pos = ads.length > 1 ? (total / (ads.length - 1)) * index : 0;
    el.scrollTo({ left: pos, behavior: 'smooth' });
  };

  return (
    <div className="text-box-legal gallery-container" data-aos="fade-up" data-aos-delay="100">
      <div style={{ textAlign: 'left' }}>
        <div id="secondary" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Promotions</div>
        <div className="promo-carousel" ref={carouselRef}>
          {ads.map((ad, i) => (
            <PromoCard key={ad.id || i} ad={ad} index={i} onClick={() => onCardClick(ad)} />
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          {ads.length > 1 && (
            <>
              <div className="dots-container" style={{ marginTop: '10px' }}>
                {ads.map((_, i) => (
                  <span key={i} className={`dot ${i === activeDot ? 'active' : ''}`} onClick={() => scrollToDot(i)}></span>
                ))}
              </div>
              <div className="gallery-controls">
                <button className="gallery-arrow prev-button" aria-label="Previous Promo" style={{ marginTop: '5px', paddingTop: 0, paddingBottom: 0 }} onClick={() => moveGallery(-1)}>&lt;</button>
                <button className="gallery-arrow next-button" aria-label="Next Promo" style={{ marginTop: '5px', paddingTop: 0, paddingBottom: 0 }} onClick={() => moveGallery(1)}>&gt;</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Promo Card                                                         */
/* ------------------------------------------------------------------ */
function PromoCard({ ad, index, onClick }: { ad: Ad; index: number; onClick: () => void }) {
  const [countdown, setCountdown] = useState(() => formatCountdown(getAdField(ad, 'expirationDate', 'expiration_date')));

  useEffect(() => {
    const exp = getAdField(ad, 'expirationDate', 'expiration_date');
    const interval = setInterval(() => {
      const cd = formatCountdown(exp);
      setCountdown(cd);
      if (cd.text === 'Expired') clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [ad]);

  const imagePath = getAdField(ad, 'imagePath', 'image_path');
  const ctaText = getAdField(ad, 'ctaText', 'cta_text') || 'View Details';
  const imageUrl = getAdImageUrl(imagePath);

  return (
    <div className="promo-card" data-promo-id={ad.id} data-promo-index={index}>
      <div className="promo-card-image">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={ad.title} onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const next = (e.target as HTMLElement).nextElementSibling as HTMLElement;
              if (next) next.style.display = 'flex';
            }} />
            <div className="promo-card-image-placeholder" style={{ display: 'none' }}>📍</div>
          </>
        ) : (
          <div className="promo-card-image-placeholder">📍</div>
        )}
      </div>
      <div className="promo-card-content">
        <div className="promo-card-title">{ad.title}</div>
        <div className="promo-card-description">{ad.description}</div>
        <div className="promo-card-actions">
          <button className="promo-card-cta" onClick={(e) => { e.stopPropagation(); onClick(); }}>{ctaText}</button>
          <div className={`promo-card-countdown ${countdown.isExpiringSoon ? 'expiring-soon' : ''}`}>
            <span className="promo-card-countdown-icon">⏱</span>
            <span className="promo-card-countdown-time">{countdown.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Promo Modal                                                        */
/* ------------------------------------------------------------------ */
function PromoModal({ ad, adLocation, onClose }: {
  ad: Ad;
  adLocation: { name: string; lat: number; lon: number } | null;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const imagePath = getAdField(ad, 'imagePath', 'image_path');
  const imageUrl = getAdImageUrl(imagePath);

  const openDirections = () => {
    if (adLocation) {
      window.open(`https://maps.apple.com/?daddr=${adLocation.lat},${adLocation.lon}&dirflg=d&t=m`, '_blank');
    } else {
      window.open(`https://maps.apple.com/?q=${encodeURIComponent(ad.title)}`, '_blank');
    }
  };

  return (
    <div className="promo-modal-overlay visible" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
        <button className="promo-modal-close" onClick={onClose}>&times;</button>
        <div className="promo-modal-content">
          <div className="promo-modal-logos">
            <div className="promo-modal-logo no-bg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/Logos/CrowdCount-Rounded-Logo.png" alt="CrowdCount" />
            </div>
            <div className="promo-modal-divider"></div>
            <div className="promo-modal-logo" id="promo-modal-image">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={ad.title} onError={(e) => {
                  (e.target as HTMLElement).parentElement!.innerHTML = '<div class="promo-modal-image-placeholder">📍</div>';
                }} />
              ) : (
                <div className="promo-modal-image-placeholder">📍</div>
              )}
            </div>
          </div>
          <div className="promo-modal-label">Sponsored Content</div>
          <div className="promo-modal-title">{ad.title}</div>
          <div className="promo-modal-description">{ad.description}</div>
          {adLocation && (
            <button className="promo-modal-directions" onClick={openDirections}>Get Directions</button>
          )}
          <div className="promo-modal-reference">{generateReferenceNumber(ad.id || '')}</div>
        </div>
      </div>
    </div>
  );
}
