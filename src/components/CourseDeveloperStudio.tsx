import React, { useState } from 'react';
import { Course, CourseModule, Question, Choice } from '../types';
import { 
  getStoredCustomCourses, 
  saveCustomCourse, 
  deleteCustomCourse, 
  CustomCourseData 
} from '../utils/courseManager';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  Tv, 
  FileQuestion, 
  Sparkles, 
  CheckCircle2, 
  Layers,
  Award
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

interface CourseDeveloperStudioProps {
  onCourseCreatedOrUpdated?: () => void;
}

interface EditableModule {
  id: number;
  thaiTitle: string;
  description: string;
  youtubeUrl: string;
  durationMinutes: number;
}

interface EditableQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctChoiceIndex: number;
  explanation: string;
}

export const CourseDeveloperStudio: React.FC<CourseDeveloperStudioProps> = ({
  onCourseCreatedOrUpdated
}) => {
  const [customCourses, setCustomCourses] = useState<CustomCourseData[]>(() => getStoredCustomCourses());
  const [isCreating, setIsCreating] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<{ id: string; title: string } | null>(null);

  // Course Basic Information
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSlug, setCourseSlug] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseBadge, setCourseBadge] = useState('หลักสูตรพัฒนาบุคลากร');
  const [passingScore, setPassingScore] = useState<number>(8);
  const [developerName, setDeveloperName] = useState('ฝ่ายพัฒนาหลักสูตร TCT');

  // Modules List
  const [modules, setModules] = useState<EditableModule[]>([
    {
      id: 1,
      thaiTitle: 'บทที่ 1: หลักการและแนวทางปฏิบัติเบื้องต้น',
      description: 'เรียนรู้แนวคิดและมาตรฐานการปฏิบัติงานที่ถูกต้อง',
      youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      durationMinutes: 10
    }
  ]);

  // Questions List
  const [questions, setQuestions] = useState<EditableQuestion[]>([
    {
      id: 1,
      questionText: 'ข้อใดเป็นเป้าหมายสำคัญที่สุดในการควบคุมคุณภาพและความปลอดภัยในการทำงาน?',
      options: [
        'การส่งมอบสินค้าตรงเวลาและไร้อุบัติเหตุ (Zero Defect & Zero Accident)',
        'การเพิ่มต้นทุนการผลิตให้สูงสุด',
        'การลดขั้นตอนการตรวจสอบเพื่อประหยัดเวลา',
        'การทำงานโดยไม่ต้องสวมใส่อุปกรณ์ PPE'
      ],
      correctChoiceIndex: 0,
      explanation: 'เป้าหมายสูงสุดคือคุณภาพสินค้าที่สมบูรณ์และพนักงานปฏิบัติงานอย่างปลอดภัย 100%'
    },
    {
      id: 2,
      questionText: 'เมื่อพบจุดผิดปกติหรือความเสี่ยงในสายการผลิต ควรดำเนินการอย่างไรเป็นอันดับแรก?',
      options: [
        'หยุด แจ้ง ปรึกษาหัวหน้างานทันที (Stop, Call, Wait)',
        'ปล่อยผ่านไปก่อนจนกว่างานจะเสร็จสิ้น',
        'พยายามแก้ไขเองโดยไม่แจ้งใคร',
        'บันทึกไว้ในใจแล้วกลับบ้าน'
      ],
      correctChoiceIndex: 0,
      explanation: 'หลักการ Stop Call Wait ช่วยระงับความเสียหายและป้องกันอุบัติเหตุรุนแรงได้อย่างทันท่วงที'
    },
    {
      id: 3,
      questionText: 'การบำรุงรักษาเชิงป้องกัน (Preventive Maintenance) มีประโยชน์อย่างไร?',
      options: [
        'ช่วยป้องกันเครื่องจักรหยุดทำงานฉุกเฉินและยืดอายุการใช้งาน',
        'ทำให้เครื่องจักรทำงานช้าลง',
        'เพิ่มค่าใช้จ่ายในการซ่อมแซมฉุกเฉิน',
        'ไม่ช่วยให้เกิดประโยชน์ใดๆ'
      ],
      correctChoiceIndex: 0,
      explanation: 'การบำรุงรักษาเชิงป้องกันช่วยตรวจพบความเสื่อมสภาพก่อนเกิดความเสียหายร้ายแรง'
    }
  ]);

  const [notification, setNotification] = useState('');

  const handleAddModule = () => {
    playCyberClick();
    const newId = modules.length + 1;
    setModules([
      ...modules,
      {
        id: newId,
        thaiTitle: `บทที่ ${newId}: หัวข้อการเรียนรู้`,
        description: 'สาระสำคัญและแนวทางปฏิบัติ',
        youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        durationMinutes: 10
      }
    ]);
  };

  const handleRemoveModule = (index: number) => {
    playCyberClick();
    if (modules.length <= 1) return;
    setModules(modules.filter((_, idx) => idx !== index));
  };

  const handleAddQuestion = () => {
    playCyberClick();
    const newId = questions.length + 1;
    setQuestions([
      ...questions,
      {
        id: newId,
        questionText: `ข้อที่ ${newId}: ระบุคำถามแบบทดสอบที่นี่...`,
        options: [
          'ตัวเลือกที่ 1 (คำตอบที่ถูกต้อง)',
          'ตัวเลือกที่ 2',
          'ตัวเลือกที่ 3',
          'ตัวเลือกที่ 4'
        ],
        correctChoiceIndex: 0,
        explanation: 'ระบุคำอธิบายเหตุผลของข้อที่ถูกต้อง'
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    playCyberClick();
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      setNotification('กรุณาระบุชื่อหลักสูตร');
      return;
    }

    const finalSlug = (courseSlug.trim() || courseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')).toLowerCase();

    // 1. Convert to standard Course
    const standardCourse: Course = {
      id: finalSlug,
      title: courseTitle.trim(),
      thaiTitle: courseTitle.trim(),
      titleEn: courseTitle.trim(),
      code: `TCT-${finalSlug.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'MOD'}-01`,
      description: courseDescription.trim() || 'หลักสูตรพัฒนาศักยภาพและความรู้เฉพาะทางสำหรับพนักงาน',
      moduleCount: modules.length,
      estimatedHours: Math.max(1, Math.round(modules.reduce((acc, m) => acc + (m.durationMinutes || 30), 0) / 60)),
      passingScore: passingScore || 80,
      passingCriteria: `≥ ${passingScore || 80}%`,
      badge: courseBadge || 'หลักสูตรฝึกอบรม',
      color: 'from-emerald-500 via-teal-600 to-cyan-600'
    };

    // 2. Convert to standard CourseModule[]
    const standardModules: CourseModule[] = modules.map((m) => ({
      id: m.id,
      courseId: finalSlug,
      title: m.thaiTitle,
      thaiTitle: m.thaiTitle,
      description: m.description,
      durationMinutes: m.durationMinutes,
      badge: `บทที่ ${m.id}`,
      color: 'from-cyan-500 to-blue-600',
      summaryPoints: [m.description],
      sections: [
        {
          id: `sec-${m.id}-1`,
          title: m.thaiTitle,
          content: [m.description],
          keyHighlight: 'ความปลอดภัยและคุณภาพต้องมาเป็นอันดับหนึ่ง'
        }
      ],
      quizQuestionIds: [m.id],
      youtubeUrl: m.youtubeUrl,
      videoTitle: m.thaiTitle,
      videoDurationSec: m.durationMinutes * 60
    }));

    // 3. Convert to standard Question[]
    const choiceIds = ['a', 'b', 'c', 'd'];
    const standardQuestions: Question[] = questions.map((q) => {
      const choices: Choice[] = q.options.map((opt, optIdx) => ({
        id: choiceIds[optIdx] || `opt-${optIdx}`,
        text: opt,
        isCorrect: optIdx === q.correctChoiceIndex
      }));

      return {
        id: q.id,
        moduleId: 1,
        questionText: q.questionText,
        choices,
        explanation: q.explanation
      };
    });

    const payload: CustomCourseData = {
      course: standardCourse,
      modules: standardModules,
      questions: standardQuestions,
      createdAt: new Date().toLocaleDateString('th-TH'),
      createdBy: developerName || 'Course Developer',
      passingScore
    };

    saveCustomCourse(payload);
    playSuccessChime();
    setCustomCourses(getStoredCustomCourses());
    setIsCreating(false);
    setNotification(`บันทึกหลักสูตร "${courseTitle}" สำเร็จเรียบร้อย สามารถเปิดให้พนักงานเข้าเรียนได้ทันที`);
    if (onCourseCreatedOrUpdated) onCourseCreatedOrUpdated();
  };

  const executeDeleteCourse = () => {
    if (!deletingCourse) return;
    playCyberClick();
    deleteCustomCourse(deletingCourse.id);
    setCustomCourses(getStoredCustomCourses());
    setNotification(`ลบหลักสูตร "${deletingCourse.title}" เรียบร้อยแล้ว`);
    setDeletingCourse(null);
    if (onCourseCreatedOrUpdated) onCourseCreatedOrUpdated();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-[#090E1A] border border-cyan-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400">COURSE DEVELOPER STUDIO</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono">
                  AUTHORING SUITE 4.0
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                ส่วนนักพัฒนาหลักสูตร & จัดการเนื้อหาฝึกอบรม
              </h2>
              <p className="text-xs text-slate-400">
                สร้างหลักสูตรใหม่ กำหนดบทเรียน วิดีโอ YouTube ข้อสอบ Pre/Post Test และเกณฑ์ผ่าน
              </p>
            </div>
          </div>

          {!isCreating && (
            <button
              onClick={() => {
                playCyberClick();
                setIsCreating(true);
                setCourseTitle('');
                setCourseSlug(`course-${Date.now().toString().slice(-4)}`);
                setCourseDescription('');
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างหลักสูตรใหม่ (Create Course)</span>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification('')}
            className="text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Course Creator Form */}
      {isCreating ? (
        <form onSubmit={handleSaveCourse} className="bg-[#0A0F1D] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>สร้างหลักสูตรฝึกอบรมใหม่ (New Course Authoring)</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-white bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer"
            >
              ยกเลิก
            </button>
          </div>

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
              1. ข้อมูลทั่วไปของหลักสูตร (General Information)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อหลักสูตร (Course Title) *
                </label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="เช่น การบริหารความปลอดภัยในงานซ่อมบำรุงขั้นสูง"
                  className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  รหัสหลักสูตร / Slug (Course ID)
                </label>
                <input
                  type="text"
                  value={courseSlug}
                  onChange={(e) => setCourseSlug(e.target.value)}
                  placeholder="เช่น tct-safety-advanced"
                  className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                คำอธิบายสาระสำคัญของหลักสูตร (Description)
              </label>
              <textarea
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="ระบุเนื้อหาภาพรวม ประโยชน์ และเป้าหมายที่ผู้เรียนจะได้รับ..."
                rows={2}
                className="w-full bg-[#050A14] border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ป้ายกำกับ (Badge)
                </label>
                <input
                  type="text"
                  value={courseBadge}
                  onChange={(e) => setCourseBadge(e.target.value)}
                  placeholder="เช่น หลักสูตรความปลอดภัย 2026"
                  className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  เกณฑ์ผ่านขั้นต่ำ (ข้อ)
                </label>
                <select
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value={7}>7 / 10 (70%)</option>
                  <option value={8}>8 / 10 (80% - มาตรฐาน TCT)</option>
                  <option value={9}>9 / 10 (90% - ขั้นสูง)</option>
                  <option value={10}>10 / 10 (100% เต็ม)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อผู้พัฒนาหลักสูตร
                </label>
                <input
                  type="text"
                  value={developerName}
                  onChange={(e) => setDeveloperName(e.target.value)}
                  className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Modules & Video URLs */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider flex items-center gap-2">
                <Tv className="w-4 h-4" />
                <span>2. บทเรียนและวิดีโอ (Modules & Media - บังคับดูครบ 100%)</span>
              </div>
              <button
                type="button"
                onClick={handleAddModule}
                className="text-xs text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มบทเรียน</span>
              </button>
            </div>

            <div className="space-y-3">
              {modules.map((mod, mIdx) => (
                <div key={mIdx} className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 font-mono">
                      บทเรียนที่ {mIdx + 1} (Module {mIdx + 1})
                    </span>
                    {modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveModule(mIdx)}
                        className="text-red-400 hover:text-red-300 text-xs p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">ชื่อบทเรียน (ไทย)</label>
                      <input
                        type="text"
                        value={mod.thaiTitle}
                        onChange={(e) => {
                          const updated = [...modules];
                          updated[mIdx].thaiTitle = e.target.value;
                          setModules(updated);
                        }}
                        className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">ลิงก์วิดีโอ YouTube (URL / Embed)</label>
                      <input
                        type="text"
                        value={mod.youtubeUrl}
                        onChange={(e) => {
                          const updated = [...modules];
                          updated[mIdx].youtubeUrl = e.target.value;
                          setModules(updated);
                        }}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono text-cyan-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">สาระสำคัญประจำบท</label>
                    <input
                      type="text"
                      value={mod.description}
                      onChange={(e) => {
                        const updated = [...modules];
                        updated[mIdx].description = e.target.value;
                        setModules(updated);
                      }}
                      className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Pre/Post Test Questions */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider flex items-center gap-2">
                <FileQuestion className="w-4 h-4" />
                <span>3. ข้อสอบวัดผลก่อน/หลังเรียน (Pre/Post Test Questions - {questions.length} ข้อ)</span>
              </div>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-xs text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มข้อสอบ</span>
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">
                      ข้อที่ {qIdx + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-red-400 hover:text-red-300 text-xs p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">โจทย์คำถาม</label>
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIdx].questionText = e.target.value;
                        setQuestions(updated);
                      }}
                      className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctChoiceIndex === optIdx}
                          onChange={() => {
                            const updated = [...questions];
                            updated[qIdx].correctChoiceIndex = optIdx;
                            setQuestions(updated);
                          }}
                          className="accent-cyan-400 cursor-pointer"
                          title="เลือกเป็นข้อที่ถูกต้อง"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIdx].options[optIdx] = e.target.value;
                            setQuestions(updated);
                          }}
                          placeholder={`ตัวเลือก ${optIdx + 1}`}
                          className={`w-full border rounded-xl px-3 py-1.5 text-xs text-white ${
                            q.correctChoiceIndex === optIdx
                              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                              : 'bg-[#050A14] border-slate-800'
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">คำอธิบายเฉลยละเอียด</label>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIdx].explanation = e.target.value;
                        setQuestions(updated);
                      }}
                      className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Submit */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-cyan-500/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกและเปิดใช้งานหลักสูตรทันที</span>
            </button>
          </div>
        </form>
      ) : (
        /* Custom Courses List */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>หลักสูตรที่สร้างขึ้นเองโดยผู้พัฒนา ({customCourses.length} หลักสูตร)</span>
            <span className="font-mono text-cyan-400">ระบบบันทึกและซิงค์อัตโนมัติ</span>
          </div>

          {customCourses.length === 0 ? (
            <div className="p-12 text-center bg-[#0A0F1D] rounded-3xl border border-slate-800 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-slate-300 font-semibold text-sm">ยังไม่มีหลักสูตรที่สร้างขึ้นเอง</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                ปัจจุบันมีหลักสูตรเริ่มต้น 2 หลักสูตรในระบบ คุณสามารถกดปุ่ม "สร้างหลักสูตรใหม่" ด้านบนเพื่อเพิ่มวิชาฝึกอบรมสำหรับพนักงานได้ทันที
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customCourses.map((c) => (
                <div 
                  key={c.course.id}
                  className="bg-[#0A0F1D] border border-cyan-500/40 rounded-3xl p-5 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {c.course.badge}
                    </span>
                    <button
                      onClick={() => {
                        playCyberClick();
                        setDeletingCourse({ id: c.course.id, title: c.course.title });
                      }}
                      className="text-red-400 hover:text-red-300 p-1.5 bg-red-950/50 hover:bg-red-900/80 rounded-lg transition-colors cursor-pointer"
                      title="ลบหลักสูตรนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-white">{c.course.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{c.course.description}</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] font-mono">
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">บทเรียน</span>
                      <strong className="text-white">{c.modules.length} บท</strong>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">ข้อสอบ</span>
                      <strong className="text-white">{c.questions.length} ข้อ</strong>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">เกณฑ์ผ่าน</span>
                      <strong className="text-emerald-400">{c.passingScore} ข้อ</strong>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-800">
                    <span>สร้างเมื่อ: {c.createdAt}</span>
                    <span>โดย: {c.createdBy}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🔴 In-App Modal: Confirm Delete Course */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0f172a] border-2 border-rose-500/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">ยืนยันการลบหลักสูตร</h3>
                <p className="text-xs text-rose-300">
                  คุณแน่ใจหรือไม่ว่าต้องการลบหลักสูตร <strong className="text-white">"{deletingCourse.title}"</strong> ออกจากระบบ?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCourse(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={executeDeleteCourse}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันการลบหลักสูตร</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
