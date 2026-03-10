'use client';

import { useEffect, useRef, useCallback } from 'react';

interface PhotoGalleryProps {
  images: { src: string; alt: string }[];
  galleryId?: string;
  imageClassName?: string;
  autoScrollInterval?: number;
}

export default function PhotoGallery({ images, galleryId, imageClassName, autoScrollInterval = 3000 }: PhotoGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const currentIndex = useRef(0);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToIndex = useCallback((index: number) => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const total = gallery.scrollWidth - gallery.clientWidth;
    const pos = images.length > 1 ? (total / (images.length - 1)) * index : 0;
    gallery.scrollTo({ left: pos, behavior: 'smooth' });
  }, [images.length]);

  const advance = useCallback(() => {
    if (pausedRef.current) return;
    const next = (currentIndex.current + 1) % images.length;
    currentIndex.current = next;
    scrollToIndex(next);
  }, [images.length, scrollToIndex]);

  // Auto-scroll timer
  useEffect(() => {
    timerRef.current = setInterval(advance, autoScrollInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [advance, autoScrollInterval]);

  // Pause on user interaction, resume after idle
  const handleInteractionStart = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const handleInteractionEnd = useCallback(() => {
    // Sync currentIndex to wherever the user scrolled
    const gallery = galleryRef.current;
    if (gallery) {
      const total = gallery.scrollWidth - gallery.clientWidth;
      const fraction = total > 0 ? gallery.scrollLeft / total : 0;
      currentIndex.current = Math.round(fraction * (images.length - 1));
    }
    // Resume after a delay
    setTimeout(() => { pausedRef.current = false; }, 2000);
  }, [images.length]);

  return (
    <div
      ref={galleryRef}
      id={galleryId}
      className="photo-gallery"
      aria-label="Photo gallery"
      onPointerDown={handleInteractionStart}
      onPointerUp={handleInteractionEnd}
      onPointerLeave={handleInteractionEnd}
    >
      {images.map((img, i) => (
        <img key={i} src={img.src} alt={img.alt} className={imageClassName} />
      ))}
    </div>
  );
}
