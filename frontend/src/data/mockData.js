// Deterministic-ish mock data generation for EduPredict demo purposes.

const FIRST = ['Ayesha','Bilal','Chen','Diego','Emma','Farhan','Grace','Hassan','Ines','Jamal','Kara','Liam','Mira','Noah','Omar','Priya','Qasim','Rina','Sara','Talha','Uma','Vikram','Wei','Xena','Yusuf','Zoe','Adam','Bianca','Carlos','Dana']
const LAST = ['Khan','Reyes','Wang','Silva','Novak','Ahmed','Brown','Malik','Costa','Osei','Lee','Fischer','Iqbal','Park','Ferreira','Nair','Sheikh','Ivanova','Muller','Yousaf']
const DEPARTMENTS = [
  { id: 'CS', name: 'Computer Science', head: 'Dr. Amina Raza', courses: 14, students: 412 },
  { id: 'MATH', name: 'Mathematics', head: 'Dr. Robert Klein', courses: 9, students: 268 },
  { id: 'PHY', name: 'Physics', head: 'Dr. Wei Zhang', courses: 8, students: 190 },
  { id: 'BIO', name: 'Biology', head: 'Dr. Grace Osei', courses: 11, students: 305 },
  { id: 'ENG', name: 'English Literature', head: 'Dr. Fatima Sheikh', courses: 7, students: 220 },
  { id: 'ECO', name: 'Economics', head: 'Dr. Carlos Reyes', courses: 6, students: 176 },
]

const COURSES = [
  { code: 'CS101', name: 'Intro to Programming', dept: 'CS', teacher: 'David Cohen', credits: 4, enrolled: 88 },
  { code: 'CS204', name: 'Data Structures', dept: 'CS', teacher: 'Priya Nair', credits: 4, enrolled: 74 },
  { code: 'CS310', name: 'Machine Learning', dept: 'CS', teacher: 'David Cohen', credits: 3, enrolled: 61 },
  { code: 'MATH110', name: 'Calculus I', dept: 'MATH', teacher: 'Robert Klein', credits: 4, enrolled: 130 },
  { code: 'MATH220', name: 'Linear Algebra', dept: 'MATH', teacher: 'Robert Klein', credits: 3, enrolled: 95 },
  { code: 'PHY101', name: 'Classical Mechanics', dept: 'PHY', teacher: 'Wei Zhang', credits: 4, enrolled: 70 },
  { code: 'BIO150', name: 'Cell Biology', dept: 'BIO', teacher: 'Grace Osei', credits: 3, enrolled: 112 },
  { code: 'ENG101', name: 'Academic Writing', dept: 'ENG', teacher: 'Fatima Sheikh', credits: 2, enrolled: 140 },
  { code: 'ECO201', name: 'Microeconomics', dept: 'ECO', teacher: 'Carlos Reyes', credits: 3, enrolled: 98 },
]

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rand = seededRandom(42)
function pick(arr) { return arr[Math.floor(rand() * arr.length)] }
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min }
function round1(n) { return Math.round(n * 10) / 10 }

export function generateStudents(count = 60) {
  const students = []
  for (let i = 0; i < count; i++) {
    const dept = pick(DEPARTMENTS)
    const attendance = randInt(58, 99)
    const gpa = round1(1.8 + rand() * 2.2)
    let risk = 'low'
    if (attendance < 75 || gpa < 2.3) risk = 'high'
    else if (attendance < 85 || gpa < 2.8) risk = 'watch'
    students.push({
      id: `STU${1000 + i}`,
      name: `${pick(FIRST)} ${pick(LAST)}`,
      email: `student${1000 + i}@edupredict.edu`,
      dept: dept.id,
      grade: pick(['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']),
      attendance,
      gpa,
      risk,
      predictedDropout: risk === 'high' ? randInt(55, 92) : risk === 'watch' ? randInt(20, 54) : randInt(2, 19),
      status: pick(['active', 'active', 'active', 'inactive']),
    })
  }
  return students
}

