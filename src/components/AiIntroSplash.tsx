import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  BookOpen,
  Award,
  ChevronRight,
  Lock,
  GraduationCap,
  CheckCircle2,
  Users
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { ThaiMOOCLogo } from './ThaiMOOCLogo';

interface AiIntroSplashProps {
  onEnter: () => void;
  onSelectCourse?: (courseId: string) => void;
  onOpenAdmin?: () => void;
}

export const AiIntroSplash: React.FC<AiIntroSplashProps> = ({ onEnter, onSelectCourse, onOpenAdmin }) => {
  const handleStart = () => {
    playSuccessChime();
    onEnter();
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between items-center relative overflow-x-hidden font-sarabun m-0 p-0">
      {/* TCT Top Utility Bar - Full Bleed Edge-to-Edge */}
      <div className="w-full bg-[#002855] text-white text-[11px] py-1 px-3 sm:px-6 border-b border-[#003875] shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="bg-[#DC2626] text-white font-extrabold px-1.5 sm:px-2 py-0.5 rounded text-[10px] shrink-0">
              TCT E-TRAINING
            </span>
            <span className="text-blue-100 text-[10px] sm:text-xs truncate">
              ศูนย์ฝึกอบรมและพัฒนา TCT Academy
            </span>
            <span className="text-amber-300 font-semibold hidden md:inline truncate text-[10px] sm:text-[11px]">
              • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
            </span>
          </div>
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-[10px] sm:text-xs shrink-0">
            <span className="hidden sm:inline">แผนกบุคคลและธุรการ Personnel</span>
            <span className="hidden sm:inline">•</span>
            <span>TEIJIN CORD (THAILAND)</span>
          </div>
        </div>
      </div>

      {/* Top Header Bar - Full Bleed Edge-to-Edge */}
      <header className="w-full border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-xs shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <ThaiMOOCLogo size="md" showSubtitle={true} theme="light" />

          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenAdmin && (
              <button
                onClick={() => {
                  playCyberClick();
                  onOpenAdmin();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">ระบบผู้ดูแล (Admin)</span>
                <span className="sm:hidden">แอดมิน</span>
              </button>
            )}

            <button
              onClick={handleStart}
              className="text-xs font-bold text-white bg-[#005A9C] hover:bg-[#00487C] px-3.5 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-900/10"
            >
              <span>เข้าสู่ระบบเรียน</span>
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Center TCT Hero Presentation - Fills Screen Naturally */}
      <main className="w-full flex-1 flex flex-col items-center justify-center py-6 sm:py-10 px-3 sm:px-6 z-10 my-auto animate-fadeIn">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-5 sm:space-y-6">
          
          {/* Department Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#005A9C] text-xs sm:text-sm font-bold shadow-xs">
            <GraduationCap className="w-4 h-4 text-[#005A9C] shrink-0" />
            <span className="truncate">ระบบฝึกอบรมและเรียนรู้ออนไลน์ TCT E-Training • แผนกบุคคลและธุรการ</span>
          </div>

          {/* Title Headline */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#002855] tracking-tight leading-tight">
              เรียนรู้ออนไลน์ได้ทุกที่ ทุกเวลา
            </h1>
            <h2 className="text-lg sm:text-2xl font-bold text-[#005A9C]">
              ศูนย์ฝึกอบรมและพัฒนา TCT Academy
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
              ศูนย์รวมรายวิชาพัฒนาทักษะวิชาชีพ ความปลอดภัย และมาตรฐานคุณภาพ โดย
              แผนกบุคคลและธุรการ (Personnel & Admin Department) บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl pt-1">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">เนื้อหากระชับ</div>
                <div className="text-[11px] text-slate-500">วิดีโอ & Quiz ท้ายบท</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">เกียรติบัตรทางการ</div>
                <div className="text-[11px] text-slate-500">ออกใบรับรอง A4 ทันที</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">บันทึกอัตโนมัติ</div>
                <div className="text-[11px] text-slate-500">เชื่อมโยงระบบบุคคล HR</div>
              </div>
            </div>
          </div>

          {/* Enter System Action Button (Primary CTA) */}
          <div className="pt-2 w-full sm:w-auto">
            <button
              id="btn-splash-enter-login"
              onClick={handleStart}
              className="w-full sm:w-auto group inline-flex items-center justify-center px-6 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white transition-all bg-[#005A9C] hover:bg-[#00487C] rounded-2xl shadow-lg shadow-blue-900/20 hover:scale-102 active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
                <span>เข้าสู่หน้าเลือกรายวิชา (Explore Courses)</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </button>
          </div>

        </div>
      </main>

      {/* Footer - Full Bleed Edge-to-Edge */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-3 sm:px-6 text-[11px] text-slate-500 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-bold text-slate-700">© 2026 บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
            <span className="hidden sm:inline">•</span>
            <span>แผนกบุคคลและธุรการ (Personnel & Admin Department)</span>
          </div>
          <div className="flex items-center gap-3 font-medium text-[11px] text-slate-600 justify-center">
            <span>TCT E-TRAINING PLATFORM</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ระบบออนไลน์พร้อมใช้งาน
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
