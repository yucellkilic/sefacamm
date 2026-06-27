'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;
    let time = 0;
    const mouse = { x: -9999, y: -9999 };

    // --- Nodes (constellation) ---
    interface Node {
      x: number; y: number;
      vx: number; vy: number;
      radius: number;
      opacity: number;
      pulseSpeed: number;
      pulsePhase: number;
    }

    let nodes: Node[] = [];

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      initNodes();
    };

    const initNodes = () => {
      const count = Math.min(Math.floor((width * height) / 10000), 80);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.8 + 0.8,
        opacity: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      }));
    };

    // --- Aurora wave bands ---
    const drawAurora = () => {
      // Band 1 — cold blue-violet
      const grad1 = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.7);
      grad1.addColorStop(0, `rgba(120,80,255,0)`);
      grad1.addColorStop(0.5, `rgba(80,40,200,0.04)`);
      grad1.addColorStop(1, `rgba(120,80,255,0)`);

      // Band 2 — warm gold
      const grad2 = ctx.createLinearGradient(0, height * 0.2, 0, height * 0.6);
      grad2.addColorStop(0, `rgba(255,200,0,0)`);
      grad2.addColorStop(0.5, `rgba(255,200,0,0.03)`);
      grad2.addColorStop(1, `rgba(255,200,0,0)`);

      for (let i = 0; i < 3; i++) {
        const offset = i * (Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);

        for (let x = 0; x <= width; x += 4) {
          const waveY =
            height / 2 +
            Math.sin(x * 0.004 + time * 0.5 + offset) * (height * 0.08) +
            Math.sin(x * 0.008 + time * 0.3 + offset * 1.5) * (height * 0.04) +
            Math.cos(x * 0.002 + time * 0.2 + offset * 0.7) * (height * 0.06);
          ctx.lineTo(x, waveY);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? grad1 : grad2;
        ctx.fill();
      }
    };

    // --- Draw constellation lines ---
    const drawConnections = () => {
      const maxDist = 120;
      const mouseActiveDist = 200;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];

        // Mouse attraction line
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < mouseActiveDist) {
          const alpha = (1 - dm / mouseActiveDist) * 0.25;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255, 210, 60, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    // --- Draw glowing nodes ---
    const drawNodes = () => {
      nodes.forEach((node) => {
        const pulse = Math.sin(time * node.pulseSpeed * 60 + node.pulsePhase);
        const r = node.radius * (1 + pulse * 0.3);
        const alpha = node.opacity * (0.7 + pulse * 0.3);

        // Glow
        const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 6);
        grd.addColorStop(0, `rgba(255, 215, 0, ${alpha * 0.5})`);
        grd.addColorStop(1, `rgba(255, 215, 0, 0)`);
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 6, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.fill();
      });
    };

    // --- Update nodes ---
    const updateNodes = () => {
      nodes.forEach((node) => {
        // Attract toward mouse slightly
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 250 && dist > 0) {
          node.vx += (dx / dist) * 0.003;
          node.vy += (dy / dist) * 0.003;
        }

        // Dampen
        node.vx *= 0.99;
        node.vy *= 0.99;

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      });
    };

    // --- Mouse cursor glow ---
    const drawMouseGlow = () => {
      if (mouse.x < 0 || mouse.x > width) return;
      const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
      grd.addColorStop(0, 'rgba(255, 200, 0, 0.06)');
      grd.addColorStop(1, 'rgba(255, 200, 0, 0)');
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.016;

      drawAurora();
      updateNodes();
      drawConnections();
      drawNodes();
      drawMouseGlow();

      animationId = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    resize();
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
