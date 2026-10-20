import React, { useRef, useState } from 'react';
import { UserProfile, ViewState } from '../types';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  Calendar, 
  User, 
  Building, 
  Briefcase, 
  Clock, 
  FileText,
  ShieldCheck,
  Check,
  Layers
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { getAllAvailableCourses } from '../utils/courseManager';
import { downloadElementAsPdf, printElementViaStandaloneWindow } from '../utils/pdfExport';
import { ThaiMOOCLogo } from './ThaiMOOCLogo';

interface FollowUp30DaysViewProps {
  user: UserProfile;
  onNavigate: (view: ViewState) => void;
}

export const FollowUp30DaysView: React.FC<FollowUp30DaysViewProps> = ({
  user,
  onNavigate
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const allCourses = getAllAvailableCourses();
  const activeCourse = allCourses.find(c => c.id === user.selectedCourseId) || allCourses[0];
  const postScore = user.postTestScore ?? 10;
  const preScore = user.preTestScore ?? 6;
  const isPassed = postScore >= (activeCourse.passingScore || 8);

  const completionDate = user.certificateDate || new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate 30-day evaluation due date
  const evalDueDate = '30 วันหลังสำเร็จการอบรม (ภายใน 30 วัน)';

  const handlePrint = () => {
    playCyberClick();
    if (printRef.current) {
      printElementViaStandaloneWindow(
        printRef.current,
        `TCT-FollowUp-30Days-${user.empId}`
      );
    }
  };

  const handleDownloadPdf = async () => {
    playCyberClick();
    if (!printRef.current) return;
    setIsDownloading(true);
    try {
      await downloadElementAsPdf(printRef.current, {
        filename: `TCT-FollowUp-30Days-${user.empId}.pdf`,
        orientation: 'portrait',
        scale: 2
      });
      playSuccessChime();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 font-sarabun text-slate-800">
      
      {/* Simple, Clean Document Action Bar (Only Save / Print / Back) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              playCyberClick();
              onNavigate('certificate');
            }}
            className="w-full sm:w-auto h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>&larr; กลับไปใบรับรอง</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              playCyberClick();
              onNavigate('report');
            }}
            className="w-full sm:w-auto h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
          >
            <FileText className="w-4 h-4" />
            <span>ดูผลศักยภาพ A4</span>
          </button>
        </div>

        {/* Clean Save & Print Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex-1 sm:flex-initial h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'กำลังสร้าง PDF...' : 'บันทึก (PDF)'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial h-10 px-6 rounded-xl bg-[#005A9C] hover:bg-[#004070] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์เอกสาร A4</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>บันทึกไฟล์ใบติดตามผลการฝึกอบรม 30 วัน เรียบร้อยแล้ว</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL A4 DOCUMENT: 30-DAY TRAINING FOLLOW-UP EVALUATION FORM          */}
      {/* ========================================================================= */}
      <div 
        ref={printRef}
        id="followup-30-print-container"
        className="w-full max-w-[820px] mx-auto bg-white border border-slate-300 rounded-xl shadow-lg p-6 sm:p-10 text-slate-900 font-sarabun text-xs leading-normal select-none"
        style={{ minHeight: '1120px' }}
      >
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#002855] text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-xs">
                TCT
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                  บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.
                </div>
                <div className="text-[11px] font-bold text-[#005A9C]">
                  ศูนย์ฝึกอบรมและพัฒนา TCT Academy • แผนก Personnel
                </div>
              </div>
            </div>

            <div className="text-right text-[10px] font-mono text-slate-500">
              <div className="font-bold text-slate-700">FM-HRD-OJT-30D</div>
              <div>REV. 02 / 2026</div>
              <div>เอกสารควบคุม (Controlled)</div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 text-center">
            <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
              แบบติดตามผลการฝึกอบรมและการนำไปใช้ในการปฏิบัติงานจริง ใน 30 วัน
            </h1>
            <div className="text-xs text-slate-600 font-medium">
              30-Day Training Follow-up & OJT Competency Evaluation Form
            </div>
          </div>
        </div>

        {/* Section 1: Trainee & Course Information */}
        <div className="mb-4 space-y-2">
          <div className="text-xs font-bold text-[#002855] uppercase tracking-wide bg-slate-100 px-3 py-1 rounded">
            ส่วนที่ 1: ข้อมูลผู้รับการฝึกอบรมและหลักสูตร (Trainee & Course Profile)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">รหัสพนักงาน:</span>
              <strong className="font-mono text-slate-900">{user.empId}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ชื่อ-นามสกุล:</span>
              <strong className="text-slate-900">{user.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ฝ่าย / แผนก:</span>
              <strong className="text-slate-900">{user.department} ({user.division || 'ฝ่ายผลิต'})</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ตำแหน่ง:</span>
              <strong className="text-slate-900">{user.position || 'พนักงาน'}</strong>
            </div>

            <div className="col-span-2 sm:col-span-2 pt-1 border-t border-slate-200">
              <span className="text-slate-500 block text-[10px]">หลักสูตรที่ผ่านการอบรม:</span>
              <strong className="text-[#005A9C]">{activeCourse.title} ({activeCourse.code || 'COURSE'})</strong>
            </div>
            <div className="pt-1 border-t border-slate-200">
              <span className="text-slate-500 block text-[10px]">วันที่สอบผ่าน:</span>
              <strong className="text-slate-900">{completionDate}</strong>
            </div>
            <div className="pt-1 border-t border-slate-200">
              <span className="text-slate-500 block text-[10px]">ผลคะแนนสอบ (Pre / Post):</span>
              <strong className="text-emerald-700">{preScore}/10 &rarr; {postScore}/10 ({isPassed ? 'ผ่านเกณฑ์' : 'รออบรมซ่อม'})</strong>
            </div>
          </div>
        </div>

        {/* Section 2: 30-Day Follow-up Assessment Table */}
        <div className="mb-4 space-y-2">
          <div className="text-xs font-bold text-[#002855] uppercase tracking-wide bg-slate-100 px-3 py-1 rounded flex justify-between items-center">
            <span>ส่วนที่ 2: การประเมินสมรรถนะและการนำไปใช้จริงใน 30 วัน (ประเมินโดยหัวหน้างาน)</span>
            <span className="text-[10px] text-slate-600 font-normal">เกณฑ์: 4-ดีมาก, 3-ดี, 2-พอใช้, 1-ต้องปรับปรุง</span>
          </div>

          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 text-center font-bold">
                <th className="border border-slate-300 p-2 text-left w-1/2">หัวข้อการประเมินการปฏิบัติงาน (30 วัน)</th>
                <th className="border border-slate-300 p-2 w-12 text-center">4 (ดีมาก)</th>
                <th className="border border-slate-300 p-2 w-12 text-center">3 (ดี)</th>
                <th className="border border-slate-300 p-2 w-12 text-center">2 (พอใช้)</th>
                <th className="border border-slate-300 p-2 w-12 text-center">1 (ปรับปรุง)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { no: 1, title: 'การนำความรู้และมาตรฐานงานไปประยุกต์ใช้ในการปฏิบัติงานจริง', desc: 'ปฏิบัติตามขั้นตอนงานถูกต้อง และนำความรู้ไปใช้ได้ทันที' },
                { no: 2, title: 'การลดความเสี่ยงและการป้องกันความผิดพลาดหน้างาน', desc: 'ชี้บ่งความเสี่ยง ป้องกันข้อผิดพลาด และรักษาความปลอดภัย' },
                { no: 3, title: 'ความถูกต้อง ความแม่นยำ และคุณภาพของผลงาน', desc: 'ชิ้นงานถูกต้องตามสเปก ลดของเสีย และทำงานได้ตามเป้าหมาย' },
                { no: 4, title: 'การประสานงาน การสื่อสาร และการทำงานร่วมกับผู้อื่น', desc: 'สื่อสารชัดเจน รายงานปัญหาทันท่วงที และให้ความร่วมมือในทีม' },
                { no: 5, title: 'ทัศนคติ ความกระตือรือร้น และการพัฒนาตนเองอย่างต่อเนื่อง', desc: 'เปิดรับการเรียนรู้ มีวินัย และพร้อมพัฒนาศักยภาพ' }
              ].map((item) => (
                <tr key={item.no} className="hover:bg-slate-50/50">
                  <td className="border border-slate-300 p-2">
                    <div className="font-bold text-slate-900">{item.no}. {item.title}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </td>
                  <td className="border border-slate-300 text-center font-bold text-emerald-700">✓</td>
                  <td className="border border-slate-300 text-center"></td>
                  <td className="border border-slate-300 text-center"></td>
                  <td className="border border-slate-300 text-center"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: Summary & Supervisor Comments */}
        <div className="mb-4 space-y-2">
          <div className="text-xs font-bold text-[#002855] uppercase tracking-wide bg-slate-100 px-3 py-1 rounded">
            ส่วนที่ 3: สรุปผลการติดตามใน 30 วัน และข้อเสนอแนะเพิ่มเติม
          </div>

          <div className="p-3 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50 text-xs">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-800">ผลการประเมินรอบ 30 วัน:</span>
              <label className="flex items-center gap-1.5 font-bold text-emerald-800">
                <span className="w-4 h-4 rounded border-2 border-emerald-600 bg-emerald-600 text-white flex items-center justify-center text-[10px]">✓</span>
                <span>ผ่านเกณฑ์การติดตามผล (Competency Achieved)</span>
              </label>
              <label className="flex items-center gap-1.5 text-slate-500">
                <span className="w-4 h-4 rounded border border-slate-400 inline-block"></span>
                <span>ต้องติดตามผลต่อเนื่อง (Needs Follow-up)</span>
              </label>
            </div>

            <div className="pt-1">
              <span className="font-bold text-slate-800 block text-[11px] mb-1">
                ความคิดเห็นและข้อเสนอแนะของหัวหน้างาน / ผู้ประเมิน (Supervisor Comments):
              </span>
              <div className="p-2.5 bg-white border border-slate-200 rounded text-slate-700 leading-relaxed text-[11px] italic">
                &quot;พนักงานมีความเข้าใจในเนื้อหาหลักสูตร สามารถนำความรู้และหลักการที่ได้รับไปปรับใช้ในการทำงานจริงได้อย่างมีประสิทธิภาพ ปฏิบัติตามมาตรฐานอย่างเคร่งครัด และร่วมมือในการป้องกันปัญหาหน้างานได้เป็นอย่างดี สมควรได้รับการรับรองผลการฝึกอบรมในรอบ 30 วัน&quot;
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Three Signatures with Blank Lines (NO pre-printed names in signature box) */}
        <div className="pt-3 border-t-2 border-slate-800 space-y-3">
          <div className="text-[10px] text-slate-500 font-semibold mb-2">
            ส่วนที่ 4: การลงลายมือชื่อรับรองผลการติดตาม (Signatures of Certification)
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            
            {/* Signature 1: Trainee */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-700">1. ผู้รับการฝึกอบรม (Trainee)</div>
              <div className="h-10 border-b-2 border-slate-400 mx-auto w-full max-w-[170px] flex items-end justify-center pb-0.5">
                {/* Blank line for manual pen signature */}
              </div>
              <div className="text-[10.5px] font-mono text-slate-500">
                ( ............................................................ )
              </div>
              <div className="text-[10px] text-slate-800 font-semibold">
                {user.fullName}
              </div>
              <div className="text-[9px] text-slate-500">
                วันที่ ..... / ..... / ..........
              </div>
            </div>

            {/* Signature 2: Supervisor / Section Head */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-700">2. หัวหน้างาน / ผู้ประเมิน (Supervisor)</div>
              <div className="h-10 border-b-2 border-slate-400 mx-auto w-full max-w-[170px] flex items-end justify-center pb-0.5">
                {/* Blank line for manual pen signature */}
              </div>
              <div className="text-[10.5px] font-mono text-slate-500">
                ( ............................................................ )
              </div>
              <div className="text-[10px] text-slate-800 font-semibold">
                หัวหน้างาน / ผู้บังคับบัญชา
              </div>
              <div className="text-[9px] text-slate-500">
                วันที่ ..... / ..... / ..........
              </div>
            </div>

            {/* Signature 3: Personnel Manager */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-[#005A9C]">3. ฝ่ายบุคคล (Personnel)</div>
              <div className="h-10 border-b-2 border-slate-400 mx-auto w-full max-w-[170px] flex items-end justify-center pb-0.5">
                {/* Blank line for manual pen signature */}
              </div>
              <div className="text-[10.5px] font-mono text-slate-500">
                ( ............................................................ )
              </div>
              <div className="text-[10px] text-slate-800 font-semibold">
                ผู้จัดการฝ่ายบุคคล Personnel
              </div>
              <div className="text-[9px] text-slate-500">
                วันที่ ..... / ..... / ..........
              </div>
            </div>

          </div>

          {/* Footer Accreditation */}
          <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 font-mono">
            <span>TCT E-TRAINING • แผนก Personnel • TEIJIN CORD (THAILAND) CO., LTD.</span>
            <span>บันทึกประวัติสมรรถนะ OJT รายบุคคล 30 วัน • หน้า 1 จาก 1</span>
          </div>
        </div>

      </div>

    </div>
  );
};
