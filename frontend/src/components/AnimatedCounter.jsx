import React, { useState, useEffect } from 'react';

const AnimatedCounter = ({ value, duration = 800 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = parseInt(value, 10);
    if (isNaN(end) || end === 0) {
      setCount(value);
      return;
    }

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCount(end);
      return;
    }

    let active = true;
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      if (!active) return;
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Ease out quad formula
      const easedProgress = progress * (2 - progress);
      
      setCount(Math.floor(easedProgress * end));

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);

    return () => {
      active = false;
    };
  }, [value, duration]);

  return <span>{count}</span>;
};

export default AnimatedCounter;
