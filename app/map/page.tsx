'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { API_BASE_URL, MAPKIT_TOKEN, NAV_LINKS } from '@/lib/constants';

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
      selectAnnotation(annotation: any): void;
      setRegionAnimated(region: CoordinateRegion, animate?: boolean): void;
      addEventListener(type: string, handler: (e: any) => void): void;
      annotations: any[];
      selectedAnnotation: any;
      static readonly ColorSchemes: { Dark: string; Light: string };
    }
    class MarkerAnnotation {
      constructor(coordinate: Coordinate, options?: any);
      data: any;
    }
    namespace Annotation {
      enum CollisionMode { Rectangle, Circle, None }
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
  location_icon?: string;
  overcrowding_limit: number | null;
  is_closed: boolean;
  devices?: [string, ...unknown[]][];
}

interface PopularTimesResponse {
  day_of_week: string;
  popular_times: Record<string, number>;
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

/* ---- Location icon SVG path mapping (SF Symbol → web) ---- */
function getLocationIconPath(iconName?: string): string {
  if (!iconName) return '';
  const b = iconName.toLowerCase().replace(/\.fill$/, '').replace(/\.circle$/, '');
  if (b.includes('flag')) return 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22V15';
  if (b.includes('tree') || b.includes('leaf')) return 'M12 3L5 13h4v8h6v-8h4z';
  if (b.includes('fish')) return 'M6.5 12c3-5 11-5 14 0-3 5-11 5-14 0zM3 12l2-1.5M3 12l2 1.5';
  if (b.includes('mug') || b.includes('cup')) return 'M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z';
  if (b.includes('building')) return 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M10 6h4M10 10h4M10 14h4M10 18h4';
  if (b.includes('house') || b.includes('home')) return 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10';
  if (b.includes('person') || b.includes('figure')) return 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z';
  if (b.includes('cart')) return 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6';
  if (b.includes('fork') || b.includes('knife')) return 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7';
  if (b.includes('heart')) return 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';
  if (b.includes('star')) return 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
  if (b.includes('music')) return 'M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z';
  if (b.includes('book')) return 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z';
  if (b.includes('bag')) return 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0';
  if (b.includes('car')) return 'M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 9l2-4h10l2 4M3 9h18v6H3z';
  if (b.includes('graduationcap')) return 'M22 10L12 5 2 10l10 5zM6 12v5c3 3 9 3 12 0v-5';
  if (b.includes('sportscourt') || b.includes('dumbbell')) return 'M6.5 6.5v8M17.5 6.5v8M6.5 10.5h11M4 6.5h2.5M4 14.5h2.5M17.5 6.5H20M17.5 14.5H20';
  return '';
}

function LocationIcon({ iconName, color, size = 36 }: { iconName?: string; color: string; size?: number }) {
  const s = size * 0.5;
  const path = getLocationIconPath(iconName);
  const isFilled = iconName?.includes('.fill') ?? false;
  const defaultPin = 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';

  return (
    <div className="location-icon-circle" style={{ backgroundColor: color, width: size, height: size, minWidth: size }}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill={isFilled && path ? 'white' : 'none'} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={path || defaultPin} />
      </svg>
    </div>
  );
}

/* ---- Dominant color extraction (port of iOS algorithm) ---- */
function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 50;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve('#fd4040'); return; }

        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        let totalR = 0, totalG = 0, totalB = 0, totalWeight = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          const a = data[i + 3] / 255;

          if (a <= 0.5) continue;

          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const brightness = maxC;

          if (brightness < 0.1 || brightness > 0.9) continue;

          const saturation = maxC > 0 ? (maxC - minC) / maxC : 0;
          const weight = 1 + saturation * 2;

          totalR += r * weight;
          totalG += g * weight;
          totalB += b * weight;
          totalWeight += weight;
        }

        if (totalWeight <= 0) { resolve('#fd4040'); return; }

        const avgR = totalR / totalWeight;
        const avgG = totalG / totalWeight;
        const avgB = totalB / totalWeight;

        // Convert to HSL, boost saturation, constrain brightness
        const max = Math.max(avgR, avgG, avgB);
        const min = Math.min(avgR, avgG, avgB);
        const l = (max + min) / 2;
        let h = 0, s = 0;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          if (max === avgR) h = ((avgG - avgB) / d + (avgG < avgB ? 6 : 0)) / 6;
          else if (max === avgG) h = ((avgB - avgR) / d + 2) / 6;
          else h = ((avgR - avgG) / d + 4) / 6;
        }

        // Boost saturation, constrain lightness
        s = Math.min(s * 1.5, 1);
        const boostedL = Math.max(0.3, Math.min(0.55, l));

        // HSL → RGB
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1; if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = boostedL < 0.5 ? boostedL * (1 + s) : boostedL + s - boostedL * s;
        const p = 2 * boostedL - q;
        const rr = Math.round(hue2rgb(p, q, h + 1/3) * 255);
        const gg = Math.round(hue2rgb(p, q, h) * 255);
        const bb = Math.round(hue2rgb(p, q, h - 1/3) * 255);

        resolve(`rgb(${rr}, ${gg}, ${bb})`);
      } catch {
        resolve('#fd4040');
      }
    };
    img.onerror = () => resolve('#fd4040');
    img.src = imageUrl;
  });
}

