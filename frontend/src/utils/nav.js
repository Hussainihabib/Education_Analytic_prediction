export const NAV = {
  Admin: [
    { section: 'Overview', items: [
      { to: '/app/admin', label: 'Dashboard', icon: '◧' },
    ]},
    { section: 'Management', items: [
      { to: '/app/students', label: 'Students', icon: '☺' },
      { to: '/app/teachers', label: 'Teachers', icon: '🎓' },
      { to: '/app/courses', label: 'Courses', icon: '▤' },
      {
        label: "Results",
        to: "/app/results",
        icon: "▦",
      },
      {
        label: "Attendance",
        to: "/app/attendance",  
       icon: "◷",
      },     
      // { to: '/app/departments', label: 'Departments', icon: '⬒' },
    ]},
    { section: 'Big Data', items: [
      { to: '/app/ingestion', label: 'Data Ingestion', icon: '⇧' },
      { to: '/app/hdfs', label: 'HDFS Storage', icon: '⛁' },
      { to: '/app/spark', label: 'Spark Processing', icon: '⚡' },
    ]},
    { section: 'Intelligence', items: [
      { to: '/app/live', label: 'Real-Time View', icon: '●' },
      { to: '/app/ml', label: 'ML Hub', icon: '◈' },
      { to: '/app/analytics', label: 'Analytics', icon: '▦' },
    ]},
    { section: 'Utilities', items: [
      { to: '/app/reports', label: 'Reports', icon: '⬇' },
      { to: '/app/notifications', label: 'Notifications', icon: '♪' },
      { to: '/app/support', label: 'Support', icon: '✎' },
      { to: '/app/settings', label: 'Settings', icon: '⚙' },
    ]},
  ],
  Teacher: [
    { section: 'Overview', items: [
      { to: '/app/teacher', label: 'Dashboard', icon: '◧' },
    ]},
    { section: 'Classroom', items: [
      { to: '/app/students', label: 'My Students', icon: '☺' },
      { to: '/app/courses', label: 'My Courses', icon: '▤' },
      { to: '/app/results', label: 'My Results', icon: "▦",},
      { to: '/app/attendance', label: 'My Attendance', icon: '◷' },
    ]},
    { section: 'Intelligence', items: [
      { to: '/app/ml', label: 'ML Hub', icon: '◈' },
      { to: '/app/analytics', label: 'Analytics', icon: '▦' },
    ]},
    { section: 'Utilities', items: [
      { to: '/app/reports', label: 'Reports', icon: '⬇' },
      { to: '/app/notifications', label: 'Notifications', icon: '♪' },
      { to: '/app/support', label: 'Support', icon: '✎' },
      { to: '/app/settings', label: 'Settings', icon: '⚙' },
    ]},
  ],
  Student: [
    { section: 'Overview', items: [
      { to: '/app/student', label: 'Dashboard', icon: '◧' },
    ]},
    { section: 'Utilities', items: [
      { to: '/app/reports', label: 'Reports', icon: '⬇' },
      { to: '/app/notifications', label: 'Notifications', icon: '♪' },
      { to: '/app/support', label: 'Support', icon: '✎' },
      { to: '/app/settings', label: 'Settings', icon: '⚙' },
    ]},
  ],
  Analyst: [
    { section: 'Overview', items: [
      { to: '/app/analyst', label: 'Dashboard', icon: '◧' },
    ]},
    { section: 'Big Data', items: [
      { to: '/app/spark', label: 'Spark Processing', icon: '⚡' },
    ]},
    { section: 'Intelligence', items: [
      { to: '/app/live', label: 'Real-Time View', icon: '●' },
      { to: '/app/ml', label: 'ML Hub', icon: '◈' },
      { to: '/app/analytics', label: 'Analytics', icon: '▦' },
    ]},
    { section: 'Utilities', items: [
      { to: '/app/reports', label: 'Reports', icon: '⬇' },
      { to: '/app/notifications', label: 'Notifications', icon: '♪' },
      { to: '/app/support', label: 'Support', icon: '✎' },
      { to: '/app/settings', label: 'Settings', icon: '⚙' },
    ]},
  ],
}

export const ROLE_LABEL = { Admin: 'Administrator', Teacher: 'Teacher', Student: 'Student', Analyst: 'Analyst' }
