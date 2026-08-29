// // import { useState } from 'react'
// // import { useData } from '../../context/DataContext.jsx'

// // const TICKETS = [
// //   { id: 'TCK-2201', subject: 'Attendance sync delayed for CS204', status: 'open', priority: 'high', time: '2h ago' },
// //   { id: 'TCK-2198', subject: 'Cannot export analytics as PDF', status: 'in progress', priority: 'medium', time: '1 day ago' },
// //   { id: 'TCK-2190', subject: 'Requesting new department: Data Science', status: 'closed', priority: 'low', time: '4 days ago' },
// // ]

// // export default function Support() {
// //   const { showToast } = useData()
// //   const [tab, setTab] = useState('ticket')
// //   const [form, setForm] = useState({ subject: '', priority: 'medium', message: '' })
// //   const [bug, setBug] = useState({ title: '', steps: '', severity: 'minor' })

// //   const submitTicket = (e) => {
// //     e.preventDefault()
// //     showToast('Support ticket submitted. Our team will respond within 24 hours.')
// //     setForm({ subject: '', priority: 'medium', message: '' })
// //   }

// //   const submitBug = (e) => {
// //     e.preventDefault()
// //     showToast('Bug report submitted. Thanks for helping improve EduPredict.')
// //     setBug({ title: '', steps: '', severity: 'minor' })
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <div className="flex gap-2">
// //         {[['ticket', 'Raise a Ticket'], ['feedback', 'Feedback'], ['bug', 'Report a Bug']].map(([id, label]) => (
// //           <button
// //             key={id}
// //             onClick={() => setTab(id)}
// //             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-navy-900 text-cream-100' : 'bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 text-slate-500'}`}
// //           >
// //             {label}
// //           </button>
// //         ))}
// //       </div>

// //       <div className="grid lg:grid-cols-2 gap-5">
// //         <div className="card p-5">
// //           {tab === 'ticket' && (
// //             <form onSubmit={submitTicket} className="space-y-4">
// //               <h3 className="font-semibold">Raise a Support Ticket</h3>
// //               <div>
// //                 <label className="label">Subject</label>
// //                 <input className="input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
// //               </div>
// //               <div>
// //                 <label className="label">Priority</label>
// //                 <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
// //                   <option value="low">Low</option>
// //                   <option value="medium">Medium</option>
// //                   <option value="high">High</option>
// //                 </select>
// //               </div>
// //               <div>
// //                 <label className="label">Message</label>
// //                 <textarea className="input" rows="4" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
// //               </div>
// //               <button type="submit" className="btn-primary w-full">Submit Ticket</button>
// //             </form>
// //           )}

// //           {tab === 'feedback' && (
// //             <form onSubmit={submitTicket} className="space-y-4">
// //               <h3 className="font-semibold">Share Feedback</h3>
// //               <div>
// //                 <label className="label">What's on your mind?</label>
// //                 <textarea className="input" rows="6" required placeholder="Tell us what's working well or what could be better..." />
// //               </div>
// //               <button type="submit" className="btn-primary w-full">Send Feedback</button>
// //             </form>
// //           )}

// //           {tab === 'bug' && (
// //             <form onSubmit={submitBug} className="space-y-4">
// //               <h3 className="font-semibold">Report a Bug</h3>
// //               <div>
// //                 <label className="label">Bug title</label>
// //                 <input className="input" required value={bug.title} onChange={(e) => setBug({ ...bug, title: e.target.value })} />
// //               </div>
// //               <div>
// //                 <label className="label">Severity</label>
// //                 <select className="input" value={bug.severity} onChange={(e) => setBug({ ...bug, severity: e.target.value })}>
// //                   <option value="minor">Minor</option>
// //                   <option value="major">Major</option>
// //                   <option value="blocker">Blocker</option>
// //                 </select>
// //               </div>
// //               <div>
// //                 <label className="label">Steps to reproduce</label>
// //                 <textarea className="input" rows="4" required value={bug.steps} onChange={(e) => setBug({ ...bug, steps: e.target.value })} />
// //               </div>
// //               <button type="submit" className="btn-primary w-full">Submit Bug Report</button>
// //             </form>
// //           )}
// //         </div>