/* ------------------------------------------------------------------ */
/*  Map Control Buttons (right-edge floating stack)                     */
/* ------------------------------------------------------------------ */
function MapControls({ onRefresh, onCenterUser, onToggleList }: {
  onRefresh: () => void;
  onCenterUser: () => void;
  onToggleList: () => void;
}) {
  return (
    <div className="map-controls">
      <button className="map-control-btn" onClick={onRefresh} aria-label="Refresh" title="Refresh">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 4v6h-6" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      </button>
      <button className="map-control-btn" onClick={onCenterUser} aria-label="My Location" title="My Location">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>
      <button className="map-control-btn" onClick={onToggleList} aria-label="Search" title="Search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </button>
      <button className="map-control-btn" aria-label="Filter" title="Filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      </button>
      <button className="map-control-btn" aria-label="Report" title="Report">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M12 7v2M12 13h.01" />
        </svg>
      </button>
    </div>
  );
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
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [popularTimesData, setPopularTimesData] = useState<Record<string, PopularTimesResponse | null>>({});
  const [popularTimesLoading, setPopularTimesLoading] = useState<Record<string, boolean>>({});
  const popularTimesDataRef = useRef(popularTimesData);
  popularTimesDataRef.current = popularTimesData;

  // Derive selected location from live locations state (updates every 30s)
  const selectedLocation = selectedLocationId
    ? locations.find(l => l.location_id === selectedLocationId) ?? null
    : null;

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

  /* ---- Fetch popular times ---- */
  const fetchPopularTimes = useCallback(async (locationId: string) => {
    if (locationId in popularTimesDataRef.current) return;
    setPopularTimesLoading(prev => ({ ...prev, [locationId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/get_popular_times?location_id=${locationId}`);
      if (!res.ok) throw new Error('Failed');
      const data: PopularTimesResponse = await res.json();
      setPopularTimesData(prev => ({ ...prev, [locationId]: data.popular_times ? data : null }));
    } catch {
      setPopularTimesData(prev => ({ ...prev, [locationId]: null }));
    } finally {
      setPopularTimesLoading(prev => ({ ...prev, [locationId]: false }));
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

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const map = new mapkit.Map('map', {
      center: new mapkit.Coordinate(39.8283, -98.5795),
      colorScheme: prefersDark ? mapkit.Map.ColorSchemes.Dark : mapkit.Map.ColorSchemes.Light,
      showsZoomControl: false,
      showsMapTypeControl: false,
      showsPointsOfInterest: false,
    });
    mapRef.current = map;

    // Follow system color scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSchemeChange = (e: MediaQueryListEvent) => {
      if (mapRef.current) {
        (mapRef.current as any).colorScheme = e.matches ? mapkit.Map.ColorSchemes.Dark : mapkit.Map.ColorSchemes.Light;
      }
    };
    mediaQuery.addEventListener('change', handleSchemeChange);

    (async () => {
      const locs = await fetchLocations();
      setLocations(locs);
      const adsList = await fetchAds();

      // Add annotations
      const locMap = new Map<string, LocationData>();
      locs.forEach(loc => {
        locMap.set(loc.location_id, loc);
        let subtitle: string;
        if (loc.is_closed) {
          subtitle = 'Closed';
        } else {
          subtitle = `${loc.current_count}`;
          if (loc.overcrowding_limit != null) subtitle += ` / ${loc.overcrowding_limit}`;
          const sym = getComparisonSymbol(loc.location_comparison);
          if (sym) subtitle += ` ${sym}`;
        }
        const annotation = new mapkit.MarkerAnnotation(
          new mapkit.Coordinate(loc.location_latitude, loc.location_longitude),
          {
            title: loc.location_name,
            subtitle,
            color: getMarkerColor(loc.location_color),
            displayPriority: 750,
            collisionMode: mapkit.Annotation.CollisionMode.Circle,
          }
        );
        annotation.data = { locationId: loc.location_id };
        map.addAnnotation(annotation);
      });

      // Handle annotation select → show detail card
      map.addEventListener('select', (e: any) => {
        const annotation = e.annotation;
        if (!annotation?.data?.locationId) return;
        const loc = locMap.get(annotation.data.locationId);
        if (loc) handleLocationClickRef.current(loc, true);
      });

      // Handle deselect → dismiss detail card
      map.addEventListener('deselect', () => {
        handleCloseDetailCardRef.current();
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

  /* ---- Refresh: re-fetch locations + update map annotations ---- */
  const handleRefresh = useCallback(async () => {
    const locs = await fetchLocations();
    setLocations(locs);
    if (mapRef.current) {
      const map = mapRef.current;
      map.removeAnnotations(map.annotations);
      locs.forEach(loc => {
        let subtitle: string;
        if (loc.is_closed) {
          subtitle = 'Closed';
        } else {
          subtitle = `${loc.current_count}`;
          if (loc.overcrowding_limit != null) subtitle += ` / ${loc.overcrowding_limit}`;
          const sym = getComparisonSymbol(loc.location_comparison);
          if (sym) subtitle += ` ${sym}`;
        }
        const annotation = new mapkit.MarkerAnnotation(
          new mapkit.Coordinate(loc.location_latitude, loc.location_longitude),
          {
            title: loc.location_name,
            subtitle,
            color: getMarkerColor(loc.location_color),
            displayPriority: 750,
            collisionMode: mapkit.Annotation.CollisionMode.Circle,
          }
        );
        annotation.data = { locationId: loc.location_id };
        map.addAnnotation(annotation);
      });
    }
  }, [fetchLocations]);

  /* ---- Center on user location ---- */
  const handleCenterUser = useCallback(async () => {
    try {
      const loc = await getUserLocation();
      setUserLocation(loc);
      if (mapRef.current) {
        mapRef.current.setRegionAnimated(new mapkit.CoordinateRegion(
          new mapkit.Coordinate(loc.lat, loc.lon),
          new mapkit.CoordinateSpan(0.05, 0.05)
        ));
      }
    } catch { /* location not available */ }
  }, [getUserLocation]);

  /* ---- Center map on a location, offset for sidebar ---- */
  const centerMapOnLocation = useCallback((lat: number, lon: number) => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    // Offset longitude so pin lands in the center of the viewable area (right of sidebar)
    const mapEl = document.getElementById('map');
    const sidebarWidth = 360 + 12; // sidebar width + gap
    const mapWidth = mapEl?.clientWidth || window.innerWidth;
    const viewableWidth = mapWidth - sidebarWidth;
    // Only offset if sidebar is visible (desktop)
    const isMobile = window.innerWidth <= 768;
    const offsetFraction = isMobile ? 0 : sidebarWidth / mapWidth / 2;
    const currentSpan = 0.003;
    const lngOffset = currentSpan * offsetFraction * (mapWidth / viewableWidth);

    map.setRegionAnimated(new mapkit.CoordinateRegion(
      new mapkit.Coordinate(lat, lon - lngOffset),
      new mapkit.CoordinateSpan(currentSpan, currentSpan)
    ));
  }, []);

  /* ---- Select location → show detail card + select map pin ---- */
  const handleLocationClick = useCallback((loc: LocationData, fromMap?: boolean) => {
    centerMapOnLocation(loc.location_latitude, loc.location_longitude);
    setSelectedLocationId(loc.location_id);
    fetchPopularTimes(loc.location_id);

    // If clicked from list, programmatically select the annotation on the map
    if (!fromMap && mapRef.current) {
      const annotation = mapRef.current.annotations.find(
        (a: any) => a.data?.locationId === loc.location_id
      );
      if (annotation) {
        mapRef.current.selectedAnnotation = annotation;
      }
    }
  }, [fetchPopularTimes, centerMapOnLocation]);

  const handleLocationClickRef = useRef(handleLocationClick);
  handleLocationClickRef.current = handleLocationClick;

  /* ---- Close detail card ---- */
  const handleCloseDetailCard = useCallback(() => {
    setSelectedLocationId(null);
  }, []);

  const handleCloseDetailCardRef = useRef(handleCloseDetailCard);
  handleCloseDetailCardRef.current = handleCloseDetailCard;

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
    <div className="map-page">
      <Script
        src="https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js"
        strategy="afterInteractive"
        onLoad={onMapkitLoad}
      />

      {/* Top nav bar */}
      <nav className="map-topbar">
        <Link href="/" className="map-topbar-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/Logos/TransparentLogoCropped.png" alt="" width={28} height={28} className="map-topbar-logo" />
          CrowdCount
        </Link>
        <div className="map-topbar-links">
          {NAV_LINKS.filter(l => l.href !== '/map').map(link =>
            link.external ? (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
            ) : (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            )
          )}
        </div>
      </nav>

      {/* Full-screen map area */}
      <div className="map-body">
        <div id="map"></div>

        {/* Left sidebar */}
        <div className={`map-sidebar${listVisible ? '' : ' collapsed'}`}>
          <div className="map-sidebar-header">
            <input
              type="text"
              className="map-sidebar-search"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="map-sidebar-toggle"
              onClick={() => setListVisible(v => !v)}
              aria-label={listVisible ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {listVisible ? '\u2039' : '\u203A'}
            </button>
          </div>

          {listVisible && (
            <div className="map-sidebar-content">
              <div className="map-sidebar-list">
                {locations.length === 0 ? (
                  <div className="map-sidebar-empty">Loading locations...</div>
                ) : sortedLocations.length === 0 ? (
                  <div className="map-sidebar-empty">No locations found</div>
                ) : (
                  sortedLocations.map(loc => (
                    <div
                      key={loc.location_id}
                      className={`map-sidebar-item${selectedLocationId === loc.location_id ? ' selected' : ''}`}
                      onClick={() => handleLocationClick(loc)}
                    >
                      <span className="location-color-dot" style={{ backgroundColor: getMarkerColor(loc.location_color || '') }}></span>
                      <span className="map-sidebar-item-name">{loc.location_name}</span>
                      <div className="map-sidebar-item-stats">
                        {loc.is_closed ? (
                          <span className="location-closed">Closed</span>
                        ) : (
                          <>
                            <span className="map-sidebar-item-count">{loc.current_count}</span>
                            {loc.overcrowding_limit != null && (
                              <span className="map-sidebar-item-limit">/ {loc.overcrowding_limit}</span>
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

              <div className="map-sidebar-sort-label">
                {userLocation ? 'Sorted by distance' : 'Sorted alphabetically'}
              </div>
            </div>
          )}
        </div>

        {/* Map control buttons — right edge */}
        <MapControls
          onRefresh={handleRefresh}
          onCenterUser={handleCenterUser}
          onToggleList={() => setListVisible(v => !v)}
        />

        {/* Detail card — overlays bottom of map */}
        {selectedLocation && (
          <LocationDetailCard
            key={selectedLocationId}
            location={selectedLocation}
            popularTimesData={popularTimesData[selectedLocation.location_id]}
            popularTimesLoading={!!popularTimesLoading[selectedLocation.location_id]}
            onClose={handleCloseDetailCard}
          />
        )}

        {/* Promotions — mutually exclusive with detail card (matches iOS) */}
        {ads.length > 0 && !selectedLocation && (
          <PromosPanel ads={ads} onCardClick={handleAdCtaClick} />
        )}
      </div>

      {/* Promo Detail Modal */}
      {modalAd && (
        <PromoModal
          ad={modalAd}
          adLocation={getAdLocation(modalAd)}
          onClose={() => setModalAd(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Location Detail Card (overlays bottom of map)                      */
/* ------------------------------------------------------------------ */
function LocationDetailCard({ location, popularTimesData, popularTimesLoading, onClose }: {
  location: LocationData;
  popularTimesData: PopularTimesResponse | null | undefined;
  popularTimesLoading: boolean;
  onClose: () => void;
}) {
  const pinColor = getMarkerColor(location.location_color || '');
  const directionsUrl = `https://maps.apple.com/?daddr=${location.location_latitude},${location.location_longitude}&dirflg=d&t=m`;

  return (
    <div className="location-detail-card">
      {/* Header: icon + name + close */}
      <div className="location-detail-header">
        <div className="location-detail-title-row">
          <LocationIcon iconName={location.location_icon} color={pinColor} />
          <span className="location-detail-name">{location.location_name}</span>
        </div>
        <button className="location-detail-close" onClick={onClose} aria-label="Close">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="rgba(255,255,255,0.15)" />
            <path d="M10 10l8 8M18 10l-8 8" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Count + Directions HStack (matches iOS layout) */}
      <div className="location-detail-body">
        <div className="location-detail-count-section">
          {location.is_closed ? (
            <span className="location-detail-count" style={{ color: 'rgba(255,255,255,0.5)' }}>Closed</span>
          ) : (
            <>
              <span className="location-detail-label">Current count</span>
              <div className="location-detail-count-row">
                <span className="location-detail-count">{location.current_count}</span>
                {location.overcrowding_limit != null && (
                  <span className="location-detail-overcrowding">/ {location.overcrowding_limit}</span>
                )}
                {getComparisonSymbol(location.location_comparison) && (
                  <span className={getComparisonClass(location.location_comparison)}>
                    {getComparisonSymbol(location.location_comparison)}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <a
          className="location-detail-directions"
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ backgroundColor: pinColor }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Directions
        </a>
      </div>

      <PopularTimesPanel
        data={popularTimesData}
        loading={popularTimesLoading}
        currentCount={location.current_count}
        pinColor={pinColor}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Popular Times Panel                                                */
/* ------------------------------------------------------------------ */
const SKELETON_HEIGHTS = Array.from({ length: 24 }, () => 20 + Math.random() * 60);

function PopularTimesPanel({ data, loading, currentCount, pinColor }: {
  data: PopularTimesResponse | null | undefined;
  loading: boolean;
  currentCount: number;
  pinColor?: string;
}) {
  if (loading || data === undefined) {
    return (
      <div className="popular-times-panel">
        <div className="popular-times-skeleton">
          {SKELETON_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="popular-times-skeleton-bar"
              style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.popular_times || Object.keys(data.popular_times).length === 0) {
    return (
      <div className="popular-times-panel">
        <div className="popular-times-no-data">Popular times will appear after this location has been active for at least a week.</div>
      </div>
    );
  }

  const now = new Date();
  const localHour = now.getHours();
  const offsetHours = -now.getTimezoneOffset() / 60;

  // Build 24-hour array: API keys are UTC hours, convert to local
  const hourlyValues = new Array(24).fill(0);
  Object.entries(data.popular_times).forEach(([utcHourStr, value]) => {
    const utcHour = parseInt(utcHourStr, 10);
    if (isNaN(utcHour)) return;
    const localH = Math.floor(((utcHour + offsetHours) % 24 + 24) % 24);
    hourlyValues[localH] = value;
  });

  const maxValue = Math.max(...hourlyValues, 1);
  const usualAtCurrentHour = hourlyValues[localHour];

  const hourLabels = ['12a', '', '', '3a', '', '', '6a', '', '', '9a', '', '', '12p', '', '', '3p', '', '', '6p', '', '', '9p', '', ''];

  return (
    <div className="popular-times-panel">
      <div className="popular-times-chart">
        {hourlyValues.map((value, hour) => (
          <div key={hour} className="popular-times-bar-wrapper">
            <div
              className={`popular-times-bar${hour === localHour ? ' current' : ''}`}
              style={{
                height: `${Math.max((value / maxValue) * 100, 2)}%`,
                ...(hour === localHour && pinColor ? { backgroundColor: pinColor } : {}),
              }}
            />
          </div>
        ))}
      </div>
      <div className="popular-times-labels">
        {hourLabels.map((label, i) => (
          <div key={i} className="popular-times-label">{label}</div>
        ))}
      </div>
      <div className="popular-times-comparison">
        <strong>Currently: {currentCount}</strong>
        {usualAtCurrentHour > 0 && (
          <> &mdash; Usually: {Math.round(usualAtCurrentHour)} around this time</>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Promotions Panel (floating carousel with dots)                     */
/* ------------------------------------------------------------------ */
function PromosPanel({ ads, onCardClick }: { ads: Ad[]; onCardClick: (ad: Ad) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateActive = useCallback(() => {
    const el = scrollRef.current;
    if (!el || ads.length <= 1) return;
    const cardWidth = el.scrollWidth / ads.length;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(idx, ads.length - 1));
  }, [ads.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateActive);
    return () => el.removeEventListener('scroll', updateActive);
  }, [updateActive]);

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / ads.length;
    el.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
  };

  return (
    <div className="map-promos-panel">
      <div className="map-promos-title">Promotions</div>
      <div className="map-promos-scroll" ref={scrollRef}>
        {ads.map((ad, i) => (
          <PromoCard key={ad.id || i} ad={ad} index={i} onClick={() => onCardClick(ad)} />
        ))}
      </div>
      {ads.length > 1 && (
        <div className="map-promos-dots">
          {ads.map((_, i) => (
            <span
              key={i}
              className={`map-promos-dot${i === activeIndex ? ' active' : ''}`}
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Promo Card                                                         */
/* ------------------------------------------------------------------ */
function PromoCard({ ad, index, onClick }: { ad: Ad; index: number; onClick: () => void }) {
  const [countdown, setCountdown] = useState(() => formatCountdown(getAdField(ad, 'expirationDate', 'expiration_date')));
  const [accentColor, setAccentColor] = useState<string>('#fd4040');

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

  // Extract dominant color from promo image
  useEffect(() => {
    if (!imageUrl) return;
    extractDominantColor(imageUrl).then(setAccentColor);
  }, [imageUrl]);

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
          <button className="promo-card-cta" style={{ backgroundColor: accentColor }} onClick={(e) => { e.stopPropagation(); onClick(); }}>{ctaText}</button>
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
