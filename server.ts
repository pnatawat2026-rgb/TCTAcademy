import express from 'express';
import path from 'path';
import fs from 'fs';
import { MASTER_EMPLOYEE_ROSTER_230 } from './src/data/employeeDatabase.ts';
import { APPLIED_PSYCHOLOGY_INITIAL_TRAINEES } from './src/data/appliedPsychologyCourseData.ts';

const app = express();
// Port 3000 is required by the environment; 8080 is reserved by the container proxy sidecar
const PORT = (process.env.PORT && process.env.PORT !== '8080') ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Path for server-side persistent database
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data dir', e);
  }
}

interface ServerActivityLog {
  id: string;
  timestamp: string;
  empId: string;
  fullName: string;
  department: string;
  action: string;
  detail: string;
  score?: number;
}

interface ServerDatabase {
  trainees: Record<string, any>;
  activities: ServerActivityLog[];
  trainingLogs?: any[];
  locationCheckIns?: any[];
  kirkpatrickEvaluations?: any[];
  lastUpdated: string;
}

function buildDefaultDatabase(): ServerDatabase {
  const defaultTrainees: Record<string, any> = {};

  // 1. Populate all official employees in the company roster
  for (const emp of MASTER_EMPLOYEE_ROSTER_230) {
    const cleanId = emp.empId.trim().toUpperCase();
    defaultTrainees[cleanId] = {
      id: `emp-${cleanId}`,
      empId: cleanId,
      prefix: emp.prefix,
      fullName: emp.fullName,
      department: emp.department,
      position: emp.position,
      enrolledAt: '2026-10-12',
      status: 'not_started',
      preTestScore: null,
      postTestScore: null,
      postTestAttempts: 0,
      miniGameScore: 0,
      completedModules: [],
      evaluationSubmitted: false,
      selectedCourseId: 'applied-psychology',
      enrolledCourses: ['applied-psychology'],
      currentStep: 'ลงทะเบียนเข้าเรียนรอบที่ 1 แล้ว (รอเริ่มเรียน 12-16 ต.ค. 2569)',
      coursesProgress: {
        'applied-psychology': {
          preTestScore: null,
          postTestScore: null,
          postTestAttempts: 0,
          miniGameScore: 0,
          completedModules: [],
          evaluationSubmitted: false,
          lastActiveStep: 'ลงทะเบียนเข้าเรียนรอบที่ 1 แล้ว (รอเริ่มเรียน 12-16 ต.ค. 2569)'
        }
      }
    };
  }

  // 2. Overlay authentic trainees who took the exam starting 12 Oct 2569
  for (const psyTr of APPLIED_PSYCHOLOGY_INITIAL_TRAINEES) {
    const cleanId = psyTr.empId.trim().toUpperCase();
    defaultTrainees[cleanId] = {
      ...(defaultTrainees[cleanId] || {}),
      ...psyTr,
      empId: cleanId
    };
  }

  return {
    trainees: defaultTrainees,
    activities: [
      {
        id: 'act-25056-oct12-pretest',
        timestamp: '12/10/2569 09:15:22',
        empId: '25056',
        fullName: 'นาย ณฐวัตร พงษ์สาริกิจ',
        department: 'PS',
        action: 'pretest',
        detail: 'นาย ณฐวัตร พงษ์สาริกิจ (หน.แผนกบุคคลและธุรการ/หน.ศูนย์) ทำแบบทดสอบก่อนเรียน จิตวิทยาประยุกต์ ได้ 10/10 คะแนน',
        score: 10
      },
      {
        id: 'act-25056-oct13-cert',
        timestamp: '13/10/2569 11:30:00',
        empId: '25056',
        fullName: 'นาย ณฐวัตร พงษ์สาริกิจ',
        department: 'PS',
        action: 'cert_issued',
        detail: 'นาย ณฐวัตร พงษ์สาริกิจ สำเร็จการอบรมหลักสูตรจิตวิทยาประยุกต์ (TCT-PSY-01) และได้รับวุฒิบัตร TCT-PSY-2026-25056-001',
        score: 10
      }
    ],
    locationCheckIns: [
      {
        id: 'chk-srv-01',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        displayTime: new Date(Date.now() - 1000 * 60 * 20).toLocaleString('th-TH'),
        empId: '003290',
        fullName: 'นาย กิตติศักดิ์ ชัยชนะ',
        department: 'P',
        position: 'OPERATOR',
        courseId: 'good-employee-skills',
        courseTitle: 'ทักษะการเป็นพนักงานที่ดี',
        lat: 14.338112,
        lng: 100.627932,
        accuracyMeters: 3,
        distanceKm: 0.012,
        distanceMeters: 12,
        isWithinGeofence: true,
        status: 'verified_onsite',
        statusLabelTh: 'ยืนยันพิกัดในโรงงาน (< 1.0 กม.)',
        deviceInfo: 'Android Mobile • Chrome',
        notes: 'เช็คอินเข้าอบรม กะเช้า (Morning Shift)',
        qrHash: 'TCT-003290-SHIFT-M'
      },
      {
        id: 'chk-srv-02',
        timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        displayTime: new Date(Date.now() - 1000 * 60 * 55).toLocaleString('th-TH'),
        empId: '25056',
        fullName: 'นาย ณฐวัตร พงษ์สาริกิจ',
        department: 'PS',
        position: 'SUPERVISOR',
        courseId: 'applied-psychology',
        courseTitle: 'จิตวิทยาประยุกต์ในการทำงาน',
        lat: 14.3380539,
        lng: 100.6279692,
        accuracyMeters: 2,
        distanceKm: 0.0,
        distanceMeters: 0,
        isWithinGeofence: true,
        status: 'verified_onsite',
        statusLabelTh: 'ยืนยันพิกัดในโรงงาน (< 1.0 กม.)',
        deviceInfo: 'Desktop Workstation • Chrome',
        notes: 'อาคารบริหาร แผนกบุคคลและธุรการ',
        qrHash: 'TCT-25056-HEAD-PS'
      }
    ],
    lastUpdated: new Date().toISOString()
  };
}

