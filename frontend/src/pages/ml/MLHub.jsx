// import { useEffect, useState } from "react";
// import { apiErrorMessage } from "../../utils/validation";
// import {
//   getMLStatus,
//   predictStudentFromDatabase,
//   predictStudent,
//   retrainMLModels,
// } from "../../api/mlApi";

// const TABS = [
//   "Student Performance",
//   "Dropout Prediction",
//   "Course Demand",
//   "Anomaly Detection",
// ];

// const initialForm = {
//   attendance: "",
//   cgpa: "",
//   avg_marks_percentage: "",
//   failed_results: 0,
//   result_count: 0,
//   semester: 1,
//   department: "",
// };

// export default function MLHub() {
//   const [tab, setTab] = useState(TABS[0]);
//   const [studentId, setStudentId] = useState("");
//   const [form, setForm] = useState(initialForm);
//   const [prediction, setPrediction] = useState(null);
//   const [status, setStatus] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [training, setTraining] = useState(false);
//   const [error, setError] = useState("");

//   const role = (() => {
//     try {
//       const raw = localStorage.getItem("user");
//       return raw ? JSON.parse(raw)?.role : "";
//     } catch {
//       return "";
//     }
//   })();

//   const loadStatus = async () => {
//     try {
//       setStatus(await getMLStatus());
//     } catch (err) {
//       setError(apiErrorMessage(err, "Unable to load ML status."));
//     }
//   };

//   useEffect(() => {
//     loadStatus();
//   }, []);

//   const handleChange = (e) => {
//     setForm((old) => ({ ...old, [e.target.name]: e.target.value }));
//   };

//   const handleDatabasePrediction = async () => {
//     if (!studentId.trim()) {
//       setError("Enter a Student ID first.");
//       return;
//     }
//     try {
//       setLoading(true);
//       setError("");
//       setPrediction(await predictStudentFromDatabase(studentId.trim()));
//     } catch (err) {
//       setError(apiErrorMessage(err, "Prediction failed."));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleManualPrediction = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       setPrediction(await predictStudent({
//         attendance: Number(form.attendance),
//         cgpa: Number(form.cgpa),
//         avg_marks_percentage: Number(form.avg_marks_percentage),
//         failed_results: Number(form.failed_results),
//         result_count: Number(form.result_count),
//         semester: Number(form.semester),
//         department: form.department.trim(),
//       }));
//     } catch (err) {
//       setError(apiErrorMessage(err, "Prediction failed."));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRetrain = async () => {
//     try {
//       setTraining(true);
//       setError("");
//       const result = await retrainMLModels();
//       setStatus(result);
//     } catch (err) {
//       setError(apiErrorMessage(err, "Model retraining failed."));
//     } finally {
//       setTraining(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="grid md:grid-cols-4 gap-4">
//         {(status?.models || []).map((m) => (
//           <div key={m.model} className="card p-4">
//             <div className="eyebrow mb-1">ML MODEL</div>
//             <div className="font-semibold text-sm capitalize">{m.model.replaceAll("_", " ")}</div>
//             <div className="flex items-end justify-between mt-3">
//               <span className="text-2xl font-bold">{m.accuracy ?? m.anomalies ?? "—"}{m.accuracy != null ? "%" : ""}</span>
//               <span className="text-xs text-teal-accent">MongoDB</span>
//             </div>
//             <div className="text-xs text-slate-400 mt-1">{m.records ?? 0} records · {m.trained_at ? new Date(m.trained_at).toLocaleString() : "Not trained"}</div>
//           </div>
//         ))}
//       </div>

//       <div className="flex items-center justify-between gap-3 flex-wrap">
//         <div className="flex gap-2 flex-wrap">
//           {TABS.map((t) => (
//             <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-navy-900 text-cream-100" : "bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 text-slate-500"}`}>
//               {t}
//             </button>
//           ))}
//         </div>
//         {role === "Admin" && (
//           <button onClick={handleRetrain} disabled={training} className="btn-primary">
//             {training ? "Retraining..." : "Retrain From Database"}
//           </button>
//         )}
//       </div>

//       {error && <div className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}

//       {tab === "Student Performance" && (
//         <div className="card p-6 space-y-6">
//           <div>
//             <h2 className="text-xl font-semibold">Student Performance Prediction</h2>
//             <p className="text-sm text-slate-500 mt-1">Use the current MongoDB student/results records or enter features manually.</p>
//           </div>

//           <div className="grid md:grid-cols-[1fr_auto] gap-3">
//             <input className="input" placeholder="Student ID e.g. S001220" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
//             <button className="btn-primary" onClick={handleDatabasePrediction} disabled={loading}>{loading ? "Predicting..." : "Predict From Database"}</button>
//           </div>

//           <div className="border-t pt-5">
//             <h3 className="font-semibold mb-4">Manual Prediction</h3>
//             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
//               <input type="number" name="attendance" placeholder="Attendance %" value={form.attendance} onChange={handleChange} className="input" />
//               <input type="number" step="0.01" name="cgpa" placeholder="CGPA" value={form.cgpa} onChange={handleChange} className="input" />
//               <input type="number" name="avg_marks_percentage" placeholder="Average Marks %" value={form.avg_marks_percentage} onChange={handleChange} className="input" />
//               <input type="number" name="failed_results" placeholder="Failed Results" value={form.failed_results} onChange={handleChange} className="input" />
//               <input type="number" name="result_count" placeholder="Result Count" value={form.result_count} onChange={handleChange} className="input" />
//               <input type="number" name="semester" min="1" max="8" placeholder="Semester" value={form.semester} onChange={handleChange} className="input" />
//               <input type="text" name="department" placeholder="Department" value={form.department} onChange={handleChange} className="input lg:col-span-2" />
//             </div>
//             <button onClick={handleManualPrediction} disabled={loading} className="mt-5 bg-navy-900 text-white px-6 py-3 rounded-lg hover:bg-navy-700 transition">
//               {loading ? "Predicting..." : "Predict Manually"}
//             </button>
//           </div>

//           {prediction && (
//             <div className="border rounded-xl p-5 bg-green-50 dark:bg-green-900/20">
//               <h3 className="font-semibold text-lg">Prediction Result</h3>
//               <div className="mt-2 text-2xl font-bold text-green-600">{prediction.prediction}</div>
//               {prediction.confidence != null && <div className="text-sm text-slate-500 mt-1">Confidence: {prediction.confidence}%</div>}
//               {prediction.student_id && <div className="text-xs text-slate-400 mt-1">Student: {prediction.student_id} · Source: {prediction.source || "API"}</div>}
//             </div>
//           )}
//         </div>
//       )}

//       {tab !== "Student Performance" && (
//         <div className="card p-6">
//           <h2 className="text-xl font-semibold">{tab}</h2>
//           <p className="text-sm text-slate-500 mt-2">
//             This model is trained from the current MongoDB records when an Admin runs <strong>Retrain From Database</strong>.
//           </p>
//           <p className="text-xs text-slate-400 mt-3">The backend endpoints for dropout, course demand and anomaly analysis are included in the ML package.</p>
//         </div>
//       )}
//     </div>
//   );
// }





// import { useEffect, useState } from "react";
// import { apiErrorMessage } from "../../utils/validation";

// import {
//   getMLStatus,
//   predictStudentFromDatabase,
//   predictStudent,
//   retrainMLModels,
//   getAnomalyResults,
//   getCorrelation,
//   getTrend,
// } from "../../api/mlApi";

