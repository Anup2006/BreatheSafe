// src/components/SimVisualizer.jsx
import React, { useRef, useEffect } from 'react';

const SimVisualizer = ({ aqi, isIndoors }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // 1. Determine Particle Count based on AQI
    // Limit to 400 particles max for performance
    const particleCount = Math.min(Math.floor(aqi / 1.5), 400);
    
    // 2. Determine Color based on severity
    const getColor = () => {
      if (aqi < 50) return 'rgba(100, 200, 255, 0.4)'; // Good (Blue)
      if (aqi < 150) return 'rgba(255, 200, 100, 0.5)'; // Moderate (Yellow)
      return 'rgba(100, 50, 50, 0.6)'; // Hazardous (Brown)
    };

    // 3. Create Particles Array
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      // Outdoors moves faster (wind), Indoors moves slower
      vx: (Math.random() - 0.5) * (isIndoors ? 0.5 : 2), 
      vy: (Math.random() - 0.5) * (isIndoors ? 0.5 : 1),
      size: Math.random() * 3 + 1
    }));

    // 4. Animation Loop
    const render = () => {
      // Clear screen
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = getColor();

      particles.forEach(p => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen edges (Infinite loop effect)
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [aqi, isIndoors]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="rounded-lg bg-slate-900 w-full h-full"
    />
  );
};

export default SimVisualizer;
