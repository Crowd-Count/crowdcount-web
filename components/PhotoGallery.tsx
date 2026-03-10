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
  const animRef = useRef<number>(0);
  const hovering = useRef(false);
  const currentSpeed = useRef(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 3x for seamless loop
  const tripled = [...images, ...images, ...images];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Need a frame to let layout settle before reading scrollWidth
    requestAnimationFrame(() => {
      const oneSet = track.scrollWidth / 3;
      track.scrollLeft = oneSet;
    });

    let prev = 0;
    currentSpeed.current = speed;

    const tick = (time: number) => {
      if (prev) {
        const dt = Math.min(time - prev, 50); // cap to avoid jumps on tab-switch

        // Ease toward target
        const target = hovering.current ? 0 : speed;
        currentSpeed.current += (target - currentSpeed.current) * 0.15;

        // Avoid sub-pixel drift when nearly stopped
        if (Math.abs(currentSpeed.current) > 0.5) {
          track.scrollLeft += (currentSpeed.current * dt) / 1000;
        }

        // Seamless loop reset
        const setWidth = track.scrollWidth / 3;
        if (track.scrollLeft >= setWidth * 2) {
          track.scrollLeft -= setWidth;
        } else if (track.scrollLeft <= 0) {
          track.scrollLeft += setWidth;
        }
      }
      prev = time;
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animRef.current);
  }, [speed]);

  const handleEnter = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    hovering.current = true;
  };

  const handleLeave = () => {
    resumeTimer.current = setTimeout(() => {
      hovering.current = false;
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
