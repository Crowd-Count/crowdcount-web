'use client';

import { useEffect, useRef } from 'react';

interface PhotoGalleryProps {
  images: { src: string; alt: string }[];
  galleryId?: string;
  imageClassName?: string;
  speed?: number;
  phoneFrame?: boolean;
}

export default function PhotoGallery({ images, galleryId, imageClassName, speed = 50, phoneFrame }: PhotoGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const targetSpeed = useRef(speed);
  const currentSpeed = useRef(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tripled = [...images, ...images, ...images];

  useEffect(() => {
    const track = trackRef.current!;
    if (!track) return;

    let raf: number;
    let lastTime = performance.now();
    currentSpeed.current = 0;
    targetSpeed.current = speed;

    // Set initial scroll to middle set after layout
    requestAnimationFrame(() => {
      const oneSet = track.scrollWidth / 3;
      if (oneSet > 0) track.scrollLeft = oneSet;
      lastTime = performance.now();
      raf = requestAnimationFrame(loop);
    });

    function loop() {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Skip huge gaps
      if (dt < 0.1) {
        // Move currentSpeed toward targetSpeed at 80px/s/s
        const diff = targetSpeed.current - currentSpeed.current;
        const step = 80 * dt; // acceleration rate
        if (Math.abs(diff) < step) {
          currentSpeed.current = targetSpeed.current;
        } else {
          currentSpeed.current += Math.sign(diff) * step;
        }

        // Scroll
        track.scrollLeft += currentSpeed.current * dt;

        // Loop
        const setW = track.scrollWidth / 3;
        if (setW > 0) {
          if (track.scrollLeft >= setW * 2) track.scrollLeft -= setW;
          else if (track.scrollLeft <= 0) track.scrollLeft += setW;
        }
      }

      raf = requestAnimationFrame(loop);
    }

    // Mouse handlers
    const onEnter = () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      targetSpeed.current = 0;
    };
    const onLeave = () => {
      resumeTimer.current = setTimeout(() => {
        targetSpeed.current = speed;
      }, 1000);
    };

    track.addEventListener('mouseenter', onEnter);
    track.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('mouseenter', onEnter);
      track.removeEventListener('mouseleave', onLeave);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
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
            <img src="/assets/iphone-frame.png" alt="" className="phone-frame-overlay" />
            <img src={img.src} alt={img.alt} className={`phone-frame-screenshot ${imageClassName || ''}`} />
          </span>
        ) : (
          <img key={i} src={img.src} alt={img.alt} className={imageClassName} />
        )
      )}
    </div>
  );
}
