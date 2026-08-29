import ChartFrame from "./ChartFrame.jsx";

export default function BarChart({
  data,
  height = 220,
  color = "#3fb8a8",
  suffix = "",
  title = "Bar chart",
}) {
  if (!data?.length) return null;

  const w = Math.max(1200, data.length * 80);
  const h = height;
  const pad = { top: 24, right: 16, bottom: 48, left: 40 };
  const maxValue = Math.max(...data.map((d) => Number(d.value) || 0), 0);
  const max = maxValue > 0 ? maxValue * 1.15 : 1;
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const slot = innerW / data.length;
  const bw = slot * 0.58;
  const gap = slot * 0.42;

  const labelFor = (value) => {
    const text = String(value ?? "");
    return text.length > 15 ? `${text.slice(0, 14)}…` : text;
  };

  return (
    <ChartFrame title={title}>
      <div className="w-full overflow-x-auto pb-1">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="min-w-[720px] w-full"
          style={{ height }}
          role="img"
          aria-label={title}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <g key={i}>
              <line
                x1={pad.left}
                x2={w - pad.right}
                y1={pad.top + innerH * (1 - t)}
                y2={pad.top + innerH * (1 - t)}
                stroke="currentColor"
                strokeOpacity="0.08"
              />
              <text
                x={pad.left - 7}
                y={pad.top + innerH * (1 - t) + 3}
                textAnchor="end"
                fontSize="9"
                fill="currentColor"
                opacity="0.5"
              >
                {Math.round(maxValue * t)}{suffix}
              </text>
            </g>
          ))}

          {data.map((d, i) => {
            const value = Number(d.value) || 0;
            const bh = (value / max) * innerH;
            const x = pad.left + i * slot + gap / 2;
            const y = pad.top + innerH - bh;
            const label = labelFor(d.label);

            return (
              <g key={`${d.label}-${i}`}>
                <title>{`${d.label}: ${d.value}${suffix}`}</title>
                <rect
                  x={x}
                  y={y}
                  width={bw}
                  height={Math.max(bh, value > 0 ? 1 : 0)}
                  rx="5"
                  fill={d.color || color}
                  opacity="0.9"
                />
                <text
                  x={x + bw / 2}
                  y={y - 7}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="currentColor"
                >
                  {d.value}{suffix}
                </text>
                <text
                  x={x + bw / 2}
                  y={h - 15}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="currentColor"
                  opacity="0.62"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </ChartFrame>
  );
}
