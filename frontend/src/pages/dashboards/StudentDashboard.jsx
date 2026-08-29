import { useEffect, useState } from "react";

import StatCard from "../../components/StatCard.jsx";

import LineAreaChart from "../../components/charts/LineAreaChart.jsx";

import BarChart from "../../components/charts/BarChart.jsx";

import DonutChart from "../../components/charts/DonutChart.jsx";

import { StatusBadge } from "../../components/Badges.jsx";

import { useAuth } from "../../context/AuthContext.jsx";

import {
getDashboard,
getPerformanceTrend,
getGradeDistribution,
} from "../../api/dashboardApi";

import { getCourses } from "../../api/courseApi";

import { apiErrorMessage } from "../../utils/validation";

export default function StudentDashboard() {
const { user } = useAuth();

const [data, setData] = useState(null);

const [trend, setTrend] = useState([]);

const [grades, setGrades] = useState([]);

const [courses, setCourses] = useState([]);

const [error, setError] = useState("");

useEffect(() => {
Promise.all([
getDashboard(),
getPerformanceTrend(),
getGradeDistribution(),
getCourses(),
])
.then(([d, t, g, c]) => {
setData(d);
setTrend(t);
setGrades(g);
setCourses(c?.courses || []);
})
.catch((e) =>
setError(
apiErrorMessage(e, "Unable to load student dashboard.")
)
);
}, []);

if (error) {
return ( <div className="card p-4 sm:p-5 text-red-600 break-words">
{error} </div>
);
}

if (!data) {
return ( <div className="text-center py-12 sm:py-20 px-4">
Loading Student Dashboard... </div>
);
}

const risk = (data.high_risk_students || [])[0];

const riskLabel = risk ? risk.risk : "Low";

return ( <div className="space-y-4 sm:space-y-5 md:space-y-6 w-full min-w-0">

 
  {/* =========================
      STUDENT HEADER
  ========================= */}
  <div className="card p-4 sm:p-5 md:p-6 bg-navy-900 text-cream-100 min-w-0">
    <div className="eyebrow text-xs sm:text-sm text-slate-400">
      My Academic Outlook
    </div>

    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mt-1 break-words">
      Hi {user?.name?.split(" ")[0] || "Student"}
    </h2>

    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
      This dashboard contains only your own academic, attendance and
      result data.
    </p>
  </div>

  {/* =========================
      STAT CARDS
  ========================= */}
  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
    <StatCard
      label="My Attendance"
      value={`${data.average_attendance}%`}
      icon="●"
    />

    <StatCard
      label="My CGPA"
      value={data.average_cgpa}
      icon="◈"
    />

    <StatCard
      label="My Courses"
      value={data.total_courses}
      icon="▤"
    />

    <StatCard
      label="Risk Status"
      value={riskLabel}
      icon={risk ? "⚠" : "✔"}
      tone={risk ? "warn" : "good"}
    />

    <StatCard
      label="Result Records"
      value={data.total_results}
      icon="📝"
    />

    <StatCard
      label="Attendance Records"
      value={data.total_attendance}
      icon="📅"
    />

    <StatCard
      label="Active Status"
      value={data.active_students ? "Active" : "Inactive"}
      icon="✔"
    />

    <StatCard
      label="Semester"
      value={data.students_by_semester?.[0]?.semester ?? "—"}
      icon="🎓"
    />
  </div>

  {/* =========================
      PERFORMANCE & GRADES
  ========================= */}
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 min-w-0">

    {/* Performance Chart */}
    <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">
      <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
        My Performance by Semester
      </h3>

      <div className="w-full min-w-0 overflow-x-auto">
        <div className="min-w-[300px] sm:min-w-0">
          <LineAreaChart
            title="My Performance by Semester"
            data={trend.map((x) => ({
              label: `Sem ${x.semester}`,
              value: x.average_percentage,
            }))}
            color="#10b981"
            suffix="%"
          />
        </div>
      </div>
    </div>

    {/* Grades Chart */}
    <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">
      <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
        My Grades
      </h3>

      <div className="w-full min-w-0 overflow-x-auto">
        <div className="min-w-[300px] sm:min-w-0">
          <BarChart
            title="My Grades"
            data={grades.map((x) => ({
              label: x.grade,
              value: x.count,
            }))}
          />
        </div>
      </div>
    </div>

  </div>

  {/* =========================
      ATTENDANCE & COURSES
  ========================= */}
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 min-w-0">

    {/* Attendance */}
    <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">
      <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
        My Attendance Status
      </h3>

      <div className="w-full min-w-0">
        <DonutChart
          title="My Attendance Status"
          data={(data.attendance_summary || []).map((x) => ({
            label: x.status,
            value: x.count,
          }))}
        />
      </div>
    </div>

    {/* Courses */}
    <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">
      <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
        My Courses
      </h3>

      {courses.length ? (
        <div className="space-y-2 sm:space-y-3">
          {courses.map((c) => (
            <div
              key={c.course_code}
              className="flex flex-col min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-lg bg-slate-50 dark:bg-navy-700/40"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium break-words">
                  {c.course_name}
                </div>

                <div className="text-xs text-slate-400 mt-1 break-words">
                  {c.course_code} · {c.credit_hours} credits
                </div>
              </div>

              <div className="self-start min-[480px]:self-auto shrink-0">
                <StatusBadge value={c.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          No courses found in your current scope.
        </p>
      )}
    </div>

  </div>
</div>
 

);
}
