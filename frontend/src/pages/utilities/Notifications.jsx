// import { useState } from 'react'
// import { useData } from '../../context/DataContext.jsx'
// import { StatusBadge } from '../../components/Badges.jsx'

// const FILTERS = ['all', 'critical', 'warning', 'success', 'info']

// export default function Notifications() {
//   const { notifs, markNotifRead, markAllRead, dismissNotif } = useData()
//   const [filter, setFilter] = useState('all')

//   const filtered = filter === 'all' ? notifs : notifs.filter((n) => n.type === filter)

//   return (
//     <div className="space-y-5">
//       <div className="flex flex-wrap items-center gap-2">
//         {FILTERS.map((f) => (
//           <button
//             key={f}
//             onClick={() => setFilter(f)}
//             className={`px-3.5 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-navy-900 text-cream-100' : 'bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 text-slate-500'}`}
//           >
//             {f}
//           </button>
//         ))}
//         <button onClick={markAllRead} className="ml-auto btn-secondary text-sm">Mark all as read</button>
//       </div>

//       <div className="card divide-y divide-slate-50 dark:divide-navy-700/60">
//         {filtered.length === 0 && <div className="p-8 text-center text-sm text-slate-400">No notifications in this category.</div>}
//         {filtered.map((n) => (
//           <div key={n.id} className={`p-4 flex gap-3 ${!n.read ? 'bg-slate-50/60 dark:bg-navy-700/30' : ''}`}>
//             <div className="flex-1">
//               <div className="flex items-center gap-2 flex-wrap">
//                 <StatusBadge value={n.type} />
//                 <span className="font-medium text-sm">{n.title}</span>
//                 {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-accent" />}
//               </div>
//               <p className="text-sm text-slate-500 mt-1">{n.body}</p>
//               <span className="text-xs text-slate-400">{n.time}</span>
//             </div>
//             <div className="flex flex-col gap-1.5 shrink-0">
//               {!n.read && <button onClick={() => markNotifRead(n.id)} className="text-xs text-navy-900 dark:text-cream-100 font-medium hover:underline">Mark read</button>}
//               <button onClick={() => dismissNotif(n.id)} className="text-xs text-slate-400 hover:text-red-500">Dismiss</button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }



// import { useEffect, useState } from "react";

// import {
//   getMyNotifications,
//   markNotificationRead,
//   deleteNotification
// } from "../../api/api";

// import { StatusBadge } from "../../components/Badges.jsx";

// const FILTERS = [
//   "all",
//   "critical",
//   "warning",
//   "success",
//   "info"
// ];

// export default function Notifications() {

//   const [notifications, setNotifications] = useState([]);

//   const [loading, setLoading] = useState(true);

//   const [filter, setFilter] = useState("all");

//   // ==============================
//   // Load Notifications
//   // ==============================

//   const loadNotifications = async () => {

//     try {

//       setLoading(true);

//       const data = await getMyNotifications();

//       const formatted = data.map((item) => ({

//         id: item.notification_id,

//         title: item.title,

//         body: item.message,

//         read: item.is_read,

//         time: new Date(item.created_at).toLocaleString(),

//         type:
//           item.title.includes("Failed")
//             ? "critical"
//             : item.title.includes("Attendance")
//             ? "warning"
//             : item.title.includes("CGPA")
//             ? "warning"
//             : "info"

//       }));

//       setNotifications(formatted);

//     }

//     catch (err) {

//       console.log(err);

//     }

//     finally {

//       setLoading(false);

//     }

//   };

//   useEffect(() => {

//     loadNotifications();

//   }, []);

//   // ==============================
//   // Mark Read
//   // ==============================

//   const handleRead = async (id) => {

//     try {

//       await markNotificationRead(id);

//       loadNotifications();

//     }

//     catch (err) {

//       console.log(err);

//     }

//   };

//   // ==============================
//   // Delete
//   // ==============================

//   const handleDelete = async (id) => {

//     try {

//       await deleteNotification(id);

//       loadNotifications();

//     }

//     catch (err) {

//       console.log(err);

//     }

//   };

//   // ==============================
//   // Mark All
//   // ==============================

//   const handleMarkAll = async () => {

//     for (const item of notifications) {

//       if (!item.read) {

//         await markNotificationRead(item.id);

//       }

//     }

//     loadNotifications();

//   };

//   const filtered =
//     filter === "all"
//       ? notifications
//       : notifications.filter(
//           (item) => item.type === filter
//         );

//   return (

//     <div className="space-y-5">

//       <div className="flex flex-wrap items-center gap-2">

//         {FILTERS.map((f) => (

//           <button
//             key={f}
//             onClick={() => setFilter(f)}
//             className={`px-3.5 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
//               filter === f
//                 ? "bg-navy-900 text-cream-100"
//                 : "bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 text-slate-500"
//             }`}
//           >

//             {f}

//           </button>

//         ))}

//         <button
//           onClick={handleMarkAll}
//           className="ml-auto btn-secondary text-sm"
//         >

//           Mark all as read

//         </button>

//       </div>

//       <div className="card divide-y divide-slate-50 dark:divide-navy-700/60">

//         {loading && (

//           <div className="p-8 text-center">

//             Loading...

//           </div>

//         )}
//         {!loading && filtered.length === 0 && (

//           <div className="p-8 text-center text-sm text-slate-400">

//             No notifications in this category.

//           </div>

//         )}

//         {!loading &&
//           filtered.map((n) => (

//             <div
//               key={n.id}
//               className={`p-4 flex gap-3 ${
//                 !n.read
//                   ? "bg-slate-50/60 dark:bg-navy-700/30"
//                   : ""
//               }`}
//             >

//               <div className="flex-1">

//                 <div className="flex items-center gap-2 flex-wrap">

//                   <StatusBadge value={n.type} />

//                   <span className="font-medium text-sm">

//                     {n.title}

//                   </span>

//                   {!n.read && (

//                     <span className="w-1.5 h-1.5 rounded-full bg-amber-accent" />

//                   )}

//                 </div>

//                 <p className="text-sm text-slate-500 mt-1">

//                   {n.body}

//                 </p>

//                 <span className="text-xs text-slate-400">

//                   {n.time}

//                 </span>

//               </div>

//               <div className="flex flex-col gap-1.5 shrink-0">

//                 {!n.read && (

//                   <button
//                     onClick={() => handleRead(n.id)}
//                     className="text-xs text-navy-900 dark:text-cream-100 font-medium hover:underline"
//                   >

//                     Mark read

//                   </button>

//                 )}

//                 <button
//                   onClick={() => handleDelete(n.id)}
//                   className="text-xs text-slate-400 hover:text-red-500"
//                 >

//                   Delete

//                 </button>

//               </div>

//             </div>

//           ))}

//       </div>

//     </div>

//   );

// }


import { useAuth } from "../../context/AuthContext.jsx";

import AdminNotifications from "./AdminNotifications.jsx";
import UserNotifications from "./UserNotifications.jsx";

export default function Notifications() {

  const { user } = useAuth();

  if (!user) {

    return (

      <div className="card p-8 text-center">

        Loading...

      </div>

    );

  }

  // ==========================================
  // Admin
  // ==========================================

  if (user.role === "Admin") {

    return <AdminNotifications />;

  }

  // ==========================================
  // Student + Teacher
  // ==========================================

  return <UserNotifications />;

}