function loadDatabase(): ServerDatabase {
  let loadedDb: ServerDatabase | null = null;
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.trainees && typeof data.trainees === 'object') {
        loadedDb = data;
      }
    }
  } catch (e) {
    console.error('Error loading database file', e);
  }

  const defaultDb = buildDefaultDatabase();
  if (!loadedDb) {
    saveDatabase(defaultDb);
    return defaultDb;
  }

  // Ensure locationCheckIns is array
  if (!Array.isArray(loadedDb.locationCheckIns)) {
    loadedDb.locationCheckIns = defaultDb.locationCheckIns || [];
  }

  // Set of authentic October 12 participants
  const authenticIds = new Set(APPLIED_PSYCHOLOGY_INITIAL_TRAINEES.map(t => t.empId.trim().toUpperCase()));
  const mergedTrainees: Record<string, any> = { ...defaultDb.trainees };

  for (const [id, t] of Object.entries(loadedDb.trainees)) {
    const cleanId = id.trim().toUpperCase();
    const item = t as any;

    // Check if authentic, has scores, has modules, is passed/in_progress, or was registered by an employee
    const isAuthentic = authenticIds.has(cleanId);
    let hasCpScores = false;
    if (item.coursesProgress && typeof item.coursesProgress === 'object') {
      for (const cp of Object.values(item.coursesProgress) as any[]) {
        if (
          (cp.preTestScore !== null && cp.preTestScore !== undefined) ||
          (cp.postTestScore !== null && cp.postTestScore !== undefined) ||
          (Array.isArray(cp.completedModules) && cp.completedModules.length > 0) ||
          Boolean(cp.certificateId) ||
          cp.evaluationSubmitted
        ) {
          hasCpScores = true;
          break;
        }
      }
    }

    const hasScores = (item.preTestScore !== null && item.preTestScore !== undefined) ||
                      (item.postTestScore !== null && item.postTestScore !== undefined) ||
                      (Array.isArray(item.completedModules) && item.completedModules.length > 0) ||
                      Boolean(item.certificateId) ||
                      item.status === 'passed' ||
                      item.status === 'in_progress' ||
                      hasCpScores;
    const isRegistered = item.id?.startsWith('reg-') || item.id?.startsWith('custom-');

    // Retain all official employees in the company roster
    // (Do not drop not_started employees so the complete roster of 224 employees is always accessible)

    const def = mergedTrainees[cleanId] || {};
    const existingCp = item.coursesProgress || {};
    const defCp = def.coursesProgress || {};

    mergedTrainees[cleanId] = {
      ...def,
      ...item,
      // Retain authentic scores and real progress
      preTestScore: item.preTestScore !== null && item.preTestScore !== undefined ? item.preTestScore : (def.preTestScore ?? null),
      postTestScore: item.postTestScore !== null && item.postTestScore !== undefined ? item.postTestScore : (def.postTestScore ?? null),
      completedModules: Array.from(new Set([...(def.completedModules || []), ...(item.completedModules || [])])),
      certificateId: item.certificateId || def.certificateId,
      certificateDate: item.certificateDate || def.certificateDate,
      coursesProgress: {
        ...defCp,
        ...existingCp
      }
    };
  }

  const mergedDb: ServerDatabase = {
    trainees: mergedTrainees,
    activities: loadedDb.activities && loadedDb.activities.length > 0 ? loadedDb.activities : defaultDb.activities,
    trainingLogs: loadedDb.trainingLogs || [],
    locationCheckIns: loadedDb.locationCheckIns || defaultDb.locationCheckIns || [],
    kirkpatrickEvaluations: loadedDb.kirkpatrickEvaluations || defaultDb.kirkpatrickEvaluations || [],
    lastUpdated: new Date().toISOString()
  };

  saveDatabase(mergedDb);
  return mergedDb;
}

function saveDatabase(db: ServerDatabase) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save database file', e);
  }
}

let db = loadDatabase();

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Anti-caching middleware for HTML navigation and Service Worker scripts
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html' || req.path === '/sw.js' || req.path === '/manifest.json') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Version check endpoint for auto-updater
app.get('/api/version', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.json({
    version: '2026.10.22-v3-realtime',
    name: 'TCT E-Training',
    features: ['1km-geofence', '10char-password-rule', 'continuous-modal-flow', 'realtime-sync'],
    timestamp: new Date().toISOString()
  });
});

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    totalTrainees: Object.keys(db.trainees).length, 
    lastUpdated: db.lastUpdated 
  });
});

// Serve assets statically
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

// 2. GET all trainees (with consolidated ranking and attempts)
app.get('/api/trainees', (req, res) => {
  const courseId = req.query.courseId as string | undefined;
  let list = Object.values(db.trainees);

  // If filtered by specific course, return trainees who are enrolled or have performed in that course
  if (courseId && courseId !== 'all') {
    list = list.filter((t: any) => {
      if (t.selectedCourseId === courseId || (Array.isArray(t.enrolledCourses) && t.enrolledCourses.includes(courseId))) {
        return true;
      }
      const cp = t.coursesProgress?.[courseId];
      if (cp) {
        return (
          (cp.preTestScore !== null && cp.preTestScore !== undefined) ||
          (cp.completedModules && cp.completedModules.length > 0) ||
          (cp.postTestScore !== null && cp.postTestScore !== undefined) ||
          cp.evaluationSubmitted ||
          Boolean(cp.certificateId)
        );
      }
      return false;
    });
  }

  // Resolve course-specific progress attributes to prevent cross-course score pollution
  const mappedList = list.map((t: any) => {
    if (courseId && courseId !== 'all') {
      const cp = t.coursesProgress?.[courseId] || {};
      const passingScore = courseId === 'personality-psychology' ? 15 : 8;
      const isPassed = cp.postTestScore !== null && cp.postTestScore !== undefined && cp.postTestScore >= passingScore;
      const isStarted = (cp.preTestScore !== null && cp.preTestScore !== undefined) || (cp.completedModules && cp.completedModules.length > 0) || cp.postTestScore !== null;
      return {
        ...t,
        preTestScore: cp.preTestScore ?? null,
        postTestScore: cp.postTestScore ?? null,
        postTestAttempts: cp.postTestAttempts || (cp.postTestScore !== null ? 1 : 0),
        miniGameScore: cp.miniGameScore || 0,
        completedModules: cp.completedModules || [],
        status: isPassed ? 'passed' : isStarted ? 'in_progress' : 'not_started',
        certificateId: cp.certificateId || undefined,
        certificateDate: cp.certificateDate || undefined,
        evaluationSubmitted: Boolean(cp.evaluationSubmitted),
        currentStep: cp.lastActiveStep || t.currentStep,
        selectedCourseId: courseId
      };
    }
    // When viewing all courses, ensure scores from any completed course are clearly represented
    if (!courseId || courseId === 'all') {
      let bestCp: any = null;
      if (t.coursesProgress && typeof t.coursesProgress === 'object') {
        for (const cp of Object.values(t.coursesProgress) as any[]) {
          if (cp && (cp.postTestScore !== null || cp.preTestScore !== null || (Array.isArray(cp.completedModules) && cp.completedModules.length > 0))) {
            if (!bestCp || (cp.postTestScore ?? -1) > (bestCp.postTestScore ?? -1)) {
              bestCp = cp;
            }
          }
        }
      }
      if (bestCp) {
        const isPassed = (t.postTestScore !== null && t.postTestScore >= 8) || (bestCp.postTestScore !== null && bestCp.postTestScore >= 8);
        return {
          ...t,
          preTestScore: t.preTestScore !== null && t.preTestScore !== undefined ? t.preTestScore : (bestCp.preTestScore ?? null),
          postTestScore: t.postTestScore !== null && t.postTestScore !== undefined ? t.postTestScore : (bestCp.postTestScore ?? null),
          completedModules: Array.isArray(t.completedModules) && t.completedModules.length > 0 ? t.completedModules : (bestCp.completedModules || []),
          status: isPassed ? 'passed' : (t.status === 'passed' ? 'passed' : 'in_progress'),
          certificateId: t.certificateId || bestCp.certificateId,
          certificateDate: t.certificateDate || bestCp.certificateDate,
          currentStep: t.currentStep || bestCp.lastActiveStep
        };
      }
    }
    return t;
  });
  
  // Calculate rankings
  // Passed trainees with highest post test score and fewer attempts rank highest
  const sorted = [...mappedList].sort((a: any, b: any) => {
    // 1. Passed vs in_progress vs not_started
    const statusWeight = (s: string) => s === 'passed' ? 3 : s === 'in_progress' ? 2 : 1;
    if (statusWeight(b.status) !== statusWeight(a.status)) {
      return statusWeight(b.status) - statusWeight(a.status);
    }
    // 2. Post-test score
    const postB = b.postTestScore ?? -1;
    const postA = a.postTestScore ?? -1;
    if (postB !== postA) return postB - postA;

    // 3. Mini game score
    const gameB = b.miniGameScore || 0;
    const gameA = a.miniGameScore || 0;
    if (gameB !== gameA) return gameB - gameA;

    // 4. Pre-test score
    const preB = b.preTestScore ?? -1;
    const preA = a.preTestScore ?? -1;
    if (preB !== preA) return preB - preA;

    return 0;
  });

  const ranked = sorted.map((t: any, index: number) => ({
    ...t,
    examRank: index + 1
  }));

  res.json({
    success: true,
    trainees: ranked,
    totalCount: ranked.length,
    passedCount: ranked.filter((t: any) => t.status === 'passed').length,
    inProgressCount: ranked.filter((t: any) => t.status === 'in_progress').length,
    notStartedCount: ranked.filter((t: any) => t.status === 'not_started').length,
    lastUpdated: db.lastUpdated
  });
});

