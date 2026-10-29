import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { 
  getAllAvailableCourses, 
  saveCourseCustomization, 
  resetCourseCustomizations 
} from '../utils/courseManager';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { 
  X, 
  Image as ImageIcon, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Check, 
  Sparkles, 
  Building2, 
  Eye, 
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CourseBackgroundManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCoursesUpdated: () => void;
  initialCourseId?: string;
}

// Preset Curated High Quality Industrial Images for Teijin Cord Thailand
export const COURSE_IMAGE_PRESETS = [
  {
    id: 'preset-qc-lab',
    title: 'ห้องแล็บ QC & เครื่องทดสอบแรงดึงเส้นด้ายคอร์ด',
    category: 'คุณภาพ & ความปลอดภัย (QSRM)',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    description: 'ภาพเครื่องมือทดสอบแรงดึง การตรวจสอบคุณภาพเส้นใย และห้องแล็บมาตรฐานอุตสาหกรรม'
  },
  {
    id: 'preset-cbm-maintenance',
    title: 'เครื่องจักรปั่นเกลียวเส้นด้าย & เซนเซอร์ CBM',
    category: 'วิศวกรรม & บำรุงรักษา (APM)',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    description: 'ภาพระบบเครื่องจักรกลหมุนความเร็วสูง ตลับลูกปืน และการตรวจวัดการสั่นสะเทือน'
  },
  {
    id: 'preset-collaboration',
    title: 'การประชุมแก้ปัญหาและการสื่อสารเชิงบวก',
    category: 'ความร่วมมือ & การจัดการความขัดแย้ง (CFM)',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    description: 'ภาพการปรึกษาหารือ การประสานงาน และการสร้างทีมเวิร์กในสภาพแวดล้อมทำงาน'
  },
  {
    id: 'preset-ai-smart-factory',
    title: 'ระบบ Smart Factory & หุ่นยนต์อัตโนมัติ AI',
    category: 'ดิจิทัล & AI for TCT',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    description: 'ภาพแขนกลอัจฉริยะ เทคโนโลยี Industry 4.0 และแดชบอร์ดควบคุมการผลิต'
  },
  {
    id: 'preset-disc-leadership',
    title: 'จิตวิทยาองค์กร & ผู้นำโมเดล DISC',
    category: 'จิตวิทยาบุคลิกภาพ (TCT-A001)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    description: 'ภาพการโค้ชชิ่ง การสื่อสารเพื่อเข้าใจบุคลิกภาพที่หลากหลายในโรงงาน'
  },
  {
    id: 'preset-kyt-safety',
    title: 'เทคนิคมือชี้-ปากย้ำ Shisa Kanko & หมวกนิรภัย',
    category: 'ความปลอดภัย & KYT (Zero Accident)',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
    description: 'ภาพทีมงานตรวจสอบความปลอดภัยหน้างานจริง อุปกรณ์ PPE และเป้าหมายอุบัติเหตุเป็นศูนย์'
  },
  {
    id: 'preset-psychology-happiness',
    title: 'สุขภาวะทางใจ & การเติบโต Growth Mindset',
    category: 'จิตวิทยาประยุกต์ & ความสุข (TCT-PSY-01)',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    description: 'ภาพเวิร์กช็อปสร้างพลังใจ การบริหารอารมณ์ และความสุขความผูกพันในองค์กร'
  },
  {
    id: 'preset-orientation-5s',
    title: 'ปฐมนิเทศพนักงานใหม่ & วินัย 5ส ในโรงงาน',
    category: 'พนักงานปฏิบัติการใหม่ (Good Employee Skills)',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    description: 'ภาพการต้อนรับพนักงานใหม่ การฝึกอบรมระเบียบวินัย และวัฒนธรรมการทำงาน TCT'
  },
  {
    id: 'preset-industrial-blue',
    title: 'โทนสีน้ำเงินเทคโนโลยี Teijin Global Blueprint',
    category: 'ภาพกราฟิกมาตรฐานองค์กร',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    description: 'ภาพวงจรไมโครชิป โครงสร้างเทคโนโลยี และเส้นใยประสิทธิภาพสูง'
  }
];

