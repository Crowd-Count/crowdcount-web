'use client';

import { useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  hideCursorAfter?: number;
  id?: string;
}

export default function TypewriterText({ text, hideCursorAfter = 3800, id }: TypewriterTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // typewriter-effect ships no types; model just the chain we use.
    let tw: {
      typeString: (s: string) => typeof tw;
      callFunction: (fn: () => void) => typeof tw;
      start: () => typeof tw;
    };
    import('typewriter-effect/dist/core').then((Typewriter) => {
      const TypewriterClass = Typewriter.default || Typewriter;
      tw = new TypewriterClass(ref.current!, {
        loop: false,
        delay: 50,
        cursor: '_',
      });
      tw.typeString(text)
        .callFunction(() => {
          setTimeout(() => {
            const cursor = ref.current?.querySelector('.Typewriter__cursor');
            if (cursor) (cursor as HTMLElement).style.display = 'none';
          }, hideCursorAfter);
        })
        .start();
    });

    return () => {
      if (ref.current) ref.current.innerHTML = '';
    };
  }, [text, hideCursorAfter]);

  return <div ref={ref} id={id} />;
}
