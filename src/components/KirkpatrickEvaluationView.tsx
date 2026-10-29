import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, KirkpatrickEvaluation, KirkpatrickEvaluationItem } from '../types';
import { 
  DEFAULT_KIRKPATRICK_QUESTIONS, 
  KIRKPATRICK_LEVELS_CONFIG, 
  RATING_SCALE_LABELS, 
  calculateGrade, 
  saveKirkpatrickEvaluation, 
  getEmployeeKirkpatrickEvaluation,
  generateEvaluationCode 
} from '../utils/kirkpatrickManager';
import { getAllAvailableCourses } from '../utils/courseManager';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { 
  Award, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  Printer, 
  Building2, 
  User, 
  GraduationCap, 
  Clock, 
  Check, 
  FileCheck2, 
  TrendingUp, 
  ShieldCheck, 
  Send,
  BookOpen,
  ArrowRight,
  RotateCcw,
  QrCode,
  Smartphone,
  ExternalLink,
  MapPin,
  Calendar
} from 'lucide-react';
import { EvaluationQrModal } from './EvaluationQrModal';

interface KirkpatrickEvaluationViewProps {
  user: UserProfile;
  initialCourseId?: string;
  onSwitchToLearn?: () => void;
  onSaved?: (evaluation: KirkpatrickEvaluation) => void;
}