// const TABS = [
//   "Student Performance",
//   "Dropout Prediction",
//   "Course Demand",
//   "Anomaly Detection",
//   "Correlation",
//   "Trend",
// ];

// const initialForm = {
//   attendance: "",
//   cgpa: "",
//   avg_marks_percentage: "",
//   failed_results: 0,
//   result_count: 0,
//   semester: 1,
//   department: "",
// };

// export default function MLHub() {
//   const [tab, setTab] = useState(TABS[0]);

//   const [studentId, setStudentId] = useState("");
//   const [form, setForm] = useState(initialForm);

//   const [prediction, setPrediction] = useState(null);
//   const [status, setStatus] = useState(null);

//   const [anomalies, setAnomalies] = useState([]);
//   const [correlation, setCorrelation] = useState([]);
//   const [trend, setTrend] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [loadingAnomaly, setLoadingAnomaly] = useState(false);
//   const [loadingCorrelation, setLoadingCorrelation] = useState(false);
//   const [loadingTrend, setLoadingTrend] = useState(false);

//   const [training, setTraining] = useState(false);
//   const [error, setError] = useState("");

//   // ==========================================
//   // CURRENT USER ROLE
//   // ==========================================

//   const role = (() => {
//     try {
//       const raw = localStorage.getItem("user");
//       return raw ? JSON.parse(raw)?.role : "";
//     } catch {
//       return "";
//     }
//   })();

//   // ==========================================
//   // LOAD ML STATUS
//   // ==========================================

//   const loadStatus = async () => {
//     try {
//       const data = await getMLStatus();
//       setStatus(data);
//     } catch (err) {
//       setError(
//         apiErrorMessage(err, "Unable to load ML status.")
//       );
//     }
//   };

//   // ==========================================
//   // LOAD ANOMALIES
//   // ==========================================

//   const loadAnomalies = async () => {
//     try {
//       setLoadingAnomaly(true);
//       setError("");

//       const data = await getAnomalyResults();

//       setAnomalies(
//         Array.isArray(data)
//           ? data
//           : Array.isArray(data?.anomalies)
//           ? data.anomalies
//           : []
//       );
//     } catch (err) {
//       setError(
//         apiErrorMessage(
//           err,
//           "Unable to load anomaly results."
//         )
//       );
//     } finally {
//       setLoadingAnomaly(false);
//     }
//   };

//   // ==========================================
//   // LOAD CORRELATION
//   // ==========================================

//   const loadCorrelation = async () => {
//     try {
//       setLoadingCorrelation(true);
//       setError("");

//       const data = await getCorrelation();

//       setCorrelation(
//         Array.isArray(data)
//           ? data
//           : Array.isArray(data?.correlation)
//           ? data.correlation
//           : []
//       );
//     } catch (err) {
//       setError(
//         apiErrorMessage(
//           err,
//           "Unable to load correlation data."
//         )
//       );
//     } finally {
//       setLoadingCorrelation(false);
//     }
//   };

//   // ==========================================
//   // LOAD TREND
//   // ==========================================

//   const loadTrend = async () => {
//     try {
//       setLoadingTrend(true);
//       setError("");

//       const data = await getTrend();

//       setTrend(
//         Array.isArray(data)
//           ? data
//           : Array.isArray(data?.trend)
//           ? data.trend
//           : []
//       );
//     } catch (err) {
//       setError(
//         apiErrorMessage(
//           err,
//           "Unable to load trend data."
//         )
//       );
//     } finally {
//       setLoadingTrend(false);
//     }
//   };

//   // ==========================================
//   // INITIAL LOAD
//   // ==========================================

//   useEffect(() => {
//     loadStatus();
//   }, []);

//   // ==========================================
//   // LOAD DATA WHEN TAB CHANGES
//   // ==========================================

//   useEffect(() => {
//     if (tab === "Anomaly Detection") {
//       loadAnomalies();
//     }

//     if (tab === "Correlation") {
//       loadCorrelation();
//     }

//     if (tab === "Trend") {
//       loadTrend();
//     }
//   }, [tab]);

//   // ==========================================
//   // FORM CHANGE
//   // ==========================================

//   const handleChange = (e) => {
//     setForm((old) => ({
//       ...old,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   // ==========================================
//   // DATABASE STUDENT PERFORMANCE
//   // ==========================================

//   const handleDatabasePrediction = async () => {
//     if (!studentId.trim()) {
//       setError("Enter a Student ID first.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");
//       setPrediction(null);

//       const result = await predictStudentFromDatabase(
//         studentId.trim()
//       );

//       setPrediction(result);
//     } catch (err) {
//       setError(
//         apiErrorMessage(err, "Prediction failed.")
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================================
//   // MANUAL STUDENT PERFORMANCE
//   // ==========================================

//   const handleManualPrediction = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       setPrediction(null);

//       const result = await predictStudent({
//         attendance: Number(form.attendance),
//         cgpa: Number(form.cgpa),
//         avg_marks_percentage: Number(
//           form.avg_marks_percentage
//         ),
//         failed_results: Number(form.failed_results),
//         result_count: Number(form.result_count),
//         semester: Number(form.semester),
//         department: form.department.trim(),
//       });

//       setPrediction(result);
//     } catch (err) {
//       setError(
//         apiErrorMessage(err, "Prediction failed.")
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================================
//   // RETRAIN
//   // ==========================================

//   const handleRetrain = async () => {
//     try {
//       setTraining(true);
//       setError("");

//       const result = await retrainMLModels();

//       setStatus(result);

//       // Refresh currently displayed analytics
//       if (tab === "Anomaly Detection") {
//         await loadAnomalies();
//       }

//       if (tab === "Correlation") {
//         await loadCorrelation();
//       }

//       if (tab === "Trend") {
//         await loadTrend();
//       }
//     } catch (err) {
//       setError(
//         apiErrorMessage(
//           err,
//           "Model retraining failed."
//         )
//       );
//     } finally {
//       setTraining(false);
//     }
//   };

//   // ==========================================
//   // RENDER
//   // ==========================================

//   return (
//     <div className="space-y-6">

//       {/* =====================================
//           ML STATUS CARDS
//       ====================================== */}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {(status?.models || []).map((m) => (
//           <div
//             key={m.model}
//             className="card p-5"
//           >
//             <div className="text-xs text-slate-400 uppercase tracking-wide">
//               ML MODEL
//             </div>

//             <div className="text-lg font-semibold mt-1">
//               {m.model.replaceAll("_", " ")}
//             </div>

//             <div className="text-2xl font-bold mt-2">
//               {m.accuracy ?? m.anomalies ?? "—"}
//               {m.accuracy != null ? "%" : ""}
//             </div>

//             <div className="text-xs text-slate-500 mt-2">
//               MongoDB
//             </div>

//             <div className="text-xs text-slate-400 mt-1">
//               {m.records ?? 0} records ·{" "}
//               {m.trained_at
//                 ? new Date(
//                     m.trained_at
//                   ).toLocaleString()
//                 : "Not trained"}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* =====================================
//           TABS + RETRAIN
//       ====================================== */}

//       <div className="flex items-center justify-between gap-3 flex-wrap">

//         <div className="flex gap-2 flex-wrap">
//           {TABS.map((t) => (
//             <button
//               key={t}
//               onClick={() => {
//                 setTab(t);
//                 setError("");
//               }}
//               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                 tab === t
//                   ? "bg-navy-900 text-cream-100"
//                   : "bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 text-slate-500"
//               }`}
//             >
//               {t}
//             </button>
//           ))}
//         </div>

