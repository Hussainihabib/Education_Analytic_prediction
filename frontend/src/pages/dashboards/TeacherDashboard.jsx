import { useEffect, useState } from "react";

import StatCard from "../../components/StatCard.jsx";

import BarChart from "../../components/charts/BarChart.jsx";

import DonutChart from "../../components/charts/DonutChart.jsx";

import { RiskBadge } from "../../components/Badges.jsx";

import { useAuth } from "../../context/AuthContext.jsx";

import {
  getDashboard,
  getCoursePerformance,
  getGradeDistribution,
  getAtRiskStudents,
} from "../../api/dashboardApi";

import { apiErrorMessage } from "../../utils/validation";

export default function TeacherDashboard() {
  const { user } = useAuth();

  const [data, setData] = useState(null);

  const [courses, setCourses] = useState([]);

  const [grades, setGrades] = useState([]);

  const [risk, setRisk] = useState([]);

  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getCoursePerformance(),
      getGradeDistribution(),
      getAtRiskStudents(),
    ])
      .then(([d, c, g, r]) => {
        setData(d);
        setCourses(c);
        setGrades(g);
        setRisk(r);
      })
      .catch((e) =>
        setError(
          apiErrorMessage(e, "Unable to load teacher dashboard.")
        )
      );
  }, []);

  if (error) {
    return (
      <div className="card p-4 sm:p-5 text-red-600 break-words">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 sm:py-20 px-4">
        Loading Teacher Dashboard...
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "Teacher";

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 w-full min-w-0">

      {/* =========================
          TEACHER HEADER
      ========================= */}
      <div className="card p-4 sm:p-5 md:p-6 bg-navy-900 text-cream-100 min-w-0">
        <div className="eyebrow text-xs sm:text-sm text-slate-400">
          Teacher Workspace
        </div>

        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mt-1 break-words">
          Welcome, {firstName}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          All figures below are limited to your teacher scope.
        </p>
      </div>

      {/* =========================
          STAT CARDS
      ========================= */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="My Students"
          value={data.total_students}
          icon="☺"
        />

        <StatCard
          label="My Courses"
          value={data.total_courses}
          icon="▤"
        />

        <StatCard
          label="Avg Attendance"
          value={`${data.average_attendance}%`}
          icon="●"
        />

        <StatCard
          label="Avg CGPA"
          value={data.average_cgpa}
          icon="◈"
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
          label="High Risk"
          value={risk.length}
          icon="⚠"
          tone="warn"
        />

        <StatCard
          label="Active Students"
          value={data.active_students}
          icon="✔"
          tone="good"
        />
      </div>

      {/* =========================
          COURSE & GRADE ANALYTICS
      ========================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 min-w-0">
        <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">
          <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
            Course Average Marks
          </h3>

          <div className="w-full min-w-0 overflow-x-auto">
            <div className="min-w-[360px] sm:min-w-0">
              <BarChart
                title="Course Average Marks"
                data={courses.slice(0, 12).map((x) => ({
                  label: x.course_id,
                  value: x.average_marks,
                }))}
                suffix="%"
              />
            </div>
          </div>
        </div>

        <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">
          <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
            My Grade Distribution
          </h3>

          <div className="w-full min-w-0 overflow-x-auto">
            <div className="min-w-[300px] sm:min-w-0">
              <BarChart
                title="My Grade Distribution"
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
          ATTENDANCE & ALERTS
      ========================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 min-w-0">
        <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">
          <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
            Attendance Status
          </h3>

          <div className="w-full min-w-0">
            <DonutChart
              title="Attendance Status"
              data={(data.attendance_summary || []).map((x) => ({
                label: x.status,
                value: x.count,
              }))}
            />
          </div>
        </div>

        <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">
          <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
            Student Alerts
          </h3>

          {risk.length ? (
            <div className="space-y-2">
              {risk.slice(0, 10).map((s) => (
                <div
                  key={s.student_id}
                  className="flex flex-col min-[480px]:flex-row min-[480px]:items-center gap-2 sm:gap-3 border-b border-slate-100 dark:border-slate-700 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium break-words">
                      {s.name}
                    </div>

                    <div className="text-xs text-slate-400 mt-1 break-words">
                      CGPA {s.cgpa} · Attendance {s.attendance}%
                    </div>
                  </div>

                  <div className="self-start min-[480px]:self-auto">
                    <RiskBadge value={s.risk.toLowerCase()} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No students currently flagged.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}