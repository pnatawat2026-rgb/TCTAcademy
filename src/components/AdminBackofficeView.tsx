import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TraineeRecord, UserProfile, ViewState, ActivityNotification, AttemptHistoryItem } from '../types';
import { 
  getStoredTrainees, 
  saveStoredTrainees, 
  clearAllStoredTrainees, 
  INITIAL_TRAINEES,
  QSRM_PREDEFINED_EMPLOYEES,
  APM_PREDEFINED_EMPLOYEES,
  addStoredAuditLog,
  resetTraineeLearningHistory,
  updateEmployeeProfile,
  seedAllEmployeesWithPerfectScores,
  resetAllToOriginalRealBaseline,
  addTraineeRecord,
  deleteTraineeRecord,
  getDeletedTraineeIds,
  purgeSimulatedMockTrainees,
  getUserPersistentProgress
} from '../data/traineeData';
import { APPLIED_PSYCHOLOGY_INITIAL_TRAINEES } from '../data/appliedPsychologyCourseData';
import { EditProfileModal } from './EditProfileModal';
import { AdminScoreEntryModal } from './AdminScoreEntryModal';
import { AdminExamHistoryView } from './AdminExamHistoryView';
import { 
  fetchServerTrainees, 
  fetchActivityStream, 
  resetServerDatabase, 
  importEmployeesToServer,
  resetSingleTraineeOnServer,
  deleteServerTrainee
} from '../utils/syncManager';
import { BatchTrainingReportModal } from './BatchTrainingReportModal';
import { InhouseTrainingReportModal } from './InhouseTrainingReportModal';
import { ETrainingRosterReportModal } from './ETrainingRosterReportModal';
import { CourseApprovalPdfModal } from './CourseApprovalPdfModal';
import { ContinuousImprovementView } from './ContinuousImprovementView';
import { SystemAccessSettings } from './SystemAccessSettings';
import { calculateLearningMetrics } from '../utils/scoreMetrics';
import { CohortResetModal } from './CohortResetModal';
import { CourseDeveloperStudio } from './CourseDeveloperStudio';
import { AdminCourseScheduleSettings } from './AdminCourseScheduleSettings';
import { 
  COURSE_OFFICIAL_METADATA, 
  isEmployeeEnrolledInCourse, 
  unenrollEmployeeFromCourse, 
  getCourseEnrolledEmpIds,
  enrollEmployeesInCourse
} from '../utils/courseTraineeHelper';
import { printElementViaStandaloneWindow } from '../utils/pdfExport';
import { EnrollTraineesModal } from './EnrollTraineesModal';
import { DataSecurityBadge } from './DataSecurityBadge';
import { 
  Users, 
  UserPlus,
  UserMinus,
  Search, 
  Filter, 
  Printer, 
  Download, 
  Award, 
  FileText, 
  FileCheck,
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  BarChart3, 
  ShieldCheck, 
  Building2, 
  ArrowLeft, 
  RefreshCw, 
  RotateCcw,
  Sparkles,
  Layers,
  Presentation,
  Check,
  X,
  FileSpreadsheet,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  HelpCircle,
  Calendar,
  Eye,
  EyeOff,
  Shield,
  Upload,
  FileDown,
  Trash2,
  Edit3,
  Activity,
  Cpu,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Power,
  Sliders,
  Tv,
  Bell,
  PenTool,
  Radio,
  History,
  Trophy,
  ListOrdered,
  MonitorPlay,
  BookOpen,
  Zap
} from 'lucide-react';
import { FirestoreExamDashboardView } from './FirestoreExamDashboardView';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { AdminVideoSettings } from './AdminVideoSettings';
import { SystemAutoCorrectionView } from './SystemAutoCorrectionView';
import { DEPARTMENT_LOOKUP, formatDepartment } from '../data/courseData';

interface AdminBackofficeViewProps {
  currentUser: UserProfile | null;
  onNavigate: (view: ViewState) => void;
  onSelectTraineeForReport?: (trainee: TraineeRecord) => void;
  onSelectTraineeForCert?: (trainee: TraineeRecord) => void;
  onOpenCourseApprovalPdf?: (courseId?: string) => void;
}

const VALID_ADMIN_PINS = ['25056', 'TCTADMIN', 'ADMIN2026', 'TCTDEV', 'DEV2026', 'DEVELOPER999', 'ADMIN', 'TCT', '1234', '123456', 'SECRET', 'SUPERADMIN', 'TEIJIN', 'TCTA001', 'QSRM', 'APM', 'CFM', 'PASSWORD', 'ADMIN1234', 'MASTER'];

