import React, { useEffect, useState, useRef } from "react";

export function ThreeDBackground() {
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [splineError, setSplineError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load the Spline viewer script dynamically to keep page loading super fast
  useEffect(() => {
    let script = document.querySelector('script[src*="spline-viewer"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.src = "https://unpkg.com/@splinetool/viewer@1.9.54/build/spline-viewer.js";
      script.type = "module";
      script.async = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => {
      setSplineLoaded(true);
    };

    const handleError = () => {
      console.warn("Could not load premium Spline scene. Falling back to glassmorphic 3D Canvas.");
      setSplineError(true);
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    // If script is already loaded
    if (window.customElements && window.customElements.get("spline-viewer")) {
      setSplineLoaded(true);
    }

    // Safeguard check
    const checkInterval = setInterval(() => {
      if (window.customElements && window.customElements.get("spline-viewer")) {
        setSplineLoaded(true);
        clearInterval(checkInterval);
      }
    }, 500);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
      clearInterval(checkInterval);
    };
  }, []);

  // Classic 2D Canvas simulation as a gorgeous placeholder and high-performance fallback
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    interface UIPanel {
      x: number;
      y: number;
      z: number;
      width: number;
      height: number;
      speedY: number;
      hue: number;
      opacity: number;
      rotationOffset: number;
      itemCount: number;
    }

    const panels: UIPanel[] = [];
    const count = 12;
    const fov = 300;

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 600;
      const y = (Math.random() - 0.5) * 600;
      const z = Math.random() * 350 + 80;

      panels.push({
        x,
        y,
        z,
        width: 110 + Math.random() * 60,
        height: 80 + Math.random() * 50,
        speedY: 0.12 + Math.random() * 0.2,
        hue: i % 3 === 0 ? 200 : i % 3 === 1 ? 220 : 45,
        opacity: 0.1 + Math.random() * 0.15,
        rotationOffset: Math.random() * Math.PI * 2,
        itemCount: 2 + Math.floor(Math.random() * 3),
      });
    }

    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;

      targetRotateY = (x / width) * 0.25;
      targetRotateX = -(y / height) * 0.25;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const drawRoundedRect = (
      c: CanvasRenderingContext2D,
      rx: number,
      ry: number,
      rw: number,
      rh: number,
      radius: number
    ) => {
      c.beginPath();
      c.moveTo(rx + radius, ry);
      c.lineTo(rx + rw - radius, ry);
      c.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
      c.lineTo(rx + rw, ry + rh - radius);
      c.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
      c.lineTo(rx + radius, ry + rh);
      c.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
      c.lineTo(rx, ry + radius);
      c.quadraticCurveTo(rx, ry, rx + radius, ry);
      c.closePath();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      currentRotateX += (targetRotateX - currentRotateX) * 0.05;
      currentRotateY += (targetRotateY - currentRotateY) * 0.05;

      const cosX = Math.cos(currentRotateX);
      const sinX = Math.sin(currentRotateX);
      const cosY = Math.cos(currentRotateY);
      const sinY = Math.sin(currentRotateY);

      const sortedPanels = [...panels].sort((a, b) => b.z - a.z);

      for (let i = 0; i < sortedPanels.length; i++) {
        const p = sortedPanels[i];

        p.y += p.speedY;
        if (p.y > 320) {
          p.y = -320;
          p.x = (Math.random() - 0.5) * 600;
        }

        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        z2 += 220;

        if (z2 > 20) {
          const scale = fov / z2;
          const sx = width / 2 + x1 * scale;
          const sy = height / 2 + y2 * scale;

          const sw = p.width * scale * 0.45;
          const sh = p.height * scale * 0.45;

          const depthFade = Math.max(0, Math.min(1, (550 - z2) / 450));
          const finalAlpha = p.opacity * depthFade;

          ctx.save();

          ctx.shadowColor = `hsla(${p.hue}, 85%, 60%, ${finalAlpha * 0.45})`;
          ctx.shadowBlur = 15 * scale * 0.4;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4 * scale * 0.4;

          drawRoundedRect(ctx, sx - sw / 2, sy - sh / 2, sw, sh, 10 * scale * 0.4);

          const glassGrad = ctx.createLinearGradient(sx - sw / 2, sy - sh / 2, sx + sw / 2, sy + sh / 2);
          glassGrad.addColorStop(0, `rgba(255, 255, 255, ${finalAlpha * 0.45})`);
          glassGrad.addColorStop(1, `rgba(255, 255, 255, ${finalAlpha * 0.05})`);
          ctx.fillStyle = glassGrad;
          ctx.fill();

          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;

          const strokeGrad = ctx.createLinearGradient(sx - sw / 2, sy - sh / 2, sx + sw / 2, sy + sh / 2);
          strokeGrad.addColorStop(0, `rgba(255, 255, 255, ${finalAlpha * 0.8})`);
          strokeGrad.addColorStop(0.5, `hsla(${p.hue}, 80%, 75%, ${finalAlpha * 0.4})`);
          strokeGrad.addColorStop(1, `rgba(255, 255, 255, ${finalAlpha * 0.1})`);
          ctx.strokeStyle = strokeGrad;
          ctx.lineWidth = Math.max(0.6, 1.2 * scale * 0.35);
          ctx.stroke();

          const padding = 12 * scale * 0.4;
          const itemHeight = 8 * scale * 0.4;
          const gap = 6 * scale * 0.4;
          let currentY = sy - sh / 2 + padding;

          ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${finalAlpha * 0.9})`;
          drawRoundedRect(ctx, sx - sw / 2 + padding, currentY, sw * 0.45, itemHeight * 1.2, 3 * scale * 0.3);
          ctx.fill();

          currentY += itemHeight * 1.2 + gap * 1.5;

          for (let k = 0; k < p.itemCount; k++) {
            ctx.fillStyle = `hsla(${p.hue}, 75%, 70%, ${finalAlpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(sx - sw / 2 + padding + itemHeight / 2, currentY + itemHeight / 2, itemHeight / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha * 0.4})`;
            drawRoundedRect(
              ctx,
              sx - sw / 2 + padding + itemHeight * 1.6,
              currentY + itemHeight * 0.15,
              sw * (0.35 + (k % 2) * 0.1),
              itemHeight * 0.7,
              2 * scale * 0.3
            );
            ctx.fill();

            currentY += itemHeight + gap;
          }

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div id="homepage-3d-background-root" className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none">
      {/* 2D Glass Canvas Background - visible initially and fading out if Spline loads */}
      <canvas
        ref={canvasRef}
        id="homepage-fallback-canvas"
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          splineLoaded && !splineError ? "opacity-0 pointer-events-none" : "opacity-40 dark:opacity-50"
        }`}
      />

      {/* Premium Spline 3D Scene Layer */}
      {splineLoaded && !splineError && (
        <div id="spline-3d-backdrop" className="absolute inset-0 w-full h-full transition-opacity duration-1000 opacity-80 dark:opacity-60">
          {/* @ts-ignore */}
          <spline-viewer
            id="homepage-spline-viewer"
            url="https://prod.spline.design/a1f156f7-ef01-42d1-bf7b-5be1b7967b0a/scene.splinecode"
            class="w-full h-full border-0 outline-none"
            loading-anim
          />
        </div>
      )}

      {/* Gentle overlay to ensure readability of text, links and form fields in light/dark theme */}
      <div id="homepage-background-overlay" className="absolute inset-0 bg-slate-50/5 dark:bg-slate-950/10 pointer-events-none" />
    </div>
  );
}