export function generateTeachers(count = 22) {
  const teachers = []
  for (let i = 0; i < count; i++) {
    const dept = pick(DEPARTMENTS)
    teachers.push({
      id: `TCH${200 + i}`,
      name: `${pick(FIRST)} ${pick(LAST)}`,
      email: `teacher${200 + i}@edupredict.edu`,
      dept: dept.id,
      courses: randInt(1, 4),
      students: randInt(40, 160),
      rating: round1(3.4 + rand() * 1.5),
      status: pick(['active', 'active', 'on leave']),
    })
  }
  return teachers
}

export const departments = DEPARTMENTS
export const courses = COURSES

export function attendanceTrend() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  let base = 88
  return months.map((m) => {
    base = Math.max(80, Math.min(96, base + randInt(-3, 3)))
    return { label: m, value: base }
  })
}

export function testScoresByGrade() {
  return [
    { label: 'Grade 9', value: 78 },
    { label: 'Grade 10', value: 82 },
    { label: 'Grade 11', value: 85 },
    { label: 'Grade 12', value: 88 },
  ]
}

export function enrollmentTrend() {
  return [
    { label: '2021', value: 1500 },
    { label: '2022', value: 1650 },
    { label: '2023', value: 1800 },
    { label: '2024', value: 1950 },
    { label: '2025', value: 2100 },
    { label: '2026', value: 2260 },
  ]
}

export function riskDonut() {
  return [
    { label: 'Low risk', value: 68, color: '#3fb8a8' },
    { label: 'Watch', value: 24, color: '#d98e3f' },
    { label: 'High risk', value: 8, color: '#dc4b4b' },
  ]
}

export function departmentGpaBars() {
  return DEPARTMENTS.map((d) => ({ label: d.id, value: round1(2.6 + rand() * 1.2) }))
}

export function scatterAttendanceGpa(n = 45) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const attendance = randInt(55, 99)
    const gpa = round1(Math.min(4, Math.max(1, (attendance / 100) * 3.6 + (rand() - 0.5) * 1.1)))
    pts.push({ x: attendance, y: gpa })
  }
  return pts
}

export function heatmapData() {
  const days = ['Mon','Tue','Wed','Thu','Fri']
  const weeks = ['W1','W2','W3','W4','W5','W6']
  const grid = []
  weeks.forEach((w) => {
    days.forEach((d) => {
      grid.push({ week: w, day: d, value: randInt(60, 100) })
    })
  })
  return { days, weeks, grid }
}

export function notifications() {
  return [
    { id: 1, type: 'critical', title: 'Dropout risk spike — Grade 11', body: '7 students crossed the high-risk threshold this week in Grade 11 Physics.', time: '12m ago', read: false },
    { id: 2, type: 'warning', title: 'Attendance dip — CS204', body: 'Section attendance fell to 79% over the last 2 weeks.', time: '48m ago', read: false },
    { id: 3, type: 'success', title: 'Spark job completed', body: 'dropout_predict_v3 finished processing 184,203 records in 6m 12s.', time: '1h ago', read: false },
    { id: 4, type: 'info', title: 'New dataset ingested', body: 'attendance_q3_2026.csv (14.2 MB) imported successfully, 0 errors.', time: '3h ago', read: true },
    { id: 5, type: 'warning', title: 'HDFS storage at 78%', body: 'Consider archiving datasets older than 18 months.', time: '5h ago', read: true },
    { id: 6, type: 'success', title: 'Model accuracy improved', body: 'Student performance model refreshed — accuracy up from 85.1% to 87.4%.', time: 'Yesterday', read: true },
    { id: 7, type: 'critical', title: 'Anomaly detected', body: 'Unusual grade-submission pattern flagged in Course ECO201.', time: 'Yesterday', read: true },
    { id: 8, type: 'info', title: 'New teacher onboarded', body: 'Priya Nair added to Computer Science department.', time: '2 days ago', read: true },
  ]
}

