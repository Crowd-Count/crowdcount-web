'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface PhotoGalleryProps {
  images: { src: string; alt: string }[];
  galleryId?: string;
  imageClassName?: string;
}

export default function PhotoGallery({ images, galleryId, imageClassName }: PhotoGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateDots = useCallback(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const total = gallery.scrollWidth - gallery.clientWidth;
    const fraction = total > 0 ? gallery.scrollLeft / total : 0;
    const active = Math.round(fraction * (images.length - 1));
    setActiveDot(active);
  }, [images.length]);

  const moveGallery = useCallback((direction: number) => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const total = gallery.scrollWidth - gallery.clientWidth;
    const step = images.length > 1 ? total / (images.length - 1) : total;
    gallery.scrollBy({ left: direction * step, behavior: 'smooth' });
  }, [images.length]);

  const startScrolling = useCallback((direction: number) => {
    if (scrollIntervalRef.current) return;
    scrollIntervalRef.current = setInterval(() => moveGallery(direction), 100);
  }, [moveGallery]);

  const stopScrolling = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  const goToDot = useCallback((index: number) => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const total = gallery.scrollWidth - gallery.clientWidth;
    const pos = images.length > 1 ? (total / (images.length - 1)) * index : 0;
    gallery.scrollTo({ left: pos, behavior: 'smooth' });
  }, [images.length]);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    gallery.addEventListener('scroll', updateDots);
    return () => gallery.removeEventListener('scroll', updateDots);
  }, [updateDots]);

  return (
    <>
      <div
        ref={galleryRef}
        id={galleryId}
        className="photo-gallery"
        aria-label="Photo gallery"
      >
        {images.map((img, i) => (
          <img key={i} src={img.src} alt={img.alt} className={imageClassName} />
        ))}
      </div>

      <div className="dots-container">
        {images.map((_, i) => (
          <span
            key={i}
            className={`dot${i === activeDot ? ' active' : ''}`}
            onClick={() => goToDot(i)}
          />
        ))}
      </div>

      <div className="gallery-controls">
        <button
          className="gallery-arrow prev-button"
          aria-label="Previous Image"
          onClick={() => moveGallery(-1)}
          onMouseDown={() => startScrolling(-1)}
          onMouseUp={stopScrolling}
          onMouseLeave={stopScrolling}
          onTouchEnd={stopScrolling}
        >
          &lt;
        </button>
        <button
          className="gallery-arrow next-button"
          aria-label="Next Image"
          onClick={() => moveGallery(1)}
          onMouseDown={() => startScrolling(1)}
          onMouseUp={stopScrolling}
          onMouseLeave={stopScrolling}
          onTouchEnd={stopScrolling}
        >
          &gt;
        </button>
      </div>
    </>
  );
}