//         {role === "Admin" && (
//           <button
//             onClick={handleRetrain}
//             disabled={training}
//             className="btn-primary"
//           >
//             {training
//               ? "Retraining..."
//               : "Retrain From Database"}
//           </button>
//         )}
//       </div>

//       {/* =====================================
//           ERROR
//       ====================================== */}

//       {error && (
//         <div className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">
//           {error}
//         </div>
//       )}

//       {/* =====================================
//           STUDENT PERFORMANCE
//       ====================================== */}

//       {tab === "Student Performance" && (
//         <div className="card p-6 space-y-6">

//           <div>
//             <h2 className="text-xl font-semibold">
//               Student Performance Prediction
//             </h2>

//             <p className="text-sm text-slate-500 mt-1">
//               Use current MongoDB student/results records
//               or enter features manually.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-[1fr_auto] gap-3">

//             <input
//               className="input"
//               placeholder="Student ID e.g. S000001"
//               value={studentId}
//               onChange={(e) =>
//                 setStudentId(e.target.value)
//               }
//             />

//             <button
//               className="btn-primary"
//               onClick={handleDatabasePrediction}
//               disabled={loading}
//             >
//               {loading
//                 ? "Predicting..."
//                 : "Predict From Database"}
//             </button>

//           </div>

//           <div className="border-t pt-5">

//             <h3 className="font-semibold mb-4">
//               Manual Prediction
//             </h3>

//             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

//               <input
//                 type="number"
//                 name="attendance"
//                 placeholder="Attendance %"
//                 value={form.attendance}
//                 onChange={handleChange}
//                 className="input"
//               />

//               <input
//                 type="number"
//                 step="0.01"
//                 name="cgpa"
//                 placeholder="CGPA"
//                 value={form.cgpa}
//                 onChange={handleChange}
//                 className="input"
//               />

//               <input
//                 type="number"
//                 name="avg_marks_percentage"
//                 placeholder="Average Marks %"
//                 value={form.avg_marks_percentage}
//                 onChange={handleChange}
//                 className="input"
//               />

//               <input
//                 type="number"
//                 name="failed_results"
//                 placeholder="Failed Results"
//                 value={form.failed_results}
//                 onChange={handleChange}
//                 className="input"
//               />

//               <input
//                 type="number"
//                 name="result_count"
//                 placeholder="Result Count"
//                 value={form.result_count}
//                 onChange={handleChange}
//                 className="input"
//               />

//               <input
//                 type="number"
//                 name="semester"
//                 min="1"
//                 max="8"
//                 placeholder="Semester"
//                 value={form.semester}
//                 onChange={handleChange}
//                 className="input"
//               />

//               <input
//                 type="text"
//                 name="department"
//                 placeholder="Department"
//                 value={form.department}
//                 onChange={handleChange}
//                 className="input lg:col-span-2"
//               />

//             </div>

//             <button
//               onClick={handleManualPrediction}
//               disabled={loading}
//               className="mt-5 bg-navy-900 text-white px-6 py-3 rounded-lg hover:bg-navy-700 transition"
//             >
//               {loading
//                 ? "Predicting..."
//                 : "Predict Manually"}
//             </button>

//           </div>

//           {prediction && (
//             <div className="border rounded-xl p-5 bg-green-50 dark:bg-green-900/20">

//               <h3 className="font-semibold text-lg">
//                 Prediction Result
//               </h3>

//               <div className="mt-2 text-2xl font-bold text-green-600">
//                 {prediction.prediction}
//               </div>

//               {prediction.confidence != null && (
//                 <div className="text-sm text-slate-500 mt-1">
//                   Confidence:{" "}
//                   {prediction.confidence}%
//                 </div>
//               )}

//               {prediction.student_id && (
//                 <div className="text-xs text-slate-400 mt-1">
//                   Student:{" "}
//                   {prediction.student_id} · Source:{" "}
//                   {prediction.source || "API"}
//                 </div>
//               )}

//             </div>
//           )}

//         </div>
//       )}

//       {/* =====================================
//           DROPOUT
//       ====================================== */}

//       {tab === "Dropout Prediction" && (
//         <div className="card p-6">

//           <h2 className="text-xl font-semibold">
//             Dropout Prediction
//           </h2>

//           <p className="text-sm text-slate-500 mt-2">
//             This model is trained from the current
//             MongoDB records when an Admin runs{" "}
//             <strong>Retrain From Database</strong>.
//           </p>

//           <p className="text-xs text-slate-400 mt-3">
//             Use the backend dropout prediction endpoint
//             to evaluate a student's dropout risk.
//           </p>

//         </div>
//       )}

//       {/* =====================================
//           COURSE DEMAND
//       ====================================== */}

//       {tab === "Course Demand" && (
//         <div className="card p-6">

//           <h2 className="text-xl font-semibold">
//             Course Demand
//           </h2>

//           <p className="text-sm text-slate-500 mt-2">
//             Course demand is predicted using current
//             MongoDB course information.
//           </p>

//           <p className="text-xs text-slate-400 mt-3">
//             Use the course-demand prediction endpoint
//             for individual course predictions.
//           </p>

//         </div>
//       )}

//       {/* =====================================
//           ANOMALY DETECTION
//       ====================================== */}

//       {tab === "Anomaly Detection" && (
//         <div className="card p-6">

//           <div className="flex items-center justify-between gap-3 mb-5">

//             <div>
//               <h2 className="text-xl font-semibold">
//                 Anomaly Detection
//               </h2>

//               <p className="text-sm text-slate-500 mt-1">
//                 Students whose academic patterns differ
//                 significantly from the normal dataset.
//               </p>
//             </div>

//             <button
//               onClick={loadAnomalies}
//               disabled={loadingAnomaly}
//               className="btn-primary"
//             >
//               {loadingAnomaly
//                 ? "Loading..."
//                 : "Refresh"}
//             </button>

//           </div>

//           <div className="mb-5">
//             <div className="text-sm text-slate-500">
//               Detected anomalies
//             </div>

//             <div className="text-3xl font-bold">
//               {loadingAnomaly
//                 ? "..."
//                 : anomalies.length}
//             </div>
//           </div>

//           {!loadingAnomaly &&
//             anomalies.length === 0 && (
//               <div className="text-sm text-slate-500">
//                 No anomalies found.
//               </div>
//             )}

//           {anomalies.length > 0 && (
//             <div className="overflow-x-auto">

//               <table className="w-full text-sm">

//                 <thead>
//                   <tr className="border-b text-left">

//                     <th className="p-3">
//                       Student ID
//                     </th>

//                     <th className="p-3">
//                       Attendance
//                     </th>

//                     <th className="p-3">
//                       CGPA
//                     </th>

//                     <th className="p-3">
//                       Avg Marks
//                     </th>

//                     <th className="p-3">
//                       Failed Results
//                     </th>

//                     <th className="p-3">
//                       Anomaly Score
//                     </th>

//                     <th className="p-3">
//                       Status
//                     </th>

//                   </tr>
//                 </thead>

//                 <tbody>

//                   {anomalies.map((item) => (
//                     <tr
//                       key={item.student_id}
//                       className="border-b"
//                     >

//                       <td className="p-3 font-medium">
//                         {item.student_id}
//                       </td>

//                       <td className="p-3">
//                         {item.attendance}%
//                       </td>

//                       <td className="p-3">
//                         {item.cgpa}
//                       </td>

//                       <td className="p-3">
//                         {item.avg_marks_percentage}%
//                       </td>