// 2.5 GET /api/master-employees - Official Master Employees Directory (224 employees)
app.get('/api/master-employees', (req, res) => {
  res.json({
    success: true,
    count: MASTER_EMPLOYEE_ROSTER_230.length,
    employees: MASTER_EMPLOYEE_ROSTER_230,
    lastUpdated: db.lastUpdated
  });
});

// 2.6 POST /api/master-employees - Update or add master employee in server database
app.post('/api/master-employees', (req, res) => {
  const { employee } = req.body;
  if (!employee || !employee.empId) {
    return res.status(400).json({ error: 'Missing employee object or empId' });
  }

  const cleanId = String(employee.empId).trim().toUpperCase();
  const existing = db.trainees[cleanId] || {};

  db.trainees[cleanId] = {
    ...existing,
    empId: cleanId,
    fullName: employee.fullName || `${employee.prefix || 'นาย'} ${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
    prefix: employee.prefix || existing.prefix || 'นาย',
    department: employee.department || existing.department || 'P',
    division: employee.division || existing.division || 'P',
    position: employee.position || existing.position || 'WORKER',
    yearsOfService: employee.yearsOfService || employee.tenure || existing.yearsOfService || '1 ปี',
    isMasterRecord: true
  };

  db.lastUpdated = new Date().toISOString();
  saveDatabase(db);

  res.json({
    success: true,
    message: `Master employee ${cleanId} saved successfully`,
    employee: db.trainees[cleanId]
  });
});

// 3. POST /api/trainees/sync - Sync single user progress across devices in real-time
app.post('/api/trainees/sync', (req, res) => {
  const { user, activityType, detail } = req.body;
  if (!user || !user.empId) {
    return res.status(400).json({ error: 'Missing user profile or empId' });
  }

  const cleanId = String(user.empId).trim().toUpperCase();
  const existing = db.trainees[cleanId] || {};

  // Merge completed modules
  const mergedCompletedModules = Array.from(
    new Set([...(existing.completedModules || []), ...(user.completedModules || [])])
  );

  // Highest scores retained
  const preScore = user.preTestScore !== null && user.preTestScore !== undefined 
    ? (existing.preTestScore !== null && existing.preTestScore !== undefined ? Math.max(existing.preTestScore, user.preTestScore) : user.preTestScore)
    : (existing.preTestScore ?? null);

  const postScore = user.postTestScore !== null && user.postTestScore !== undefined
    ? (existing.postTestScore !== null && existing.postTestScore !== undefined ? Math.max(existing.postTestScore, user.postTestScore) : user.postTestScore)
    : (existing.postTestScore ?? null);

  const attemptsCount = Math.max(existing.postTestAttempts || 0, user.postTestAttempts || 0);
  const miniGameScore = Math.max(existing.miniGameScore || 0, user.miniGameScore || 0);

  // Calculate status and human-readable current step
  const isPassed = postScore !== null && postScore >= 8;
  const isStarted = preScore !== null || mergedCompletedModules.length > 0;
  const status = isPassed ? 'passed' : isStarted ? 'in_progress' : 'not_started';

  let currentStep = 'ยังไม่เริ่มเรียน';
  if (isPassed) {
    currentStep = `สอบผ่านแล้ว (${postScore}/10)`;
  } else if (user.postTestScore !== null && user.postTestScore < 8) {
    currentStep = `ทำ Post-test ไม่ผ่าน (${user.postTestScore}/10) รอสอบแก้ตัว`;
  } else if (mergedCompletedModules.length === 4) {
    currentStep = 'เล่น Mini-Game / รอสอบ Post-test';
  } else if (mergedCompletedModules.length > 0) {
    const nextMod = mergedCompletedModules.length + 1;
    currentStep = `กำลังเรียนบทที่ ${nextMod} (ผ่านแล้ว ${mergedCompletedModules.length}/4 บท)`;
  } else if (preScore !== null) {
    currentStep = `ทำ Pre-test แล้ว (${preScore}/10) กำลังเข้าสู่บทที่ 1`;
  }

  // Update attempts history
  const attemptsHistory = existing.attemptsHistory || [];
  if (activityType) {
    const newAttempt = {
      attemptNumber: attemptsHistory.length + 1,
      type: activityType,
      score: activityType === 'pretest' ? user.preTestScore : activityType === 'posttest' ? user.postTestScore : miniGameScore,
      passed: isPassed,
      timestamp: new Date().toLocaleString('th-TH'),
      detail: detail || ''
    };
    attemptsHistory.unshift(newAttempt);
  }

  // Deeply merge coursesProgress across all courses
  const mergedCoursesProgress: Record<string, any> = {
    ...(existing.coursesProgress || {})
  };
  if (user.coursesProgress && typeof user.coursesProgress === 'object') {
    for (const [cId, cp] of Object.entries(user.coursesProgress)) {
      mergedCoursesProgress[cId] = {
        ...(mergedCoursesProgress[cId] || {}),
        ...(cp as any)
      };
    }
  }

  // Active selected course
  const activeCourseId = user.selectedCourseId || existing.selectedCourseId || 'ai-for-tct';

  // Ensure active course progress contains the current activity data
  if (activeCourseId) {
    const existingCp = mergedCoursesProgress[activeCourseId] || {};
    const passedThreshold = activeCourseId === 'personality-psychology' ? 15 : 8;
    const cpPreScore = user.coursesProgress?.[activeCourseId]?.preTestScore !== undefined
      ? user.coursesProgress[activeCourseId].preTestScore
      : (activityType === 'pretest' ? user.preTestScore : existingCp.preTestScore ?? (activeCourseId === user.selectedCourseId ? user.preTestScore : null));
    const cpPostScore = user.coursesProgress?.[activeCourseId]?.postTestScore !== undefined
      ? user.coursesProgress[activeCourseId].postTestScore
      : (activityType === 'posttest' ? user.postTestScore : existingCp.postTestScore ?? (activeCourseId === user.selectedCourseId ? user.postTestScore : null));
    const cpCompletedModules = Array.from(new Set([
      ...(existingCp.completedModules || []),
      ...(user.coursesProgress?.[activeCourseId]?.completedModules || []),
      ...(activeCourseId === user.selectedCourseId ? (user.completedModules || []) : [])
    ]));
    const cpPassed = cpPostScore !== null && cpPostScore !== undefined && cpPostScore >= passedThreshold;
    const cpStarted = cpPreScore !== null || cpCompletedModules.length > 0;
    const cpStatus = cpPassed ? 'passed' : cpStarted ? 'in_progress' : 'not_started';

    mergedCoursesProgress[activeCourseId] = {
      ...existingCp,
      ...(user.coursesProgress?.[activeCourseId] || {}),
      preTestScore: cpPreScore,
      postTestScore: cpPostScore,
      completedModules: cpCompletedModules,
      status: cpStatus,
      certificateId: user.certificateId || existingCp.certificateId,
      certificateDate: user.certificateDate || existingCp.certificateDate,
      evaluationSubmitted: Boolean(user.evaluationSubmitted || existingCp.evaluationSubmitted),
      lastActiveStep: user.lastActiveStep || existingCp.lastActiveStep || currentStep
    };
  }

  // Merge enrolled courses
  const enrolledSet = new Set<string>([
    ...(existing.enrolledCourses || []),
    ...(user.enrolledCourses || [])
  ]);
  if (activeCourseId) enrolledSet.add(activeCourseId);
  for (const cId of Object.keys(mergedCoursesProgress)) {
    enrolledSet.add(cId);
  }
  const enrolledCourses = Array.from(enrolledSet);

  const updatedRecord = {
    ...existing,
    id: existing.id || `official-${cleanId}`,
    empId: cleanId,
    fullName: user.fullName || existing.fullName || cleanId,
    department: user.department || existing.department || 'P',
    position: user.position || existing.position || 'SUPERVISOR',
    enrolledAt: existing.enrolledAt || user.enrolledAt || new Date().toISOString().split('T')[0],
    completedAt: isPassed ? (user.certificateDate || existing.completedAt || new Date().toLocaleDateString('th-TH')) : undefined,
    status,
    preTestScore: preScore,
    postTestScore: postScore,
    postTestAttempts: attemptsCount,
    miniGameScore,
    completedModules: mergedCompletedModules,
    evaluationSubmitted: Boolean(user.evaluationSubmitted || existing.evaluationSubmitted),
    satisfactionScore: user.evaluationAnswers?.overallSatisfaction || existing.satisfactionScore || (isPassed ? 5 : undefined),
    certificateId: user.certificateId || existing.certificateId,
    certificateDate: user.certificateDate || existing.certificateDate,
    selectedCourseId: activeCourseId,
    enrolledCourses,
    coursesProgress: mergedCoursesProgress,
    lastActiveView: user.lastActiveView || existing.lastActiveView,
    lastActiveStep: user.lastActiveStep || currentStep,
    lastActiveModuleId: user.lastActiveModuleId || existing.lastActiveModuleId,
    lastActivityAt: new Date().toISOString(),
    currentStep: user.lastActiveStep || currentStep,
    attemptsHistory: attemptsHistory.slice(0, 50)
  };

  db.trainees[cleanId] = updatedRecord;

  // Add to Activity Stream
  if (activityType || detail) {
    const activityEntry: ServerActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleString('th-TH'),
      empId: cleanId,
      fullName: updatedRecord.fullName,
      department: updatedRecord.department,
      action: activityType || 'progress_sync',
      detail: detail || `${updatedRecord.fullName} อัปเดตสถานะ: ${currentStep}`,
      score: activityType === 'pretest' ? preScore : activityType === 'posttest' ? postScore : undefined
    };
    db.activities.unshift(activityEntry);
    db.activities = db.activities.slice(0, 100); // keep latest 100
  }

  saveDatabase(db);

  res.json({
    success: true,
    trainee: updatedRecord,
    lastUpdated: db.lastUpdated
  });
});

// 3.1 GET /api/trainees/:empId - Get single trainee's live state
app.get('/api/trainees/:empId', (req, res) => {
  const { empId } = req.params;
  const cleanId = String(empId).trim().toUpperCase();
  const trainee = db.trainees[cleanId];
  if (!trainee) {
    return res.status(404).json({ error: 'Trainee not found', empId: cleanId });
  }
  res.json({ success: true, trainee });
});

// 3.2 POST /api/trainees/enroll - Enroll employees into a specific course
app.post('/api/trainees/enroll', (req, res) => {
  const { courseId, employees, empIds } = req.body;
  if (!courseId) {
    return res.status(400).json({ error: 'Missing courseId' });
  }

  const targetCourse = String(courseId).trim();
  let updatedCount = 0;

  // Process array of employee objects or array of IDs
  const itemsToEnroll: any[] = Array.isArray(employees) && employees.length > 0 
    ? employees 
    : (Array.isArray(empIds) ? empIds.map((id: string) => ({ empId: id })) : []);

  itemsToEnroll.forEach((item: any) => {
    const rawId = item.empId || item.id;
    if (!rawId) return;
    const cleanId = String(rawId).trim().toUpperCase();
    const cleanPadded = cleanId.length < 5 && /^\d+$/.test(cleanId) ? cleanId.padStart(5, '0') : cleanId;

    // Check if in database or master roster
    let existing = db.trainees[cleanId] || db.trainees[cleanPadded];
    if (!existing) {
      const fromMaster = MASTER_EMPLOYEE_ROSTER_230.find(m => m.empId.toUpperCase() === cleanId || m.empId.toUpperCase() === cleanPadded);
      existing = {
        id: `emp-${cleanPadded}`,
        empId: cleanPadded,
        prefix: item.prefix || fromMaster?.prefix || 'นาย',
        fullName: item.fullName || fromMaster?.fullName || cleanPadded,
        department: item.department || fromMaster?.department || 'P',
        position: item.position || fromMaster?.position || 'พนักงาน',
        division: item.division || 'ฝ่ายผลิต',
        enrolledAt: new Date().toLocaleDateString('th-TH'),
        status: 'not_started',
        preTestScore: null,
        postTestScore: null,
        postTestAttempts: 0,
        miniGameScore: 0,
        completedModules: [],
        evaluationSubmitted: false,
        selectedCourseId: targetCourse,
        enrolledCourses: [targetCourse],
        currentStep: 'ลงทะเบียนเข้าเรียนแล้ว (รอเริ่มเรียน)',
        coursesProgress: {}
      };
    }

    // Ensure enrolledCourses contains targetCourse
    const enrolledSet = new Set(existing.enrolledCourses || []);
    enrolledSet.add(targetCourse);
    existing.enrolledCourses = Array.from(enrolledSet);

    if (!existing.coursesProgress) {
      existing.coursesProgress = {};
    }
    if (!existing.coursesProgress[targetCourse]) {
      existing.coursesProgress[targetCourse] = {
        preTestScore: null,
        postTestScore: null,
        postTestAttempts: 0,
        miniGameScore: 0,
        completedModules: [],
        evaluationSubmitted: false,
        lastActiveStep: 'ลงทะเบียนเข้าเรียนแล้ว (รอเริ่มเรียน)'
      };
    }

    db.trainees[cleanPadded] = existing;
    if (cleanId !== cleanPadded) {
      db.trainees[cleanId] = existing;
    }
    updatedCount++;
  });

  if (updatedCount > 0) {
    db.activities.unshift({
      id: `act-enroll-${Date.now()}`,
      timestamp: new Date().toLocaleString('th-TH'),
      empId: 'ADMIN',
      fullName: 'ผู้ดูแลระบบ (Admin)',
      department: 'PS',
      action: 'course_enrolled',
      detail: `ลงทะเบียนผู้เข้าอบรม ${updatedCount} ท่าน เข้าสู่หลักสูตร [${targetCourse}] สำเร็จ`
    });
    db.activities = db.activities.slice(0, 100);
    saveDatabase(db);
  }

  res.json({
    success: true,
    enrolledCount: updatedCount,
    courseId: targetCourse,
    totalCount: Object.keys(db.trainees).length
  });
});

// 4. GET /api/activity-stream - Real-time activity notifications feed
app.get('/api/activity-stream', (req, res) => {
  res.json({
    success: true,
    activities: db.activities || [],
    lastUpdated: db.lastUpdated
  });
});

// 5. POST /api/activity-stream - Manual activity trigger
app.post('/api/activity-stream', (req, res) => {
  const { empId, fullName, department, action, detail, score } = req.body;
  const newActivity: ServerActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toLocaleString('th-TH'),
    empId: empId || 'ANONYMOUS',
    fullName: fullName || empId,
    department: department || 'P',
    action: action || 'general_activity',
    detail: detail || 'มีการเคลื่อนไหวในระบบ',
    score
  };
  db.activities.unshift(newActivity);
  db.activities = db.activities.slice(0, 100);
  saveDatabase(db);
  res.json({ success: true, activity: newActivity });
});

// 5.1 GET /api/training-logs - Audit trail & training tracking logs
app.get('/api/training-logs', (req, res) => {
  const { empId, courseId, department, action, limit = '200' } = req.query;
  let logs = db.trainingLogs || [];

  if (empId) {
    const cleanId = String(empId).trim().toUpperCase();
    logs = logs.filter((l: any) => l.empId && l.empId.toUpperCase() === cleanId);
  }
  if (courseId && courseId !== 'all') {
    logs = logs.filter((l: any) => l.courseId === courseId);
  }
  if (department && department !== 'all') {
    const cleanDept = String(department).trim().toUpperCase();
    logs = logs.filter((l: any) => l.department && l.department.toUpperCase() === cleanDept);
  }
  if (action && action !== 'all') {
    logs = logs.filter((l: any) => l.action === action);
  }

  const maxLimit = parseInt(String(limit), 10) || 200;
  res.json({
    success: true,
    logs: logs.slice(0, maxLimit),
    totalCount: logs.length,
    lastUpdated: db.lastUpdated
  });
});

// 5.2 POST /api/training-logs - Record training event & audit trail
app.post('/api/training-logs', (req, res) => {
  const logEntry = req.body;
  if (!logEntry || !logEntry.empId) {
    return res.status(400).json({ error: 'Missing log entry or empId' });
  }

  if (!db.trainingLogs) {
    db.trainingLogs = [];
  }

  const newEntry = {
    id: logEntry.id || `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: logEntry.timestamp || new Date().toISOString(),
    displayTime: logEntry.displayTime || new Date().toLocaleString('th-TH'),
    empId: String(logEntry.empId).trim().toUpperCase(),
    fullName: logEntry.fullName || 'ผู้เข้าอบรม',
    department: logEntry.department || 'P',
    position: logEntry.position || 'OPERATOR',
    courseId: logEntry.courseId || 'risk-management',
    courseName: logEntry.courseName || 'หลักสูตร TCT E-Training',
    action: logEntry.action || 'general',
    detail: logEntry.detail || '',
    score: logEntry.score ?? null,
    maxScore: logEntry.maxScore ?? null,
    durationSeconds: logEntry.durationSeconds,
    deviceInfo: logEntry.deviceInfo || 'Workstation',
    isAutoLogout: Boolean(logEntry.isAutoLogout)
  };

  db.trainingLogs.unshift(newEntry);
  db.trainingLogs = db.trainingLogs.slice(0, 1000); // keep up to 1000 logs

  // Also add to quick activity stream if meaningful
  if (['login', 'auto_logout', 'manual_logout', 'pretest_submit', 'posttest_submit', 'certificate_issued'].includes(newEntry.action)) {
    db.activities.unshift({
      id: `act-${newEntry.id}`,
      timestamp: newEntry.displayTime,
      empId: newEntry.empId,
      fullName: newEntry.fullName,
      department: newEntry.department,
      action: newEntry.action,
      detail: newEntry.detail,
      score: newEntry.score ?? undefined
    });
    db.activities = db.activities.slice(0, 100);
  }

  saveDatabase(db);
  res.json({ success: true, log: newEntry });
});