export const KirkpatrickEvaluationView: React.FC<KirkpatrickEvaluationViewProps> = ({
  user,
  initialCourseId,
  onSwitchToLearn,
  onSaved
}) => {
  const allCourses = useMemo(() => getAllAvailableCourses(), []);
  
  // Topic / Course Title that employee can input freely
  const initialTitle = useMemo(() => {
    const init = initialCourseId || user.selectedCourseId;
    const found = allCourses.find(c => c.id === init);
    if (found) return found.title;
    return 'การใช้จิตวิทยาประยุกต์ในการทำงานและชีวิตประจำวัน';
  }, [allCourses, initialCourseId, user.selectedCourseId]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    return initialCourseId || user.selectedCourseId || 'applied-psychology';
  });

  const [topicTitle, setTopicTitle] = useState<string>(initialTitle);
  const [trainerOrganizer, setTrainerOrganizer] = useState<string>('ศูนย์ฝึกอบรม TCT Academy / บจก. เทยิน คอร์ด (ประเทศไทย)');
  const [trainingDate, setTrainingDate] = useState<string>(() => {
    return new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  });
  const [trainingLocation, setTrainingLocation] = useState<string>('ศูนย์ฝึกอบรม TCT Academy สวนอุตสาหกรรมโรจนะ');
  const [trainingHours, setTrainingHours] = useState<string>('6 ชั่วโมง');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  // Scores map: questionId -> score (1-5)
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    DEFAULT_KIRKPATRICK_QUESTIONS.forEach(q => {
      initial[q.id] = 5;
    });
    return initial;
  });

  // Active Tab: 'all' | 1 | 2 | 3 | 4 | 'result_slip'
  const [activeTab, setActiveTab] = useState<'all' | 1 | 2 | 3 | 4 | 'result_slip'>('all');

  // Qualitative fields - empty by default so employee fills in by themselves
  const [strengths, setStrengths] = useState<string>('');
  const [applicationPlan, setApplicationPlan] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string>('');
  const [recommendsCourse, setRecommendsCourse] = useState<boolean>(true);

  // Saved evaluation state
  const [savedEvaluation, setSavedEvaluation] = useState<KirkpatrickEvaluation | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  // Load existing evaluation for this employee and course
  useEffect(() => {
    if (user.empId) {
      const existing = getEmployeeKirkpatrickEvaluation(user.empId, selectedCourseId);
      if (existing) {
        setSavedEvaluation(existing);
        const scMap: Record<string, number> = {};
        existing.items.forEach(it => {
          scMap[it.id] = it.score;
        });
        setScores(scMap);
        setStrengths(existing.strengths || '');
        setApplicationPlan(existing.applicationPlan || '');
        setSuggestions(existing.suggestions || '');
        setRecommendsCourse(existing.recommendsCourse !== undefined ? existing.recommendsCourse : true);
        if (existing.courseTitle) {
          setTopicTitle(existing.courseTitle);
        }
        if (existing.externalOrganizer) setTrainerOrganizer(existing.externalOrganizer);
        if (existing.externalDate) setTrainingDate(existing.externalDate);
        if (existing.externalLocation) setTrainingLocation(existing.externalLocation);
        if (existing.externalHours) setTrainingHours(existing.externalHours);
      } else {
        setSavedEvaluation(null);
        setIsSubmittedSuccess(false);
        setStrengths('');
        setApplicationPlan('');
        setSuggestions('');
      }
    }
  }, [user.empId, selectedCourseId]);

  // Calculate scores per level
  const levelScores = useMemo(() => {
    const calcLevel = (lvl: number) => {
      const questions = DEFAULT_KIRKPATRICK_QUESTIONS.filter(q => q.level === lvl);
      if (questions.length === 0) return 5;
      const sum = questions.reduce((acc, q) => acc + (scores[q.id] || 5), 0);
      return Math.round((sum / questions.length) * 10) / 10;
    };

    const l1 = calcLevel(1);
    const l2 = calcLevel(2);
    const l3 = calcLevel(3);
    const l4 = calcLevel(4);
    const overall = Math.round(((l1 + l2 + l3 + l4) / 4) * 10) / 10;
    const percentage = Math.round((overall / 5) * 100);
    const grade = calculateGrade(overall);

    return {
      level1: l1,
      level2: l2,
      level3: l3,
      level4: l4,
      overall,
      percentage,
      grade
    };
  }, [scores]);

  const handleScoreChange = (questionId: string, score: number) => {
    playCyberClick();
    setScores(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccessChime();

    const courseTitleFinal = topicTitle.trim() || 'หัวข้อการฝึกอบรมและพัฒนาบุคลากร';

    const now = new Date();
    const displayTime = now.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ` ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`;

    const items: KirkpatrickEvaluationItem[] = DEFAULT_KIRKPATRICK_QUESTIONS.map(q => ({
      ...q,
      score: scores[q.id] || 5
    }));

    const evalRecord: KirkpatrickEvaluation = {
      id: savedEvaluation?.id || `kpk-eval-${Date.now()}`,
      timestamp: now.toISOString(),
      displayTime,
      empId: user.empId,
      fullName: user.fullName,
      department: user.department,
      position: user.position || 'พนักงาน',
      courseId: selectedCourseId || 'topic-custom',
      courseTitle: courseTitleFinal,
      isExternalOrOtherCourse: false,
      externalCourseName: undefined,
      externalOrganizer: trainerOrganizer.trim() || 'ศูนย์ฝึกอบรม TCT Academy',
      externalLocation: trainingLocation.trim(),
      externalDate: trainingDate.trim(),
      externalHours: trainingHours.trim(),
      reactionScore: levelScores.level1,
      learningScore: levelScores.level2,
      behaviorScore: levelScores.level3,
      resultsScore: levelScores.level4,
      overallScore: levelScores.overall,
      overallPercentage: levelScores.percentage,
      gradeLabelTh: levelScores.grade.labelTh,
      gradeBadgeColor: levelScores.grade.badgeColor,
      items,
      strengths: strengths.trim() || 'เนื้อหาครอบคลุม ชัดเจน และนำไปปรับใช้ในงานได้จริง',
      applicationPlan: applicationPlan.trim() || 'นำแนวทางและเทคนิคที่ได้ไปปรับใช้กับการปฏิบัติงานประจำวันตามมาตรฐาน SOP',
      suggestions: suggestions.trim() || 'ระบบการฝึกอบรมดีเยี่ยม สะดวกต่อการเรียนรู้',
      recommendsCourse,
      evaluationCode: savedEvaluation?.evaluationCode || generateEvaluationCode(user.empId, selectedCourseId || 'TCT')
    };

    saveKirkpatrickEvaluation(evalRecord);
    setSavedEvaluation(evalRecord);
    setIsSubmittedSuccess(true);
    onSaved?.(evalRecord);
  };

  const handlePrintSlip = () => {
    playCyberClick();
    window.print();
  };

  return (
    <div className="space-y-6 font-sarabun">
      
      {/* 1. Header Card with Employee Details & Course Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-amber-300/80 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-[#005A9C] to-indigo-600" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-5 border-b border-slate-100">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600 shrink-0" />
                <span>KIRKPATRICK 4 LEVELS • มาตรฐานสากลการประเมินผลการฝึกอบรม</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                มาตรฐาน ISO 9001 / IATF 16949
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-normal leading-snug flex items-center gap-2">
              <FileCheck2 className="w-7 h-7 text-[#005A9C] shrink-0" />
              <span>ระบบประเมินผลความพึงพอใจและประสิทธิผลการฝึกอบรม (Kirkpatrick Model)</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              สำหรับพนักงาน บจก. เทยิน คอร์ด (ประเทศไทย) เพื่อประเมินผลการอบรมด้วยตนเอง 4 ระดับ: ความพึงพอใจ (Reaction), การเรียนรู้ (Learning), การนำไปใช้ในงานจริง (Behavior), และผลลัพธ์ต่อองค์กร (Results)
            </p>
          </div>

            {/* Quick Action / Status & QR Code Fast-Track */}
            <div className="w-full lg:w-auto shrink-0 flex flex-col items-start lg:items-end gap-2 bg-slate-50 lg:bg-transparent p-4 lg:p-0 rounded-2xl border lg:border-0 border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="btn-open-eval-qr-modal"
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    setIsQrModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#005A9C] hover:from-blue-700 hover:to-[#003875] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                  title="เปิด QR Code สำหรับให้พนักงานสแกนด้วยกล้องมือถือเพื่อเข้าประเมินทันที"
                >
                  <QrCode className="w-4 h-4 text-amber-300" />
                  <span>📱 QR Code สแกนเข้าประเมิน</span>
                </button>

                {savedEvaluation ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveTab('result_slip')}
                      className="px-3.5 py-2 rounded-xl bg-[#002D5A] hover:bg-[#001f3f] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                    >
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>ดูใบสรุปผลประเมิน A4</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playCyberClick();
                        setActiveTab('all');
                        setIsSubmittedSuccess(false);
                      }}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer shadow-2xs"
                    >
                      แก้ไขคะแนน
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 shadow-xs">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>สถานะ: พนักงานต้องประเมินด้วยตนเอง</span>
                  </div>
                )}
              </div>

              {savedEvaluation && (
                <div className="text-[11px] text-slate-500 font-mono">
                  รหัสเอกสาร: {savedEvaluation.evaluationCode}
                </div>
              )}
            </div>
          </div>

          {/* Employee Profile Strip */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-[#005A9C] text-white flex items-center justify-center font-bold text-sm shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 font-medium">ผู้ประเมิน (พนักงาน):</div>
                <div className="font-bold text-slate-900 truncate">
                  {user.fullName} (รหัส: <span className="text-[#005A9C] font-mono">{user.empId}</span>) • แผนก {user.department}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-slate-500 font-medium">เลือกหลักสูตรอ้างอิงจากระบบ (หรือพิมพ์เองด้านล่าง):</div>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCourseId(val);
                    const matched = allCourses.find(c => c.id === val);
                    if (matched) {
                      setTopicTitle(matched.title);
                    }
                  }}
                  className="w-full bg-white text-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-bold border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005A9C] cursor-pointer mt-0.5"
                >
                  {allCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code ? `[${c.code}] ` : ''}{c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Unified Topic & Subject Definition Card - Free Input Across 4 Steps */}
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-3.5 text-xs animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#005A9C] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  ✍️
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-xs sm:text-sm">
                    หัวข้อ / เรื่องที่เข้ารับการประเมิน (Evaluation Topic & Training Subject)
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    พนักงานสามารถพิมพ์ระบุหัวข้อได้ด้วยตนเองอย่างอิสระ หรือคลิกเลือกจากหัวข้อแนะนำ เพื่อประเมินผลครบทั้ง 4 ขั้นตอน
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-950 font-bold text-[10px] shrink-0 border border-amber-300">
                พนักงานระบุหัวข้อเองได้อิสระ
              </span>
            </div>

            {/* Course / Topic Title Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>ระบุหัวข้อ / หลักสูตรที่ต้องการประเมิน:</span>
                  <span className="text-red-600 font-bold">*</span>
                </span>
                <span className="text-slate-500 text-[10px] font-normal">พิมพ์แก้ไขได้อิสระ</span>
              </label>
              <input
                type="text"
                required
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="พิมพ์หัวข้อที่ต้องการประเมิน เช่น การขับขี่รถโฟล์คลิฟท์อย่างปลอดภัย, KYT หยั่งรู้ระวังภัย, ซ้อมดับเพลิง..."
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white font-bold text-slate-900 text-xs sm:text-sm focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/20 focus:outline-none transition-all shadow-2xs"
              />
              
              {/* Preset Topic Chips (Fast Auto-fill) */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-600 font-bold block">เลือกหัวข้อด่วน (Quick Topic Fill):</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: 'จิตวิทยาประยุกต์ในการทำงาน', title: 'การใช้จิตวิทยาประยุกต์ในการทำงานและชีวิตประจำวัน', id: 'applied-psychology' },
                    { label: 'KYT การหยั่งรู้ระวังภัย', title: 'KYT การหยั่งรู้ระวังภัยในการทำงาน (Kiken Yoshi Training)', id: 'kyt-shisa-kanko' },
                    { label: 'ข้อกำหนด IATF 16949', title: 'ข้อกำหนดระบบบริหารงานคุณภาพยานยนต์ IATF 16949:2016', id: 'iatf-16949' },
                    { label: 'ขับขี่รถโฟล์คลิฟท์ปลอดภัย', title: 'การขับขี่และควบคุมรถโฟล์คลิฟท์อย่างปลอดภัยในคลังสินค้าและฝ่ายผลิต', id: 'forklift-safety' },
                    { label: 'จป.หัวหน้างาน', title: 'เจ้าหน้าที่ความปลอดภัยในการทำงานระดับหัวหน้างาน (จป.หัวหน้างาน)', id: 'safety-officer' },
                    { label: 'ดับเพลิงและซ้อมหนีไฟ', title: 'การดับเพลิงขั้นต้นและการฝึกซ้อมอพยพหนีไฟประจำปี', id: 'fire-evacuation' },
                    { label: 'การทำงานในที่อับอากาศ', title: 'ความปลอดภัยในการทำงานในที่อับอากาศ (Confined Space Safety)', id: 'confined-space' },
                    { label: 'การบำรุงรักษา TPM', title: 'การบำรุงรักษาเชิงป้องกันและทวีผลที่ทุกคนมีส่วนร่วม (TPM)', id: 'tpm-maintenance' },
                    { label: 'สารเคมีอันตรายและ SDS', title: 'การจัดการสารเคมีอันตรายและการอ่านเอกสารความปลอดภัย SDS', id: 'chemical-sds' },
                    { label: 'AI & Digital Tools TCT', title: 'การประยุกต์ใช้ AI และเครื่องมือดิจิทัลสำหรับการเพิ่มผลผลิต TCT', id: 'ai-for-tct' },
                    { label: 'ปฐมพยาบาล CPR & AED', title: 'การปฐมพยาบาลเบื้องต้นและการช่วยฟื้นคืนชีพขั้นพื้นฐาน (CPR & AED)', id: 'first-aid-cpr' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        playCyberClick();
                        setTopicTitle(preset.title);
                        setSelectedCourseId(preset.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-all cursor-pointer shadow-2xs ${
                        topicTitle === preset.title
                          ? 'bg-[#002D5A] text-white border-[#002D5A] font-bold'
                          : 'bg-white hover:bg-amber-100 text-slate-800 border-amber-200 hover:border-amber-400'
                      }`}
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid: Organizer, Date, Location, Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-amber-200/60 mt-2">
              {/* Organizer */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-[11px]">
                  วิทยากร / สถาบันผู้จัด:
                </label>
                <input
                  type="text"
                  value={trainerOrganizer}
                  onChange={(e) => setTrainerOrganizer(e.target.value)}
                  placeholder="เช่น ศูนย์ฝึกอบรม TCT Academy, วิทยากรภายนอก..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005A9C]"
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#005A9C]" />
                  <span>วันที่จัดฝึกอบรม:</span>
                </label>
                <input
                  type="text"
                  value={trainingDate}
                  onChange={(e) => setTrainingDate(e.target.value)}
                  placeholder="เช่น 26 ตุลาคม 2569"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005A9C]"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#005A9C]" />
                  <span>สถานที่ฝึกอบรม:</span>
                </label>
                <input
                  type="text"
                  value={trainingLocation}
                  onChange={(e) => setTrainingLocation(e.target.value)}
                  placeholder="เช่น บจก. เทยิน คอร์ด (ประเทศไทย) สวนอุตสาหกรรมโรจนะ"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005A9C]"
                />
              </div>

              {/* Hours */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#005A9C]" />
                  <span>จำนวนชั่วโมงฝึกอบรม:</span>
                </label>
                <input
                  type="text"
                  value={trainingHours}
                  onChange={(e) => setTrainingHours(e.target.value)}
                  placeholder="เช่น 6 ชั่วโมง"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005A9C]"
                />
              </div>
            </div>
          </div>
        </div>

      {/* 2. Success Banner if submitted */}
      {isSubmittedSuccess && activeTab !== 'result_slip' && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-emerald-950">
                บันทึกผลการประเมินตามโมเดล Kirkpatrick สำเร็จเรียบร้อย!
              </div>
              <div className="text-xs text-emerald-800">
                คะแนนเฉลี่ยรวม {savedEvaluation?.overallScore}/5.0 ({savedEvaluation?.overallPercentage}%) • {savedEvaluation?.gradeLabelTh}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('result_slip')}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer whitespace-nowrap shadow-xs"
            >
              ดูใบสรุปผลประเมิน A4
            </button>
            {onSwitchToLearn && (
              <button
                type="button"
                onClick={onSwitchToLearn}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 cursor-pointer shadow-2xs"
              >
                ไปที่หน้าเลือกเรียน
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Tab Pill Switcher (Full Form / Level 1-4 / Result Slip) */}
      <div className="bg-white rounded-2xl p-2.5 shadow-md border border-slate-200 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => { playCyberClick(); setActiveTab('all'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#002D5A] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            แบบฟอร์มทั้งหมด 4 ระดับ (Full)
          </button>

          {KIRKPATRICK_LEVELS_CONFIG.map((lvl) => {
            const currentLvlScore = lvl.level === 1 ? levelScores.level1 
              : lvl.level === 2 ? levelScores.level2 
              : lvl.level === 3 ? levelScores.level3 
              : levelScores.level4;
            return (
              <button
                key={lvl.level}
                type="button"
                onClick={() => { playCyberClick(); setActiveTab(lvl.level); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === lvl.level
                    ? 'bg-[#002D5A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>ระดับ {lvl.level}</span>
                <span className="px-1.5 py-0.2 rounded bg-white text-[#005A9C] font-mono text-[10px] font-bold">
                  {currentLvlScore.toFixed(1)}
                </span>
              </button>
            );
          })}

          {savedEvaluation && (
            <button
              type="button"
              onClick={() => { playCyberClick(); setActiveTab('result_slip'); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'result_slip'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>ใบสรุปผลประเมิน (Result Slip)</span>
            </button>
          )}
        </div>

        {/* Live Score Counter */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 shrink-0">
          <span className="text-xs text-slate-500">คะแนนเฉลี่ยรวม:</span>
          <span className="text-base font-black text-[#005A9C] font-mono">
            {levelScores.overall} / 5.0
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {levelScores.percentage}% ({levelScores.grade.labelTh.split(' ')[0]})
          </span>
        </div>
      </div>

      {/* 4. Active Tab Content */}
      {activeTab === 'result_slip' && savedEvaluation ? (
        /* PRINTABLE RESULT SLIP VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between no-print pb-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="text-xs text-[#005A9C] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>← กลับไปยังแบบฟอร์มประเมิน</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-4 py-2 rounded-xl bg-[#002D5A] hover:bg-[#001f3f] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4 text-blue-200" />
                <span>พิมพ์ใบประเมิน (Print A4)</span>
              </button>
            </div>
          </div>

          {/* Printable Slip Container (A4 Formal Quality) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-300 shadow-md space-y-6 text-slate-800 text-xs sm:text-sm">
            
            {/* Header with Official Logo */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/tct-academy-logo.svg" 
                  alt="TCT Academy" 
                  className="w-14 h-14 object-contain" 
                />
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#002855] tracking-normal leading-snug">
                    บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
                  </h3>
                  <p className="text-xs text-slate-600 font-bold">
                    TEIJIN CORD (THAILAND) CO., LTD. • สวนอุตสาหกรรมโรจนะ จ.อยุธยา
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ใบสรุปผลการประเมินความพึงพอใจและประสิทธิผลการฝึกอบรม (Kirkpatrick 4-Level Evaluation Record)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-xs font-bold text-[#005A9C]">
                  {savedEvaluation.evaluationCode}
                </div>
                <div className="text-[11px] text-slate-500">
                  วันที่บันทึก: {savedEvaluation.displayTime}
                </div>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  ISO 9001 / IATF 16949 COMPLIANT
                </span>
              </div>
            </div>

            {/* Trainee & Course Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">รหัสพนักงาน:</span>
                <strong className="font-mono text-sm text-[#005A9C]">{savedEvaluation.empId}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">ชื่อ-นามสกุล:</span>
                <strong className="text-slate-900">{savedEvaluation.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">แผนก / ตำแหน่ง:</span>
                <strong className="text-slate-900">{savedEvaluation.department} • {savedEvaluation.position}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">หัวข้อ / หลักสูตรที่ประเมิน:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <strong className="text-[#002855] block font-bold text-xs sm:text-sm" title={savedEvaluation.courseTitle}>
                    {savedEvaluation.courseTitle}
                  </strong>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#003875] border border-blue-200 font-bold text-[10px]">
                    Kirkpatrick 4 Levels
                  </span>
                </div>
              </div>
            </div>

            {/* Training Session Details Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-slate-500 block text-[11px]">วิทยากร / สถาบันผู้จัด:</span>
                <strong className="text-slate-900">{savedEvaluation.externalOrganizer || 'ศูนย์ฝึกอบรม TCT Academy'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">วันที่จัดฝึกอบรม:</span>
                <strong className="text-slate-900">{savedEvaluation.externalDate || savedEvaluation.displayTime?.split(' ')[0] || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">สถานที่ / ระยะเวลา:</span>
                <strong className="text-slate-900">{savedEvaluation.externalLocation || 'ศูนย์ฝึกอบรม TCT Academy สวนอุตสาหกรรมโรจนะ'} • {savedEvaluation.externalHours || '6 ชม.'}</strong>
              </div>
            </div>

            {/* Summary Score 4 Levels Matrix */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#005A9C]" />
                <span>สรุปผลคะแนนประเมิน 4 ระดับตามโมเดล Kirkpatrick</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-900 block">LEVEL 1: REACTION</span>
                  <div className="text-xl font-black text-blue-700 font-mono">{savedEvaluation.reactionScore} / 5.0</div>
                  <span className="text-[10px] text-slate-500">ความพึงพอใจการอบรม</span>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-teal-900 block">LEVEL 2: LEARNING</span>
                  <div className="text-xl font-black text-teal-700 font-mono">{savedEvaluation.learningScore} / 5.0</div>
                  <span className="text-[10px] text-slate-500">การเรียนรู้และทักษะ</span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-900 block">LEVEL 3: BEHAVIOR</span>
                  <div className="text-xl font-black text-emerald-700 font-mono">{savedEvaluation.behaviorScore} / 5.0</div>
                  <span className="text-[10px] text-slate-500">การนำไปใช้ในงาน</span>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-indigo-900 block">LEVEL 4: RESULTS</span>
                  <div className="text-xl font-black text-indigo-700 font-mono">{savedEvaluation.resultsScore} / 5.0</div>
                  <span className="text-[10px] text-slate-500">ผลลัพธ์ต่อองค์กร</span>
                </div>
              </div>

              {/* Overall Score Box */}
              <div className="bg-gradient-to-r from-slate-900 via-[#002D5A] to-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-blue-200 font-medium">คะแนนเฉลี่ยรวมทุกระดับ (Overall Average Score):</div>
                  <div className="text-2xl font-black font-mono text-amber-300">
                    {savedEvaluation.overallScore} / 5.0 ({savedEvaluation.overallPercentage}%)
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-xs">
                    {savedEvaluation.gradeLabelTh}
                  </span>
                </div>
              </div>
            </div>

            {/* Qualitative Feedback Details */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <strong className="text-slate-800 block mb-0.5 font-bold">จุดเด่นของหลักสูตรที่ประทับใจ:</strong>
                <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">{savedEvaluation.strengths || '-'}</p>
              </div>
              <div>
                <strong className="text-slate-800 block mb-0.5 font-bold">แผนการนำไปประยุกต์ใช้ในการทำงานจริง (Action Plan):</strong>
                <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">{savedEvaluation.applicationPlan || '-'}</p>
              </div>
              <div>
                <strong className="text-slate-800 block mb-0.5 font-bold">ข้อเสนอแนะเพิ่มเติมเพื่อการปรับปรุงและพัฒนา (CQI):</strong>
                <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">{savedEvaluation.suggestions || '-'}</p>
              </div>
            </div>

            {/* Signatures Footer - 4 Official Blocks */}
            <div className="pt-6 border-t border-slate-300 grid grid-cols-2 lg:grid-cols-4 gap-4 text-center text-xs">
              <div className="space-y-7 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 text-[11px] font-bold">1. ผู้เข้ารับการอบรม (ผู้ประเมิน)</p>
                <div>
                  <p className="font-bold text-slate-800">{savedEvaluation.fullName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">รหัส {savedEvaluation.empId}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{savedEvaluation.displayTime}</p>
                </div>
              </div>

              <div className="space-y-7 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 text-[11px] font-bold">2. หัวหน้าศูนย์พัฒนาบุคลากร</p>
                <div>
                  <p className="font-bold text-slate-800">นายณฐวัตร พงษ์สาริกิจ</p>
                  <p className="text-[10px] text-[#005A9C] font-semibold">หัวหน้าศูนย์ TCT Academy / แอดมิน</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">ผู้จัดทำและบริหารระบบ</p>
                </div>
              </div>

              <div className="space-y-7 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 text-[11px] font-bold">3. ผู้จัดการศูนย์ฯ / ผจก.บุคคล</p>
                <div>
                  <p className="font-bold text-slate-800">นายกิตติศักดิ์ สร้อยจิตต์</p>
                  <p className="text-[10px] text-[#005A9C] font-semibold">ผู้จัดการฝ่ายบุคคลและธุรการ</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">ผู้ตรวจสอบและรับรองผล</p>
                </div>
              </div>

              <div className="space-y-7 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 text-[11px] font-bold">4. ประธานที่ปรึกษาศูนย์ฯ</p>
                <div>
                  <p className="font-bold text-slate-800">นายนพดล บำรุงเกียรติ</p>
                  <p className="text-[10px] text-[#005A9C] font-semibold">ผู้จัดการทั่วไปและผู้จัดการโรงงาน</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">ผู้อนุมัติผลการประเมิน (ISO/IATF)</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* FULL EVALUATION FORM VIEW */
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Instructions Notice */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs leading-relaxed text-blue-900">
            <ShieldCheck className="w-5 h-5 text-[#005A9C] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-[#002D5A] mb-0.5">
                คำชี้แจงการประเมินผลความพึงพอใจและประสิทธิผลหลังการฝึกอบรม
              </div>
              <p className="text-slate-700">
                ขอความร่วมมือพนักงานตอบแบบประเมินตามความเป็นจริง เพื่อนำผลไปวิเคราะห์และพัฒนาหลักสูตรอย่างต่อเนื่อง (CQI) โดยมีเกณฑ์การประเมิน 5 ระดับ (5 = ดีเยี่ยม, 4 = ดีมาก, 3 = ปานกลาง, 2 = พอใช้, 1 = ควรปรับปรุง)
              </p>
            </div>
          </div>

          {/* QUESTIONS LIST ACCORDING TO SELECTED TAB */}
          {KIRKPATRICK_LEVELS_CONFIG.filter(cfg => activeTab === 'all' || activeTab === cfg.level).map(lvl => {
            const questionsInLevel = DEFAULT_KIRKPATRICK_QUESTIONS.filter(q => q.level === lvl.level);

            return (
              <div key={lvl.level} className="space-y-4 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                
                {/* Level Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider text-white bg-gradient-to-r from-slate-800 to-[#003875] mb-1">
                      {lvl.badge}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {lvl.nameTh}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lvl.descriptionTh}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block font-medium">คะแนนเฉลี่ยระดับนี้</span>
                    <strong className="text-base sm:text-lg font-black text-[#005A9C] font-mono">
                      {lvl.level === 1 ? levelScores.level1 
                        : lvl.level === 2 ? levelScores.level2 
                        : lvl.level === 3 ? levelScores.level3 
                        : levelScores.level4} / 5.0
                    </strong>
                  </div>
                </div>

                {/* Question Items */}
                <div className="space-y-3.5 pt-1">
                  {questionsInLevel.map((q) => {
                    const currentScore = scores[q.id] || 5;

                    return (
                      <div key={q.id} className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 space-y-3 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                              {q.topic}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              {q.descriptionTh}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto font-mono text-xs">
                            <span className="font-bold text-[#005A9C] bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
                              {currentScore} / 5
                            </span>
                          </div>
                        </div>

                        {/* Rating Buttons 1 to 5 */}
                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
                          {RATING_SCALE_LABELS.map((opt) => (
                            <button
                              key={opt.score}
                              type="button"
                              onClick={() => handleScoreChange(q.id, opt.score)}
                              className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                currentScore === opt.score
                                  ? 'bg-[#002D5A] text-white border-[#002D5A] shadow-md ring-2 ring-blue-400/40'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-0.5">
                                <Star className={`w-3.5 h-3.5 ${currentScore === opt.score ? 'text-amber-300 fill-amber-300' : 'text-slate-300'}`} />
                                <span className="font-bold text-xs font-mono">{opt.score}</span>
                              </div>
                              <span className={`text-[10px] line-clamp-1 ${currentScore === opt.score ? 'text-blue-200 font-semibold' : 'text-slate-500'}`}>
                                {opt.labelTh.split(' ')[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}

          {/* QUALITATIVE FEEDBACK SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-sm sm:text-base text-slate-900">
                ข้อเสนอแนะและแผนการนำไปประยุกต์ใช้ในการปฏิบัติงาน (Qualitative Feedback)
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  1. จุดเด่นของหลักสูตรที่ท่านประทับใจมากที่สุด:
                </label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="ระบุจุดเด่น เช่น วิทยากรอธิบายเข้าใจง่าย สื่อการสอนน่าสนใจ..."
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005A9C] text-slate-900 text-xs resize-none"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-500 font-medium">ข้อความแนะนำ:</span>
                  {['เนื้อหาเข้าใจง่าย ตรงกับงาน', 'วิทยากรอธิบายชัดเจน', 'มินิเกมและตัวอย่างประกอบเห็นภาพ', 'สื่อทันสมัย สะดวกต่อการเรียน'].map(txt => (
                    <button
                      key={txt}
                      type="button"
                      onClick={() => setStrengths(prev => prev ? `${prev}, ${txt}` : txt)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {txt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  2. สิ่งที่ท่านตั้งใจจะนำความรู้และทักษะไปประยุกต์ใช้ในการทำงานจริง (Action Plan):
                </label>
                <textarea
                  rows={2}
                  value={applicationPlan}
                  onChange={(e) => setApplicationPlan(e.target.value)}
                  placeholder="ระบุการนำไปใช้ เช่น การลดข้อผิดพลาดในกะงาน การสื่อสารที่มีประสิทธิภาพ..."
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005A9C] text-slate-900 text-xs resize-none"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-500 font-medium">ข้อความแนะนำ:</span>
                  {['นำไปปรับใช้กับ SOP หน้างาน', 'เพิ่มการสื่อสารเชิงบวกในกะงาน', 'นำเทคนิคความปลอดภัยไปใช้ประจำวัน', 'แชร์ความรู้ให้เพื่อนร่วมงาน'].map(txt => (
                    <button
                      key={txt}
                      type="button"
                      onClick={() => setApplicationPlan(prev => prev ? `${prev}, ${txt}` : txt)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {txt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  3. ข้อเสนอแนะเพิ่มเติมเพื่อการปรับปรุงและพัฒนาหลักสูตรอย่างต่อเนื่อง (CQI):
                </label>
                <textarea
                  rows={2}
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="ข้อเสนอแนะเกี่ยวกับเนื้อหา สื่อ อุปกรณ์ หรือหลักสูตรอื่นๆ ที่ต้องการเรียนรู้เพิ่มเติม..."
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005A9C] text-slate-900 text-xs resize-none"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-500 font-medium">ข้อความแนะนำ:</span>
                  {['ควรจัดหลักสูตรต่อเนื่องทุกปี', 'ระบบใช้งานง่าย สะดวกมาก', 'เพิ่มกรณีศึกษาโรงงานผลิต', 'เนื้อหากระชับดีแล้ว'].map(txt => (
                    <button
                      key={txt}
                      type="button"
                      onClick={() => setSuggestions(prev => prev ? `${prev}, ${txt}` : txt)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {txt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendation checkbox */}
              <div className="pt-2 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="inline-kpk-recommend-chk"
                  checked={recommendsCourse}
                  onChange={(e) => setRecommendsCourse(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#005A9C] focus:ring-[#005A9C] cursor-pointer"
                />
                <label htmlFor="inline-kpk-recommend-chk" className="font-bold text-slate-800 cursor-pointer">
                  ข้าพเจ้ายินดีและเห็นควรแนะนำหลักสูตรนี้ให้เพื่อนร่วมงานท่านอื่นในองค์กร
                </label>
              </div>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-md">
            <div className="text-xs text-slate-700">
              <span className="font-medium">สรุปคะแนนประเมินของคุณ: </span>
              <strong className="text-lg text-[#005A9C] font-mono font-black">{levelScores.overall} / 5.0</strong>
              <span className="ml-2 font-bold text-emerald-700">({levelScores.percentage}%) • {levelScores.grade.labelTh}</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {onSwitchToLearn && (
                <button
                  type="button"
                  onClick={onSwitchToLearn}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  สลับไปเลือกเรียน
                </button>
              )}

              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-[#002D5A] via-[#003875] to-[#005A9C] hover:from-[#001f3f] hover:to-[#002855] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>บันทึกและส่งผลการประเมิน Kirkpatrick</span>
              </button>
            </div>
          </div>

        </form>
      )}

      {/* QR Code Scan Modal for Employees & Trainers */}
      <EvaluationQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        targetCourseId={selectedCourseId || 'applied-psychology'}
      />

    </div>
  );
};
