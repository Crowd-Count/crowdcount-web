'use client';

import { useEffect, useRef } from 'react';

interface PhotoGalleryProps {
  images: { src: string; alt: string }[];
  galleryId?: string;
  imageClassName?: string;
  speed?: number;
  phoneFrame?: boolean;
}

export default function PhotoGallery({ images, galleryId, imageClassName, speed = 60, phoneFrame }: PhotoGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const mouseInside = useRef(false);
  const mouseLeft = useRef(0); // timestamp when mouse last left

  const tripled = [...images, ...images, ...images];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let started = false;
    let velocity = 0;

    const RAMP_SECONDS = 2.0; // time to go from 0 to full speed
    const rampRate = speed / RAMP_SECONDS;

    const onEnter = () => { mouseInside.current = true; };
    const onLeave = () => {
      mouseInside.current = false;
      mouseLeft.current = performance.now();
    };

    track.addEventListener('mouseenter', onEnter);
    track.addEventListener('mouseleave', onLeave);

    const tick = () => {
      if (!started) {
        started = true;
        const oneSet = track.scrollWidth / 3;
        if (oneSet > 0) track.scrollLeft = oneSet;
        raf = requestAnimationFrame(tick);
        return;
      }

      const dt = 1 / 60;

      // Determine target: 0 if hovering, also 0 during 1s pause after leaving
      const pauseRemaining = mouseLeft.current ? performance.now() - mouseLeft.current : Infinity;
      const shouldStop = mouseInside.current || (!mouseInside.current && pauseRemaining < 1000);
      const target = shouldStop ? 0 : speed;

      // Ramp velocity toward target
      if (velocity < target) {
        velocity = Math.min(velocity + rampRate * dt, target);
      } else if (velocity > target) {
        velocity = Math.max(velocity - rampRate * dt, target);
      }

      // Move
      if (velocity > 0.1) {
        track.scrollLeft += velocity * dt;
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

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('mouseenter', onEnter);
      track.removeEventListener('mouseleave', onLeave);
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
