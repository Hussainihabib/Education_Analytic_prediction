import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { ROLE_LABEL } from '../utils/nav.js'

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { notifs, markNotifRead } = useData()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const navigate = useNavigate()
  const unread = notifs.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-5 py-4 bg-cream-50/90 dark:bg-navy-950/90 backdrop-blur border-b border-slate-200 dark:border-navy-700">
      <button className="lg:hidden text-xl" onClick={onMenuClick}>☰</button>
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={toggleTheme} className="w-9 h-9 rounded-lg border border-slate-200 dark:border-navy-600 flex items-center justify-center hover:bg-white dark:hover:bg-navy-700" title="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        <div className="relative">
          <button onClick={() => { setShowNotifs((s) => !s); setShowProfile(false) }} className="w-9 h-9 rounded-lg border border-slate-200 dark:border-navy-600 flex items-center justify-center hover:bg-white dark:hover:bg-navy-700 relative">
            🔔
            {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>}
          </button>
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 card p-2 max-h-96 overflow-y-auto">
              {notifs.slice(0, 6).map((n) => (
                <button
                  key={n.id}
                  onClick={() => { markNotifRead(n.id); setShowNotifs(false); navigate('/app/notifications') }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-700 text-sm ${!n.read ? 'bg-slate-50/70 dark:bg-navy-700/40' : ''}`}
                >
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{n.time}</div>
                </button>
              ))}
              <button onClick={() => { setShowNotifs(false); navigate('/app/notifications') }} className="w-full text-center text-xs text-navy-900 dark:text-cream-100 font-medium py-2 hover:underline">
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setShowProfile((s) => !s); setShowNotifs(false) }} className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg border border-slate-200 dark:border-navy-600 hover:bg-white dark:hover:bg-navy-700">
            <span className="w-7 h-7 rounded-full bg-navy-900 text-cream-100 text-xs flex items-center justify-center font-medium">
              {user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </span>
            <span className="text-sm hidden sm:block">{user?.name}</span>
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-52 card p-2">
              <div className="px-3 py-2 text-xs text-slate-400">{ROLE_LABEL[user?.role]}</div>
              <button onClick={() => { setShowProfile(false); navigate('/app/settings') }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-700 text-sm">Profile & Settings</button>
              <button onClick={() => { setShowProfile(false); navigate('/app/support') }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-700 text-sm">Help & Support</button>
              <button onClick={() => { logout(); navigate('/login') }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-500 text-sm">Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// import { useAuth } from "../context/AuthContext.jsx";
// import { useTheme } from "../context/ThemeContext.jsx";

// import {
//   getMyNotifications,
//   markNotificationRead,
// } from "../api/api";

// import { ROLE_LABEL } from "../utils/nav.js";

// export default function Topbar({ title, onMenuClick }) {
//   const navigate = useNavigate();

//   const { user, logout } = useAuth();
//   const { theme, toggleTheme } = useTheme();

//   // ===========================
//   // Local States
//   // ===========================

//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [showNotifs, setShowNotifs] = useState(false);
//   const [showProfile, setShowProfile] = useState(false);

//   // ===========================
//   // Load Notifications
//   // ===========================

//   const loadNotifications = async () => {
//     try {
//       setLoading(true);

//       const res = await getMyNotifications();

//       const data = res.data || res || [];

//       const formatted = data.map((item) => ({
//         id:
//           item.notification_id ||
//           item._id,

//         title:
//           item.title,

//         message:
//           item.message,

//         time:
//           item.created_at
//             ? new Date(
//                 item.created_at
//               ).toLocaleString()
//             : "Just now",

//         read:
//           item.is_read,
//       }));

//       setNotifications(formatted);
//     } catch (err) {
//       console.error(
//         "Notification Load Error",
//         err
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ===========================
//   // First Load
//   // ===========================

//   useEffect(() => {
//     loadNotifications();
//   }, []);

//   // ===========================
//   // Mark Read
//   // ===========================

//   const handleRead = async (id) => {
//     try {
//       await markNotificationRead(id);

//       setNotifications((prev) =>
//         prev.map((n) =>
//           n.id === id
//             ? {
//                 ...n,
//                 read: true,
//               }
//             : n
//         )
//       );
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ===========================
//   // Unread Count
//   // ===========================

//   const unread =
//     notifications.filter(
//       (n) => !n.read
//     ).length;


//     <div className="flex items-center gap-3">

//   {/* Theme Toggle */}
//   <button
//     onClick={toggleTheme}
//     className="w-9 h-9 rounded-lg border border-slate-200 dark:border-navy-600 flex items-center justify-center hover:bg-white dark:hover:bg-navy-700"
//   >
//     {theme === "dark" ? "☀" : "☾"}
//   </button>

//   {/* Notification */}
//   <div className="relative">
//     <button
//       onClick={() => {
//         setShowNotifs((s) => !s)
//         setShowProfile(false)
//       }}
//       className="w-9 h-9 rounded-lg border border-slate-200 dark:border-navy-600 flex items-center justify-center hover:bg-white dark:hover:bg-navy-700 relative"
//     >
//       🔔

//       {unread > 0 && (
//         <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
//           {unread}
//         </span>
//       )}
//     </button>

//     {showNotifs && (
//       <div className="absolute right-0 mt-2 w-96 card p-2 max-h-96 overflow-y-auto z-50">

//         <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-navy-700">
//           <h3 className="font-semibold">Notifications</h3>

//           {unread > 0 && (
//             <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
//               {unread} New
//             </span>
//           )}
//         </div>

//         {notifs.length === 0 ? (
//           <div className="py-8 text-center text-slate-400">
//             No notifications found
//           </div>
//         ) : (
//           <>
//             {notifs.slice(0, 8).map((n) => (
//               <button
//                 key={n.id}
//                 onClick={() => {
//                   markNotifRead(n.id)
//                   setShowNotifs(false)
//                   navigate("/app/notifications")
//                 }}
//                 className={`w-full text-left px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-700 transition ${
//                   !n.read
//                     ? "bg-blue-50 dark:bg-navy-700/40"
//                     : ""
//                 }`}
//               >
//                 <div className="flex justify-between items-start">

//                   <div className="flex-1">

//                     <div className="font-medium text-sm">
//                       {n.title}
//                     </div>

//                     <div className="text-xs text-slate-500 mt-1">
//                       {n.message}
//                     </div>

//                     <div className="text-[11px] text-slate-400 mt-2">
//                       {n.time}
//                     </div>

//                   </div>

//                   {!n.read && (
//                     <span className="w-2 h-2 rounded-full bg-blue-500 mt-2"></span>
//                   )}

//                 </div>
//               </button>
//             ))}
//           </>
//         )}

//         <button
//           onClick={() => {
//             setShowNotifs(false)
//             navigate("/app/notifications")
//           }}
//           className="w-full mt-2 text-center text-sm font-medium text-navy-900 dark:text-cream-100 py-2 hover:underline"
//         >
//           View All Notifications
//         </button>

//       </div>
//     )}
//   </div>
