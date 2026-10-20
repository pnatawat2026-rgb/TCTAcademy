import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  X, 
  TrendingUp, 
  Calculator, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  Wrench, 
  ShieldAlert, 
  Users, 
  Cpu, 
  HeartHandshake,
  ChevronDown
} from 'lucide-react';
import { playCyberClick } from '../utils/soundEffects';
import { getAllAvailableCourses } from '../utils/courseManager';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
}

interface RoadmapConfig {
  title: string;
  subtitle: string;
  icon: any;
  phases: { phase: string; desc: string; color: string }[];
  calcTitle: string;
  defaultCost: number;
  input1Label: string;
  input1Default: number;
  input2Label: string;
  input2Default: number;
  input3Label: string;
  input3Default: number;
  unit: string;
  calcSavings: (c: number, b: number, a: number) => number;
}

const ROADMAP_CONFIGS: Record<string, RoadmapConfig> = {
  'risk-management': {
    title: 'การบริหารความเสี่ยงด้านคุณภาพและความปลอดภัย (QSRM)',
    subtitle: 'Roadmap 4 ระยะ & การประเมินความคุ้มค่างบประมาณจัดอบรม (100% Attendance Coverage)',
    icon: ShieldAlert,
    phases: [
      { phase: 'ระยะที่ 1: ชี้บ่ง & ประเมิน (Assess)', desc: 'ระบุพื้นที่เสี่ยงตามมาตรฐาน ISO 31000, จัดทำ Risk Matrix, อบรมพนักงานครบ 100% ผ่านระบบออนไลน์', color: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-200' },
      { phase: 'ระยะที่ 2: นำร่องมาตรการ (Pilot)', desc: 'ติดตั้งระบบ LOTO, จัดทำ Risk Register นำร่องสายการผลิต โดยเครื่องจักรทำงานต่อเนื่อง 100%', color: 'border-purple-500/40 bg-purple-950/40 text-purple-200' },
      { phase: 'ระยะที่ 3: ขยายผลทั้งองค์กร (Scale)', desc: 'ขยายผล KYT ก่อนเริ่มงาน และ Near-Miss Reporting ครอบคลุมพนักงาน 230 คน', color: 'border-blue-500/40 bg-blue-950/40 text-blue-200' },
      { phase: 'ระยะที่ 4: วัฒนธรรมความปลอดภัย (Optimize)', desc: 'สร้าง Just Culture ขับเคลื่อน Kaizen Zero Accident และ Zero Defect อย่างยั่งยืน', color: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200' }
    ],
    calcTitle: 'จำลองผลประหยัดจากการลดงบจัดอบรม / จ้างวิทยากรภายนอก (Training Economics)',
    defaultCost: 0,
    input1Label: 'งบจัดอบรมผ่าน E-Training ภายใน TCT (บาท):',
    input1Default: 0,
    input2Label: 'จำนวนรุ่นจัดอบรม In-house หากจ้างวิทยากรภายนอก (รุ่น):',
    input2Default: 6,
    input3Label: 'ค่าจ้างวิทยากร + อาหารว่างต่อรุ่น (บาท):',
    input3Default: 34500,
    unit: 'รุ่น',
    calcSavings: (cost, before, after) => before * 34500
  },
  'advanced-preventive-maintenance': {
    title: 'การบำรุงรักษาเชิงป้องกันและการคาดการณ์ (APM - CBM / PdM)',
    subtitle: 'Roadmap 4 ระยะ & การประเมินผลประหยัดจาก Machine Breakdown Downtime',
    icon: Wrench,
    phases: [
      { phase: 'ระยะที่ 1: ตรวจวัดค่าพื้นฐาน (Baseline Audit)', desc: 'คัดแยก Critical Equipment, เก็บค่าสั่นสะเทือน (Vibration) และอุณหภูมิปกติ', color: 'border-purple-500/40 bg-purple-950/40 text-purple-200' },
      { phase: 'ระยะที่ 2: ติดตั้ง CBM Pilot (Sensor & P-F)', desc: 'ติดตั้งเซนเซอร์ IoT เฝ้าระวังลูกปืนมอเตอร์หลักสาย Twisting และ Rewind', color: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-200' },
      { phase: 'ระยะที่ 3: ขยายผล RCM & PdM Analytics', desc: 'วางแผนเปลี่ยนอะไหล่ตามสภาพจริง เลิก Over-Maintenance ลด Infant Mortality', color: 'border-blue-500/40 bg-blue-950/40 text-blue-200' },
      { phase: 'ระยะที่ 4: Zero Unplanned Downtime', desc: 'เชื่อมต่อข้อมูลเข้าสู่ระบบบำรุงรักษาอัจฉริยะ เครื่องจักรทำงานราบรื่น 24/7', color: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200' }
    ],
    calcTitle: 'จำลองผลประหยัดจากการลดเครื่องจักรหยุดฉุกเฉิน (Breakdown Downtime ROI)',
    defaultCost: 200000,
    input1Label: 'เงินลงทุนเซนเซอร์และระบบ PdM (บาท):',
    input1Default: 200000,
    input2Label: 'ชั่วโมงเครื่องจักรหยุดฉุกเฉินก่อนทำระบบ (ชม./ปี):',
    input2Default: 40,
    input3Label: 'ต้นทุนสายการผลิตหยุดชะงักเฉลี่ย (บาท/ชั่วโมง):',
    input3Default: 12000,
    unit: 'ชม./ปี',
    calcSavings: (cost, before, after) => (before - after) * 12000
  },
  'conflict-management': {
    title: 'การจัดการความขัดแย้งและสร้างความร่วมมือในองค์กร (CFM)',
    subtitle: 'Roadmap 4 ระยะ & การประเมินมูลค่าเวลาสูญเปล่าและการลดอัตราลาออก',
    icon: Users,
    phases: [
      { phase: 'ระยะที่ 1: สำรวจจุดเสียดทาน (Friction Audit)', desc: 'ประเมินข้อขัดแย้งระหว่างกะ ผลิต-ซ่อมบำรุง-QC ด้วยเครื่องมือ TKI Profile', color: 'border-amber-500/40 bg-amber-950/40 text-amber-200' },
      { phase: 'ระยะที่ 2: วางกติกาสื่อสาร (I-Message & SBI)', desc: 'อบรมหัวหน้างานในการฟังเชิงรุก (Active Listening) และส่งฟีดแบ็กแบบสร้างสรรค์', color: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-200' },
      { phase: 'ระยะที่ 3: เครือข่ายไกล่เกลี่ย (Mediation Hub)', desc: 'แต่งตั้งตัวแทนไกล่เกลี่ยข้อพิพาทประจำแผนก แก้ไขปัญหาตั้งแต่จุดเริ่มต้น', color: 'border-blue-500/40 bg-blue-950/40 text-blue-200' },
      { phase: 'ระยะที่ 4: วัฒนธรรมความไว้วางใจ (High-Trust)', desc: 'สร้าง Psychological Safety ทำงานเป็นทีมไร้รอยต่อ ลดความตึงเครียดหน้างาน', color: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200' }
    ],
    calcTitle: 'จำลองมูลค่าประหยัดเวลาข้อพิพาท & ลดต้นทุนรับคนใหม่ (Conflict Cost ROI)',
    defaultCost: 80000,
    input1Label: 'งบประมาณพัฒนาทักษะการสื่อสารและเจรจา (บาท):',
    input1Default: 80000,
    input2Label: 'ชั่วโมงทำงานที่สูญเสียไปกับข้อพิพาท/การแก้ปัญหา (ชม./ปี):',
    input2Default: 120,
    input3Label: 'มูลค่าผลตอบแทนแรงงานเฉลี่ย (บาท/ชั่วโมง):',
    input3Default: 350,
    unit: 'ชม./ปี',
    calcSavings: (cost, before, after) => (before - after) * 350 + 50000 // includes replacement retention
  },
  'ai-for-tct': {
    title: 'AI for TCT Organization (การประยุกต์ใช้ AI ในอุตสาหกรรม)',
    subtitle: 'Roadmap 4 ระยะ & การประเมินผลประหยัดชั่วโมงทำงานและเพิ่มผลผลิต',
    icon: Cpu,
    phases: [
      { phase: 'ระยะที่ 1: ค้นหาคอขวดงาน (Bottleneck Discovery)', desc: 'สำรวจงานเอกสาร สรุปข้อมูลรายงานกะ และการตรวจวัดคุณภาพที่ทำซ้ำๆ', color: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200' },
      { phase: 'ระยะที่ 2: นำร่อง AI Copilot & SOP Search', desc: 'ทดลองใช้ Generative AI สรุปรายงานประจำวัน และค้นหาคู่มือเครื่องจักรด่วน', color: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-200' },
      { phase: 'ระยะที่ 3: ระบบตรวจจับอัตโนมัติ (CV Inspection)', desc: 'ติดตั้งโมเดล AI ตรวจสอบตำหนิเส้นด้ายและวิเคราะห์แนวโน้มของเสีย', color: 'border-purple-500/40 bg-purple-950/40 text-purple-200' },
      { phase: 'ระยะที่ 4: TCT Smart Autonomous Plant', desc: 'เชื่อมต่อ AI Analytics เข้าสู่แดชบอร์ดฝ่ายบริหาร ตัดสินใจแม่นยำแบบเรียลไทม์', color: 'border-blue-500/40 bg-blue-950/40 text-blue-200' }
    ],
    calcTitle: 'จำลองเวลาการทำงานที่ประหยัดได้ด้วย AI (AI Productivity ROI)',
    defaultCost: 120000,
    input1Label: 'เงินลงทุนระบบ AI และการอบรมพนักงาน (บาท):',
    input1Default: 120000,
    input2Label: 'ชั่วโมงทำงานเอกสาร/คีย์ข้อมูลก่อนมี AI (ชม./เดือน):',
    input2Default: 160,
    input3Label: 'ต้นทุนค่าแรงเฉลี่ยต่อชั่วโมงทำงาน (บาท/ชม.):',
    input3Default: 250,
    unit: 'ชม./เดือน',
    calcSavings: (cost, before, after) => (before - after) * 250 * 12
  },
  'personality-psychology': {
    title: 'จิตวิทยาบุคลิกภาพและการทำงานร่วมกัน (TCT-A001)',
    subtitle: 'Roadmap 4 ขั้นตอน & การพัฒนาประสิทธิภาพและความผูกพันในองค์กร',
    icon: HeartHandshake,
    phases: [
      { phase: 'ขั้นตอนที่ 1: ตระหนักรู้ตนเอง (Self-Awareness)', desc: 'สำรวจจุดแข็ง รูปแบบ DISC และขยายบานหน้าต่าง Johari Window ของตนเอง', color: 'border-blue-500/40 bg-blue-950/40 text-blue-200' },
      { phase: 'ขั้นตอนที่ 2: ถอดรหัสพฤติกรรมเพื่อนร่วมงาน (Empathy)', desc: 'เข้าใจความแตกต่างระหว่างสไตล์ D, I, S, C ปรับโทนการสื่อสารให้ตรงใจ', color: 'border-purple-500/40 bg-purple-950/40 text-purple-200' },
      { phase: 'ขั้นตอนที่ 3: จับคู่งานตามความถนัด (Synergy)', desc: 'จัดสรรบทบาทในกะการผลิตและโครงการตามจุดแข็ง เสริมแรงซึ่งกันและกัน', color: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-200' },
      { phase: 'ขั้นตอนที่ 4: วัฒนธรรม Growth Mindset', desc: 'เปิดรับฟีดแบ็ก ก้าวข้ามความกดดันหน้างาน สร้างทีมงานที่เข้มแข็งและมีความสุข', color: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200' }
    ],
    calcTitle: 'จำลองความคุ้มค่าจากการลดการลาออกและเพิ่มประสิทธิภาพทีม (Team Engagement ROI)',
    defaultCost: 75000,
    input1Label: 'งบประมาณฝึกอบรมพัฒนาบุคลากร (บาท):',
    input1Default: 75000,
    input2Label: 'จำนวนพนักงานที่เสี่ยงลาออกเนื่องจากความเครียด/ไม่เข้ากัน (คน/ปี):',
    input2Default: 4,
    input3Label: 'ต้นทุนเฉลี่ยในการหาคนทดแทนและฝึกอบรมใหม่ (บาท/คน):',
    input3Default: 60000,
    unit: 'คน/ปี',
    calcSavings: (cost, before, after) => (before - after) * 60000
  }
};

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ isOpen, onClose, courseId = 'risk-management' }) => {
  const [activeCourseId, setActiveCourseId] = useState<string>(courseId);
  const availableCourses = getAllAvailableCourses();

  useEffect(() => {
    if (courseId) {
      setActiveCourseId(courseId);
    }
  }, [courseId, isOpen]);

  const config = ROADMAP_CONFIGS[activeCourseId] || ROADMAP_CONFIGS['risk-management'];
  const IconComponent = config.icon || Compass;

  // Interactive ROI Calculator states
  const [investCost, setInvestCost] = useState<number>(config.input1Default);
  const [metricBefore, setMetricBefore] = useState<number>(config.input2Default);
  const [costPerUnit, setCostPerUnit] = useState<number>(config.input3Default);
  const [metricAfter, setMetricAfter] = useState<number>(Math.max(1, Math.round(config.input2Default * 0.35)));

  // Reset inputs when course tab changes
  useEffect(() => {
    setInvestCost(config.input1Default);
    setMetricBefore(config.input2Default);
    setCostPerUnit(config.input3Default);
    setMetricAfter(Math.max(1, Math.round(config.input2Default * 0.35)));
  }, [activeCourseId]);

  if (!isOpen) return null;

  // Dynamic ROI calculation
  const totalCostBefore = metricBefore * costPerUnit * (activeCourseId === 'ai-for-tct' ? 12 : 1);
  const totalCostAfter = metricAfter * costPerUnit * (activeCourseId === 'ai-for-tct' ? 12 : 1);
  const annualSavings = Math.max(0, totalCostBefore - totalCostAfter);
  const year1ROI = investCost > 0 ? Math.round(((annualSavings - investCost) / investCost) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn no-print overflow-y-auto font-sarabun">
      <div className="glass-panel w-full max-w-3xl max-h-[92vh] rounded-3xl border border-cyan-500/50 flex flex-col overflow-hidden shadow-2xl bg-[#090E1A]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-950/70 via-slate-900 to-purple-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                  REAL-TIME COURSE ROADMAP
                </span>
                <span className="text-[10px] font-mono text-emerald-400">● เชื่อมโยงตามหลักสูตรปัจจุบัน</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {config.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { playCyberClick(); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-Time Course Switcher Bar */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs text-slate-400 shrink-0 font-semibold">สลับดูหลักสูตร:</span>
          {availableCourses.map((c) => {
            const isActive = activeCourseId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => { playCyberClick(); setActiveCourseId(c.id); }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <span>{c.code || c.id}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* 4-Phase Roadmap Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>แผนผังเส้นทางการนำไปปฏิบัติจริง 4 ระยะ (Implementation Roadmap)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {config.phases.map((item, i) => (
                <div key={i} className={`p-3.5 rounded-2xl border ${item.color} flex flex-col justify-between shadow-md`}>
                  <div>
                    <div className="font-bold text-xs mb-1.5 flex items-center justify-between">
                      <span>{item.phase}</span>
                      <span className="text-[10px] font-mono opacity-70">ขั้น {i + 1}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>เป้าหมายชัดเจน</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive ROI Calculator */}
          <div className="bg-[#060B14] rounded-2xl p-4 sm:p-5 border border-purple-500/40 space-y-4 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-purple-400" />
                <span>{config.calcTitle}</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                ปรับเปลี่ยนตัวเลขเพื่อจำลองความคุ้มค่าแบบเรียลไทม์
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{config.input1Label}</label>
                  <input
                    type="number"
                    value={investCost}
                    onChange={(e) => setInvestCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{config.input2Label}</label>
                  <input
                    type="number"
                    value={metricBefore}
                    onChange={(e) => setMetricBefore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-rose-300 font-mono focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{config.input3Label}</label>
                  <input
                    type="number"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">คาดการณ์หลังดำเนินงานระบบ (เป้าหมาย):</label>
                  <input
                    type="number"
                    value={metricAfter}
                    onChange={(e) => setMetricAfter(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Real-Time Outcome Metrics */}
              <div className="flex flex-col justify-between bg-gradient-to-br from-purple-950/30 to-cyan-950/30 p-4 rounded-xl border border-purple-500/20">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">ต้นทุนความสูญเสียเดิมต่อปี:</span>
                    <span className="font-mono font-bold text-rose-400">{totalCostBefore.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">ต้นทุนความสูญเสียหลังทำระบบ:</span>
                    <span className="font-mono font-bold text-emerald-400">{totalCostAfter.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-200 font-bold">มูลค่าที่ประหยัดได้ต่อปี (Annual Savings):</span>
                    <span className="font-mono font-bold text-cyan-300 text-sm">+{annualSavings.toLocaleString()} บาท</span>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-purple-500/40 text-center">
                  <div className="text-slate-400 text-xs mb-1">ผลตอบแทนการลงทุนปีแรก (Year 1 Net ROI):</div>
                  <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${year1ROI >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {year1ROI >= 0 ? `+${year1ROI}%` : `${year1ROI}%`}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {year1ROI >= 0 ? 'คุ้มค่าการลงทุน และคืนทุนได้ภายในปีแรกของการดำเนินงาน' : 'ต้องปรับแผนเพื่อเพิ่มความคุ้มค่า'}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-slate-500 text-[11px] shrink-0">
          <span>TCT Continuous Improvement • ขับเคลื่อนด้วยข้อมูลจริงแบบเรียลไทม์</span>
          <button
            type="button"
            onClick={() => { playCyberClick(); onClose(); }}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold cursor-pointer"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
};
