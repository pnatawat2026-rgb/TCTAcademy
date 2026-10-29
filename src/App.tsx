import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, ViewState, TraineeRecord, CourseProgressRecord } from './types';
import { 
  getUserPersistentProgress, 
  saveUserPersistentProgress, 
  getStoredTrainees,
  saveStoredTrainees,
  findEmployeeByEmpId
} from './data/traineeData';
import { getAllAvailableCourses, getCourseModules, getCourseQuestions } from './utils/courseManager';
import { syncUserToServer, fetchServerTrainees, syncServerTraineeProfile } from './utils/syncManager';
import { playCyberClick, playSuccessChime } from './utils/soundEffects';

// Core Components
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { CourseSelectionView } from './components/CourseSelectionView';
import { PreTestView } from './components/PreTestView';
import { ModuleView } from './components/ModuleView';
import { MiniGameView } from './components/MiniGameView';
import { PostTestView } from './components/PostTestView';
import { EvaluationView } from './components/EvaluationView';
import { CertificateView } from './components/CertificateView';
import { TrainingReportView } from './components/TrainingReportView';
import { AdminBackofficeView } from './components/AdminBackofficeView';
import { ApproverPortalView } from './components/ApproverPortalView';
import { ExecutiveSummaryView } from './components/ExecutiveSummaryView';
import { FollowUp30DaysView } from './components/FollowUp30DaysView';
import { ContinuousImprovementView } from './components/ContinuousImprovementView';
import { CourseGuidanceView } from './components/CourseGuidanceView';

// Modals & Overlays
import { RoadmapModal } from './components/RoadmapModal';
import { GlossaryModal } from './components/GlossaryModal';
import { CourseShareModal } from './components/CourseShareModal';
import { TrainingTrackerModal } from './components/TrainingTrackerModal';
import { InhouseTrainingReportModal } from './components/InhouseTrainingReportModal';
import { ETrainingRosterReportModal } from './components/ETrainingRosterReportModal';
import { CourseApprovalPdfModal } from './components/CourseApprovalPdfModal';
import { EditProfileModal } from './components/EditProfileModal';
import { AdminEmployeeModeBanner } from './components/AdminEmployeeModeBanner';
import { AssignedCoursesModal } from './components/AssignedCoursesModal';
import { TrainingSuccessModal } from './components/TrainingSuccessModal';
import { AutoLocationCheckInModal } from './components/AutoLocationCheckInModal';
import { 
  subscribeToAllTrainingRosters, 
  subscribeToTrainingRecords, 
  subscribeToUserProgress 
} from './firebase';
import { checkForAppUpdates, forceHardRefreshAndPurgeCache } from './utils/appVersionManager';
import { RefreshCw } from 'lucide-react';

const STORAGE_KEY_USER = 'tct_qsrm_learning_state_v1';