// //         <div className="card p-5">
// //           <h3 className="font-semibold mb-3">My Tickets</h3>
// //           <div className="space-y-3">
// //             {TICKETS.map((t) => (
// //               <div key={t.id} className="px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-navy-700/40">
// //                 <div className="flex items-center justify-between">
// //                   <span className="text-sm font-medium">{t.subject}</span>
// //                   <span className={`badge ${t.status === 'closed' ? 'bg-slate-200 text-slate-500' : t.status === 'open' ? 'bg-sky-500/10 text-sky-500' : 'bg-amber-accent/10 text-amber-accent'}`}>{t.status}</span>
// //                 </div>
// //                 <div className="text-xs text-slate-400 mt-1">{t.id} · {t.priority} priority · {t.time}</div>
// //               </div>
// //             ))}
// //           </div>
// //           <div className="mt-5 pt-4 border-t border-slate-100 dark:border-navy-700 text-sm text-slate-500">
// //             Prefer email? Reach us at <span className="text-navy-900 dark:text-cream-100 font-medium">support@edupredict.edu</span>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }




// import { useState, useEffect } from "react";

// import {
//   createSupportTicket,
//   getMySupportTickets,
//   createFeedback,
//   createBugReport
// } from "../../api/api";

// const TABS = [
//   ["ticket", "Raise a Ticket"],
//   ["feedback", "Feedback"],
//   ["bug", "Report a Bug"]
// ];

// export default function Support() {

//   const [tab, setTab] = useState("ticket");

//   const [loading, setLoading] = useState(false);

//   const [tickets, setTickets] = useState([]);

//   const [form, setForm] = useState({

//     subject: "",

//     message: "",

//     category: "Other",

//     priority: "Medium"

//   });

//   const [feedback, setFeedback] = useState({

//     subject: "",

//     message: ""

//   });

//   const [bug, setBug] = useState({

//     subject: "",

//     message: "",

//     priority: "High"

//   });

//   // ==========================================
//   // Load My Tickets
//   // ==========================================

//   const loadTickets = async () => {

//     try {

//       const data = await getMySupportTickets();

//       setTickets(data);

//     }

//     catch (err) {

//       console.log(err);

//     }

//   };

//   useEffect(() => {

//     loadTickets();

//   }, []);

//   // ==========================================
//   // Submit Support Ticket
//   // ==========================================

//   const submitTicket = async (e) => {

//     e.preventDefault();

//     try {

//       setLoading(true);

//       await createSupportTicket({

//         subject: form.subject,

//         message: form.message,

//         category: form.category,

//         priority: form.priority

//       });

//       alert("Support Ticket Submitted Successfully");
//         setForm({

//           subject: "",

//           message: "",

//           category: "Other",

//           priority: "Medium"

//         });

//       loadTickets();

//     }

//     catch (err) {

//       alert(

//         err.response?.data?.message ||

//         "Failed to submit ticket"

//       );

//     }

//     finally {

//       setLoading(false);

//     }

//   };

//   // ==========================================
//   // Submit Feedback
//   // ==========================================

//   const submitFeedback = async (e) => {

//     e.preventDefault();

//     try {

//       setLoading(true);

//       await createFeedback({

//         subject: feedback.subject,

//         message: feedback.message

//       });

//       alert("Feedback Sent Successfully");

//       setFeedback({

//         subject: "",

//         message: ""

//       });

//     }

//     catch (err) {

//       alert(

//         err.response?.data?.message ||

//         "Unable to send feedback"

//       );

//     }

//     finally {

//       setLoading(false);

//     }

//   };

//   // ==========================================
//   // Submit Bug Report
//   // ==========================================

//   const submitBug = async (e) => {

//     e.preventDefault();

//     try {

//       setLoading(true);

//       await createBugReport({

//         subject: bug.subject,

//         message: bug.message,

//         priority: bug.priority

//       });

//       alert("Bug Report Submitted");

//       setBug({

//         subject: "",

//         message: "",

//         priority: "High"

//       });

//     }

//     catch (err) {

//       alert(

//         err.response?.data?.message ||

//         "Unable to submit bug"

//       );

//     }

//     finally {

//       setLoading(false);

//     }

//   };

//   return (