// 5.3 GET /api/training-tracker/summary - High level training metrics
app.get('/api/training-tracker/summary', (req, res) => {
  const traineesList = Object.values(db.trainees || {});
  const logsList = db.trainingLogs || [];

  const passedCount = traineesList.filter((t: any) => t.status === 'passed').length;
  const inProgressCount = traineesList.filter((t: any) => t.status === 'in_progress').length;
  const notStartedCount = traineesList.filter((t: any) => t.status === 'not_started').length;
  const autoLogoutsCount = logsList.filter((l: any) => l.action === 'auto_logout' || l.isAutoLogout).length;

  const postScores = traineesList
    .map((t: any) => t.postTestScore)
    .filter((s: any) => s !== null && s !== undefined && typeof s === 'number');
  const avgPostScore = postScores.length > 0 
    ? Number((postScores.reduce((a: number, b: number) => a + b, 0) / postScores.length).toFixed(1))
    : 0;

  res.json({
    success: true,
    summary: {
      totalTrainees: traineesList.length,
      activeTrainees: inProgressCount + passedCount,
      passedTrainees: passedCount,
      inProgressTrainees: inProgressCount,
      notStartedTrainees: notStartedCount,
      totalLogsCount: logsList.length,
      autoLogoutsCount,
      averagePostTestScore: avgPostScore,
      lastActivityTime: logsList[0]?.displayTime || db.lastUpdated
    }
  });
});

