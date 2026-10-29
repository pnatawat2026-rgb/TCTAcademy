import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UserProfile, Course } from '../types';
import { getAllAvailableCourses, getCourseModules, getCourseQuestions, getStoredCustomCourses } from '../utils/courseManager';
import { getStoredTrainees } from '../data/traineeData';
import { resolveCourseTrainees } from '../utils/courseTraineeHelper';
import { CourseVisualArtwork } from './CourseVisualArtwork';
import { ThaiMOOCLogo } from './ThaiMOOCLogo';
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  Award, 
  Sparkles, 
  Tv, 
  FileText, 
  ExternalLink, 
  ChevronDown, 
  User, 
  History, 
  ShieldCheck, 
  Layers, 
  HelpCircle, 
  LogOut,
  Flame,
  ArrowRight,
  FolderKanban,
  Check,
  Zap,
  Wrench,
  RotateCcw,
  FileSpreadsheet,
  Compass,
  Users,
  X,
  QrCode,
  Share2,
  Search,
  Building2,
  Trophy,
  GraduationCap,
  SlidersHorizontal,
  Bookmark,
  CheckCircle,
  Star,
  Image as ImageIcon,
  Lock,
  BarChart3,
  ShieldAlert,
  BrainCircuit
} from 'lucide-react';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';
import { CourseBackgroundManagerModal } from './CourseBackgroundManagerModal';
import { CourseEvaluationReportModal } from './CourseEvaluationReportModal';
import { GeofenceSecurityModal } from './GeofenceSecurityModal';
import { checkUserLocationSecurity, GeoLocationResult, isAdminGeoBypassActive } from '../utils/geolocationSecurity';

interface CourseSelectionViewProps {
  user: UserProfile;
  onSelectCourse: (courseId: string) => void;
  onOpenReport: () => void;
  onOpenCertificate: () => void;
  onOpenAdmin: () => void;
  onOpenGlossary: () => void;
  onOpenRoadmap: () => void;
  onOpenShare?: (courseId?: string) => void;
  onOpenInhouseReport?: (courseId?: string) => void;
  onOpenETrainingRoster?: (courseId?: string) => void;
  onOpenCourseApprovalPdf?: (courseId?: string) => void;
  onOpenEvaluation?: (courseId?: string, mode?: 'auto_course' | 'external_course' | 'followup_30days') => void;
  onLogout: () => void;
  onResetProgress?: (courseId?: string) => void;
  onOpenContinuousTraining?: (courseId: string) => void;
}

// Course Classification with Deep Corporate Enterprise Tone
const getCourseClassification = (courseId: string, idx: number) => {
  if (courseId === 'ai-for-tct') {
    return {
      type: 'future',
      badge: '✨ รายวิชาทักษะแห่งอนาคต (Future Skill)',
      badgeBg: 'bg-slate-900/90 text-white border-slate-700',
      heroAccent: 'from-[#001428] via-[#002D62] to-[#0A192F]',
      category: 'tech',
      categoryName: 'เทคโนโลยีและ AI'
    };
  }
  if (courseId === 'kyt-shisa-kanko' || courseId === 'risk-management') {
    return {
      type: 'quality',
      badge: '🏆 มาตรฐานคุณภาพและความปลอดภัย (Quality & Safety)',
      badgeBg: 'bg-slate-900/90 text-white border-slate-700',
      heroAccent: 'from-[#001D3D] via-[#002855] to-[#011020]',
      category: 'safety',
      categoryName: 'ความปลอดภัยและ KYT'
    };
  }
  if (courseId === 'applied-psychology') {
    return {
      type: 'quality',
      badge: '🌱 จิตวิทยาประยุกต์ & ความสุขในการทำงาน (รอบ 12-16 ต.ค. 2569)',
      badgeBg: 'bg-slate-900/90 text-white border-slate-700',
      heroAccent: 'from-[#021C24] via-[#002D38] to-[#01141C]',
      category: 'personnel',
      categoryName: 'จิตวิทยาและการพัฒนาบุคลากร'
    };
  }
  if (courseId === 'conflict-management' || courseId === 'personality-psychology') {
    return {
      type: 'quality',
      badge: '🏆 มาตรฐานการบริหารและความร่วมมือ (Collaboration)',
      badgeBg: 'bg-slate-900/90 text-white border-slate-700',
      heroAccent: 'from-[#021426] via-[#0F243E] to-[#0A1828]',
      category: 'personnel',
      categoryName: 'บุคคลและการจัดการ'
    };
  }
  return {
    type: 'quality',
    badge: '🏆 มาตรฐานการผลิตและวิศวกรรม (Engineering Standard)',
    badgeBg: 'bg-slate-900/90 text-white border-slate-700',
    heroAccent: 'from-[#001428] via-[#002244] to-[#0A192F]',
    category: 'quality',
    categoryName: 'การผลิตและซ่อมบำรุง'
  };
};

