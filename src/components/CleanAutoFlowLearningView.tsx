import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  HelpCircle, 
  Star, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Printer, 
  Clock, 
  Sparkles, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  GraduationCap,
  Building2,
  Calendar,
  ShieldCheck,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  EmployeeRecord, 
  FirestoreCourseData, 
  saveTrainingRecord, 
  getSystemSettings, 
  SystemSettingsData, 
  DEFAULT_SYSTEM_SETTINGS 
} from '../firebase';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';
import { printA4Document, downloadDocumentHtml } from '../utils/printHelper';

interface CleanAutoFlowLearningViewProps {
  course: FirestoreCourseData;
  employee: EmployeeRecord;
  onBackToCourses: () => void;
  onOpenAdminConsole?: () => void;
}

export const CleanAutoFlowLearningView: React.FC<CleanAutoFlowLearningViewProps> = ({
  course,
  employee,
  onBackToCourses,
  onOpenAdminConsole
}) => {
  // Wizard Steps: 1: Study, 2: Exam, 3: Survey, 4: Result/Certificate
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // System Settings (Document No. & Signatories)
  const [settings, setSettings] = useState<SystemSettingsData>(DEFAULT_SYSTEM_SETTINGS);

  useEffect(() => {
    getSystemSettings().then(setSettings).catch(() => {});
  }, []);

  // Study Phase State
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [studyStartTime] = useState<number>(Date.now());
  const [studyDurationSeconds, setStudyDurationSeconds] = useState(0);

  // Exam Phase State
  const questions = course.questions && course.questions.length > 0 ? course.questions : [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [examScore, setExamScore] = useState<number | null>(null);
  const [attemptsCount, setAttemptsCount] = useState<number>(1);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);

  // Survey Phase State
  const [surveyRatings, setSurveyRatings] = useState<Record<string, number>>({
    sq1: 5,
    sq2: 5,
    sq3: 5,
    sq4: 5
  });
  const [surveyComment, setSurveyComment] = useState('');
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);

  // Certificate Phase State
  const [certificateId, setCertificateId] = useState<string>('');
  const [completionDate, setCompletionDate] = useState<string>('');
  const certificatePrintRef = useRef<HTMLDivElement>(null);

  const passingScore = course.passingScore || Math.ceil((questions.length || 10) * 0.8);
  const totalQuestions = questions.length || 10;

  // Auto-scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, currentQuestionIndex, activeSlideIndex]);

  // Handle Study Step: Proceed to Exam
  const handleProceedToExam = () => {
    playCyberClick();
    const duration = Math.max(30, Math.round((Date.now() - studyStartTime) / 1000));
    setStudyDurationSeconds(duration);
    setCurrentStep(2);
  };

  // Handle Exam Answer Selection with AUTO-ADVANCE
  const handleSelectAnswer = (qIndex: number, choiceIndex: number) => {
    if (isAnswerSelected) return; // Prevent double click
    playCyberClick();
    setIsAnswerSelected(true);

    const updatedAnswers = { ...selectedAnswers, [qIndex]: choiceIndex };
    setSelectedAnswers(updatedAnswers);

    // Auto-advance to next question or evaluate exam
    setTimeout(() => {
      if (qIndex + 1 < questions.length) {
        setCurrentQuestionIndex(qIndex + 1);
        setIsAnswerSelected(false);
      } else {
        // Evaluate Exam
        evaluateExam(updatedAnswers);
        setIsAnswerSelected(false);
      }
    }, 400);
  };

  // Evaluate Exam
  const evaluateExam = (finalAnswers: Record<number, number>) => {
    let score = 0;
    questions.forEach((q, index) => {
      if (finalAnswers[index] === q.correctAnswer) {
        score += 1;
      }
    });

    setExamScore(score);

    if (score >= passingScore) {
      playSuccessChime();
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
      // Automatically advance to Step 3: Survey
      setTimeout(() => {
        setCurrentStep(3);
      }, 1000);
    } else {
      playErrorBuzz();
    }
  };

  // Retake Exam
  const handleRetakeExam = () => {
    playCyberClick();
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setExamScore(null);
    setAttemptsCount(prev => prev + 1);
    setIsAnswerSelected(false);
  };

  // Handle Survey Rating
  const handleRatingChange = (id: string, stars: number) => {
    playCyberClick();
    setSurveyRatings(prev => ({ ...prev, [id]: stars }));
  };

  // Submit Survey & Save to Firestore - Strict 100% Confirmation
  const handleSubmitSurvey = async () => {
    playCyberClick();
    setIsSubmittingRecord(true);

    const generatedCertId = `TCT-${course.code || 'CERT'}-${new Date().getFullYear()}-${employee.empId}-${String(Date.now()).slice(-4)}`;
    const formattedDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    setCertificateId(generatedCertId);
    setCompletionDate(formattedDate);

    const finalScore = examScore !== null ? examScore : passingScore;
    const percentage = Math.round((finalScore / totalQuestions) * 100);

    const ratingsList: number[] = Object.values(surveyRatings) as number[];
    const avgRating = ratingsList.length > 0 ? (ratingsList.reduce((a: number, b: number) => a + b, 0) / ratingsList.length) : 5;

    try {
      // 100% Guaranteed Firestore Write before showing certificate
      await saveTrainingRecord({
        empId: employee.empId,
        fullName: employee.fullName,
        department: employee.department,
        position: employee.position,
        courseId: course.id,
        courseTitle: course.title,
        studyDurationSeconds: studyDurationSeconds || 120,
        examScore: finalScore,
        examTotal: totalQuestions,
        examPercentage: percentage,
        passed: true,
        attemptsCount,
        surveyRatings,
        surveyAverageRating: Math.round(avgRating * 10) / 10,
        surveyComment,
        certificateId: generatedCertId,
        completedAt: formattedDate
      });

      try {
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
      } catch (e) {}

      setIsSubmittingRecord(false);
      setCurrentStep(4);
    } catch (err) {
      setIsSubmittingRecord(false);
      alert('ไม่สามารถบันทึกผลการสอบลงระบบ Firestore ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Dedicated Print A4 Document (Opens popup window without iframe cuts)
  const handlePrintCertificate = () => {
    if (!certificatePrintRef.current) return;
    printA4Document({
      title: `ใบประกาศนียบัตร_${employee.empId}_${course.code}`,
      elementOrHtml: certificatePrintRef.current,
      orientation: 'landscape',
      autoPrint: true
    });
  };

  // Download Backup HTML Document
  const handleDownloadCertificate = () => {
    if (!certificatePrintRef.current) return;
    downloadDocumentHtml(
      `Certificate_${employee.empId}_${course.code}.html`,
      `ใบประกาศนียบัตร - ${employee.fullName}`,
      certificatePrintRef.current,
      'landscape'
    );
  };

  const slides = course.modules && course.modules.length > 0 ? course.modules : [
    {
      id: 'm1',
      title: course.title,
      description: course.description,
      content: course.description,
      keyTakeaways: [
        'ทำความเข้าใจวัตถุประสงค์และมาตรฐานการปฏิบัติงานที่ถูกต้อง',
        'ปฏิบัติตามแนวทางความปลอดภัยและลดความสูญเสียในกระบวนการ',
        'นำทักษะที่ได้ไปประยุกต์ใช้เพื่อเพิ่มคุณภาพและประสิทธิภาพการทำงาน'
      ]
    }
  ];

  const currentSlide = slides[activeSlideIndex] || slides[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sarabun">
      {/* ============================================================== */}
      {/* TOP COMPACT NAVBAR                                             */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBackToCourses}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>กลับสู่หน้ารวมวิชา</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">{employee.fullName} ({employee.empId})</span>
            {onOpenAdminConsole && (
              <button
                onClick={onOpenAdminConsole}
                className="text-xs px-2.5 py-1 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-500/40 cursor-pointer"
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* STEP PROGRESS INDICATOR                                        */}
      {/* ============================================================== */}
      <div className="bg-slate-950 border-b border-slate-800 py-3 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs">
          <div className={`flex items-center gap-2 ${currentStep === 1 ? 'text-cyan-400 font-bold' : currentStep > 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${currentStep === 1 ? 'bg-cyan-500 text-slate-950' : currentStep > 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              {currentStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
            </div>
            <span>1. บทเรียน</span>
          </div>

          <div className="h-0.5 w-6 sm:w-16 bg-slate-800" />

          <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-cyan-400 font-bold' : currentStep > 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${currentStep === 2 ? 'bg-cyan-500 text-slate-950' : currentStep > 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              {currentStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
            </div>
            <span>2. ข้อสอบ ({passingScore}/{totalQuestions})</span>
          </div>

          <div className="h-0.5 w-6 sm:w-16 bg-slate-800" />

          <div className={`flex items-center gap-2 ${currentStep === 3 ? 'text-cyan-400 font-bold' : currentStep > 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${currentStep === 3 ? 'bg-cyan-500 text-slate-950' : currentStep > 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              {currentStep > 3 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
            </div>
            <span>3. ประเมิน</span>
          </div>

          <div className="h-0.5 w-6 sm:w-16 bg-slate-800" />

          <div className={`flex items-center gap-2 ${currentStep === 4 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${currentStep === 4 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              4
            </div>
            <span>4. ใบเกียรติบัตร</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN STEP CONTENT CONTAINER                                    */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        
        {/* STEP 1: STUDY MODULE SLIDES */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    MODULE {activeSlideIndex + 1} OF {slides.length}
                  </span>
                  <h2 className="text-lg sm:text-2xl font-extrabold text-white mt-1">
                    {currentSlide.title}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-300">~{course.duration || '15 นาที'}</span>
                </div>
              </div>

              {/* Slide Content */}
              <div className="space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed">
                <p className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60">
                  {currentSlide.content || currentSlide.description}
                </p>

                {currentSlide.keyTakeaways && currentSlide.keyTakeaways.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>หัวใจสำคัญของการเรียนรู้ (Key Principles):</span>
                    </h3>
                    <ul className="space-y-2">
                      {currentSlide.keyTakeaways.map((takeaway: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Slide Navigation & Complete Study Button */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/80">
                <button
                  onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeSlideIndex === 0}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>ย้อนกลับ</span>
                </button>

                {activeSlideIndex + 1 < slides.length ? (
                  <button
                    onClick={() => setActiveSlideIndex(prev => prev + 1)}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-cyan-600/30 cursor-pointer transition-all"
                  >
                    <span>ถัดไป</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleProceedToExam}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all animate-pulse"
                  >
                    <span>เรียนจบแล้ว ➔ เริ่มทำข้อสอบทันที</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: AUTO-ADVANCE EXAM */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            {examScore !== null && examScore < passingScore ? (
              // Failed Screen with 1-Click Retake
              <div className="bg-slate-800/90 border border-rose-500/50 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    คะแนนสอบ: {examScore} / {totalQuestions} (ยังไม่ผ่านเกณฑ์)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    เกณฑ์การผ่านคือ {passingScore} ข้อขึ้นไป (80%) กรุณากดสอบใหม่อีกครั้งเพื่อรับใบเกียรติบัตร
                  </p>
                </div>
                <button
                  onClick={handleRetakeExam}
                  className="py-3 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30 flex items-center gap-2 mx-auto cursor-pointer text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ทำแบบทดสอบใหม่อีกครั้ง (ครั้งที่ {attemptsCount + 1})</span>
                </button>
              </div>
            ) : (
              // Active Question Card with Auto-Advance on Click
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 text-xs">
                  <span className="font-mono text-cyan-400 font-bold">
                    ข้อที่ {currentQuestionIndex + 1} จาก {questions.length} ข้อ
                  </span>
                  <span className="text-slate-400">
                    เกณฑ์ผ่าน: {passingScore}/{totalQuestions}
                  </span>
                </div>

                {/* Question Text */}
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {questions[currentQuestionIndex]?.question}
                </h3>

                {/* Choices (1-Click Auto-Advance) */}
                <div className="space-y-2.5">
                  {questions[currentQuestionIndex]?.options.map((opt: string, cIndex: number) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === cIndex;
                    return (
                      <button
                        key={cIndex}
                        onClick={() => handleSelectAnswer(currentQuestionIndex, cIndex)}
                        disabled={isAnswerSelected}
                        className={`w-full p-3.5 sm:p-4 rounded-2xl text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer border ${
                          isSelected
                            ? 'bg-cyan-600/30 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                            : 'bg-slate-900/60 hover:bg-slate-900 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {['A', 'B', 'C', 'D'][cIndex]}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: 5-STAR SATISFACTION SURVEY */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="text-center space-y-2 border-b border-slate-700/80 pb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  ยินดีด้วย! คุณสอบผ่านเกณฑ์ {examScore}/{totalQuestions} ข้อ
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  แบบประเมินความพึงพอใจการฝึกอบรม (กดส่งเพื่อบันทึกผลลงระบบและรับใบเกียรติบัตรทันที)
                </p>
              </div>

              {/* 4 Standard Survey Rating Questions */}
              <div className="space-y-4">
                {[
                  { id: 'sq1', label: '1. เนื้อหาหลักสูตรมีความชัดเจน เข้าใจง่าย และตรงกับงานที่ปฏิบัติ' },
                  { id: 'sq2', label: '2. สื่อการเรียนรู้และคำถามทดสอบมีความน่าสนใจและทันสมัย' },
                  { id: 'sq3', label: '3. สามารถนำความรู้และทักษะที่ได้ไปประยุกต์ใช้เพื่อความปลอดภัยและคุณภาพงาน' },
                  { id: 'sq4', label: '4. ความพึงพอใจในภาพรวมต่อศูนย์ฝึกอบรม TCT Academy' }
                ].map((item) => (
                  <div key={item.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-slate-200">
                      {item.label}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(item.id, star)}
                          className="p-1 text-slate-600 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${surveyRatings[item.id] >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                        </button>
                      ))}
                      <span className="text-xs text-amber-300 font-bold ml-2">
                        {surveyRatings[item.id]} ดาว
                      </span>
                    </div>
                  </div>
                ))}

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                    ข้อเสนอแนะเพิ่มเติมเพื่อการพัฒนา (ถ้ามี):
                  </label>
                  <textarea
                    value={surveyComment}
                    onChange={(e) => setSurveyComment(e.target.value)}
                    placeholder="ระบุข้อคิดเห็นเพื่อการปรับปรุงหลักสูตร..."
                    rows={2}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Submit Survey & Issue Certificate */}
              <button
                onClick={handleSubmitSurvey}
                disabled={isSubmittingRecord}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base disabled:opacity-50"
              >
                {isSubmittingRecord ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>กำลังบันทึกข้อมูลลงฐานข้อมูล Firestore 100%...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    <span>ยืนยันส่งผลประเมิน & ออกใบเกียรติบัตรทันที</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: VERIFIED A4 CERTIFICATE (PRINT READY) */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Action Bar */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>ออกใบเกียรติบัตรสำเร็จ (บันทึกลง Firestore เรียบร้อย)</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    เลขที่อ้างอิง: <span className="font-mono text-cyan-300">{certificateId}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePrintCertificate}
                  className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                  title="เปิดหน้าต่างใหม่เพื่อสั่งพิมพ์กระดาษ A4 แบบเต็มหน้า"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์ใบเกียรติบัตร A4</span>
                </button>
                <button
                  onClick={handleDownloadCertificate}
                  className="py-2.5 px-3 rounded-xl font-semibold text-slate-200 bg-slate-700 hover:bg-slate-600 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                  title="ดาวน์โหลดไฟล์สำรองสำหรับดูและพิมพ์"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลด</span>
                </button>
                <button
                  onClick={onBackToCourses}
                  className="py-2.5 px-3 rounded-xl font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all text-xs cursor-pointer"
                >
                  กลับหน้ารวมวิชา
                </button>
              </div>
            </div>

            {/* ======================================================== */}
            {/* OFFICIAL A4 CERTIFICATE CANVAS (LANDSCAPE A4)            */}
            {/* ======================================================== */}
            <div 
              ref={certificatePrintRef}
              className="bg-white text-slate-900 rounded-3xl p-6 sm:p-12 shadow-2xl border-8 border-double border-amber-600/50 relative overflow-hidden"
              style={{ minHeight: '180mm' }}
            >
              {/* Inner Decorative Golden Border */}
              <div className="border border-amber-500/30 p-6 sm:p-8 rounded-2xl relative text-center space-y-6">
                
                {/* Header Logo & Academy */}
                <div className="space-y-1">
                  <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                    {settings.companyNameEn || 'TEIJIN CORD (THAILAND) CO., LTD.'}
                  </div>
                  <h2 className="text-base sm:text-xl font-extrabold text-[#005A9C]">
                    {settings.companyName}
                  </h2>
                  <div className="inline-block bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full mt-1">
                    {settings.centerName}
                  </div>
                </div>

                {/* Certificate Title */}
                <div className="space-y-1 pt-2">
                  <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-serif">
                    ใบประกาศนียบัตรรับรองการฝึกอบรม
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 tracking-widest uppercase">
                    CERTIFICATE OF TRAINING COMPLETION
                  </p>
                </div>

                <div className="text-xs sm:text-sm text-slate-500 italic">
                  ใบประกาศนียบัตรฉบับนี้ออกให้เพื่อแสดงว่า
                </div>

                {/* Employee Name */}
                <div className="py-2">
                  <h3 className="text-xl sm:text-3xl font-black text-[#005A9C] border-b-2 border-amber-500/40 inline-block pb-1 px-6">
                    {employee.fullName}
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                    รหัสพนักงาน: <span className="font-bold">{employee.empId}</span> • แผนก: <span className="font-bold">{employee.department}</span>
                  </div>
                </div>

                {/* Course Name */}
                <div className="space-y-1 py-1">
                  <p className="text-xs sm:text-sm text-slate-600">
                    ได้ผ่านการฝึกอบรมและทดสอบวัดผลสัมฤทธิ์ในหลักสูตร
                  </p>
                  <h4 className="text-base sm:text-xl font-bold text-slate-900 px-4">
                    {course.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    รหัสหลักสูตร: {course.code} • คะแนนการทดสอบ: {examScore}/{totalQuestions} (ผ่านเกณฑ์มาตรฐาน)
                  </p>
                </div>

                {/* Date */}
                <div className="text-xs sm:text-sm text-slate-600">
                  ให้ไว้ ณ วันที่ {completionDate || new Date().toLocaleDateString('th-TH')}
                </div>

                {/* 3 Official Signatories */}
                <div className="pt-8 grid grid-cols-3 gap-2 sm:gap-6 border-t border-slate-200 mt-6 text-center">
                  {/* Signatory 1 */}
                  <div className="space-y-1">
                    <div className="h-10 flex items-end justify-center font-serif italic text-sm text-slate-700">
                      (ลงนามอิเล็กทรอนิกส์)
                    </div>
                    <div className="border-t border-slate-400 pt-1">
                      <div className="text-[11px] sm:text-xs font-bold text-slate-900">
                        {settings.signatory1Name}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {settings.signatory1Position}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {settings.signatory1Role}
                      </div>
                    </div>
                  </div>

                  {/* Signatory 2 */}
                  <div className="space-y-1">
                    <div className="h-10 flex items-end justify-center font-serif italic text-sm text-slate-700">
                      (ลงนามอิเล็กทรอนิกส์)
                    </div>
                    <div className="border-t border-slate-400 pt-1">
                      <div className="text-[11px] sm:text-xs font-bold text-slate-900">
                        {settings.signatory2Name}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {settings.signatory2Position}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {settings.signatory2Role}
                      </div>
                    </div>
                  </div>

                  {/* Signatory 3 */}
                  <div className="space-y-1">
                    <div className="h-10 flex items-end justify-center font-serif italic text-sm text-slate-700 font-bold text-blue-900">
                      (ลงนามรับรองทางการ)
                    </div>
                    <div className="border-t border-slate-400 pt-1">
                      <div className="text-[11px] sm:text-xs font-bold text-slate-900">
                        {settings.signatory3Name}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {settings.signatory3Position}
                      </div>
                      <div className="text-[9px] text-slate-400 font-semibold">
                        {settings.signatory3Role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Control Footer */}
                <div className="pt-4 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                  <span>Document No. {settings.docControlNo || 'PS-TR-00-05'}</span>
                  <span>Ref: {certificateId}</span>
                  <span>TCT Academy Verified E-Certificate</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
