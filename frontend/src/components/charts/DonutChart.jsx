import ChartFrame from "./ChartFrame.jsx";

export default function DonutChart({
  data = [],
  size = 180,
  thickness = 26,
  title = "Donut chart",
}) {
  const colors = [
    "#10b981",
    "#ef4444",
    "#f59e0b",
    "#3b82f6",
  ];

  const safe = data
    .filter((d) => Number(d.value) > 0)
    .map((d, i) => ({
      ...d,
      value: Number(d.value),
      color: d.color || colors[i % colors.length],
    }));

  const total = safe.reduce((s, d) => s + d.value, 0);

  if (!total) {
    return (
      <div className="text-sm text-slate-400">No chart data available.</div>
    );
  }

  const r = size / 2 - thickness / 2;
  const cx = size / 2;
  const cy = size / 2;
  let angleStart = -90;

  const polar = (angle) => {
    const rad = (angle * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };

  const arcs = safe.map((d) => {
    const angle = (d.value / total) * 360;
    const start = angleStart;
    const end = angleStart + angle;
    angleStart = end;
    return { ...d, start, end };
  });

  return (
    <ChartFrame title={title}>
      <div className="flex flex-col items-center gap-4 py-1">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={title}>
          {arcs.map((a, i) => {
            const [x1, y1] = polar(a.start);
            const [x2, y2] = polar(a.end);
            const large = a.end - a.start > 180 ? 1 : 0;
            return (
              <g key={i}>
                <title>{`${a.label}: ${Math.round((a.value / total) * 100)}%`}</title>
                <path
                  d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={thickness}
                />
              </g>
            );
          })}
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="20" fontWeight="700" fill="currentColor">
            {total}
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5">
            TOTAL
          </text>
        </svg>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm w-full max-w-md">
          {safe.map((d, i) => (
            <div key={i} className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="truncate">{d.label}</span>
              <span className="text-slate-400 ml-auto">{Math.round((d.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </ChartFrame>
  );
}
