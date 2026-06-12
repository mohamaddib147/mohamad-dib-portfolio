// SignalBackground.jsx
// Canvas-based signal background inspired by the Gemini prototype.
// This component draws:
// 1. A structured signal path
// 2. Fixed section peaks
// 3. A highlighted active node
// 4. A tracer dot that moves only between section peaks
//
// Props:
// - activeIndex: which portfolio section is active
// - className: optional variant class for placement/styling

import { useEffect, useRef } from "react";

function SignalBackground({ activeIndex = 0, className = "" }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const dotXRef = useRef(0);
  const targetXRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const sectionCount = 7;
    const speed = 0.08;
    let width = 0;
    let height = 0;
    let peaks = [];

    function resizeCanvas() {
      const parent = canvas.parentElement;
      width = canvas.width = parent.offsetWidth;
      height = canvas.height = parent.offsetHeight;

      calculatePeaks();

      if (peaks[activeIndex]) {
        targetXRef.current = peaks[activeIndex].x;

        if (dotXRef.current === 0) {
          dotXRef.current = peaks[activeIndex].x;
        }
      }
    }

    function calculatePeaks() {
      peaks = [];
      const margin = width * 0.08;
      const trackableWidth = width - margin * 2;

      for (let i = 0; i < sectionCount; i++) {
        const x = margin + (trackableWidth / (sectionCount - 1)) * i;
        peaks.push({ x });
      }
    }

    function getWaveY(x) {
      const centerY = height / 2;
      const amplitude = height * 0.28;

      const startX = peaks[0].x;
      const endX = peaks[sectionCount - 1].x;
      const normalizedX = (x - startX) / (endX - startX);

      const totalPhases = (sectionCount - 1) * 2 * Math.PI;
      const angle = normalizedX * totalPhases;

      return centerY - amplitude * Math.sin(angle + Math.PI / 2);
    }

    function drawGrid() {
      ctx.strokeStyle = "rgba(255,255,255,0.025)";
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }

    function drawWave() {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(160, 196, 255, 0.26)";
      ctx.lineWidth = 2;

      for (let x = peaks[0].x; x <= peaks[sectionCount - 1].x; x += 1) {
        const y = getWaveY(x);
        if (x === peaks[0].x) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = "rgba(196, 217, 255, 0.92)";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 18;
      ctx.shadowColor = "rgba(126, 183, 255, 0.35)";

      for (let x = peaks[0].x; x <= peaks[sectionCount - 1].x; x += 1) {
        const y = getWaveY(x);
        if (x === peaks[0].x) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function drawNodes() {
      peaks.forEach((peak, index) => {
        const y = getWaveY(peak.x);
        const isActive = index === activeIndex;

        if (isActive) {
          ctx.beginPath();
          ctx.arc(peak.x, y, 18, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(79, 149, 255, 0.08)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(peak.x, y, 10, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(79, 149, 255, 0.22)";
          ctx.strokeStyle = "rgba(158, 197, 255, 0.72)";
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(peak.x, y, isActive ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? "#4f95ff" : "rgba(215, 223, 255, 0.8)";
        ctx.strokeStyle = isActive ? "#9ec5ff" : "rgba(255,255,255,0.75)";
        ctx.lineWidth = isActive ? 2 : 1.2;

        if (isActive) {
          ctx.shadowBlur = 14;
          ctx.shadowColor = "rgba(79, 149, 255, 0.55)";
        }

        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    }

    function drawTracer() {
      dotXRef.current += (targetXRef.current - dotXRef.current) * speed;
      const dotY = getWaveY(dotXRef.current);

      ctx.beginPath();
      ctx.arc(dotXRef.current, dotY, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = "#00c2ff";
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#00c2ff";
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function render() {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      drawWave();
      drawNodes();
      drawTracer();
      animationRef.current = requestAnimationFrame(render);
    }

    resizeCanvas();
    targetXRef.current = peaks[activeIndex]?.x ?? 0;

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener("resize", handleResize);
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [activeIndex]);

  return (
    <div className={`section-signal-canvas ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="signal-canvas-element" />
    </div>
  );
}

export default SignalBackground;