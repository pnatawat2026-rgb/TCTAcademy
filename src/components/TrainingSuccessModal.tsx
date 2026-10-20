import React from 'react';
import { UserProfile, Course } from '../types';
import { 
  Award, 
  CheckCircle2, 
  Download, 
  Printer, 
  Sparkles, 
  X, 
  Calendar, 
  FileCheck, 
  ArrowRight,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { playCyberClick } from '../utils/soundEffects';

interface TrainingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  course: Course;
  onViewCertificate: () => void;
  onViewDashboard: () => void;
}

export const TrainingSuccessModal: React.FC<TrainingSuccessModalProps> = ({
  isOpen,
  onClose,
  user,
  course,
  onViewCertificate,
  onViewDashboard
}) => {
  if (!isOpen) return null;

  const certNumber = user.certificateId || `TCT-CERT-${course.code || '2026'}-${user.empId}`;
  const score = user.postTestScore !== null ? user.postTestScore : 10;
  const total = user.postTestTotal || 10;
  const todayTh = new Date().toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn font-sarabun text-slate-800">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-300 overflow-hidden flex flex-col">
        
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-br from-amber-500 via-[#003875] to-[#001f3f] text-white p-6 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <button
            onClick={() => {
              playCyberClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
            title="ปิด"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center text-amber-300 shadow-xl mb-3 animate-bounce">
            <Award className="w-9 h-9 sm:w-11 sm:h-11" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRAINING COMPLETION CONFIRMED</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight whitespace-nowrap">
            🎉 ขอแสดงความยินดีที่สำเร็จการฝึกอบรม!
          </h2>

          <p className="text-xs sm:text-sm text-blue-100 max-w-md mx-auto mt-1 leading-relaxed">
            ท่านได้ผ่านเกณฑ์การฝึกอบรมและการประเมินผลออนไลน์เรียบร้อยแล้ว
          </p>
        </div>

        {/* Certificate & Record Summary Box */}
        <div className="p-5 sm:p-6 space-y-4">
          
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 via-white to-blue-50/80 border border-amber-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                <BookOpen className="w-4 h-4 text-[#005A9C]" />
                <span>หลักสูตร:</span>
              </span>
              <span className="font-mono text-xs font-bold text-[#005A9C] bg-blue-100 px-2 py-0.5 rounded whitespace-nowrap">
                {course.code || 'TCT'}
              </span>
            </div>
            
            <div className="font-bold text-slate-900 text-sm leading-snug">
              {course.title}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-400">ผู้สำเร็จการฝึกอบรม:</span>
                <div className="font-bold text-slate-900 whitespace-nowrap">{user.fullName}</div>
                <div className="text-[11px] text-slate-500 font-mono">รหัส {user.empId} • แผนก {user.department}</div>
              </div>

              <div className="space-y-0.5 text-right">
                <span className="text-[11px] text-slate-400">ผลการทดสอบ:</span>
                <div className="font-bold text-emerald-600 text-sm font-mono whitespace-nowrap">
                  ผ่านเกณฑ์ ({score}/{total} คะแนน)
                </div>
                <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                  วันที่: {todayTh}
                </div>
              </div>
            </div>
          </div>

          {/* Registration Notice */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#002855] space-y-1">
            <div className="font-bold flex items-center gap-1.5 whitespace-nowrap">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>บันทึกใบรับรองผลไว้ในระบบเรียบร้อยแล้ว</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              ผลการฝึกอบรมและวุฒิบัตรฉบับสมบูรณ์ถูกจัดเก็บในฐานข้อมูลกลางของ TCT Academy แผนก Personnel สามารถตรวจสอบจำนวนประวัติของตนเองได้ตลอดเวลา
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              id="success-modal-open-cert-btn"
              type="button"
              onClick={() => {
                playCyberClick();
                onViewCertificate();
                onClose();
              }}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              <span>กดเปิดดูและพิมพ์ใบรับรองผล (วุฒิบัตร A4)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="success-modal-open-dashboard-btn"
              type="button"
              onClick={() => {
                playCyberClick();
                onViewDashboard();
                onClose();
              }}
              className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 transition-all cursor-pointer whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4" />
              <span>กลับสู่หน้าของตนเองเพื่อตรวจสอบประวัติและหลักสูตร</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
