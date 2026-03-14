import React from 'react';
import { useSpring, animated } from '@react-spring/web';

const AnimatedCounter = ({ value, duration = 1000, className = '' }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 },
  });

  return (
    <animated.span className={className}>
      {number.to((n) => Math.floor(n))}
    </animated.span>
  );
};

export default AnimatedCounter;
