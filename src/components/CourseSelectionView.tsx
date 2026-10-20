import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UserProfile, Course } from '../types';
import { getAllAvailableCourses, getCourseModules, getCourseQuestions } from '../utils/courseManager';
import { getStoredTrainees } from '../data/traineeData';
import { resolveCourseTrainees } from '../utils/courseTraineeHelper';
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
  CheckCircle
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

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
  onLogout: () => void;
  onResetProgress?: (courseId?: string) => void;
}

// Course Classification
const getCourseClassification = (courseId: string, idx: number) => {
  if (courseId === 'ai-for-tct') {
    return {
      type: 'future',
      badge: '✨ รายวิชาทักษะแห่งอนาคต (Future Skill)',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      heroAccent: 'from-emerald-600 to-teal-700',
      category: 'tech',
      categoryName: 'เทคโนโลยีและ AI'
    };
  }
  if (courseId === 'kyt-shisa-kanko' || courseId === 'risk-management') {
    return {
      type: 'quality',
      badge: '🏆 รายวิชามาตรฐานคุณภาพ (Quality Standard)',
      badgeBg: 'bg-blue-50 text-[#005A9C] border-blue-200',
      heroAccent: 'from-[#003875] to-[#005A9C]',
      category: 'safety',
      categoryName: 'ความปลอดภัยและ KYT'
    };
  }
  if (courseId === 'applied-psychology') {
    return {
      type: 'quality',
      badge: '🌱 จิตวิทยาประยุกต์ & ความสุขในการทำงาน (รอบที่ 1: 12-16 ต.ค. 2569)',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      heroAccent: 'from-teal-700 via-emerald-600 to-cyan-700',
      category: 'personnel',
      categoryName: 'จิตวิทยาและการพัฒนาบุคลากร'
    };
  }
  if (courseId === 'conflict-management' || courseId === 'personality-psychology') {
    return {
      type: 'quality',
      badge: '🏆 รายวิชามาตรฐานคุณภาพ (Quality Standard)',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
      heroAccent: 'from-amber-600 to-orange-700',
      category: 'personnel',
      categoryName: 'บุคคลและการจัดการ'
    };
  }
  return {
    type: 'quality',
    badge: '🏆 รายวิชามาตรฐานคุณภาพ (Quality Standard)',
    badgeBg: 'bg-blue-50 text-[#005A9C] border-blue-200',
    heroAccent: 'from-blue-600 to-indigo-700',
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
  onLogout,
  onResetProgress
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'quality' | 'future' | 'safety' | 'tech' | 'personnel'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const courses = getAllAvailableCourses();

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
    return courses.filter((course, idx) => {
      const classification = getCourseClassification(course.id, idx);
      const matchesSearch = 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.code && course.code.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'quality' && classification.type === 'quality') return true;
      if (selectedCategory === 'future' && classification.type === 'future') return true;
      if (selectedCategory === 'safety' && classification.category === 'safety') return true;
      if (selectedCategory === 'tech' && classification.category === 'tech') return true;
      if (selectedCategory === 'personnel' && classification.category === 'personnel') return true;
      return false;
    });
  }, [courses, searchTerm, selectedCategory]);

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
                className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-purple-400/30 whitespace-nowrap"
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
                  className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md whitespace-nowrap"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                  <span className="whitespace-nowrap">เมนูเอกสาร</span>
                  <ChevronDown className={`w-3 h-3 text-blue-200 transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Search className="w-4 h-4" />
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
                ? 'bg-[#005A9C] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            รายวิชาทั้งหมด ({courses.length})
          </button>

          <button
            onClick={() => { playCyberClick(); setSelectedCategory('quality'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'quality'
                ? 'bg-[#005A9C] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>รายวิชามาตรฐานคุณภาพ</span>
          </button>

          <button
            onClick={() => { playCyberClick(); setSelectedCategory('future'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'future'
                ? 'bg-[#005A9C] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>รายวิชาทักษะแห่งอนาคต</span>
          </button>

          <button
            onClick={() => { playCyberClick(); setSelectedCategory('safety'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'safety'
                ? 'bg-[#005A9C] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>ความปลอดภัย & KYT</span>
          </button>

          <button
            onClick={() => { playCyberClick(); setSelectedCategory('tech'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'tech'
                ? 'bg-[#005A9C] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-teal-500" />
            <span>เทคโนโลยี & AI</span>
          </button>

          <button
            onClick={() => { playCyberClick(); setSelectedCategory('personnel'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'personnel'
                ? 'bg-[#005A9C] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-purple-500" />
            <span>บุคคล & บริหาร</span>
          </button>
        </div>
      </section>

      {/* 3. Course Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-6">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-[#005A9C]" />
              <span>รายวิชาที่เปิดให้ลงทะเบียนเรียน (Available Courses)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              เลือกหลักสูตรที่ต้องการเข้าศึกษา รับชมวิดีโอบทเรียน ทำแบบทดสอบวัดผล และรับใบประกาศนียบัตรดิจิทัล
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500 font-mono">
            แสดง {filteredCourses.length} จากทั้งหมด {courses.length} หลักสูตร
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
                {/* Course Header Banner */}
                <div className={`relative h-44 bg-gradient-to-tr ${classification.heroAccent} p-4 flex flex-col justify-between overflow-hidden text-white`}>
                  {/* Subtle decorative elements */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  
                  {/* Top Badges */}
                  <div className="relative z-10 flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-slate-800 shadow-xs backdrop-blur-xs flex items-center gap-1">
                      {classification.badge}
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                      เรียนฟรี / มีใบประกาศ
                    </span>
                  </div>

                  {/* Course Code & Center Graphic */}
                  <div className="relative z-10 space-y-1">
                    <div className="text-[11px] font-sarabun text-blue-200 font-bold tracking-wider">
                      {course.code || `COURSE-${idx + 1}`}
                    </div>
                    <div className="text-lg sm:text-xl font-black leading-snug line-clamp-2 drop-shadow-sm text-white">
                      {course.title}
                    </div>
                  </div>

                  {/* Institution Tag at Bottom of Banner */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] text-white/90 border-t border-white/20 pt-1.5">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-300" />
                      <span className="font-semibold">แผนกบุคคลและธุรการ TCT (Personnel)</span>
                    </div>

                    {isSelected && (
                      <span className="bg-emerald-400 text-emerald-950 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
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

                  {/* Course Action Buttons - Streamlined to essentials */}
                  <div className="space-y-1.5 pt-2">
                    {/* Primary Button */}
                    <button
                      id={`btn-select-course-${course.id}`}
                      type="button"
                      onClick={() => {
                        playSuccessChime();
                        onSelectCourse(course.id);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-[#005A9C] hover:bg-[#004070] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                      <PlayCircle className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">
                        {isSelected 
                          ? `เข้าสู่บทเรียน ${course.code} (กำลังเรียนอยู่)` 
                          : `เข้าสู่บทเรียน: ${course.code}`}
                      </span>
                      <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
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

      {/* 4. TCT Platform Key Features */}
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

    </div>
  );
};
