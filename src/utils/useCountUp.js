import { useState, useEffect, useRef } from 'react';

export default function useCountUp(end, duration = 800) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    if (end === 0) {
      setValue(0);
      return;
    }

    startTime.current = null;

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased));

      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      }
    };

    raf.current = requestAnimationFrame(animate);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [end, duration]);

  return value;
}