//     <div className="space-y-5">

//       <div className="flex gap-2 flex-wrap">

//         {TABS.map(([id, label]) => (

//           <button
//             key={id}
//             onClick={() => setTab(id)}
//             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//               tab === id
//                 ? "bg-navy-900 text-cream-100"
//                 : "bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 text-slate-500"
//             }`}
//           >

//             {label}

//           </button>

//         ))}

//       </div>

//       <div className="grid lg:grid-cols-2 gap-5">

//         <div className="card p-5">



//                     {/* ==========================
//               SUPPORT TICKET
//           ========================== */}

//           {tab === "ticket" && (

//             <form onSubmit={submitTicket} className="space-y-4">

//               <h3 className="font-semibold text-lg">

//                 Raise Support Ticket

//               </h3>

//               <div>

//                 <label className="label">

//                   Subject

//                 </label>

//                 <input
//                   className="input"
//                   required
//                   value={form.subject}
//                   onChange={(e) =>
//                     setForm({
//                       ...form,
//                       subject: e.target.value
//                     })
//                   }
//                 />

//               </div>

//               <div>

//                 <label className="label">

//                   Category

//                 </label>

//                 <select
//                   className="input"
//                   value={form.category}
//                   onChange={(e) =>
//                     setForm({
//                       ...form,
//                       category: e.target.value
//                     })
//                   }
//                 >

//                  <option>Attendance</option>

//                   <option>Result</option>

//                   <option>Course</option>

//                   <option>Account</option>

//                   <option>Dashboard</option>

//                   <option>Prediction</option>

//                   <option>Bug</option>

//                   <option>Feedback</option>

//                   <option>Other</option>
//                 </select>

//               </div>

//               <div>

//                 <label className="label">

//                   Priority

//                 </label>

//                 <select
//                   className="input"
//                   value={form.priority}
//                   onChange={(e) =>
//                     setForm({
//                       ...form,
//                       priority: e.target.value
//                     })
//                   }
//                 >

//                   <option>Low</option>

//                   <option>Medium</option>

//                   <option>High</option>


//                 </select>

//               </div>

//               <div>

//                 <label className="label">

//                   Message

//                 </label>

//                 <textarea
//                   className="input"
//                   rows="5"
//                   required
//                   value={form.message}
//                   onChange={(e) =>
//                     setForm({
//                       ...form,
//                       message: e.target.value
//                     })
//                   }
//                 />

//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="btn-primary w-full"
//               >

//                 {loading
//                   ? "Submitting..."
//                   : "Submit Ticket"}

//               </button>

//             </form>

//           )}

//           {/* ==========================
//               FEEDBACK
//           ========================== */}

//           {tab === "feedback" && (

//             <form
//               onSubmit={submitFeedback}
//               className="space-y-4"
//             >

//               <h3 className="font-semibold text-lg">

//                 Share Feedback

//               </h3>

//               <div>

//                 <label className="label">

//                   Subject

//                 </label>

//                 <input
//                   className="input"
//                   required
//                   value={feedback.subject}
//                   onChange={(e) =>
//                     setFeedback({
//                       ...feedback,
//                       subject: e.target.value
//                     })
//                   }
//                 />

//               </div>

//               <div>

//                 <label className="label">

//                   Feedback

//                 </label>

//                 <textarea
//                   className="input"
//                   rows="6"
//                   required
//                   value={feedback.message}
//                   onChange={(e) =>
//                     setFeedback({
//                       ...feedback,
//                       message: e.target.value
//                     })
//                   }
//                 />

//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="btn-primary w-full"
//               >

//                 {loading
//                   ? "Sending..."
//                   : "Send Feedback"}

//               </button>

//             </form>

//           )}

//           {/* ==========================
//               BUG REPORT
//           ========================== */}

//           {tab === "bug" && (

//             <form
//               onSubmit={submitBug}
//               className="space-y-4"
//             >

//               <h3 className="font-semibold text-lg">

//                 Report Bug

//               </h3>

//               <div>

//                 <label className="label">

//                   Bug Title

//                 </label>

//                 <input
//                   className="input"
//                   required
//                   value={bug.subject}
//                   onChange={(e) =>
//                     setBug({
//                       ...bug,
//                       subject: e.target.value
//                     })
//                   }
//                 />

