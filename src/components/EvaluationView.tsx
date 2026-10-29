import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, ViewState, StandardEvaluationRecord } from '../types';
import { 
  Star, 
  MessageSquare, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  ThumbsUp, 
  Home, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Building2, 
  User, 
  BookOpen, 
  Layers, 
  Sparkles, 
  AlertCircle, 
  Bell, 
  CheckSquare, 
  FileCheck2, 
  ExternalLink,
  Save,
  Send,
  Zap,
  ChevronRight
} from 'lucide-react';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';
import { getAllAvailableCourses } from '../utils/courseManager';
import { saveStandardEvaluation, save30DayFollowUp, getEmployeeEvaluations } from '../data/traineeData';
import { TCTLogo } from './TCTLogo';

interface EvaluationViewProps {
  user: UserProfile;
  onSubmitEvaluation: (answers: any) => void;
  onNavigate: (view: ViewState) => void;
  initialCourseId?: string;
  initialMode?: 'auto_course' | 'external_course' | 'followup_30days';
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  user,
  onSubmitEvaluation,
  onNavigate,
  initialCourseId,
  initialMode = 'auto_course'
}) => {
  const allCourses = useMemo(() => getAllAvailableCourses(), []);
  
  // Tab/Mode state:
  // 1. auto_course: เข้าอัตโนมัติ ต่อจากการอบรมหลักสูตรของบริษัท
  // 2. external_course: ประเมินหลังจากฝึกอบรมหลักสูตรอื่นมาแล้ว (มีหัวข้อให้กรอก)
  // 3. followup_30days: ติดตามผลการนำไปใช้จริงในงาน ภายใน 30 วัน
  const [activeTab, setActiveTab] = useState<'auto_course' | 'external_course' | 'followup_30days'>(initialMode);
  
  // Selected course for auto evaluation
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || user.selectedCourseId || (allCourses[0]?.id || 'applied-psychology')
  );

  const activeCourseObj = allCourses.find(c => c.id === selectedCourseId) || allCourses[0];

  // -------------------------------------------------------------------------
  // Path 2: External / Other Course Fields (หัวข้อสำหรับหลักสูตรอื่นที่ไปอบรมมา)
  // -------------------------------------------------------------------------
  const [extCourseTitle, setExtCourseTitle] = useState('');
  const [extProvider, setExtProvider] = useState('');
  const [extTrainer, setExtTrainer] = useState('');
  const [extDate, setExtDate] = useState(new Date().toISOString().split('T')[0]);
  const [extHours, setExtHours] = useState('6.0 ชั่วโมง (1 วัน)');
  const [extLocation, setExtLocation] = useState('ศูนย์ฝึกอบรมภายนอก / ออนไลน์');
  const [extObjectives, setExtObjectives] = useState('เพื่อเสริมสร้างทักษะและยกระดับประสิทธิภาพการปฏิบัติงานตามเป้าหมายของฝ่ายงาน');

  // -------------------------------------------------------------------------
  // Standard Kirkpatrick 4-Level Evaluation Form State
  // -------------------------------------------------------------------------
  // Level 1: Reaction & Satisfaction (1 - 5)
  const [trainerScore, setTrainerScore] = useState<number>(5);
  const [contentScore, setContentScore] = useState<number>(5);
  const [mediaScore, setMediaScore] = useState<number>(5);
  const [environmentScore, setEnvironmentScore] = useState<number>(5);
  const [durationScore, setDurationScore] = useState<number>(5);
  const [overallSatisfaction, setOverallSatisfaction] = useState<number>(5);

  // Level 2: Learning & Understanding (1 - 5)
  const [knowledgeGainScore, setKnowledgeGainScore] = useState<number>(5);
  const [practicalSkillScore, setPracticalSkillScore] = useState<number>(5);
  const [confidenceScore, setConfidenceScore] = useState<number>(5);

  // Level 3: Behavior & Application
  const [applicationPlanText, setApplicationPlanText] = useState(
    'นำเทคนิคและแนวทางการปฏิบัติที่ได้เรียนรู้ไปจัดทำมาตรฐานการทำงาน (SOP) ใหม่ และแบ่งปันความรู้ให้กับเพื่อนร่วมงานในกะ'
  );
  const [expectedBehaviorChange, setExpectedBehaviorChange] = useState(
    'เพิ่มความรอบคอบในการตรวจสอบจุดเสี่ยง ปฏิบัติตามขั้นตอนความปลอดภัย 100% และสื่อสารประสานงานเชิงรุก'
  );
  const [applicationFrequency, setApplicationFrequency] = useState<'daily' | 'weekly' | 'project_based'>('daily');

  // Level 4: Organizational Results & Impact
  const [expectedImpactText, setExpectedImpactText] = useState(
    'ลดเวลาสูญเปล่า (Downtime) ในกระบวนการทำงาน ลดข้อบกพร่องด้านคุณภาพ และมุ่งสู่เป้าหมาย Zero Accident'
  );
  const [feedbackSuggestions, setFeedbackSuggestions] = useState(
    'การจัดอบรมมีประโยชน์มาก อยากให้จัดหลักสูตรต่อเนื่องระดับ Advance เพื่อพัฒนาทักษะเพิ่มเติมครับ'
  );

  // -------------------------------------------------------------------------
  // 30-Day Follow-Up Tracking State
  // -------------------------------------------------------------------------
  const [followUpApplicationCase, setFollowUpApplicationCase] = useState(
    'ได้นำความรู้ไปปรับปรุงขั้นตอนการทำงานจริงที่ไลน์ผลิต ลดข้อผิดพลาดในการตรวจสอบได้ 100%'
  );
  const [followUpResults, setFollowUpResults] = useState(
    'ประสิทธิภาพการทำงานเพิ่มขึ้น งานเสร็จตามเวลาที่กำหนด และได้รับคำชมเชยจากหัวหน้างาน'
  );
  const [followUpObstacles, setFollowUpObstacles] = useState(
    'ในช่วงแรกต้องใช้เวลาในการปรับตัวของทีมงาน แต่ได้รับการชี้แจงและฝึกฝนจนปฏิบัติได้อย่างราบรื่น'
  );
  const [followUpEffectivenessScore, setFollowUpEffectivenessScore] = useState<number>(5);
  const [followUpSuccessMsg, setFollowUpSuccessMsg] = useState(false);

  // Calculate 30-day tracking data
  const userCompletionDate = user.certificateDate || user.coursesProgress?.[selectedCourseId]?.certificateDate || '12 ตุลาคม 2569';
  const isEnrolledPastCourse = Boolean(user.coursesProgress?.[selectedCourseId]?.postTestScore !== null || user.postTestScore !== null);

  // Likert scale labels
  const likertLabels = [
    { score: 1, label: 'น้อยที่สุด' },
    { score: 2, label: 'น้อย' },
    { score: 3, label: 'ปานกลาง' },
    { score: 4, label: 'มาก' },
    { score: 5, label: 'มากที่สุด' }
  ];

  // Helper renderer for rating buttons
  const renderRatingRow = (title: string, value: number, onChange: (v: number) => void, desc?: string) => (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 transition-all hover:border-blue-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="font-bold text-slate-800 text-xs sm:text-sm">{title}</div>
        {desc && <span className="text-[11px] text-slate-500">{desc}</span>}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {likertLabels.map((item) => {
          const isSelected = value === item.score;
          return (
            <button
              key={item.score}
              type="button"
              onClick={() => {
                playCyberClick();
                onChange(item.score);
              }}
              className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                isSelected
                  ? 'bg-[#002D5A] text-white border-[#002D5A] shadow-md shadow-blue-900/20 ring-2 ring-blue-400/40'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm font-black font-mono">{item.score}</span>
                <Star className={`w-3 h-3 ${isSelected ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              </div>
              <span className="text-[9px] sm:text-[10px] truncate max-w-full font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'external_course' && !extCourseTitle.trim()) {
      playErrorBuzz();
      alert('กรุณาระบุชื่อหลักสูตรการฝึกอบรมที่ได้เข้าร่วม');
      return;
    }

    playSuccessChime();

    const isExt = activeTab === 'external_course';
    const cId = isExt ? `ext-${Date.now()}` : selectedCourseId;
    const cTitle = isExt ? extCourseTitle.trim() : (activeCourseObj.title || activeCourseObj.thaiTitle || 'หลักสูตร TCT');

    const evalRecord: StandardEvaluationRecord = {
      courseId: cId,
      courseTitle: cTitle,
      empId: user.empId,
      employeeName: user.fullName,
      department: user.department,
      isExternalCourse: isExt,
      externalProvider: isExt ? extProvider.trim() : 'TCT Academy',
      externalTrainer: isExt ? extTrainer.trim() : 'ทีมวิทยากร TCT Academy',
      externalDate: isExt ? extDate : new Date().toISOString().split('T')[0],
      externalHours: isExt ? extHours : '6.0 ชั่วโมง',
      externalObjectives: isExt ? extObjectives : 'พัฒนาสมรรถนะการปฏิบัติงานบุคลากร',
      evaluationDate: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
      
      // Level 1
      trainerScore,
      contentScore,
      mediaScore,
      environmentScore,
      durationScore,
      overallSatisfaction,
      
      // Level 2
      knowledgeGainScore,
      practicalSkillScore,
      confidenceScore,
      
      // Level 3
      applicationPlanText,
      expectedBehaviorChange,
      applicationFrequency,
      
      // Level 4
      expectedImpactText,
      feedbackSuggestions
    };

    // Save into persistent evaluation storage
    saveStandardEvaluation(evalRecord);

    // Call parent handler
    onSubmitEvaluation({
      contentQuality: contentScore,
      understanding: knowledgeGainScore,
      platformEase: environmentScore,
      practicalUsage: practicalSkillScore,
      overallSatisfaction,
      feedback: feedbackSuggestions,
      trainerScore,
      mediaScore,
      durationScore,
      confidenceScore,
      applicationPlanText,
      expectedBehaviorChange,
      expectedImpactText,
      isExternalCourse: isExt,
      externalProvider: evalRecord.externalProvider,
      externalTrainer: evalRecord.externalTrainer,
      externalDate: evalRecord.externalDate,
      externalHours: evalRecord.externalHours,
      externalObjectives: evalRecord.externalObjectives,
      evaluationDate: evalRecord.evaluationDate
    });
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccessChime();

    const evaluations = getEmployeeEvaluations(user.empId);
    const targetEval = evaluations.find(e => e.courseId === selectedCourseId) || evaluations[0];
    const evalId = targetEval?.id || `eval-${user.empId}-${selectedCourseId}`;

    save30DayFollowUp(evalId, {
      followUp30DaysApplicationCase: followUpApplicationCase,
      followUp30DaysResults: followUpResults,
      followUp30DaysObstacles: followUpObstacles,
      followUp30DaysEffectivenessScore: followUpEffectivenessScore,
      followUp30DaysDate: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    });

    setFollowUpSuccessMsg(true);
    setTimeout(() => {
      setFollowUpSuccessMsg(false);
      onNavigate('courses');
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 font-sarabun text-slate-800">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { playCyberClick(); onNavigate('courses'); }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>กลับสู่หน้าหลักสูตร</span>
          </button>
          <button
            type="button"
            onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300"
          >
            <Home className="w-4 h-4 text-slate-600" />
            <span>แดชบอร์ด</span>
          </button>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
          <div className="w-6 h-6 rounded-full bg-[#002D5A] text-white flex items-center justify-center font-bold text-[10px]">
            {user.fullName?.substring(0, 1) || 'U'}
          </div>
          <span className="font-bold text-[#002D5A]">{user.fullName}</span>
          <span className="text-slate-500 font-mono">({user.empId})</span>
          <span className="text-blue-700 font-semibold">• แผนก {user.department}</span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-[#001f3f] via-[#002D5A] to-[#004080] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ระบบประเมินผลความพึงพอใจและประสิทธิผลการฝึกอบรม • TCT ACADEMY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            แบบประเมินความพึงพอใจและประสิทธิผลการฝึกอบรม
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
            ระบบประเมินผลสัมฤทธิ์ตามมาตรฐานสากล 4 ระดับ (ปฏิกิริยาความพึงพอใจ, การเรียนรู้, พฤติกรรมการนำไปใช้จริง, และผลลัพธ์ต่อองค์กร) เพื่อนำข้อมูลไปพัฒนาคุณภาพบุคลากรอย่างต่อเนื่อง
          </p>
        </div>

        {/* Background Decors */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 30-Day Automated Follow-up Reminder Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-fadeIn">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 font-bold shadow-xs">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-amber-900 text-sm">
                ระบบติดตามผลการนำไปใช้จริงในงาน ภายใน 30 วัน (30-Day Follow-Up Alert)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                แจ้งเตือนอัตโนมัติ
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              ตามระเบียบ TCT Academy พนักงานที่สำเร็จการอบรมจะต้องเข้ามากรอกแบบติดตามผลการนำความรู้ไปใช้ในการทำงานจริงภายใน 30 วัน
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playCyberClick();
            setActiveTab('followup_30days');
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#002D5A] hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0 transition-all"
        >
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span>กรอกแบบติดตามผล 30 วัน</span>
        </button>
      </div>

      {/* Mode Switcher Tabs (2 Entry Paths + 30-day Follow-up) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Tab 1: Course Auto Flow */}
        <button
          type="button"
          onClick={() => { playCyberClick(); setActiveTab('auto_course'); }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'auto_course'
              ? 'bg-[#002D5A] text-white border-[#002D5A] shadow-md shadow-blue-900/15 ring-2 ring-blue-300'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
              activeTab === 'auto_course' ? 'bg-blue-400/30 text-blue-200' : 'bg-slate-100 text-slate-600'
            }`}>
              ทางที่ 1 (อัตโนมัติ)
            </span>
            <BookOpen className={`w-4 h-4 ${activeTab === 'auto_course' ? 'text-blue-200' : 'text-slate-400'}`} />
          </div>
          <div className="font-bold text-xs sm:text-sm">ประเมินต่อจากหลักสูตรของบริษัท</div>
          <div className={`text-[11px] mt-0.5 ${activeTab === 'auto_course' ? 'text-blue-200' : 'text-slate-500'}`}>
            เข้าต่อจากการอบรมในหลักสูตร TCT ได้เลยทุกหลักสูตร
          </div>
        </button>

        {/* Tab 2: External / Other Course */}
        <button
          type="button"
          onClick={() => { playCyberClick(); setActiveTab('external_course'); }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'external_course'
              ? 'bg-[#002D5A] text-white border-[#002D5A] shadow-md shadow-blue-900/15 ring-2 ring-blue-300'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
              activeTab === 'external_course' ? 'bg-amber-400/30 text-amber-200' : 'bg-slate-100 text-slate-600'
            }`}>
              ทางที่ 2 (หลักสูตรอื่น)
            </span>
            <ExternalLink className={`w-4 h-4 ${activeTab === 'external_course' ? 'text-amber-300' : 'text-slate-400'}`} />
          </div>
          <div className="font-bold text-xs sm:text-sm">ประเมินหลังอบรมหลักสูตรอื่นมา</div>
          <div className={`text-[11px] mt-0.5 ${activeTab === 'external_course' ? 'text-blue-200' : 'text-slate-500'}`}>
            มีหัวข้อให้กรอกชื่อหลักสูตร สถาบัน และวิทยากร
          </div>
        </button>

        {/* Tab 3: 30-Day Follow-Up */}
        <button
          type="button"
          onClick={() => { playCyberClick(); setActiveTab('followup_30days'); }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'followup_30days'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-900/20 ring-2 ring-amber-300'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
              activeTab === 'followup_30days' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              ติดตามผล 30 วัน
            </span>
            <Clock className={`w-4 h-4 ${activeTab === 'followup_30days' ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <div className="font-bold text-xs sm:text-sm">ติดตามผลการนำไปใช้ในงาน</div>
          <div className={`text-[11px] mt-0.5 ${activeTab === 'followup_30days' ? 'text-amber-100' : 'text-slate-500'}`}>
            ประเมินผลการประยุกต์ใช้จริง 30 วันหลังเรียน
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. AUTO-COURSE EVALUATION / EXTERNAL COURSE EVALUATION FORM                */}
      {/* ========================================================================= */}
      {(activeTab === 'auto_course' || activeTab === 'external_course') && (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: Course Selection or External Fields */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            {activeTab === 'auto_course' ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                      ช่องทางที่ 1: การประเมินผลความพึงพอใจในการฝึกอบรม ต่อจากหลักสูตร
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                      เลือกหลักสูตรของ TCT Academy ที่ท่านสำเร็จการฝึกอบรม
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">
                    เชื่อมโยงกับระบบบทเรียนและคะแนนสอบอัตโนมัติ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      หลักสูตรฝึกอบรมที่ประเมิน (Curriculum)
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => {
                        playCyberClick();
                        setSelectedCourseId(e.target.value);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {allCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code ? `${c.code}: ` : ''}{c.title || c.thaiTitle}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      วิทยากร / ผู้ถ่ายทอดความรู้
                    </label>
                    <input
                      type="text"
                      disabled
                      value="นายณฐวัตร พงษ์สาริกิจ & ทีมวิทยากร TCT Academy"
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-600 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* External / Other Course Entry Fields */
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    ช่องทางที่ 2: พนักงานเข้าไปหลังจากฝึกอบรมหลักสูตรอื่นมาแล้ว
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    กรอกข้อมูลหลักสูตรอื่น / การฝึกอบรมภายนอกที่ได้เข้าร่วม
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ระบุรายละเอียดหลักสูตร สถาบันผู้จัด และวิทยากร เพื่อจัดเก็บประวัติการฝึกอบรมในฐานข้อมูลส่วนกลาง
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. ชื่อหลักสูตร / หัวข้อการฝึกอบรม (Course Title) *
                    </label>
                    <input
                      type="text"
                      required
                      value={extCourseTitle}
                      onChange={(e) => setExtCourseTitle(e.target.value)}
                      placeholder="เช่น อบรมกฎหมายความปลอดภัยในการทำงาน 2569, เทคนิคการซ่อมบำรุงขั้นสูง..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. สถาบันผู้จัด / หน่วยงานที่จัดฝึกอบรม (Training Provider)
                    </label>
                    <input
                      type="text"
                      value={extProvider}
                      onChange={(e) => setExtProvider(e.target.value)}
                      placeholder="เช่น สมาคมส่งเสริมความปลอดภัย, สถาบันไทย-เยอรมัน..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      3. ชื่อวิทยากรผู้บรรยาย (Instructor / Trainer)
                    </label>
                    <input
                      type="text"
                      value={extTrainer}
                      onChange={(e) => setExtTrainer(e.target.value)}
                      placeholder="เช่น อาจารย์ หรือผู้เชี่ยวชาญ..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      4. วันที่เข้ารับการฝึกอบรม (Date of Training)
                    </label>
                    <input
                      type="date"
                      value={extDate}
                      onChange={(e) => setExtDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      5. ระยะเวลาการอบรม (Duration / Hours)
                    </label>
                    <input
                      type="text"
                      value={extHours}
                      onChange={(e) => setExtHours(e.target.value)}
                      placeholder="เช่น 6 ชั่วโมง, 2 วัน..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      6. วัตถุประสงค์ของการเข้ารับการฝึกอบรม (Training Objectives)
                    </label>
                    <textarea
                      rows={2}
                      value={extObjectives}
                      onChange={(e) => setExtObjectives(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Level 1: Reaction & Course Satisfaction */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#002D5A] font-bold text-xs flex items-center justify-center">
                1
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  ระดับที่ 1: การประเมินปฏิกิริยาและความพึงพอใจ (Reaction & Satisfaction)
                </h3>
                <p className="text-[11px] text-slate-500">
                  ประเมินคุณภาพวิทยากร เนื้อหาหลักสูตร สื่อการสอน สภาพแวดล้อม และระยะเวลา
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {renderRatingRow('1.1 ความเชี่ยวชาญ เทคนิคการถ่ายทอด และการตอบคำถามของวิทยากร', trainerScore, setTrainerScore)}
              {renderRatingRow('1.2 ความชัดเจน ตรงประเด็น และประโยชน์ของเนื้อหาบทเรียน', contentScore, setContentScore)}
              {renderRatingRow('1.3 คุณภาพสื่อประกอบการเรียน วิดีโอ ตัวอย่าง และเอกสารประกอบ', mediaScore, setMediaScore)}
              {renderRatingRow('1.4 ความสะดวก รวดเร็ว และความเสถียรของระบบการเรียนรู้ / สถานที่อบรม', environmentScore, setEnvironmentScore)}
              {renderRatingRow('1.5 ความเหมาะสมของระยะเวลาและจำนวนชั่วโมงในการฝึกอบรม', durationScore, setDurationScore)}
              {renderRatingRow('1.6 ความพึงพอใจในภาพรวมต่อการจัดฝึกอบรมครั้งนี้', overallSatisfaction, setOverallSatisfaction)}
            </div>
          </div>

          {/* Level 2: Learning & Understanding */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  ระดับที่ 2: การประเมินการเรียนรู้และสมรรถนะ (Learning & Competency Gain)
                </h3>
                <p className="text-[11px] text-slate-500">
                  ประเมินระดับความรู้ ความเข้าใจ และทักษะที่เพิ่มขึ้นเปรียบเทียบก่อน-หลังอบรม
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {renderRatingRow('2.1 ท่านได้รับความรู้ ความเข้าใจในหลักการและทฤษฎีเพิ่มขึ้นอย่างชัดเจน', knowledgeGainScore, setKnowledgeGainScore)}
              {renderRatingRow('2.2 ท่านได้รับการฝึกฝนทักษะและวิธีปฏิบัติที่สามารถนำไปใช้งานได้จริง', practicalSkillScore, setPracticalSkillScore)}
              {renderRatingRow('2.3 ความมั่นใจในการนำความรู้ไปปฏิบัติหน้าที่ในงานประจำวัน', confidenceScore, setConfidenceScore)}
            </div>
          </div>

          {/* Level 3: Behavior & Application Planning */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  ระดับที่ 3: แผนการนำไปประยุกต์ใช้ในการทำงาน (Workplace Application Plan)
                </h3>
                <p className="text-[11px] text-slate-500">
                  ระบุแผนงานและพฤติกรรมที่ตั้งใจจะนำไปปรับปรุงจริงในหน่วยงาน
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  3.1 แผนงานหรือหัวข้องานที่ตั้งใจจะนำความรู้ไปประยุกต์ใช้ในหน้าที่ความรับผิดชอบ
                </label>
                <textarea
                  rows={3}
                  value={applicationPlanText}
                  onChange={(e) => setApplicationPlanText(e.target.value)}
                  placeholder="ระบุตัวอย่างงานที่ตั้งใจจะนำไปใช้..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  3.2 พฤติกรรมการทำงานที่คาดว่าจะปรับเปลี่ยนไปในทิศทางที่ดีขึ้น
                </label>
                <textarea
                  rows={2}
                  value={expectedBehaviorChange}
                  onChange={(e) => setExpectedBehaviorChange(e.target.value)}
                  placeholder="ระบุพฤติกรรมที่จะปรับเปลี่ยน..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  3.3 ความถี่ในการนำความรู้ไปใช้ในงาน
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'daily', label: 'ใช้งานประจำวัน (Daily)' },
                    { id: 'weekly', label: 'ใช้งานประจำสัปดาห์ (Weekly)' },
                    { id: 'project_based', label: 'ใช้งานตามรอบโครงการ (Project)' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => { playCyberClick(); setApplicationFrequency(f.id as any); }}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        applicationFrequency === f.id
                          ? 'bg-[#002D5A] text-white border-[#002D5A] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Level 4: Results & Impact */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-900 font-bold text-xs flex items-center justify-center">
                4
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  ระดับที่ 4: ผลลัพธ์ที่คาดว่าจะเกิดขึ้นต่อองค์กร (Organizational Results & Impact)
                </h3>
                <p className="text-[11px] text-slate-500">
                  ระบุผลลัพธ์เชิงบวกต่อแผนกและบริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  4.1 ผลลัพธ์ต่อการทำงานที่คาดว่าจะเกิดขึ้น (เช่น ลดของเสีย, ลด Downtime, ป้องกันอุบัติเหตุ)
                </label>
                <textarea
                  rows={2}
                  value={expectedImpactText}
                  onChange={(e) => setExpectedImpactText(e.target.value)}
                  placeholder="ระบุผลลัพธ์ที่คาดหวัง..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>4.2 ข้อเสนอแนะเพิ่มเติมเพื่อการปรับปรุงพัฒนาหลักสูตรในอนาคต</span>
                </label>
                <textarea
                  rows={3}
                  value={feedbackSuggestions}
                  onChange={(e) => setFeedbackSuggestions(e.target.value)}
                  placeholder="ระบุข้อคิดเห็นหรือข้อเสนอแนะเพิ่มเติม..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => { playCyberClick(); onNavigate('courses'); }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              ยกเลิก / กลับสู่หน้ารายการหลักสูตร
            </button>

            <button
              id="submit-full-evaluation-btn"
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#002D5A] to-blue-700 hover:from-slate-900 hover:to-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/25 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>บันทึกแบบประเมินความพึงพอใจตามมาตรฐาน</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 2. 30-DAY WORKPLACE APPLICATION FOLLOW-UP FORM (Kirkpatrick Level 3)     */}
      {/* ========================================================================= */}
      {activeTab === 'followup_30days' && (
        <form onSubmit={handleFollowUpSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-300 shadow-md space-y-4">
            
            <div className="border-b border-amber-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  ระบบติดตามผลการปฏิบัติงานจริงภายใน 30 วัน (30-Day Follow-Up Review)
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  แบบประเมินติดตามผลการนำความรู้ไปใช้ในงานจริง (หลังผ่านไป 30 วัน)
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-amber-700">
                  กำหนดส่ง: ภายใน 30 วันหลังสำเร็จการอบรม
                </span>
              </div>
            </div>

            {followUpSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>บันทึกแบบประเมินติดตามผล 30 วัน เรียบร้อยแล้ว ขอบคุณที่ร่วมพัฒนาคุณภาพกับ TCT Academy</span>
              </div>
            )}

            {/* Target Course Selector */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                เลือกหลักสูตรที่ครบกำหนดติดตามผล 30 วัน:
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  playCyberClick();
                  setSelectedCourseId(e.target.value);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {allCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ? `${c.code}: ` : ''}{c.title || c.thaiTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Follow-up Question 1 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                1. ตัวอย่างงานจริงที่ท่านได้นำความรู้จากหลักสูตรไปประยุกต์ใช้ในรอบ 30 วันที่ผ่านมา *
              </label>
              <p className="text-[11px] text-slate-500">
                ระบุขั้นตอน เครื่องจักร หรือกรณีศึกษาจริงที่ได้ปรับปรุงแก้ไขหน้างาน
              </p>
              <textarea
                rows={3}
                required
                value={followUpApplicationCase}
                onChange={(e) => setFollowUpApplicationCase(e.target.value)}
                placeholder="ระบุตัวอย่างงานจริงที่นำไปใช้..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            {/* Follow-up Question 2 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                2. ผลลัพธ์เชิงประจักษ์ที่เกิดขึ้นหลังการนำไปปฏิบัติ (เปรียบเทียบ ก่อน - หลัง) *
              </label>
              <p className="text-[11px] text-slate-500">
                เช่น ปริมาณของเสียลดลง, เวลาในการปฏิบัติงานเร็วขึ้น, ความปลอดภัยดีขึ้น
              </p>
              <textarea
                rows={2}
                required
                value={followUpResults}
                onChange={(e) => setFollowUpResults(e.target.value)}
                placeholder="ระบุผลลัพธ์ที่เกิดขึ้นจริง..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            {/* Follow-up Question 3 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                3. ปัญหา อุปสรรค หรือข้อจำกัดที่พบ และวิธีการแก้ไข
              </label>
              <textarea
                rows={2}
                value={followUpObstacles}
                onChange={(e) => setFollowUpObstacles(e.target.value)}
                placeholder="ระบุปัญหาอุปสรรคและแนวทางแก้ไข..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            {/* Follow-up Rating */}
            <div className="pt-2">
              {renderRatingRow(
                '4. ความคุ้มค่าและประสิทธิผลโดยรวมจากการนำความรู้ไปประยุกต์ใช้ในรอบ 30 วัน',
                followUpEffectivenessScore,
                setFollowUpEffectivenessScore,
                '(1 = น้อยที่สุด, 5 = มากที่สุด)'
              )}
            </div>

          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => { playCyberClick(); setActiveTab('auto_course'); }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              กลับสู่แบบประเมินความพึงพอใจ
            </button>

            <button
              id="submit-followup-30days-btn"
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกแบบติดตามผล 30 วัน เรียบร้อย</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