//                       <td className="p-3">
//                         {item.failed_results}
//                       </td>

//                       <td className="p-3">
//                         {item.anomaly_score}
//                       </td>

//                       <td className="p-3">
//                         <span className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs">
//                           {item.status}
//                         </span>
//                       </td>

//                     </tr>
//                   ))}

//                 </tbody>

//               </table>

//             </div>
//           )}

//         </div>
//       )}

//       {/* =====================================
//           CORRELATION
//       ====================================== */}

//       {tab === "Correlation" && (
//         <div className="card p-6">

//           <div className="flex items-center justify-between gap-3 mb-5">

//             <div>
//               <h2 className="text-xl font-semibold">
//                 Student Data Correlation
//               </h2>

//               <p className="text-sm text-slate-500 mt-1">
//                 Correlation between academic and
//                 attendance features.
//               </p>
//             </div>

//             <button
//               onClick={loadCorrelation}
//               disabled={loadingCorrelation}
//               className="btn-primary"
//             >
//               {loadingCorrelation
//                 ? "Loading..."
//                 : "Refresh"}
//             </button>

//           </div>

//           {loadingCorrelation ? (
//             <div className="text-sm text-slate-500">
//               Loading correlation data...
//             </div>
//           ) : correlation.length === 0 ? (
//             <div className="text-sm text-slate-500">
//               No correlation data available.
//             </div>
//           ) : (
//             <div className="overflow-x-auto">

//               <table className="w-full text-sm">

//                 <thead>
//                   <tr className="border-b text-left">

//                     <th className="p-3">
//                       Feature
//                     </th>

//                     <th className="p-3">
//                       Attendance
//                     </th>

//                     <th className="p-3">
//                       CGPA
//                     </th>

//                     <th className="p-3">
//                       Avg Marks
//                     </th>

//                     <th className="p-3">
//                       Failed Results
//                     </th>

//                     <th className="p-3">
//                       Result Count
//                     </th>

//                     <th className="p-3">
//                       Semester
//                     </th>

//                   </tr>
//                 </thead>

//                 <tbody>

//                   {correlation.map((row) => (
//                     <tr
//                       key={row.feature}
//                       className="border-b"
//                     >

//                       <td className="p-3 font-medium">
//                         {row.feature}
//                       </td>

//                       <td className="p-3">
//                         {row.attendance}
//                       </td>

//                       <td className="p-3">
//                         {row.cgpa}
//                       </td>

//                       <td className="p-3">
//                         {row.avg_marks_percentage}
//                       </td>

//                       <td className="p-3">
//                         {row.failed_results}
//                       </td>

//                       <td className="p-3">
//                         {row.result_count}
//                       </td>

//                       <td className="p-3">
//                         {row.semester}
//                       </td>

//                     </tr>
//                   ))}

//                 </tbody>

//               </table>

//             </div>
//           )}

//         </div>
//       )}

//       {/* =====================================
//           TREND
//       ====================================== */}

//       {tab === "Trend" && (
//         <div className="card p-6">

//           <div className="flex items-center justify-between gap-3 mb-5">

//             <div>
//               <h2 className="text-xl font-semibold">
//                 Semester Trend
//               </h2>

//               <p className="text-sm text-slate-500 mt-1">
//                 Average CGPA, attendance and marks
//                 across semesters.
//               </p>
//             </div>

//             <button
//               onClick={loadTrend}
//               disabled={loadingTrend}
//               className="btn-primary"
//             >
//               {loadingTrend
//                 ? "Loading..."
//                 : "Refresh"}
//             </button>

//           </div>

//           {loadingTrend ? (
//             <div className="text-sm text-slate-500">
//               Loading trend data...
//             </div>
//           ) : trend.length === 0 ? (
//             <div className="text-sm text-slate-500">
//               No trend data available.
//             </div>
//           ) : (
//             <div className="overflow-x-auto">

//               <table className="w-full text-sm">

//                 <thead>
//                   <tr className="border-b text-left">

//                     <th className="p-3">
//                       Semester
//                     </th>

//                     <th className="p-3">
//                       Average CGPA
//                     </th>

//                     <th className="p-3">
//                       Average Attendance
//                     </th>

//                     <th className="p-3">
//                       Average Marks
//                     </th>

//                     <th className="p-3">
//                       CGPA Status
//                     </th>

//                     <th className="p-3">
//                       Attendance Status
//                     </th>

//                   </tr>
//                 </thead>

//                 <tbody>

//                   {trend.map((row) => (
//                     <tr
//                       key={row.semester}
//                       className="border-b"
//                     >

//                       <td className="p-3 font-medium">
//                         Semester {row.semester}
//                       </td>

//                       <td className="p-3">
//                         {row.average_cgpa}
//                       </td>

//                       <td className="p-3">
//                         {row.average_attendance}%
//                       </td>

//                       <td className="p-3">
//                         {row.average_marks}%
//                       </td>

//                       <td className="p-3">
//                         {row.cgpa_status}
//                       </td>

//                       <td className="p-3">
//                         {row.attendance_status}
//                       </td>

//                     </tr>
//                   ))}

//                 </tbody>

//               </table>

//             </div>
//           )}

//         </div>
//       )}

//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { apiErrorMessage } from "../../utils/validation";

import {
  getMLStatus,
  predictStudentFromDatabase,
  predictStudent,
  predictDropout,
  predictCourseDemand,
  retrainMLModels,
  getAnomalyResults,
  getCorrelation,
  getTrend,
} from "../../api/mlApi";

// =========================================================
// CHART COMPONENTS
// =========================================================

import LineAreaChart from "../../components/charts/LineAreaChart";
import BarChart from "../../components/charts/BarChart";
import DonutChart from "../../components/charts/DonutChart";
import {
  ScatterPlot,
  Heatmap,
} from "../../components/charts/ScatterHeatmap";
// =========================================================
// ROLE BASED ACCESS CONTROL
// =========================================================

const ROLE_TABS = {
  Admin: [
    "Student Performance",
    "Dropout Prediction",
    "Course Demand",
    "Anomaly Detection",
    "Correlation",
    "Trend",
  ],

  Analyst: [
    "Student Performance",
    "Dropout Prediction",
    "Course Demand",
    "Anomaly Detection",
    "Correlation",
    "Trend",
  ],

  Teacher: [
    "Student Performance",
    "Dropout Prediction",
    "Course Demand",
    "Anomaly Detection",
    "Correlation",
    "Trend",
  ],

  Student: [
    "Student Performance",
    "Dropout Prediction",
  ],
};

const ALL_TABS = [
  "Student Performance",
  "Dropout Prediction",
  "Course Demand",
  "Anomaly Detection",
  "Correlation",
  "Trend",
];

// =========================================================
// INITIAL STUDENT FORM
// =========================================================

const initialForm = {
  attendance: "",
  cgpa: "",
  avg_marks_percentage: "",
  failed_results: 0,
  result_count: 0,
  semester: 1,
  department: "",
};

// =========================================================
// INITIAL COURSE FORM
// =========================================================

const initialCourseForm = {
  department: "",
  semester: 1,
  students_enrolled: 0,
  teacher_count: 0,
  previous_demand: 0,
};

// =========================================================
// COMPONENT
// =========================================================

