import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import ChartFrame from "./ChartFrame.jsx";

export function ScatterPlot({ data = [], title = "Attendance vs CGPA" }) {
  if (!data?.length) {
    return <div className="text-sm text-slate-400">No chart data available.</div>;
  }

  return (
    <ChartFrame title={title}>
      <div className="h-[350px] min-w-[720px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 18, right: 18, bottom: 18, left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="cgpa" name="CGPA" />
            <YAxis type="number" dataKey="attendance" name="Attendance" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={data} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}

export function Heatmap({ data = [], title = "Department Pass Rate" }) {
  if (!data?.length) {
    return <div className="text-sm text-slate-400">No chart data available.</div>;
  }

  const max = Math.max(...data.map((d) => Number(d.pass_rate) || 0), 1);
  const color = (value) => {
    const ratio = (Number(value) || 0) / max;
    if (ratio < 0.25) return "#dbeafe";
    if (ratio < 0.5) return "#93c5fd";
    if (ratio < 0.75) return "#3b82f6";
    return "#1d4ed8";
  };

  return (
    <ChartFrame title={title}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
        {data.map((dept) => (
          <div
            key={dept.department}
            className="rounded-xl p-4 text-center shadow"
            style={{
              background: color(dept.pass_rate),
              color: Number(dept.pass_rate) > 65 ? "white" : "black",
            }}
          >
            <h4 className="font-semibold text-sm">{dept.department}</h4>
            <p className="text-2xl font-bold mt-2">{dept.pass_rate}%</p>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}