export const AdminBackofficeView: React.FC<AdminBackofficeViewProps> = ({
  currentUser,
  onNavigate,
  onSelectTraineeForReport,
  onSelectTraineeForCert,
  onOpenCourseApprovalPdf
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Authentication State with PIN
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('tct_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Sub-view: 'roster' | 'course_schedule' | 'training_reports' | 'firestore_live' | 'exam_history' | 'cqi' | 'system_settings' | 'video_settings' | 'course_developer'
  const [adminSubView, setAdminSubView] = useState<'roster' | 'course_schedule' | 'training_reports' | 'firestore_live' | 'exam_history' | 'cqi' | 'system_settings' | 'video_settings' | 'course_developer'>('roster');

  // Trainee record & certificate modal state (for clicking trainee name)
  const [selectedTraineeForCertRecord, setSelectedTraineeForCertRecord] = useState<TraineeRecord | null>(null);

  // Trainee and backoffice states
  const [trainees, setTrainees] = useState<TraineeRecord[]>(() => getStoredTrainees(currentUser));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'postScore' | 'preScore' | 'progress' | 'recent' | 'attempts' | 'empId'>('rank');
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Real-time Activity Stream & Live Notifications
  const [activities, setActivities] = useState<ActivityNotification[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('th-TH'));
  const [isSyncing, setIsSyncing] = useState(false);

  // Attempt History Inspection Modal
  const [selectedTraineeForAttempts, setSelectedTraineeForAttempts] = useState<TraineeRecord | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [unenrollTarget, setUnenrollTarget] = useState<{ empId: string; fullName: string; courseId: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoringTrainee, setScoringTrainee] = useState<TraineeRecord | null>(null);
  const [isCohortResetOpen, setIsCohortResetOpen] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState<TraineeRecord | null>(null);
  const [isBatchReportOpen, setIsBatchReportOpen] = useState(false);
  const [isInhouseReportOpen, setIsInhouseReportOpen] = useState(false);
  const [isETrainingRosterOpen, setIsETrainingRosterOpen] = useState(false);
  const [isCourseApprovalPdfOpen, setIsCourseApprovalPdfOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // In-App Confirmation Modals (Replaces window.confirm for iframe safety)
  const [deletingTrainee, setDeletingTrainee] = useState<TraineeRecord | null>(null);
  const [resettingTrainee, setResettingTrainee] = useState<TraineeRecord | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isOfficialResetModalOpen, setIsOfficialResetModalOpen] = useState(false);
  const [isResetRealBaselineModalOpen, setIsResetRealBaselineModalOpen] = useState(false);
  const [isSeedPerfectModalOpen, setIsSeedPerfectModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form states for Add / Edit
  const [formEmpId, setFormEmpId] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formDept, setFormDept] = useState('P');
  const [formPosition, setFormPosition] = useState('พนักงานฝ่ายปฏิบัติการ');
  const [formNotes, setFormNotes] = useState('');

  // 13 Official Departments list (Teijin Cord Thailand)
  const departments = ['all', 'P', 'PP', 'PS', 'ESH', 'ST', 'SEC', 'MN', 'TC', 'TR', 'QA', 'FI', 'TW', 'RW'];

  // Periodic Real-Time Sync & Live Stream
  useEffect(() => {
    let isMounted = true;

    const syncLiveData = async () => {
      try {
        const [serverData, liveActs] = await Promise.all([
          fetchServerTrainees(),
          fetchActivityStream()
        ]);

        if (isMounted) {
          if (serverData && serverData.trainees) {
            setTrainees(serverData.trainees);
          }
          if (liveActs && liveActs.length > 0) {
            setActivities(liveActs);
          }
          setLastSyncTime(new Date().toLocaleTimeString('th-TH'));
        }
      } catch (e) {
        console.debug('Polling error', e);
      }
    };

    // Initial fetch
    syncLiveData();

    // Event listeners for real-time instantaneous sync across tabs and actions
    const handleSyncEvent = () => {
      syncLiveData();
    };
    window.addEventListener('tct_trainee_synced', handleSyncEvent);
    window.addEventListener('tct_course_enrolled', handleSyncEvent);
    window.addEventListener('storage', handleSyncEvent);

    // Auto-polling interval every 3 seconds (pauses while any edit modal is open to avoid bouncing out)
    const interval = setInterval(() => {
      if (isLiveStreaming) {
        const isAnyModalOpen = isEditModalOpen || isScoreModalOpen || isAddModalOpen || isEnrollModalOpen || isInhouseReportOpen || isBatchReportOpen || isETrainingRosterOpen;
        const activeTag = document.activeElement?.tagName;
        const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';
        if (!isAnyModalOpen && !isTyping) {
          syncLiveData();
        }
      }
    }, 3000);

    return () => {
      isMounted = false;
      window.removeEventListener('tct_trainee_synced', handleSyncEvent);
      window.removeEventListener('tct_course_enrolled', handleSyncEvent);
      window.removeEventListener('storage', handleSyncEvent);
      clearInterval(interval);
    };
  }, [isLiveStreaming, isEditModalOpen, isScoreModalOpen, isAddModalOpen, isEnrollModalOpen]);

  // Fetch active sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/active-sessions');
        const data = await res.json();
        if (data.success) setActiveSessions(data.sessions);
      } catch (e) {
        console.debug('Sessions fetch error', e);
      }
    };
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000); // 10s polling
    return () => clearInterval(interval);
  }, []);

  // Refresh list manually & Consolidate All
  const handleRefresh = async () => {
    playCyberClick();
    setIsSyncing(true);
    try {
      const [serverData, liveActs] = await Promise.all([
        fetchServerTrainees(),
        fetchActivityStream()
      ]);
      if (serverData && serverData.trainees) {
        const local = getStoredTrainees(currentUser);
        const map = new Map<string, TraineeRecord>();
        serverData.trainees.forEach((t: TraineeRecord) => map.set(t.empId.trim().toUpperCase(), t));
        local.forEach((t: TraineeRecord) => {
          const id = t.empId.trim().toUpperCase();
          if (!map.has(id)) {
            map.set(id, t);
          } else {
            const serv = map.get(id)!;
            map.set(id, {
              ...serv,
              enrolledCourses: Array.from(new Set([...(serv.enrolledCourses || []), ...(t.enrolledCourses || [])])),
              coursesProgress: {
                ...(serv.coursesProgress || {}),
                ...(t.coursesProgress || {})
              }
            });
          }
        });
        const merged = Array.from(map.values());
        setTrainees(merged);
        saveStoredTrainees(merged);
      } else {
        setTrainees(getStoredTrainees(currentUser));
      }
      if (liveActs) setActivities(liveActs);
      setLastSyncTime(new Date().toLocaleTimeString('th-TH'));
      playSuccessChime();
      setImportNotice('ซิงค์ข้อมูลและจัดอันดับผู้เข้าสอบทั้งหมดแบบเรียลไทม์สำเร็จแล้ว!');
      setTimeout(() => setImportNotice(null), 3000);
    } catch (e) {
      setTrainees(getStoredTrainees(currentUser));
    } finally {
      setIsSyncing(false);
    }
  };

  // Authenticate Admin
  const handleAuthenticate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playCyberClick();

    const cleanPin = pinInput.trim().toUpperCase();
    if (VALID_ADMIN_PINS.includes(cleanPin)) {
      sessionStorage.setItem('tct_admin_auth', 'true');
      setIsAdminAuthenticated(true);
      setPinError('');
      playSuccessChime();
      addStoredAuditLog({
        empId: 'ADMIN',
        action: 'profile_updated',
        detail: `ผู้ดูแลระบบเข้าสู่ระบบสำเร็จ (Admin / Developer Authenticated: ${cleanPin})`
      });
    } else {
      setPinError('รหัสผ่านไม่ถูกต้อง กรุณากรอกรหัส Admin หรือ Developer PIN');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const handleLockAdmin = () => {
    playCyberClick();
    sessionStorage.removeItem('tct_admin_auth');
    setIsAdminAuthenticated(false);
    setPinInput('');
    setPinError('');
  };

  // Map trainees to the selected course data (QSRM vs APM vs CFM vs AI vs TCT-A001 vs All)
  const courseResolvedTrainees = useMemo(() => {
    const deletedIds = new Set(getDeletedTraineeIds().map(id => id.toUpperCase()));
    const nonDeletedTrainees = trainees.filter(t => !deletedIds.has(t.empId.trim().toUpperCase()));

    const hasSearch = Boolean(searchTerm.trim());

    if (selectedCourseFilter === 'all') {
      const allFiltered = nonDeletedTrainees;

      return allFiltered.map(t => {
        // Resolve best course progress for displaying in consolidated table
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
        if (bestCp && (t.postTestScore === null || t.postTestScore === undefined)) {
          const isPassed = (bestCp.postTestScore !== null && bestCp.postTestScore >= 8);
          const isStarted = bestCp.preTestScore !== null || (bestCp.completedModules && bestCp.completedModules.length > 0);
          return {
            ...t,
            preTestScore: bestCp.preTestScore ?? t.preTestScore ?? null,
            postTestScore: bestCp.postTestScore ?? t.postTestScore ?? null,
            completedModules: (bestCp.completedModules && bestCp.completedModules.length > 0) ? bestCp.completedModules : (t.completedModules || []),
            status: (isPassed ? 'passed' : isStarted ? 'in_progress' : t.status) as 'passed' | 'in_progress' | 'not_started',
            certificateId: bestCp.certificateId || t.certificateId,
            certificateDate: bestCp.certificateDate || t.certificateDate,
            evaluationSubmitted: Boolean(bestCp.evaluationSubmitted || t.evaluationSubmitted),
            notes: bestCp.lastActiveStep || t.notes
          };
        }
        return t;
      });
    }

    // STRICT: Only show employees actively enrolled or learning in this specific course, unless actively searching
    const filteredForCourse = nonDeletedTrainees.filter(t => {
      const cleanId = t.empId.trim().toUpperCase();
      if (hasSearch) {
        const query = searchTerm.trim().toLowerCase();
        const matchesQuery = t.empId.toLowerCase().includes(query) || t.fullName.toLowerCase().includes(query);
        if (matchesQuery) return true;
      }
      return isEmployeeEnrolledInCourse(cleanId, selectedCourseFilter, t) ||
             (t.enrolledCourses && Array.isArray(t.enrolledCourses) && t.enrolledCourses.includes(selectedCourseFilter)) ||
             t.selectedCourseId === selectedCourseFilter ||
             Boolean(t.coursesProgress?.[selectedCourseFilter]);
    });

    const passingScore = selectedCourseFilter === 'personality-psychology' ? 15 : 8;

    return filteredForCourse.map(t => {
      const cleanId = t.empId.trim().toUpperCase();
      const persistent = getUserPersistentProgress(cleanId);
      const progress = t.coursesProgress?.[selectedCourseFilter] || persistent?.coursesProgress?.[selectedCourseFilter];
      
      if (progress) {
        const isPassed = progress.postTestScore !== null && progress.postTestScore !== undefined && progress.postTestScore >= passingScore;
        const isStarted = (progress.preTestScore !== null && progress.preTestScore !== undefined) || (progress.completedModules && progress.completedModules.length > 0) || progress.postTestScore !== null;
        return {
          ...t,
          preTestScore: progress.preTestScore ?? null,
          postTestScore: progress.postTestScore ?? null,
          postTestAttempts: progress.postTestAttempts || (progress.postTestScore !== null ? 1 : 0),
          miniGameScore: progress.miniGameScore || 0,
          completedModules: progress.completedModules || [],
          status: (isPassed ? 'passed' : isStarted ? 'in_progress' : 'not_started') as 'passed' | 'in_progress' | 'not_started',
          certificateId: progress.certificateId,
          certificateDate: progress.certificateDate,
          evaluationSubmitted: progress.evaluationSubmitted || false,
          notes: progress.lastActiveStep || t.notes,
          selectedCourseId: selectedCourseFilter
        };
      } else if (
        t.selectedCourseId === selectedCourseFilter ||
        (selectedCourseFilter === 'applied-psychology' && APPLIED_PSYCHOLOGY_INITIAL_TRAINEES.some(init => init.empId.toUpperCase() === cleanId))
      ) {
        const isPassed = t.postTestScore !== null && t.postTestScore !== undefined && t.postTestScore >= passingScore;
        const isStarted = (t.preTestScore !== null && t.preTestScore !== undefined) || (t.completedModules && t.completedModules.length > 0) || t.postTestScore !== null;
        return {
          ...t,
          status: (isPassed ? 'passed' : isStarted ? 'in_progress' : t.status) as 'passed' | 'in_progress' | 'not_started',
          selectedCourseId: selectedCourseFilter
        };
      } else {
        const hasScores = (t.preTestScore !== null && t.preTestScore !== undefined) || (t.postTestScore !== null && t.postTestScore !== undefined);
        const isPassed = (t.postTestScore ?? -1) >= passingScore;
        const isStarted = hasScores || (t.completedModules && t.completedModules.length > 0);
        return {
          ...t,
          preTestScore: t.preTestScore ?? null,
          postTestScore: t.postTestScore ?? null,
          postTestAttempts: t.postTestAttempts || (t.postTestScore !== null ? 1 : 0),
          miniGameScore: t.miniGameScore || 0,
          completedModules: t.completedModules || [],
          status: (isPassed ? 'passed' : isStarted ? 'in_progress' : t.status) as 'passed' | 'in_progress' | 'not_started',
          certificateId: t.certificateId,
          certificateDate: t.certificateDate,
          evaluationSubmitted: Boolean(t.evaluationSubmitted),
          notes: t.notes,
          selectedCourseId: selectedCourseFilter
        };
      }
    });
  }, [trainees, selectedCourseFilter, searchTerm]);

  // Compute global rankings for all trainees based on post-test, pre-test, and progress
  const rankedTrainees = useMemo(() => {
    // Sort a copy for global rank assignment
    const sortedForRank = [...courseResolvedTrainees].sort((a, b) => {
      const postA = a.postTestScore ?? -1;
      const postB = b.postTestScore ?? -1;
      if (postB !== postA) return postB - postA;

      const preA = a.preTestScore ?? -1;
      const preB = b.preTestScore ?? -1;
      if (preB !== preA) return preB - preA;

      const modA = a.completedModules?.length || 0;
      const modB = b.completedModules?.length || 0;
      if (modB !== modA) return modB - modA;

      return (b.miniGameScore || 0) - (a.miniGameScore || 0);
    });

    const rankMap = new Map<string, number>();
    sortedForRank.forEach((t, index) => {
      // Only assign numerical rank if they have at least started
      if (t.postTestScore !== null || t.preTestScore !== null || (t.completedModules && t.completedModules.length > 0)) {
        rankMap.set(t.empId, index + 1);
      }
    });

    return courseResolvedTrainees.map(t => ({
      ...t,
      examRank: rankMap.get(t.empId)
    }));
  }, [courseResolvedTrainees]);

  // Filtered and Sorted Trainees
  const filteredTrainees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = rankedTrainees.filter((t) => {
      const statusText = t.status === 'passed' ? 'ผ่าน ผ่านเกณฑ์ สำเร็จ' : t.status === 'in_progress' ? 'กำลังเรียน' : 'ยังไม่เริ่ม';
      const matchSearch = !term ||
        t.fullName.toLowerCase().includes(term) ||
        t.empId.toLowerCase().includes(term) ||
        (t.prefix && t.prefix.toLowerCase().includes(term)) ||
        (t.department && t.department.toLowerCase().includes(term)) ||
        (t.position && t.position.toLowerCase().includes(term)) ||
        (t.division && t.division.toLowerCase().includes(term)) ||
        (t.notes && t.notes.toLowerCase().includes(term)) ||
        (t.certificateId && t.certificateId.toLowerCase().includes(term)) ||
        (t.certificateDate && t.certificateDate.toLowerCase().includes(term)) ||
        (t.enrolledAt && t.enrolledAt.toLowerCase().includes(term)) ||
        (t.completedAt && t.completedAt.toLowerCase().includes(term)) ||
        (t.lastActivityAt && t.lastActivityAt.toLowerCase().includes(term)) ||
        statusText.toLowerCase().includes(term) ||
        (t.preTestScore !== null && (String(t.preTestScore) === term || `${t.preTestScore}/10`.includes(term))) ||
        (t.postTestScore !== null && (String(t.postTestScore) === term || `${t.postTestScore}/10`.includes(term)));
      
      const matchDept = selectedDept === 'all' || t.department === selectedDept || t.department.startsWith(selectedDept);
      const matchStatus = selectedStatus === 'all' || t.status === selectedStatus;

      return matchSearch && matchDept && matchStatus;
    });

    return list.sort((a, b) => {
      if (sortBy === 'rank') {
        const rankA = a.examRank ?? 999999;
        const rankB = b.examRank ?? 999999;
        if (rankA !== rankB) return rankA - rankB;
        return a.empId.localeCompare(b.empId);
      }
      if (sortBy === 'postScore') {
        const postA = a.postTestScore ?? -1;
        const postB = b.postTestScore ?? -1;
        if (postB !== postA) return postB - postA;
        return (b.preTestScore ?? -1) - (a.preTestScore ?? -1);
      }
      if (sortBy === 'preScore') {
        return (b.preTestScore ?? -1) - (a.preTestScore ?? -1);
      }
      if (sortBy === 'progress') {
        const modA = a.completedModules?.length || 0;
        const modB = b.completedModules?.length || 0;
        return modB - modA;
      }
      if (sortBy === 'attempts') {
        return (b.postTestAttempts || 0) - (a.postTestAttempts || 0);
      }
      if (sortBy === 'recent') {
        const dateA = a.lastActivityAt || a.completedAt || a.enrolledAt || '';
        const dateB = b.lastActivityAt || b.completedAt || b.enrolledAt || '';
        return dateB.localeCompare(dateA);
      }
      if (sortBy === 'empId') {
        return a.empId.localeCompare(b.empId);
      }
      return 0;
    });
  }, [rankedTrainees, searchTerm, selectedDept, selectedStatus, sortBy]);

  // Paginated list
  const totalPages = Math.ceil(filteredTrainees.length / pageSize) || 1;
  const paginatedTrainees = useMemo(() => {
    if (pageSize >= 999) return filteredTrainees;
    const start = (currentPage - 1) * pageSize;
    return filteredTrainees.slice(start, start + pageSize);
  }, [filteredTrainees, currentPage, pageSize]);

  // Overall Metrics (computed for the active course filter)
  const totalCount = courseResolvedTrainees.length;
  const passedCount = courseResolvedTrainees.filter(t => t.status === 'passed').length;
  const inProgressCount = courseResolvedTrainees.filter(t => t.status === 'in_progress').length;
  const notStartedCount = courseResolvedTrainees.filter(t => t.status === 'not_started').length;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  
  const traineesWithPre = courseResolvedTrainees.filter(t => t.preTestScore !== null);
  const avgPre = traineesWithPre.length > 0 
    ? (traineesWithPre.reduce((acc, t) => acc + (t.preTestScore || 0), 0) / traineesWithPre.length).toFixed(1)
    : '0';

  const traineesWithPost = courseResolvedTrainees.filter(t => t.postTestScore !== null);
  const avgPost = traineesWithPost.length > 0 
    ? (traineesWithPost.reduce((acc, t) => acc + (t.postTestScore || 0), 0) / traineesWithPost.length).toFixed(1)
    : '0';

  // Print Roster
  const handlePrint = () => {
    playCyberClick();
    window.print();
  };

  // Export CSV (UTF-8 with BOM)
  const handleExportCSV = () => {
    playCyberClick();
    const headers = [
      'รหัสพนักงาน (Employee ID)', 
      'ชื่อ-นามสกุล (Full Name)', 
      'แผนก/ฝ่าย (Department)', 
      'ตำแหน่ง (Position)',
      'สถานะ (Status)', 
      'คะแนนก่อนเรียน Pre-Test (10)', 
      'คะแนนหลังเรียน Post-Test (10)', 
      'พัฒนาการ & ปิดช่องว่าง (%)', 
      'คะแนนมินิเกม', 
      'ความพึงพอใจ', 
      'รหัสใบประกาศนียบัตร', 
      'วันที่สำเร็จการอบรม',
      'หมายเหตุ'
    ];
    
    const rows = filteredTrainees.map(t => {
      const m = t.preTestScore !== null && t.postTestScore !== null ? calculateLearningMetrics(t.preTestScore, t.postTestScore) : null;
      return [
        `"${t.empId}"`,
        `"${t.fullName}"`,
        `"${t.department}"`,
        `"${t.position || '-'}"`,
        t.status === 'passed' ? 'ผ่านเกณฑ์ (Passed)' : t.status === 'in_progress' ? 'กำลังเรียน (In Progress)' : 'ยังไม่เริ่ม (Not Started)',
        t.preTestScore !== null ? t.preTestScore : '-',
        t.postTestScore !== null ? t.postTestScore : '-',
        m ? `"${m.growthPercentage === 100 ? '100%' : `+${m.scoreDelta}%`} (${m.badgeLabelTh})"` : '-',
        t.miniGameScore || 0,
        t.satisfactionScore || '-',
        `"${t.certificateId || '-'}"`,
        `"${t.completedAt || t.enrolledAt || '-'}"`,
        `"${t.notes || '-'}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TCT_QSRM_Training_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    playSuccessChime();
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 4000);
  };

  // Download Sample CSV Template (for 230 Employees)
  const handleDownloadTemplate = () => {
    playCyberClick();
    const headers = ['EmployeeID', 'FullName', 'Department', 'Position'];
    const sampleRows = [
      ['TCT-P-101', 'นายสมศักดิ์ ชัยชนะ', 'P', 'พนักงานฝ่ายผลิต'],
      ['TCT-QA-102', 'นางสาวกานต์รวี สุวรรณโชติ', 'QA', 'เจ้าหน้าที่ประกันคุณภาพ'],
      ['TCT-SEC-103', 'นายนันทวัฒน์ นครินทร์', 'SEC', 'เจ้าหน้าที่ความปลอดภัย'],
      ['TCT-MN-104', 'นายธีระพล พัฒนกิจ', 'MN', 'ช่างเทคนิคซ่อมบำรุง'],
      ['TCT-PS-105', 'นางสาววาสนา ศรีสมบูรณ์', 'PS', 'พนักงานฝ่ายผลิต']
    ];

    const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Template_230_Employees_TCT.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSuccessChime();
  };

  // Batch CSV Import Handler
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          alert('ไฟล์ CSV ไม่มีข้อมูล');
          return;
        }

        const newImported: TraineeRecord[] = [];
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(s => s.replace(/(^"|"$)/g, '').trim());
          if (parts.length >= 2 && parts[0] && parts[1]) {
            const empId = parts[0].toUpperCase();
            const fullName = parts[1];
            const dept = parts[2] || 'P';
            const pos = parts[3] || 'พนักงานฝ่ายปฏิบัติการ';

            newImported.push({
              id: `imported-${Date.now()}-${i}`,
              empId,
              fullName,
              department: dept,
              position: pos,
              enrolledAt: new Date().toISOString().split('T')[0],
              status: 'not_started',
              preTestScore: null,
              postTestScore: null,
              postTestAttempts: 0,
              miniGameScore: 0,
              completedModules: [],
              evaluationSubmitted: false
            });
          }
        }

        if (newImported.length > 0) {
          // Merge with existing avoiding duplicates
          const existingMap = new Map<string, TraineeRecord>(trainees.map(t => [t.empId.toLowerCase(), t]));
          newImported.forEach(item => {
            if (!existingMap.has(item.empId.toLowerCase())) {
              existingMap.set(item.empId.toLowerCase(), item);
            }
          });

          const merged: TraineeRecord[] = Array.from(existingMap.values());
          setTrainees(merged);
          saveStoredTrainees(merged);
          addStoredAuditLog({
            empId: 'ADMIN',
            action: 'admin_imported',
            detail: `นำเข้ารายชื่อพนักงานผ่าน CSV จำนวน ${newImported.length} รายชื่อ`
          });

          playSuccessChime();
          setImportNotice(`นำเข้ารายชื่อสำเร็จ ${newImported.length} คน! (รวมพนักงานในระบบทั้งสิ้น ${merged.length} คน)`);
          setTimeout(() => setImportNotice(null), 5000);
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ CSV กรุณาตรวจสอบรูปแบบไฟล์');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset to Official Roster (รายชื่อพนักงานและหัวหน้างานจริง)
  const executeResetToOfficialRoster = () => {
    playCyberClick();
    setTrainees([...INITIAL_TRAINEES]);
    saveStoredTrainees([...INITIAL_TRAINEES]);
    addStoredAuditLog({
      empId: 'ADMIN',
      action: 'admin_imported',
      detail: 'รีเซ็ตข้อมูลเป็นรายชื่อพนักงานและหัวหน้างานจริง (Official Roster)'
    });
    playSuccessChime();
    setImportNotice('รีเซ็ตเป็นรายชื่อพนักงานและหัวหน้างานจริงเรียบร้อยแล้ว!');
    setTimeout(() => setImportNotice(null), 5000);
    setIsOfficialResetModalOpen(false);
  };

  // Clear All Data
  const executeClearAll = async () => {
    playCyberClick();
    setIsActionLoading(true);
    setIsSyncing(true);
    try {
      await resetServerDatabase();
      clearAllStoredTrainees();
      setTrainees([]);
      addStoredAuditLog({
        empId: 'ADMIN',
        action: 'data_cleared',
        detail: 'ล้างข้อมูลผู้เข้าสอบทั้งหมดเพื่อเริ่มรุ่นใหม่'
      });
      playSuccessChime();
      setImportNotice('ล้างข้อมูลเรียบร้อยแล้ว ระบบสะอาดพร้อมเริ่มการสอบของพนักงาน');
      setTimeout(() => setImportNotice(null), 4000);
    } catch (e) {
      clearAllStoredTrainees();
      setTrainees([]);
    } finally {
      setIsActionLoading(false);
      setIsSyncing(false);
      setIsClearAllModalOpen(false);
    }
  };

  // Purge simulated mock trainees without activity
  const executePurgeMockTrainees = async () => {
    playCyberClick();
    setIsActionLoading(true);
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/purge-mock-trainees', { method: 'POST' });
      const data = await res.json();
      const localPurged = purgeSimulatedMockTrainees();
      const freshData = await fetchServerTrainees();
      if (freshData?.trainees) {
        setTrainees(freshData.trainees);
      } else {
        setTrainees(getStoredTrainees(currentUser));
      }
      playSuccessChime();
      const count = data?.purgedCount ?? localPurged;
      setImportNotice(`ล้างรายชื่อจำลองที่ยังไม่เริ่มเรียนออกสำเร็จ (${count} รายชื่อ) คงเหลือพนักงานจริง ${freshData?.trainees?.length || trainees.length} ท่าน`);
      setTimeout(() => setImportNotice(null), 4500);
    } catch (e) {
      console.error('Purge error', e);
      purgeSimulatedMockTrainees();
      setTrainees(getStoredTrainees(currentUser));
    } finally {
      setIsActionLoading(false);
      setIsSyncing(false);
    }
  };

  // Add Trainee
  const handleAddTrainee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmpId.trim() || !formFullName.trim()) return;

    const targetCourse = selectedCourseFilter === 'all' ? 'applied-psychology' : selectedCourseFilter;
    const cleanId = formEmpId.trim().toUpperCase();

    const newRecord = addTraineeRecord({
      empId: cleanId,
      fullName: formFullName.trim(),
      department: formDept,
      position: formPosition.trim() || 'พนักงานฝ่ายปฏิบัติการ',
      notes: formNotes.trim() || undefined,
      selectedCourseId: targetCourse,
      enrolledAt: new Date().toLocaleDateString('th-TH')
    });

    enrollEmployeesInCourse(targetCourse, [cleanId]);

    const updated = [newRecord, ...trainees.filter(t => t.empId.trim().toUpperCase() !== cleanId)];
    setTrainees(updated);
    saveStoredTrainees(updated);

    // Sync to server backend
    try {
      fetch('/api/trainees/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: newRecord,
          activityType: 'admin_added',
          detail: `แอดมินเพิ่มพนักงานใหม่: ${newRecord.fullName} (${cleanId}) ในหลักสูตร ${targetCourse}`
        })
      }).catch(() => {});
    } catch (e) {}

    setFormEmpId('');
    setFormFullName('');
    setFormNotes('');
    setIsAddModalOpen(false);
    playSuccessChime();
    setImportNotice(`เพิ่มพนักงาน ${newRecord.fullName} (${newRecord.empId}) เรียบร้อยแล้ว`);
    setTimeout(() => setImportNotice(null), 4000);
  };

  // Edit Trainee (Profile Only - Exam Answers Protected)
  const handleOpenEditModal = (t: TraineeRecord) => {
    playCyberClick();
    setEditingTrainee(t);
    setIsEditModalOpen(true);
  };

  // Admin Manual Score Entry and Overrides
  const handleOpenScoreModal = (t: TraineeRecord) => {
    playCyberClick();
    setScoringTrainee(t);
    setIsScoreModalOpen(true);
  };

  // Execute Delete Trainee (Triggered by In-App Confirmation Modal)
  const executeDeleteTrainee = async () => {
    if (!deletingTrainee) return;
    const cleanId = deletingTrainee.empId.trim().toUpperCase();
    const traineeName = deletingTrainee.fullName;

    playCyberClick();
    setIsActionLoading(true);
    setIsSyncing(true);
    try {
      // 1. Delete on server in parallel
      await deleteServerTrainee(cleanId);
      // 2. Delete locally in storage & blacklist
      deleteTraineeRecord(cleanId);
      // 3. Immediately update UI state
      setTrainees(prev => prev.filter(t => t.empId.trim().toUpperCase() !== cleanId));
      playSuccessChime();
      setImportNotice(`ลบข้อมูลพนักงาน ${traineeName} (${cleanId}) ออกจากระบบเรียบร้อยแล้ว`);
      setTimeout(() => setImportNotice(null), 3500);
    } catch (e) {
      console.error('Delete error', e);
      deleteTraineeRecord(cleanId);
      setTrainees(prev => prev.filter(t => t.empId.trim().toUpperCase() !== cleanId));
    } finally {
      setIsActionLoading(false);
      setIsSyncing(false);
      setDeletingTrainee(null);
    }
  };

  // Execute Reset Individual Employee Learning History
  const executeResetSingleTrainee = async () => {
    if (!resettingTrainee) return;
    const t = resettingTrainee;
    const cleanId = t.empId.trim().toUpperCase();

    playCyberClick();
    setIsActionLoading(true);
    setIsSyncing(true);
    try {
      // 1. Reset on server
      await resetSingleTraineeOnServer(cleanId);
      
      // 2. Reset in client localStorage layers
      resetTraineeLearningHistory(cleanId);

      // 3. Update local state in view
      setTrainees(prev => prev.map(item => {
        if (item.empId.trim().toUpperCase() === cleanId) {
          return {
            ...item,
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
            currentStep: 'ยังไม่เริ่มเรียน (รีเซ็ตเพื่อเข้าเรียนใหม่)',
            attemptsHistory: []
          };
        }
        return item;
      }));

      if (selectedTraineeForAttempts && selectedTraineeForAttempts.empId.trim().toUpperCase() === cleanId) {
        setSelectedTraineeForAttempts({
          ...selectedTraineeForAttempts,
          status: 'not_started',
          preTestScore: null,
          postTestScore: null,
          postTestAttempts: 0,
          miniGameScore: 0,
          completedModules: [],
          attemptsHistory: []
        });
      }

      playSuccessChime();
      setImportNotice(`ล้างประวัติการเรียนของ ${t.fullName} (${cleanId}) เรียบร้อยแล้ว (สามารถเข้าเรียนใหม่ได้)`);
      setTimeout(() => setImportNotice(null), 4000);
    } catch (e) {
      console.error('Reset error', e);
      resetTraineeLearningHistory(cleanId);
      setTrainees(prev => prev.map(item => {
        if (item.empId.trim().toUpperCase() === cleanId) {
          return {
            ...item,
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
            currentStep: 'ยังไม่เริ่มเรียน',
            attemptsHistory: []
          };
        }
        return item;
      }));
    } finally {
      setIsActionLoading(false);
      setIsSyncing(false);
      setResettingTrainee(null);
    }
  };

  // Execute Reset Real Baseline
  const executeResetRealBaseline = () => {
    playCyberClick();
    resetAllToOriginalRealBaseline();
    handleRefresh();
    playSuccessChime();
    setImportNotice('✅ รีเซ็ตข้อมูลผลการเรียนและการทดสอบกลับเป็นค่าจริงดั้งเดิมเรียบร้อยแล้ว!');
    setTimeout(() => setImportNotice(null), 6000);
    setIsResetRealBaselineModalOpen(false);
  };

  // Execute Seed Perfect 10/10
  const executeSeedPerfect = () => {
    playCyberClick();
    seedAllEmployeesWithPerfectScores();
    handleRefresh();
    playSuccessChime();
    setImportNotice('✅ บันทึกคะแนนเต็ม 10/10 ทุกหลักสูตรให้กับพนักงานทุกคนสำเร็จแล้ว!');
    setTimeout(() => setImportNotice(null), 5000);
    setIsSeedPerfectModalOpen(false);
  };

  // View Trainee Report
  const handleViewIndividualReport = (trainee: TraineeRecord) => {
    playCyberClick();
    if (onSelectTraineeForReport) {
      onSelectTraineeForReport(trainee);
    } else {
      onNavigate('report');
    }
  };

  // =========================================================================
  // 1. ADMIN SECURITY AUTHENTICATION GATE (PASSWORD PROTECTED)
  // =========================================================================
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 sm:py-20 font-sarabun">
        <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden ${isShaking ? 'animate-bounce' : ''}`}>
          
          <div className="space-y-6 relative z-10">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-200 p-0.5 shadow-sm flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-[#005A9C]" />
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold text-[#005A9C] uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block mb-1.5">
                  RESTRICTED ACCESS • AUTHORIZED ONLY
                </span>
                <h1 className="text-xl font-bold text-[#002855]">
                  ระบบผู้ดูแลระบบ (Admin Portal)
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  กรุณากรอกรหัสผ่านเพื่อเข้าถึงฐานข้อมูลผู้เข้าอบรม 230 คน และระบบวิเคราะห์ผล
                </p>
              </div>
            </div>

            <form onSubmit={handleAuthenticate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  รหัสผ่านผู้ดูแลระบบ (Admin Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pinInput}
                    onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                    placeholder="กรอกรหัสผ่านเพื่อเข้าใช้งาน"
                    autoFocus
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#005A9C] rounded-xl pl-4 pr-11 py-3 text-base font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {pinError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2 animate-fadeIn">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  id="admin-auth-submit-btn"
                  className="w-full bg-[#002D5A] hover:bg-[#001f3f] text-white font-bold text-sm py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Unlock className="w-4 h-4" />
                  <span>เข้าสู่ระบบผู้ดูแล (Sign In)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { playCyberClick(); onNavigate('approver'); }}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs py-2 rounded-xl border border-emerald-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold"
                >
                  <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ไปยังระบบผู้อนุมัติ (Approver Portal)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { playCyberClick(); onNavigate(currentUser ? 'dashboard' : 'login'); }}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs py-2 rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>กลับสู่หน้าลงทะเบียน / หน้าหลัก</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED ADMIN BACKOFFICE
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 font-sarabun text-slate-800">
      
      {/* Hidden File Input for CSV Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleCSVImport} 
        accept=".csv" 
        className="hidden" 
      />

      {/* Top Banner Toolbar - Official Corporate Royal Navy Design */}
      <div className="no-print bg-gradient-to-r from-[#001f3f] via-[#002D5A] to-[#005A9C] rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-blue-900/40 relative z-30">
        {/* Subtle decorative background glow (encapsulated so it doesn't clip dropdowns) */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/95 p-1 shadow-md flex items-center justify-center shrink-0 border border-white/50">
              <img 
                src="/tct-academy-logo.svg" 
                alt="TCT Academy" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono px-3 py-0.5 rounded-full bg-blue-900/80 text-amber-300 border border-blue-400/30 font-bold flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  TEIJIN CORD LMS ADMIN • AUTHENTICATED
                </span>
                <span className="text-xs text-blue-200/90 font-mono">
                  พนักงานลงทะเบียนและเข้าสอบจริง: {trainees.length} ท่าน (บันทึกข้อมูลตามจริง)
                </span>
                <DataSecurityBadge variant="compact" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
                ศูนย์จัดการข้อมูลและวิเคราะห์ผลการฝึกอบรม (LMS Backoffice & CQI)
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl mt-0.5">
                จัดการรายชื่อพนักงาน ตรวจสอบผลสัมฤทธิ์ ออกรายงานทางการ A4 และบันทึกแผนพัฒนาคุณภาพต่อเนื่อง (CAPA)
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Live Real-Time Stream Status & Bell Notifications */}
            <div className="relative">
              <button
                id="admin-btn-live-stream-toggle"
                onClick={() => {
                  playCyberClick();
                  setShowActivityDrawer(!showActivityDrawer);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer min-h-[38px] ${
                  isLiveStreaming
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30'
                    : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
                }`}
                title="คลิกเพื่อดูประวัติการแจ้งเตือนกิจกรรมเรียลไทม์ (Real-Time Live Activity Stream)"
              >
                <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'text-emerald-300 animate-spin' : 'text-slate-300'}`} />
                <span className="hidden sm:inline">{isLiveStreaming ? 'LIVE เรียลไทม์' : 'PAUSED'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-mono">
                  {activities.length}
                </span>
                <Bell className="w-3.5 h-3.5 text-amber-300" />
              </button>

              {/* Activity Stream Popover Drawer */}
              {showActivityDrawer && (
                <div className="absolute right-0 top-12 z-[100] w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white border border-slate-200 p-4 shadow-2xl space-y-3 font-sarabun text-xs animate-fadeIn text-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <span className="font-bold text-slate-900">การแจ้งเตือนสด (Live Activity Feed)</span>
                    </div>
                    <button onClick={() => setShowActivityDrawer(false)} className="text-slate-400 hover:text-slate-600 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>อัปเดตอัตโนมัติทุก 3 วินาที</span>
                    <span className="font-mono text-[#005A9C] font-semibold">{lastSyncTime}</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {activities.length === 0 ? (
                      <div className="py-6 text-center text-slate-400">
                        ยังไม่มีกิจกรรมใหม่ในระบบ
                      </div>
                    ) : (
                      activities.slice(0, 20).map((act) => (
                        <div key={act.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 hover:border-blue-300 transition-colors">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-mono font-bold text-[#005A9C] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {act.empId} • แผนก {act.department}
                            </span>
                            <span className="text-slate-400 font-mono">
                              {new Date(act.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-slate-800 font-medium text-xs">
                            {act.detail}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                      className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>สถานะสตรีม:</span>
                      <span className={isLiveStreaming ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {isLiveStreaming ? '🟢 เปิดอยู่' : '⏸️ หยุดชั่วคราว'}
                      </span>
                    </button>
                    <button
                      onClick={handleRefresh}
                      className="text-[11px] text-[#005A9C] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>รีเฟรชสด</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Employee View Preview Button */}
            <button
              id="admin-btn-preview-employee-view"
              onClick={() => {
                playCyberClick();
                onNavigate('courses');
              }}
              className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs py-2 px-3.5 rounded-xl border border-white/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[38px] shadow-xs"
              title="สลับไปตรวจสอบระบบในมุมมองของพนักงาน (Employee View)"
            >
              <Eye className="w-3.5 h-3.5 text-blue-200" />
              <span>มุมมองพนักงาน</span>
            </button>

            {/* Refresh Live */}
            <button
              onClick={handleRefresh}
              disabled={isSyncing}
              className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs py-2 px-3.5 rounded-xl border border-white/20 transition-all cursor-pointer min-h-[38px] flex items-center gap-1.5"
              title="ซิงค์และรวมผลสอบทุกเครื่องทันที"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-200' : ''}`} />
              <span>ซิงค์ข้อมูลสด</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={handleLockAdmin}
              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white font-medium text-xs py-2 px-3.5 rounded-xl border border-rose-400/30 transition-all cursor-pointer min-h-[38px] flex items-center gap-1.5"
              title="ออกจากระบบแอดมิน (Sign Out)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>

        {/* Notice alert */}
        {importNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xs text-emerald-100 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{importNotice}</span>
            </div>
            <button onClick={() => setImportNotice(null)} className="text-white/70 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 3 PRIMARY ADMIN MANAGEMENT MENUS (Organized & Uncluttered)           */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch gap-2.5 font-sarabun">
        {/* MENU 1: Trainees Management */}
        <button
          id="admin-menu-trainees-btn"
          onClick={() => { playCyberClick(); setAdminSubView('roster'); }}
          className={`flex-1 flex items-center gap-3 p-3.5 rounded-xl transition-all cursor-pointer text-left border ${
            adminSubView === 'roster'
              ? 'bg-[#002D5A] text-white border-[#002D5A] shadow-md ring-2 ring-blue-400/30'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            adminSubView === 'roster' ? 'bg-white/15 text-blue-300' : 'bg-blue-50 text-[#005A9C]'
          }`}>
            <Users className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs sm:text-sm font-black tracking-tight">
              เมนูที่ 1: จัดการข้อมูลพนักงาน
            </div>
            <div className={`text-[11px] font-medium leading-tight ${adminSubView === 'roster' ? 'text-blue-200' : 'text-slate-500'}`}>
              เพิ่ม • ลบ • แก้ไข • คลิกชื่อดูบันทึก & เกียรติบัตร
            </div>
          </div>
        </button>

        {/* MENU 2: Course Schedule (Open/Close, Start/End Date) */}
        <button
          id="admin-menu-schedules-btn"
          onClick={() => { playCyberClick(); setAdminSubView('course_schedule'); }}
          className={`flex-1 flex items-center gap-3 p-3.5 rounded-xl transition-all cursor-pointer text-left border ${
            adminSubView === 'course_schedule'
              ? 'bg-[#002D5A] text-white border-[#002D5A] shadow-md ring-2 ring-amber-400/30'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            adminSubView === 'course_schedule' ? 'bg-white/15 text-amber-300' : 'bg-amber-50 text-amber-600'
          }`}>
            <Calendar className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs sm:text-sm font-black tracking-tight">
              เมนูที่ 2: จัดเวลาการอบรม
            </div>
            <div className={`text-[11px] font-medium leading-tight ${adminSubView === 'course_schedule' ? 'text-amber-200' : 'text-slate-500'}`}>
              ปิด • เปิด • กำหนดวันที่เริ่ม - วันที่สิ้นสุด
            </div>
          </div>
        </button>

        {/* MENU 3: Training Reports Suite (A4 Portrait & Landscape) */}
        <button
          id="admin-menu-reports-btn"
          onClick={() => { playCyberClick(); setAdminSubView('training_reports'); }}
          className={`flex-1 flex items-center gap-3 p-3.5 rounded-xl transition-all cursor-pointer text-left border ${
            adminSubView === 'training_reports'
              ? 'bg-[#002D5A] text-white border-[#002D5A] shadow-md ring-2 ring-emerald-400/30'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            adminSubView === 'training_reports' ? 'bg-white/15 text-emerald-300' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs sm:text-sm font-black tracking-tight">
              เมนูที่ 3: รายงานสรุปผลการฝึกอบรม
            </div>
            <div className={`text-[11px] font-medium leading-tight ${adminSubView === 'training_reports' ? 'text-emerald-200' : 'text-slate-500'}`}>
              พิมพ์ขนาด A4 พอดี ทั้งแนวตั้งและแนวนอน
            </div>
          </div>
        </button>
      </div>

      {/* Secondary Tools Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-print scrollbar-thin">
        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap pl-1">เครื่องมือเพิ่มเติม:</span>
        <button
          onClick={() => { playCyberClick(); setAdminSubView('firestore_live'); }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            adminSubView === 'firestore_live' 
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>ผลสอบ Real-time (Firestore)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </button>

        <button
          onClick={() => { playCyberClick(); setAdminSubView('exam_history'); }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            adminSubView === 'exam_history' 
              ? 'bg-[#002D5A] text-white shadow-xs' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>ประวัติการทำข้อสอบทั้งหมด</span>
        </button>

        <button
          onClick={() => { playCyberClick(); setAdminSubView('cqi'); }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            adminSubView === 'cqi' 
              ? 'bg-[#002D5A] text-white shadow-xs' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>พัฒนาคุณภาพต่อเนื่อง & CQI</span>
        </button>

        <button
          onClick={() => { playCyberClick(); setAdminSubView('video_settings'); }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            adminSubView === 'video_settings' 
              ? 'bg-[#002D5A] text-white shadow-xs' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>จัดการลิงก์วิดีโอ (Video CMS)</span>
        </button>

        <button
          onClick={() => { playCyberClick(); setAdminSubView('course_developer'); }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            adminSubView === 'course_developer' 
              ? 'bg-[#002D5A] text-white shadow-xs' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>สตูดิโอพัฒนาหลักสูตร</span>
        </button>

        <button
          onClick={() => { playCyberClick(); setAdminSubView('system_settings'); }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            adminSubView === 'system_settings' 
              ? 'bg-[#002D5A] text-white shadow-xs' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>เปิด/ปิดระบบชั่วคราว</span>
        </button>

        <button
          onClick={() => { playCyberClick(); onNavigate('approver'); }}
          className="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 ml-auto"
        >
          <PenTool className="w-3.5 h-3.5 text-emerald-600" />
          <span>ศูนย์ผู้อนุมัติ 3 ท่าน</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* VIEW 3: TRAINING REPORTS SUITE (A4 PORTRAIT & LANDSCAPE PRINT)       */}
      {/* ==================================================================== */}
      {adminSubView === 'training_reports' && (
        <div className="space-y-6 font-sarabun animate-fadeIn">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <FileText className="w-3.5 h-3.5" />
                <span>OFFICIAL TRAINING REPORTS • A4 STANDARDIZED</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#002D5A] tracking-tight">
                ศูนย์จัดการและพิมพ์รายงานสรุปผลการฝึกอบรม
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                เอกสารรายงานราชการและระบบคุณภาพ ISO รองรับการพิมพ์และส่งออกขนาด A4 พอดี ไม่ล้น ไม่ตกขอบ ทั้งแนวตั้งและแนวนอน
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>ส่งออก Excel / CSV ทั้งหมด</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>นำเข้า CSV</span>
              </button>
            </div>
          </div>

          {/* 5 Official Report Types Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Report 1: Individual Training Report */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#005A9C] border border-blue-200 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    A4 แนวตั้ง & แนวนอน
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    รายงานผลการฝึกอบรมรายบุคคล
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    บันทึกประวัติการเรียน ผลสอบ Pre/Post และสถิติการเรียนรู้รายบุคคล ขนาด A4 พอดี สำหรับแนบแฟ้มประวัติพนักงาน
                  </p>
                </div>

                {/* Trainee Quick Selector */}
                <div className="pt-1">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">เลือกพนักงาน:</label>
                  <select
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#005A9C]"
                    onChange={(e) => {
                      const emp = trainees.find(t => t.empId === e.target.value);
                      if (emp && onSelectTraineeForReport) {
                        onSelectTraineeForReport(emp);
                      }
                    }}
                    defaultValue={trainees[0]?.empId || ''}
                  >
                    {trainees.map(t => (
                      <option key={t.empId} value={t.empId}>
                        {t.empId} - {t.fullName} (แผนก {t.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    if (trainees.length > 0 && onSelectTraineeForReport) {
                      onSelectTraineeForReport(trainees[0]);
                    }
                    onNavigate('report');
                  }}
                  className="w-full h-10 rounded-xl bg-[#002D5A] hover:bg-[#001D3D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>เปิดรายงานเพื่อพิมพ์ (A4 แนวตั้ง/แนวนอน)</span>
                </button>
              </div>
            </div>

            {/* Report 2: Official In-House Training Report HRD-TR-00-05 */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    แบบฟอร์มทางการ
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    แบบรายงานผลการฝึกอบรมภายใน (HRD-TR-00-05)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    เอกสารทางการสำหรับฝ่ายทรัพยากรบุคคลและระบบ ISO สรุปผลการประเมิน 4 มิติ และสถิติรวมผู้เข้าอบรม
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { playCyberClick(); setIsInhouseReportOpen(true); }}
                  className="w-full h-10 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>เปิดและพิมพ์รายงาน HRD-TR-00-05 (A4)</span>
                </button>
              </div>
            </div>

            {/* Report 3: E-Training Roster Report */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-purple-300 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    บัญชีรายชื่อ & คะแนน
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    ใบรายชื่อและคะแนนสอบ E-Training Roster
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    ตารางบัญชีรายชื่อผู้เข้าอบรม คะแนนสอบก่อนเรียนและหลังเรียน เรียงตามแผนกและรหัสพนักงาน
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { playCyberClick(); setIsETrainingRosterOpen(true); }}
                  className="w-full h-10 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>เปิดและพิมพ์ใบรายชื่อ & คะแนน (A4)</span>
                </button>
              </div>
            </div>

            {/* Report 4: Batch Training Report */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    รายงานสรุปผลรวมรุ่น
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    รายงานสรุปผลการอบรมรวมรุ่น A4 (Batch Report)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    สถิติผู้ผ่านการประเมิน อัตราความสำเร็จ และการวิเคราะห์พัฒนาการของแต่ละรุ่น (Batch Summary)
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { playCyberClick(); setIsBatchReportOpen(true); }}
                  className="w-full h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>เปิดรายงานสรุปรวม A4 (Batch Report)</span>
                </button>
              </div>
            </div>

            {/* Report 5: Course Proposal Document */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    แบบเสนอขออนุมัติ
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    แบบเสนอขออนุมัติหลักสูตร (Course Proposal PDF)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    สารบัญโครงสร้างเนื้อหา วัตถุประสงค์ และชุดข้อสอบจริง สำหรับเสนอผู้บริหารเซ็นอนุมัติ
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    if (onOpenCourseApprovalPdf) {
                      onOpenCourseApprovalPdf(selectedCourseFilter !== 'all' ? selectedCourseFilter : 'applied-psychology');
                    } else {
                      setIsCourseApprovalPdfOpen(true);
                    }
                  }}
                  className="w-full h-10 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์ขออนุมัติหลักสูตร (PDF A4)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW -3: COURSE SCHEDULE SETTINGS (START/END DATE & OPEN/CLOSE)      */}
      {/* ==================================================================== */}
      {adminSubView === 'course_schedule' && (
        <AdminCourseScheduleSettings onScheduleUpdated={handleRefresh} />
      )}

      {/* ==================================================================== */}
      {/* VIEW -2: COURSE DEVELOPER STUDIO                                     */}
      {/* ==================================================================== */}
      {adminSubView === 'course_developer' && (
        <CourseDeveloperStudio onCourseCreatedOrUpdated={handleRefresh} />
      )}

      {/* ==================================================================== */}
      {/* VIEW -1: VIDEO CMS / YOUTUBE URL SETTINGS                            */}
      {/* ==================================================================== */}
      {adminSubView === 'video_settings' && (
        <AdminVideoSettings />
      )}

      {/* ==================================================================== */}
      {/* VIEW 0: SYSTEM ACCESS SETTINGS (ON/OFF MASTER SWITCH & SCHEDULE)     */}
      {/* ==================================================================== */}
      {adminSubView === 'system_settings' && (
        <div className="space-y-6">
          <SystemAccessSettings />
          <SystemAutoCorrectionView />
          
          {/* Active Exam Sessions Monitor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs font-sarabun">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
              <MonitorPlay className="w-4 h-4 text-emerald-600" />
              <span>เซสชันการสอบที่กำลังใช้งานอยู่ (Active Exam Sessions)</span>
            </div>
            {activeSessions.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">ไม่มีผู้ใช้งานใน 5 นาทีที่ผ่านมา</div>
            ) : (
              <div className="space-y-2">
                {activeSessions.map(s => (
                  <div key={s.empId} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-mono text-[#005A9C] font-semibold">{s.empId} - {s.fullName}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">กำลังใช้งาน</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 0: FIRESTORE LIVE REAL-TIME DASHBOARD (EXAM_SUBMISSIONS)        */}
      {/* ==================================================================== */}
      {adminSubView === 'firestore_live' && (
        <FirestoreExamDashboardView
          onViewCertificate={(sub) => {
            const existingT = trainees.find(t => t.empId === sub.empId);
            const traineeUser: TraineeRecord = {
              id: sub.empId,
              empId: sub.empId,
              fullName: sub.fullName,
              department: sub.department,
              selectedCourseId: sub.courseId,
              enrolledAt: existingT?.enrolledAt || sub.submittedAt,
              completedAt: sub.submittedAt,
              status: sub.passed ? 'passed' : 'in_progress',
              preTestScore: sub.examType === 'pretest' ? sub.score : (existingT?.preTestScore ?? null),
              postTestScore: sub.examType === 'posttest' ? sub.score : (existingT?.postTestScore ?? null),
              postTestAttempts: sub.attemptNumber || existingT?.postTestAttempts || 1,
              miniGameScore: existingT?.miniGameScore ?? 0,
              completedModules: existingT?.completedModules ?? [1, 2, 3],
              evaluationSubmitted: existingT?.evaluationSubmitted ?? true,
              certificateId: sub.certificateId || existingT?.certificateId
            };
            if (onSelectTraineeForReport) onSelectTraineeForReport(traineeUser);
            onNavigate('certificate');
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* VIEW 0.5: ALL EXAM ATTEMPTS & HISTORY LOGS                           */}
      {/* ==================================================================== */}
      {adminSubView === 'exam_history' && (
        <AdminExamHistoryView
          trainees={trainees}
          onRefresh={handleRefresh}
          onSelectTraineeForAttempts={(t) => setSelectedTraineeForAttempts(t)}
          onOpenScoreModal={(t) => handleOpenScoreModal(t)}
          onViewCertificate={(t) => {
            if (onSelectTraineeForReport) onSelectTraineeForReport(t);
            onNavigate('certificate');
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* VIEW 1: CQI & CONTINUOUS IMPROVEMENT                                 */}
      {/* ==================================================================== */}
      {adminSubView === 'cqi' && (
        <ContinuousImprovementView 
          trainees={trainees} 
        />
      )}

      {/* ==================================================================== */}
      {/* VIEW 2: TRAINEE ROSTER & BATCH MANAGEMENT                            */}
      {/* ==================================================================== */}
      {adminSubView === 'roster' && (
        <div className="space-y-6">
          {/* Interactive Course Selection Tabs */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap mr-1 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#005A9C]" />
                <span>เลือกดูตามหลักสูตร:</span>
              </span>

              <button
                onClick={() => { playCyberClick(); setSelectedCourseFilter('all'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCourseFilter === 'all'
                    ? 'bg-[#002855] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ทุกหลักสูตร (All)</span>
              </button>

              {/* Applied Psychology - Main course for 12-16 Oct 2569 */}
              <button
                id="tab-course-applied-psychology"
                onClick={() => { playCyberClick(); setSelectedCourseFilter('applied-psychology'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCourseFilter === 'applied-psychology'
                    ? 'bg-teal-700 text-white shadow-md ring-2 ring-teal-400/40'
                    : 'text-teal-900 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 border border-teal-300 font-extrabold'
                }`}
                title="หลักสูตรจิตวิทยาประยุกต์ในการทำงาน (รอบที่ 1: 12-16 ต.ค. 2569)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>🧠 จิตวิทยาประยุกต์ (Applied Psychology)</span>
              </button>

              <button
                onClick={() => { playCyberClick(); setSelectedCourseFilter('risk-management'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCourseFilter === 'risk-management'
                    ? 'bg-[#005A9C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>1: บริหารความเสี่ยง QSRM</span>
              </button>

              <button
                onClick={() => { playCyberClick(); setSelectedCourseFilter('advanced-preventive-maintenance'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCourseFilter === 'advanced-preventive-maintenance'
                    ? 'bg-[#005A9C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>2: บำรุงรักษา APM</span>
              </button>

              <button
                onClick={() => { playCyberClick(); setSelectedCourseFilter('conflict-management'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCourseFilter === 'conflict-management'
                    ? 'bg-[#005A9C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3: การจัดการความขัดแย้ง CFM</span>
              </button>

              <button
                onClick={() => { playCyberClick(); setSelectedCourseFilter('ai-for-tct'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCourseFilter === 'ai-for-tct'
                    ? 'bg-[#005A9C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>4: AI for TCT (AI-101)</span>
              </button>

              <button
                onClick={() => { playCyberClick(); setSelectedCourseFilter('personality-psychology'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCourseFilter === 'personality-psychology'
                    ? 'bg-[#005A9C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>5: จิตวิทยาบุคลิกภาพ (A001)</span>
              </button>

              <button
                onClick={() => { playCyberClick(); setSelectedCourseFilter('kyt-shisa-kanko'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCourseFilter === 'kyt-shisa-kanko'
                    ? 'bg-[#005A9C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>6: KYT ชี้มือย้ำปาก</span>
              </button>
            </div>

            {/* Current Course Indicator Badge & Enroll Action */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">

              <button
                id="btn-open-enroll-modal"
                type="button"
                onClick={() => {
                  playCyberClick();
                  setIsEnrollModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="เลือกพนักงานจากระบบและลงทะเบียนเข้าสู่หลักสูตรนี้"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ แอดรายชื่อเข้าเรียน (+ Enroll)</span>
              </button>

              <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[#005A9C] font-mono text-[11px] font-bold">
                {selectedCourseFilter === 'all' 
                  ? 'ภาพรวมระบบ (CONSOLIDATED)' 
                  : COURSE_OFFICIAL_METADATA[selectedCourseFilter]?.code || selectedCourseFilter.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Summary KPIs: How many people have entered, learning, passed */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
                <span className="font-semibold">ผู้ลงทะเบียนทั้งหมด</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#005A9C] flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{totalCount} คน</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {selectedCourseFilter === 'all' 
                  ? 'พนักงานที่ได้รับการลงทะเบียนในระบบ' 
                  : `ลงทะเบียนใน ${COURSE_OFFICIAL_METADATA[selectedCourseFilter]?.code || selectedCourseFilter}`}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
                <span className="font-semibold">กำลังเรียนอยู่ (In Progress)</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-600 font-mono">{inProgressCount} คน</div>
              <div className="text-[11px] text-amber-700/80 mt-1">เข้ามาเริ่มทำ Pre-Test หรือบทเรียนแล้ว</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
                <span className="font-semibold">ผ่านเกณฑ์ประเมิน (Passed)</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-600 font-mono">{passedCount} คน ({passRate}%)</div>
              <div className="text-[11px] text-emerald-700/80 mt-1">สอบผ่านและได้รับใบประกาศแล้ว</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
                <span className="font-semibold">ยังไม่เริ่มเรียน (Not Started)</span>
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-600 font-mono">{notStartedCount} คน</div>
              <div className="text-[11px] text-slate-500 mt-1">มีสิทธิ์ในหลักสูตร แต่ยังไม่เริ่มทำแบบทดสอบ</div>
            </div>
          </div>

          {/* Table Filter & Real-Time Sort Controls */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="ค้นหาได้ทุกอย่าง: รหัส, ชื่อ-สกุล, แผนก, ตำแหน่ง, ฝ่าย, คะแนน, วุฒิบัตร..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#005A9C]"
                />
              </div>

              {/* Course Selector Dropdown in Filter */}
              <select
                value={selectedCourseFilter}
                onChange={(e: any) => { setSelectedCourseFilter(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#005A9C] font-bold focus:bg-white focus:outline-none focus:border-[#005A9C]"
              >
                <option value="all">🌟 ทุกหลักสูตร (ภาพรวม)</option>
                <option value="applied-psychology">🧠 7: จิตวิทยาประยุกต์ในการทำงาน (Applied Psychology)</option>
                <option value="risk-management">🛡️ 1: บริหารความเสี่ยง QSRM</option>
                <option value="advanced-preventive-maintenance">⚙️ 2: บำรุงรักษา APM</option>
                <option value="conflict-management">🤝 3: การจัดการความขัดแย้ง CFM</option>
                <option value="ai-for-tct">🤖 4: AI for TCT (AI-101)</option>
                <option value="personality-psychology">🧠 5: จิตวิทยาบุคลิกภาพ (A001)</option>
                <option value="kyt-shisa-kanko">👉 6: ความปลอดภัย KYT ชี้และเรียก</option>
              </select>

              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#005A9C]"
              >
                <option value="all">ทุกแผนก (13 แผนก TCT)</option>
                {departments.filter(d => d !== 'all').map(d => (
                  <option key={d} value={d}>
                    แผนก {d} {DEPARTMENT_LOOKUP[d] ? `(${DEPARTMENT_LOOKUP[d].nameEn})` : ''}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#005A9C]"
              >
                <option value="all">ทุกสถานะ ({filteredTrainees.length})</option>
                <option value="passed">🏆 ผ่านเกณฑ์ 80% (Passed)</option>
                <option value="in_progress">🟡 กำลังเรียน / สอบ (In Progress)</option>
                <option value="not_started">⚪ ยังไม่เริ่ม (Not Started)</option>
              </select>

              {/* Multi-Factor Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-[#005A9C] shrink-0" />
                <span className="text-slate-500 text-[11px] whitespace-nowrap">เรียงตาม:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="rank">🥇 อันดับคะแนนรวม (Global Rank)</option>
                  <option value="postScore">🏆 คะแนน Post-Test (มาก ➔ น้อย)</option>
                  <option value="preScore">📝 คะแนน Pre-Test (มาก ➔ น้อย)</option>
                  <option value="progress">📊 ความก้าวหน้าบทเรียน (%)</option>
                  <option value="recent">⏱️ กิจกรรมล่าสุด (Active ล่าสุด)</option>
                  <option value="attempts">🔁 จำนวนครั้งที่สอบ (Attempts)</option>
                  <option value="empId">🆔 รหัสพนักงาน (ID)</option>
                </select>
              </div>
            </div>

            {/* Batch Helper Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                id="btn-toolbar-enroll-trainees"
                type="button"
                onClick={() => {
                  playCyberClick();
                  setIsEnrollModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="แอดรายชื่อพนักงานเข้าเรียนในหลักสูตรที่เลือก"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ แอดเข้าเรียน</span>
              </button>

              <button
                onClick={() => {
                  setFormEmpId('');
                  setFormFullName('');
                  setFormDept('P');
                  setFormPosition('พนักงานฝ่ายปฏิบัติการ');
                  setFormNotes('');
                  setIsAddModalOpen(true);
                }}
                className="bg-[#002D5A] hover:bg-[#001f3f] text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>เพิ่มรายคน</span>
              </button>

              <button
                onClick={() => {
                  playCyberClick();
                  setIsOfficialResetModalOpen(true);
                }}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="รีเซ็ตเป็นรายชื่อพนักงานและหัวหน้างานจริง (Official Roster)"
              >
                <Users className="w-4 h-4 text-[#005A9C]" />
                <span>รายชื่อพนักงานจริง</span>
              </button>

              <button
                onClick={() => {
                  playCyberClick();
                  setIsClearAllModalOpen(true);
                }}
                className="bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 px-3 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                title="ล้างข้อมูลทั้งหมดเพื่อเริ่มรุ่นใหม่"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Live Ticker Alert Strip */}
          {activities.length > 0 && (
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs animate-fadeIn">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#005A9C] border border-blue-200 font-mono text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <Radio className="w-3 h-3 text-[#005A9C] animate-pulse" />
                  REAL-TIME ALERT
                </span>
                <span className="text-slate-700 truncate font-medium">
                  {activities[0]?.detail}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                {new Date(activities[0]?.timestamp).toLocaleTimeString('th-TH')}
              </span>
            </div>
          )}

          {/* Trainee Table with Rank, Live Step & Attempt History */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse font-sarabun">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[11px] font-mono">
                  <th className="py-3 px-3 text-center font-bold">อันดับ (Rank)</th>
                  <th className="py-3 px-3 font-bold">รหัสพนักงาน</th>
                  <th className="py-3 px-4 font-bold">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-3 font-bold">แผนก / ตำแหน่ง</th>
                  <th className="py-3 px-3 text-center font-bold">สถานะ & ขั้นตอนสด</th>
                  <th className="py-3 px-3 text-center font-bold">Pre-Test (10)</th>
                  <th className="py-3 px-3 text-center font-bold">Post-Test (10)</th>
                  <th className="py-3 px-3 text-center font-bold">ประวัติการสอบ</th>
                  <th className="py-3 px-3 text-center font-bold">พัฒนาการ</th>
                  <th className="py-3 px-3 font-bold">รหัสใบรับรอง A4</th>
                  <th className="py-3 px-4 text-right font-bold">จัดการข้อมูล</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedTrainees.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#005A9C] flex items-center justify-center mx-auto">
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="text-slate-800 font-semibold text-sm">
                          {selectedCourseFilter === 'all' 
                            ? 'ยังไม่มีข้อมูลผู้เข้าทำแบบทดสอบในระบบ' 
                            : `ยังไม่มีผู้เข้าทำแบบทดสอบหรือเริ่มเรียนในหลักสูตร ${COURSE_OFFICIAL_METADATA[selectedCourseFilter]?.title || selectedCourseFilter}`}
                        </div>
                        <div className="text-xs text-slate-500">
                          {selectedCourseFilter === 'all'
                            ? 'ระบบจะบันทึกข้อมูลและคะแนนอัตโนมัติทันทีที่มีพนักงานเข้าสู่ระบบและเริ่มทำแบบทดสอบจริง'
                            : 'ระบบจะคอยรับข้อมูลและบันทึกรายชื่อพร้อมผลคะแนนแบบเรียลไทม์อัตโนมัติ เมื่อมีพนักงานเข้ามาเริ่มทำจริงในหลักสูตรนี้'}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            playCyberClick();
                            setIsEnrollModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>+ แอดรายชื่อพนักงานเข้าเรียนในหลักสูตรนี้</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTrainees.map((t, idx) => {
                    const m = t.preTestScore !== null && t.postTestScore !== null ? calculateLearningMetrics(t.preTestScore, t.postTestScore) : null;
                    const maxCourseMods = (t.selectedCourseId || selectedCourseFilter) === 'advanced-preventive-maintenance' ? 3 : 4;
                    const completedCount = t.completedModules?.length || 0;
                    const progressPercent = Math.round((completedCount / maxCourseMods) * 100);

                    // Rank Display
                    const rankNum = t.examRank;
                    let rankBadge = (
                      <span className="font-mono text-slate-400 text-[11px]">-</span>
                    );
                    if (rankNum === 1) {
                      rankBadge = (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold font-mono text-[11px]">
                          🥇 #1
                        </span>
                      );
                    } else if (rankNum === 2) {
                      rankBadge = (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-bold font-mono text-[11px]">
                          🥈 #2
                        </span>
                      );
                    } else if (rankNum === 3) {
                      rankBadge = (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold font-mono text-[11px]">
                          🥉 #3
                        </span>
                      );
                    } else if (rankNum && rankNum <= 10) {
                      rankBadge = (
                        <span className="font-mono font-bold text-[#005A9C] text-[11px]">
                          #{rankNum}
                        </span>
                      );
                    } else if (rankNum) {
                      rankBadge = (
                        <span className="font-mono text-slate-500 text-[11px]">
                          #{rankNum}
                        </span>
                      );
                    }

                    return (
                      <tr key={t.id || t.empId} className="hover:bg-slate-50/80 transition-colors">
                        {/* Rank */}
                        <td className="py-3 px-3 text-center">
                          {rankBadge}
                        </td>

                        {/* Employee ID */}
                        <td className="py-3 px-3 font-mono font-bold text-[#005A9C]">
                          <button
                            type="button"
                            onClick={() => handleOpenScoreModal(t)}
                            className="hover:underline hover:text-[#002D5A] text-left font-mono cursor-pointer flex items-center gap-1 group"
                            title="คลิกเพื่อแก้ไขคะแนน (Edit Score)"
                          >
                            <span>{t.empId}</span>
                            <Edit3 className="w-3 h-3 text-[#005A9C]/50 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </td>

                        {/* Full Name & Position - Click to View Record & Certificate */}
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <button
                            type="button"
                            onClick={() => {
                              playCyberClick();
                              setSelectedTraineeForCertRecord(t);
                            }}
                            className="text-left cursor-pointer group flex flex-col items-start"
                            title="คลิกที่ชื่อเพื่อดูบันทึกและเกียรติบัตร (View Record & Certificate)"
                          >
                            <div className="flex items-center gap-1.5 group-hover:text-[#005A9C] group-hover:underline transition-all">
                              <span className="text-[#002D5A] font-bold group-hover:text-[#005A9C]">{t.fullName}</span>
                              <Award className="w-3.5 h-3.5 text-amber-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {t.notes && <div className="text-[10px] text-slate-400 italic font-normal">{t.notes}</div>}
                          </button>
                        </td>

                        {/* Department & Position */}
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                            <span>{t.department}</span>
                            {DEPARTMENT_LOOKUP[t.department] && (
                              <span className="text-[10.5px] text-slate-500 font-sans font-medium">({DEPARTMENT_LOOKUP[t.department].nameEn})</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{t.position || 'พนักงานฝ่ายปฏิบัติการ'}</div>
                        </td>

                        {/* Status & Live Progress Step */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              t.status === 'passed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : t.status === 'in_progress'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {t.status === 'passed' ? '🏆 ผ่านเกณฑ์ 80%' : t.status === 'in_progress' ? '🟡 กำลังเรียน' : '⚪ ยังไม่เริ่ม'}
                            </span>
                            
                            {/* Live Step Tracker Indicator */}
                            <div className="text-[10px] text-slate-500">
                              {t.status === 'passed' ? (
                                <span className="text-emerald-700 font-medium">สำเร็จครบทุกขั้นตอน</span>
                              ) : completedCount > 0 ? (
                                <span className="text-[#005A9C] font-medium">เรียนแล้ว {completedCount}/{maxCourseMods} บท ({progressPercent}%)</span>
                              ) : t.preTestScore !== null ? (
                                <span className="text-amber-700 font-medium">ทำ Pre-test แล้ว ({t.preTestScore}/10)</span>
                              ) : (
                                <span className="text-slate-400">รอเข้าเรียน</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Pre-Test - Click to Edit */}
                        <td className="py-3 px-3 text-center font-mono">
                          <button
                            type="button"
                            onClick={() => handleOpenScoreModal(t)}
                            className="hover:bg-slate-100 text-slate-700 hover:text-slate-900 px-2 py-1 rounded-lg transition-all cursor-pointer font-mono font-semibold"
                            title="คลิกเพื่อแก้ไขคะแนน Pre-Test"
                          >
                            {t.preTestScore !== null ? `${t.preTestScore}/10` : '-'}
                          </button>
                        </td>

                        {/* Post-Test - Click to Edit */}
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          <button
                            type="button"
                            onClick={() => handleOpenScoreModal(t)}
                            className="hover:bg-slate-100 px-2 py-1 rounded-lg transition-all cursor-pointer font-mono font-bold"
                            title="คลิกเพื่อแก้ไขคะแนน Post-Test"
                          >
                            {t.postTestScore !== null ? (
                              <span className={t.postTestScore >= 8 ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200' : 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200'}>
                                {t.postTestScore}/10
                              </span>
                            ) : '-'}
                          </button>
                        </td>

                        {/* Attempts & History Button */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setSelectedTraineeForAttempts(t)}
                            className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#005A9C] border border-slate-200 hover:border-blue-300 text-[11px] font-mono font-semibold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                            title="คลิกดูประวัติการทำข้อสอบและการเข้าเรียนทุกครั้ง"
                          >
                            <History className="w-3 h-3 text-[#005A9C]" />
                            <span>{t.postTestAttempts || (t.postTestScore !== null ? 1 : 0)} ครั้ง</span>
                          </button>
                        </td>

                        {/* Development Metrics */}
                        <td className="py-3 px-3 text-center font-mono">
                          {m ? (
                            <span className="text-[#005A9C] font-bold">
                              +{m.scoreDelta}%
                            </span>
                          ) : '-'}
                        </td>

                        {/* Certificate ID */}
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                          {t.certificateId ? (
                            <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 font-mono font-semibold" title={t.certificateId}>
                              {t.certificateId}
                            </span>
                          ) : '-'}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Individual Report */}
                            <button
                              onClick={() => handleViewIndividualReport(t)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                              title="ดูและพิมพ์รายงานผลส่วนบุคคล A4"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {/* Certificate View */}
                            {t.status === 'passed' && (
                              <button
                                onClick={() => {
                                  if (onSelectTraineeForReport) onSelectTraineeForReport(t);
                                  onNavigate('certificate');
                                }}
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors cursor-pointer"
                                title="ดูและพิมพ์ใบประกาศนียบัตร A4"
                              >
                                <Award className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Admin Score Entry */}
                            <button
                              onClick={() => handleOpenScoreModal(t)}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#005A9C] border border-blue-200 transition-colors cursor-pointer"
                              title="กรอก/แก้ไขคะแนนสอบ Pre-Test และ Post-Test (Admin Score Entry)"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Profile */}
                            <button
                              onClick={() => handleOpenEditModal(t)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                              title="แก้ไขข้อมูลพนักงาน (ชื่อ-นามสกุล แผนก ตำแหน่ง)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset Learning History (For Re-training / เข้าเรียนใหม่) */}
                            <button
                              id={`btn-reset-history-${t.empId}`}
                              onClick={() => {
                                playCyberClick();
                                setResettingTrainee(t);
                              }}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-700 border border-slate-200 transition-colors cursor-pointer"
                              title="ล้างประวัติการเรียนและผลสอบเพื่อให้พนักงานเข้าเรียนใหม่ (Reset Progress)"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            {/* Unenroll from current course */}
                            {selectedCourseFilter !== 'all' && (
                              <button
                                id={`btn-unenroll-${t.empId}`}
                                onClick={() => {
                                  playCyberClick();
                                  setUnenrollTarget({ empId: t.empId, fullName: t.fullName, courseId: selectedCourseFilter });
                                }}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-orange-50 text-slate-500 hover:text-orange-700 border border-slate-200 transition-all cursor-pointer"
                                title={`ถอนรายชื่อออกจากหลักสูตรนี้ (${COURSE_OFFICIAL_METADATA[selectedCourseFilter]?.code || selectedCourseFilter})`}
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              id={`btn-delete-trainee-${t.empId}`}
                              onClick={() => {
                                playCyberClick();
                                setDeletingTrainee(t);
                              }}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-all cursor-pointer"
                              title={`ลบรายชื่อพนักงาน ${t.fullName} (${t.empId})`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-sarabun">
            <div className="flex items-center gap-2">
              <span>แสดง:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 shadow-2xs focus:outline-none focus:border-[#005A9C]"
              >
                <option value={20}>20 คน / หน้า</option>
                <option value={50}>50 คน / หน้า</option>
                <option value={100}>100 คน / หน้า</option>
                <option value={999}>ทั้งหมด ({filteredTrainees.length} คน)</option>
              </select>
              <span>จากทั้งหมด {filteredTrainees.length} คน</span>
            </div>

            {pageSize < 999 && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono text-slate-700 font-semibold">หน้า {currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 cursor-pointer shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ADD TRAINEE MODAL                                                    */}
      {/* ==================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sarabun">
          <div className="bg-slate-50 border border-slate-300 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#001f3f] via-[#002D5A] to-[#005A9C] text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 text-amber-300 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">เพิ่มรายชื่อผู้เข้าอบรมใหม่</h3>
                  <p className="text-xs text-blue-100/90">กรอกข้อมูลพนักงานเพื่อบันทึกและดึงเข้าสู่ระบบ</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 bg-white">

            <form onSubmit={handleAddTrainee} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">รหัสพนักงาน (Employee ID) *</label>
                <input
                  type="text"
                  required
                  value={formEmpId}
                  onChange={(e) => setFormEmpId(e.target.value)}
                  placeholder="เช่น TCT-P-8890"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-[#005A9C] focus:ring-1 focus:ring-[#005A9C]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ชื่อ-นามสกุล (Full Name) *</label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="เช่น นายสมชาย ใจมั่นคง"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#005A9C] focus:ring-1 focus:ring-[#005A9C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">แผนก (Department) *</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#005A9C] focus:ring-1 focus:ring-[#005A9C]"
                  >
                    {departments.filter(d => d !== 'all').map(d => (
                      <option key={d} value={d}>
                        {d} {DEPARTMENT_LOOKUP[d] ? `- ${DEPARTMENT_LOOKUP[d].nameEn}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ตำแหน่ง (Position)</label>
                  <input
                    type="text"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    placeholder="เช่น พนักงานฝ่ายผลิต"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#005A9C] focus:ring-1 focus:ring-[#005A9C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">หมายเหตุเพิ่มเติม</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="เช่น ผู้เข้าอบรมรอบพิเศษ"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#005A9C] focus:ring-1 focus:ring-[#005A9C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#002D5A] hover:bg-[#001f3f] text-white font-bold shadow-xs cursor-pointer transition-colors"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* EDIT TRAINEE MODAL (EXAM ANSWERS TAMPER-PROOF)                      */}
      {/* ==================================================================== */}
      {isEditModalOpen && editingTrainee && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          isAdmin={true}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTrainee(null);
          }}
          initialData={editingTrainee}
          onSave={(updatedProfile) => {
            updateEmployeeProfile(updatedProfile);
            const oldId = editingTrainee.empId.trim().toUpperCase();
            const newId = updatedProfile.empId.trim().toUpperCase();

            const updatedTrainees = trainees.map((t) =>
              (t.empId.trim().toUpperCase() === oldId || t.empId.trim().toUpperCase() === newId)
                ? {
                    ...t,
                    empId: updatedProfile.empId,
                    prefix: updatedProfile.prefix,
                    fullName: updatedProfile.fullName,
                    department: updatedProfile.department,
                    position: updatedProfile.position,
                    division: updatedProfile.division,
                    notes: updatedProfile.notes
                  }
                : t
            );
            setTrainees(updatedTrainees);
            saveStoredTrainees(updatedTrainees);

            // Server sync
            try {
              fetch(`/api/trainees/${encodeURIComponent(newId)}/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  empId: newId,
                  prefix: updatedProfile.prefix,
                  fullName: updatedProfile.fullName,
                  department: updatedProfile.department,
                  position: updatedProfile.position,
                  division: updatedProfile.division,
                  notes: updatedProfile.notes
                })
              }).catch(() => {});
            } catch (e) {}

            addStoredAuditLog({
              empId: updatedProfile.empId,
              action: 'profile_updated',
              detail: `แก้ไขข้อมูลพนักงาน: ${updatedProfile.fullName} (${updatedProfile.department})`
            });
            setIsEditModalOpen(false);
            setEditingTrainee(null);
            playSuccessChime();
            setImportNotice(`✅ อัปเดตข้อมูลของ ${updatedProfile.fullName} (${updatedProfile.empId}) เรียบร้อยแล้ว`);
            setTimeout(() => setImportNotice(null), 4000);
          }}
        />
      )}

      {/* Trainee Attempt History Modal */}
      {selectedTraineeForAttempts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sarabun text-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">ประวัติการทำข้อสอบและการอบรม</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedTraineeForAttempts.empId} • {selectedTraineeForAttempts.fullName} (แผนก {selectedTraineeForAttempts.department})
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedTraineeForAttempts(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trainee Summary Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">คะแนน Pre-Test</div>
                <div className="text-sm font-bold font-mono text-slate-800">
                  {selectedTraineeForAttempts.preTestScore !== null ? `${selectedTraineeForAttempts.preTestScore}/10` : 'ยังไม่ทำ'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">Post-Test สูงสุด</div>
                <div className={`text-sm font-bold font-mono ${
                  (selectedTraineeForAttempts.postTestScore ?? 0) >= 8 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {selectedTraineeForAttempts.postTestScore !== null ? `${selectedTraineeForAttempts.postTestScore}/10` : 'ยังไม่ทำ'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">จำนวนครั้งที่สอบ</div>
                <div className="text-sm font-bold font-mono text-[#005A9C]">
                  {selectedTraineeForAttempts.postTestAttempts || (selectedTraineeForAttempts.postTestScore !== null ? 1 : 0)} ครั้ง
                </div>
              </div>
            </div>

            {/* List of Detailed Attempts */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>บันทึกการส่งผลสอบแต่ละครั้ง (Attempt Records)</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  รวม {selectedTraineeForAttempts.attemptsHistory?.length || (selectedTraineeForAttempts.postTestScore !== null ? 1 : 0)} ครั้ง
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {selectedTraineeForAttempts.attemptsHistory && selectedTraineeForAttempts.attemptsHistory.length > 0 ? (
                  selectedTraineeForAttempts.attemptsHistory.map((att, index) => (
                    <div key={index} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-[#005A9C] border border-blue-200 text-[10px] font-mono font-bold">
                            ครั้งที่ {att.attemptNumber}
                          </span>
                          <span className={att.passed ? 'text-emerald-700' : 'text-rose-700'}>
                            {att.passed ? '✓ ผ่านเกณฑ์ 80%' : '✗ ไม่ผ่านเกณฑ์'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {new Date(att.completedAt).toLocaleString('th-TH')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold font-mono text-slate-800">
                          {att.score}/10
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {Math.round((att.score / 10) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))
                ) : selectedTraineeForAttempts.postTestScore !== null ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#005A9C] border border-blue-200 text-[10px] font-mono font-bold">
                          ครั้งที่ 1
                        </span>
                        <span className={selectedTraineeForAttempts.postTestScore >= 8 ? 'text-emerald-700' : 'text-rose-700'}>
                          {selectedTraineeForAttempts.postTestScore >= 8 ? '✓ ผ่านเกณฑ์ 80%' : '✗ ไม่ผ่านเกณฑ์'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {selectedTraineeForAttempts.completedAt || selectedTraineeForAttempts.certificateDate || 'บันทึกในระบบแล้ว'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-slate-800">
                        {selectedTraineeForAttempts.postTestScore}/10
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {Math.round((selectedTraineeForAttempts.postTestScore / 10) * 100)}%
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400">
                    ยังไม่มีประวัติการส่งผลสอบ Post-test ของพนักงานท่านนี้
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedTraineeForAttempts) {
                      const target = selectedTraineeForAttempts;
                      setSelectedTraineeForAttempts(null);
                      handleOpenScoreModal(target);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005A9C] border border-blue-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 transition-all"
                  title="เปิดหน้าต่างกรอกหรือแก้ไขคะแนนสอบสำหรับพนักงานท่านนี้"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>📝 กรอก/แก้ไขคะแนน</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedTraineeForAttempts) {
                      playCyberClick();
                      setResettingTrainee(selectedTraineeForAttempts);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 transition-all"
                  title="ล้างคะแนนและประวัติการเรียนเพื่อเริ่มเรียนใหม่"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  <span>ล้างประวัติการเรียน</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTraineeForAttempts(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer text-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Score Entry and Override Modal */}
      <AdminScoreEntryModal
        isOpen={isScoreModalOpen}
        onClose={() => {
          setIsScoreModalOpen(false);
          setScoringTrainee(null);
        }}
        trainee={scoringTrainee}
        onScoreSaved={(updated) => {
          handleRefresh();
          setImportNotice(`✅ บันทึกคะแนนของ ${updated.fullName} (${updated.empId}) เรียบร้อยแล้ว!`);
          setTimeout(() => setImportNotice(null), 5000);
        }}
        onOpenReport={(t) => {
          setIsScoreModalOpen(false);
          handleViewIndividualReport(t);
        }}
        onOpenCertificate={(t) => {
          setIsScoreModalOpen(false);
          if (onSelectTraineeForReport) onSelectTraineeForReport(t);
          onNavigate('certificate');
        }}
      />

      {/* Batch Training Report A4 Modal */}
      {isBatchReportOpen && (
        <BatchTrainingReportModal
          trainees={filteredTrainees}
          onClose={() => setIsBatchReportOpen(false)}
        />
      )}

      {/* Inhouse Training Report HRD-TR-00-05 Modal */}
      {isInhouseReportOpen && (
        <InhouseTrainingReportModal
          trainees={trainees}
          currentUser={currentUser}
          initialCourseId={selectedCourseFilter !== 'all' ? selectedCourseFilter : undefined}
          onClose={() => setIsInhouseReportOpen(false)}
        />
      )}

      {/* ETraining Official Roster and Results Modal */}
      {isETrainingRosterOpen && (
        <ETrainingRosterReportModal
          trainees={trainees}
          currentUser={currentUser}
          initialCourseId={selectedCourseFilter !== 'all' ? selectedCourseFilter : undefined}
          onClose={() => setIsETrainingRosterOpen(false)}
        />
      )}

      {/* Official Course Curriculum Approval Proposal Modal (A4 / PDF) */}
      {isCourseApprovalPdfOpen && (
        <CourseApprovalPdfModal
          initialCourseId={selectedCourseFilter !== 'all' ? selectedCourseFilter : 'applied-psychology'}
          onClose={() => setIsCourseApprovalPdfOpen(false)}
        />
      )}

      {/* Cohort Reset Modal per Course */}
      <CohortResetModal
        isOpen={isCohortResetOpen}
        onClose={() => setIsCohortResetOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* 🔴 In-App Modal: Confirm Delete Trainee */}
      {deletingTrainee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sarabun">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-800 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  ยืนยันการลบรายชื่อผู้เข้าอบรม
                </h3>
                <p className="text-xs text-rose-600">
                  ระบบจะลบข้อมูลและผลสอบของพนักงานท่านนี้ออกจากระบบทันที
                </p>
              </div>
            </div>

            {/* Trainee Details Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">ชื่อ - สกุล:</span>
                <span className="font-bold text-slate-900 text-sm">{deletingTrainee.fullName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">รหัสประจำตัวพนักงาน:</span>
                <span className="font-mono font-bold text-[#005A9C] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {deletingTrainee.empId}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">แผนก / ตำแหน่ง:</span>
                <span className="font-medium text-slate-700">
                  แผนก {deletingTrainee.department} • {deletingTrainee.position || 'พนักงาน'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">สถานะปัจจุบัน:</span>
                <span className={`font-bold ${deletingTrainee.status === 'passed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {deletingTrainee.status === 'passed' ? '✅ ผ่านการอบรมแล้ว (มีใบรับรอง)' : '⏳ อยู่ระหว่างการอบรม'}
                </span>
              </div>
            </div>

            {/* Warning Alert */}
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ผลของการลบข้อมูล:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-700/90 pl-1">
                <li>ข้อมูลผลคะแนนสอบ (Pre-Test / Post-Test) และใบประกาศนียบัตรจะถูกลบ</li>
                <li>ระบบจะบันทึก Blacklist เพื่อไม่ให้ดึงรายชื่อนี้กลับมาแสดงซ้ำอัตโนมัติ</li>
                <li>หากต้องการนำกลับมา สามารถใช้ปุ่ม <strong>"เพิ่มรายคน"</strong> ได้ตลอดเวลา</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTrainee(null)}
                disabled={isActionLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                id="btn-confirm-execute-delete"
                onClick={executeDeleteTrainee}
                disabled={isActionLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isActionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังลบข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>ยืนยันการลบออกจากระบบ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 In-App Modal: Confirm Reset Single Trainee Learning History */}
      {resettingTrainee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sarabun">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-800 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  ยืนยันการล้างประวัติการเรียน (Reset Progress)
                </h3>
                <p className="text-xs text-amber-700">
                  เพื่อให้พนักงานสามารถเข้าสู่ระบบและเริ่มเรียนใหม่ได้ตั้งแต่ขั้นตอนแรก
                </p>
              </div>
            </div>

            {/* Trainee Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">พนักงาน:</span>
                <span className="font-bold text-slate-900">{resettingTrainee.fullName} ({resettingTrainee.empId})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">แผนก:</span>
                <span className="text-slate-700 font-medium">แผนก {resettingTrainee.department}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="font-bold">⚠️ สิ่งที่จะเกิดขึ้น:</div>
              <p className="text-[11px] text-amber-800">
                คะแนน Pre-Test, Post-Test, วิดีโอ และมินิเกมจะถูกรีเซ็ตเป็น 0 เพื่อให้พนักงานเริ่มเรียนใหม่ แต่รายชื่อและสิทธิ์ของพนักงานจะยังคงอยู่ในระบบ
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResettingTrainee(null)}
                disabled={isActionLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={executeResetSingleTrainee}
                disabled={isActionLoading}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isActionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังรีเซ็ต...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>ยืนยันการล้างประวัติ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ In-App Modal: Clear All Trainees */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sarabun">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-800 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  คำเตือน: ล้างข้อมูลผู้เข้าอบรมทั้งหมด (Clean Slate)
                </h3>
                <p className="text-xs text-rose-600">
                  คุณต้องการล้างข้อมูลผู้เข้าอบรมทั้งหมดเพื่อเตรียมระบบสำหรับรุ่นใหม่ใช่หรือไม่?
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
              <p className="font-bold">⚠️ ข้อมูลที่จะถูกลบทั้งหมด:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800 pl-1">
                <li>รายชื่อผู้เข้าอบรมทั้งหมด {trainees.length} คน</li>
                <li>ประวัติการสอบ Pre-Test และ Post-Test ทั้งหมด</li>
                <li>ใบประกาศนียบัตรและบันทึกผลการประเมินทั้งหมด</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                disabled={isActionLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={executeClearAll}
                disabled={isActionLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isActionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังล้างข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>ยืนยันล้างข้อมูลทั้งหมด</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👥 In-App Modal: Reset to Official Roster */}
      {isOfficialResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sarabun">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-800 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-[#005A9C] border border-blue-200 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  รีเซ็ตเป็นรายชื่อพนักงานและหัวหน้างานจริง
                </h3>
                <p className="text-xs text-slate-500">
                  บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด (Official Roster)
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p>
                ระบบจะโหลดรายชื่อพนักงานและหัวหน้างานจริงทั้ง 13 ท่าน พร้อมตั้งค่าเริ่มต้นตามมาตรฐานทางการของบริษัท
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOfficialResetModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={executeResetToOfficialRoster}
                className="px-5 py-2.5 rounded-xl bg-[#002D5A] hover:bg-[#001f3f] text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>ยืนยันโหลดรายชื่อจริง</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 In-App Modal: Reset to Real Baseline Scores */}
      {isResetRealBaselineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sarabun">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-800 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  รีเซ็ตข้อมูลผลสอบเป็น "ค่าเดิมที่ทำได้จริง"
                </h3>
                <p className="text-xs text-amber-700">
                  ตั้งค่าคะแนนผลการทดสอบกลับเป็นค่าจริงดั้งเดิม
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p>• <strong>คุณประไพ คงเพียรธรรม (97016):</strong> Pre-Test 6/10, Post-Test 10/10 (ผ่านเกณฑ์สมบูรณ์ตามผลจริง)</p>
              <p>• <strong>พนักงานท่านอื่นๆ:</strong> สถานะเริ่มต้น รอการเข้าทำแบบทดสอบจริง</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetRealBaselineModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={executeResetRealBaseline}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ยืนยันรีเซ็ตเป็นคะแนนจริง</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ In-App Modal: Unenroll Confirmation */}
      {unenrollTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sarabun">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-800 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 shrink-0">
                <UserMinus className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  ยืนยันการถอนรายชื่อออกจากหลักสูตร
                </h3>
                <p className="text-xs text-orange-600">
                  ถอน {unenrollTarget.fullName} ({unenrollTarget.empId}) ออกจาก {COURSE_OFFICIAL_METADATA[unenrollTarget.courseId]?.title || unenrollTarget.courseId}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              เมื่อถอนรายชื่อ พนักงานท่านนี้จะไม่ปรากฏในรายชื่อผู้เรียนของหลักสูตรนี้อีกต่อไป (ข้อมูลประวัติพนักงานในระบบหลักจะไม่ถูกลบ)
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUnenrollTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  unenrollEmployeeFromCourse(unenrollTarget.courseId, unenrollTarget.empId);
                  setUnenrollTarget(null);
                  handleRefresh();
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <UserMinus className="w-4 h-4" />
                <span>ยืนยันถอนรายชื่อ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 🏅 Trainee Record & Certificate Modal (คลิกที่ชื่อเพื่อดูบันทึกและเกียรติบัตร) */}
      {/* =================================================================== */}
      {selectedTraineeForCertRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn font-sarabun text-slate-800">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-5 animate-scaleUp overflow-y-auto max-h-[92vh]">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block mb-1">
                    TRAINEE RECORD & CERTIFICATE
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    บันทึกและเกียรติบัตรการฝึกอบรม
                  </h3>
                  <p className="text-xs text-slate-500">
                    ศูนย์ฝึกอบรมและพัฒนา TCT Academy (Human Resource Development & Training Center)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTraineeForCertRecord(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trainee Profile Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">รหัสพนักงาน:</span>
                <span className="font-mono font-bold text-[#005A9C] text-sm">{selectedTraineeForCertRecord.empId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">ชื่อ - นามสกุล:</span>
                <span className="font-bold text-slate-900">{selectedTraineeForCertRecord.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">แผนก / ฝ่าย:</span>
                <span className="font-semibold text-slate-700">{selectedTraineeForCertRecord.department} ({DEPARTMENT_LOOKUP[selectedTraineeForCertRecord.department]?.nameEn || selectedTraineeForCertRecord.department})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">ตำแหน่ง:</span>
                <span className="text-slate-700 font-medium">{selectedTraineeForCertRecord.position || 'พนักงานฝ่ายปฏิบัติการ'}</span>
              </div>
            </div>

            {/* Course & Score Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                <span className="text-[11px] text-blue-700 font-semibold block mb-0.5">คะแนน Pre-Test</span>
                <span className="font-mono font-bold text-lg text-[#005A9C]">
                  {selectedTraineeForCertRecord.preTestScore !== null ? `${selectedTraineeForCertRecord.preTestScore}/10` : 'รอสอบ'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                <span className="text-[11px] text-purple-700 font-semibold block mb-0.5">คะแนน Post-Test</span>
                <span className="font-mono font-bold text-lg text-purple-900">
                  {selectedTraineeForCertRecord.postTestScore !== null ? `${selectedTraineeForCertRecord.postTestScore}/10` : 'รอสอบ'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[11px] text-emerald-700 font-semibold block mb-0.5">สถานะผลการสอบ</span>
                <span className="font-bold text-xs text-emerald-800 block mt-1">
                  {selectedTraineeForCertRecord.status === 'passed' ? '🏆 ผ่านเกณฑ์ 80%' : '🟡 กำลังเรียน'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-[11px] text-amber-700 font-semibold block mb-0.5">บทเรียนที่สำเร็จ</span>
                <span className="font-mono font-bold text-lg text-amber-800">
                  {selectedTraineeForCertRecord.completedModules ? selectedTraineeForCertRecord.completedModules.length : 0} บท
                </span>
              </div>
            </div>

            {/* Certificate Preview Card */}
            <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-5 text-center space-y-3 relative overflow-hidden shadow-xs">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-800 tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>CERTIFICATE OF COMPLETION • ใบประกาศนียบัตรรับรองผล</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>

              <div className="py-2">
                <div className="text-[11px] text-slate-500 mb-1">ขอมอบวุฒิบัตรฉบับนี้เพื่อแสดงว่า</div>
                <div className="text-xl sm:text-2xl font-black text-[#002D5A] tracking-tight">
                  {selectedTraineeForCertRecord.fullName}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  รหัสพนักงาน: {selectedTraineeForCertRecord.empId} • แผนก {selectedTraineeForCertRecord.department}
                </div>
                <div className="text-xs text-slate-700 mt-2 font-medium">
                  ได้ผ่านการฝึกอบรมและทดสอบความรู้ตามเกณฑ์มาตรฐานของศูนย์ฝึกอบรม TCT Academy
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                <span>รหัสเกียรติบัตร: {selectedTraineeForCertRecord.certificateId || `TCT-CERT-${selectedTraineeForCertRecord.empId}`}</span>
                <span>วันที่: {selectedTraineeForCertRecord.completedAt || new Date().toLocaleDateString('th-TH')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  if (onSelectTraineeForCert) {
                    onSelectTraineeForCert(selectedTraineeForCertRecord);
                  } else if (onSelectTraineeForReport) {
                    onSelectTraineeForReport(selectedTraineeForCertRecord);
                    onNavigate('certificate');
                  }
                  setSelectedTraineeForCertRecord(null);
                }}
                className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Award className="w-4 h-4" />
                <span>🏆 ดูและพิมพ์เกียรติบัตร (Certificate A4)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  if (onSelectTraineeForReport) {
                    onSelectTraineeForReport(selectedTraineeForCertRecord);
                  }
                  onNavigate('report');
                  setSelectedTraineeForCertRecord(null);
                }}
                className="h-10 px-4 rounded-xl bg-[#002D5A] hover:bg-[#001D3D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>📊 ดูรายงานผลรายบุคคล A4</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  handleOpenScoreModal(selectedTraineeForCertRecord);
                  setSelectedTraineeForCertRecord(null);
                }}
                className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>แก้ไขคะแนน</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📋 Course Enrollment Modal */}
      <EnrollTraineesModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        currentCourseId={selectedCourseFilter === 'all' ? 'applied-psychology' : selectedCourseFilter}
        onEnrollSuccess={() => {
          handleRefresh();
        }}
      />
    </div>
  );
};
