import { useState, useCallback } from "react";
import { apiErrorMessage } from "../../utils/validation";

import StatCard from "../../components/StatCard.jsx";
import BarChart from "../../components/charts/BarChart.jsx";
import DonutChart from "../../components/charts/DonutChart.jsx";

import {
  getSparkStudentsByDepartment,
  getSparkAttendanceSummary,
  getSparkResultSummary,
} from "../../api/sparkApi";

// This page runs real PySpark aggregation jobs on the backend
// (app/spark/analytics.py) against the current MongoDB-exported
// dataset. Each button below triggers an actual Spark job — there
// is no simulated data here.

export default function SparkProcessing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastRun, setLastRun] = useState(null);

  const [deptData, setDeptData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [resultData, setResultData] = useState([]);

  const runSparkJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dept, attendance, result] = await Promise.all([
        getSparkStudentsByDepartment(),
        getSparkAttendanceSummary(),
        getSparkResultSummary(),
      ]);

      setDeptData(
        (Array.isArray(dept) ? dept : []).map((row) => ({
          label: row.department ?? "Unknown",
          value: row.count ?? 0,
        }))
      );

      setAttendanceData(
        (Array.isArray(attendance) ? attendance : []).map((row) => ({
          label: row.status ?? "Unknown",
          value: row.count ?? 0,
        }))
      );

      setResultData(
        (Array.isArray(result) ? result : []).map((row) => ({
          label: row.status ?? "Unknown",
          value: row.count ?? 0,
        }))
      );

      setLastRun(new Date());
    } catch (err) {
      setError(apiErrorMessage(err, "Spark job failed to run."));
    } finally {
      setLoading(false);
    }
  }, []);

  const totalStudents = deptData.reduce((sum, d) => sum + d.value, 0);
  const totalAttendanceRows = attendanceData.reduce((sum, d) => sum + d.value, 0);
  const totalResultRows = resultData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card p-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              loading ? "bg-amber-accent live-dot" : "bg-teal-accent"
            }`}
          />
          <span className="font-medium text-sm">
            {loading
              ? "Spark cluster processing — running"
              : "Spark cluster — idle"}
          </span>
        </div>

        {lastRun && !loading && (
          <span className="text-xs text-slate-400">
            Last run: {lastRun.toLocaleTimeString()}
          </span>
        )}

        <div className="ml-auto flex gap-2">
          <button
            onClick={runSparkJobs}
            disabled={loading}
            className="btn-primary disabled:opacity-60"
          >
            {loading ? "Running Spark Jobs…" : "Run Spark Analysis"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!lastRun && !loading && !error && (
        <div className="card p-8 text-center text-sm text-slate-500">
          No jobs run yet in this session. Click{" "}
          <strong>Run Spark Analysis</strong> to trigger the three
          PySpark aggregation jobs (students-by-department,
          attendance-summary, result-summary) against the current dataset.
        </div>
      )}

      {lastRun && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Students Aggregated"
              value={totalStudents.toLocaleString()}
              icon="◈"
            />
            <StatCard
              label="Attendance Rows Processed"
              value={totalAttendanceRows.toLocaleString()}
              icon="●"
            />
            <StatCard
              label="Result Rows Processed"
              value={totalResultRows.toLocaleString()}
              icon="✓"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="card p-5">
              <h3 className="font-semibold mb-3">
                Students by Department (Spark groupBy)
              </h3>
              {deptData.length ? (
                <BarChart
                  data={deptData}
                  title="Students by Department"
                />
              ) : (
                <p className="text-sm text-slate-400">No data returned.</p>
              )}
            </div>

            <div className="card p-5">
              <h3 className="font-semibold mb-3">
                Attendance Status Summary
              </h3>
              {attendanceData.length ? (
                <DonutChart
                  data={attendanceData}
                  title="Attendance Summary"
                />
              ) : (
                <p className="text-sm text-slate-400">No data returned.</p>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-3">Result Status Summary</h3>
            {resultData.length ? (
              <BarChart data={resultData} title="Result Summary" />
            ) : (
              <p className="text-sm text-slate-400">No data returned.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