export function recentActivity() {
  return [
    { id: 1, actor: 'System', action: 'flagged 3 new students as high-risk in Grade 10', time: '8m ago' },
    { id: 2, actor: 'David Cohen', action: 'submitted grades for CS310 midterm', time: '35m ago' },
    { id: 3, actor: 'Admin', action: 'added a new course: Advanced Algorithms (CS410)', time: '1h ago' },
    { id: 4, actor: 'Spark Engine', action: 'completed batch job attendance_normalize', time: '2h ago' },
    { id: 5, actor: 'Priya Nair', action: 'exported analytics report for Q3 review', time: '4h ago' },
    { id: 6, actor: 'System', action: 'ingested lms_activity_aug.json (9.8 MB)', time: '6h ago' },
  ]
}

export function uploadHistory() {
  return [
    { id: 1, file: 'attendance_q3_2026.csv', type: 'CSV', size: '14.2 MB', status: 'success', rows: 18420, errors: 0, time: '3h ago' },
    { id: 2, file: 'lms_activity_aug.json', type: 'JSON', size: '9.8 MB', status: 'success', rows: 12980, errors: 0, time: '6h ago' },
    { id: 3, file: 'grades_midterm.xlsx', type: 'Excel', size: '3.1 MB', status: 'warning', rows: 2210, errors: 14, time: '1 day ago' },
    { id: 4, file: 'student_master_2026.csv', type: 'CSV', size: '22.7 MB', status: 'success', rows: 26310, errors: 0, time: '2 days ago' },
    { id: 5, file: 'teacher_roster.xlsx', type: 'Excel', size: '1.4 MB', status: 'failed', rows: 0, errors: 220, time: '3 days ago' },
  ]
}

export function hdfsFiles() {
  return [
    { name: '/edupredict/raw/attendance/', type: 'dir', size: '4.2 GB', files: 342, modified: '3h ago' },
    { name: '/edupredict/raw/lms_events/', type: 'dir', size: '9.8 GB', files: 1204, modified: '6h ago' },
    { name: '/edupredict/raw/grades/', type: 'dir', size: '2.1 GB', files: 188, modified: '1 day ago' },
    { name: '/edupredict/processed/features_v3.parquet', type: 'file', size: '640 MB', files: null, modified: '2h ago' },
    { name: '/edupredict/processed/dropout_scores.parquet', type: 'file', size: '112 MB', files: null, modified: '6h ago' },
    { name: '/edupredict/archive/2024/', type: 'dir', size: '18.4 GB', files: 2890, modified: '3 months ago' },
    { name: '/edupredict/models/dropout_predict_v3.pkl', type: 'file', size: '48 MB', files: null, modified: '1 day ago' },
  ]
}

export function sparkJobsRunning() {
  return [
    { id: 'JOB-2291', name: 'dropout_predict_v3', stage: '4/6 · feature scoring', progress: 68, started: '6m ago', executor: '12 cores · 24GB' },
    { id: 'JOB-2292', name: 'attendance_aggregate_daily', stage: '2/3 · groupBy reduce', progress: 41, started: '3m ago', executor: '8 cores · 16GB' },
  ]
}

export function sparkJobsCompleted() {
  return [
    { id: 'JOB-2287', name: 'lms_activity_normalize', duration: '4m 02s', rows: '1.2M', status: 'success', time: '2h ago' },
    { id: 'JOB-2285', name: 'course_demand_forecast', duration: '11m 40s', rows: '340K', status: 'success', time: '5h ago' },
    { id: 'JOB-2280', name: 'grade_anomaly_scan', duration: '2m 18s', rows: '2.1M', status: 'failed', time: '1 day ago' },
    { id: 'JOB-2278', name: 'gpa_recompute_batch', duration: '7m 55s', rows: '890K', status: 'success', time: '1 day ago' },
  ]
}

