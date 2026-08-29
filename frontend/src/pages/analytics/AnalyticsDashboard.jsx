import { useEffect, useState } from "react";

import StatCard from "../../components/StatCard.jsx";
import DataTable from "../../components/DataTable.jsx";

import LineAreaChart from "../../components/charts/LineAreaChart.jsx";
import BarChart from "../../components/charts/BarChart.jsx";
import DonutChart from "../../components/charts/DonutChart.jsx";

import {
  ScatterPlot,
  Heatmap,
} from "../../components/charts/ScatterHeatmap.jsx";

import {
  getDashboardStats,
  getDashboardStates,
  getStudentsByDepartment,
  getStudentsBySemester,
  getAttendanceSummary,
  getAverageCGPA,
  getAverageAttendance,
  getResultSummary,
  getDepartmentPerformance,
  getTopStudents,
  getMonthlyAttendance,
  getCoursePerformance,
  getTeacherPerformance,
  getAtRiskStudents,
  getDepartmentPassRate,
  getPerformanceTrend,
  getGradeDistribution,
} from "../../api/dashboardApi";

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({});
  const [departmentData, setDepartmentData] = useState([]);
  const [semesterData, setSemesterData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [resultData, setResultData] = useState({});
  const [passFailChart, setPassFailChart] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [gradeChart, setGradeChart] = useState([]);

  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [coursePerformance, setCoursePerformance] = useState([]);
  const [teacherPerformance, setTeacherPerformance] = useState([]);
  const [departmentPassRate, setDepartmentPassRate] = useState([]);
  const [performanceTrend, setPerformanceTrend] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const dashboardRes = await getDashboardStats();

      const statsRes = await getDashboardStates();

      const deptRes = await getStudentsByDepartment();

      const semesterRes = await getStudentsBySemester();

      const attendanceRes = await getAttendanceSummary();

      const departmentPerformanceRes =
        await getDepartmentPerformance();

      const topStudentsRes =
        await getTopStudents();

      const monthlyAttendanceRes =
        await getMonthlyAttendance();

      const coursePerformanceRes =
        await getCoursePerformance();

      const teacherPerformanceRes =
        await getTeacherPerformance();

      const departmentPassRateRes =
        await getDepartmentPassRate();

      const performanceTrendRes =
        await getPerformanceTrend();

      const atRiskStudentsRes =
        await getAtRiskStudents();

      const resultRes =
        await getResultSummary();

      setPassFailChart([
        {
          label: "Pass",
          value: resultRes.Pass || 0,
          color: "#22c55e",
        },
        {
          label: "Fail",
          value: resultRes.Fail || 0,
          color: "#ef4444",
        },
      ]);

      const grades =
        await getGradeDistribution();

      setGradeChart(
        grades.map((item) => ({
          label: item.grade,
          value: item.count,
        }))
      );

      setDashboard(dashboardRes);

      setStats(statsRes);

      setDepartmentData(deptRes);

      setSemesterData(semesterRes);

      setAttendanceData(attendanceRes);

      setResultData(resultRes);

      setDepartmentPerformance(
        departmentPerformanceRes
      );

      setTopStudents(
        topStudentsRes
      );

      setMonthlyAttendance(
        monthlyAttendanceRes
      );

      setCoursePerformance(
        coursePerformanceRes
      );

      setTeacherPerformance(
        teacherPerformanceRes
      );

      setDepartmentPassRate(
        departmentPassRateRes
      );

      setPerformanceTrend(
        performanceTrendRes
      );

      setAtRiskStudents(
        atRiskStudentsRes
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center px-4 text-center">
        <div className="text-sm sm:text-base">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  const attendanceChart = semesterData.map(
    (item) => ({
      label: `Sem ${item.semester}`,
      value: item.count,
    })
  );

  const departmentChart = departmentData.map(
    (item) => ({
      label: item.department,
      value: item.count,
    })
  );

  const resultChart = Object.keys(resultData).map(
    (key) => ({
      label: key,
      value: resultData[key],
    })
  );

  const departmentPerformanceChart =
    departmentPerformance.map((item) => ({
      label: item.department,
      value: item.average_cgpa,
    }));

  const monthlyAttendanceChart =
    monthlyAttendance.map((item) => ({
      label: item.month,
      value: item.count,
    }));

  const departmentPassRateChart =
    departmentPassRate.map((item) => ({
      label: item.department,
      value: item.pass_rate,
    }));

  const coursePerformanceChart =
    coursePerformance.map((item) => ({
      label: item.course_id,
      value: item.average_marks,
    }));

  const performanceTrendChart =
    performanceTrend.map((item) => ({
      label: `Sem ${item.semester}`,
      value: item.average_percentage,
    }));

  const topStudentsColumns = [
    {
      key: "name",
      label: "Student Name",
    },
    {
      key: "department",
      label: "Department",
    },
    {
      key: "semester",
      label: "Semester",
    },
    {
      key: "cgpa",
      label: "CGPA",
    },
    {
      key: "attendance",
      label: "Attendance",
      render: (row) => `${row.attendance}%`,
    },
  ];

  const teacherColumns = [
    {
      key: "teacher_name",
      label: "Teacher",
    },
    {
      key: "department",
      label: "Department",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={
            row.status === "Active"
              ? "font-semibold text-green-600"
              : "font-semibold text-red-600"
          }
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "total_courses",
      label: "Courses",
    },
  ];

  const riskColumns = [
    {
      key: "name",
      label: "Student",
    },
    {
      key: "department",
      label: "Department",
    },
    {
      key: "cgpa",
      label: "CGPA",
    },
    {
      key: "attendance",
      label: "Attendance",
      render: (row) => (
        <span className="font-semibold text-red-600">
          {row.attendance}%
        </span>
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-4 overflow-x-hidden sm:space-y-5 lg:space-y-6">

      {/* ========================================== */}
      {/* Dashboard Statistics */}
      {/* ========================================== */}

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        <div className="min-w-0">
          <StatCard
            label="Students"
            value={stats.total_students || 0}
            icon="🎓"
          />
        </div>

        <div className="min-w-0">
          <StatCard
            label="Teachers"
            value={stats.total_teachers || 0}
            icon="👨‍🏫"
          />
        </div>

        <div className="min-w-0">
          <StatCard
            label="Courses"
            value={stats.total_courses || 0}
            icon="📚"
          />
        </div>

        <div className="min-w-0">
          <StatCard
            label="Attendance"
            value={`${dashboard.average_attendance || 0}%`}
            icon="📅"
            tone="good"
          />
        </div>

        <div className="min-w-0">
          <StatCard
            label="Average CGPA"
            value={dashboard.average_cgpa || 0}
            icon="📈"
          />
        </div>

        <div className="min-w-0">
          <StatCard
            label="Active Students"
            value={stats.active_students || 0}
            icon="🟢"
            tone="good"
          />
        </div>

        <div className="min-w-0">
          <StatCard
            label="Inactive Students"
            value={stats.inactive_students || 0}
            icon="🔴"
            tone="warn"
          />
        </div>

        <div className="min-w-0">
          <StatCard
            label="Results"
            value={stats.total_results || 0}
            icon="📝"
          />
        </div>
      </div>

      {/* ========================================== */}
      {/* Students Analytics */}
      {/* ========================================== */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6 xl:gap-7">

        <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
          <h3 className="mb-3 text-sm font-semibold sm:text-base">
            Students by Department
          </h3>

          <div className="h-[260px] w-full sm:h-[300px] lg:h-[340px]">
            <BarChart
              title="Students by Department"
              data={departmentChart}
              color="#3fb8a8"
            />
          </div>
        </div>

        <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
          <h3 className="mb-3 text-sm font-semibold sm:text-base">
            Students by Semester
          </h3>

          <div className="h-[260px] w-full sm:h-[300px] lg:h-[340px]">
            <LineAreaChart
              title="Students by Semester"
              data={attendanceChart}
              color="#2460eb"
            />
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* Results & Attendance */}
      {/* ========================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">

        <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
          <h3 className="mb-3 text-sm font-semibold sm:text-base">
            Result Summary
          </h3>

          <div className="h-[260px] w-full sm:h-[300px] lg:h-[340px]">
            <BarChart
              title="Result Summary"
              data={gradeChart}
              color="#24ebe4"
            />
          </div>
        </div>

        <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
          <h3 className="mb-3 text-sm font-semibold sm:text-base">
            Pass vs Fail
          </h3>

          <div className="h-[260px] w-full sm:h-[300px] lg:h-[340px]">
            <DonutChart
              title="Pass vs Fail"
              data={passFailChart}
            />
          </div>
        </div>

        <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
          <h3 className="mb-3 text-sm font-semibold sm:text-base">
            Attendance Summary
          </h3>

          <div className="h-[260px] w-full sm:h-[300px] lg:h-[340px]">
            <DonutChart
              title="Attendance Summary"
              data={attendanceData.map(
                (item) => ({
                  label: item.status,
                  value: item.count,
                  color:
                    item.status === "Present"
                      ? "#10b981"
                      : item.status === "Absent"
                      ? "#ef4444"
                      : "#f59e0b",
                })
              )}
            />
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* Advanced Analytics */}
      {/* ========================================== */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">

        <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
          <h3 className="mb-3 text-sm font-semibold sm:text-base">
            Department Performance (Average CGPA)
          </h3>

          <div className="h-[260px] w-full sm:h-[300px] lg:h-[340px]">
            <BarChart
              title="Department Performance (Average CGPA)"
              data={departmentPerformanceChart}
              color="#7c3aed"
            />
          </div>
        </div>

        <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
          <h3 className="mb-3 text-sm font-semibold sm:text-base">
            Department Pass Rate
          </h3>

          <div className="h-[260px] w-full sm:h-[300px] lg:h-[340px]">
            <BarChart
              title="Department Pass Rate"
              data={departmentPassRateChart}
            />
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* Trends */}
      {/* ========================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">

        <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
          <h3 className="mb-3 text-sm font-semibold sm:text-base">
            Monthly Attendance Trend
          </h3>

          <div className="h-[260px] w-full sm:h-[300px] lg:h-[340px]">
            <LineAreaChart
              title="Monthly Attendance Trend"
              data={monthlyAttendanceChart}
              color="#2563eb"
            />
          </div>
        </div>

        <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
          <h3 className="mb-3 text-sm font-semibold sm:text-base">
            Performance Trend
          </h3>

          <div className="h-[260px] w-full sm:h-[300px] lg:h-[340px]">
            <LineAreaChart
              title="Performance Trend"
              data={performanceTrendChart}
              color="#f97316"
              suffix="%"
            />
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* Course Performance */}
      {/* ========================================== */}

      <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
        <h3 className="mb-3 text-sm font-semibold sm:text-base">
          Course Performance
        </h3>

        <div className="h-[280px] w-full sm:h-[320px] lg:h-[380px]">
          <BarChart
            title="Course Performance"
            data={coursePerformanceChart}
            color="#06b6d4"
          />
        </div>
      </div>

      {/* ========================================== */}
      {/* Top Students */}
      {/* ========================================== */}

      <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
        <h3 className="mb-4 text-base font-semibold sm:text-lg">
          🏆 Top Students
        </h3>

        <div className="w-full overflow-x-auto">
          <DataTable
            columns={topStudentsColumns}
            rows={topStudents}
            searchKeys={[
              "student_id",
              "name",
              "department",
            ]}
            filters={[]}
          />
        </div>
      </div>

      {/* ========================================== */}
      {/* Top Teachers */}
      {/* ========================================== */}

      <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
        <h3 className="mb-4 text-base font-semibold sm:text-lg">
          👨‍🏫 Top Teachers
        </h3>

        <div className="w-full overflow-x-auto">
          <DataTable
            columns={teacherColumns}
            rows={teacherPerformance}
            searchKeys={[
              "teacher_id",
              "teacher_name",
              "department",
            ]}
            filters={[]}
          />
        </div>
      </div>

      {/* ========================================== */}
      {/* At Risk Students */}
      {/* ========================================== */}

      <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
        <h3 className="mb-4 text-base font-semibold sm:text-lg">
          ⚠️ At Risk Students
        </h3>

        <div className="w-full overflow-x-auto">
          <DataTable
            columns={riskColumns}
            rows={atRiskStudents}
            searchKeys={[
              "student_id",
              "name",
              "department",
            ]}
            filters={[]}
          />
        </div>
      </div>

      {/* ========================================== */}
      {/* High Risk & Dashboard Information */}
      {/* ========================================== */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">

        <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
          <h3 className="mb-3 text-base font-semibold sm:text-lg">
            High Risk Students
          </h3>

          <div className="space-y-3">
            {dashboard.high_risk_students?.length ? (
              dashboard.high_risk_students.map(
                (student) => (
                  <div
                    key={student.id}
                    className="flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium sm:text-base">
                        {student.name}
                      </p>

                      <p className="text-xs text-slate-500 sm:text-sm">
                        {student.department}
                      </p>
                    </div>

                    <div className="flex gap-4 text-sm sm:block sm:text-right">
                      <p>
                        CGPA: {student.cgpa}
                      </p>

                      <p>
                        Attendance: {student.attendance}%
                      </p>
                    </div>
                  </div>
                )
              )
            ) : (
              <p className="text-sm text-slate-500">
                No high risk students found.
              </p>
            )}
          </div>
        </div>

        <div className="card min-w-0 overflow-hidden p-3 sm:p-4 md:p-5">
          <h3 className="mb-3 text-base font-semibold sm:text-lg">
            Dashboard Information
          </h3>

          <div className="space-y-3 text-sm sm:text-base">

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600">
                Active Teachers
              </span>

              <strong>
                {stats.active_teachers || 0}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600">
                Inactive Teachers
              </span>

              <strong>
                {stats.inactive_teachers || 0}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600">
                Total Attendance Records
              </span>

              <strong>
                {stats.total_attendance || 0}
              </strong>
            </div>

            <div className="flex flex-col gap-1 border-t pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="text-slate-600">
                Last Updated
              </span>

              <strong className="break-all text-xs sm:text-right sm:text-sm">
                {dashboard.last_updated
                  ? new Date(
                      dashboard.last_updated
                    ).toLocaleString()
                  : "-"}
              </strong>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}