// 5.4 Location Check-ins Endpoints (Geofencing & Security Inspection)
app.get('/api/location-checkins', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const checkins = db.locationCheckIns || [];
  res.json({
    success: true,
    count: checkins.length,
    checkIns: checkins,
    geofence: {
      factoryName: 'บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด',
      targetLat: 14.3380539,
      targetLng: 100.6279692,
      radiusKm: 1.0,
      radiusMeters: 1000
    }
  });
});

app.post('/api/location-checkins', (req, res) => {
  const item = req.body;
  if (!item || !item.empId) {
    return res.status(400).json({ error: 'Missing required employee information' });
  }

  if (!db.locationCheckIns) {
    db.locationCheckIns = [];
  }

  const checkinRecord = {
    id: item.id || `chk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: item.timestamp || new Date().toISOString(),
    displayTime: item.displayTime || new Date().toLocaleString('th-TH'),
    empId: String(item.empId).trim().toUpperCase(),
    fullName: item.fullName || 'พนักงาน TCT',
    department: item.department || 'P',
    position: item.position || 'พนักงาน',
    courseId: item.courseId || 'applied-psychology',
    courseTitle: item.courseTitle || 'จิตวิทยาประยุกต์ในการทำงาน',
    lat: typeof item.lat === 'number' ? item.lat : 14.3380539,
    lng: typeof item.lng === 'number' ? item.lng : 100.6279692,
    accuracyMeters: typeof item.accuracyMeters === 'number' ? item.accuracyMeters : 10,
    distanceKm: typeof item.distanceKm === 'number' ? item.distanceKm : 0,
    distanceMeters: typeof item.distanceMeters === 'number' ? item.distanceMeters : 0,
    isWithinGeofence: Boolean(item.isWithinGeofence),
    status: item.status || (item.isWithinGeofence ? 'verified_onsite' : 'outside_geofence'),
    statusLabelTh: item.statusLabelTh || (item.isWithinGeofence ? 'ผ่านเกณฑ์ตรวจสอบพิกัด (ภายในโรงงาน)' : 'อยู่นอกพื้นที่โรงงาน (> 1 กม.)'),
    deviceInfo: item.deviceInfo || req.headers['user-agent'] || 'Web Browser',
    notes: item.notes || '',
    qrHash: item.qrHash || `TCT-GPS-${Date.now()}`
  };

  db.locationCheckIns.unshift(checkinRecord);
  if (db.locationCheckIns.length > 500) {
    db.locationCheckIns = db.locationCheckIns.slice(0, 500);
  }

  // Also log into real-time activity stream
  const act: ServerActivityLog = {
    id: `act-loc-${Date.now()}`,
    timestamp: new Date().toLocaleString('th-TH'),
    empId: checkinRecord.empId,
    fullName: checkinRecord.fullName,
    department: checkinRecord.department,
    action: 'location_checkin',
    detail: `เช็คอินพิกัด GPS: ${checkinRecord.statusLabelTh} (${checkinRecord.fullName})`
  };
  db.activities.unshift(act);
  db.activities = db.activities.slice(0, 100);

  saveDatabase(db);

  res.status(201).json({
    success: true,
    message: 'Location check-in recorded successfully',
    record: checkinRecord
  });
});

app.delete('/api/location-checkins/:id', (req, res) => {
  const { id } = req.params;
  if (!db.locationCheckIns) {
    db.locationCheckIns = [];
  }
  const prevCount = db.locationCheckIns.length;
  db.locationCheckIns = db.locationCheckIns.filter((c: any) => c.id !== id);
  saveDatabase(db);
  res.json({
    success: true,
    deleted: prevCount > db.locationCheckIns.length,
    id
  });
});

// 5.5 Kirkpatrick 4 Levels Evaluation Endpoints
app.get('/api/evaluations/kirkpatrick', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const evals = db.kirkpatrickEvaluations || [];
  const { empId, courseId } = req.query;

  let filtered = evals;
  if (empId) {
    const cleanId = String(empId).trim().toUpperCase();
    filtered = filtered.filter((e: any) => e.empId && e.empId.toUpperCase() === cleanId);
  }
  if (courseId && courseId !== 'all') {
    filtered = filtered.filter((e: any) => e.courseId === courseId);
  }

  // Calculate statistics across all evaluations
  const totalCount = evals.length;
  const avgOverall = totalCount > 0 
    ? Number((evals.reduce((acc: number, e: any) => acc + (e.overallScore || 0), 0) / totalCount).toFixed(2)) 
    : 0;
  const avgReaction = totalCount > 0 
    ? Number((evals.reduce((acc: number, e: any) => acc + (e.reactionScore || 0), 0) / totalCount).toFixed(2)) 
    : 0;
  const avgLearning = totalCount > 0 
    ? Number((evals.reduce((acc: number, e: any) => acc + (e.learningScore || 0), 0) / totalCount).toFixed(2)) 
    : 0;
  const avgBehavior = totalCount > 0 
    ? Number((evals.reduce((acc: number, e: any) => acc + (e.behaviorScore || 0), 0) / totalCount).toFixed(2)) 
    : 0;
  const avgResults = totalCount > 0 
    ? Number((evals.reduce((acc: number, e: any) => acc + (e.resultsScore || 0), 0) / totalCount).toFixed(2)) 
    : 0;

  res.json({
    success: true,
    totalCount,
    evaluations: filtered,
    summary: {
      averageOverall: avgOverall,
      averagePercentage: Math.round((avgOverall / 5) * 100),
      averageReaction: avgReaction,
      averageLearning: avgLearning,
      averageBehavior: avgBehavior,
      averageResults: avgResults,
      recommendRate: totalCount > 0 ? Math.round((evals.filter((e: any) => e.recommendsCourse).length / totalCount) * 100) : 100
    }
  });
});

app.post('/api/evaluations/kirkpatrick', (req, res) => {
  const item = req.body;
  if (!item || !item.empId) {
    return res.status(400).json({ error: 'Missing employee evaluation information' });
  }

  if (!db.kirkpatrickEvaluations) {
    db.kirkpatrickEvaluations = [];
  }

  const cleanId = String(item.empId).trim().toUpperCase();
  const evalRecord = {
    id: item.id || `kpk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: item.timestamp || new Date().toISOString(),
    displayTime: item.displayTime || new Date().toLocaleString('th-TH'),
    empId: cleanId,
    fullName: item.fullName || 'พนักงาน TCT',
    department: item.department || 'P',
    position: item.position || 'พนักงาน',
    courseId: item.courseId || 'applied-psychology',
    courseTitle: item.courseTitle || 'หลักสูตรการฝึกอบรม TCT',
    reactionScore: typeof item.reactionScore === 'number' ? item.reactionScore : 5,
    learningScore: typeof item.learningScore === 'number' ? item.learningScore : 5,
    behaviorScore: typeof item.behaviorScore === 'number' ? item.behaviorScore : 5,
    resultsScore: typeof item.resultsScore === 'number' ? item.resultsScore : 5,
    overallScore: typeof item.overallScore === 'number' ? item.overallScore : 5,
    overallPercentage: typeof item.overallPercentage === 'number' ? item.overallPercentage : 100,
    gradeLabelTh: item.gradeLabelTh || 'ระดับดีเยี่ยม (Excellent)',
    gradeBadgeColor: item.gradeBadgeColor || 'bg-emerald-100 text-emerald-900 border-emerald-300',
    items: Array.isArray(item.items) ? item.items : [],
    strengths: item.strengths || '',
    applicationPlan: item.applicationPlan || '',
    suggestions: item.suggestions || '',
    recommendsCourse: item.recommendsCourse !== undefined ? Boolean(item.recommendsCourse) : true,
    evaluationCode: item.evaluationCode || `KPK-${Date.now()}`
  };

  // Upsert: replace if existing evaluation for same employee and course
  const existingIdx = db.kirkpatrickEvaluations.findIndex((e: any) => e.empId === cleanId && e.courseId === evalRecord.courseId);
  if (existingIdx >= 0) {
    db.kirkpatrickEvaluations[existingIdx] = evalRecord;
  } else {
    db.kirkpatrickEvaluations.unshift(evalRecord);
  }

  // Also log into real-time activity stream
  const act: ServerActivityLog = {
    id: `act-kpk-${Date.now()}`,
    timestamp: new Date().toLocaleString('th-TH'),
    empId: cleanId,
    fullName: evalRecord.fullName,
    department: evalRecord.department,
    action: 'kirkpatrick_evaluation',
    detail: `ประเมินผลฝึกอบรม Kirkpatrick 4 ระดับ [${evalRecord.courseTitle}]: ${evalRecord.overallScore}/5.0 (${evalRecord.overallPercentage}%) ${evalRecord.gradeLabelTh}`,
    score: evalRecord.overallScore
  };
  db.activities.unshift(act);
  db.activities = db.activities.slice(0, 100);

  saveDatabase(db);

  res.status(201).json({
    success: true,
    message: 'Kirkpatrick evaluation recorded successfully',
    evaluation: evalRecord
  });
});