export default function App() {
  // 1. Current Logged In User
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER) || sessionStorage.getItem('tct_auth_employee_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.empId) {
          // Re-hydrate with latest persistent progress
          const persistent = getUserPersistentProgress(parsed.empId);
          return { ...parsed, ...(persistent || {}) };
        }
      }
    } catch (e) {
      console.debug('Error loading initial user state', e);
    }
    return null;
  });

  // 2. Active View State
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    if (!currentUser) return 'login';
    return currentUser.lastActiveView || 'dashboard';
  });

  // 3. Current Selected Course ID
  const [currentCourseId, setCurrentCourseId] = useState<string>(() => {
    return currentUser?.selectedCourseId || 'applied-psychology';
  });

  // 4. Admin Session Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('tct_admin_auth') === 'true';
  });

  // 5. Modals State
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareCourseId, setShareCourseId] = useState<string>('applied-psychology');
  const [isTrainingTrackerOpen, setIsTrainingTrackerOpen] = useState(false);
  const [trainingTrackerInitialTab, setTrainingTrackerInitialTab] = useState<'logs' | 'tracker' | 'my-record'>('logs');
  const [isInhouseReportOpen, setIsInhouseReportOpen] = useState(false);
  const [inhouseReportCourseId, setInhouseReportCourseId] = useState<string>('applied-psychology');
  const [isETrainingRosterOpen, setIsETrainingRosterOpen] = useState(false);
  const [eTrainingRosterCourseId, setETrainingRosterCourseId] = useState<string>('applied-psychology');
  const [courseApprovalPdfModalCourseId, setCourseApprovalPdfModalCourseId] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedTraineeForReport, setSelectedTraineeForReport] = useState<TraineeRecord | null>(null);
  const [isAssignedCoursesModalOpen, setIsAssignedCoursesModalOpen] = useState(false);
  const [isTrainingSuccessModalOpen, setIsTrainingSuccessModalOpen] = useState(false);
  const [isAutoLocationModalOpen, setIsAutoLocationModalOpen] = useState(false);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);
  const [evaluationMode, setEvaluationMode] = useState<'auto_course' | 'external_course' | 'followup_30days'>('auto_course');

  // 6. Centralized Trainees Cache for Modals
  const [cachedTrainees, setCachedTrainees] = useState<TraineeRecord[]>(() => getStoredTrainees(currentUser));

  // Real-time Firestore Listeners: Subscribe to training rosters and records for true live data
  useEffect(() => {
    // 1. Fetch server trainees initially
    fetchServerTrainees().then(data => {
      if (data && data.trainees) {
        setCachedTrainees(data.trainees);
      }
    }).catch(() => {});

    // 2. Real-time Firestore listener for training rosters across courses
    const unsubRosters = subscribeToAllTrainingRosters((rosterList) => {
      if (rosterList && rosterList.length > 0) {
        setCachedTrainees(prev => {
          const map = new Map<string, TraineeRecord>();
          prev.forEach(t => map.set(t.empId.toUpperCase(), t));
          rosterList.forEach(r => {
            const cleanId = r.empId.toUpperCase();
            const existing = map.get(cleanId);
            map.set(cleanId, {
              id: r.id,
              empId: cleanId,
              fullName: r.fullName,
              department: r.department,
              position: r.position,
              status: r.status,
              preTestScore: r.preTestScore ?? existing?.preTestScore ?? null,
              postTestScore: r.postTestScore ?? existing?.postTestScore ?? null,
              miniGameScore: r.miniGameScore ?? existing?.miniGameScore ?? 0,
              completedModules: r.completedModules ?? existing?.completedModules ?? [],
              certificateId: r.certificateId || existing?.certificateId,
              selectedCourseId: r.courseId,
              enrolledAt: r.cohortDate || existing?.enrolledAt || '2026-10-12',
              enrolledCourses: existing?.enrolledCourses || [r.courseId],
              coursesProgress: existing?.coursesProgress || {}
            } as TraineeRecord);
          });
          return Array.from(map.values());
        });
      }
    });

    // 3. Real-time Firestore listener for verified passed records
    const unsubRecords = subscribeToTrainingRecords((records) => {
      if (records && records.length > 0) {
        setCachedTrainees(prev => {
          const map = new Map<string, TraineeRecord>();
          prev.forEach(t => map.set(t.empId.toUpperCase(), t));
          records.forEach(rec => {
            const cleanId = rec.empId.toUpperCase();
            const existing = map.get(cleanId);
            if (existing) {
              map.set(cleanId, {
                ...existing,
                status: rec.passed ? 'passed' : existing.status,
                postTestScore: rec.examScore ?? existing.postTestScore,
                certificateId: rec.certificateId || existing.certificateId,
                certificateDate: rec.passedDate || existing.certificateDate
              });
            }
          });
          return Array.from(map.values());
        });
      }
    });

    return () => {
      unsubRosters();
      unsubRecords();
    };
  }, []);

  // Real-time Firestore listener for logged in user's persistent progress
  useEffect(() => {
    if (!currentUser?.empId) return;
    const unsub = subscribeToUserProgress(currentUser.empId, (remoteProgress) => {
      if (remoteProgress && typeof remoteProgress === 'object') {
        setCurrentUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            ...remoteProgress,
            coursesProgress: {
              ...(prev.coursesProgress || {}),
              ...(remoteProgress.coursesProgress || {})
            }
          };
        });
      }
    });
    return () => unsub();
  }, [currentUser?.empId]);

  // Sync admin auth status changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAdminLoggedIn(sessionStorage.getItem('tct_admin_auth') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Navigation Handler
  const handleNavigate = (view: ViewState) => {
    playCyberClick();
    setCurrentView(view);
    if (currentUser) {
      const updated = { ...currentUser, lastActiveView: view };
      setCurrentUser(updated);
      saveUserPersistentProgress(updated);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login Handler
  const handleLogin = (profile: Omit<UserProfile, 'preTestScore' | 'preTestTotal' | 'postTestScore' | 'postTestTotal' | 'postTestAttempts' | 'miniGameScore' | 'completedModules' | 'evaluationSubmitted'>) => {
    playSuccessChime();
    const cleanId = profile.empId.trim().toUpperCase();

    // Look up persistent progress (local + server + authentic list)
    const savedProgress: Partial<UserProfile> = getUserPersistentProgress(cleanId) || {};
    const activeCourse = profile.selectedCourseId || savedProgress.selectedCourseId || 'applied-psychology';
    const cp: Partial<CourseProgressRecord> = savedProgress.coursesProgress?.[activeCourse] || {};

    const fullProfile: UserProfile = {
      empId: cleanId,
      fullName: profile.fullName,
      prefix: profile.prefix || 'นาย',
      department: profile.department,
      position: profile.position || 'พนักงานฝ่ายผลิต',
      division: profile.division || 'ฝ่ายผลิต',
      enrolledAt: profile.enrolledAt || savedProgress.enrolledAt || new Date().toISOString().split('T')[0],
      selectedCourseId: activeCourse,
      enrolledCourses: profile.enrolledCourses || savedProgress.enrolledCourses || [activeCourse],
      coursesProgress: savedProgress.coursesProgress || {
        [activeCourse]: {
          preTestScore: cp.preTestScore ?? null,
          postTestScore: cp.postTestScore ?? null,
          postTestAttempts: cp.postTestAttempts || 0,
          miniGameScore: cp.miniGameScore || 0,
          completedModules: cp.completedModules || [],
          evaluationSubmitted: Boolean(cp.evaluationSubmitted),
          certificateId: cp.certificateId,
          certificateDate: cp.certificateDate,
          lastActiveStep: cp.lastActiveStep
        }
      },
      preTestScore: cp.preTestScore !== undefined ? cp.preTestScore : (savedProgress.preTestScore ?? null),
      preTestTotal: 10,
      postTestScore: cp.postTestScore !== undefined ? cp.postTestScore : (savedProgress.postTestScore ?? null),
      postTestTotal: 10,
      postTestAttempts: cp.postTestAttempts || savedProgress.postTestAttempts || 0,
      miniGameScore: cp.miniGameScore || savedProgress.miniGameScore || 0,
      completedModules: cp.completedModules || savedProgress.completedModules || [],
      evaluationSubmitted: cp.evaluationSubmitted !== undefined ? cp.evaluationSubmitted : Boolean(savedProgress.evaluationSubmitted),
      certificateId: cp.certificateId || savedProgress.certificateId,
      certificateDate: cp.certificateDate || savedProgress.certificateDate,
      lastActiveView: 'dashboard',
      lastActiveStep: cp.lastActiveStep || savedProgress.lastActiveStep
    };

    setCurrentUser(fullProfile);
    setCurrentCourseId(activeCourse);
    saveUserPersistentProgress(fullProfile);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(fullProfile));
    sessionStorage.setItem('tct_auth_employee_v2', JSON.stringify(fullProfile));

    syncUserToServer(fullProfile, 'login', `เข้าสู่ระบบหลักสูตร ${activeCourse}`).catch(() => {});

    // Employee enters system: always automatically prompt location sharing in a simple, non-cumbersome manner
    setCurrentView('courses');
    setIsAutoLocationModalOpen(true);
    setIsAssignedCoursesModalOpen(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Logout Handler
  const handleLogout = () => {
    playCyberClick();
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('tct_auth_employee_v2');
    sessionStorage.removeItem('tct_admin_auth');
    localStorage.removeItem(STORAGE_KEY_USER);
    setCurrentView('login');
  };

  // Course Switcher Handler
  const handleSelectCourse = (courseId: string) => {
    if (!currentUser) return;
    playCyberClick();

    // 1. Save current course progress
    const currentCp = currentUser.coursesProgress || {};
    const oldCourseKey = currentUser.selectedCourseId || currentCourseId;
    currentCp[oldCourseKey] = {
      preTestScore: currentUser.preTestScore,
      postTestScore: currentUser.postTestScore,
      postTestAttempts: currentUser.postTestAttempts,
      miniGameScore: currentUser.miniGameScore,
      completedModules: currentUser.completedModules,
      evaluationSubmitted: currentUser.evaluationSubmitted,
      certificateId: currentUser.certificateId,
      certificateDate: currentUser.certificateDate,
      lastActiveStep: currentUser.lastActiveStep
    };

    // 2. Load target course progress
    const targetCp = currentCp[courseId] || {
      preTestScore: null,
      postTestScore: null,
      postTestAttempts: 0,
      miniGameScore: 0,
      completedModules: [],
      evaluationSubmitted: false
    };

    const enrolled = Array.from(new Set([...(currentUser.enrolledCourses || []), courseId]));

    const updatedUser: UserProfile = {
      ...currentUser,
      selectedCourseId: courseId,
      enrolledCourses: enrolled,
      coursesProgress: currentCp,
      preTestScore: targetCp.preTestScore ?? null,
      postTestScore: targetCp.postTestScore ?? null,
      postTestAttempts: targetCp.postTestAttempts || 0,
      miniGameScore: targetCp.miniGameScore || 0,
      completedModules: targetCp.completedModules || [],
      evaluationSubmitted: Boolean(targetCp.evaluationSubmitted),
      certificateId: targetCp.certificateId,
      certificateDate: targetCp.certificateDate,
      lastActiveStep: targetCp.lastActiveStep
    };

    setCurrentUser(updatedUser);
    setCurrentCourseId(courseId);
    saveUserPersistentProgress(updatedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    syncUserToServer(updatedUser, 'module', `สลับหลักสูตรเป็น ${courseId}`).catch(() => {});

    // Mobile-first direct leap to active course test or module
    let targetNextView: ViewState = 'dashboard';
    if (targetCp.preTestScore === null || targetCp.preTestScore === undefined) {
      targetNextView = 'guidance';
    } else if (!targetCp.completedModules || targetCp.completedModules.length === 0) {
      targetNextView = 'module1';
    } else if (targetCp.postTestScore === null || targetCp.postTestScore === undefined) {
      targetNextView = 'posttest';
    } else if (targetCp.postTestScore >= (courseId === 'personality-psychology' ? 15 : 8)) {
      targetNextView = 'certificate';
    } else {
      targetNextView = 'dashboard';
    }

    setCurrentView(targetNextView);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Complete Pre-Test Handler
  const handleCompletePreTest = (score: number) => {
    if (!currentUser) return;
    playSuccessChime();
    const currentCourse = currentUser.selectedCourseId || currentCourseId;
    const cp = { ...(currentUser.coursesProgress || {}) };
    cp[currentCourse] = {
      ...(cp[currentCourse] || {}),
      preTestScore: score,
      lastActiveStep: `ทำแบบทดสอบก่อนเรียนได้ ${score}/10 คะแนน`
    };

    const updatedUser: UserProfile = {
      ...currentUser,
      preTestScore: score,
      coursesProgress: cp,
      lastActiveStep: `ทำแบบทดสอบก่อนเรียนได้ ${score}/10 คะแนน`
    };

    setCurrentUser(updatedUser);
    saveUserPersistentProgress(updatedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    syncUserToServer(updatedUser, 'pretest', `ทำแบบทดสอบก่อนเรียนได้ ${score}/10 คะแนน`).catch(() => {});
  };

  // Complete Module Handler
  const handleCompleteModule = (moduleId: number) => {
    if (!currentUser) return;
    playSuccessChime();
    const currentCourse = currentUser.selectedCourseId || currentCourseId;
    const completed = Array.from(new Set([...currentUser.completedModules, moduleId])).sort((a, b) => a - b);
    const cp = { ...(currentUser.coursesProgress || {}) };
    cp[currentCourse] = {
      ...(cp[currentCourse] || {}),
      completedModules: completed,
      lastActiveStep: `เรียนจบบทที่ ${moduleId}`
    };

    const updatedUser: UserProfile = {
      ...currentUser,
      completedModules: completed,
      coursesProgress: cp,
      lastActiveStep: `เรียนจบบทที่ ${moduleId}`
    };

    setCurrentUser(updatedUser);
    saveUserPersistentProgress(updatedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    syncUserToServer(updatedUser, 'module', `เรียนจบบทที่ ${moduleId}`).catch(() => {});
  };

  // Save Mini-Game Score Handler
  const handleSaveMiniGameScore = (score: number) => {
    if (!currentUser) return;
    playSuccessChime();
    const currentCourse = currentUser.selectedCourseId || currentCourseId;
    const cp = { ...(currentUser.coursesProgress || {}) };
    cp[currentCourse] = {
      ...(cp[currentCourse] || {}),
      miniGameScore: score,
      lastActiveStep: `เล่นมินิเกมได้ ${score} คะแนน`
    };

    const updatedUser: UserProfile = {
      ...currentUser,
      miniGameScore: score,
      coursesProgress: cp,
      lastActiveStep: `เล่นมินิเกมได้ ${score} คะแนน`
    };

    setCurrentUser(updatedUser);
    saveUserPersistentProgress(updatedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    syncUserToServer(updatedUser, 'game', `เล่นมินิเกมได้ ${score} คะแนน`).catch(() => {});
  };

  // Complete Post-Test Handler
  const handleCompletePostTest = (score: number) => {
    if (!currentUser) return;
    const currentCourse = currentUser.selectedCourseId || currentCourseId;
    const allCourses = getAllAvailableCourses();
    const cObj = allCourses.find(c => c.id === currentCourse);
    const passingScore = cObj?.passingScore || 8;
    const isPassed = score >= passingScore;

    if (isPassed) {
      playSuccessChime();
    }

    const newAttempts = (currentUser.postTestAttempts || 0) + 1;
    const todayTh = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = currentUser.certificateId || (isPassed ? `TCT-PSY-2026-${currentUser.empId}-${String(Math.floor(100 + Math.random() * 900))}` : undefined);

    const cp = { ...(currentUser.coursesProgress || {}) };
    cp[currentCourse] = {
      ...(cp[currentCourse] || {}),
      postTestScore: score,
      postTestAttempts: newAttempts,
      certificateId: certId,
      certificateDate: isPassed ? todayTh : undefined,
      lastActiveStep: isPassed ? `สอบผ่านหลังเรียน (${score}/10 คะแนน)` : `สอบหลังเรียนรอบที่ ${newAttempts} (${score}/10 คะแนน - ยังไม่ผ่านเกณฑ์)`
    };

    const updatedUser: UserProfile = {
      ...currentUser,
      postTestScore: score,
      postTestAttempts: newAttempts,
      certificateId: certId,
      certificateDate: isPassed ? todayTh : undefined,
      coursesProgress: cp,
      lastActiveStep: isPassed ? `สอบผ่านหลังเรียน (${score}/10 คะแนน)` : `สอบหลังเรียนรอบที่ ${newAttempts} (${score}/10 คะแนน - ยังไม่ผ่านเกณฑ์)`
    };

    setCurrentUser(updatedUser);
    saveUserPersistentProgress(updatedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    syncUserToServer(updatedUser, 'posttest', `ทำแบบทดสอบหลังเรียนได้ ${score}/10 คะแนน (${isPassed ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่าน'})`).catch(() => {});

    if (isPassed && certId) {
      syncUserToServer(updatedUser, 'cert_issued', `สำเร็จการอบรมและได้รับวุฒิบัตร ${certId}`).catch(() => {});
    }
  };

  // Submit Evaluation Handler
  const handleSubmitEvaluation = (answers: any) => {
    if (!currentUser) return;
    playSuccessChime();
    const currentCourse = currentUser.selectedCourseId || currentCourseId;
    const cp = { ...(currentUser.coursesProgress || {}) };
    cp[currentCourse] = {
      ...(cp[currentCourse] || {}),
      evaluationSubmitted: true,
      evaluationAnswers: answers,
      lastActiveStep: 'ส่งแบบประเมินความพึงพอใจเรียบร้อยแล้ว'
    };

    const updatedUser: UserProfile = {
      ...currentUser,
      evaluationSubmitted: true,
      evaluationAnswers: answers,
      coursesProgress: cp,
      lastActiveStep: 'ส่งแบบประเมินความพึงพอใจเรียบร้อยแล้ว'
    };

    setCurrentUser(updatedUser);
    saveUserPersistentProgress(updatedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    syncUserToServer(updatedUser, 'evaluation', 'ส่งแบบประเมินความพึงพอใจหลักสูตร').catch(() => {});
    setIsTrainingSuccessModalOpen(true);
    handleNavigate('certificate');
  };

  // Reset Progress for Current Course
  const handleResetCurrentCourseProgress = (courseId?: string) => {
    if (!currentUser) return;
    playCyberClick();
    const targetCourse = courseId || currentUser.selectedCourseId || currentCourseId;
    const cp = { ...(currentUser.coursesProgress || {}) };
    cp[targetCourse] = {
      preTestScore: null,
      postTestScore: null,
      postTestAttempts: 0,
      miniGameScore: 0,
      completedModules: [],
      evaluationSubmitted: false,
      certificateId: undefined,
      certificateDate: undefined,
      lastActiveStep: 'รีเซ็ตความคืบหน้ารายวิชา'
    };

    const updatedUser: UserProfile = {
      ...currentUser,
      preTestScore: null,
      postTestScore: null,
      postTestAttempts: 0,
      miniGameScore: 0,
      completedModules: [],
      evaluationSubmitted: false,
      certificateId: undefined,
      certificateDate: undefined,
      coursesProgress: cp,
      lastActiveStep: 'รีเซ็ตความคืบหน้ารายวิชา'
    };

    setCurrentUser(updatedUser);
    saveUserPersistentProgress(updatedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    syncUserToServer(updatedUser, 'module', `รีเซ็ตความคืบหน้าวิชา ${targetCourse}`).catch(() => {});
  };

  // Profile Edit Save
  const handleSaveProfile = (updatedData: {
    empId: string;
    prefix: string;
    firstName: string;
    lastName: string;
    fullName: string;
    department: string;
    position: string;
    division?: string;
    notes?: string;
  }) => {
    if (!currentUser) return;
    playSuccessChime();
    const updatedUser: UserProfile = {
      ...currentUser,
      empId: updatedData.empId,
      prefix: updatedData.prefix,
      fullName: updatedData.fullName,
      department: updatedData.department,
      position: updatedData.position,
      division: updatedData.division || currentUser.division
    };

    setCurrentUser(updatedUser);
    saveUserPersistentProgress(updatedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    syncServerTraineeProfile(updatedData).catch(() => {});
    setIsEditProfileOpen(false);
  };

  // Admin Mode Persona Switch
  const handleSwitchUserProfile = (profile: UserProfile) => {
    playSuccessChime();
    setCurrentUser(profile);
    setCurrentCourseId(profile.selectedCourseId || 'applied-psychology');
    saveUserPersistentProgress(profile);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
    setCurrentView('dashboard');
  };

  // Admin Instant Unlock All
  const handleInstantUnlockAll = () => {
    if (!currentUser) return;
    playSuccessChime();
    const currentCourse = currentUser.selectedCourseId || currentCourseId;
    const modules = getCourseModules(currentCourse);
    const allModIds = modules.map(m => m.id);
    const todayTh = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = currentUser.certificateId || `TCT-PSY-2026-${currentUser.empId}-888`;

    const cp = { ...(currentUser.coursesProgress || {}) };
    cp[currentCourse] = {
      preTestScore: 10,
      postTestScore: 10,
      postTestAttempts: 1,
      miniGameScore: 10,
      completedModules: allModIds,
      evaluationSubmitted: true,
      certificateId: certId,
      certificateDate: todayTh,
      lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)'
    };

    const unlocked: UserProfile = {
      ...currentUser,
      preTestScore: 10,
      postTestScore: 10,
      postTestAttempts: 1,
      miniGameScore: 10,
      completedModules: allModIds,
      evaluationSubmitted: true,
      certificateId: certId,
      certificateDate: todayTh,
      coursesProgress: cp,
      lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)'
    };

    setCurrentUser(unlocked);
    saveUserPersistentProgress(unlocked);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(unlocked));
    syncUserToServer(unlocked, 'cert_issued', 'แอดมินปลดล็อกหลักสูตรทั้งหมดสำเร็จ').catch(() => {});
  };

  const handleOpenAdmin = () => {
    playCyberClick();
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('tct_admin_auth', 'true');
    if (!currentUser) {
      const adminProfile: UserProfile = {
        empId: 'ADMIN-001',
        prefix: 'นาย',
        firstName: 'ผู้ดูแลระบบ',
        lastName: 'TCT Academy',
        fullName: 'นายผู้ดูแลระบบ TCT Academy',
        department: 'TR',
        position: 'ผู้ดูแลระบบศูนย์ฝึกอบรม',
        division: 'Human Resource Development',
        role: 'admin',
        enrolledAt: new Date().toISOString(),
        selectedCourseId: currentCourseId || 'applied-psychology',
        enrolledCourses: ['applied-psychology', 'advanced-preventive-maintenance', 'q-srm-quality'],
        completedModules: [1, 2, 3, 4],
        preTestScore: 10,
        preTestTotal: 10,
        postTestScore: 10,
        postTestTotal: 10,
        postTestAttempts: 1,
        miniGameScore: 10,
        evaluationSubmitted: true,
        certificateId: 'TCT-ADMIN-01-CERT',
        coursesProgress: {}
      };
      setCurrentUser(adminProfile);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(adminProfile));
    }
    handleNavigate('admin');
  };

  // -------------------------------------------------------------
  // Render View by currentView
  // -------------------------------------------------------------
  const renderViewContent = () => {
    // 0. Dedicated Admin & Approver views (accessible directly)
    if (currentView === 'admin') {
      return (
        <AdminBackofficeView
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onSelectTraineeForReport={(trainee) => {
            setSelectedTraineeForReport(trainee);
            handleNavigate('report');
          }}
          onSelectTraineeForCert={(trainee) => {
            const userForCert: UserProfile = {
              empId: trainee.empId,
              fullName: trainee.fullName,
              department: trainee.department,
              position: trainee.position || 'พนักงานฝ่ายปฏิบัติการ',
              division: trainee.division || 'ฝ่ายผลิต',
              role: 'trainee',
              enrolledAt: trainee.enrolledAt || new Date().toISOString(),
              selectedCourseId: trainee.selectedCourseId || currentCourseId || 'applied-psychology',
              preTestScore: trainee.preTestScore,
              preTestTotal: 10,
              postTestScore: trainee.postTestScore,
              postTestTotal: 10,
              postTestAttempts: trainee.postTestAttempts || 1,
              miniGameScore: trainee.miniGameScore || 0,
              completedModules: trainee.completedModules || [1, 2, 3, 4],
              evaluationSubmitted: true,
              certificateId: trainee.certificateId,
              certificateDate: trainee.completedAt
            };
            setCurrentUser(userForCert);
            handleNavigate('certificate');
          }}
          onOpenCourseApprovalPdf={(cId) => {
            setCourseApprovalPdfModalCourseId(cId || currentCourseId);
          }}
        />
      );
    }

    if (currentView === 'approver') {
      return (
        <ApproverPortalView
          currentUser={currentUser}
          onNavigate={handleNavigate}
        />
      );
    }

    // 1. Login View
    if (!currentUser || currentView === 'login') {
      return (
        <LoginView
          onLogin={handleLogin}
          onOpenAdmin={handleOpenAdmin}
          onOpenApprover={() => handleNavigate('approver')}
          onOpenShare={() => {
            setShareCourseId(currentCourseId);
            setIsShareOpen(true);
          }}
          onOpenTrainingTracker={() => {
            setTrainingTrackerInitialTab('tracker');
            setIsTrainingTrackerOpen(true);
          }}
          onOpenCourseApprovalPdf={(cId) => {
            setCourseApprovalPdfModalCourseId(cId || 'good-employee-skills');
          }}
        />
      );
    }

    // 2. Module Learning Views (module1, module2, ...)
    if (currentView.startsWith('module')) {
      const modNumber = parseInt(currentView.replace('module', ''), 10) || 1;
      const modules = getCourseModules(currentCourseId) || [];
      const currentModule = modules.find(m => m.id === modNumber) || modules[0];
      const questions = getCourseQuestions(currentCourseId) || [];

      if (!currentModule) {
        return (
          <div className="max-w-5xl mx-auto px-4 py-12 text-center text-slate-400 font-sarabun">
            <p className="text-base mb-4">ไม่พบข้อมูลบทเรียนในหลักสูตรนี้</p>
            <button
              type="button"
              onClick={() => handleNavigate('dashboard')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm cursor-pointer"
            >
              กลับสู่หน้าหลัก
            </button>
          </div>
        );
      }

      return (
        <ModuleView
          module={currentModule}
          modules={modules}
          questions={questions}
          user={currentUser}
          onCompleteModule={handleCompleteModule}
          onNavigate={handleNavigate}
        />
      );
    }

    // 3. Other Views
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            user={currentUser}
            modules={getCourseModules(currentCourseId)}
            onNavigate={handleNavigate}
            onOpenRoadmap={() => setIsRoadmapOpen(true)}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
            onOpenShare={() => {
              setShareCourseId(currentCourseId);
              setIsShareOpen(true);
            }}
            onResetProgress={() => handleResetCurrentCourseProgress()}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onOpenTrainingTracker={(tab) => {
              setTrainingTrackerInitialTab(tab || 'logs');
              setIsTrainingTrackerOpen(true);
            }}
          />
        );

      case 'courses':
        return (
          <CourseSelectionView
            user={currentUser}
            onSelectCourse={handleSelectCourse}
            onOpenReport={() => handleNavigate('report')}
            onOpenCertificate={() => handleNavigate('certificate')}
            onOpenAdmin={() => handleNavigate('admin')}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
            onOpenRoadmap={() => setIsRoadmapOpen(true)}
            onOpenShare={(cId) => {
              setShareCourseId(cId || currentCourseId);
              setIsShareOpen(true);
            }}
            onOpenInhouseReport={(cId) => {
              setInhouseReportCourseId(cId || currentCourseId);
              setIsInhouseReportOpen(true);
            }}
            onOpenETrainingRoster={(cId) => {
              setETrainingRosterCourseId(cId || currentCourseId);
              setIsETrainingRosterOpen(true);
            }}
            onOpenCourseApprovalPdf={(cId) => {
              setCourseApprovalPdfModalCourseId(cId || currentCourseId);
            }}
            onOpenEvaluation={(cId, mode) => {
              if (cId) setCurrentCourseId(cId);
              setEvaluationMode(mode || 'auto_course');
              handleNavigate('evaluation');
            }}
            onLogout={handleLogout}
            onResetProgress={(cId) => handleResetCurrentCourseProgress(cId)}
          />
        );

      case 'pretest':
        return (
          <PreTestView
            user={currentUser}
            questions={getCourseQuestions(currentCourseId)}
            onCompletePreTest={handleCompletePreTest}
            onProceedToModule1={() => handleNavigate('module1')}
            onNavigate={handleNavigate}
          />
        );

      case 'game':
        return (
          <MiniGameView
            user={currentUser}
            onSaveMiniGameScore={handleSaveMiniGameScore}
            onNavigate={handleNavigate}
          />
        );

      case 'posttest':
        return (
          <PostTestView
            user={currentUser}
            questions={getCourseQuestions(currentCourseId)}
            onCompletePostTest={handleCompletePostTest}
            onNavigate={handleNavigate}
            onResetProgress={() => handleResetCurrentCourseProgress()}
          />
        );

      case 'evaluation':
        return (
          <EvaluationView
            user={currentUser}
            initialCourseId={currentCourseId}
            initialMode={evaluationMode}
            onSubmitEvaluation={handleSubmitEvaluation}
            onNavigate={handleNavigate}
          />
        );

      case 'certificate':
        return (
          <CertificateView
            user={currentUser}
            isAdminLoggedIn={isAdminLoggedIn}
            onNavigate={handleNavigate}
            onResetProgress={() => handleResetCurrentCourseProgress()}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
          />
        );

      case 'report':
        return (
          <TrainingReportView
            user={selectedTraineeForReport ? ({
              ...currentUser,
              empId: selectedTraineeForReport.empId,
              fullName: selectedTraineeForReport.fullName,
              department: selectedTraineeForReport.department,
              position: selectedTraineeForReport.position,
              preTestScore: selectedTraineeForReport.preTestScore,
              postTestScore: selectedTraineeForReport.postTestScore,
              postTestAttempts: selectedTraineeForReport.postTestAttempts || 1,
              miniGameScore: selectedTraineeForReport.miniGameScore || 0,
              completedModules: selectedTraineeForReport.completedModules || [1, 2, 3],
              certificateId: selectedTraineeForReport.certificateId,
              certificateDate: selectedTraineeForReport.certificateDate,
              evaluationSubmitted: Boolean(selectedTraineeForReport.evaluationSubmitted),
              coursesProgress: selectedTraineeForReport.coursesProgress
            } as UserProfile) : currentUser}
            onNavigate={handleNavigate}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onOpenInhouseReport={() => {
              setInhouseReportCourseId(currentCourseId);
              setIsInhouseReportOpen(true);
            }}
            onOpenETrainingRoster={() => {
              setETrainingRosterCourseId(currentCourseId);
              setIsETrainingRosterOpen(true);
            }}
          />
        );

      case 'admin':
        return (
          <AdminBackofficeView
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onSelectTraineeForReport={(trainee) => {
              setSelectedTraineeForReport(trainee);
              handleNavigate('report');
            }}
            onOpenCourseApprovalPdf={(cId) => {
              setCourseApprovalPdfModalCourseId(cId || currentCourseId);
            }}
            onSelectCourse={handleSelectCourse}
          />
        );

      case 'approver':
        return (
          <ApproverPortalView
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case 'executive':
        return (
          <ExecutiveSummaryView
            onNavigate={handleNavigate}
          />
        );

      case 'followup30':
        return (
          <FollowUp30DaysView
            user={currentUser}
            onNavigate={handleNavigate}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
          />
        );

      case 'cqi':
        return (
          <ContinuousImprovementView
            user={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case 'guidance':
        return (
          <CourseGuidanceView
            user={currentUser}
            onNavigate={handleNavigate}
          />
        );

      default:
        return (
          <DashboardView
            user={currentUser}
            modules={getCourseModules(currentCourseId)}
            onNavigate={handleNavigate}
            onOpenRoadmap={() => setIsRoadmapOpen(true)}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
            onOpenShare={() => {
              setShareCourseId(currentCourseId);
              setIsShareOpen(true);
            }}
            onResetProgress={() => handleResetCurrentCourseProgress()}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onOpenTrainingTracker={(tab) => {
              setTrainingTrackerInitialTab(tab || 'logs');
              setIsTrainingTrackerOpen(true);
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-[#003875] selection:text-white w-full max-w-full overflow-x-hidden">
      {/* 1. Admin Impersonation / Employee Mode Banner */}
      {isAdminLoggedIn && currentUser && (
        <AdminEmployeeModeBanner
          currentUser={currentUser}
          isSystemClosed={false}
          onNavigateToAdmin={() => handleNavigate('admin')}
          onSwitchUserProfile={handleSwitchUserProfile}
          onInstantUnlockAll={handleInstantUnlockAll}
          onInstantResetProgress={() => handleResetCurrentCourseProgress()}
          onExitAdminMode={() => {
            sessionStorage.removeItem('tct_admin_auth');
            setIsAdminLoggedIn(false);
          }}
        />
      )}

      {/* 2. Top Navigation Bar (Shown whenever user is logged in or in portal views) */}
      {currentUser && currentView !== 'login' && (
        <Navbar
          user={currentUser}
          currentView={currentView}
          isAdminLoggedIn={isAdminLoggedIn}
          onNavigate={handleNavigate}
          onSwitchCourse={handleSelectCourse}
          onOpenGlossary={() => setIsGlossaryOpen(true)}
          onOpenRoadmap={() => setIsRoadmapOpen(true)}
          onOpenShare={() => {
            setShareCourseId(currentCourseId);
            setIsShareOpen(true);
          }}
          onLogout={handleLogout}
          onResetProgress={() => handleResetCurrentCourseProgress()}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onOpenTrainingTracker={(tab) => {
            setTrainingTrackerInitialTab(tab || 'logs');
            setIsTrainingTrackerOpen(true);
          }}
          onOpenCourseApprovalPdf={(cId) => {
            setCourseApprovalPdfModalCourseId(cId || currentCourseId);
          }}
        />
      )}

      {/* 3. Main View Area (with mobile bottom padding for native app bar) */}
      <main className={`flex-1 flex flex-col w-full max-w-full overflow-x-hidden ${currentUser && currentView !== 'login' ? 'pb-20 md:pb-0' : ''}`}>
        {renderViewContent()}
      </main>

      {/* 4. Global Modals & Dialogs */}
      {/* Roadmap Modal */}
      <RoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        courseId={currentCourseId}
      />

      {/* Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        courseId={currentCourseId}
      />

      {/* Course Share Modal */}
      <CourseShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        courseId={shareCourseId}
        onSelectCourseToNavigate={(cId) => {
          setIsShareOpen(false);
          handleSelectCourse(cId);
        }}
      />

      {/* Training Audit Tracker Modal */}
      <TrainingTrackerModal
        isOpen={isTrainingTrackerOpen}
        onClose={() => setIsTrainingTrackerOpen(false)}
        currentUser={currentUser}
        initialTab={trainingTrackerInitialTab}
        onOpenCourseApprovalPdf={(cId) => {
          setIsTrainingTrackerOpen(false);
          setCourseApprovalPdfModalCourseId(cId || currentCourseId);
        }}
      />

      {/* Inhouse Training Report Modal (ISO / IATF Standard) */}
      {isInhouseReportOpen && (
        <InhouseTrainingReportModal
          trainees={cachedTrainees}
          currentUser={currentUser}
          initialCourseId={inhouseReportCourseId}
          onClose={() => setIsInhouseReportOpen(false)}
        />
      )}

      {/* E-Training Roster Report Modal */}
      {isETrainingRosterOpen && (
        <ETrainingRosterReportModal
          trainees={cachedTrainees}
          currentUser={currentUser}
          initialCourseId={eTrainingRosterCourseId}
          onClose={() => setIsETrainingRosterOpen(false)}
        />
      )}

      {/* Official Course Curriculum Approval Modal (PDF Preview) */}
      {courseApprovalPdfModalCourseId && (
        <CourseApprovalPdfModal
          initialCourseId={courseApprovalPdfModalCourseId}
          onClose={() => setCourseApprovalPdfModalCourseId(null)}
        />
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && currentUser && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          user={currentUser}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Assigned Courses Modal (Pops up to show open courses for the employee) */}
      {currentUser && (
        <AssignedCoursesModal
          isOpen={isAssignedCoursesModalOpen}
          onClose={() => setIsAssignedCoursesModalOpen(false)}
          user={currentUser}
          onSelectCourse={(cId) => {
            setIsAssignedCoursesModalOpen(false);
            handleSelectCourse(cId);
          }}
        />
      )}

      {/* Training Success / Completion Congratulations Modal */}
      {currentUser && (
        <TrainingSuccessModal
          isOpen={isTrainingSuccessModalOpen}
          onClose={() => setIsTrainingSuccessModalOpen(false)}
          user={currentUser}
          course={getAllAvailableCourses().find(c => c.id === (currentUser.selectedCourseId || currentCourseId)) || getAllAvailableCourses()[0]}
          onViewCertificate={() => {
            setIsTrainingSuccessModalOpen(false);
            handleNavigate('certificate');
          }}
          onViewDashboard={() => {
            setIsTrainingSuccessModalOpen(false);
            handleNavigate('courses');
          }}
        />
      )}

      {/* Automatic Location Check-In Modal upon entering system */}
      {currentUser && isAutoLocationModalOpen && (
        <AutoLocationCheckInModal
          user={currentUser}
          activeCourseId={currentUser.selectedCourseId || currentCourseId}
          isOpen={isAutoLocationModalOpen}
          onClose={() => setIsAutoLocationModalOpen(false)}
        />
      )}

      {/* Floating System Update Notification Banner (Alerts users on PC/Mobile if server has newer code) */}
      {hasNewUpdate && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-amber-400/80 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-amber-300">ตรวจพบเวอร์ชันใหม่ล่าสุดของระบบ!</div>
              <div className="text-[11px] text-slate-300 truncate">มีอัปเดตระบบความปลอดภัย & ฟังก์ชันล่าสุด</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => forceHardRefreshAndPurgeCache()}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs whitespace-nowrap cursor-pointer shadow-md active:scale-95 transition-all shrink-0"
          >
            รีเฟรชทันที
          </button>
        </div>
      )}
    </div>
  );
}