//               </div>

//               <div>

//                 <label className="label">

//                   Severity

//                 </label>

//                 <select
//                   className="input"
//                   value={bug.priority}
//                   onChange={(e) =>
//                     setBug({
//                       ...bug,
//                       priority: e.target.value
//                     })
//                   }
//                 >

//                   <option>Low</option>

//                   <option>Medium</option>

//                   <option>High</option>


//                 </select>

//               </div>

//               <div>

//                 <label className="label">

//                   Description

//                 </label>

//                 <textarea
//                   className="input"
//                   rows="5"
//                   required
//                   value={bug.message}
//                   onChange={(e) =>
//                     setBug({
//                       ...bug,
//                       message: e.target.value
//                     })
//                   }
//                 />

//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="btn-primary w-full"
//               >

//                 {loading
//                   ? "Submitting..."
//                   : "Submit Bug"}

//               </button>

//             </form>

//           )}

//         </div>

//         <div className="card p-5">



//               <h3 className="font-semibold text-lg mb-4">

//             My Support Tickets

//           </h3>

//           {tickets.length === 0 ? (

//             <div className="text-center py-10 text-slate-400">

//               No support tickets found.

//             </div>

//           ) : (

//             <div className="space-y-3 max-h-[650px] overflow-y-auto">

//               {tickets.map((ticket) => (

//                 <div
//                   key={ticket.ticket_id}
//                   className="border border-slate-200 dark:border-navy-700 rounded-lg p-4"
//                 >

//                   <div className="flex justify-between items-center">

//                     <h4 className="font-semibold">

//                       {ticket.subject}

//                     </h4>

//                     <span
//                       className={`px-2 py-1 rounded text-xs font-semibold
//                       ${
//                         ticket.status === "Open"
//                           ? "bg-blue-100 text-blue-700"
//                           : ticket.status === "In Progress"
//                           ? "bg-yellow-100 text-yellow-700"
//                           : ticket.status === "Resolved"
//                           ? "bg-green-100 text-green-700"
//                           : "bg-gray-100 text-gray-700"
//                       }`}
//                     >

//                       {ticket.status}

//                     </span>

//                   </div>

//                   <div className="mt-2 text-sm text-slate-500">

//                     {ticket.message}

//                   </div>

//                   <div className="flex flex-wrap gap-2 mt-3">

//                     <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-navy-700">

//                       {ticket.category}

//                     </span>

//                     <span
//                       className={`text-xs px-2 py-1 rounded
//                       ${
//                         ticket.priority === "Critical"
//                           ? "bg-red-100 text-red-700"
//                           : ticket.priority === "High"
//                           ? "bg-orange-100 text-orange-700"
//                           : ticket.priority === "Medium"
//                           ? "bg-yellow-100 text-yellow-700"
//                           : "bg-green-100 text-green-700"
//                       }`}
//                     >

//                       {ticket.priority}

//                     </span>

//                   </div>

//                   {ticket.admin_reply && (

//                     <div className="mt-4 rounded-lg bg-slate-50 dark:bg-navy-800 p-3">

//                       <p className="text-xs font-semibold mb-1">

//                         Admin Reply

//                       </p>

//                       <p className="text-sm">

//                         {ticket.admin_reply}

//                       </p>

//                     </div>

//                   )}

//                   <div className="mt-3 text-xs text-slate-400">

//                     {new Date(ticket.created_at).toLocaleString()}

//                   </div>

//                 </div>

//               ))}

//             </div>

//           )}

//         </div>

//       </div>

//     </div>

//   );

// }    


import { useAuth } from "../../context/AuthContext.jsx";

import AdminSupport from "./AdminSupport.jsx";
import UserSupport from "./UserSupport.jsx";

export default function Support() {

  const { user } = useAuth();

  if (!user) {

    return (

      <div className="card p-8 text-center">

        Loading...

      </div>

    );

  }

  // ===============================
  // Admin
  // ===============================

  if (user.role === "Admin") {

    return <AdminSupport />;

  }

  // ===============================
  // Student
  // Teacher
  // Analyst
  // ===============================

  return <UserSupport />;

}