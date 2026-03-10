'use client';

import { useEffect, useRef } from 'react';

interface PhotoGalleryProps {
  images: { src: string; alt: string }[];
  galleryId?: string;
  imageClassName?: string;
  speed?: number; // px per second
  phoneFrame?: boolean;
}

export default function PhotoGallery({ images, galleryId, imageClassName, speed = 50, phoneFrame }: PhotoGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const velocityRef = useRef(0);
  const targetRef = useRef(speed);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tripled = [...images, ...images, ...images];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let lastTime = 0;
    let initialized = false;
    velocityRef.current = 0;
    targetRef.current = speed;

    const tick = (now: number) => {
      // First frame: set scroll position, record time
      if (!initialized) {
        initialized = true;
        const oneSet = track.scrollWidth / 3;
        if (oneSet > 0) track.scrollLeft = oneSet;
        lastTime = now;
        raf = requestAnimationFrame(tick);
        return;
      }

      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Skip large gaps (tab switch etc)
      if (dt > 0.1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      // Lerp velocity toward target (smooth over ~0.8s)
      const lerp = 1 - Math.pow(0.1, dt);
      velocityRef.current += (targetRef.current - velocityRef.current) * lerp;

      // Scroll
      if (velocityRef.current > 0.5) {
        track.scrollLeft += velocityRef.current * dt;
      }

      // Seamless loop
      const setWidth = track.scrollWidth / 3;
      if (setWidth > 0) {
        if (track.scrollLeft >= setWidth * 2) {
          track.scrollLeft -= setWidth;
        } else if (track.scrollLeft <= 0) {
          track.scrollLeft += setWidth;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onEnter = () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      targetRef.current = 0;
    };

    const onLeave = () => {
      resumeTimerRef.current = setTimeout(() => {
        targetRef.current = speed;
      }, 1000);
    };

    track.addEventListener('mouseenter', onEnter);
    track.addEventListener('mouseleave', onLeave);
    return () => {
      track.removeEventListener('mouseenter', onEnter);
      track.removeEventListener('mouseleave', onLeave);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [speed]);

  return (
    <div
      ref={trackRef}
      id={galleryId}
      className="photo-gallery"
      aria-label="Photo gallery"
    >
      {tripled.map((img, i) =>
        phoneFrame ? (
          <span key={i} className="phone-frame-wrapper">
            <img src={img.src} alt={img.alt} className={`phone-frame-screenshot ${imageClassName || ''}`} />
            <img src="/assets/iphone-frame.png" alt="" className="phone-frame-overlay" />
          </span>
        ) : (
          <img key={i} src={img.src} alt={img.alt} className={imageClassName} />
        )
      )}
    </div>
  );
}
