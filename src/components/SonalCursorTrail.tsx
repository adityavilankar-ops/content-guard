import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  rotationSpeed: number;
}

export default function SonalCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -100, y: -100, lastX: -100, lastY: -100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Resize canvas to cover the viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.lastX = mouseRef.current.x;
      mouseRef.current.lastY = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      // Spawn particles as cursor moves
      const speed = Math.hypot(
        mouseRef.current.x - mouseRef.current.lastX,
        mouseRef.current.y - mouseRef.current.lastY
      );

      // Number of stars to spawn based on mouse movement speed
      const spawnCount = Math.min(Math.floor(speed / 4) + 1, 6);

      for (let i = 0; i < spawnCount; i++) {
        // Star particle configs
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 1.5 + 0.5;
        
        // Colors of stardust (shades of bright green / lime / emerald)
        const greenShades = [
          "rgba(57, 255, 20, ", // Neon Lime
          "rgba(16, 185, 129, ", // Emerald Green
          "rgba(52, 211, 153, ", // Mint Green
          "rgba(110, 231, 183, ", // Pale Sage Green
          "rgba(255, 255, 255, " // White star nuclei
        ];
        const colorBase = greenShades[Math.floor(Math.random() * greenShades.length)];

        particles.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          // Slighter random spray offsets
          vx: Math.cos(angle) * velocity + (Math.random() - 0.5) * 0.5,
          vy: Math.sin(angle) * velocity - Math.random() * 0.8 - 0.2, // slight upward float
          size: Math.random() * 5 + 3, // star size
          color: colorBase,
          alpha: 1.0,
          decay: Math.random() * 0.015 + 0.01, // decay value for fading out
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Helper to draw a four-pointed star
    const drawStar = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
      color: string,
      alpha: number,
      rotation: number
    ) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(rotation);
      c.beginPath();
      
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      c.moveTo(0, -outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = Math.cos(rot) * outerRadius;
        y = Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      
      c.lineTo(0, -outerRadius);
      c.closePath();

      c.fillStyle = color + alpha + ")";
      c.shadowBlur = 8;
      c.shadowColor = "#39FF14"; // Lime green glow aura
      c.fill();
      c.restore();
    };

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render & update stars
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.rotation += p.rotationSpeed;
        p.size *= 0.98; // gradually shrink

        if (p.alpha <= 0 || p.size <= 0.5) {
          particles.splice(i, 1);
          continue;
        }

        // Draw glittering star particle
        drawStar(
          ctx, 
          p.x, 
          p.y, 
          4, // 4-pointed sparkle
          p.size, 
          p.size / 2.8, 
          p.color, 
          p.alpha,
          p.rotation
        );
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="sonal-stardust-cursor-trail"
      className="fixed inset-0 pointer-events-none z-[9999] mix-blend-screen"
      style={{ opacity: 0.9 }}
    />
  );
}
