import { useEffect, useMemo, useRef, useState } from "react";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function mixChannel(start, end, amount) {
  return Math.round(start + (end - start) * amount);
}

function mixRgb(from, to, amount) {
  const t = clamp(amount, 0, 1);
  const parse = (hex) => [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  return `rgb(${mixChannel(r1, r2, t)}, ${mixChannel(g1, g2, t)}, ${mixChannel(b1, b2, t)})`;
}

function colorForValue(value) {
  const v = clamp(Number(value || 0), -1, 1);
  if (v >= 0) {
    return mixRgb("#111114", "#ff4560", v);
  }
  return mixRgb("#111114", "#00d4a1", Math.abs(v));
}

export default function FragilityHeatmap({ heatmap }) {
  const symbols = useMemo(() => heatmap?.symbols || [], [heatmap]);
  const matrix = useMemo(() => heatmap?.matrix || [], [heatmap]);
  const breakSet = useMemo(() => new Set(heatmap?.cluster_breaks || []), [heatmap]);
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const layout = useMemo(() => {
    const size = symbols.length || 1;
    return {
      labelSize: size <= 14 ? 100 : size <= 22 ? 88 : 76,
    };
  }, [symbols.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !symbols.length) return undefined;

    const ctx = canvas.getContext("2d");
    let animationFrame = 0;

    const draw = () => {
      const width = wrap.clientWidth;
      const height = wrap.clientHeight;
      setContainerWidth(width);
      const dpr = window.devicePixelRatio || 1;
      const labelSize = layout.labelSize;
      const cellWidth = Math.max(8, Math.floor((width - labelSize) / symbols.length));
      const cellHeight = Math.max(8, Math.floor((height - labelSize) / symbols.length));
      const cellSize = Math.min(cellWidth, cellHeight);
      const gridSize = labelSize + cellSize * symbols.length;

      canvas.width = Math.max(1, Math.floor(gridSize * dpr));
      canvas.height = Math.max(1, Math.floor(gridSize * dpr));
      canvas.style.width = `${gridSize}px`;
      canvas.style.height = `${gridSize}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, gridSize, gridSize);
      ctx.fillStyle = "#111114";
      ctx.fillRect(0, 0, gridSize, gridSize);

      ctx.font = `${Math.max(8, Math.min(10, cellSize / 2))}px JetBrains Mono, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      symbols.forEach((symbol, index) => {
        const x = labelSize + index * cellSize;
        const y = labelSize + index * cellSize;
        ctx.fillStyle = breakSet.has(index) ? "#2a2a35" : "#1f1f26";
        ctx.fillRect(x, 0, cellSize, labelSize);
        ctx.fillRect(0, y, labelSize, cellSize);
        ctx.fillStyle = "#3d3d4d";
        ctx.save();
        ctx.translate(x + cellSize / 2, labelSize - 6);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(symbol, 0, 0);
        ctx.restore();
        ctx.fillText(symbol, labelSize - 6, y + cellSize / 2);
      });

      symbols.forEach((rowSymbol, rowIndex) => {
        symbols.forEach((colSymbol, colIndex) => {
          const value = Number(matrix[rowIndex]?.[colIndex] ?? 0);
          const x = labelSize + colIndex * cellSize;
          const y = labelSize + rowIndex * cellSize;
          ctx.fillStyle = colorForValue(value);
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = "#1f1f26";
          ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
        });
      });
    };

    const handleResize = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(wrap);
    draw();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [breakSet, layout.labelSize, matrix, symbols]);

  if (!symbols.length) {
    return (
      <div className="flex h-full items-center justify-center border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-2)]">
        No correlation matrix available yet.
      </div>
    );
  }

  const handleMove = (event) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const labelSize = layout.labelSize;
    const cellSize = Math.min(
      Math.max(8, Math.floor((width - labelSize) / symbols.length)),
      Math.max(8, Math.floor((height - labelSize) / symbols.length)),
    );
    const x = event.clientX - rect.left - labelSize;
    const y = event.clientY - rect.top - labelSize;
    if (x < 0 || y < 0) {
      setHover(null);
      return;
    }
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (row < 0 || col < 0 || row >= symbols.length || col >= symbols.length) {
      setHover(null);
      return;
    }
    const value = Number(matrix[row]?.[col] ?? 0);
    setHover({
      left: labelSize + col * cellSize + cellSize / 2,
      top: labelSize + row * cellSize + cellSize / 2,
      rowSymbol: symbols[row],
      colSymbol: symbols[col],
      value,
    });
  };

  const maxTooltipLeft = Math.max(0, containerWidth - 220);

  return (
    <div
      ref={wrapRef}
      className="relative h-full min-h-0 overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4"
      onMouseLeave={() => setHover(null)}
      onMouseMove={handleMove}
    >
      <canvas ref={canvasRef} className="block max-h-full max-w-full" />
      {hover ? (
        <div
          className="pointer-events-none absolute rounded-[3px] border border-[var(--border-1)] bg-[var(--bg)] px-2 py-1 font-mono text-[10px] text-[var(--text-1)]"
          style={{
            left: `${Math.min(hover.left + 12, maxTooltipLeft)}px`,
            top: `${Math.max(8, hover.top - 24)}px`,
          }}
        >
          {hover.rowSymbol} x {hover.colSymbol}: {hover.value.toFixed(2)}
        </div>
      ) : null}
    </div>
  );
}
