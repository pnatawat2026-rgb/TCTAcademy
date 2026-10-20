import React, { useState, useEffect } from 'react';
import { getAllGlossaryTerms, GlossaryItem } from '../data/allCourseGlossaries';
import { BookA, Search, X, Sparkles, Filter, Copy, Check, BookOpen } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ 
  isOpen, 
  onClose, 
  courseId = 'risk-management' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  const allTerms: GlossaryItem[] = getAllGlossaryTerms();

  // Categories list
  const categoryFilters = [
    { id: 'all', label: 'ทั้งหมด', count: allTerms.length },
    { id: 'risk-management', label: '1. QSRM ความเสี่ยง', count: allTerms.filter(t => t.courseId === 'risk-management').length },
    { id: 'advanced-preventive-maintenance', label: '2. APM บำรุงรักษา', count: allTerms.filter(t => t.courseId === 'advanced-preventive-maintenance').length },
    { id: 'conflict-management', label: '3. CFM ความขัดแย้ง', count: allTerms.filter(t => t.courseId === 'conflict-management').length },
    { id: 'ai-for-tct', label: '4. AI for TCT', count: allTerms.filter(t => t.courseId === 'ai-for-tct').length },
    { id: 'personality-psychology', label: '5. A001 จิตวิทยา', count: allTerms.filter(t => t.courseId === 'personality-psychology').length },
  ];

  // Auto-focus on active course if specified
  useEffect(() => {
    if (courseId && isOpen) {
      setSelectedCategory(courseId);
    }
  }, [courseId, isOpen]);

  if (!isOpen) return null;

  const filteredTerms = allTerms.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.courseId === selectedCategory;
    const matchesSearch = 
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.th.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.def.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyTerm = (term: string, def: string) => {
    playCyberClick();
    navigator.clipboard.writeText(`${term} (${def})`);
    setCopiedTerm(term);
    playSuccessChime();
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn no-print overflow-y-auto font-sarabun">
      <div className="glass-panel w-full max-w-3xl max-h-[88vh] rounded-3xl border border-cyan-500/50 flex flex-col overflow-hidden shadow-2xl bg-[#090E1A]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <BookA className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                  MULTI-COURSE GLOSSARY
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  ● อัปเดตคำศัพท์ครอบคลุมทุกหลักสูตรแบบเรียลไทม์
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                คลังคำศัพท์และนิยามทางการ (Official Training Glossary)
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

        {/* Filter Tabs & Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 space-y-3 shrink-0">
          
          {/* Real-time Category Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categoryFilters.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { playCyberClick(); setSelectedCategory(cat.id); }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-800'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-cyan-900 text-cyan-100' : 'bg-slate-800 text-slate-400'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาคำศัพท์ภาษาอังกฤษ ภาษาไทย หรือคำอธิบาย..."
              className="w-full bg-[#050B14] border border-cyan-500/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner font-sarabun"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Terms List Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {filteredTerms.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
              <div className="text-sm font-semibold text-slate-300">ไม่พบคำศัพท์ที่ค้นหา</div>
              <div className="text-xs text-slate-500">ลองค้นหาด้วยคำอื่น หรือเลือกตัวกรอง "ทั้งหมด"</div>
            </div>
          ) : (
            filteredTerms.map((item, idx) => (
              <div 
                key={`${item.courseId}-${item.term}-${idx}`}
                className="p-4 rounded-2xl bg-[#060D1A] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-md group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-cyan-300 group-hover:text-cyan-200 transition-colors">
                      {item.term}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      ({item.th})
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${item.badgeColor || 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300'}`}>
                      {item.courseCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.def}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyTerm(item.term, item.def)}
                  className="self-end sm:self-start p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors shrink-0 cursor-pointer border border-slate-800"
                  title="คัดลอกคำศัพท์"
                >
                  {copiedTerm === item.term ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-slate-500 text-[11px] shrink-0">
          <span>แสดง {filteredTerms.length} จากทั้งหมด {allTerms.length} คำศัพท์</span>
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
