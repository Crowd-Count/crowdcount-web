'use client';

import { useEffect, useRef } from 'react';

interface PhotoGalleryProps {
  images: { src: string; alt: string }[];
  galleryId?: string;
  imageClassName?: string;
  speed?: number;
  phoneFrame?: boolean;
}

// Cubic ease-in-out (smoothstep)
function smoothstep(t: number): number {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

const TRANSITION_DURATION = 2.0; // seconds

export default function PhotoGallery({ images, galleryId, imageClassName, speed = 100, phoneFrame }: PhotoGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Transition state: startSpeed, endSpeed, progress (0→1)
  const transRef = useRef({ from: 0, to: speed, progress: 0 });

  const tripled = [...images, ...images, ...images];

  useEffect(() => {
    const track = trackRef.current!;
    if (!track) return;

    let raf: number;
    let lastTime = performance.now();
    const trans = transRef.current;
    trans.from = 0;
    trans.to = speed;
    trans.progress = 0;

    requestAnimationFrame(() => {
      const oneSet = track.scrollWidth / 3;
      if (oneSet > 0) track.scrollLeft = oneSet;
      lastTime = performance.now();
      raf = requestAnimationFrame(loop);
    });

    function getCurrentSpeed(): number {
      const t = smoothstep(trans.progress);
      return trans.from + (trans.to - trans.from) * t;
    }

    function startTransition(newTarget: number) {
      const current = getCurrentSpeed();
      trans.from = current;
      trans.to = newTarget;
      trans.progress = 0;
    }

    function loop() {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (dt < 0.1) {
        // Advance transition progress
        if (trans.progress < 1) {
          trans.progress = Math.min(1, trans.progress + dt / TRANSITION_DURATION);
        }

        const v = getCurrentSpeed();

        // Scroll
        track.scrollLeft += v * dt;

        // Seamless loop
        const setW = track.scrollWidth / 3;
        if (setW > 0) {
          if (track.scrollLeft >= setW * 2) track.scrollLeft -= setW;
          else if (track.scrollLeft <= 0) track.scrollLeft += setW;
        }
      }

      raf = requestAnimationFrame(loop);
    }

    const onEnter = () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      startTransition(0);
    };
    const onLeave = () => {
      startTransition(speed);
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