export default function MLHub() {
  // =======================================================
  // TAB
  // =======================================================

  const [tab, setTab] = useState("Student Performance");

  // =======================================================
  // STUDENT
  // =======================================================

  const [studentId, setStudentId] = useState("");
  const [form, setForm] = useState(initialForm);

  // =======================================================
  // COURSE
  // =======================================================

  const [courseForm, setCourseForm] = useState(
    initialCourseForm
  );

  // =======================================================
  // PREDICTIONS
  // =======================================================

  const [prediction, setPrediction] = useState(null);

  const [dropoutPrediction, setDropoutPrediction] =
    useState(null);

  const [coursePrediction, setCoursePrediction] =
    useState(null);

  // =======================================================
  // ML STATUS
  // =======================================================

  const [status, setStatus] = useState(null);

  // =======================================================
  // ANALYTICS
  // =======================================================

  const [anomalies, setAnomalies] = useState([]);
  const [correlation, setCorrelation] = useState([]);
  const [trend, setTrend] = useState([]);

  // =======================================================
  // LOADING
  // =======================================================

  const [loading, setLoading] = useState(false);

  const [loadingDropout, setLoadingDropout] =
    useState(false);

  const [loadingCourse, setLoadingCourse] =
    useState(false);

  const [loadingAnomaly, setLoadingAnomaly] =
    useState(false);

  const [loadingCorrelation, setLoadingCorrelation] =
    useState(false);

  const [loadingTrend, setLoadingTrend] =
    useState(false);

  const [training, setTraining] = useState(false);

  // =======================================================
  // ERROR
  // =======================================================

  const [error, setError] = useState("");

  // =======================================================
  // CURRENT ROLE
  // =======================================================

  const role = (() => {
    try {
      const raw = localStorage.getItem("user");

      if (!raw) return "";

      const parsed = JSON.parse(raw);

      return parsed?.role || "";
    } catch {
      return "";
    }
  })();

  // =======================================================
  // NORMALIZE ROLE
  // =======================================================

  const normalizedRole =
    role.charAt(0).toUpperCase() +
    role.slice(1).toLowerCase();

  // =======================================================
  // ROLE BASED TABS
  // =======================================================

  const allowedTabs =
    ROLE_TABS[normalizedRole] || [];

  // =======================================================
  // INITIAL TAB SAFETY
  // =======================================================

  useEffect(() => {
    if (
      allowedTabs.length > 0 &&
      !allowedTabs.includes(tab)
    ) {
      setTab(allowedTabs[0]);
    }
  }, [normalizedRole]);

  // =======================================================
  // LOAD ML STATUS
  // =======================================================

  const loadStatus = async () => {
    try {
      const data = await getMLStatus();

      setStatus(data);
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          "Unable to load ML status."
        )
      );
    }
  };

  // =======================================================
  // LOAD ANOMALIES
  // =======================================================

  const loadAnomalies = async () => {
    try {
      setLoadingAnomaly(true);
      setError("");

      const data = await getAnomalyResults();

      const result = Array.isArray(data)
        ? data
        : Array.isArray(data?.anomalies)
        ? data.anomalies
        : [];

      setAnomalies(result);
    } catch (err) {
      setAnomalies([]);

      setError(
        apiErrorMessage(
          err,
          "Unable to load anomaly results."
        )
      );
    } finally {
      setLoadingAnomaly(false);
    }
  };

  // =======================================================
  // LOAD CORRELATION
  // =======================================================

  const loadCorrelation = async () => {
    try {
      setLoadingCorrelation(true);
      setError("");

      const data = await getCorrelation();

      const result = Array.isArray(data)
        ? data
        : Array.isArray(data?.correlation)
        ? data.correlation
        : [];

      setCorrelation(result);
    } catch (err) {
      setCorrelation([]);

      setError(
        apiErrorMessage(
          err,
          "Unable to load correlation data."
        )
      );
    } finally {
      setLoadingCorrelation(false);
    }
  };

  // =======================================================
  // LOAD TREND
  // =======================================================

  const loadTrend = async () => {
    try {
      setLoadingTrend(true);
      setError("");

      const data = await getTrend();

      const result = Array.isArray(data)
        ? data
        : Array.isArray(data?.trend)
        ? data.trend
        : [];

      setTrend(result);
    } catch (err) {
      setTrend([]);

      setError(
        apiErrorMessage(
          err,
          "Unable to load trend data."
        )
      );
    } finally {
      setLoadingTrend(false);
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadStatus();
  }, []);

  // =======================================================
  // LOAD DATA WHEN TAB CHANGES
  // =======================================================

  useEffect(() => {
    if (tab === "Anomaly Detection") {
      loadAnomalies();
    }

    if (tab === "Correlation") {
      loadCorrelation();
    }

    if (tab === "Trend") {
      loadTrend();
    }
  }, [tab]);

  // =======================================================
  // STUDENT FORM CHANGE
  // =======================================================

  const handleChange = (e) => {
    setForm((old) => ({
      ...old,
      [e.target.name]: e.target.value,
    }));
  };

  // =======================================================
  // COURSE FORM CHANGE
  // =======================================================

  const handleCourseChange = (e) => {
    setCourseForm((old) => ({
      ...old,
      [e.target.name]: e.target.value,
    }));
  };

  // =======================================================
  // DATABASE STUDENT PERFORMANCE
  // =======================================================

  const handleDatabasePrediction = async () => {
    if (!studentId.trim()) {
      setError("Enter a Student ID first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPrediction(null);

      const result =
        await predictStudentFromDatabase(
          studentId.trim()
        );

      setPrediction(result);
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          "Prediction failed."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // MANUAL STUDENT PERFORMANCE
  // =======================================================

  const handleManualPrediction = async () => {
    if (
      form.attendance === "" ||
      form.cgpa === "" ||
      form.avg_marks_percentage === "" ||
      !form.department.trim()
    ) {
      setError(
        "Please enter attendance, CGPA, average marks and department."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPrediction(null);

      const result = await predictStudent({
        attendance: Number(form.attendance),
        cgpa: Number(form.cgpa),
        avg_marks_percentage: Number(
          form.avg_marks_percentage
        ),
        failed_results: Number(
          form.failed_results
        ),
        result_count: Number(
          form.result_count
        ),
        semester: Number(form.semester),
        department: form.department.trim(),
      });

      setPrediction(result);
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          "Prediction failed."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // DROPOUT PREDICTION
  // =======================================================

  const handleDropoutPrediction = async () => {
    if (
      form.attendance === "" ||
      form.cgpa === "" ||
      form.avg_marks_percentage === "" ||
      !form.department.trim()
    ) {
      setError(
        "Please enter attendance, CGPA, average marks and department."
      );
      return;
    }

    try {
      setLoadingDropout(true);
      setError("");
      setDropoutPrediction(null);

      const result = await predictDropout({
        attendance: Number(form.attendance),
        cgpa: Number(form.cgpa),
        avg_marks_percentage: Number(
          form.avg_marks_percentage
        ),
        failed_results: Number(
          form.failed_results
        ),
        result_count: Number(
          form.result_count
        ),
        semester: Number(form.semester),
        department: form.department.trim(),
      });

      setDropoutPrediction(result);
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          "Dropout prediction failed."
        )
      );
    } finally {
      setLoadingDropout(false);
    }
  };

  // =======================================================
  // COURSE DEMAND PREDICTION
  // =======================================================

  const handleCoursePrediction = async () => {
    if (!courseForm.department.trim()) {
      setError("Please enter department.");
      return;
    }

    try {
      setLoadingCourse(true);
      setError("");
      setCoursePrediction(null);

      const result =
        await predictCourseDemand({
          department:
            courseForm.department.trim(),

          semester: Number(
            courseForm.semester
          ),

          students_enrolled: Number(
            courseForm.students_enrolled
          ),

          teacher_count: Number(
            courseForm.teacher_count
          ),

          previous_demand: Number(
            courseForm.previous_demand
          ),
        });

      setCoursePrediction(result);
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          "Course demand prediction failed."
        )
      );
    } finally {
      setLoadingCourse(false);
    }
  };

  // =======================================================
  // RETRAIN ALL MODELS
  // =======================================================

  const handleRetrain = async () => {
    try {
      setTraining(true);
      setError("");

      const result =
        await retrainMLModels();

      setStatus(result);

      if (tab === "Anomaly Detection") {
        await loadAnomalies();
      }

      if (tab === "Correlation") {
        await loadCorrelation();
      }

      if (tab === "Trend") {
        await loadTrend();
      }
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          "Model retraining failed."
        )
      );
    } finally {
      setTraining(false);
    }
  };

  // =======================================================
  // ACCESS GUARD
  // =======================================================

  if (
    !normalizedRole ||
    allowedTabs.length === 0
  ) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold">
          ML Hub
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          You do not have permission to access
          machine learning features.
        </p>
      </div>
    );
  }

  // =======================================================
  // CHART DATA
  // =======================================================

  // Trend -> Line Chart
  const trendChartData = trend
    .map((row) => ({
      label: `Sem ${row.semester}`,
      value: Number(
        row.average_cgpa ?? 0
      ),
    }))
    .filter((row) => !Number.isNaN(row.value));

  // Trend -> Attendance Bar Chart
  const attendanceTrendData = trend
    .map((row) => ({
      label: `Sem ${row.semester}`,
      value: Number(
        row.average_attendance ?? 0
      ),
    }))
    .filter((row) => !Number.isNaN(row.value));

  // Trend -> Marks Bar Chart
  const marksTrendData = trend
    .map((row) => ({
      label: `Sem ${row.semester}`,
      value: Number(
        row.average_marks ?? 0
      ),
    }))
    .filter((row) => !Number.isNaN(row.value));

  // Correlation -> Bar Chart
  const correlationChartData = correlation
    .map((row) => {
      const values = [
        Number(row.attendance),
        Number(row.cgpa),
        Number(row.avg_marks_percentage),
        Number(row.failed_results),
        Number(row.result_count),
        Number(row.semester),
      ].filter((v) => !Number.isNaN(v));

      const average =
        values.length > 0
          ? values.reduce(
              (sum, value) => sum + value,
              0
            ) / values.length
          : 0;

      return {
        label: row.feature || "Feature",
        value: Number(average.toFixed(2)),
      };
    })
    .filter((row) => row.value !== 0);

  // Anomaly -> Donut
  const normalCount = Math.max(
    0,
    (status?.total_records ??
      anomalies.length) -
      anomalies.length
  );

  const anomalyDonutData = [
    {
      label: "Normal",
      value: normalCount,
      color: "#10b981",
    },
    {
      label: "Anomalies",
      value: anomalies.length,
      color: "#ef4444",
    },
  ];

  // Anomaly -> Scatter
  const scatterData = anomalies
    .map((item) => ({
      cgpa: Number(item.cgpa ?? 0),
      attendance: Number(
        item.attendance ?? 0
      ),
      student_id: item.student_id,
    }))
    .filter(
      (item) =>
        !Number.isNaN(item.cgpa) &&
        !Number.isNaN(item.attendance)
    );

  // Anomaly -> Heatmap
  const heatmapData = anomalies
    .filter(
      (item) =>
        item.department ||
        item.pass_rate != null
    )
    .map((item) => ({
      department:
        item.department ||
        item.student_id ||
        "Unknown",

      pass_rate: Number(
        item.pass_rate ??
          item.average_marks ??
          item.avg_marks_percentage ??
          0
      ),
    }));

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          ML STATUS CARDS
      ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {(status?.models || []).map((m) => (
          <div
            key={m.model}
            className="card p-5"
          >
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              ML MODEL
            </div>

            <div className="text-lg font-semibold mt-1">
              {String(m.model || "")
                .replaceAll("_", " ")}
            </div>

            <div className="text-2xl font-bold mt-2">
              {m.accuracy ??
                m.anomalies ??
                "—"}

              {m.accuracy != null
                ? "%"
                : ""}
            </div>

            <div className="text-xs text-slate-500 mt-2">
              MongoDB
            </div>

            <div className="text-xs text-slate-400 mt-1">
              {m.records ?? 0} records ·{" "}
              {m.trained_at
                ? new Date(
                    m.trained_at
                  ).toLocaleString()
                : "Not trained"}
            </div>
          </div>
        ))}

      </div>

      {/* =================================================
          TABS + RETRAIN
      ================================================= */}

      <div className="flex items-center justify-between gap-3 flex-wrap">

        <div className="flex gap-2 flex-wrap">

          {allowedTabs.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError("");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-navy-900 text-cream-100"
                  : "bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 text-slate-500"
              }`}
            >
              {t}
            </button>
          ))}

        </div>

        {normalizedRole === "Admin" && (
          <button
            onClick={handleRetrain}
            disabled={training}
            className="btn-primary"
          >
            {training
              ? "Retraining..."
              : "Retrain From Database"}
          </button>
        )}

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      {/* =================================================
          STUDENT PERFORMANCE
      ================================================= */}

      {tab === "Student Performance" && (
        <div className="card p-6 space-y-6">

          <div>
            <h2 className="text-xl font-semibold">
              Student Performance Prediction
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Use current MongoDB
              student/results records or
              enter features manually.
            </p>
          </div>

          {/* DATABASE */}

          <div className="grid md:grid-cols-[1fr_auto] gap-3">

            <input
              className="input"
              placeholder="Student ID e.g. S000001"
              value={studentId}
              onChange={(e) =>
                setStudentId(e.target.value)
              }
            />

            <button
              className="btn-primary"
              onClick={
                handleDatabasePrediction
              }
              disabled={loading}
            >
              {loading
                ? "Predicting..."
                : "Predict From Database"}
            </button>

          </div>

          {/* MANUAL */}

          <div className="border-t pt-5">

            <h3 className="font-semibold mb-4">
              Manual Prediction
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

              <input
                type="number"
                name="attendance"
                placeholder="Attendance %"
                value={form.attendance}
                onChange={handleChange}
                className="input"
              />

              <input
                type="number"
                step="0.01"
                name="cgpa"
                placeholder="CGPA"
                value={form.cgpa}
                onChange={handleChange}
                className="input"
              />

              <input
                type="number"
                name="avg_marks_percentage"
                placeholder="Average Marks %"
                value={
                  form.avg_marks_percentage
                }
                onChange={handleChange}
                className="input"
              />

              <input
                type="number"
                name="failed_results"
                placeholder="Failed Results"
                value={
                  form.failed_results
                }
                onChange={handleChange}
                className="input"
              />

              <input
                type="number"
                name="result_count"
                placeholder="Result Count"
                value={
                  form.result_count
                }
                onChange={handleChange}
                className="input"
              />

              <input
                type="number"
                name="semester"
                min="1"
                max="8"
                placeholder="Semester"
                value={form.semester}
                onChange={handleChange}
                className="input"
              />

              <input
                type="text"
                name="department"
                placeholder="Department"
                value={form.department}
                onChange={handleChange}
                className="input lg:col-span-2"
              />

            </div>

            <button
              onClick={
                handleManualPrediction
              }
              disabled={loading}
              className="mt-5 bg-navy-900 text-white px-6 py-3 rounded-lg hover:bg-navy-700 transition"
            >
              {loading
                ? "Predicting..."
                : "Predict Manually"}
            </button>

          </div>

          {/* RESULT */}

          {prediction && (
            <div className="border rounded-xl p-5 bg-green-50 dark:bg-green-900/20">

              <h3 className="font-semibold text-lg">
                Prediction Result
              </h3>

              <div className="mt-2 text-2xl font-bold text-green-600">
                {prediction.prediction}
              </div>

              {prediction.confidence != null && (
                <div className="text-sm text-slate-500 mt-1">
                  Confidence:{" "}
                  {prediction.confidence}%
                </div>
              )}

              {prediction.student_id && (
                <div className="text-xs text-slate-400 mt-1">
                  Student:{" "}
                  {prediction.student_id} ·
                  Source:{" "}
                  {prediction.source ||
                    "API"}
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* =================================================
          DROPOUT PREDICTION
      ================================================= */}

      {tab === "Dropout Prediction" && (
        <div className="card p-6 space-y-6">

          <div>
            <h2 className="text-xl font-semibold">
              Dropout Prediction
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Predict the student's dropout risk
              using the trained MongoDB model.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

            <input
              type="number"
              name="attendance"
              placeholder="Attendance %"
              value={form.attendance}
              onChange={handleChange}
              className="input"
            />

            <input
              type="number"
              step="0.01"
              name="cgpa"
              placeholder="CGPA"
              value={form.cgpa}
              onChange={handleChange}
              className="input"
            />

            <input
              type="number"
              name="avg_marks_percentage"
              placeholder="Average Marks %"
              value={
                form.avg_marks_percentage
              }
              onChange={handleChange}
              className="input"
            />

            <input
              type="number"
              name="failed_results"
              placeholder="Failed Results"
              value={
                form.failed_results
              }
              onChange={handleChange}
              className="input"
            />

            <input
              type="number"
              name="result_count"
              placeholder="Result Count"
              value={
                form.result_count
              }
              onChange={handleChange}
              className="input"
            />

            <input
              type="number"
              name="semester"
              min="1"
              max="8"
              placeholder="Semester"
              value={form.semester}
              onChange={handleChange}
              className="input"
            />

            <input
              type="text"
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleChange}
              className="input lg:col-span-2"
            />

          </div>

          <button
            onClick={
              handleDropoutPrediction
            }
            disabled={loadingDropout}
            className="btn-primary"
          >
            {loadingDropout
              ? "Predicting..."
              : "Predict Dropout Risk"}
          </button>

          {dropoutPrediction && (
            <div className="border rounded-xl p-5 bg-orange-50 dark:bg-orange-900/20">

              <h3 className="font-semibold text-lg">
                Dropout Prediction Result
              </h3>

              <div className="mt-2 text-2xl font-bold">
                {dropoutPrediction.prediction}
              </div>

              {dropoutPrediction.confidence != null && (
                <div className="text-sm text-slate-500 mt-1">
                  Confidence:{" "}
                  {dropoutPrediction.confidence}%
                </div>
              )}

              <div className="text-xs text-slate-400 mt-2">
                Model:{" "}
                {dropoutPrediction.model ||
                  "dropout"}
              </div>

            </div>
          )}

        </div>
      )}

      {/* =================================================
          COURSE DEMAND
      ================================================= */}

      {tab === "Course Demand" && (
        <div className="card p-6 space-y-6">

          <div>
            <h2 className="text-xl font-semibold">
              Course Demand Prediction
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Predict course demand using
              department, semester, enrollment,
              teacher count and previous demand.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

            <input
              type="text"
              name="department"
              placeholder="Department"
              value={
                courseForm.department
              }
              onChange={
                handleCourseChange
              }
              className="input"
            />

            <input
              type="number"
              name="semester"
              min="1"
              max="8"
              placeholder="Semester"
              value={
                courseForm.semester
              }
              onChange={
                handleCourseChange
              }
              className="input"
            />

            <input
              type="number"
              name="students_enrolled"
              min="0"
              placeholder="Students Enrolled"
              value={
                courseForm.students_enrolled
              }
              onChange={
                handleCourseChange
              }
              className="input"
            />

            <input
              type="number"
              name="teacher_count"
              min="0"
              placeholder="Teacher Count"
              value={
                courseForm.teacher_count
              }
              onChange={
                handleCourseChange
              }
              className="input"
            />

            <input
              type="number"
              name="previous_demand"
              min="0"
              step="0.01"
              placeholder="Previous Demand"
              value={
                courseForm.previous_demand
              }
              onChange={
                handleCourseChange
              }
              className="input"
            />

          </div>

          <button
            onClick={
              handleCoursePrediction
            }
            disabled={loadingCourse}
            className="btn-primary"
          >
            {loadingCourse
              ? "Predicting..."
              : "Predict Course Demand"}
          </button>

          {coursePrediction && (
            <div className="border rounded-xl p-5 bg-blue-50 dark:bg-blue-900/20">

              <h3 className="font-semibold text-lg">
                Course Demand Result
              </h3>

              <div className="mt-2 text-2xl font-bold">
                {coursePrediction.prediction}
              </div>

              {coursePrediction.confidence != null && (
                <div className="text-sm text-slate-500 mt-1">
                  Confidence:{" "}
                  {coursePrediction.confidence}%
                </div>
              )}

              <div className="text-xs text-slate-400 mt-2">
                Model:{" "}
                {coursePrediction.model ||
                  "course_demand"}
              </div>

            </div>
          )}

        </div>
      )}

      {/* =================================================
          ANOMALY DETECTION
      ================================================= */}

      {tab === "Anomaly Detection" && (
        <div className="space-y-6">

          {/* MAIN ANOMALY CARD */}

          <div className="card p-6">

            <div className="flex items-center justify-between gap-3 mb-5">

              <div>
                <h2 className="text-xl font-semibold">
                  Anomaly Detection
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Students whose academic patterns
                  differ significantly from the
                  normal dataset.
                </p>
              </div>

              <button
                onClick={loadAnomalies}
                disabled={loadingAnomaly}
                className="btn-primary"
              >
                {loadingAnomaly
                  ? "Loading..."
                  : "Refresh"}
              </button>

            </div>

            <div className="mb-5">

              <div className="text-sm text-slate-500">
                Detected anomalies
              </div>

              <div className="text-3xl font-bold">
                {loadingAnomaly
                  ? "..."
                  : anomalies.length}
              </div>

            </div>

            {!loadingAnomaly &&
              anomalies.length === 0 && (
                <div className="text-sm text-slate-500">
                  No anomalies found.
                </div>
              )}

            {anomalies.length > 0 && (
              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b text-left">

                      <th className="p-3">
                        Student ID
                      </th>

                      <th className="p-3">
                        Attendance
                      </th>

                      <th className="p-3">
                        CGPA
                      </th>

                      <th className="p-3">
                        Avg Marks
                      </th>

                      <th className="p-3">
                        Failed Results
                      </th>

                      <th className="p-3">
                        Anomaly Score
                      </th>

                      <th className="p-3">
                        Status
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {anomalies.map((item, index) => (
                      <tr
                        key={
                          item.student_id ||
                          index
                        }
                        className="border-b"
                      >

                        <td className="p-3 font-medium">
                          {item.student_id}
                        </td>

                        <td className="p-3">
                          {item.attendance}%
                        </td>

                        <td className="p-3">
                          {item.cgpa}
                        </td>

                        <td className="p-3">
                          {item.avg_marks_percentage}%
                        </td>

                        <td className="p-3">
                          {item.failed_results}
                        </td>

                        <td className="p-3">
                          {item.anomaly_score}
                        </td>

                        <td className="p-3">

                          <span className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs">
                            {item.status}
                          </span>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>

          {/* ANOMALY CHARTS */}

          {anomalies.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* DONUT */}

              <div className="card p-6">

                <h3 className="font-semibold text-lg">
                  Normal vs Anomalous Students
                </h3>

                <p className="text-sm text-slate-500 mt-1 mb-5">
                  Distribution of detected anomalies.
                </p>

                <div className="flex justify-center">
                  <DonutChart
                    data={anomalyDonutData}
                  />
                </div>

              </div>

              {/* SCATTER */}

              <div className="card p-6">

                <h3 className="font-semibold text-lg">
                  CGPA vs Attendance
                </h3>

                <p className="text-sm text-slate-500 mt-1 mb-5">
                  Academic performance relationship
                  among detected anomalies.
                </p>

                {scatterData.length > 0 ? (
                  <ScatterPlot
                    data={scatterData}
                  />
                ) : (
                  <div className="text-sm text-slate-500">
                    Scatter data unavailable.
                  </div>
                )}

              </div>

            </div>
          )}

          {/* HEATMAP */}

          {heatmapData.length > 0 && (
            <div className="card p-6">

              <h3 className="font-semibold text-lg">
                Anomaly Performance Heatmap
              </h3>

              <p className="text-sm text-slate-500 mt-1 mb-5">
                Performance intensity of detected
                records.
              </p>

              <Heatmap
                data={heatmapData}
              />

            </div>
          )}

        </div>
      )}

      {/* =================================================
          CORRELATION
      ================================================= */}

      {tab === "Correlation" && (
        <div className="space-y-6">

          <div className="card p-6">

            <div className="flex items-center justify-between gap-3 mb-5">

              <div>
                <h2 className="text-xl font-semibold">
                  Student Data Correlation
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Correlation between academic and
                  attendance features.
                </p>
              </div>

              <button
                onClick={loadCorrelation}
                disabled={
                  loadingCorrelation
                }
                className="btn-primary"
              >
                {loadingCorrelation
                  ? "Loading..."
                  : "Refresh"}
              </button>

            </div>

            {loadingCorrelation ? (
              <div className="text-sm text-slate-500">
                Loading correlation data...
              </div>
            ) : correlation.length === 0 ? (
              <div className="text-sm text-slate-500">
                No correlation data available.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b text-left">

                      <th className="p-3">
                        Feature
                      </th>

                      <th className="p-3">
                        Attendance
                      </th>

                      <th className="p-3">
                        CGPA
                      </th>

                      <th className="p-3">
                        Avg Marks
                      </th>

                      <th className="p-3">
                        Failed Results
                      </th>

                      <th className="p-3">
                        Result Count
                      </th>

                      <th className="p-3">
                        Semester
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {correlation.map(
                      (row, index) => (
                        <tr
                          key={
                            row.feature ||
                            index
                          }
                          className="border-b"
                        >

                          <td className="p-3 font-medium">
                            {row.feature}
                          </td>

                          <td className="p-3">
                            {row.attendance}
                          </td>

                          <td className="p-3">
                            {row.cgpa}
                          </td>

                          <td className="p-3">
                            {row.avg_marks_percentage}
                          </td>

                          <td className="p-3">
                            {row.failed_results}
                          </td>

                          <td className="p-3">
                            {row.result_count}
                          </td>

                          <td className="p-3">
                            {row.semester}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

          {/* CORRELATION BAR CHART */}

          {correlationChartData.length > 0 && (
            <div className="card p-6">

              <h3 className="font-semibold text-lg">
                Correlation Overview
              </h3>

              <p className="text-sm text-slate-500 mt-1 mb-5">
                Comparative view of the returned
                correlation features.
              </p>

              <BarChart
                data={correlationChartData}
                suffix=""
              />

            </div>
          )}

        </div>
      )}

      {/* =================================================
          TREND
      ================================================= */}

      {tab === "Trend" && (
        <div className="space-y-6">

          <div className="card p-6">

            <div className="flex items-center justify-between gap-3 mb-5">

              <div>
                <h2 className="text-xl font-semibold">
                  Semester Trend
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Average CGPA, attendance and
                  marks across semesters.
                </p>
              </div>

              <button
                onClick={loadTrend}
                disabled={loadingTrend}
                className="btn-primary"
              >
                {loadingTrend
                  ? "Loading..."
                  : "Refresh"}
              </button>

            </div>

            {loadingTrend ? (
              <div className="text-sm text-slate-500">
                Loading trend data...
              </div>
            ) : trend.length === 0 ? (
              <div className="text-sm text-slate-500">
                No trend data available.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b text-left">

                      <th className="p-3">
                        Semester
                      </th>

                      <th className="p-3">
                        Average CGPA
                      </th>

                      <th className="p-3">
                        Average Attendance
                      </th>

                      <th className="p-3">
                        Average Marks
                      </th>

                      <th className="p-3">
                        CGPA Status
                      </th>

                      <th className="p-3">
                        Attendance Status
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {trend.map(
                      (row, index) => (
                        <tr
                          key={
                            row.semester ??
                            index
                          }
                          className="border-b"
                        >

                          <td className="p-3 font-medium">
                            Semester{" "}
                            {row.semester}
                          </td>

                          <td className="p-3">
                            {row.average_cgpa}
                          </td>

                          <td className="p-3">
                            {row.average_attendance}%
                          </td>

                          <td className="p-3">
                            {row.average_marks}%
                          </td>

                          <td className="p-3">
                            {row.cgpa_status}
                          </td>

                          <td className="p-3">
                            {row.attendance_status}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

          {/* TREND CHARTS */}

          {trend.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* CGPA LINE */}

              <div className="card p-6">

                <h3 className="font-semibold text-lg">
                  CGPA Trend
                </h3>

                <p className="text-sm text-slate-500 mt-1 mb-5">
                  Average CGPA across semesters.
                </p>

                {trendChartData.length > 0 ? (
                  <LineAreaChart
                    data={trendChartData}
                    suffix=""
                    area={true}
                  />
                ) : (
                  <div className="text-sm text-slate-500">
                    CGPA chart data unavailable.
                  </div>
                )}

              </div>

              {/* ATTENDANCE BAR */}

              <div className="card p-6">

                <h3 className="font-semibold text-lg">
                  Attendance Trend
                </h3>

                <p className="text-sm text-slate-500 mt-1 mb-5">
                  Average attendance across
                  semesters.
                </p>

                {attendanceTrendData.length > 0 ? (
                  <BarChart
                    data={
                      attendanceTrendData
                    }
                    suffix="%"
                  />
                ) : (
                  <div className="text-sm text-slate-500">
                    Attendance chart data unavailable.
                  </div>
                )}

              </div>

            </div>
          )}

          {/* MARKS CHART */}

          {trend.length > 0 &&
            marksTrendData.length > 0 && (
              <div className="card p-6">

                <h3 className="font-semibold text-lg">
                  Average Marks Trend
                </h3>

                <p className="text-sm text-slate-500 mt-1 mb-5">
                  Average marks percentage across
                  semesters.
                </p>

                <BarChart
                  data={marksTrendData}
                  suffix="%"
                />

              </div>
            )}

        </div>
      )}

    </div>
  );
}