export function sparkLogLines() {
  return [
    '[INFO] SparkContext: Running Spark version 3.5.1',
    '[INFO] DAGScheduler: Job 2291 submitted with 6 stages',
    '[INFO] TaskSetManager: Starting task 0.0 in stage 3.0 (executor 4)',
    '[INFO] BlockManager: Registering executor with 24.0 GB RAM',
    '[WARN] MemoryStore: Not enough space to cache broadcast_112, dropping to disk',
    '[INFO] TaskSetManager: Finished task 14.0 in stage 3.0 (98 ms)',
    '[INFO] DAGScheduler: Stage 3 (mapPartitions) finished in 3.4 s',
    '[INFO] ShuffleMapStage 4: writing 128 partitions',
    '[INFO] ML: RandomForestClassifier fit iteration 40/100',
    '[INFO] ML: model AUC on validation fold = 0.891',
  ]
}

export function mlModels() {
  return [
    { id: 'M1', name: 'Student Performance Prediction', type: 'Regression (GBM)', accuracy: 87.4, lastRun: '2h ago', status: 'healthy' },
    { id: 'M2', name: 'Dropout Prediction', type: 'Classification (Random Forest)', accuracy: 91.2, lastRun: '6h ago', status: 'healthy' },
    { id: 'M3', name: 'Course Demand Forecast', type: 'Time-series (Prophet)', accuracy: 82.6, lastRun: '5h ago', status: 'degraded' },
    { id: 'M4', name: 'Anomaly Detection', type: 'Isolation Forest', accuracy: 88.9, lastRun: '1 day ago', status: 'healthy' },
  ]
}

export function predictionsFeed() {
  const risk = (p) => (p > 70 ? 'high' : p > 40 ? 'medium' : 'low')
  const items = []
  for (let i = 0; i < 10; i++) {
    const p = randInt(8, 96)
    items.push({
      id: i,
      student: `${pick(FIRST)} ${pick(LAST)}`,
      model: pick(['Dropout Prediction', 'Student Performance Prediction', 'Anomaly Detection']),
      confidence: p,
      risk: risk(p),
      note: pick([
        'Attendance dropped 18% over 3 weeks',
        'Assignment submission rate below cohort average',
        'GPA trending down for 2 consecutive terms',
        'Irregular LMS login pattern detected',
        'Test scores 1.4 std. dev. below cohort mean',
      ]),
    })
  }
  return items.sort((a, b) => b.confidence - a.confidence)
}

export function liveActivityFeed() {
  const actions = ['logged into LMS', 'submitted an assignment', 'marked present', 'viewed lecture notes', 'started a quiz', 'posted in discussion forum', 'marked absent', 'downloaded course material']
  const items = []
  for (let i = 0; i < 14; i++) {
    items.push({
      id: i,
      student: `${pick(FIRST)} ${pick(LAST)}`,
      action: pick(actions),
      course: pick(COURSES).code,
      time: `${randInt(1, 59)}s ago`,
    })
  }
  return items
}

export function assignments() {
  return [
    { id: 1, title: 'Problem Set 4 — Recursion', course: 'CS204', due: 'Aug 6, 2026', submitted: 58, total: 74, status: 'open' },
    { id: 2, title: 'Midterm Essay Draft', course: 'ENG101', due: 'Aug 9, 2026', submitted: 112, total: 140, status: 'open' },
    { id: 3, title: 'Lab Report — Cell Division', course: 'BIO150', due: 'Jul 30, 2026', submitted: 108, total: 112, status: 'closed' },
    { id: 4, title: 'ML Project Proposal', course: 'CS310', due: 'Aug 12, 2026', submitted: 22, total: 61, status: 'open' },
  ]
}

export function kpiTicker() {
  return [
    { label: 'Records processed today', value: '200' },
    { label: 'Students flagged — watch', value: '37' },
    { label: 'Students flagged — high risk', value: '12' },
    { label: 'Model accuracy (last refresh)', value: '87.4%' },
  ]
}
