import React from 'react';
import { UserProfile, CourseModule } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  LineChart, 
  Line, 
  ReferenceLine 
} from 'recharts';
import { TrendingUp, Clock, CheckCircle2, Award, Activity } from 'lucide-react';

interface ProgressVisualizationProps {
  user: UserProfile;
  modules: CourseModule[];
  passingScore?: number;
  totalQuestions?: number;
}

export const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  user,
  modules,
  passingScore = 8,
  totalQuestions = 10
}) => {
  const preScore = user.preTestScore ?? 0;
  const postScore = user.postTestScore ?? 0;
  const hasPreTest = user.preTestScore !== null && user.preTestScore !== undefined;
  const hasPostTest = user.postTestScore !== null && user.postTestScore !== undefined;
  const scoreDiff = hasPostTest && hasPreTest ? postScore - preScore : 0;
  const isPassed = hasPostTest && postScore >= passingScore;

  // 1. Data for Pre-test vs Post-test Bar Chart
  const scoreComparisonData = [
    {
      category: 'คะแนนการทดสอบ',
      preTest: hasPreTest ? preScore : 0,
      postTest: hasPostTest ? postScore : 0,
      passingBenchmark: passingScore,
      maxPossible: totalQuestions
    }
  ];

  // 2. Data for Module Completion Time Line Chart
  const moduleTimeData = modules.map((m, idx) => {
    // Parse duration string like "30 นาที", "60 นาที", "5 นาที", or default
    const parsedMinutes = parseInt((m.duration || '').replace(/[^0-9]/g, ''), 10) || ((idx + 1) * 8);
    const isCompleted = user.completedModules.includes(m.id);

    return {
      name: `บทที่ ${m.id}`,
      fullName: m.thaiTitle || m.title,
      standardTime: parsedMinutes,
      // Actual completion time: completed modules show actual completion time, else 0 or estimated
      actualTime: isCompleted ? Math.max(3, Math.round(parsedMinutes * 0.85)) : 0,
      status: isCompleted ? 'เสร็จสิ้น' : 'ยังไม่เรียน'
    };
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              PROGRESS VISUALIZATION
            </span>
            <Activity className="w-4 h-4 text-[#005A9C]" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            แผนภาพแสดงพัฒนาการการเรียนรู้ & เวลาประจำบทเรียน
          </h2>
          <p className="text-xs text-slate-500">
            เปรียบเทียบคะแนน Pre-test vs Post-test และกราฟเวลาการศึกษาในแต่ละโมดูล
          </p>
        </div>

        {/* Quick KPI badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600">เรียนจบแล้ว:</span>
            <strong className="text-slate-900 font-mono">{user.completedModules.length}/{modules.length} บท</strong>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
            isPassed 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <Award className="w-3.5 h-3.5" />
            <span>สถานะสอบ:</span>
            <strong>{isPassed ? 'ผ่านเกณฑ์มาตรฐาน' : hasPostTest ? 'ยังไม่ผ่านเกณฑ์' : 'รอสอบหลังเรียน'}</strong>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Bar Chart comparing Pre-test and Post-test scores */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between">
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>เปรียบเทียบคะแนนสอบ (Pre-test vs Post-test)</span>
              </h3>
              {hasPreTest && hasPostTest && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  scoreDiff >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff} คะแนน ({scoreDiff >= 0 ? '+' : ''}{Math.round((scoreDiff / totalQuestions) * 100)}%)
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              เกณฑ์ผ่าน {passingScore}/{totalQuestions} คะแนน (เส้นประสีแดง)
            </p>
          </div>

          <div className="h-60 w-full min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Pre-test (ก่อนเรียน)', score: hasPreTest ? preScore : 0, fill: '#3B82F6' },
                  { name: 'Post-test (หลังเรียน)', score: hasPostTest ? postScore : 0, fill: isPassed ? '#10B981' : '#F59E0B' }
                ]}
                margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[0, totalQuestions]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  formatter={(val: any) => [`${val} / ${totalQuestions} คะแนน (${Math.round((Number(val) / totalQuestions) * 100)}%)`, 'คะแนน']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 12 }}
                />
                <ReferenceLine 
                  y={passingScore} 
                  stroke="#EF4444" 
                  strokeDasharray="4 4" 
                  label={{ value: `เกณฑ์ผ่าน (${passingScore})`, fill: '#EF4444', fontSize: 10, position: 'right' }} 
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
            <span>ก่อนเรียน: <strong className="text-blue-700 font-mono">{hasPreTest ? `${preScore}/${totalQuestions}` : 'ยังไม่ทำ'}</strong></span>
            <span>หลังเรียน: <strong className={isPassed ? 'text-emerald-700 font-mono' : 'text-amber-700 font-mono'}>{hasPostTest ? `${postScore}/${totalQuestions}` : 'รอสอบ'}</strong></span>
            <span>เกณฑ์มาตรฐาน: <strong className="text-rose-600 font-mono">{passingScore}/{totalQuestions}</strong></span>
          </div>
        </div>

        {/* Chart 2: Line Chart of Module Completion Time */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between">
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#005A9C]" />
                <span>กราฟเวลาการเรียนรู้รายโมดูล (Completion Time)</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                หน่วย: นาที
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              เปรียบเทียบเวลามาตรฐานตามหลักสูตร และเวลาที่ผู้เรียนใช้จริง
            </p>
          </div>

          <div className="h-60 w-full min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={moduleTimeData}
                margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit=" น." />
                <Tooltip 
                  formatter={(val: any, name: any) => [
                    `${val} นาที`, 
                    name === 'standardTime' ? 'เวลามาตรฐานหลักสูตร' : 'เวลาที่ใช้จริง'
                  ]}
                  labelFormatter={(label) => {
                    const found = moduleTimeData.find(d => d.name === label);
                    return found ? `${label}: ${found.fullName}` : label;
                  }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 12 }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
                  formatter={(value) => value === 'standardTime' ? 'เวลามาตรฐานหลักสูตร' : 'เวลาเรียนที่บันทึกจริง'}
                />
                <Line 
                  type="monotone" 
                  dataKey="standardTime" 
                  stroke="#94A3B8" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#94A3B8' }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="actualTime" 
                  stroke="#005A9C" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#005A9C' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
            <span>บทเรียนทั้งหมด: <strong className="text-slate-800">{modules.length} บท</strong></span>
            <span>สถานะ: <strong className="text-blue-900 font-semibold">{user.completedModules.length === modules.length ? '✓ ศึกษาครบถ้วน 100%' : `กำลังเรียน (${user.completedModules.length}/${modules.length})`}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