export const CourseBackgroundManagerModal: React.FC<CourseBackgroundManagerModalProps> = ({
  isOpen,
  onClose,
  onCoursesUpdated,
  initialCourseId
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageAlt, setImageAlt] = useState<string>('');
  const [isConfidential, setIsConfidential] = useState<boolean>(false);
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseDesc, setCourseDesc] = useState<string>('');
  const [savedSuccessNotice, setSavedSuccessNotice] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const all = getAllAvailableCourses();
      setCourses(all);
      const initId = initialCourseId || all[0]?.id || 'risk-management';
      setSelectedCourseId(initId);
      loadCourseFields(initId, all);
    }
  }, [isOpen, initialCourseId]);

  const loadCourseFields = (targetId: string, courseList?: Course[]) => {
    const list = courseList || courses;
    const target = list.find(c => c.id === targetId);
    if (target) {
      setImageUrl(target.imageUrl || '');
      setImageAlt(target.imageAlt || '');
      setIsConfidential(Boolean(target.isConfidential));
      setCourseTitle(target.title || '');
      setCourseDesc(target.description || '');
    }
  };

  const handleSelectCourseChange = (id: string) => {
    playCyberClick();
    setSelectedCourseId(id);
    loadCourseFields(id);
  };

  const handleApplyPreset = (presetUrl: string, presetAlt: string) => {
    playCyberClick();
    setImageUrl(presetUrl);
    setImageAlt(presetAlt);
  };

  const handleSave = () => {
    if (!selectedCourseId) return;
    playSuccessChime();

    saveCourseCustomization(selectedCourseId, {
      imageUrl: imageUrl.trim(),
      imageAlt: imageAlt.trim(),
      isConfidential,
      title: courseTitle.trim(),
      description: courseDesc.trim()
    });

    const refreshed = getAllAvailableCourses();
    setCourses(refreshed);
    setSavedSuccessNotice(true);
    setTimeout(() => setSavedSuccessNotice(false), 3000);
    onCoursesUpdated();
  };

  const handleReset = () => {
    if (!window.confirm('คุณต้องการรีเซ็ตการปรับแต่งภาพและข้อมูลหลักสูตรทั้งหมดกลับสู่ค่าเริ่มต้นหรือไม่?')) return;
    playCyberClick();
    resetCourseCustomizations();
    const refreshed = getAllAvailableCourses();
    setCourses(refreshed);
    loadCourseFields(selectedCourseId, refreshed);
    onCoursesUpdated();
  };

  if (!isOpen) return null;

  const currentCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  จัดการภาพพื้นหลัง & ข้อมูลความลับหลักสูตร
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  Admin & Management
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                เลือกหลักสูตรเพื่อเปลี่ยนภาพพื้นหลัง ใส่รูปภาพที่เกี่ยวข้อง และกำหนดเงื่อนไขการแชร์ GPS เมื่อเป็นข้อมูลความลับองค์กร
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Success Banner */}
          {savedSuccessNotice && (
            <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-3 flex items-center gap-3 text-emerald-200 text-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="font-semibold">
                บันทึกการปรับปรุงภาพพื้นหลังและเงื่อนไขหลักสูตรเรียบร้อยแล้ว ข้อมูลจะมีผลทันทีในทุกหน้าจอ!
              </div>
            </div>
          )}

          {/* Select Course Dropdown */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              1. เลือกหลักสูตรที่ต้องการแก้ไขภาพและข้อมูล:
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => handleSelectCourseChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer focus:border-cyan-400"
            >
              {courses.map((c, idx) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `[${c.code}] ` : `[Course ${idx + 1}] `}{c.title} {c.isConfidential ? '🔒 (ข้อมูลความลับองค์กร)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Live Preview Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>ตัวอย่างการแสดงผลบนการ์ดหลักสูตร (Live Preview):</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                ขนาดสัดส่วน 16:9 • ปรับความสว่างและ Gradient คมชัดอัตโนมัติ
              </span>
            </div>

            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-lg flex flex-col justify-between p-4">
              {/* Background Image */}
              {imageUrl ? (
                <div className="absolute inset-0 z-0">
                  <img
                    src={imageUrl}
                    alt=""
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001428] via-[#001F3F]/80 to-[#001428]/50" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#001428] via-[#002855] to-[#0A192F]" />
              )}

              {/* Card Badges */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-950/90 text-white border border-slate-700 shadow-xs">
                  {currentCourse?.badge || 'หลักสูตรมาตรฐาน TCT'}
                </span>

                <div className="flex items-center gap-1.5">
                  {isConfidential && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-950/90 text-rose-300 border border-rose-700 shadow-xs flex items-center gap-1 animate-pulse">
                      <Lock className="w-3 h-3 text-rose-400" />
                      <span>ข้อมูลความลับองค์กร (ตรวจ GPS)</span>
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#002855]/95 text-blue-100 border border-blue-400/30">
                    E-Learning • มีใบประกาศ
                  </span>
                </div>
              </div>

              {/* Title Overlay */}
              <div className="relative z-10 space-y-1">
                <div className="text-[11px] font-bold text-blue-200 tracking-wider">
                  {currentCourse?.code || 'TCT-COURSE'}
                </div>
                <div className="text-base sm:text-lg font-black leading-snug line-clamp-2 text-white drop-shadow">
                  {courseTitle || currentCourse?.title}
                </div>
              </div>

              {/* Bottom Tag */}
              <div className="relative z-10 flex items-center justify-between text-[11px] text-white/90 border-t border-white/20 pt-1.5 backdrop-blur-xs">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-semibold">แผนกบุคคลและธุรการ TCT (Personnel)</span>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono">TCT ACADEMY</span>
              </div>
            </div>
          </div>

          {/* Image URL Input & Confidential Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Custom URL Input */}
            <div className="md:col-span-8 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
              <label className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>ลิงก์รูปภาพพื้นหลังของหลักสูตร (Image URL):</span>
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... หรือ URL รูปภาพที่ต้องการ"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                *สามารถใช้รูปถ่ายหน้างานจริงในโรงงาน TCT, ภาพแล็บ, เครื่องจักร, หรือเลือกจากชุดภาพมาตรฐานด้านล่างได้ทันที
              </p>
            </div>

            {/* GPS Confidential Setting */}
            <div className="md:col-span-4 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>ระบบความลับ & ตรวจพิกัด GPS:</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  กำหนดให้ต้องแชร์พิกัด GPS เพื่อยืนยันว่าอยู่ภายในพื้นที่บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด ก่อนเข้าเรียน
                </p>
              </div>

              <label className="flex items-center gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
                <span className={`text-xs font-bold ${isConfidential ? 'text-rose-400' : 'text-slate-400'}`}>
                  {isConfidential ? '🔒 ข้อมูลความลับองค์กร (ต้องตรวจ GPS)' : '🔓 หลักสูตรทั่วไป (เข้าเรียนได้อิสระ)'}
                </span>
              </label>
            </div>
          </div>

          {/* Quick Preset Image Gallery */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>ชุดภาพถ่ายมาตรฐานที่คัดสรรสำหรับ TCT Academy (คลิกเพื่อเลือกใช้ทันที):</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {COURSE_IMAGE_PRESETS.map((preset) => {
                const isSelected = imageUrl === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.url, preset.title)}
                    className={`group relative rounded-xl overflow-hidden border p-2.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-500/30 bg-cyan-950/30'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="h-24 w-full rounded-lg overflow-hidden relative mb-2 bg-slate-900">
                      <img
                        src={preset.url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-cyan-500 text-slate-950 rounded-full p-1 shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {preset.title}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-medium mt-0.5 line-clamp-1">
                      {preset.category}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="คืนค่าภาพและข้อมูลทั้งหมดเป็นค่าเริ่มต้นโรงงาน"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้น (Reset)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการเปลี่ยนแปลง</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
