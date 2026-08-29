import { useId } from "react";
import ChartFrame from "./ChartFrame.jsx";

export default function LineAreaChart({
  data,
  height = 220,
  color = "#0f172a",
  area = true,
  suffix = "",
  title = "Line chart",
}) {
  const gradientId = `areaFill-${useId().replace(/:/g, "")}`;

  if (!data?.length) return null;

  const w = Math.max(1200, data.length * 80);
  const h = height;
  const pad = { top: 20, right: 16, bottom: 42, left: 42 };
  const values = data.map((d) => Number(d.value) || 0);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = rawMax - rawMin || Math.max(Math.abs(rawMax) * 0.05, 1);
  const min = rawMin - spread * 0.05;
  const max = rawMax + spread * 0.05;
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const x = (i) =>
    data.length === 1
      ? pad.left + innerW / 2
      : pad.left + (i / (data.length - 1)) * innerW;
  const y = (v) =>
    pad.top + innerH - ((v - min) / (max - min || 1)) * innerH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(Number(d.value) || 0)}`)
    .join(" ");
  const areaPath = `${linePath} L ${x(data.length - 1)} ${pad.top + innerH} L ${x(0)} ${pad.top + innerH} Z`;

  const gridLines = 4;
  const yTicks = Array.from(
    { length: gridLines + 1 },
    (_, i) => min + ((max - min) * i) / gridLines
  );

  const labelFor = (value) => {
    const text = String(value ?? "");
    return text.length > 14 ? `${text.slice(0, 13)}…` : text;
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
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={pad.left}
                x2={w - pad.right}
                y1={y(t)}
                y2={y(t)}
                stroke="currentColor"
                strokeOpacity="0.08"
              />
              <text
                x={pad.left - 8}
                y={y(t) + 3}
                textAnchor="end"
                fontSize="9"
                fill="currentColor"
                opacity="0.5"
              >
                {Math.round(t)}{suffix}
              </text>
            </g>
          ))}
          {area && (
            <path
              d={areaPath}
              fill={`url(#${gradientId})`}
            />
          )}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((d, i) => (
            <g key={i}>
              <title>{`${d.label}: ${d.value}${suffix}`}</title>
              <circle cx={x(i)} cy={y(Number(d.value) || 0)} r="2.8" fill={color} />
              {(i % Math.ceil(data.length / 12) === 0 || i === data.length - 1) && (
                <text
                  x={x(i)}
                  y={h - 13}
                  textAnchor="middle"
                  fontSize="9"
                  fill="currentColor"
                  opacity="0.55"
                >
                  {labelFor(d.label)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </ChartFrame>
  );
}
