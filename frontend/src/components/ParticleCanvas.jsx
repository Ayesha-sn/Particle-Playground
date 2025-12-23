import React, { useEffect, useRef, useState } from 'react';

/**
 * Particle class represents an individual particle with physics properties
 */
class Particle {
  constructor(x, y, canvas) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.radius = Math.random() * 3 + 1;
    this.canvas = canvas;
    
    // Random color from cyberpunk palette
    const colors = [
      { h: 180, s: 100, l: 50 },  // Cyan
      { h: 280, s: 85, l: 60 },   // Purple
      { h: 140, s: 100, l: 50 },  // Green
      { h: 320, s: 100, l: 60 },  // Pink
      { h: 55, s: 100, l: 60 },   // Yellow
      { h: 210, s: 100, l: 60 },  // Blue
    ];
    
    this.baseColor = colors[Math.floor(Math.random() * colors.length)];
    this.opacity = Math.random() * 0.5 + 0.5;
    
    // For attraction/repulsion
    this.mass = this.radius;
  }
  
  /**
   * Update particle position and handle edge bouncing
   */
  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    // Bounce off edges
    if (this.x < 0 || this.x > this.canvas.width) {
      this.vx *= -0.9; // Add some damping
      this.x = Math.max(0, Math.min(this.canvas.width, this.x));
    }
    if (this.y < 0 || this.y > this.canvas.height) {
      this.vy *= -0.9;
      this.y = Math.max(0, Math.min(this.canvas.height, this.y));
    }
    
    // Add slight friction
    this.vx *= 0.99;
    this.vy *= 0.99;
  }
  
  /**
   * Apply force for particle interactions
   */
  applyForce(fx, fy) {
    this.vx += fx;
    this.vy += fy;
  }
  
  /**
   * Draw particle with glow effect
   */
  draw(ctx) {
    const { h, s, l } = this.baseColor;
    
    // Outer glow
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
    gradient.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${this.opacity})`);
    gradient.addColorStop(0.5, `hsla(${h}, ${s}%, ${l}%, ${this.opacity * 0.3})`);
    gradient.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Core particle
    ctx.beginPath();
    ctx.fillStyle = `hsla(${h}, ${s}%, ${l + 20}%, ${this.opacity})`;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * ParticleCanvas component - Interactive particle playground
 */
export const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, isActive: false });
  const animationFrameRef = useRef(null);
  const [particleCount, setParticleCount] = useState(150);
  const [mouseInfluence, setMouseInfluence] = useState(150);
  const [particleInteraction, setParticleInteraction] = useState(true);
  
  /**
   * Initialize canvas and particles
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(
          new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            canvas
          )
        );
      }
    };
    initParticles();
    
    /**
     * Calculate distance between two points
     */
    const distance = (x1, y1, x2, y2) => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };
    
    /**
     * Handle particle-to-particle interactions
     */
    const handleParticleInteractions = () => {
      if (!particleInteraction) return;
      
      const particles = particlesRef.current;
      const interactionRadius = 80;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dist = distance(p1.x, p1.y, p2.x, p2.y);
          
          if (dist < interactionRadius && dist > 0) {
            // Draw connection line
            const opacity = (1 - dist / interactionRadius) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(180, 100%, 50%, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            
            // Slight attraction/repulsion
            const force = (interactionRadius - dist) / interactionRadius * 0.01;
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            
            // Repel if too close, attract if far
            const modifier = dist < interactionRadius / 2 ? -1 : 0.5;
            
            p1.applyForce(
              Math.cos(angle) * force * modifier,
              Math.sin(angle) * force * modifier
            );
            p2.applyForce(
              -Math.cos(angle) * force * modifier,
              -Math.sin(angle) * force * modifier
            );
          }
        }
      }
    };
    
    /**
     * Handle mouse interaction with particles
     */
    const handleMouseInteraction = () => {
      if (!mouseRef.current.isActive) return;
      
      const { x, y } = mouseRef.current;
      const particles = particlesRef.current;
      
      particles.forEach(particle => {
        const dist = distance(particle.x, particle.y, x, y);
        if (dist < mouseInfluence) {
          const force = (mouseInfluence - dist) / mouseInfluence;
          const angle = Math.atan2(particle.y - y, particle.x - x);
          
          // Push particles away from mouse
          particle.applyForce(
            Math.cos(angle) * force * 0.5,
            Math.sin(angle) * force * 0.5
          );
        }
      });
    };
    
    /**
     * Animation loop - 60fps
     */
    const animate = () => {
      // Clear canvas with slight trail effect for smooth motion blur
      ctx.fillStyle = 'rgba(17, 24, 39, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Handle interactions
      handleMouseInteraction();
      handleParticleInteractions();
      
      // Update and draw all particles
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particleCount, mouseInfluence, particleInteraction]);
  
  /**
   * Handle mouse move
   */
  const handleMouseMove = (e) => {
    mouseRef.current = {
      x: e.clientX,
      y: e.clientY,
      isActive: true
    };
  };
  
  /**
   * Handle touch move for mobile
   */
  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      mouseRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        isActive: true
      };
    }
  };
  
  /**
   * Handle mouse/touch end
   */
  const handleEnd = () => {
    mouseRef.current.isActive = false;
  };
  
  /**
   * Add particle cluster on click
   */
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add 10-15 new particles in a cluster
    const clusterSize = Math.floor(Math.random() * 6) + 10;
    for (let i = 0; i < clusterSize; i++) {
      const offsetX = (Math.random() - 0.5) * 50;
      const offsetY = (Math.random() - 0.5) * 50;
      particlesRef.current.push(
        new Particle(x + offsetX, y + offsetY, canvas)
      );
    }
    
    // Limit total particles
    if (particlesRef.current.length > 500) {
      particlesRef.current = particlesRef.current.slice(-500);
    }
  };
  
  /**
   * Reset particles to initial count
   */
  const handleReset = () => {
    const canvas = canvasRef.current;
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(
        new Particle(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          canvas
        )
      );
    }
  };
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onClick={handleClick}
      />
      
      {/* Control Panel */}
      <div className="absolute top-6 left-4 md:left-6 z-10 bg-card/80 backdrop-blur-md border border-border rounded-xl p-4 md:p-6 shadow-elevated max-w-[calc(100vw-2rem)] md:max-w-none">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4" style={{ color: 'hsl(var(--primary))' }}>
          Controls
        </h2>
        
        <div className="space-y-4">
          {/* Particle Count */}
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Particle Count: <span className="text-foreground font-medium">{particleCount}</span>
            </label>
            <input
              type="range"
              min="50"
              max="300"
              value={particleCount}
              onChange={(e) => setParticleCount(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          
          {/* Mouse Influence */}
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Mouse Influence: <span className="text-foreground font-medium">{mouseInfluence}px</span>
            </label>
            <input
              type="range"
              min="50"
              max="300"
              value={mouseInfluence}
              onChange={(e) => setMouseInfluence(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          
          {/* Particle Interaction Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">
              Particle Links
            </label>
            <button
              onClick={() => setParticleInteraction(!particleInteraction)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                particleInteraction
                  ? 'bg-primary text-primary-foreground shadow-neon'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {particleInteraction ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full py-2 px-4 bg-secondary/20 hover:bg-secondary/30 border border-secondary/40 text-foreground rounded-lg transition-all font-medium"
          >
            Reset Particles
          </button>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-6 right-4 md:right-6 z-10 bg-card/80 backdrop-blur-md border border-border rounded-xl p-4 md:p-6 shadow-elevated max-w-[calc(100vw-2rem)] md:max-w-sm">
        <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3" style={{ color: 'hsl(var(--accent))' }}>
          How to Interact
        </h3>
        <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Move your mouse/finger to push particles away</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Tap/click anywhere to add a cluster of particles</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Particles attract and repel each other</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Watch them bounce off the edges!</span>
          </li>
        </ul>
      </div>
    </div>
  );
};