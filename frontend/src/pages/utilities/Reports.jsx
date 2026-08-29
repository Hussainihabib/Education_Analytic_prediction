import { useState } from "react";
import { useData } from "../../context/DataContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { downloadReport } from "../../api/reportsApi.js";
import { apiErrorMessage } from "../../utils/validation";

const REPORTS = [
  { id: 1, name: "Student Performance Summary", desc: "GPA, attendance, marks and result information within your permitted scope." },
  { id: 2, name: "Dropout Risk Report", desc: "Dropout-risk predictions for students you are authorized to view." },
  { id: 3, name: "Department Analytics", desc: "Enrollment, courses and staffing within your permitted scope." },
  { id: 4, name: "Teacher Performance Report", desc: "Teacher activity and classroom records within your permitted scope." },
  { id: 5, name: "Attendance Compliance Report", desc: "Attendance records limited by your role and ownership scope." },
  { id: 6, name: "ML Model Accuracy Report", desc: "Current ML model status, accuracy and training information." },
];

const FORMATS = ["PDF", "CSV"];

export default function Reports() {
  const { showToast } = useData();
  const { user } = useAuth();
  const [generating, setGenerating] = useState(null);

  const download = async (report, format) => {
    const key = `${report.id}-${format}`;
    setGenerating(key);

    try {
      await downloadReport(report.id, format);
      showToast(`${report.name} downloaded as ${format}.`);
    } catch (err) {
      showToast(apiErrorMessage(err, "Unable to download report."));
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h2 className="text-xl font-semibold">Reports Generator</h2>
        <p className="text-sm text-slate-500 mt-2">
          Download real reports from MongoDB in PDF or CSV format.
          Access is enforced by the backend using your authenticated role.
        </p>
        <div className="text-xs text-slate-400 mt-2">
          Logged in as: {user?.name || user?.email || "User"} · Role: {user?.role || "Unknown"}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {REPORTS.map((report) => (
          <div key={report.id} className="card p-5">
            <h3 className="font-semibold">{report.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{report.desc}</p>

            <div className="flex gap-2 mt-4 flex-wrap">
              {FORMATS.map((format) => {
                const key = `${report.id}-${format}`;
                const active = generating === key;

                return (
                  <button
                    key={format}
                    onClick={() => download(report, format)}
                    disabled={Boolean(generating)}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    {active ? "Preparing…" : `⬇ ${format}`}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
