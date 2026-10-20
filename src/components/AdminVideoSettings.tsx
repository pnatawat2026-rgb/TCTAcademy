import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  HelpCircle, 
  Sparkles, 
  Film, 
  Lock, 
  Layers, 
  BookOpen,
  Info,
  Check
} from 'lucide-react';
import { 
  getModuleVideoConfig, 
  saveModuleVideoConfig, 
  resetModuleVideosToDefault, 
  extractYouTubeId, 
  isNotebookLMUrl,
  ModuleVideoConfig 
} from '../utils/videoManager';
import { getCourseModules, getAllAvailableCourses } from '../utils/courseManager';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

export const AdminVideoSettings: React.FC = () => {
  const allCourses = getAllAvailableCourses();
  // Default to KYT or APM as AI course has no videos
  const [selectedCourseId, setSelectedCourseId] = useState<string>('kyt-shisa-kanko');

  const currentModules = getCourseModules(selectedCourseId);

  const [videoConfigs, setVideoConfigs] = useState<Record<number, ModuleVideoConfig>>(() => {
    const initial: Record<number, ModuleVideoConfig> = {};
    const mods = getCourseModules('kyt-shisa-kanko');
    mods.forEach((m) => {
      initial[m.id] = getModuleVideoConfig(m.id, 'kyt-shisa-kanko');
    });
    return initial;
  });

  const [activePreviewModuleId, setActivePreviewModuleId] = useState<number>(1);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // When selected course changes, reload configs
  useEffect(() => {
    const nextConfigs: Record<number, ModuleVideoConfig> = {};
    const mods = getCourseModules(selectedCourseId);
    mods.forEach((m) => {
      nextConfigs[m.id] = getModuleVideoConfig(m.id, selectedCourseId);
    });
    setVideoConfigs(nextConfigs);
    setActivePreviewModuleId(mods[0]?.id || 1);
  }, [selectedCourseId]);

  const handleUrlChange = (moduleId: number, val: string) => {
    if (selectedCourseId === 'ai-for-tct') return;
    setVideoConfigs((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || getModuleVideoConfig(moduleId, selectedCourseId)),
        youtubeUrl: val,
        videoId: extractYouTubeId(val)
      }
    }));
  };

  const handleTitleChange = (moduleId: number, val: string) => {
    setVideoConfigs((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || getModuleVideoConfig(moduleId, selectedCourseId)),
        title: val
      }
    }));
  };

  const handleSaveModule = (moduleId: number) => {
    playCyberClick();
    if (selectedCourseId === 'ai-for-tct') {
      setSuccessToast(`หลักสูตร AI for TCT นำวิดีโอออกทั้งหมดแล้ว`);
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }
    const conf = videoConfigs[moduleId] || getModuleVideoConfig(moduleId, selectedCourseId);
    saveModuleVideoConfig(
      moduleId, 
      conf.youtubeUrl, 
      selectedCourseId, 
      conf.title, 
      conf.durationLabel, 
      conf.description
    );
    playSuccessChime();
    setSuccessToast(`บันทึกลิงก์วิดีโอบทเรียนที่ ${moduleId} สำหรับหลักสูตรนี้เรียบร้อยแล้ว!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSaveAll = () => {
    playCyberClick();
    if (selectedCourseId === 'ai-for-tct') {
      setSuccessToast(`หลักสูตร AI for TCT นำวิดีโอออกทั้งหมดแล้ว`);
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }
    currentModules.forEach((m) => {
      const conf = videoConfigs[m.id] || getModuleVideoConfig(m.id, selectedCourseId);
      saveModuleVideoConfig(
        m.id, 
        conf.youtubeUrl, 
        selectedCourseId, 
        conf.title, 
        conf.durationLabel, 
        conf.description
      );
    });
    playSuccessChime();
    setSuccessToast(`บันทึกลิงก์วิดีโอทั้ง ${currentModules.length} บทเรียนเรียบร้อยแล้ว!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleResetToDefault = () => {
    playCyberClick();
    resetModuleVideosToDefault();
    const resetConf: Record<number, ModuleVideoConfig> = {};
    currentModules.forEach((m) => {
      resetConf[m.id] = getModuleVideoConfig(m.id, selectedCourseId);
    });
    setVideoConfigs(resetConf);
    playSuccessChime();
    setSuccessToast('รีเซ็ตลิงก์วิดีโอกลับเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const isAICourse = selectedCourseId === 'ai-for-tct';

  return (
    <div className="space-y-6 font-sarabun text-slate-800 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
              <Tv className="w-6 h-6 text-[#002D5A]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#002D5A] border border-blue-200">
                  E-LEARNING VIDEO CMS
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  TCT ACADEMY 2026
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                จัดการและตั้งค่าลิงก์วิดีโอประจำแต่ละบทเรียน
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                รองรับ YouTube Video URLs และไฟล์วิดีโอ MP4 ประจำบทเรียน พร้อมระบบตรวจจับการรับชมจบอัตโนมัติ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={handleResetToDefault}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-3.5 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="รีเซ็ตกลับเป็นค่าเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่าเริ่มต้น</span>
            </button>
            {!isAICourse && (
              <button
                onClick={handleSaveAll}
                className="bg-[#002D5A] hover:bg-[#001D3D] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกทั้งหมด ({currentModules.length} บท)</span>
              </button>
            )}
          </div>
        </div>

        {/* Course Selector Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            เลือกหลักสูตรที่ต้องการจัดการวิดีโอ (Select Course):
          </label>
          <div className="flex flex-wrap gap-2">
            {allCourses.map((c) => {
              const isCurrent = selectedCourseId === c.id;
              const isAI = c.id === 'ai-for-tct';
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    setSelectedCourseId(c.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                    isCurrent
                      ? 'bg-[#002D5A] text-white border-[#002D5A] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{c.title}</span>
                  {isAI && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-medium border border-amber-200">
                      ไม่มีวิดีโอ
                    </span>
                  )}
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {c.moduleCount} บท
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Course Banner */}
        {isAICourse && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-950">
                หลักสูตร AI for TCT (TCT-AI-101): นำวิดีโอออกทั้งหมดตามคำสั่งผู้บริหาร
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                หลักสูตรนี้ไม่มีวิดีโอในทุกบทเรียน พนักงานจะเรียนรู้ผ่านเนื้อหาเอกสาร กิจกรรมฝึกปฏิบัติ และทำแบบทดสอบท้ายบท (Quiz) ได้ทันทีโดยไม่ต้องรับชมวิดีโอ
              </p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successToast && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
        )}
      </div>

      {/* Grid: Current Course Modules Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentModules.map((courseMod) => {
          const moduleId = courseMod.id;
          const conf = videoConfigs[moduleId] || getModuleVideoConfig(moduleId, selectedCourseId);
          const isSelectedForPreview = activePreviewModuleId === moduleId;
          const isNotebookLM = isNotebookLMUrl(conf.youtubeUrl);
          const hasVideo = conf.youtubeUrl && conf.youtubeUrl.trim() !== '';

          return (
            <div 
              key={moduleId}
              className={`rounded-2xl p-5 border transition-all space-y-4 bg-white shadow-xs ${
                isSelectedForPreview 
                  ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Module Header */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#002D5A] font-mono font-bold text-sm flex items-center justify-center border border-blue-200 shrink-0">
                    0{moduleId}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      บทที่ {moduleId}: {courseMod.thaiTitle}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono truncate max-w-xs">
                      {courseMod.title}
                    </p>
                  </div>
                </div>

                {!isAICourse && hasVideo && (
                  <button
                    type="button"
                    onClick={() => {
                      playCyberClick();
                      setActivePreviewModuleId(moduleId);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-mono flex items-center gap-1 border transition-all cursor-pointer ${
                      isSelectedForPreview
                        ? 'bg-blue-50 text-[#002D5A] border-blue-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <Play className="w-3 h-3 text-blue-700" />
                    <span>พรีวิว</span>
                  </button>
                )}
              </div>

              {/* URL Input Form */}
              <div className="space-y-3">
                {isAICourse ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>สถานะ: เอกสาร & แบบทดสอบท้ายบท (ไม่มีวิดีโอ)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      บทเรียนนี้ปลดล็อคแบบทดสอบ Quiz ให้อัตโนมัติ โดยเน้นการอ่านและทำความเข้าใจเนื้อหา
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          🔗 ลิงก์วิดีโอ (YouTube URL):
                        </label>
                        {isNotebookLM && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-[#002D5A] border border-blue-200">
                            Google NotebookLM
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={conf.youtubeUrl}
                          onChange={(e) => handleUrlChange(moduleId, e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... หรือเว้นว่างหากใช้การแนบไฟล์ MP4"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white pr-20"
                        />
                        {conf.videoId && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {conf.videoId}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        รองรับ: YouTube watch URLs, youtu.be, shorts หรือแนบไฟล์ MP4 ตรงในหน้าบทเรียน
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        📝 ชื่อหัวข้อการบรรยายในวิดีโอ:
                      </label>
                      <input
                        type="text"
                        value={conf.title}
                        onChange={(e) => handleTitleChange(moduleId, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                      />
                    </div>

                    {/* Save Single Module Button */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Film className="w-3.5 h-3.5 text-blue-700" />
                        <span>ระบบตรวจจับการรับชมเพื่อปลดล็อคข้อสอบ</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSaveModule(moduleId)}
                        className="bg-blue-50 hover:bg-blue-100 text-[#002D5A] text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>บันทึกบทที่ {moduleId}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Embedded Player Preview if Active and Not AI Course */}
              {!isAICourse && isSelectedForPreview && conf.videoId && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>ตัวอย่างหน้าจอเครื่องเล่นวิดีโอ (Live Preview):</span>
                  </div>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-200 shadow-sm">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube-nocookie.com/embed/${conf.videoId}?rel=0&playsinline=1`}
                      title={`Preview Module ${moduleId}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Informational Guidance Box */}
      <div className="rounded-2xl p-5 border border-blue-200 bg-blue-50/60 flex items-start gap-3 shadow-xs">
        <HelpCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-700">
          <h4 className="font-bold text-[#002D5A]">
            คำแนะนำสำหรับผู้ดูแลระบบ (Admin E-Learning Video Rules):
          </h4>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>
              <strong>หลักสูตร AI for TCT:</strong> ถูกนำวิดีโอออกทั้งหมดตามคำสั่งผู้บริหาร พนักงานสามารถเรียนรู้จากเนื้อหาเอกสารและทำแบบทดสอบได้ทันที
            </li>
            <li>
              <strong>หลักสูตร KYT & การชี้ปากย้ำ:</strong> รองรับการแนบไฟล์วิดีโอ MP4 จากเครื่องคอมพิวเตอร์ลงในบทเรียนแต่ละตอนได้โดยตรง (ตอนที่ 1 KYT, ตอนที่ 2 ชี้ปากย้ำ, ตอนที่ 3 Shisa)
            </li>
            <li>
              <strong>การตรวจวัดความก้าวหน้า:</strong> สำหรับหลักสูตรที่มีวิดีโอ พนักงานต้องรับชมวิดีโอให้จบตามเกณฑ์เพื่อปลดล็อคแบบทดสอบ Quiz ท้ายบท
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
