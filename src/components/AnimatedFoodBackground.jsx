import React, { useEffect, useRef, useMemo } from 'react';

/**
 * FoodBackground — A beautiful, food-themed animated background
 * with floating food icons and a warm appetizing gradient.
 * Replaces the old Vanta.js clouds background.
 */

const FOOD_ITEMS = [
  '🍕', '🍔', '🥗', '🍎', '🥑', '🍩', '🍰', '🍣',
  '🌮', '🍜', '🥐', '🍇', '🍓', '🥝', '🧁', '🍱',
  '🥞', '🍝', '🥗', '🍛', '🥤', '🍪', '🌯', '🥙',
  '🧀', '🥕', '🍌', '🥦', '🍿', '🥨',
];

const FoodBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const isDarkRef = useRef(false);

  // Generate stable random particles once
  const particleConfigs = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      emoji: FOOD_ITEMS[i % FOOD_ITEMS.length],
      x: Math.random(),
      y: Math.random(),
      size: 18 + Math.random() * 22,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -0.15 - Math.random() * 0.35,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.8,
      opacity: 0.25 + Math.random() * 0.35,
      wobbleAmp: 0.3 + Math.random() * 0.7,
      wobbleSpeed: 0.005 + Math.random() * 0.01,
      wobbleOffset: Math.random() * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updateDarkMode = () => {
      isDarkRef.current = document.documentElement.classList.contains('dark');
    };
    updateDarkMode();

    // Observe dark mode changes
    const observer = new MutationObserver(() => updateDarkMode());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    particlesRef.current = particleConfigs.map(p => ({
      ...p,
      x: p.x * W(),
      y: p.y * H(),
    }));

    let tick = 0;

    const draw = () => {
      const w = W();
      const h = H();
      const dark = isDarkRef.current;

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      if (dark) {
        // Warm food-themed dark palette — deep chocolate, dark burgundy, espresso
        grad.addColorStop(0, '#1a0f0a');
        grad.addColorStop(0.3, '#2a1810');
        grad.addColorStop(0.6, '#1e1215');
        grad.addColorStop(1, '#12100e');
      } else {
        grad.addColorStop(0, '#fff8f0');
        grad.addColorStop(0.3, '#fff1e6');
        grad.addColorStop(0.7, '#ffe8d6');
        grad.addColorStop(1, '#ffddd2');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Decorative soft circles (bokeh effect)
      const circles = [
        { x: w * 0.15, y: h * 0.2, r: 120, color: dark ? 'rgba(255,140,66,0.12)' : 'rgba(255,140,66,0.10)' },
        { x: w * 0.75, y: h * 0.15, r: 180, color: dark ? 'rgba(255,99,71,0.10)' : 'rgba(255,99,71,0.08)' },
        { x: w * 0.5, y: h * 0.7, r: 200, color: dark ? 'rgba(255,200,87,0.08)' : 'rgba(255,200,87,0.09)' },
        { x: w * 0.85, y: h * 0.8, r: 140, color: dark ? 'rgba(76,175,80,0.09)' : 'rgba(76,175,80,0.07)' },
        { x: w * 0.3, y: h * 0.85, r: 160, color: dark ? 'rgba(233,150,122,0.10)' : 'rgba(233,150,122,0.08)' },
        // Extra dark-mode warmth spots
        ...(dark ? [
          { x: w * 0.6, y: h * 0.35, r: 220, color: 'rgba(180,80,40,0.07)' },
          { x: w * 0.1, y: h * 0.55, r: 170, color: 'rgba(200,120,60,0.06)' },
        ] : []),
      ];
      for (const c of circles) {
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        g.addColorStop(0, c.color);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw and update floating food emojis
      tick++;
      for (const p of particlesRef.current) {
        const wobble = Math.sin(tick * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp;

        ctx.save();
        ctx.translate(p.x + wobble, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = dark ? p.opacity * 0.75 : p.opacity;
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();

        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        // Wrap around
        if (p.y < -p.size) {
          p.y = h + p.size;
          p.x = Math.random() * w;
        }
        if (p.x < -p.size) p.x = w + p.size;
        if (p.x > w + p.size) p.x = -p.size;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, [particleConfigs]);

  return (
    <canvas
      ref={canvasRef}
      id="food-bg"
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default FoodBackground;
