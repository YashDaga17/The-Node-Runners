import React from 'react';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';

const Tilt3DCard = ({ children, className = '', scale = 1.05, tiltMaxAngleX = 15, tiltMaxAngleY = 15, glareEnable = true, ...props }) => {
  return (
    <Tilt
      tiltMaxAngleX={tiltMaxAngleX}
      tiltMaxAngleY={tiltMaxAngleY}
      scale={scale}
      transitionSpeed={400}
      glareEnable={glareEnable}
      glareMaxOpacity={0.2}
      glareColor="#67e8f9"
      glarePosition="all"
      glareBorderRadius="1rem"
      perspective={1000}
      className={className}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        {children}
      </motion.div>
    </Tilt>
  );
};

export default Tilt3DCard;
