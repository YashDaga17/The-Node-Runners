import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Text3D, Center, Float } from '@react-three/drei';
import * as THREE from 'three';

function Card3D({ icon, value, label }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        hovered ? Math.PI * 0.1 : 0,
        0.1
      );
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        <RoundedBox
          args={[2, 1.2, 0.1]}
          radius={0.1}
          smoothness={4}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial
            color={hovered ? '#67e8f9' : '#1e293b'}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.9}
          />
        </RoundedBox>
        <Center position={[0, 0.3, 0.1]}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={0.3}
            height={0.05}
          >
            {value}
            <meshStandardMaterial color="#67e8f9" metalness={0.8} />
          </Text3D>
        </Center>
      </group>
    </Float>
  );
}

const FloatingCard3D = ({ icon, value, label }) => {
  return (
    <div className="w-full h-48">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} color="#67e8f9" intensity={0.5} />
        <Card3D icon={icon} value={value} label={label} />
      </Canvas>
    </div>
  );
};

export default FloatingCard3D;
