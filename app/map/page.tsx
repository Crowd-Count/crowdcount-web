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
      setCenterAnimated(center: Coordinate, animate?: boolean): void;
      annotations: any[];
      static readonly ColorSchemes: { Dark: string; Light: string };
    }

    class MarkerAnnotation {
      constructor(coordinate: Coordinate, options?: any);
      coordinate: Coordinate;
      title: string;
      subtitle: string;
      color: string;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface LocationData {
  location_name: string;
  location_latitude: number;
  location_longitude: number;
  location_current_count: number;
  location_comparison: string;
  location_color: string;
  location_overcrowding_count: string;
  location_id?: string;
}

interface MapLocation {
  name: string;
  latitude: number;
  longitude: number;
  currentCount: number;
  comparison: string;
  color: string;
  overcrowding: number | null;
  locationId?: string;
  distance?: number;
}

interface Ad {
  id: string;
  business_name: string;
  title: string;
  description: string;
  cta_text: string;
  cta_url: string;
  image_url: string;
  logo_url: string;
  start_date: string;
  end_date: string;
  latitude: number;
  longitude: number;
  location_name?: string;
}

/* ------------------------------------------------------------------ */
/*  Helper functions                                                   */
/* ------------------------------------------------------------------ */
function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getMarkerColor(colorName: string): string {
  const colorMap: Record<string, string> = {
    red: '#FF3B30',
    orange: '#FF9500',
    yellow: '#FFCC00',
    green: '#34C759',
    mint: '#00C7BE',
    teal: '#30B0C7',
    cyan: '#32ADE6',
    blue: '#007AFF',
    indigo: '#5856D6',
    purple: '#AF52DE',
    pink: '#FF2D55',
    brown: '#A2845E',
    primary: '#000000',
  };
  return colorMap[colorName.toLowerCase()] || '#8E8E93';
}

function getComparisonSymbol(comparison: string): string {
  switch (comparison) {
    case 'up': return '\u2191';
    case 'down': return '\u2193';
    case 'neutral': return '';
    default: return '';
  }
}

function getComparisonColor(comparison: string): string {
  switch (comparison) {
    case 'up': return 'green';
    case 'down': return 'red';
    case 'neutral': return 'gray';
    default: return 'gray';
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatCountdown(endDateStr: string): string {
  const now = Date.now();
  const end = new Date(endDateStr).getTime();
  const diff = end - now;
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function MapPage() {
  // Map state
  const mapRef = useRef<mapkit.Map | null>(null);
  const mapInitializedRef = useRef(false);
  const locationsRef = useRef<MapLocation[]>([]);
  const userLatRef = useRef<number | null>(null);
  const userLonRef = useRef<number | null>(null);

  // UI state
  const [mapkitReady, setMapkitReady] = useState(false);
  const [locationListVisible, setLocationListVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [locationItems, setLocationItems] = useState<MapLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<MapLocation[]>([]);

  // Ad state
  const [ads, setAds] = useState<Ad[]>([]);
  const [adCarouselIndex, setAdCarouselIndex] = useState(0);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const adIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, forceUpdate] = useState(0); // for countdown re-renders

  /* ---------------------------------------------------------------- */
  /*  MapKit initialization                                            */
  /* ---------------------------------------------------------------- */
  const onMapkitLoad = useCallback(() => {
    if (mapInitializedRef.current) return;
    mapInitializedRef.current = true;

    mapkit.init({
      authorizationCallback: (done) => {
        done(MAPKIT_TOKEN);
      },
    });

    const map = new mapkit.Map('map', {
      center: new mapkit.Coordinate(40.01833, -105.28202),
      colorScheme: mapkit.Map.ColorSchemes.Dark,
    });

    mapRef.current = map;
    setMapkitReady(true);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Fetch locations                                                  */
  /* ---------------------------------------------------------------- */
  const fetchLocations = useCallback(async (): Promise<MapLocation[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/get_all_location_data_with_extra`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      const rawLocations: LocationData[] = data.locations || [];

      return rawLocations.map((loc) => {
        let overcrowding: number | null = null;
        if (loc.location_overcrowding_count !== 'N/A') {
          const parsed = parseInt(loc.location_overcrowding_count);
          if (!isNaN(parsed)) overcrowding = parsed;
        }
        return {
          name: loc.location_name,
          latitude: loc.location_latitude,
          longitude: loc.location_longitude,
          currentCount: loc.location_current_count,
          comparison: loc.location_comparison,
          color: loc.location_color,
          overcrowding,
          locationId: loc.location_id,
        };
      });
    } catch (err) {
      console.error('Fetch error:', err);
      return [];
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Display locations on the map                                     */
  /* ---------------------------------------------------------------- */
  const displayLocations = useCallback(
    (locations: MapLocation[]) => {
      const map = mapRef.current;
      if (!map) return;

      // Remove existing annotations
      if (map.annotations && map.annotations.length > 0) {
        map.removeAnnotations(map.annotations);
      }

      locations.forEach((loc) => {
        const comparisonSymbol = getComparisonSymbol(loc.comparison);
        let subtitle = `Count: ${loc.currentCount}`;
        if (loc.overcrowding !== null) {
          subtitle += ` / ${loc.overcrowding}`;
        }
        if (comparisonSymbol) {
          subtitle += ` ${comparisonSymbol}`;
        }

        const annotation = new mapkit.MarkerAnnotation(
          new mapkit.Coordinate(loc.latitude, loc.longitude),
          {
            title: loc.name,
            subtitle,
            color: getMarkerColor(loc.color),
          }
        );

        map.addAnnotation(annotation);
      });

      // Set map region
      const newCenter = new mapkit.Coordinate(40.00907, -105.27124);
      const newSpan = new mapkit.CoordinateSpan(0.035, 0.035);
      const newRegion = new mapkit.CoordinateRegion(newCenter, newSpan);
      map.setRegionAnimated(newRegion);
    },
    []
  );

  /* ---------------------------------------------------------------- */
  /*  Center map on location                                           */
  /* ---------------------------------------------------------------- */
  const centerMapOnLocation = useCallback((lat: number, lon: number) => {
    const map = mapRef.current;
    if (!map) return;
    const center = new mapkit.Coordinate(lat, lon);
    const span = new mapkit.CoordinateSpan(0.005, 0.005);
    const region = new mapkit.CoordinateRegion(center, span);
    map.setRegionAnimated(region);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Populate and filter location list                                */
  /* ---------------------------------------------------------------- */
  const populateLocationList = useCallback(
    (locations: MapLocation[]) => {
      let processed = locations.map((loc) => {
        const dist =
          userLatRef.current !== null && userLonRef.current !== null
            ? calculateDistance(userLatRef.current, userLonRef.current, loc.latitude, loc.longitude)
            : undefined;
        return { ...loc, distance: dist };
      });

      // Sort by distance if available
      if (userLatRef.current !== null) {
        processed.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      }

      setLocationItems(processed);
      setFilteredLocations(processed);
    },
    []
  );

  const filterLocations = useCallback(
    (query: string, filter: string) => {
      let results = [...locationItems];

      // Text search
      if (query) {
        const q = query.toLowerCase();
        results = results.filter((loc) => loc.name.toLowerCase().includes(q));
      }

      // Filter option
      if (filter === 'open') {
        results = results.filter((loc) => loc.currentCount > 0);
      } else if (filter === 'overcrowding') {
        results = results.filter(
          (loc) => loc.overcrowding !== null && loc.currentCount >= loc.overcrowding
        );
      } else if (filter === 'not-busy') {
        results = results.filter((loc) => loc.comparison === 'down');
      } else if (filter === 'busy') {
        results = results.filter((loc) => loc.comparison === 'up');
      }

      setFilteredLocations(results);
    },
    [locationItems]
  );

  // Re-filter when query/filter changes
  useEffect(() => {
    filterLocations(searchQuery, filterOption);
  }, [searchQuery, filterOption, filterLocations]);

  /* ---------------------------------------------------------------- */
  /*  Toggle location list                                             */
  /* ---------------------------------------------------------------- */
  const toggleLocationList = useCallback(() => {
    setLocationListVisible((prev) => !prev);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Refresh location list                                            */
  /* ---------------------------------------------------------------- */
  const refreshLocationList = useCallback(async () => {
    const locations = await fetchLocations();
    locationsRef.current = locations;
    displayLocations(locations);
    populateLocationList(locations);
  }, [fetchLocations, displayLocations, populateLocationList]);

  /* ---------------------------------------------------------------- */
  /*  Fetch active ads                                                 */
  /* ---------------------------------------------------------------- */
  const fetchActiveAds = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get-active-ads`);
      if (!res.ok) throw new Error('Failed to fetch ads');
      const data = await res.json();
      let adList: Ad[] = data.ads || [];

      // Sort by distance from user if available
      if (userLatRef.current !== null && userLonRef.current !== null) {
        adList = adList.map((ad) => ({
          ...ad,
          _distance: calculateDistance(
            userLatRef.current!,
            userLonRef.current!,
            ad.latitude,
            ad.longitude
          ),
        })).sort((a: any, b: any) => a._distance - b._distance);
      }

      setAds(adList);
    } catch (err) {
      console.error('Error fetching ads:', err);
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Ad carousel controls                                             */
  /* ---------------------------------------------------------------- */
  const nextAd = useCallback(() => {
    setAdCarouselIndex((prev) => (ads.length > 0 ? (prev + 1) % ads.length : 0));
  }, [ads.length]);

  const prevAd = useCallback(() => {
    setAdCarouselIndex((prev) => (ads.length > 0 ? (prev - 1 + ads.length) % ads.length : 0));
  }, [ads.length]);

  // Auto-rotate ad carousel every 8 seconds
  useEffect(() => {
    if (ads.length <= 1) return;
    if (adIntervalRef.current) clearInterval(adIntervalRef.current);
    adIntervalRef.current = setInterval(nextAd, 8000);
    return () => {
      if (adIntervalRef.current) clearInterval(adIntervalRef.current);
    };
  }, [ads.length, nextAd]);

  // Countdown timer refresh every 60 seconds
  useEffect(() => {
    if (ads.length === 0) return;
    countdownIntervalRef.current = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 60000);
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [ads.length]);

  /* ---------------------------------------------------------------- */
  /*  Ad modal                                                         */
  /* ---------------------------------------------------------------- */
  const openAdModal = useCallback((ad: Ad) => {
    setSelectedAd(ad);
    setAdModalOpen(true);
  }, []);

  const closeAdModal = useCallback(() => {
    setAdModalOpen(false);
    setSelectedAd(null);
  }, []);

  const openAdDirections = useCallback((ad: Ad) => {
    const url = `https://maps.apple.com/?daddr=${ad.latitude},${ad.longitude}`;
    window.open(url, '_blank');
  }, []);

  const handleAdCta = useCallback((ad: Ad) => {
    if (ad.cta_url) {
      window.open(ad.cta_url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  User geolocation                                                 */
  /* ---------------------------------------------------------------- */
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLatRef.current = position.coords.latitude;
        userLonRef.current = position.coords.longitude;
        // Re-sort locations by distance
        if (locationsRef.current.length > 0) {
          populateLocationList(locationsRef.current);
        }
        // Re-sort ads by distance
        fetchActiveAds();
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
      }
    );
  }, [populateLocationList, fetchActiveAds]);

  /* ---------------------------------------------------------------- */
  /*  Init: load map, fetch data, geolocate                            */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!mapkitReady) return;

    const init = async () => {
      const locations = await fetchLocations();
      locationsRef.current = locations;
      displayLocations(locations);
      populateLocationList(locations);
      getUserLocation();
      fetchActiveAds();
    };

    init();
  }, [mapkitReady, fetchLocations, displayLocations, populateLocationList, getUserLocation, fetchActiveAds]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  const currentAd = ads.length > 0 ? ads[adCarouselIndex] : null;

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
            <TypewriterText text="CrowdCount Map" id="CrowdCountMAP" hideCursorAfter={3800} />
          </div>
        </div>
        <MenuLinks />
      </header>

      <h3 id="center" data-aos="fade-up">
        <div id="secondary">
          Here is a map of all our public users!{' '}
          <div id="primaryBold">See the live counts by clicking on the locations.</div>
        </div>
      </h3>
      <br />

      {/* Map Container */}
      <h3 id="center" data-aos="fade-up">
        <div id="secondary">
          <div id="map-container">
            <div id="map" data-aos="fade-up" />
          </div>
        </div>
      </h3>

      {/* Location List Toggle */}
      <div id="center" style={{ marginTop: '15px', marginBottom: '10px' }}>
        <button
          id="big-red-button"
          className="ripple"
          onClick={toggleLocationList}
          style={{ fontSize: '0.9rem', padding: '10px 25px' }}
        >
          {locationListVisible ? 'Hide Location List' : 'Show Location List'}
        </button>
        <button
          className="ripple"
          onClick={refreshLocationList}
          style={{
            fontSize: '0.9rem',
            padding: '10px 25px',
            marginLeft: '10px',
            background: 'transparent',
            border: '1px solid var(--accent-color)',
            color: 'var(--accent-color)',
            borderRadius: '25px',
            cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      </div>

      {/* Location List */}
      {locationListVisible && (
        <div id="center" data-aos="fade-up">
          <div className="text-box-legal" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div id="primaryTitleBold">Locations</div>
            <br />

            {/* Search and Filter */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: '1',
                  minWidth: '180px',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'inherit',
                  fontSize: '0.85rem',
                }}
              />
              <select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'inherit',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All</option>
                <option value="open">Has People</option>
                <option value="busy">Busier Than Usual</option>
                <option value="not-busy">Less Busy</option>
                <option value="overcrowding">At Capacity</option>
              </select>
            </div>

            {/* Location items */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredLocations.length === 0 ? (
                <div id="secondary" style={{ textAlign: 'center', padding: '20px' }}>
                  No locations found.
                </div>
              ) : (
                filteredLocations.map((loc, i) => {
                  const compSymbol = getComparisonSymbol(loc.comparison);
                  const compColor = getComparisonColor(loc.comparison);
                  const countLabel =
                    loc.overcrowding !== null
                      ? `${loc.currentCount} / ${loc.overcrowding}`
                      : `${loc.currentCount}`;

                  return (
                    <div
                      key={loc.name + '-' + i}
                      onClick={() => {
                        centerMapOnLocation(loc.latitude, loc.longitude);
                        setLocationListVisible(false);
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: getMarkerColor(loc.color),
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{escapeHtml(loc.name)}</div>
                          {loc.distance !== undefined && (
                            <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '2px' }}>
                              {loc.distance.toFixed(1)} mi away
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {countLabel}
                          {compSymbol && (
                            <span style={{ color: compColor, marginLeft: '4px' }}>{compSymbol}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ad Carousel */}
      {ads.length > 0 && (
        <div id="center" style={{ marginTop: '25px' }} data-aos="fade-up">
          <div className="text-box-legal" style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <div id="secondary" style={{ textAlign: 'center', marginBottom: '12px', fontSize: '0.75rem', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Promoted
            </div>

            {currentAd && (
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => openAdModal(currentAd)}
              >
                {/* Ad Image */}
                {currentAd.image_url && (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
                    <img
                      src={currentAd.image_url}
                      alt={currentAd.title}
                      style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                )}

                {/* Ad Content */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  {currentAd.logo_url && (
                    <img
                      src={currentAd.logo_url}
                      alt={currentAd.business_name}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{escapeHtml(currentAd.title)}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{escapeHtml(currentAd.business_name)}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '10px' }}>
                  {escapeHtml(currentAd.description)}
                </div>

                {/* Countdown + CTA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                    {formatCountdown(currentAd.end_date)}
                  </span>
                  {currentAd.cta_text && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdCta(currentAd);
                      }}
                      style={{
                        background: 'var(--accent-color)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '6px 18px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {currentAd.cta_text}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Carousel Controls */}
            {ads.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '14px' }}>
                <button
                  onClick={prevAd}
                  aria-label="Previous Ad"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'inherit',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  &lt;
                </button>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {ads.map((_, i) => (
                    <span
                      key={i}
                      onClick={() => setAdCarouselIndex(i)}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: i === adCarouselIndex ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={nextAd}
                  aria-label="Next Ad"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'inherit',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ad Modal */}
      {adModalOpen && selectedAd && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
          onClick={closeAdModal}
        >
          <div
            style={{
              background: 'var(--card-bg, #1c1c1e)',
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeAdModal}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'inherit',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              &times;
            </button>

            {/* Modal Image */}
            {selectedAd.image_url && (
              <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
                <img
                  src={selectedAd.image_url}
                  alt={selectedAd.title}
                  style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            {/* Logos row: CrowdCount + Business */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <img
                src="/assets/Logos/CrowdCount App Logo-iOS-Default-1024x1024@2x.png"
                alt="CrowdCount"
                style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
              />
              {selectedAd.logo_url && (
                <>
                  <span style={{ opacity: 0.3, fontSize: '1.2rem' }}>+</span>
                  <img
                    src={selectedAd.logo_url}
                    alt={selectedAd.business_name}
                    style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
                  />
                </>
              )}
            </div>

            <div style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '4px' }}>
              {escapeHtml(selectedAd.title)}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '12px' }}>
              {escapeHtml(selectedAd.business_name)}
              {selectedAd.location_name && ` \u2022 ${escapeHtml(selectedAd.location_name)}`}
            </div>

            <div style={{ fontSize: '0.95rem', opacity: 0.85, marginBottom: '16px', lineHeight: 1.5 }}>
              {escapeHtml(selectedAd.description)}
            </div>

            {/* Countdown */}
            <div style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '16px' }}>
              {formatCountdown(selectedAd.end_date)}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {selectedAd.cta_text && selectedAd.cta_url && (
                <button
                  onClick={() => handleAdCta(selectedAd)}
                  id="big-red-button"
                  className="ripple"
                  style={{ flex: '1', minWidth: '120px' }}
                >
                  {selectedAd.cta_text}
                </button>
              )}
              <button
                onClick={() => openAdDirections(selectedAd)}
                style={{
                  flex: '1',
                  minWidth: '120px',
                  background: 'transparent',
                  border: '1px solid var(--accent-color)',
                  color: 'var(--accent-color)',
                  borderRadius: '25px',
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Get Directions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Boxes */}
      <h3 id="center">
        <div className="text-box-container" data-aos="fade-up" data-aos-delay="250">
          <div className="text-box">
            <div id="secondary">
              <div id="primary">Something wrong?</div> Please fill out a report at{' '}
              <Link href="/report">crowdcount.tech/report</Link>
            </div>
          </div>
          <div className="text-box">
            <div id="secondary">
              <div id="primary">Want to see a better map?</div> Start using our new iOS App today at{' '}
              <a href="https://crowdcount.tech/app">crowdcount.tech/app</a>
            </div>
          </div>
          <div className="text-box">
            <div id="secondary">
              <div id="primary">Want to add your own location?</div> Please send a message to{' '}
              <a href="mailto:info@crowdcount.tech">info@crowdcount.tech</a>
            </div>
          </div>
        </div>

        {/* Map Info Box */}
        <div className="text-box-legal" data-aos="fade-up" data-aos-delay="300">
          <div id="secondary">
            Here is some information regarding the map
            <br /><br />
            <div id="primary">{'\u2191\u2193'} Comparisons</div>
            <br />
            These arrows indicate whether the current location population is more or less crowded than usual at this given time and day ({'\u00B1'}25%).
            <br /><br />
            <div id="primary">/ # Overcrowding Indicator</div>
            <br />
            The number that can be displayed after the slash on certain locations shows the maximum amount of people that this location can hold (it is inputted by the business and is in no way an official or legal limit).
          </div>
        </div>
      </h3>
    </>
  );
}