// 6. POST /api/trainees/batch-import - Import custom employees
app.post('/api/trainees/batch-import', (req, res) => {
  const { employees } = req.body;
  if (!Array.isArray(employees)) {
    return res.status(400).json({ error: 'Employees array expected' });
  }

  let added = 0;
  employees.forEach((emp: any) => {
    if (!emp.empId) return;
    const cleanId = String(emp.empId).trim().toUpperCase();
    if (!db.trainees[cleanId]) {
      db.trainees[cleanId] = {
        id: `emp-${cleanId}`,
        empId: cleanId,
        fullName: emp.fullName || `${emp.prefix ? emp.prefix + ' ' : ''}${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        department: emp.department || 'P',
        position: emp.position || 'SUPERVISOR',
        enrolledAt: new Date().toLocaleDateString('th-TH'),
        status: 'not_started',
        preTestScore: null,
        postTestScore: null,
        postTestAttempts: 0,
        miniGameScore: 0,
        completedModules: [],
        evaluationSubmitted: false,
        lastActivityAt: new Date().toISOString(),
        currentStep: 'ยังไม่เริ่มเรียน',
        attemptsHistory: []
      };
      added++;
    }
  });

  saveDatabase(db);
  res.json({ success: true, addedCount: added, totalCount: Object.keys(db.trainees).length });
});

// 7. POST /api/trainees/reset-all - Reset test data
app.post('/api/trainees/reset-all', (req, res) => {
  db = buildDefaultDatabase();
  saveDatabase(db);
  res.json({ success: true, message: 'Reset completed to authentic baseline' });
});

// 7.0 POST /api/reset-real-baseline - Safe endpoint
app.post('/api/reset-real-baseline', (req, res) => {
  res.json({ success: true, message: 'Authentic records preserved safely' });
});

// 7.01 GET /api/location-checkins - Get all employee location check-ins
app.get('/api/location-checkins', (req, res) => {
  const checkIns = Array.isArray(db.locationCheckIns) ? db.locationCheckIns : [];
  res.json({ success: true, count: checkIns.length, checkIns });
});

// 7.02 POST /api/location-checkins - Record an employee location check-in
app.post('/api/location-checkins', (req, res) => {
  const item = req.body;
  if (!item || !item.empId) {
    return res.status(400).json({ error: 'empId is required' });
  }

  if (!Array.isArray(db.locationCheckIns)) {
    db.locationCheckIns = [];
  }

  // Prepend new check-in (most recent first)
  db.locationCheckIns.unshift(item);
  db.locationCheckIns = db.locationCheckIns.slice(0, 300);

  // Add to activity stream
  const checkInAct: ServerActivityLog = {
    id: `act-loc-${Date.now()}`,
    timestamp: item.displayTime || new Date().toLocaleString('th-TH'),
    empId: item.empId,
    fullName: item.fullName || item.empId,
    department: item.department || 'P',
    action: 'location_checkin',
    detail: `พนักงาน ${item.fullName || item.empId} (${item.department}) เช็คอินพิกัด GPS: ${item.statusLabelTh || (item.isWithinGeofence ? 'ในโรงงาน' : 'นอกพื้นที่')} (ระยะห่าง ${item.distanceMeters || 0} ม.)`
  };
  db.activities.unshift(checkInAct);
  db.activities = db.activities.slice(0, 100);

  saveDatabase(db);
  res.json({ success: true, checkIn: item });
});

// 7.03 DELETE /api/location-checkins/:id - Delete a check-in record
app.delete('/api/location-checkins/:id', (req, res) => {
  const { id } = req.params;
  if (Array.isArray(db.locationCheckIns)) {
    db.locationCheckIns = db.locationCheckIns.filter((x: any) => x.id !== id);
    saveDatabase(db);
  }
  res.json({ success: true, message: 'Deleted check-in record' });
});

// 7.1 POST /api/trainees/:empId/reset - Reset learning and exam history for a single employee (for re-training)
app.post('/api/trainees/:empId/reset', (req, res) => {
  const { empId } = req.params;
  const cleanId = empId.trim().toUpperCase();
  const existing = db.trainees[cleanId] || {
    id: `tr-${cleanId}`,
    empId: cleanId,
    fullName: req.body?.fullName || cleanId,
    department: req.body?.department || 'P',
    position: req.body?.position || 'SUPERVISOR',
    enrolledAt: new Date().toISOString().split('T')[0]
  };

  db.trainees[cleanId] = {
    ...existing,
    status: 'not_started',
    preTestScore: null,
    postTestScore: null,
    postTestAttempts: 0,
    miniGameScore: 0,
    completedModules: [],
    evaluationSubmitted: false,
    satisfactionScore: undefined,
    certificateId: undefined,
    certificateDate: undefined,
    lastActivityAt: new Date().toISOString(),
    currentStep: 'ยังไม่เริ่มเรียน (รีเซ็ตเพื่อเข้าเรียนใหม่)',
    attemptsHistory: []
  };

  // Log this action to activity stream
  const resetActivity: ServerActivityLog = {
    id: `act-reset-${Date.now()}`,
    timestamp: new Date().toLocaleString('th-TH'),
    empId: cleanId,
    fullName: existing.fullName || cleanId,
    department: existing.department || 'P',
    action: 'history_reset',
    detail: `ล้างประวัติการเรียนและผลสอบของ ${existing.fullName} (${cleanId}) เพื่อให้เข้าเรียนและสอบใหม่เรียบร้อยแล้ว`
  };
  db.activities.unshift(resetActivity);
  db.activities = db.activities.slice(0, 100);

  saveDatabase(db);
  res.json({ success: true, message: `Trainee ${cleanId} learning history reset successfully`, trainee: db.trainees[cleanId] });
});

// 7.15 POST /api/trainees/:empId/profile - Admin/User update personal profile details on server
app.post('/api/trainees/:empId/profile', (req, res) => {
  const { empId } = req.params;
  const cleanId = empId.trim().toUpperCase();
  const { fullName, prefix, department, position, division, notes } = req.body;

  const existing = db.trainees[cleanId] || {
    id: `emp-${cleanId}`,
    empId: cleanId,
    enrolledAt: new Date().toISOString().split('T')[0]
  };

  const updated = {
    ...existing,
    fullName: fullName || existing.fullName || cleanId,
    prefix: prefix || existing.prefix,
    department: department || existing.department || 'P',
    position: position || existing.position || 'SUPERVISOR',
    division: division || existing.division || 'ฝ่ายผลิต',
    notes: notes !== undefined ? notes : existing.notes,
    lastActivityAt: new Date().toISOString()
  };

  db.trainees[cleanId] = updated;

  const profileActivity: ServerActivityLog = {
    id: `act-prof-${Date.now()}`,
    timestamp: new Date().toLocaleString('th-TH'),
    empId: cleanId,
    fullName: updated.fullName,
    department: updated.department,
    action: 'profile_updated',
    detail: `อัปเดตข้อมูลพนักงาน: ${updated.fullName} (${updated.department})`
  };
  db.activities.unshift(profileActivity);
  db.activities = db.activities.slice(0, 100);

  saveDatabase(db);
  res.json({ success: true, trainee: updated });
});

// 7.2 POST /api/trainees/:empId/scores - Admin manual score entry and update for ALL courses
app.post('/api/trainees/:empId/scores', (req, res) => {
  const { empId } = req.params;
  const cleanId = empId.trim().toUpperCase();
  const {
    preTestScore,
    postTestScore,
    miniGameScore = 100,
    completedModules,
    postTestAttempts = 1,
    courseId = 'applied-psychology',
    certificateId,
    certificateDate,
    adminNote
  } = req.body;

  const existing = db.trainees[cleanId] || {
    id: `tr-${cleanId}`,
    empId: cleanId,
    fullName: req.body.fullName || cleanId,
    department: req.body.department || 'P',
    position: req.body.position || 'SUPERVISOR',
    enrolledAt: new Date().toISOString().split('T')[0]
  };

  // Determine passing threshold and certificate prefix dynamically
  const passingThreshold = courseId === 'personality-psychology' ? 15 : (courseId === 'kyt-shisa-kanko' ? 16 : 8);
  const isPassed = postTestScore !== null && postTestScore !== undefined && postTestScore >= passingThreshold;

  const prefixLookup: Record<string, string> = {
    'applied-psychology': 'PSY',
    'kyt-shisa-kanko': 'KYT',
    'personality-psychology': 'DISC',
    'ai-for-tct': 'AI',
    'conflict-management': 'CFM',
    'advanced-preventive-maintenance': 'APM',
    'risk-management': 'QSRM'
  };
  const prefix = prefixLookup[courseId] || 'TCT';
  const defaultModList = courseId === 'applied-psychology' ? [1, 2, 3] : (courseId === 'advanced-preventive-maintenance' ? [1, 2, 3] : [1, 2, 3, 4]);
  const defaultDate = courseId === 'applied-psychology' ? '13 ตุลาคม 2569' : '23 สิงหาคม 2569';

  const generatedCertId = certificateId || (isPassed ? `TCT-${prefix}-2026-${cleanId}-${Math.floor(1000 + Math.random() * 9000)}` : undefined);
  const certDate = certificateDate || (isPassed ? defaultDate : undefined);

  const updatedProgress = existing.coursesProgress || {};
  updatedProgress[courseId] = {
    ...(updatedProgress[courseId] || {}),
    preTestScore: preTestScore !== undefined ? preTestScore : (updatedProgress[courseId]?.preTestScore ?? null),
    postTestScore: postTestScore !== undefined ? postTestScore : (updatedProgress[courseId]?.postTestScore ?? null),
    postTestAttempts: postTestAttempts || 1,
    miniGameScore: miniGameScore ?? 100,
    completedModules: completedModules || (isPassed ? defaultModList : (updatedProgress[courseId]?.completedModules || [])),
    evaluationSubmitted: isPassed,
    certificateId: generatedCertId,
    certificateDate: certDate,
    lastActiveStep: isPassed ? `สอบผ่านแล้ว (${postTestScore} คะแนน)` : `คะแนนสอบ (${postTestScore ?? 0})`
  };

  const newAttempts = [...(existing.attemptsHistory || [])];
  if (preTestScore !== null && preTestScore !== undefined) {
    newAttempts.push({
      attemptNumber: 1,
      type: 'pretest',
      score: preTestScore,
      passed: preTestScore >= passingThreshold,
      timestamp: new Date().toLocaleString('th-TH'),
      detail: `บันทึกคะแนน Pre-Test [${courseId}] โดยแอดมิน (${preTestScore} คะแนน)${adminNote ? ` [หมายเหตุ: ${adminNote}]` : ''}`
    });
  }
  if (postTestScore !== null && postTestScore !== undefined) {
    newAttempts.push({
      attemptNumber: postTestAttempts || 1,
      type: 'posttest',
      score: postTestScore,
      passed: isPassed,
      timestamp: new Date().toLocaleString('th-TH'),
      detail: `บันทึกคะแนน Post-Test [${courseId}] โดยแอดมิน (${postTestScore} คะแนน - ${isPassed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'})${adminNote ? ` [หมายเหตุ: ${adminNote}]` : ''}`
    });
  }

  db.trainees[cleanId] = {
    ...existing,
    preTestScore: preTestScore !== undefined ? preTestScore : existing.preTestScore,
    postTestScore: postTestScore !== undefined ? postTestScore : existing.postTestScore,
    postTestAttempts: postTestAttempts || existing.postTestAttempts || 1,
    miniGameScore: miniGameScore !== undefined ? miniGameScore : existing.miniGameScore,
    completedModules: completedModules || existing.completedModules || (isPassed ? defaultModList : []),
    status: isPassed ? 'passed' : (postTestScore !== null || preTestScore !== null ? 'in_progress' : 'not_started'),
    evaluationSubmitted: isPassed,
    certificateId: isPassed ? generatedCertId : existing.certificateId,
    certificateDate: isPassed ? certDate : existing.certificateDate,
    completedAt: isPassed ? (existing.completedAt || new Date().toISOString().split('T')[0]) : undefined,
    currentStep: isPassed ? `ผ่านเกณฑ์ (${postTestScore}) • วุฒิบัตรสมบูรณ์` : `คะแนนสอบ (${postTestScore ?? 0})`,
    coursesProgress: updatedProgress,
    attemptsHistory: newAttempts,
    lastActivityAt: new Date().toISOString()
  };

  const scoreActivity: ServerActivityLog = {
    id: `act-score-${Date.now()}`,
    timestamp: new Date().toLocaleString('th-TH'),
    empId: cleanId,
    fullName: existing.fullName || cleanId,
    department: existing.department || 'P',
    action: isPassed ? 'cert_issued' : 'quiz_passed',
    detail: `แอดมินกรอก/แก้ไขคะแนน [${courseId}] ของ ${existing.fullName}: Pre-Test ${preTestScore ?? '-'}, Post-Test ${postTestScore ?? '-'} (${isPassed ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่าน'})${adminNote ? ` [${adminNote}]` : ''}`,
    score: postTestScore ?? undefined
  };
  db.activities.unshift(scoreActivity);
  db.activities = db.activities.slice(0, 100);

  saveDatabase(db);
  res.json({ success: true, trainee: db.trainees[cleanId] });
});

// 8. DELETE /api/trainees/:empId - Delete trainee
app.delete('/api/trainees/:empId', (req, res) => {
  const { empId } = req.params;
  const cleanId = (empId || '').trim().toUpperCase();
  
  let deleted = false;
  let deletedName = cleanId;
  for (const key of Object.keys(db.trainees)) {
    if (key.trim().toUpperCase() === cleanId) {
      deletedName = db.trainees[key]?.fullName || cleanId;
      delete db.trainees[key];
      deleted = true;
    }
  }

  // Record audit activity
  const delAct = {
    id: `del-${cleanId}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    empId: cleanId,
    fullName: deletedName,
    department: 'ADMIN',
    action: 'profile_updated',
    detail: `แอดมินลบข้อมูลพนักงาน ${deletedName} (${cleanId}) ออกจากระบบเรียบร้อยแล้ว`
  };
  db.activities.unshift(delAct as any);
  db.activities = db.activities.slice(0, 100);

  saveDatabase(db);
  res.json({ success: true, message: `Trainee ${cleanId} deleted`, wasFound: deleted });
});

// 9. GET /api/active-sessions - Get sessions active in the last 5 minutes
app.get('/api/active-sessions', (req, res) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const active = Object.values(db.trainees).filter((t: any) => 
    new Date(t.lastActivityAt) > fiveMinutesAgo
  );
  res.json({ success: true, sessions: active });
});

// 10. POST /api/admin/purge-mock-trainees - Purge all simulated mock trainees without activity
app.post('/api/admin/purge-mock-trainees', (req, res) => {
  const authenticIds = new Set(APPLIED_PSYCHOLOGY_INITIAL_TRAINEES.map(t => t.empId.trim().toUpperCase()));
  let purgedCount = 0;

  for (const [key, t] of Object.entries(db.trainees)) {
    const cleanId = key.trim().toUpperCase();
    const item = t as any;

    const isAuthentic = authenticIds.has(cleanId);
    const hasScores = (item.preTestScore !== null && item.preTestScore !== undefined) ||
                      (item.postTestScore !== null && item.postTestScore !== undefined) ||
                      (Array.isArray(item.completedModules) && item.completedModules.length > 0) ||
                      Boolean(item.certificateId) ||
                      item.status === 'passed' ||
                      item.status === 'in_progress';
    const isRegistered = item.id?.startsWith('reg-') || item.id?.startsWith('custom-');

    if (!isAuthentic && !hasScores && !isRegistered && item.status === 'not_started') {
      delete db.trainees[key];
      purgedCount++;
    }
  }

  const purgeAct: ServerActivityLog = {
    id: `purge-${Date.now()}`,
    timestamp: new Date().toLocaleString('th-TH'),
    empId: 'ADMIN',
    fullName: 'ระบบจัดการฐานข้อมูล TCT',
    department: 'PS',
    action: 'profile_updated',
    detail: `ล้างระบบรายชื่อจำลองที่ยังไม่เริ่มเรียนออกสำเร็จจำนวน ${purgedCount} รายชื่อ (คงเหลือพนักงานจริงและผู้สอบจริง ${Object.keys(db.trainees).length} ท่าน)`
  };
  db.activities.unshift(purgeAct);
  db.activities = db.activities.slice(0, 100);

  saveDatabase(db);
  res.json({
    success: true,
    purgedCount,
    remainingCount: Object.keys(db.trainees).length,
    message: `ล้างรายชื่อจำลองออก ${purgedCount} รายการเรียบร้อยแล้ว`
  });
});

// -------------------------------------------------------------
// Vite Server Integration (Middleware for Dev, Static for Prod)
// -------------------------------------------------------------
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const distIndexExists = fs.existsSync(path.join(distPath, 'index.html'));

  // In dev (NODE_ENV=development), always run Vite middlewares. In production (NODE_ENV=production or dist exists), serve static build.
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (process.env.NODE_ENV !== 'development' && distIndexExists);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html') || filePath.endsWith('sw.js') || filePath.endsWith('manifest.json')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        } else if (filePath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TCT E-Training Centralized Server running on http://0.0.0.0:${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