export const CourseSelectionView: React.FC<CourseSelectionViewProps> = ({
  user,
  onSelectCourse,
  onOpenReport,
  onOpenCertificate,
  onOpenAdmin,
  onOpenGlossary,
  onOpenRoadmap,
  onOpenShare,
  onOpenInhouseReport,
  onOpenETrainingRoster,
  onOpenCourseApprovalPdf,
  onOpenEvaluation,
  onLogout,
  onResetProgress,
  onOpenContinuousTraining
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'custom' | 'quality' | 'future' | 'safety' | 'tech' | 'personnel'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coursesList, setCoursesList] = useState<Course[]>(() => getAllAvailableCourses());
  const customCourses = useMemo(() => getStoredCustomCourses(), [coursesList]);
  const [isBgManagerOpen, setIsBgManagerOpen] = useState(false);
  const [isEvalReportOpen, setIsEvalReportOpen] = useState(false);
  const [evalReportCourseId, setEvalReportCourseId] = useState<string>('risk-management');

  // Confidential GPS Security state (for courses containing company confidential data)
  const [isConfidentialGpsModalOpen, setIsConfidentialGpsModalOpen] = useState(false);
  const [pendingConfidentialCourse, setPendingConfidentialCourse] = useState<Course | null>(null);
  const [isSessionGpsVerified, setIsSessionGpsVerified] = useState(false);
  const [geofenceResult, setGeofenceResult] = useState<GeoLocationResult | null>(null);
  const [isGeofenceChecking, setIsGeofenceChecking] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const refreshCourses = () => {
    setCoursesList(getAllAvailableCourses());
    setFailedImages({});
  };

  const handleCourseEntryClick = async (targetCourse: Course) => {
    if (targetCourse.isConfidential && !isAdminGeoBypassActive() && !isSessionGpsVerified) {
      setPendingConfidentialCourse(targetCourse);
      setIsGeofenceChecking(true);
      try {
        const result = await checkUserLocationSecurity();
        setGeofenceResult(result);
        if (result.isAllowed) {
          setIsSessionGpsVerified(true);
          playSuccessChime();
          onSelectCourse(targetCourse.id);
        } else {
          setIsConfidentialGpsModalOpen(true);
        }
      } catch (e) {
        setIsConfidentialGpsModalOpen(true);
      } finally {
        setIsGeofenceChecking(false);
      }
      return;
    }

    playSuccessChime();
    onSelectCourse(targetCourse.id);
  };

  const handleRecheckConfidentialLocation = async () => {
    setIsGeofenceChecking(true);
    try {
      const result = await checkUserLocationSecurity();
      setGeofenceResult(result);
      if (result.isAllowed) {
        playSuccessChime();
        setIsSessionGpsVerified(true);
        setIsConfidentialGpsModalOpen(false);
        if (pendingConfidentialCourse) {
          onSelectCourse(pendingConfidentialCourse.id);
          setPendingConfidentialCourse(null);
        }
      } else {
        playErrorBuzz();
      }
    } finally {
      setIsGeofenceChecking(false);
    }
  };

  const handleConfidentialBypassApproved = () => {
    setIsSessionGpsVerified(true);
    setIsConfidentialGpsModalOpen(false);
    if (pendingConfidentialCourse) {
      playSuccessChime();
      onSelectCourse(pendingConfidentialCourse.id);
      setPendingConfidentialCourse(null);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allTrainees = useMemo(() => getStoredTrainees(user), [user]);

  // Filter courses by search term and selected category
  const filteredCourses = useMemo(() => {
    return coursesList.filter((course, idx) => {
      const classification = getCourseClassification(course.id, idx);
      const matchesSearch = 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.code && course.code.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'custom') {
        return customCourses.some(cc => cc.course.id === course.id) || Boolean(course.courseFormat);
      }
      if (selectedCategory === 'quality' && classification.type === 'quality') return true;
      if (selectedCategory === 'future' && classification.type === 'future') return true;
      if (selectedCategory === 'safety' && classification.category === 'safety') return true;
      if (selectedCategory === 'tech' && classification.category === 'tech') return true;
      if (selectedCategory === 'personnel' && classification.category === 'personnel') return true;
      return false;
    });
  }, [coursesList, searchTerm, selectedCategory]);

  return (
    <div className="w-full bg-[#F8FAFC] font-sarabun text-slate-800 pb-16">
      
      {/* 1. Grand Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#001f3f] via-[#003875] to-[#005a9c] text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8 border-b border-[#002D5A] shadow-md">
        {/* Subtle geometric wave and particle circles */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-400 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-400 blur-3xl" />
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="thaiMoocGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#thaiMoocGrid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          
          {/* Top Bar inside Hero: User Status & System Navigation */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-blue-400/20">
            {/* User Chip */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 font-bold text-base sm:text-lg shadow-inner shrink-0">
                {user.fullName?.substring(0, 1) || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white whitespace-nowrap truncate">
                  ยินดีต้อนรับ: <span className="text-amber-300">{user.fullName}</span>
                </div>
                <div className="text-xs text-blue-100 font-medium mt-0.5 whitespace-nowrap truncate">
                  รหัส: <strong>{user.empId}</strong> • แผนก: <strong>{user.department}</strong> • {user.position}
                </div>
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-2 shrink-0" ref={dropdownRef}>
              {/* Admin Portal Button */}
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  onOpenAdmin();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-slate-700 whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="whitespace-nowrap">ผู้ดูแลระบบ</span>
              </button>

              {/* System Navigation Dropdown */}
              <div className="relative">
                <button
                  id="btn-course-system-dropdown"
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md whitespace-nowrap"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span className="whitespace-nowrap">เมนูเอกสาร</span>
                  <ChevronDown className={`w-3 h-3 text-slate-300 transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-1 z-50 text-slate-800 animate-fadeIn divide-y divide-slate-100">
                    <div className="px-4 py-2.5 bg-slate-50 flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">เอกสารทางการและรายงานผล</span>
                      <button 
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-1.5 space-y-0.5 text-xs">
                      {onOpenInhouseReport && (
                        <button
                          type="button"
                          onClick={() => {
                            playCyberClick();
                            setIsDropdownOpen(false);
                            onOpenInhouseReport();
                          }}
                          className="w-full px-3 py-2 text-left rounded-lg hover:bg-amber-50 text-amber-900 flex items-center gap-2.5 cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <div className="font-bold">แบบรายงานฝึกอบรม HRD-TR-00-05</div>
                            <div className="text-[10px] text-slate-500">สรุปผลการฝึกอบรมภาพรวม (A4 / 16:9)</div>
                          </div>
                        </button>
                      )}

                      {onOpenETrainingRoster && (
                        <button
                          type="button"
                          onClick={() => {
                            playCyberClick();
                            setIsDropdownOpen(false);
                            onOpenETrainingRoster();
                          }}
                          className="w-full px-3 py-2 text-left rounded-lg hover:bg-blue-50 text-blue-900 flex items-center gap-2.5 cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-[#005A9C] shrink-0" />
                          <div>
                            <div className="font-bold">ใบรายชื่อพนักงาน E-Training Roster</div>
                            <div className="text-[10px] text-slate-500">ตารางคะแนน Pre/Post-Test รายบุคคล</div>
                          </div>
                        </button>
                      )}

                      {onOpenCourseApprovalPdf && (
                        <button
                          type="button"
                          onClick={() => {
                            playCyberClick();
                            setIsDropdownOpen(false);
                            onOpenCourseApprovalPdf();
                          }}
                          className="w-full px-3 py-2 text-left rounded-lg hover:bg-teal-50 text-teal-900 flex items-center gap-2.5 cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-teal-600 shrink-0" />
                          <div>
                            <div className="font-bold">พิมพ์แบบขออนุมัติหลักสูตร (PDF)</div>
                            <div className="text-[10px] text-slate-500">เอกสารขออนุมัติ & สรุปทุกหลักสูตรสำหรับเซ็นอนุมัติ</div>
                          </div>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          playCyberClick();
                          setIsDropdownOpen(false);
                          onOpenReport();
                        }}
                        className="w-full px-3 py-2 text-left rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        <div>
                          <div className="font-semibold">ใบรายงานผลการฝึกอบรมรายบุคคล</div>
                          <div className="text-[10px] text-slate-400">ดูคะแนนและบันทึกเวลาเรียน</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playCyberClick();
                          setIsDropdownOpen(false);
                          onOpenCertificate();
                        }}
                        className="w-full px-3 py-2 text-left rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <div className="font-semibold">ใบประกาศนียบัตรดิจิทัล E-Certificate</div>
                          <div className="text-[10px] text-slate-400">สำหรับผู้ผ่านเกณฑ์ 100%</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playCyberClick();
                          setIsDropdownOpen(false);
                          onOpenGlossary();
                        }}
                        className="w-full px-3 py-2 text-left rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4 text-[#0072BC] shrink-0" />
                        <div>
                          <div className="font-semibold">คลังคำศัพท์เทคนิค (Glossary)</div>
                          <div className="text-[10px] text-slate-400">คำศัพท์ QSRM, CBM, PdM, KYT</div>
                        </div>
                      </button>
                    </div>

                    <div className="p-1.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => {
                          playCyberClick();
                          setIsDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer font-bold"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>ออกจากระบบ (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Hero Title & Tagline */}
          <div className="text-center max-w-4xl mx-auto space-y-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-300/30 text-xs font-semibold text-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>TCT E-TRAINING • ศูนย์ฝึกอบรมและพัฒนา TCT ACADEMY</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              เรียนรู้ออนไลน์ได้ทุกที่ ทุกเวลา
            </h1>

            <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
              ยกระดับทักษะบุคลากรด้วยหลักสูตร E-Learning พัฒนาโดย แผนกบุคคลและธุรการ (Personnel & Admin Department) บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
            </p>
          </div>

          {/* Search Bar inside Hero */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full flex items-center pl-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหารายวิชาที่คุณต้องการเรียน เช่น KYT, AI, บำรุงรักษา..."
                className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden font-sarabun"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-slate-400 hover:text-slate-600 mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Selector */}
            <div className="w-full sm:w-auto flex items-center gap-2 shrink-0">
              <select
                value={selectedCategory}
                onChange={(e: any) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">ทุกหมวดหมู่ (All)</option>
                <option value="quality">🏆 มาตรฐานคุณภาพ</option>
                <option value="future">✨ ทักษะแห่งอนาคต</option>
                <option value="safety">🛡️ ความปลอดภัย & KYT</option>
                <option value="tech">🤖 AI & ดิจิทัล</option>
                <option value="personnel">📋 บุคคล & บริหาร</option>
              </select>

              <button
                type="button"
                onClick={() => playCyberClick()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#002855] hover:bg-[#001D40] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md border border-[#003875]"
              >
                <Search className="w-4 h-4 text-blue-200" />
                <span>ค้นหา</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Counter Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 max-w-5xl mx-auto font-sarabun">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-300">5+ หลักสูตร</div>
              <div className="text-[11px] text-blue-100 mt-0.5 font-medium">รายวิชามาตรฐานคุณภาพ</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-center">
              <div className="text-xl sm:text-2xl font-black text-cyan-300">
                {allTrainees.filter(t => t.status === 'passed' || t.status === 'in_progress').length} คน
              </div>
              <div className="text-[11px] text-blue-100 mt-0.5 font-medium">ผู้เข้าอบรมจริงในระบบ</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-300">100%</div>
              <div className="text-[11px] text-blue-100 mt-0.5 font-medium">ใบประกาศนียบัตรดิจิทัล</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-center">
              <div className="text-xl sm:text-2xl font-black text-white">24/7 ชม.</div>
              <div className="text-[11px] text-blue-100 mt-0.5 font-medium">เรียนรู้ได้ตลอดเวลา</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Course Category Navigation Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl p-2.5 shadow-md border border-slate-200/90 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => { playCyberClick(); setSelectedCategory('all'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#002855] text-white shadow-sm border border-[#003875]'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            รายวิชาทั้งหมด ({coursesList.length})
          </button>

          {customCourses.length > 0 && (
            <button
              id="filter-custom-courses-btn"
              onClick={() => { playCyberClick(); setSelectedCategory('custom'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'custom'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md border border-emerald-500'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-extrabold'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>หลักสูตรสร้างใหม่ ({customCourses.length})</span>
            </button>
          )}

          <button
            onClick={() => { playCyberClick(); setSelectedCategory('quality'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'quality'
                ? 'bg-[#002855] text-white shadow-sm border border-[#003875]'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>รายวิชามาตรฐานคุณภาพ</span>
          </button>

          <button
            onClick={() => { playCyberClick(); setSelectedCategory('future'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'future'
                ? 'bg-[#002855] text-white shadow-sm border border-[#003875]'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>รายวิชาทักษะแห่งอนาคต</span>
          </button>

          <button
            onClick={() => { playCyberClick(); setSelectedCategory('safety'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'safety'
                ? 'bg-[#002855] text-white shadow-sm border border-[#003875]'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
            <span>ความปลอดภัย & KYT</span>
          </button>

          <button
            onClick={() => { playCyberClick(); setSelectedCategory('tech'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'tech'
                ? 'bg-[#002855] text-white shadow-sm border border-[#003875]'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-cyan-300" />
            <span>เทคโนโลยี & AI</span>
          </button>

          <button
            onClick={() => { playCyberClick(); setSelectedCategory('personnel'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'personnel'
                ? 'bg-[#002855] text-white shadow-sm border border-[#003875]'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-slate-300" />
            <span>บุคคล & บริหาร</span>
          </button>
        </div>
      </section>

      {/* 3. Course Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-6">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-[#005A9C]" />
              <span>รายวิชาที่เปิดให้ลงทะเบียนเรียน (Available Courses)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              เลือกหลักสูตรที่ต้องการเข้าศึกษา รับชมวิดีโอบทเรียน ทำแบบทดสอบวัดผล และรับใบประกาศนียบัตรดิจิทัล
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => { playCyberClick(); onOpenAdmin(); }}
              className="px-3.5 py-1.5 rounded-xl bg-[#002855] hover:bg-[#001D40] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-[#003875]"
              title="เข้าสู่ระบบจัดการหลักสูตร 4 รูปแบบ (Active VDO, Adult Learning, E-Learning, SOP Teachme biz) และอัปโหลดไฟล์ วิดีโอ รายชื่อ"
            >
              <BrainCircuit className="w-4 h-4 text-amber-400" />
              <span>🛠️ จัดการหลักสูตร 4 รูปแบบ & อัปโหลด</span>
            </button>

            <button
              type="button"
              onClick={() => { playCyberClick(); setIsBgManagerOpen(true); }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-slate-700"
              title="จัดการภาพพื้นหลังหลักสูตรและกำหนดหลักสูตรที่เป็นข้อมูลความลับองค์กร"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>🖼️ จัดการภาพ & ข้อมูลหลักสูตร</span>
            </button>

            <button
              type="button"
              onClick={() => { playCyberClick(); setEvalReportCourseId(user.selectedCourseId || 'risk-management'); setIsEvalReportOpen(true); }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="ดูรายงานผลการประเมินประสิทธิภาพและประสิทธิผลหลังฝึกอบรม 30 วัน"
            >
              <BarChart3 className="w-4 h-4 text-white" />
              <span>📊 รายงานประเมินผล 30 วัน</span>
            </button>

            <div className="text-xs font-semibold text-slate-500 font-mono pl-2 border-l border-slate-300">
              {filteredCourses.length} หลักสูตร
            </div>
          </div>
        </div>

        {/* Empty Search Result */}
        {filteredCourses.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <Search className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-lg font-bold text-slate-800">ไม่พบรายวิชาที่ตรงกับคำค้นหา "{searchTerm}"</div>
            <p className="text-xs text-slate-500">กรุณาลองค้นหาด้วยคำอื่น หรือเลือกดูรายวิชาทั้งหมด</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="px-4 py-2 rounded-xl bg-[#005A9C] text-white text-xs font-bold"
            >
              แสดงรายวิชาทั้งหมด
            </button>
          </div>
        )}

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => {
            const classification = getCourseClassification(course.id, idx);
            const courseTrainees = resolveCourseTrainees(allTrainees, course.id);
            const passedCount = courseTrainees.filter(t => t.isCompleted).length;
            const inProgressCount = courseTrainees.filter(t => t.status === 'in_progress').length;
            const totalTrainees = courseTrainees.length;
            const isSelected = user.selectedCourseId === course.id;
            const questionsCount = getCourseQuestions(course.id).length || 10;
            const passingScore = course.passingScore || 8;
            const passingPercent = course.passingCriteria ? `${course.passingCriteria}%` : '80%';

            return (
              <div 
                key={course.id}
                className={`bg-white rounded-2xl border ${
                  isSelected ? 'border-[#005A9C] ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200/90'
                } shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group`}
              >
                {/* Course Header Banner with Authentic Industrial Course Illustration */}
                <div className={`relative h-52 bg-[#001428] p-4 flex flex-col justify-between overflow-hidden text-white`}>
                  {/* Background Artwork Layer (Failsafe SVG Technical Blueprint + Optional Custom Image) */}
                  <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
                    <CourseVisualArtwork courseId={course.id} />

                    {course.imageUrl && !failedImages[course.id] && (
                      <img 
                        src={course.imageUrl} 
                        alt=""
                        aria-hidden="true"
                        onError={() => {
                          setFailedImages(prev => ({ ...prev, [course.id]: true }));
                        }}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-75"
                        loading="lazy"
                      />
                    )}
                    {/* Deep corporate gradient scrim for contrast and legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#001428] via-[#001F3F]/75 to-[#001428]/45" />
                  </div>

                  {/* Top Badges */}
                  <div className="relative z-10 flex items-center justify-between gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border shadow-xs backdrop-blur-xs flex items-center gap-1 ${
                      course.courseFormat 
                        ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/80 ring-1 ring-emerald-400/40' 
                        : 'bg-slate-950/90 text-white border-slate-700/80'
                    }`}>
                      {course.courseFormat ? (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>
                            {course.courseFormat === 'active_vdo_learning' && '🎬 Active VDO'}
                            {course.courseFormat === 'adult_learning' && '🧠 Adult Learning'}
                            {course.courseFormat === 'sop_teachme_biz' && '📋 SOP Teachme biz'}
                            {course.courseFormat === 'standard_elearning' && '💻 Course E-Learning'}
                            {' • สร้างใหม่'}
                          </span>
                        </>
                      ) : (
                        classification.badge
                      )}
                    </span>

                    <div className="flex items-center gap-1 flex-wrap">
                      {course.isConfidential && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-950/95 text-rose-300 border border-rose-600/60 shadow-xs flex items-center gap-1">
                          <Lock className="w-3 h-3 text-rose-400" />
                          <span>ความลับองค์กร (ตรวจ GPS)</span>
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#002855]/95 text-blue-100 border border-blue-400/30 shadow-xs">
                        E-Learning • มีใบประกาศ
                      </span>
                    </div>
                  </div>

                  {/* Course Code & Center Graphic */}
                  <div className="relative z-10 space-y-1">
                    <div className="text-[11px] font-sarabun text-blue-200 font-bold tracking-wider">
                      {course.code || `COURSE-${idx + 1}`}
                    </div>
                    <div className="text-base sm:text-lg font-black leading-snug line-clamp-2 drop-shadow-md text-white">
                      {course.title}
                    </div>
                  </div>

                  {/* Institution Tag at Bottom of Banner */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] text-white/90 border-t border-white/20 pt-1.5 backdrop-blur-xs">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-300" />
                      <span className="font-semibold">แผนกบุคคลและธุรการ TCT (Personnel)</span>
                    </div>

                    {isSelected && (
                      <span className="bg-[#002855] text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>กำลังเรียน</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Course Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Metadata Strip - Clean Single Line Alignment */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center font-sarabun text-[11px]">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <div className="text-[10px] text-slate-400 mb-0.5 whitespace-nowrap">ระยะเวลา</div>
                        <div className="font-bold text-slate-800 flex items-center justify-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3 text-[#005A9C] shrink-0" />
                          <span className="whitespace-nowrap">{course.duration}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-xl">
                        <div className="text-[10px] text-slate-400 mb-0.5 whitespace-nowrap">เกณฑ์ผ่าน</div>
                        <div className="font-bold text-emerald-700 flex items-center justify-center gap-1 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="whitespace-nowrap">{passingPercent}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-xl">
                        <div className="text-[10px] text-slate-400 mb-0.5 whitespace-nowrap">วุฒิบัตร</div>
                        <div className="font-bold text-amber-700 flex items-center justify-center gap-1 whitespace-nowrap">
                          <Award className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="whitespace-nowrap">E-Cert A4</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Trainee Stats - Single Line */}
                    <div className="bg-blue-50/60 rounded-xl px-3 py-2 border border-blue-100 flex items-center justify-between text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600 whitespace-nowrap">
                        <Users className="w-3.5 h-3.5 text-[#005A9C] shrink-0" />
                        <span className="whitespace-nowrap">ผู้เรียนสะสม: <strong className="text-slate-800">{totalTrainees} คน</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-sarabun whitespace-nowrap">
                        <span className="text-emerald-700 font-semibold whitespace-nowrap">ผ่าน: {passedCount}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-amber-700 font-medium whitespace-nowrap">กำลังเรียน: {inProgressCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Course Action Buttons - Paired Choice: 1. เข้าเรียนหลักสูตร 2. แบบประเมินความพึงพอใจ */}
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        id={`btn-select-course-${course.id}`}
                        type="button"
                        onClick={() => {
                          handleCourseEntryClick(course);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                        title={`เข้าเรียนหลักสูตร ${course.code}`}
                      >
                        <PlayCircle className="w-4 h-4 shrink-0 text-cyan-300" />
                        <span className="truncate">
                          {isSelected ? `เข้าเรียน (กำลังเรียน)` : `เข้าเรียนหลักสูตร`}
                        </span>
                      </button>

                      <button
                        id={`btn-eval-course-${course.id}`}
                        type="button"
                        onClick={() => {
                          playCyberClick();
                          if (onOpenEvaluation) {
                            onOpenEvaluation(course.id, 'auto_course');
                          } else {
                            onSelectCourse(course.id);
                          }
                        }}
                        className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                        title={`ทำแบบประเมินความพึงพอใจและประสิทธิผลหลักสูตร ${course.code}`}
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                        <span className="truncate">แบบประเมินความพึงพอใจ</span>
                      </button>
                    </div>

                    {/* 30-Day Evaluation & Effectiveness Report Link */}
                    <button
                      type="button"
                      onClick={() => {
                        playCyberClick();
                        setEvalReportCourseId(course.id);
                        setIsEvalReportOpen(true);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-slate-500 hover:text-amber-800 hover:bg-amber-50/60 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap border border-transparent hover:border-amber-200"
                      title="ดูรายงานผลการประเมินและประสิทธิผลหลังฝึกอบรม 30 วัน"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>รายงานประเมินผล & ประสิทธิผล 30 วัน</span>
                    </button>

                    {/* Subtle Syllabus Document Link */}
                    {onOpenCourseApprovalPdf && (
                      <button
                        type="button"
                        onClick={() => {
                          playCyberClick();
                          onOpenCourseApprovalPdf(course.id);
                        }}
                        className="w-full py-1.5 px-3 rounded-lg text-slate-500 hover:text-[#005A9C] hover:bg-slate-100/70 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                        title="พิมพ์โครงสร้างหลักสูตร เนื้อหา และชุดข้อสอบพร้อมเฉลย (A4 Document)"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="whitespace-nowrap">ดูโครงสร้างหลักสูตร & ชุดข้อสอบ (A4)</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DEDICATED EVALUATION & FOLLOW-UP HUB (ด้านล่างของหลักสูตร - เข้าสู่ระบบแล้ว) */}
      {/* ========================================================================= */}
      <section id="training-evaluation-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 via-[#002855] to-slate-900 text-white rounded-3xl p-6 sm:p-9 shadow-xl border border-blue-900/50 relative overflow-hidden">
          {/* Subtle Ambient Decors */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Header info */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>ระบบประเมินผลความพึงพอใจและติดตามประสิทธิผลการฝึกอบรม • TCT ACADEMY</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  ระบบวัดผลความพึงพอใจและติดตามการนำไปใช้จริงในงาน
                </h3>
                <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
                  พนักงานสามารถเข้ามากรอกประเมินผลได้ 2 ทางหลัก และเข้าทำแบบติดตามผลการประยุกต์ใช้ในการทำงานจริงภายใน 30 วัน (ระบบแจ้งเตือนอัตโนมัติ)
                </p>
              </div>

              {/* Logged in Employee Quick Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shrink-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-xs">
                  {user.fullName?.substring(0, 1) || 'U'}
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-xs sm:text-sm">{user.fullName}</div>
                  <div className="text-[11px] text-blue-200">
                    รหัสพนักงาน: <span className="font-mono font-bold text-amber-300">{user.empId}</span> • แผนก {user.department}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-medium mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> เข้าสู่ระบบสำเร็จพร้อมกรอกประเมิน
                  </span>
                </div>
              </div>
            </div>

            {/* Automated 30-Day Alert Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                  <Clock className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="font-bold text-amber-200 text-xs sm:text-sm flex items-center gap-2">
                    <span>การติดตามผลการนำไปใช้จริงในงาน ภายใน 30 วัน</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold">
                      แจ้งเตือนอัตโนมัติ
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-100/80 mt-0.5">
                    พนักงานทุกท่านที่สำเร็จการอบรมในทุกหลักสูตร จะต้องเข้ามากรอกแบบประเมินติดตามผลการนำความรู้ไปใช้ในการปฏิบัติงานจริงภายใน 30 วัน
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  if (onOpenEvaluation) {
                    onOpenEvaluation(user.selectedCourseId || 'applied-psychology', 'followup_30days');
                  }
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
              >
                <span>กรอกแบบติดตามผล 30 วัน</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Action Cards for Evaluation Paths */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Path 1: Auto Evaluationต่อจากการอบรม */}
              <div 
                onClick={() => {
                  playCyberClick();
                  if (onOpenEvaluation) {
                    onOpenEvaluation(user.selectedCourseId || 'applied-psychology', 'auto_course');
                  }
                }}
                className="bg-white/10 hover:bg-white/15 border border-white/20 hover:border-cyan-300 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950">
                      ทางที่ 1 (อัตโนมัติ)
                    </span>
                    <BookOpen className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    ประเมินต่อจากหลักสูตรของบริษัท
                  </h4>
                  <p className="text-xs text-blue-100/70 leading-relaxed">
                    เข้าอัตโนมัติ โดยการประเมินผลความพึงพอใจที่ต่อจากการฝึกอบรมในหลักสูตรต่างๆ ของ TCT ได้ทันที ในทุกหลักสูตร
                  </p>
                </div>
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1 pt-2 border-t border-white/10">
                  <span>เข้าสู่แบบประเมินหลักสูตร TCT</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Path 2: Evaluation for External / Other Course */}
              <div 
                onClick={() => {
                  playCyberClick();
                  if (onOpenEvaluation) {
                    onOpenEvaluation(user.selectedCourseId || 'applied-psychology', 'external_course');
                  }
                }}
                className="bg-white/10 hover:bg-white/15 border border-white/20 hover:border-amber-300 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      ทางที่ 2 (หลักสูตรอื่น)
                    </span>
                    <ExternalLink className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    ประเมินหลังอบรมหลักสูตรอื่นมา
                  </h4>
                  <p className="text-xs text-blue-100/70 leading-relaxed">
                    สำหรับพนักงานที่ไปฝึกอบรมหลักสูตรอื่นหรืออบรมภายนอกมาแล้ว โดยมีหัวข้อให้กรอกชื่อหลักสูตร สถาบัน และวิทยากรครบถ้วน
                  </p>
                </div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1 pt-2 border-t border-white/10">
                  <span>กรอกข้อมูลหลักสูตรอื่นและประเมิน</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Path 3: 30-Day Follow-Up Review */}
              <div 
                onClick={() => {
                  playCyberClick();
                  if (onOpenEvaluation) {
                    onOpenEvaluation(user.selectedCourseId || 'applied-psychology', 'followup_30days');
                  }
                }}
                className="bg-white/10 hover:bg-white/15 border border-white/20 hover:border-emerald-300 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                      ติดตามผล (30 วัน)
                    </span>
                    <Clock className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    แบบติดตามการนำไปใช้ในงานจริง
                  </h4>
                  <p className="text-xs text-blue-100/70 leading-relaxed">
                    ระบบติดตามผลพนักงานต้องเข้ามากรอกภายใน 30 วัน เพื่อวัดผลการเปลี่ยนแปลงพฤติกรรมและการปรับปรุงหน้างาน
                  </p>
                </div>
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1 pt-2 border-t border-white/10">
                  <span>กรอกแบบติดตามผล 30 วัน</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. TCT Platform Key Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#005A9C] uppercase tracking-wider">
              WHY LEARN WITH TCT E-TRAINING & TCT ACADEMY
            </span>
            <h3 className="text-2xl font-bold text-slate-900">
              จุดเด่นของระบบการเรียนรู้มาตรฐาน E-Learning
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              ออกแบบขึ้นเพื่อเสริมสร้างศักยภาพบุคลากรและยกระดับความปลอดภัยในการปฏิบัติงานอย่างยั่งยืน
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#005A9C] text-white flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-900">เรียนรู้ได้ทุกที่ ทุกเวลา 24 ชม.</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                เข้าเรียนผ่านคอมพิวเตอร์ แท็บเล็ต หรือสมาร์ทโฟนได้ตลอดเวลา ระบบจดจำประวัติอัตโนมัติ
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-900">ตรวจวัดเวลาเรียนจริง (Anti-Skip)</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                มีระบบนับเวลาเรียนจริง ป้องกันการกดข้าม เพื่อให้พนักงานได้รับองค์ความรู้ครบถ้วน
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-900">ใบประกาศนียบัตรดิจิทัลทันที</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                เมื่อทำแบบทดสอบ Post-Test ผ่านเกณฑ์ 100% ระบบจะออกวุฒิบัตรดิจิทัลพร้อมลายเซ็นทางการ
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-900">เชื่อมโยงประวัติแผนกบุคคลโดยตรง</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                คะแนนและชั่วโมงฝึกอบรมจะถูกบันทึกในฐานข้อมูลฝ่ายบุคคล เพื่อใช้ในการประเมินผลประจำปี
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TCT Institutional Footer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="p-6 rounded-2xl bg-slate-100/80 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <ThaiMOOCLogo size="sm" showSubtitle={false} theme="light" />
            <div>
              <div className="font-bold text-slate-800">
                TCT E-Training • ศูนย์ฝึกอบรมและพัฒนา TCT Academy
              </div>
              <div className="text-[11px] text-slate-500">
                แผนกบุคคลและธุรการ (Personnel & Admin Department) • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500">
            ระบบฝึกอบรมและเรียนรู้ออนไลน์สำหรับพนักงาน • สงวนลิขสิทธิ์ © 2026
          </div>
        </div>
      </section>

      {/* Course Background & Settings Manager Modal */}
      {isBgManagerOpen && (
        <CourseBackgroundManagerModal
          isOpen={isBgManagerOpen}
          onClose={() => setIsBgManagerOpen(false)}
          onCoursesUpdated={refreshCourses}
          initialCourseId={user.selectedCourseId}
        />
      )}

      {/* 30-Day Post-Training Effectiveness & Efficiency Report Modal */}
      {isEvalReportOpen && (
        <CourseEvaluationReportModal
          isOpen={isEvalReportOpen}
          onClose={() => setIsEvalReportOpen(false)}
          initialCourseId={evalReportCourseId}
          currentUser={user}
        />
      )}

      {/* Confidential Course GPS Geofence Verification Modal */}
      {isConfidentialGpsModalOpen && (
        <GeofenceSecurityModal
          isOpen={isConfidentialGpsModalOpen}
          locationResult={geofenceResult}
          isChecking={isGeofenceChecking}
          onRecheck={handleRecheckConfidentialLocation}
          onBypassApproved={handleConfidentialBypassApproved}
          onClose={() => setIsConfidentialGpsModalOpen(false)}
        />
      )}

    </div>
  );
};
