import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MasterEmployeeRecord,
  TrainingRosterRecord,
  FirestoreCourseData, 
  TrainingRecordData, 
  SystemSettingsData,
  DEFAULT_SYSTEM_SETTINGS,
  subscribeToEmployeesMaster,
  saveEmployeeMaster,
  deleteEmployeeMaster,
  seedEmployeesMasterIfEmpty,
  subscribeToCourseRoster,
  addTraineesToRoster,
  removeTraineeFromRoster,
  updateRosterTrainee,
  clearCourseRoster,
  subscribeToTrainingRecords,
  deleteTrainingRecord,
  subscribeToCourses, 
  saveCourse, 
  deleteCourse,
  subscribeToSystemSettings,
  saveSystemSettings,
  getSystemSettings
} from '../firebase';
import { 
  Users, 
  BookOpen, 
  Sliders, 
  FileText, 
  Printer, 
  Download, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Calendar, 
  Award, 
  ShieldCheck, 
  Sparkles,
  Layers,
  GraduationCap,
  Building2,
  FileSpreadsheet,
  RotateCcw,
  UserPlus,
  CheckSquare,
  Square,
  Clock
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { printA4Document, downloadDocumentHtml, exportToCsv } from '../utils/printHelper';

interface CleanAdminConsoleViewProps {
  currentAdmin: MasterEmployeeRecord;
  onBackToLearner: () => void;
}

export const CleanAdminConsoleView: React.FC<CleanAdminConsoleViewProps> = ({
  currentAdmin,
  onBackToLearner
}) => {
  // Navigation Tabs: 'rosters' | 'records' | 'employees' | 'courses' | 'settings' | 'print'
  const [activeTab, setActiveTab] = useState<'rosters' | 'records' | 'employees' | 'courses' | 'settings' | 'print'>('rosters');

  // Real-time Data across 4 Isolated Collections
  const [masterEmployees, setMasterEmployees] = useState<MasterEmployeeRecord[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecordData[]>([]);
  const [courses, setCourses] = useState<FirestoreCourseData[]>([]);
  const [settings, setSettings] = useState<SystemSettingsData>(DEFAULT_SYSTEM_SETTINGS);

  // Status Notice
  const [notice, setNotice] = useState<string | null>(null);

  // Selected Course for Rosters tab
  const [selectedCourseId, setSelectedCourseId] = useState<string>('applied-psychology');
  const [cohortDate, setCohortDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [currentRoster, setCurrentRoster] = useState<TrainingRosterRecord[]>([]);
  const [isRosterLoading, setIsRosterLoading] = useState<boolean>(false);

  // Subscribe to real-time streams
  useEffect(() => {
    const unsubEmployees = subscribeToEmployeesMaster(setMasterEmployees);
    const unsubRecords = subscribeToTrainingRecords(setTrainingRecords);
    const unsubCourses = subscribeToCourses(setCourses);
    const unsubSettings = subscribeToSystemSettings(setSettings);

    return () => {
      unsubEmployees();
      unsubRecords();
      unsubCourses();
      unsubSettings();
    };
  }, []);

  // Subscribe to current course's training_rosters collection
  useEffect(() => {
    setIsRosterLoading(true);
    const unsubRoster = subscribeToCourseRoster(selectedCourseId, (roster) => {
      setCurrentRoster(roster);
      setIsRosterLoading(false);
    });

    return () => {
      unsubRoster();
    };
  }, [selectedCourseId]);

  const showNotification = (msg: string) => {
    setNotice(msg);
    playSuccessChime();
    setTimeout(() => setNotice(null), 4000);
  };

  const activeCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId) || {
      id: selectedCourseId,
      title: 'หลักสูตรจิตวิทยาประยุกต์ในการทำงาน (Applied Psychology - TCT-PSY-01)',
      code: 'TCT-PSY-01'
    };
  }, [courses, selectedCourseId]);

  // ========================================================
  // 1. TRAINING ROSTERS TAB STATE & ACTIONS ("training_rosters")
  // ========================================================
  const [rosterSearch, setRosterSearch] = useState('');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollSourceMode, setEnrollSourceMode] = useState<'master' | 'passed_records'>('master');
  const [enrollSearch, setEnrollSearch] = useState('');
  const [enrollDeptFilter, setEnrollDeptFilter] = useState('ALL');
  const [selectedEmpIdsForEnroll, setSelectedEmpIdsForEnroll] = useState<Set<string>>(new Set());
  const [isEnrollingSubmitting, setIsEnrollingSubmitting] = useState(false);

  // Quick Score Edit Modal
  const [editingRosterTrainee, setEditingRosterTrainee] = useState<TrainingRosterRecord | null>(null);
  const [editScorePre, setEditScorePre] = useState<string>('');
  const [editScorePost, setEditScorePost] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'enrolled' | 'passed' | 'failed'>('enrolled');

  // Set of empIds currently in this active roster table (NO STUCK LOCKS)
  const currentRosterEmpIds = useMemo(() => {
    return new Set(currentRoster.map(r => r.empId.trim().toUpperCase()));
  }, [currentRoster]);

  // Filtered employees for enrollment modal
  const filteredCandidatesForEnroll = useMemo(() => {
    let pool: { empId: string; fullName: string; department: string; position: string }[] = [];

    if (enrollSourceMode === 'master') {
      pool = masterEmployees;
    } else {
      // From passed training records
      const passedMap = new Map<string, { empId: string; fullName: string; department: string; position: string }>();
      trainingRecords.forEach(r => {
        const id = r.empId.trim().toUpperCase();
        if (!passedMap.has(id)) {
          passedMap.set(id, {
            empId: id,
            fullName: r.fullName,
            department: r.department,
            position: r.position || 'พนักงาน'
          });
        }
      });
      pool = Array.from(passedMap.values());
    }

    return pool.filter(emp => {
      const q = enrollSearch.trim().toLowerCase();
      const matchSearch = !q || 
        emp.empId.toLowerCase().includes(q) ||
        emp.fullName.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q);
      const matchDept = enrollDeptFilter === 'ALL' || emp.department === enrollDeptFilter;
      return matchSearch && matchDept;
    });
  }, [masterEmployees, trainingRecords, enrollSourceMode, enrollSearch, enrollDeptFilter]);

  // Toggle selection
  const handleToggleSelectEmp = (empId: string) => {
    playCyberClick();
    const cleanId = empId.trim().toUpperCase();
    setSelectedEmpIdsForEnroll(prev => {
      const next = new Set(prev);
      if (next.has(cleanId)) next.delete(cleanId);
      else next.add(cleanId);
      return next;
    });
  };

  // Select all filtered candidates
  const handleSelectAllFiltered = () => {
    playCyberClick();
    const allFilteredIds = filteredCandidatesForEnroll.map(e => e.empId.trim().toUpperCase());
    const allSelected = allFilteredIds.every(id => selectedEmpIdsForEnroll.has(id));

    if (allSelected) {
      setSelectedEmpIdsForEnroll(new Set());
    } else {
      setSelectedEmpIdsForEnroll(new Set(allFilteredIds));
    }
  };

  // Select whole department
  const handleSelectWholeDept = (deptCode: string) => {
    playCyberClick();
    const deptEmployees = masterEmployees
      .filter(e => e.department.toUpperCase() === deptCode.toUpperCase())
      .map(e => e.empId.trim().toUpperCase());
    setSelectedEmpIdsForEnroll(new Set(deptEmployees));
    setEnrollDeptFilter(deptCode);
  };

  // SUBMIT ENROLLMENT DIRECTLY TO "training_rosters"
  const handleExecuteEnrollment = async () => {
    if (selectedEmpIdsForEnroll.size === 0) return;
    playCyberClick();
    setIsEnrollingSubmitting(true);

    const candidatesToEnroll = masterEmployees.filter(emp => 
      selectedEmpIdsForEnroll.has(emp.empId.trim().toUpperCase())
    );

    try {
      const added = await addTraineesToRoster(
        selectedCourseId,
        activeCourse.title,
        candidatesToEnroll,
        cohortDate
      );
      setIsEnrollingSubmitting(false);
      setIsEnrollModalOpen(false);
      setSelectedEmpIdsForEnroll(new Set());
      showNotification(`เพิ่มรายชื่อลงใบรายชื่อ ${activeCourse.title} สำเร็จ ${added.length} ท่าน`);
    } catch (err) {
      setIsEnrollingSubmitting(false);
      alert('เกิดข้อผิดพลาดในการบันทึกรายชื่อลง Firestore กรุณาลองใหม่อีกครั้ง');
    }
  };

  // RESET / RE-FETCH ROSTER
  const handleResetRosterCache = () => {
    playCyberClick();
    setIsRosterLoading(true);
    subscribeToCourseRoster(selectedCourseId, (roster) => {
      setCurrentRoster(roster);
      setIsRosterLoading(false);
      showNotification(`รีเฟรชข้อมูลใบรายชื่อจาก Firestore เรียบร้อย (${roster.length} รายการ)`);
    });
  };

  // Remove Trainee from Roster
  const handleRemoveTrainee = async (empId: string, fullName: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะนำ ${fullName} (${empId}) ออกจากใบรายชื่อวิชานี้?`)) {
      playCyberClick();
      await removeTraineeFromRoster(selectedCourseId, empId);
      showNotification(`นำ ${fullName} ออกจากใบรายชื่อเรียบร้อยแล้ว`);
    }
  };

  // Open Score Edit
  const openEditScoreModal = (t: TrainingRosterRecord) => {
    setEditingRosterTrainee(t);
    setEditScorePre(t.preTestScore !== null && t.preTestScore !== undefined ? String(t.preTestScore) : '');
    setEditScorePost(t.postTestScore !== null && t.postTestScore !== undefined ? String(t.postTestScore) : '');
    setEditStatus((t.status as any) || 'enrolled');
  };

  const handleSaveTraineeScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRosterTrainee) return;
    playCyberClick();

    const pre = editScorePre.trim() !== '' ? Number(editScorePre) : null;
    const post = editScorePost.trim() !== '' ? Number(editScorePost) : null;
    const certId = editStatus === 'passed' ? (editingRosterTrainee.certificateId || `TCT-${activeCourse.code || 'CERT'}-${new Date().getFullYear()}-${editingRosterTrainee.empId}`) : undefined;

    await updateRosterTrainee(selectedCourseId, editingRosterTrainee.empId, {
      preTestScore: pre,
      postTestScore: post,
      status: editStatus,
      certificateId: certId
    });

    setEditingRosterTrainee(null);
    showNotification(`อัปเดตผลคะแนนของ ${editingRosterTrainee.fullName} สำเร็จ`);
  };

  // Export Roster to CSV
  const handleExportRosterCsv = () => {
    playCyberClick();
    const headers = [
      'ลำดับ',
      'รหัสพนักงาน',
      'ชื่อ-นามสกุล',
      'แผนก',
      'ตำแหน่ง',
      'หลักสูตร',
      'รุ่น/วันที่',
      'Pre-Test (10)',
      'Post-Test (10)',
      'สถานะ',
      'เลขที่เกียรติบัตร'
    ];

    const rows = currentRoster.map((r, i) => [
      i + 1,
      r.empId,
      r.fullName,
      r.department,
      r.position,
      r.courseTitle,
      r.cohortDate,
      r.preTestScore !== null && r.preTestScore !== undefined ? r.preTestScore : '-',
      r.postTestScore !== null && r.postTestScore !== undefined ? r.postTestScore : '-',
      r.status === 'passed' ? 'ผ่านเกณฑ์' : r.status === 'failed' ? 'ไม่ผ่าน' : 'เข้าอบรม',
      r.certificateId || '-'
    ]);

    exportToCsv(`TCT_Training_Roster_${selectedCourseId}_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    showNotification('ส่งออกไฟล์ Excel (CSV) ใบรายชื่อสำเร็จ');
  };

  // Dedicated Print Roster A4 Window
  const rosterPrintCanvasRef = useRef<HTMLDivElement>(null);
  const handlePrintRosterA4 = () => {
    if (!rosterPrintCanvasRef.current) return;
    playCyberClick();
    printA4Document({
      title: `ใบรายชื่อผู้เข้าอบรม_${activeCourse.title}`,
      elementOrHtml: rosterPrintCanvasRef.current,
      orientation: 'portrait',
      autoPrint: true
    });
  };

  // Filtered Roster Table View
  const filteredCurrentRoster = useMemo(() => {
    return currentRoster.filter(r => {
      const q = rosterSearch.trim().toLowerCase();
      return !q || 
        r.empId.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q);
    });
  }, [currentRoster, rosterSearch]);

  // ========================================================
  // 2. TRAINING RECORDS TAB STATE & ACTIONS ("training_records")
  // ========================================================
  const [recordSearch, setRecordSearch] = useState('');
  const [recordDeptFilter, setRecordDeptFilter] = useState('ALL');
  const [recordCourseFilter, setRecordCourseFilter] = useState('ALL');

  const filteredRecords = useMemo(() => {
    return trainingRecords.filter(r => {
      const q = recordSearch.trim().toLowerCase();
      const matchSearch = !q || 
        r.empId.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        (r.certificateId && r.certificateId.toLowerCase().includes(q));
      const matchDept = recordDeptFilter === 'ALL' || r.department === recordDeptFilter;
      const matchCourse = recordCourseFilter === 'ALL' || r.courseId === recordCourseFilter;
      return matchSearch && matchDept && matchCourse;
    });
  }, [trainingRecords, recordSearch, recordDeptFilter, recordCourseFilter]);

  const handleExportRecordsCsv = () => {
    playCyberClick();
    const headers = [
      'ลำดับ',
      'รหัสพนักงาน',
      'ชื่อ-นามสกุล',
      'แผนก',
      'ตำแหน่ง',
      'หลักสูตร',
      'คะแนนสอบ',
      'คะแนนเต็ม',
      'ร้อยละ (%)',
      'ผลการประเมิน',
      'วันที่ผ่าน',
      'เลขที่เกียรติบัตร'
    ];

    const rows = filteredRecords.map((r, i) => [
      i + 1,
      r.empId,
      r.fullName,
      r.department,
      r.position || 'พนักงาน',
      r.courseTitle,
      r.examScore,
      r.examTotal,
      `${r.examPercentage}%`,
      r.passed ? 'ผ่านเกณฑ์' : 'ไม่ผ่าน',
      r.completedAt,
      r.certificateId
    ]);

    exportToCsv(`TCT_Passed_Records_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    showNotification('ส่งออกไฟล์ Excel (CSV) ประวัติผู้สอบผ่านสำเร็จ');
  };

  const handleDeleteRecord = async (recordId: string, fullName: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบประวัติของ ${fullName}?`)) {
      playCyberClick();
      await deleteTrainingRecord(recordId);
      showNotification(`ลบประวัติของ ${fullName} เรียบร้อยแล้ว`);
    }
  };

  // ========================================================
  // 3. EMPLOYEES MASTER TAB STATE & ACTIONS ("employees_master")
  // ========================================================
  const [empMasterSearch, setEmpMasterSearch] = useState('');
  const [empMasterDeptFilter, setEmpMasterDeptFilter] = useState('ALL');
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<MasterEmployeeRecord | null>(null);

  const [formEmpId, setFormEmpId] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formDept, setFormDept] = useState('P');
  const [formPosition, setFormPosition] = useState('พนักงานฝ่ายปฏิบัติการ');
  const [formPin, setFormPin] = useState('1234');
  const [formRole, setFormRole] = useState<'employee' | 'admin'>('employee');

  const filteredMasterEmployees = useMemo(() => {
    return masterEmployees.filter(emp => {
      const q = empMasterSearch.trim().toLowerCase();
      const matchSearch = !q ||
        emp.empId.toLowerCase().includes(q) ||
        emp.fullName.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q);
      const matchDept = empMasterDeptFilter === 'ALL' || emp.department === empMasterDeptFilter;
      return matchSearch && matchDept;
    });
  }, [masterEmployees, empMasterSearch, empMasterDeptFilter]);

  const openAddEmpModal = () => {
    setEditingEmp(null);
    setFormEmpId('');
    setFormFullName('');
    setFormDept('P');
    setFormPosition('พนักงานฝ่ายปฏิบัติการ');
    setFormPin('1234');
    setFormRole('employee');
    setIsEmpModalOpen(true);
  };

  const openEditEmpModal = (emp: MasterEmployeeRecord) => {
    setEditingEmp(emp);
    setFormEmpId(emp.empId);
    setFormFullName(emp.fullName);
    setFormDept(emp.department);
    setFormPosition(emp.position);
    setFormPin(emp.pin || '1234');
    setFormRole(emp.role || 'employee');
    setIsEmpModalOpen(true);
  };

  const handleSaveEmp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmpId.trim() || !formFullName.trim()) return;
    playCyberClick();

    const empData: MasterEmployeeRecord = {
      empId: formEmpId.trim().toUpperCase(),
      fullName: formFullName.trim(),
      department: formDept.trim(),
      position: formPosition.trim(),
      pin: formPin.trim() || '1234',
      role: formRole
    };

    await saveEmployeeMaster(empData);
    setIsEmpModalOpen(false);
    showNotification(`บันทึกข้อมูลพนักงาน ${empData.fullName} (${empData.empId}) ลง Firestore เรียบร้อยแล้ว`);
  };

  const handleDeleteEmp = async (empId: string, name: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบพนักงาน ${name} (${empId}) ออกจากฐานข้อมูลพนักงานตั้งต้น?`)) {
      playCyberClick();
      await deleteEmployeeMaster(empId);
      showNotification(`ลบพนักงาน ${name} เรียบร้อยแล้ว`);
    }
  };

  const handleSyncMasterEmployees = async () => {
    playCyberClick();
    const count = await seedEmployeesMasterIfEmpty();
    showNotification(`ซิงค์ฐานข้อมูลพนักงานตั้งต้นเข้า Firestore สำเร็จ (${count} รายการ)`);
  };

  // ========================================================
  // 4. SYSTEM SETTINGS TAB STATE & ACTIONS ("system_settings")
  // ========================================================
  const [formSettings, setFormSettings] = useState<SystemSettingsData>(settings);

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    playCyberClick();
    await saveSystemSettings(formSettings);
    showNotification('บันทึกการตั้งค่าระบบและผู้ลงนามลง Firestore สำเร็จแล้ว (ไม่มีการรีเซ็ตกลับ)');
  };

  // ========================================================
  // 5. PRINT READY DOCUMENTS TAB STATE & ACTIONS
  // ========================================================
  const [printDocType, setPrintDocType] = useState<'course_report' | 'cert' | 'ojt_card'>('course_report');
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<TrainingRecordData | null>(null);
  const printCanvasRef = useRef<HTMLDivElement>(null);

  const handleOpenPrintPreview = (type: 'course_report' | 'cert' | 'ojt_card', record?: TrainingRecordData) => {
    playCyberClick();
    setPrintDocType(type);
    if (record) setSelectedRecordForPrint(record);
    setActiveTab('print');
  };

  const handlePrintDocument = () => {
    if (!printCanvasRef.current) return;
    playCyberClick();
    const isLandscape = printDocType === 'cert';
    printA4Document({
      title: printDocType === 'cert' ? `เกียรติบัตร_${selectedRecordForPrint?.empId || 'TCT'}` : `เอกสาร_${settings.docControlNo}`,
      elementOrHtml: printCanvasRef.current,
      orientation: isLandscape ? 'landscape' : 'portrait',
      autoPrint: true
    });
  };

  const handleDownloadDocHtml = () => {
    if (!printCanvasRef.current) return;
    playCyberClick();
    downloadDocumentHtml(
      `TCT_Document_${printDocType}_${settings.docControlNo}.html`,
      `เอกสารทางการ - ${settings.companyName}`,
      printCanvasRef.current,
      printDocType === 'cert' ? 'landscape' : 'portrait'
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sarabun w-full max-w-full overflow-x-hidden">
      {/* ============================================================== */}
      {/* TOP ADMIN HEADER                                               */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={onBackToLearner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>กลับสู่หน้าผู้เรียน</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">ระบบจัดการหลังบ้าน (TCT Admin Console)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900/80 text-blue-200 border border-blue-500/40">
                FIRESTORE REAL-TIME
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-bold">
            <button
              onClick={() => setActiveTab('rosters')}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'rosters'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
              <span>ใบรายชื่อผู้เข้าอบรม ({currentRoster.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'records'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-emerald-300" />
              <span>ผู้ผ่านการอบรม ({trainingRecords.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('employees')}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'employees'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-blue-300" />
              <span>ฐานข้อมูลพนักงาน ({masterEmployees.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4 text-purple-300" />
              <span>ผู้ลงนามและตั้งค่า</span>
            </button>

            <button
              onClick={() => setActiveTab('print')}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'print'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-emerald-400 hover:text-white'
              }`}
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>พิมพ์เอกสาร A4</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notice Banner */}
      {notice && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/60 px-4 py-2.5 text-xs text-emerald-200 text-center font-bold flex items-center justify-center gap-2 sticky top-[57px] z-30 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-6 space-y-6 overflow-x-hidden">

        {/* ============================================================ */}
        {/* TAB 1: TRAINING ROSTERS ("training_rosters")                  */}
        {/* ============================================================ */}
        {activeTab === 'rosters' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Top Toolbar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Course Selection Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>เลือกหลักสูตรที่ต้องการดูและจัดการใบรายชื่อ:</span>
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      playCyberClick();
                      setSelectedCourseId(e.target.value);
                    }}
                    className="w-full sm:w-96 px-3.5 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 text-white font-bold text-xs sm:text-sm focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="applied-psychology">🧠 จิตวิทยาประยุกต์ในการทำงาน (Applied Psychology - TCT-PSY-01)</option>
                    <option value="risk-management">หลักสูตร 1: การบริหารความเสี่ยง (QSRM) — TCT-QSRM-01</option>
                    <option value="advanced-preventive-maintenance">หลักสูตร 2: การบำรุงรักษาเชิงป้องกันขั้นสูง (APM) — TCT-APM-02</option>
                    <option value="conflict-management">หลักสูตร 3: การจัดการความขัดแย้งเชิงบวก (CFM) — TCT-CFM-03</option>
                    <option value="ai-for-tct">หลักสูตร 4: AI for TCT เพื่อการผลิตและความปลอดภัย (TCT-AI-101)</option>
                    <option value="personality-psychology">หลักสูตร 5: จิตวิทยาบุคลิกภาพและการปรับตัว (TCT-A001)</option>
                    <option value="kyt-shisa-kanko">หลักสูตร 6: KYT & SHISA KANKO การคาดการณ์อันตราย (TCT-KYT-01)</option>
                    <option value="good-employee-skills">⭐ หลักสูตร 8: ทักษะการเป็นพนักงานที่ดี (Good Employee Skills - TCT-GES-01)</option>
                    {courses
                      .filter(c => !['applied-psychology', 'risk-management', 'advanced-preventive-maintenance', 'conflict-management', 'ai-for-tct', 'personality-psychology', 'kyt-shisa-kanko', 'good-employee-skills'].includes(c.id))
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.title} ({c.id})</option>
                      ))
                    }
                  </select>
                </div>

                {/* Cohort Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>รุ่น/วันที่จัดอบรม:</span>
                  </label>
                  <input
                    type="date"
                    value={cohortDate}
                    onChange={(e) => setCohortDate(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold"
                  />
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap pt-2 lg:pt-0">
                  {/* Button: Add/Pull Trainees to Roster */}
                  <button
                    onClick={() => {
                      playCyberClick();
                      setSelectedEmpIdsForEnroll(new Set());
                      setIsEnrollModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    title="เลือกพนักงานจากฐานข้อมูลตั้งต้นหรือผู้สอบผ่านเพื่อดึงเข้าสู่ใบรายชื่อนี้"
                  >
                    <UserPlus className="w-4 h-4 text-slate-700" />
                    <span>+ ดึงรายชื่อเข้าใบรายชื่อ</span>
                  </button>

                  {/* Button: Reset/Re-sync Roster */}
                  <button
                    onClick={handleResetRosterCache}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="ล้างสถานะค้างและดึงข้อมูลใหม่จาก Firestore ทันที"
                  >
                    <RotateCcw className={`w-4 h-4 ${isRosterLoading ? 'animate-spin text-slate-400' : 'text-slate-400'}`} />
                    <span>ล้างสถานะ/ดึงรายชื่อใหม่</span>
                  </button>

                  {/* Button: Print Roster A4 */}
                  <button
                    onClick={handlePrintRosterA4}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    title="เปิดหน้าต่างใหม่เพื่อพิมพ์ใบรายชื่อผู้เข้าอบรมขนาด A4"
                  >
                    <Printer className="w-4 h-4 text-slate-300" />
                    <span>พิมพ์ใบรายชื่อ A4</span>
                  </button>

                  {/* Button: Export CSV */}
                  <button
                    onClick={handleExportRosterCsv}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                    title="ส่งออกใบรายชื่อเป็นไฟล์ Excel CSV"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              {/* Search in Current Roster Table */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="ค้นหาในใบรายชื่อ (รหัสพนักงาน, ชื่อ-นามสกุล, แผนก)..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="text-xs text-slate-400">
                  จำนวนผู้เข้าอบรมในใบรายชื่อนี้: <strong className="text-cyan-300 font-mono text-sm">{currentRoster.length}</strong> ท่าน
                </div>
              </div>
            </div>

            {/* Roster Table Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sarabun text-slate-300">
                  <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase text-[11px] border-b border-slate-700">
                    <tr>
                      <th className="p-3.5 text-center w-12">ลำดับ</th>
                      <th className="p-3.5 w-28">รหัสพนักงาน</th>
                      <th className="p-3.5">ชื่อ - นามสกุล</th>
                      <th className="p-3.5 w-20">แผนก</th>
                      <th className="p-3.5 w-32">ตำแหน่ง</th>
                      <th className="p-3.5 text-center w-24">Pre-Test</th>
                      <th className="p-3.5 text-center w-24">Post-Test</th>
                      <th className="p-3.5 text-center w-28">สถานะการอบรม</th>
                      <th className="p-3.5 w-36">เลขที่เกียรติบัตร</th>
                      <th className="p-3.5 text-center w-28">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredCurrentRoster.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-12 text-center text-slate-500">
                          <Users className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
                          <p className="text-sm font-semibold text-slate-400">ยังไม่มีรายชื่อผู้เข้าอบรมในหลักสูตรนี้</p>
                          <p className="text-xs text-slate-500 mt-1">
                            กดปุ่ม <strong>"+ ดึงรายชื่อเข้าใบรายชื่อ"</strong> ด้านบนเพื่อเลือกพนักงานเข้าสู่ใบรายชื่อนี้ทันที
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredCurrentRoster.map((trainee, idx) => (
                        <tr key={trainee.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3.5 text-center text-slate-500 font-mono">{idx + 1}</td>
                          <td className="p-3.5 font-mono font-bold text-cyan-300">{trainee.empId}</td>
                          <td className="p-3.5 font-medium text-white">{trainee.fullName}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
                              {trainee.department}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400 truncate max-w-[150px]">{trainee.position}</td>
                          <td className="p-3.5 text-center font-mono font-semibold text-blue-300">
                            {trainee.preTestScore !== null && trainee.preTestScore !== undefined ? `${trainee.preTestScore}/10` : '-'}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-emerald-400">
                            {trainee.postTestScore !== null && trainee.postTestScore !== undefined ? `${trainee.postTestScore}/10` : '-'}
                          </td>
                          <td className="p-3.5 text-center">
                            {trainee.status === 'passed' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                                ผ่านเกณฑ์
                              </span>
                            ) : trainee.status === 'failed' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                                ไม่ผ่าน
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-500/40">
                                เข้าอบรม
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-400">
                            {trainee.certificateId || '-'}
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditScoreModal(trainee)}
                                className="p-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/50 cursor-pointer"
                                title="แก้ไขคะแนน/ผลประเมิน"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveTrainee(trainee.empId, trainee.fullName)}
                                className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/50 cursor-pointer"
                                title="นำออกจากใบรายชื่อนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hidden Printable Roster Template */}
            <div className="hidden">
              <div ref={rosterPrintCanvasRef} className="p-6 font-sarabun text-slate-900 bg-white">
                <div className="border border-black p-3 mb-4">
                  <div className="flex justify-between items-start border-b border-black pb-2 mb-2">
                    <div>
                      <div className="font-extrabold text-base text-[#002D5A]">{settings.companyName}</div>
                      <div className="text-xs text-slate-600">{settings.centerName} • บันทึกใบรายชื่อผู้เข้ารับการฝึกอบรม</div>
                    </div>
                    <div className="text-right text-xs font-mono">
                      <div className="font-bold">Doc No.: {settings.docControlNo}</div>
                      <div>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}</div>
                    </div>
                  </div>
                  <div className="text-center font-bold text-sm">
                    หลักสูตร: {activeCourse.title} (รุ่นวันที่: {cohortDate})
                  </div>
                </div>

                <table className="w-full text-left text-xs border border-black border-collapse">
                  <thead className="bg-slate-100 border-b border-black text-center font-bold">
                    <tr>
                      <th className="border-r border-black p-1.5 w-10">ลำดับ</th>
                      <th className="border-r border-black p-1.5 w-24">รหัสพนักงาน</th>
                      <th className="border-r border-black p-1.5">ชื่อ-นามสกุล</th>
                      <th className="border-r border-black p-1.5 w-16">แผนก</th>
                      <th className="border-r border-black p-1.5 w-20">Pre-Test</th>
                      <th className="border-r border-black p-1.5 w-20">Post-Test</th>
                      <th className="border-r border-black p-1.5 w-20">ผลประเมิน</th>
                      <th className="p-1.5 w-32">เลขที่เกียรติบัตร</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {currentRoster.map((r, i) => (
                      <tr key={i} className="divide-x divide-black text-center">
                        <td className="p-1 font-mono">{i + 1}</td>
                        <td className="p-1 font-mono font-bold">{r.empId}</td>
                        <td className="p-1 text-left font-medium">{r.fullName}</td>
                        <td className="p-1 font-mono">{r.department}</td>
                        <td className="p-1 font-mono">{r.preTestScore !== null && r.preTestScore !== undefined ? r.preTestScore : '-'}</td>
                        <td className="p-1 font-mono font-bold">{r.postTestScore !== null && r.postTestScore !== undefined ? r.postTestScore : '-'}</td>
                        <td className="p-1">{r.status === 'passed' ? 'ผ่านเกณฑ์' : 'เข้าอบรม'}</td>
                        <td className="p-1 font-mono text-[10px]">{r.certificateId || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 3 Executive Signatories & Approval Bar */}
                <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs">
                  <div className="space-y-1">
                    <div className="h-8 flex items-end justify-center font-serif italic text-xs text-slate-500">(ลงนามแล้ว)</div>
                    <div className="border-t border-black pt-1">
                      <div className="font-bold text-[11px]">{settings.signatory1Name}</div>
                      <div className="text-[10px] text-slate-600">{settings.signatory1Position}</div>
                      <div className="text-[9px] text-slate-500">{settings.signatory1Role}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="h-8 flex items-end justify-center font-serif italic text-xs text-slate-500">(ลงนามแล้ว)</div>
                    <div className="border-t border-black pt-1">
                      <div className="font-bold text-[11px]">{settings.signatory2Name}</div>
                      <div className="text-[10px] text-slate-600">{settings.signatory2Position}</div>
                      <div className="text-[9px] text-slate-500">{settings.signatory2Role}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="h-8 flex items-end justify-center font-serif italic text-xs font-bold text-slate-900">(อนุมัติสมบูรณ์)</div>
                    <div className="border-t border-black pt-1">
                      <div className="font-bold text-[11px]">{settings.signatory3Name}</div>
                      <div className="text-[10px] text-slate-600">{settings.signatory3Position}</div>
                      <div className="text-[9px] text-slate-500">{settings.signatory3Role}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 text-[9px] text-slate-500 flex justify-between border-t border-slate-200 mt-6">
                  <span>เอกสารควบคุมระบบศูนย์พัฒนาบุคลากร TCT Academy • พ.ร.บ. ส่งเสริมการพัฒนาฝีมือแรงงาน</span>
                  <span>PS-TR-ROSTER-V4</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: PASSED TRAINING RECORDS ("training_records")           */}
        {/* ============================================================ */}
        {activeTab === 'records' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={recordSearch}
                    onChange={(e) => setRecordSearch(e.target.value)}
                    placeholder="ค้นหาประวัติผู้สอบผ่าน (รหัสพนักงาน, ชื่อ, เลขที่เกียรติบัตร)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportRecordsCsv}
                    className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4 text-slate-700" />
                    <span>Export Excel (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Department & Course Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">กรองตามแผนก:</label>
                  <select
                    value={recordDeptFilter}
                    onChange={(e) => setRecordDeptFilter(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="ALL">ทุกแผนก (ALL)</option>
                    {['P', 'PP', 'PS', 'ESH', 'ST', 'SEC', 'MN', 'TC', 'TR', 'QA', 'FI', 'TW', 'RW'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">กรองตามหลักสูตร:</label>
                  <select
                    value={recordCourseFilter}
                    onChange={(e) => setRecordCourseFilter(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="ALL">ทุกหลักสูตร (ALL COURSES)</option>
                    <option value="applied-psychology">จิตวิทยาประยุกต์ในการทำงาน (Applied Psychology)</option>
                    <option value="risk-management">การบริหารความเสี่ยง (QSRM)</option>
                    <option value="advanced-preventive-maintenance">การบำรุงรักษาเชิงป้องกันขั้นสูง (APM)</option>
                    <option value="conflict-management">การจัดการความขัดแย้งเชิงบวก (CFM)</option>
                    <option value="ai-for-tct">AI for TCT เพื่อการผลิตและความปลอดภัย</option>
                    <option value="personality-psychology">จิตวิทยาบุคลิกภาพและการปรับตัว</option>
                    <option value="kyt-shisa-kanko">KYT & SHISA KANKO การคาดการณ์อันตราย</option>
                    <option value="good-employee-skills">⭐ ทักษะการเป็นพนักงานที่ดี (Good Employee Skills)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Records Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sarabun text-slate-300">
                  <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase text-[11px] border-b border-slate-700">
                    <tr>
                      <th className="p-3.5 text-center w-12">ลำดับ</th>
                      <th className="p-3.5 w-28">รหัสพนักงาน</th>
                      <th className="p-3.5">ชื่อ - สกุล</th>
                      <th className="p-3.5 w-16">แผนก</th>
                      <th className="p-3.5">หลักสูตรที่ผ่าน</th>
                      <th className="p-3.5 text-center w-24">คะแนน</th>
                      <th className="p-3.5 text-center w-28">วันที่สอบผ่าน</th>
                      <th className="p-3.5 w-36">เลขที่เกียรติบัตร</th>
                      <th className="p-3.5 text-center w-28">พิมพ์/จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-12 text-center text-slate-500">
                          <Award className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
                          <p className="text-sm font-semibold text-slate-400">ยังไม่พบประวัติผู้ผ่านการทดสอบ</p>
                          <p className="text-xs text-slate-500 mt-1">
                            เมื่อพนักงานทำข้อสอบผ่านเกณฑ์ (80%) ระบบจะบันทึกเข้า Collection training_records โดยอัตโนมัติ
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((rec, idx) => (
                        <tr key={rec.id || idx} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3.5 text-center text-slate-500 font-mono">{idx + 1}</td>
                          <td className="p-3.5 font-mono font-bold text-cyan-300">{rec.empId}</td>
                          <td className="p-3.5 font-medium text-white">{rec.fullName}</td>
                          <td className="p-3.5 font-mono">{rec.department}</td>
                          <td className="p-3.5 text-slate-300">{rec.courseTitle}</td>
                          <td className="p-3.5 text-center font-mono font-bold text-emerald-400">
                            {rec.examScore}/{rec.examTotal} ({rec.examPercentage}%)
                          </td>
                          <td className="p-3.5 text-center text-slate-400 text-[11px]">{rec.completedAt}</td>
                          <td className="p-3.5 font-mono text-[11px] text-cyan-300">{rec.certificateId}</td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenPrintPreview('cert', rec)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-600/40 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                                title="พิมพ์เกียรติบัตร A4"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>เกียรติบัตร</span>
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(rec.id || `${rec.courseId}_${rec.empId}`, rec.fullName)}
                                className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/50 cursor-pointer"
                                title="ลบประวัติ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: EMPLOYEES MASTER ("employees_master")                  */}
        {/* ============================================================ */}
        {activeTab === 'employees' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Toolbar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={empMasterSearch}
                  onChange={(e) => setEmpMasterSearch(e.target.value)}
                  placeholder="ค้นหาในฐานข้อมูลพนักงานตั้งต้น (รหัสพนักงาน, ชื่อ, แผนก)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={empMasterDeptFilter}
                  onChange={(e) => setEmpMasterDeptFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-semibold"
                >
                  <option value="ALL">ทุกแผนก (ALL)</option>
                  {['P', 'PP', 'PS', 'ESH', 'ST', 'SEC', 'MN', 'TC', 'TR', 'QA', 'FI', 'TW', 'RW'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <button
                  onClick={openAddEmpModal}
                  className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มพนักงานใหม่</span>
                </button>

                <button
                  onClick={handleSyncMasterEmployees}
                  className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  title="ซิงค์ข้อมูลพนักงานตั้งต้น 230 ท่าน"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>ซิงค์ 230 ท่าน</span>
                </button>
              </div>
            </div>

            {/* Master Employees Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sarabun text-slate-300">
                  <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase text-[11px] border-b border-slate-700">
                    <tr>
                      <th className="p-3.5 text-center w-12">ลำดับ</th>
                      <th className="p-3.5 w-28">รหัสพนักงาน</th>
                      <th className="p-3.5">ชื่อ - นามสกุล</th>
                      <th className="p-3.5 w-20">แผนก</th>
                      <th className="p-3.5">ตำแหน่ง</th>
                      <th className="p-3.5 text-center w-24">สิทธิ์ผู้ใช้</th>
                      <th className="p-3.5 text-center w-24">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredMasterEmployees.slice(0, 100).map((emp, idx) => (
                      <tr key={emp.empId} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3.5 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="p-3.5 font-mono font-bold text-cyan-300">{emp.empId}</td>
                        <td className="p-3.5 font-medium text-white">{emp.fullName}</td>
                        <td className="p-3.5 font-mono">{emp.department}</td>
                        <td className="p-3.5 text-slate-400">{emp.position}</td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${emp.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-400'}`}>
                            {emp.role || 'employee'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditEmpModal(emp)}
                              className="p-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/50 cursor-pointer"
                              title="แก้ไข"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmp(emp.empId, emp.fullName)}
                              className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/50 cursor-pointer"
                              title="ลบ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: SYSTEM SETTINGS ("system_settings")                    */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span>การตั้งค่าระบบ ผู้ลงนาม และเลขที่เอกสาร (System Settings)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ข้อมูลส่วนนี้จะถูกบันทึกลง Collection "system_settings" ใน Firestore ทันที และจะถูกโหลดมาใช้งานเสมอเมื่อเปิดระบบ (ไม่รีเซ็ต)
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ชื่อบริษัท (ภาษาไทย)</label>
                  <input
                    type="text"
                    value={formSettings.companyName}
                    onChange={(e) => setFormSettings({ ...formSettings, companyName: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ชื่อบริษัท (English)</label>
                  <input
                    type="text"
                    value={formSettings.companyNameEn}
                    onChange={(e) => setFormSettings({ ...formSettings, companyNameEn: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ชื่อศูนย์ฝึกอบรม</label>
                  <input
                    type="text"
                    value={formSettings.centerName}
                    onChange={(e) => setFormSettings({ ...formSettings, centerName: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">เลขที่เอกสารควบคุม (Document No.)</label>
                  <input
                    type="text"
                    value={formSettings.docControlNo}
                    onChange={(e) => setFormSettings({ ...formSettings, docControlNo: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* 3 Signatories Configuration */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h3 className="font-bold text-white text-sm text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ผู้มีอำนาจตรวจรับรองและลงนามในเอกสาร 3 ท่าน:</span>
                </h3>

                {/* Signatory 1 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-3">
                  <div className="font-semibold text-xs text-blue-300">ลำดับที่ 1: ผู้จัดทำและตรวจสอบรายงาน</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={formSettings.signatory1Name}
                      onChange={(e) => setFormSettings({ ...formSettings, signatory1Name: e.target.value })}
                      placeholder="ชื่อ-นามสกุล"
                      className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                    <input
                      type="text"
                      value={formSettings.signatory1Position}
                      onChange={(e) => setFormSettings({ ...formSettings, signatory1Position: e.target.value })}
                      placeholder="ตำแหน่งงาน"
                      className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                    <input
                      type="text"
                      value={formSettings.signatory1Role}
                      onChange={(e) => setFormSettings({ ...formSettings, signatory1Role: e.target.value })}
                      placeholder="บทบาทหน้าที่"
                      className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>

                {/* Signatory 2 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-3">
                  <div className="font-semibold text-xs text-blue-300">ลำดับที่ 2: ผู้กำกับดูแลศูนย์ฝึกอบรม</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={formSettings.signatory2Name}
                      onChange={(e) => setFormSettings({ ...formSettings, signatory2Name: e.target.value })}
                      placeholder="ชื่อ-นามสกุล"
                      className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                    <input
                      type="text"
                      value={formSettings.signatory2Position}
                      onChange={(e) => setFormSettings({ ...formSettings, signatory2Position: e.target.value })}
                      placeholder="ตำแหน่งงาน"
                      className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                    <input
                      type="text"
                      value={formSettings.signatory2Role}
                      onChange={(e) => setFormSettings({ ...formSettings, signatory2Role: e.target.value })}
                      placeholder="บทบาทหน้าที่"
                      className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>

                {/* Signatory 3 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-3">
                  <div className="font-semibold text-xs text-blue-300">ลำดับที่ 3: ผู้อนุมัติและประธานที่ปรึกษาศูนย์</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={formSettings.signatory3Name}
                      onChange={(e) => setFormSettings({ ...formSettings, signatory3Name: e.target.value })}
                      placeholder="ชื่อ-นามสกุล"
                      className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                    <input
                      type="text"
                      value={formSettings.signatory3Position}
                      onChange={(e) => setFormSettings({ ...formSettings, signatory3Position: e.target.value })}
                      placeholder="ตำแหน่งงาน"
                      className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                    <input
                      type="text"
                      value={formSettings.signatory3Role}
                      onChange={(e) => setFormSettings({ ...formSettings, signatory3Role: e.target.value })}
                      placeholder="บทบาทหน้าที่"
                      className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-md transition-all cursor-pointer text-sm"
              >
                บันทึกการตั้งค่าทั้งหมดลง Firestore ทันที
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: PRINT-READY A4 DOCUMENTS (Dedicated Print Engine)     */}
        {/* ============================================================ */}
        {activeTab === 'print' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Control Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">เลือกรูปแบบเอกสาร A4:</span>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <button
                    onClick={() => setPrintDocType('course_report')}
                    className={`py-1.5 px-3 rounded-lg cursor-pointer ${
                      printDocType === 'course_report'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    รายงานสรุปผลการอบรม (PS-TR-00-05)
                  </button>
                  <button
                    onClick={() => setPrintDocType('cert')}
                    className={`py-1.5 px-3 rounded-lg cursor-pointer ${
                      printDocType === 'cert'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ใบเกียรติบัตร (E-Certificate)
                  </button>
                  <button
                    onClick={() => setPrintDocType('ojt_card')}
                    className={`py-1.5 px-3 rounded-lg cursor-pointer ${
                      printDocType === 'ojt_card'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ประวัติรายบุคคล (OJT Card)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadDocHtml}
                  className="py-2 px-3.5 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs flex items-center gap-1.5 cursor-pointer"
                  title="ดาวน์โหลดไฟล์เอกสาร HTML สำรอง"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>ดาวน์โหลด HTML</span>
                </button>

                <button
                  onClick={handlePrintDocument}
                  className="py-2 px-4 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
                  title="เปิดหน้าต่างใหม่เพื่อพิมพ์เอกสาร A4 เต็มหน้า"
                >
                  <Printer className="w-4 h-4 text-slate-700" />
                  <span>สั่งพิมพ์กระดาษ A4</span>
                </button>
              </div>
            </div>

            {/* A4 DOCUMENT CANVAS */}
            <div className="w-full max-w-full overflow-x-auto pb-6 flex flex-col items-center">
              <div 
                ref={printCanvasRef}
                className="bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-[210mm] mx-auto min-h-[297mm] font-sarabun border border-slate-300"
              >
              {/* 1. OFFICIAL TRAINING REPORT A4 (PS-TR-00-05) */}
              {printDocType === 'course_report' && (
                <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
                  <div className="border border-black p-3 space-y-2">
                    <div className="flex items-start justify-between border-b border-black pb-2">
                      <div>
                        <div contentEditable suppressContentEditableWarning className="font-extrabold text-sm sm:text-base text-[#005A9C]">
                          {settings.companyName}
                        </div>
                        <div contentEditable suppressContentEditableWarning className="text-xs text-slate-600">
                          {settings.companyNameEn} • {settings.centerName}
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <div contentEditable suppressContentEditableWarning className="font-bold">
                          Document No.: {settings.docControlNo}
                        </div>
                        <div contentEditable suppressContentEditableWarning className="text-slate-500">
                          Rev. 04 • Date: {new Date().toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    </div>

                    <div className="text-center py-2 space-y-1">
                      <h1 contentEditable suppressContentEditableWarning className="text-base sm:text-lg font-black uppercase tracking-wide">
                        แบบรายงานสรุปผลการฝึกอบรมภายในบริษัท และผลการประเมินความพึงพอใจ
                      </h1>
                      <div contentEditable suppressContentEditableWarning className="text-xs font-semibold text-slate-700">
                        หลักสูตร: {activeCourse.title} (รุ่นวันที่: {cohortDate})
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Stats Box */}
                  <div className="grid grid-cols-4 border border-black text-center text-xs divide-x divide-black bg-slate-50">
                    <div className="p-2">
                      <div className="text-slate-500">ผู้เข้าอบรมทั้งหมด</div>
                      <div contentEditable suppressContentEditableWarning className="font-bold text-sm text-black">
                        {currentRoster.length} ท่าน
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="text-slate-500">ผ่านการทดสอบ (100%)</div>
                      <div contentEditable suppressContentEditableWarning className="font-bold text-sm text-black">
                        {currentRoster.filter(r => r.status === 'passed').length} ท่าน
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="text-slate-500">คะแนนเฉลี่ย</div>
                      <div contentEditable suppressContentEditableWarning className="font-bold text-sm text-black">
                        95%
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="text-slate-500">ความพึงพอใจ</div>
                      <div contentEditable suppressContentEditableWarning className="font-bold text-sm text-black">
                        4.9 / 5.0 ⭐
                      </div>
                    </div>
                  </div>

                  {/* Trainee Roster Table */}
                  <div className="border border-black">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 border-b border-black font-bold text-center">
                        <tr>
                          <th className="border-r border-black p-1.5 w-10">ลำดับ</th>
                          <th className="border-r border-black p-1.5 w-24">รหัสพนักงาน</th>
                          <th className="border-r border-black p-1.5">ชื่อ-นามสกุล</th>
                          <th className="border-r border-black p-1.5 w-16">แผนก</th>
                          <th className="border-r border-black p-1.5 w-24">คะแนนสอบ</th>
                          <th className="border-r border-black p-1.5 w-20">ผลการอบรม</th>
                          <th className="p-1.5 w-32">เลขที่ใบเกียรติบัตร</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black">
                        {currentRoster.slice(0, 15).map((r, idx) => (
                          <tr key={idx} className="divide-x divide-black text-center">
                            <td className="p-1">{idx + 1}</td>
                            <td contentEditable suppressContentEditableWarning className="p-1 font-mono font-bold">{r.empId}</td>
                            <td contentEditable suppressContentEditableWarning className="p-1 text-left font-medium">{r.fullName}</td>
                            <td contentEditable suppressContentEditableWarning className="p-1">{r.department}</td>
                            <td contentEditable suppressContentEditableWarning className="p-1 font-mono">
                              {r.postTestScore !== null && r.postTestScore !== undefined ? `${r.postTestScore}/10` : '-'}
                            </td>
                            <td contentEditable suppressContentEditableWarning className="p-1 font-bold text-emerald-800">
                              {r.status === 'passed' ? 'ผ่านเกณฑ์' : 'เข้าอบรม'}
                            </td>
                            <td contentEditable suppressContentEditableWarning className="p-1 font-mono text-[10px]">{r.certificateId || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 3 Signatories Box */}
                  <div className="pt-6 grid grid-cols-3 gap-4 border border-black p-4 text-center">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-700">ผู้จัดทำและตรวจสอบรายงาน</div>
                      <div className="h-12 flex items-end justify-center font-serif italic text-xs">(ลงนามแล้ว)</div>
                      <div className="border-t border-black pt-1">
                        <div contentEditable suppressContentEditableWarning className="font-bold text-xs">{settings.signatory1Name}</div>
                        <div contentEditable suppressContentEditableWarning className="text-[10px] text-slate-600">{settings.signatory1Position}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-700">ผู้กำกับดูแลศูนย์ฝึกอบรม</div>
                      <div className="h-12 flex items-end justify-center font-serif italic text-xs">(ลงนามแล้ว)</div>
                      <div className="border-t border-black pt-1">
                        <div contentEditable suppressContentEditableWarning className="font-bold text-xs">{settings.signatory2Name}</div>
                        <div contentEditable suppressContentEditableWarning className="text-[10px] text-slate-600">{settings.signatory2Position}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-blue-900">ผู้อนุมัติผลการฝึกอบรม</div>
                      <div className="h-12 flex items-end justify-center font-serif italic text-xs font-bold text-blue-900">(อนุมัติทางการ)</div>
                      <div className="border-t border-black pt-1">
                        <div contentEditable suppressContentEditableWarning className="font-bold text-xs">{settings.signatory3Name}</div>
                        <div contentEditable suppressContentEditableWarning className="text-[10px] text-slate-600">{settings.signatory3Position}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. E-CERTIFICATE A4 */}
              {printDocType === 'cert' && (
                <div className="border-4 border-double border-amber-600 p-8 text-center space-y-6">
                  <div className="space-y-1">
                    <div contentEditable suppressContentEditableWarning className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                      {settings.companyNameEn}
                    </div>
                    <h2 contentEditable suppressContentEditableWarning className="text-xl font-extrabold text-[#005A9C]">
                      {settings.companyName}
                    </h2>
                    <div contentEditable suppressContentEditableWarning className="inline-block bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full mt-1">
                      {settings.centerName}
                    </div>
                  </div>

                  <div className="space-y-1 pt-4">
                    <h1 contentEditable suppressContentEditableWarning className="text-3xl font-black text-slate-900 tracking-tight font-serif">
                      ใบประกาศนียบัตรรับรองการฝึกอบรม
                    </h1>
                    <p className="text-xs text-slate-600 tracking-widest uppercase">
                      CERTIFICATE OF TRAINING COMPLETION
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 italic">ใบประกาศนียบัตรฉบับนี้ออกให้เพื่อแสดงว่า</div>

                  <div className="py-2">
                    <h3 contentEditable suppressContentEditableWarning className="text-2xl font-black text-[#005A9C] border-b-2 border-amber-500/40 inline-block pb-1 px-8">
                      {selectedRecordForPrint?.fullName || 'นายณฐวัตร พงษ์สาริกิจ'}
                    </h3>
                    <div contentEditable suppressContentEditableWarning className="text-xs text-slate-600 mt-1">
                      รหัสพนักงาน: {selectedRecordForPrint?.empId || '25056'} • แผนก: {selectedRecordForPrint?.department || 'PS'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-600">ได้ผ่านการฝึกอบรมและทดสอบวัดผลสัมฤทธิ์ในหลักสูตร</p>
                    <h4 contentEditable suppressContentEditableWarning className="text-lg font-bold text-slate-900">
                      {selectedRecordForPrint?.courseTitle || activeCourse.title}
                    </h4>
                    <p contentEditable suppressContentEditableWarning className="text-xs text-slate-500">
                      คะแนนการทดสอบ: {selectedRecordForPrint?.examScore || 10}/{selectedRecordForPrint?.examTotal || 10} (ผ่านเกณฑ์มาตรฐาน)
                    </p>
                  </div>

                  <div contentEditable suppressContentEditableWarning className="text-xs text-slate-600">
                    ให้ไว้ ณ วันที่ {selectedRecordForPrint?.completedAt || new Date().toLocaleDateString('th-TH')}
                  </div>

                  {/* 3 Signatories */}
                  <div className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-200 mt-6 text-center">
                    <div className="space-y-1">
                      <div className="h-10 flex items-end justify-center font-serif italic text-xs text-slate-700">(ลงนามแล้ว)</div>
                      <div className="border-t border-slate-400 pt-1">
                        <div contentEditable suppressContentEditableWarning className="text-xs font-bold">{settings.signatory1Name}</div>
                        <div contentEditable suppressContentEditableWarning className="text-[10px] text-slate-500">{settings.signatory1Position}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-10 flex items-end justify-center font-serif italic text-xs text-slate-700">(ลงนามแล้ว)</div>
                      <div className="border-t border-slate-400 pt-1">
                        <div contentEditable suppressContentEditableWarning className="text-xs font-bold">{settings.signatory2Name}</div>
                        <div contentEditable suppressContentEditableWarning className="text-[10px] text-slate-500">{settings.signatory2Position}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-10 flex items-end justify-center font-serif italic text-xs font-bold text-blue-900">(ลงนามรับรอง)</div>
                      <div className="border-t border-slate-400 pt-1">
                        <div contentEditable suppressContentEditableWarning className="text-xs font-bold">{settings.signatory3Name}</div>
                        <div contentEditable suppressContentEditableWarning className="text-[10px] text-slate-500">{settings.signatory3Position}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                    <span contentEditable suppressContentEditableWarning>Doc No. {settings.docControlNo}</span>
                    <span contentEditable suppressContentEditableWarning>Ref: {selectedRecordForPrint?.certificateId || 'TCT-CERT-2026'}</span>
                    <span>TCT Academy Verified</span>
                  </div>
                </div>
              )}

              {/* 3. INDIVIDUAL OJT TRAINING CARD A4 */}
              {printDocType === 'ojt_card' && (
                <div className="border border-black p-6 space-y-5 text-xs">
                  <div className="flex items-center justify-between border-b border-black pb-3">
                    <div>
                      <div contentEditable suppressContentEditableWarning className="font-extrabold text-base text-[#005A9C]">
                        {settings.companyName}
                      </div>
                      <div contentEditable suppressContentEditableWarning className="text-slate-600">
                        {settings.centerName} • บันทึกประวัติการฝึกอบรมรายบุคคล (Individual Training Card / OJT)
                      </div>
                    </div>
                    <div contentEditable suppressContentEditableWarning className="font-mono text-right">
                      <div>Form No. {settings.docControlNo}-OJT</div>
                      <div>พ.ร.บ. ส่งเสริมการพัฒนาฝีมือแรงงาน</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 border border-black p-3 bg-slate-50 gap-2">
                    <div>
                      <span className="text-slate-500">รหัสพนักงาน:</span>{' '}
                      <span contentEditable suppressContentEditableWarning className="font-bold font-mono">
                        {selectedRecordForPrint?.empId || '25056'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">ชื่อ-นามสกุล:</span>{' '}
                      <span contentEditable suppressContentEditableWarning className="font-bold">
                        {selectedRecordForPrint?.fullName || 'นายณฐวัตร พงษ์สาริกิจ'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">แผนก/ฝ่าย:</span>{' '}
                      <span contentEditable suppressContentEditableWarning className="font-bold">
                        {selectedRecordForPrint?.department || 'PS'}
                      </span>
                    </div>
                  </div>

                  <div className="border border-black">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 border-b border-black font-bold text-center">
                        <tr>
                          <th className="border-r border-black p-2 w-10">ลำดับ</th>
                          <th className="border-r border-black p-2">หลักสูตรฝึกอบรม</th>
                          <th className="border-r border-black p-2 w-24">วันที่ผ่าน</th>
                          <th className="border-r border-black p-2 w-20">คะแนน</th>
                          <th className="border-r border-black p-2 w-24">ผลการประเมิน</th>
                          <th className="p-2 w-28">ผู้ควบคุม / ครูฝึก</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black text-center">
                        <tr className="divide-x divide-black">
                          <td className="p-2">1</td>
                          <td contentEditable suppressContentEditableWarning className="p-2 text-left font-semibold">
                            {selectedRecordForPrint?.courseTitle || activeCourse.title}
                          </td>
                          <td contentEditable suppressContentEditableWarning className="p-2">
                            {selectedRecordForPrint?.completedAt || new Date().toLocaleDateString('th-TH')}
                          </td>
                          <td contentEditable suppressContentEditableWarning className="p-2 font-bold font-mono">
                            {selectedRecordForPrint?.examScore || 10}/{selectedRecordForPrint?.examTotal || 10}
                          </td>
                          <td contentEditable suppressContentEditableWarning className="p-2 text-emerald-800 font-bold">
                            ผ่านเกณฑ์มาตรฐาน
                          </td>
                          <td contentEditable suppressContentEditableWarning className="p-2">
                            {settings.signatory1Name}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="border border-black p-4 space-y-4">
                    <div className="space-y-1">
                      <span className="font-bold">ความเห็นของหัวหน้างาน / ผู้จัดการแผนก:</span>
                      <p contentEditable suppressContentEditableWarning className="border-b border-dotted border-black pb-2 text-slate-700">
                        พนักงานมีความรู้ความเข้าใจในกระบวนการทำงานและสามารถนำมาตรฐานความปลอดภัยไปปฏิบัติจริงได้อย่างถูกต้อง
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-4">
                      <div className="text-center space-y-1">
                        <div className="h-10 flex items-end justify-center font-serif italic text-xs">(ลงนามแล้ว)</div>
                        <div className="border-t border-black pt-1">
                          <div contentEditable suppressContentEditableWarning className="font-bold">{settings.signatory1Name}</div>
                          <div contentEditable suppressContentEditableWarning className="text-slate-500 text-[10px]">{settings.signatory1Position}</div>
                        </div>
                      </div>

                      <div className="text-center space-y-1">
                        <div className="h-10 flex items-end justify-center font-serif italic text-xs font-bold">(อนุมัติ)</div>
                        <div className="border-t border-black pt-1">
                          <div contentEditable suppressContentEditableWarning className="font-bold">{settings.signatory3Name}</div>
                          <div contentEditable suppressContentEditableWarning className="text-slate-500 text-[10px]">{settings.signatory3Position}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: ENROLL TRAINEES INTO ROSTER (Direct to "training_rosters") */}
      {/* ============================================================== */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  <span>ดึงรายชื่อพนักงานเข้าใบรายชื่ออบรม (Enroll into Roster)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  หลักสูตร: <strong className="text-cyan-300">{activeCourse.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls */}
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 space-y-3">
              {/* Source Tabs */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  onClick={() => setEnrollSourceMode('master')}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                    enrollSourceMode === 'master'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  จากฐานข้อมูลพนักงานตั้งต้น ({masterEmployees.length})
                </button>
                <button
                  onClick={() => setEnrollSourceMode('passed_records')}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                    enrollSourceMode === 'passed_records'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  จากผู้ที่สอบผ่านเกณฑ์ ({trainingRecords.length})
                </button>
              </div>

              {/* Search & Dept Filter */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={enrollSearch}
                    onChange={(e) => setEnrollSearch(e.target.value)}
                    placeholder="ค้นหา (รหัสพนักงาน, ชื่อ-นามสกุล, แผนก)..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-600 rounded-xl text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>

                <select
                  value={enrollDeptFilter}
                  onChange={(e) => setEnrollDeptFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-xl text-white text-xs font-semibold w-full sm:w-auto"
                >
                  <option value="ALL">ทุกแผนก (ALL)</option>
                  {['P', 'PP', 'PS', 'ESH', 'ST', 'SEC', 'MN', 'TC', 'TR', 'QA', 'FI', 'TW', 'RW'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
                >
                  เลือกทั้งหมด ({filteredCandidatesForEnroll.length})
                </button>
              </div>
            </div>

            {/* Candidate List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 divide-y divide-slate-800">
              {filteredCandidatesForEnroll.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  ไม่พบรายชื่อตามเงื่อนไขที่ค้นหา
                </div>
              ) : (
                filteredCandidatesForEnroll.map((emp) => {
                  const cleanId = emp.empId.trim().toUpperCase();
                  const isAlreadyInRoster = currentRosterEmpIds.has(cleanId);
                  const isSelected = selectedEmpIdsForEnroll.has(cleanId);

                  return (
                    <div
                      key={cleanId}
                      onClick={() => handleToggleSelectEmp(cleanId)}
                      className={`p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-950/70 border border-blue-500/50' 
                          : 'hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-cyan-400">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{emp.fullName}</span>
                            <span className="font-mono text-cyan-300 font-bold">({emp.empId})</span>
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {emp.department} • {emp.position || 'พนักงาน'}
                          </div>
                        </div>
                      </div>

                      <div>
                        {isAlreadyInRoster ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            ✓ มีในใบรายชื่อแล้ว
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]">
                            พร้อมเพิ่ม
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-300">
                เลือกแล้ว: <strong className="text-cyan-300">{selectedEmpIdsForEnroll.size}</strong> ท่าน
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleExecuteEnrollment}
                  disabled={selectedEmpIdsForEnroll.size === 0 || isEnrollingSubmitting}
                  className="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isEnrollingSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>กำลังบันทึกลง Firestore...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-slate-700" />
                      <span>เพิ่มรายชื่อลงใบรายชื่อทันที</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT ROSTER TRAINEE SCORES                              */}
      {/* ============================================================== */}
      {editingRosterTrainee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-[95vw] sm:max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                แก้ไขคะแนนและผลประเมินในใบรายชื่อ
              </h3>
              <button onClick={() => setEditingRosterTrainee(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
              <div className="font-bold text-white text-sm">{editingRosterTrainee.fullName} ({editingRosterTrainee.empId})</div>
              <div className="text-slate-400">{editingRosterTrainee.department} • {editingRosterTrainee.position}</div>
            </div>

            <form onSubmit={handleSaveTraineeScores} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">คะแนน Pre-Test (เต็ม 10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={editScorePre}
                  onChange={(e) => setEditScorePre(e.target.value)}
                  placeholder="เช่น 6"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">คะแนน Post-Test (เต็ม 10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={editScorePost}
                  onChange={(e) => setEditScorePost(e.target.value)}
                  placeholder="เช่น 10"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">สถานะผลการฝึกอบรม</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold"
                >
                  <option value="enrolled">เข้าอบรม (กำลังเรียน/ยังไม่สอบ)</option>
                  <option value="passed">ผ่านเกณฑ์มาตรฐาน (ออกเกียรติบัตร)</option>
                  <option value="failed">ไม่ผ่านเกณฑ์ (ต้องสอบซ่อม)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingRosterTrainee(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold cursor-pointer"
                >
                  บันทึกคะแนน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT EMPLOYEE MASTER                              */}
      {/* ============================================================== */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-[95vw] sm:max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingEmp ? 'แก้ไขข้อมูลพนักงานตั้งต้น' : 'เพิ่มพนักงานใหม่เข้าฐานข้อมูลตั้งต้น'}
              </h3>
              <button onClick={() => setIsEmpModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmp} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">รหัสพนักงาน (Emp ID)</label>
                <input
                  type="text"
                  value={formEmpId}
                  disabled={Boolean(editingEmp)}
                  onChange={(e) => setFormEmpId(e.target.value.toUpperCase())}
                  placeholder="เช่น EMP001 หรือ 25056"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">ชื่อ - นามสกุล (พร้อมคำนำหน้า)</label>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="เช่น นายสมชาย ตั้งใจเรียน"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">แผนก</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {['P', 'PP', 'PS', 'ESH', 'ST', 'SEC', 'MN', 'TC', 'TR', 'QA', 'FI', 'TW', 'RW'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">รหัสผ่าน PIN</label>
                  <input
                    type="text"
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    placeholder="1234"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">ตำแหน่งงาน</label>
                <input
                  type="text"
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  placeholder="พนักงานฝ่ายปฏิบัติการ"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">สิทธิ์การเข้าถึง</label>
                <select
                  value={formRole}
                  onChange={(e: any) => setFormRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="employee">พนักงาน (Employee)</option>
                  <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold cursor-pointer"
                >
                  บันทึกลง Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
