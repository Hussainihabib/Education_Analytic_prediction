import { useEffect, useState } from "react";

import StatCard from "../../components/StatCard.jsx";

import BarChart from "../../components/charts/BarChart.jsx";

import LineAreaChart from "../../components/charts/LineAreaChart.jsx";

import DonutChart from "../../components/charts/DonutChart.jsx";

import { RiskBadge } from "../../components/Badges.jsx";

import { Link } from "react-router-dom";

import {
getDashboard,
getDepartmentPerformance,
getMonthlyAttendance,
getGradeDistribution,
} from "../../api/dashboardApi";

import { apiErrorMessage } from "../../utils/validation";

export default function AdminDashboard() {
const [data, setData] = useState(null);

const [departmentPerformance, setDepartmentPerformance] = useState([]);

const [monthlyAttendance, setMonthlyAttendance] = useState([]);

const [grades, setGrades] = useState([]);

const [error, setError] = useState("");

useEffect(() => {
Promise.all([
getDashboard(),
getDepartmentPerformance(),
getMonthlyAttendance(),
getGradeDistribution(),
])
.then(([dashboard, departments, attendance, gradeData]) => {
setData(dashboard);
setDepartmentPerformance(departments);
setMonthlyAttendance(attendance);
setGrades(gradeData);
})
.catch((e) =>
setError(apiErrorMessage(e, "Unable to load admin dashboard."))
);
}, []);

if (error)
return ( <div className="card p-4 sm:p-5 text-red-600 break-words">
{error} </div>
);

if (!data)
return ( <div className="text-center py-12 sm:py-16 md:py-20 px-4">
Loading Admin Dashboard... </div>
);

const risk = data.high_risk_students || [];

return ( <div className="space-y-4 sm:space-y-5 md:space-y-6 w-full min-w-0 overflow-hidden">

 
  {/* =========================
      STAT CARDS
  ========================= */}
  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
    
    <StatCard
      label="Total Students"
      value={data.total_students}
      icon="☺"
    />

    <StatCard
      label="Active Students"
      value={data.active_students}
      icon="✔"
      tone="good"
    />

    <StatCard
      label="Total Teachers"
      value={data.total_teachers}
      icon="🎓"
    />

    <StatCard
      label="Courses"
      value={data.total_courses}
      icon="📚"
    />

    <StatCard
      label="Attendance Records"
      value={data.total_attendance}
      icon="📅"
    />

    <StatCard
      label="Result Records"
      value={data.total_results}
      icon="📝"
    />

    <StatCard
      label="Average Attendance"
      value={`${data.average_attendance}%`}
      icon="●"
    />

    <StatCard
      label="Average CGPA"
      value={data.average_cgpa}
      icon="◈"
    />
  </div>


  {/* =========================
      FIRST ROW GRAPHS
  ========================= */}
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 min-w-0">
    
    <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">
      <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
        Attendance Records by Month
      </h3>

      <div className="w-full min-w-0 overflow-x-auto">
        <div className="min-w-[280px] sm:min-w-0">
          <LineAreaChart
            title="Attendance Records by Month"
            data={monthlyAttendance.map((x) => ({
              label: x.month,
              value: x.count,
            }))}
            color="#10b981"
          />
        </div>
      </div>
    </div>


    <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">
      <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
        Result Grade Distribution
      </h3>

      <div className="w-full min-w-0 overflow-x-auto">
        <div className="min-w-[280px] sm:min-w-0">
          <BarChart
            title="Result Grade Distribution"
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
      SECOND ROW GRAPHS
  ========================= */}
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 min-w-0">
    
    <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">
      <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
        Department Performance
      </h3>

      <div className="w-full min-w-0 overflow-x-auto">
        <div className="min-w-[280px] sm:min-w-0">
          <BarChart
            title="Department Performance"
            data={departmentPerformance.map((x) => ({
              label: x.department,
              value: x.average_cgpa,
            }))}
            suffix=""
          />
        </div>
      </div>
    </div>


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

  </div>


  {/* =========================
      HIGH RISK STUDENTS
  ========================= */}
  <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">
    
    <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between gap-2 sm:gap-3 mb-4">
      
      <h3 className="font-semibold text-sm sm:text-base md:text-lg">
        High-Risk Students
      </h3>

      <Link
        to="/app/students"
        className="text-xs sm:text-sm font-medium hover:underline self-start min-[480px]:self-auto"
      >
        View students →
      </Link>

    </div>


    {risk.length ? (
      <div className="space-y-2 sm:space-y-3">
        
        {risk.map((s) => (
          <div
            key={s.student_id}
            className="
              flex flex-col 
              min-[520px]:flex-row 
              min-[520px]:items-center 
              gap-2 sm:gap-3
              px-3 sm:px-4 
              py-3 
              rounded-lg 
              bg-red-50/60 
              dark:bg-red-500/5
              min-w-0
            "
          >
            
            <div className="flex-1 min-w-0">
              
              <div className="text-sm sm:text-base font-medium break-words">
                {s.name}
              </div>

              <div className="text-xs sm:text-sm text-slate-400 break-words mt-1">
                {s.department} · Sem {s.semester} · CGPA {s.cgpa} · Attendance{" "}
                {s.attendance}%
              </div>

            </div>


            <div className="self-start min-[520px]:self-auto shrink-0">
              <RiskBadge value={s.risk.toLowerCase()} />
            </div>

          </div>
        ))}

      </div>
    ) : (
      <p className="text-sm text-slate-400">
        No high-risk students in the current scope.
      </p>
    )}

  </div>

</div>
 

);
}
