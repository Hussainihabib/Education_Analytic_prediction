import { useEffect, useState } from "react";

import StatCard from "../../components/StatCard.jsx";

import BarChart from "../../components/charts/BarChart.jsx";

import LineAreaChart from "../../components/charts/LineAreaChart.jsx";

import DonutChart from "../../components/charts/DonutChart.jsx";

import {
getDashboard,
getDepartmentPerformance,
getDepartmentPassRate,
getPerformanceTrend,
getCoursePerformance,
} from "../../api/dashboardApi";

import { apiErrorMessage } from "../../utils/validation";

export default function AnalystDashboard() {
const [data, setData] = useState(null);

const [departments, setDepartments] = useState([]);

const [passRates, setPassRates] = useState([]);

const [trend, setTrend] = useState([]);

const [courses, setCourses] = useState([]);

const [error, setError] = useState("");

useEffect(() => {
Promise.all([
getDashboard(),
getDepartmentPerformance(),
getDepartmentPassRate(),
getPerformanceTrend(),
getCoursePerformance(),
])
.then(([d, dp, pr, t, c]) => {
setData(d);
setDepartments(dp);
setPassRates(pr);
setTrend(t);
setCourses(c);
})
.catch((e) =>
setError(
apiErrorMessage(e, "Unable to load analyst dashboard.")
)
);
}, []);

if (error) {
return ( <div className="card p-4 sm:p-5 text-red-600 break-words">
{error} </div>
);
}

if (!data) {
return ( <div className="text-center py-12 sm:py-16 md:py-20 px-4">
Loading Analyst Dashboard... </div>
);
}

return ( <div className="space-y-4 sm:space-y-5 md:space-y-6 w-full min-w-0 overflow-hidden">

 
  {/* =========================
      ANALYTICS HEADER
  ========================= */}
  <div className="card p-4 sm:p-5 md:p-6 min-w-0">
    <div className="eyebrow text-xs sm:text-sm">
      Analytics & Big Data
    </div>

    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mt-1 break-words">
      Institution-wide Analytics
    </h2>

    <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
      Analyst access is global and read-oriented for analytics and
      predictive workflows.
    </p>
  </div>


  {/* =========================
      STAT CARDS
  ========================= */}
  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">

    <StatCard
      label="Students"
      value={data.total_students}
      icon="☺"
    />

    <StatCard
      label="Teachers"
      value={data.total_teachers}
      icon="🎓"
    />

    <StatCard
      label="Courses"
      value={data.total_courses}
      icon="▤"
    />

    <StatCard
      label="Results"
      value={data.total_results}
      icon="📝"
    />

    <StatCard
      label="Attendance Records"
      value={data.total_attendance}
      icon="📅"
    />

    <StatCard
      label="Average CGPA"
      value={data.average_cgpa}
      icon="◈"
    />

    <StatCard
      label="Average Attendance"
      value={`${data.average_attendance}%`}
      icon="●"
    />

    <StatCard
      label="High Risk Students"
      value={(data.high_risk_students || []).length}
      icon="⚠"
      tone="warn"
    />

  </div>


  {/* =========================
      DEPARTMENT ANALYTICS
  ========================= */}
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 min-w-0">

    <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">

      <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
        Department Average CGPA
      </h3>

      <div className="w-full min-w-0 overflow-x-auto">
        <div className="min-w-[280px] sm:min-w-0">
          <BarChart
            title="Department Average CGPA"
            data={departments.map((x) => ({
              label: x.department,
              value: x.average_cgpa,
            }))}
          />
        </div>
      </div>

    </div>


    <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">

      <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
        Department Pass Rate
      </h3>

      <div className="w-full min-w-0 overflow-x-auto">
        <div className="min-w-[280px] sm:min-w-0">
          <BarChart
            title="Department Pass Rate"
            data={passRates.map((x) => ({
              label: x.department,
              value: x.pass_rate,
            }))}
            suffix="%"
          />
        </div>
      </div>

    </div>

  </div>


  {/* =========================
      PERFORMANCE ANALYTICS
  ========================= */}
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 min-w-0">

    <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">

      <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
        Performance Trend
      </h3>

      <div className="w-full min-w-0 overflow-x-auto">
        <div className="min-w-[280px] sm:min-w-0">
          <LineAreaChart
            title="Performance Trend"
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


    <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">

      <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
        Attendance Status Distribution
      </h3>

      <div className="w-full min-w-0">
        <DonutChart
          title="Attendance Status Distribution"
          data={(data.attendance_summary || []).map((x) => ({
            label: x.status,
            value: x.count,
          }))}
        />
      </div>

    </div>

  </div>


  {/* =========================
      COURSE PERFORMANCE
  ========================= */}
  <div className="card p-3 sm:p-4 md:p-5 min-w-0 overflow-hidden">

    <h3 className="font-semibold mb-3 text-sm sm:text-base md:text-lg">
      Top Course Performance
    </h3>

    <div className="w-full min-w-0 overflow-x-auto">
      <div className="min-w-[320px] sm:min-w-0">
        <BarChart
          title="Top Course Performance"
          data={courses.slice(0, 12).map((x) => ({
            label: x.course_id,
            value: x.average_marks,
          }))}
          suffix="%"
        />
      </div>
    </div>

  </div>

</div>
 

);
}
