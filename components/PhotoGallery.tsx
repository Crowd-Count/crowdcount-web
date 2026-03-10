'use client';

import { useEffect, useRef, useCallback } from 'react';

interface PhotoGalleryProps {
  images: { src: string; alt: string }[];
  galleryId?: string;
  imageClassName?: string;
  speed?: number; // pixels per second
}

export default function PhotoGallery({ images, galleryId, imageClassName, speed = 30 }: PhotoGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const pausedRef = useRef(false);

  // We render images 3x for seamless looping
  const tripled = [...images, ...images, ...images];

  const animate = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const track = trackRef.current;
    if (track && !pausedRef.current) {
      const px = (speed * delta) / 1000;
      track.scrollLeft += px;

      // When we've scrolled past the first copy, jump back seamlessly
      const oneSetWidth = track.scrollWidth / 3;
      if (track.scrollLeft >= oneSetWidth * 2) {
        track.scrollLeft -= oneSetWidth;
      }
    }

    animRef.current = requestAnimationFrame(animate);
  }, [speed]);

  useEffect(() => {
    const track = trackRef.current;
    if (track) {
      // Start at the middle copy so we can scroll both directions
      const oneSetWidth = track.scrollWidth / 3;
      track.scrollLeft = oneSetWidth;
    }
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate]);

  const handleInteractionStart = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const handleInteractionEnd = useCallback(() => {
    setTimeout(() => { pausedRef.current = false; }, 1500);
  }, []);

  return (
    <div
      ref={trackRef}
      id={galleryId}
      className="photo-gallery"
      aria-label="Photo gallery"
      onPointerDown={handleInteractionStart}
      onPointerUp={handleInteractionEnd}
      onPointerLeave={handleInteractionEnd}
    >
      {tripled.map((img, i) => (
        <img key={i} src={img.src} alt={img.alt} className={imageClassName} />
      ))}
    </div>
  );
}
