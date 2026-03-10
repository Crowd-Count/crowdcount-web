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
  const stateRef = useRef({ hovering: false, velocity: 0 });
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tripled = [...images, ...images, ...images];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let started = false;
    const state = stateRef.current;
    state.velocity = 0;

    // Ramp rate: px/s per second (reaches full speed in ~1.5s)
    const rampUp = speed / 1.5;
    const rampDown = speed / 1.0;

    const tick = (time: number) => {
      // Initialize scroll position on first frame after layout
      if (!started) {
        started = true;
        const oneSet = track.scrollWidth / 3;
        if (oneSet > 0) track.scrollLeft = oneSet;
        raf = requestAnimationFrame(tick);
        return;
      }

      const dt = 1 / 60; // fixed timestep for consistency

      // Linear ramp toward target
      const target = state.hovering ? 0 : speed;
      if (state.velocity < target) {
        state.velocity = Math.min(state.velocity + rampUp * dt, target);
      } else if (state.velocity > target) {
        state.velocity = Math.max(state.velocity - rampDown * dt, target);
      }

      if (state.velocity > 0.1) {
        track.scrollLeft += state.velocity * dt;
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

  const handleEnter = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    stateRef.current.hovering = true;
  };

  const handleLeave = () => {
    resumeTimer.current = setTimeout(() => {
      stateRef.current.hovering = false;
    }, 1000);
  };

  return (
    <div
      ref={trackRef}
      id={galleryId}
      className="photo-gallery"
      aria-label="Photo gallery"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
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
