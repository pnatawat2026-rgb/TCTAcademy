import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  FileCheck2, 
  UserCheck, 
  KeyRound, 
  X, 
  CheckCircle2, 
  Clock, 
  Server,
  FileText
} from 'lucide-react';
import { playCyberClick } from '../utils/soundEffects';

interface DataSecurityStandardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSecurityStandardModal: React.FC<DataSecurityStandardModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn font-sarabun text-slate-800">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 my-auto">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#002855] via-[#003875] to-[#005A9C] text-white p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-blue-400/20">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                  ENTERPRISE SECURITY STANDARD
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30">
                  PDPA & ISO/IEC 27001 ALIGNED
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                มาตรฐานการรักษาความปลอดภัยของข้อมูล
              </h2>
              <p className="text-xs text-blue-100/90 mt-0.5">
                ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { playCyberClick(); onClose(); }}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Security Metrics Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500">สถานะความปลอดภัย</div>
            <div className="font-bold text-emerald-700 flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>ระดับสูงสุด (Active)</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500">บัญชีที่ได้รับการคุ้มครอง</div>
            <div className="font-bold text-[#005A9C] mt-0.5">
              พนักงาน 230 ท่าน
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500">ความลับรหัสผ่าน</div>
            <div className="font-bold text-purple-700 flex items-center justify-center gap-1 mt-0.5">
              <Lock className="w-3.5 h-3.5 text-purple-600" />
              <span>ปกป้อง 100% ไม่เปิดเผย</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500">ประวัติการทำข้อสอบ</div>
            <div className="font-bold text-amber-800 mt-0.5">
              คงอยู่ถาวร (ตั้งแต่ 12 ต.ค.)
            </div>
          </div>
        </div>

        {/* Security Standards Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar text-xs leading-relaxed text-slate-700">
          
          {/* Principle 1: Zero-Knowledge Admin Secrets */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>1. การรักษาความลับของรหัสผ่านและสิทธิ์ผู้ดูแลระบบ (Zero-Knowledge Admin Credentials)</span>
              </div>
              <p className="text-slate-600">
                ระบบห้ามแสดงรหัสผ่านผู้ดูแลระบบ (Admin PIN / Master Password) และข้อมูลลับบนหน้าจอผู้ใช้งานโดยเด็ดขาด 
                การยืนยันตัวตนใช้การตรวจสอบแบบเข้ารหัสผ่าน Session-based Authentication และไม่แสดงคำใบ้รหัสผ่านสู่สาธารณะ
              </p>
            </div>
          </div>

          {/* Principle 2: Permanent & Immutable Exam History */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <Database className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>2. ประวัติการสอบถาวร ห้ามลบข้อมูลตามเกณฑ์มาตรฐานจริง (Immutable Exam Records)</span>
              </div>
              <p className="text-slate-600">
                สำหรับผู้เข้าทำข้อสอบตั้งแต่วันที่ 12 ตุลาคม 2569 เป็นต้นไป ข้อมูลคะแนน Pre-Test, Post-Test, วุฒิบัตร, 
                และวันเวลาเข้าสอบจะถูกจัดเก็บและซิงค์อย่างถาวรในฐานข้อมูลส่วนกลาง แม้จะมีการเปลี่ยนลิงก์หรืออัปเดตเวอร์ชัน 
                ข้อมูลผู้เข้าอบรมทั้งหมด 230 คนจะคงอยู่ในพื้นที่เดิมอย่างปลอดภัย
              </p>
            </div>
          </div>

          {/* Principle 3: PDPA Compliance */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#005A9C] flex items-center justify-center shrink-0 mt-0.5">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>3. การคุ้มครองข้อมูลส่วนบุคคลตามกฎหมาย (PDPA Protection Standard)</span>
              </div>
              <p className="text-slate-600">
                ข้อมูลชื่อ-นามสกุล รหัสพนักงาน แผนก และตำแหน่ง จะถูกนำมาใช้เพื่อวัตถุประสงค์ในการฝึกอบรมและออกใบประกาศนียบัตรเท่านั้น 
                มีระบบควบคุมสิทธิ์ในการเข้าถึงและแก้ไขข้อมูล (Role-Based Access Control) โดยมีเฉพาะผู้ดูแลที่ได้รับอนุญาตเท่านั้นที่สามารถตรวจสอบได้
              </p>
            </div>
          </div>

          {/* Principle 4: Session Protection */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>4. ระบบออกจากระบบอัตโนมัติเมื่อไม่มีการใช้งาน (Auto-Logout Protection)</span>
              </div>
              <p className="text-slate-600">
                เพื่อป้องกันการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาตในกรณีที่ใช้งานบนเครื่องคอมพิวเตอร์ส่วนรวมในโรงงาน 
                ระบบจะมีกลไกตรวจสอบและแจ้งเตือนก่อนออกจากระบบอัตโนมัติอย่างปลอดภัย
              </p>
            </div>
          </div>

          {/* Principle 5: High Stability & Concurrency */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0 mt-0.5">
              <Server className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>5. สถาปัตยกรรมรองรับพนักงาน 230 ท่านอย่างมีเสถียรภาพ (High Availability Architecture)</span>
              </div>
              <p className="text-slate-600">
                ระบบจัดการหน่วยความจำและเชื่อมต่อฐานข้อมูลแบบ 2-Tier Persistence (Local Storage + Central Backend Server) 
                รองรับการทำข้อสอบพร้อมกัน การพิมพ์รายงาน และการดาวน์โหลดใบประกาศนียบัตรโดยไม่มีข้อผิดพลาด
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>TCT-SEC-AUDIT-2026 • VERIFIED</span>
          </div>

          <button
            type="button"
            onClick={() => { playCyberClick(); onClose(); }}
            className="px-5 py-2 rounded-xl bg-[#002D5A] hover:bg-[#001f3f] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            รับทราบและปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
