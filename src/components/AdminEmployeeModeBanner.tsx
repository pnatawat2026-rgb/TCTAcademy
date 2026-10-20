import React, { useState } from 'react';
import { UserProfile, ViewState } from '../types';
import { 
  ShieldCheck, 
  Eye, 
  ArrowLeft, 
  Zap, 
  Lock, 
  Unlock, 
  Users, 
  Building2, 
  ChevronDown, 
  CheckCircle2, 
  Sparkles, 
  Minimize2, 
  Maximize2,
  RefreshCw,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { DEPARTMENT_CODES } from '../data/courseData';
import { generateCertificateId } from '../utils/shuffle';

interface AdminEmployeeModeBannerProps {
  currentUser: UserProfile | null;
  isSystemClosed: boolean;
  onNavigateToAdmin: () => void;
  onSwitchUserProfile: (profile: UserProfile) => void;
  onInstantUnlockAll: () => void;
  onInstantResetProgress: () => void;
  onExitAdminMode: () => void;
}

export const AdminEmployeeModeBanner: React.FC<AdminEmployeeModeBannerProps> = ({
  currentUser,
  isSystemClosed,
  onNavigateToAdmin,
  onSwitchUserProfile,
  onInstantUnlockAll,
  onInstantResetProgress,
  onExitAdminMode
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  // Quick Persona Presets
  const handleSelectPreset = (presetType: 'new_trainee' | 'mid_trainee' | 'completed_trainee' | 'dept', deptCode?: string) => {
    playCyberClick();
    setIsPersonaMenuOpen(false);

    const targetDept = deptCode || currentUser?.department || 'P';

    if (presetType === 'new_trainee') {
      const newProfile: UserProfile = {
        empId: `TEST-NEW-${targetDept}`,
        fullName: `ทดสอบ พนักงานใหม่ (${targetDept})`,
        department: targetDept,
        enrolledAt: new Date().toLocaleDateString('th-TH'),
        preTestScore: null,
        preTestTotal: 10,
        postTestScore: null,
        postTestTotal: 10,
        postTestAttempts: 0,
        miniGameScore: 0,
        completedModules: [],
        evaluationSubmitted: false
      };
      onSwitchUserProfile(newProfile);
    } else if (presetType === 'mid_trainee') {
      const midProfile: UserProfile = {
        empId: `TEST-MID-${targetDept}`,
        fullName: `ทดสอบ พนักงานกำลังเรียน (${targetDept})`,
        department: targetDept,
        enrolledAt: new Date().toLocaleDateString('th-TH'),
        preTestScore: 6,
        preTestTotal: 10,
        postTestScore: null,
        postTestTotal: 10,
        postTestAttempts: 0,
        miniGameScore: 250,
        completedModules: [1, 2],
        evaluationSubmitted: false
      };
      onSwitchUserProfile(midProfile);
    } else if (presetType === 'completed_trainee') {
      const certId = generateCertificateId(`TEST-PASS-${targetDept}`);
      const passProfile: UserProfile = {
        empId: `TEST-PASS-${targetDept}`,
        fullName: `ทดสอบ พนักงานผ่านการอบรม 100% (${targetDept})`,
        department: targetDept,
        enrolledAt: new Date().toLocaleDateString('th-TH'),
        preTestScore: 7,
        preTestTotal: 10,
        postTestScore: 10,
        postTestTotal: 10,
        postTestAttempts: 1,
        miniGameScore: 400,
        completedModules: [1, 2, 3, 4],
        evaluationSubmitted: true,
        evaluationAnswers: {
          contentQuality: 5,
          understanding: 5,
          platformEase: 5,
          practicalUsage: 5,
          overallSatisfaction: 5,
          feedback: 'ระบบฝึกอบรมใช้งานง่าย วิดีโอชัดเจน ได้ประโยชน์ในการทำงานมาก'
        },
        certificateId: certId,
        certificateDate: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
      };
      onSwitchUserProfile(passProfile);
      playSuccessChime();
    } else if (presetType === 'dept' && deptCode) {
      if (currentUser) {
        onSwitchUserProfile({
          ...currentUser,
          department: deptCode,
          empId: currentUser.empId.replace(/TEST-(NEW|MID|PASS)-[A-Z]+/, `TEST-PASS-${deptCode}`) || `TCT-${deptCode}-001`
        });
      }
    }
  };

  if (isMinimized) {
    return (
      <aside 
        aria-label="Admin Preview Mode Controls"
        className="fixed bottom-20 md:bottom-4 right-3 sm:right-4 z-50 animate-bounce"
      >
        <button
          id="btn-expand-admin-banner"
          onClick={() => { playCyberClick(); setIsMinimized(false); }}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-purple-950/90 text-purple-200 border-2 border-purple-500/60 shadow-2xl backdrop-blur-md text-xs font-bold hover:bg-purple-900 cursor-pointer"
          title="คลิกเพื่อขยายแถบเครื่องมือมุมมองพนักงานของแอดมิน (Admin Preview Toolbar)"
        >
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>มุมมองพนักงาน (Admin Preview)</span>
          <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
        </button>
      </aside>
    );
  }

  return (
    <aside 
      aria-label="Admin Preview Mode Controls"
      className="relative z-[60] bg-slate-950/95 backdrop-blur-xl border-b-2 border-purple-500/60 shadow-md px-2 sm:px-4 py-1.5 font-sarabun text-slate-100 no-print"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        
        {/* Left: Mode Title & Current Test User */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 shrink-0">
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
          </div>

          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold bg-purple-950 text-purple-300 px-1.5 sm:px-2 py-0.2 rounded border border-purple-500/40">
                ADMIN PREVIEW
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-300 truncate font-semibold">
                {currentUser?.fullName ? `${currentUser.fullName} (${currentUser.department})` : 'ทดสอบพนักงาน'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Persona Menu Dropdown (Desktop/Tablet) */}
          <div className="relative hidden sm:block">
            <button
              id="btn-admin-persona-dropdown"
              type="button"
              onClick={() => { playCyberClick(); setIsPersonaMenuOpen(!isPersonaMenuOpen); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-purple-300 cursor-pointer shadow-sm"
              title="สลับสถานะผู้เรียนทดสอบ หรือสลับแผนก"
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>สลับโปรไฟล์</span>
              <ChevronDown className={`w-3 h-3 text-purple-400 transition-transform ${isPersonaMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPersonaMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-[#0B0F19] border-2 border-purple-500/80 rounded-2xl shadow-2xl overflow-hidden py-1 z-[100] animate-fadeIn text-xs divide-y divide-slate-800">
                <div className="px-3 py-1.5 bg-purple-950/70 text-[10px] font-bold text-purple-300 uppercase flex items-center justify-between">
                  <span>เลือกสถานะพนักงานที่ต้องการทดสอบ</span>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => handleSelectPreset('new_trainee')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    <div>
                      <div className="font-semibold">1. พนักงานใหม่ (0%)</div>
                      <div className="text-[10px] text-slate-400">ยังไม่ทำ Pre-test และบทเรียน</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectPreset('mid_trainee')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <div>
                      <div className="font-semibold">2. กำลังเรียน (50%)</div>
                      <div className="text-[10px] text-slate-400">ผ่าน Pre-test + บทที่ 1-2 แล้ว</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectPreset('completed_trainee')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="font-semibold">3. เรียนจบ 100% (มีใบรับรอง)</div>
                      <div className="text-[10px] text-slate-400">สอบผ่าน Post-test 10/10 พร้อมดูใบประกาศ A4</div>
                    </div>
                  </button>
                </div>

                {/* 12 Departments Quick Select */}
                <div className="p-1.5">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                    สลับ 12 แผนก Teijin Cord
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {DEPARTMENT_CODES.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => handleSelectPreset('dept', dept)}
                        className={`px-2 py-1 rounded text-center font-mono text-[11px] font-bold transition-all cursor-pointer ${
                          currentUser?.department === dept
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-purple-300 border border-slate-800'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Fast-Pass Unlock Button */}
          <button
            id="btn-admin-instant-unlock"
            type="button"
            onClick={() => {
              playCyberClick();
              onInstantUnlockAll();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/50 text-xs font-semibold text-amber-300 cursor-pointer shadow-sm"
            title="ปลดล็อคทุกบทเรียนและทำข้อสอบผ่าน 100% ทันทีสำหรับการตรวจเช็คงาน"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ปลดล็อค 100% (Fast-Pass)</span>
            <span className="sm:hidden">100%</span>
          </button>

          {/* Return to Admin Backoffice */}
          <button
            id="btn-return-admin-backoffice"
            type="button"
            onClick={() => {
              playCyberClick();
              onNavigateToAdmin();
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
            title="กลับไปยังหน้าระบบผู้ดูแลระบบ (Admin Backoffice)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าแอดมิน</span>
          </button>

          {/* Minimize Banner */}
          <button
            id="btn-minimize-admin-banner"
            type="button"
            onClick={() => { playCyberClick(); setIsMinimized(true); }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
            title="ย่อแถบแอดมิน"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
