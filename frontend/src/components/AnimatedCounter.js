import React, { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

const AnimatedCounter = ({ value, duration = 1000, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10, duration },
  });

  useEffect(() => {
    const unsubscribe = number.to((n) => setDisplayValue(Math.floor(n)));
    return () => unsubscribe();
  }, [number, value]);

  return (
    <animated.span className={className}>
      {number.to((n) => Math.floor(n))}
    </animated.span>
  );
};

export default AnimatedCounter;
