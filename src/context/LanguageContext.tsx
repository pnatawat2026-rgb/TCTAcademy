import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  translateFullName, 
  translateDepartment, 
  translatePosition, 
  translateCourseTitle 
} from '../utils/nameTranslator';

export type Language = 'th' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultTh?: string, defaultEn?: string) => string;
  tName: (rawName: string) => string;
  tDept: (dept: string) => string;
  tPos: (pos: string) => string;
  tCourse: (courseId: string) => string;
}

const UI_DICTIONARY: Record<string, { th: string; en: string }> = {
  // Navigation & Common Buttons
  'home': { th: 'หน้าหลัก', en: 'Home' },
  'back_to_home': { th: 'กลับสู่หน้าหลัก', en: 'Back to Home' },
  'login': { th: 'เข้าสู่ระบบ', en: 'Sign In' },
  'logout': { th: 'ออกจากระบบ', en: 'Sign Out' },
  'admin_portal': { th: 'ระบบผู้ดูแลระบบ', en: 'Admin Portal' },
  'approver_portal': { th: 'ระบบผู้อนุมัติ 3 ท่าน', en: '3-Approver Portal' },
  'employee_portal': { th: 'ระบบพนักงาน', en: 'Employee Portal' },
  'dashboard': { th: 'แผงควบคุมการเรียน', en: 'Learning Dashboard' },
  'courses': { th: 'เลือกหลักสูตร', en: 'Select Course' },
  'pre_test': { th: 'แบบทดสอบก่อนเรียน (Pre-Test)', en: 'Pre-Test Assessment' },
  'post_test': { th: 'แบบทดสอบหลังเรียน (Post-Test)', en: 'Post-Test Assessment' },
  'mini_game': { th: 'มินิเกมจำลองสถานการณ์', en: 'Simulation Mini-Game' },
  'certificate': { th: 'ใบประกาศนียบัตร', en: 'Certificate of Achievement' },
  'evaluation': { th: 'แบบประเมินความพึงพอใจ', en: 'Course Evaluation' },
  'report': { th: 'รายงานสรุปผลการอบรม', en: 'Training Report' },
  'glossary': { th: 'คลังคำศัพท์เฉพาะทาง', en: 'Technical Glossary' },
  'roadmap': { th: 'แผนที่การเรียนรู้', en: 'Learning Roadmap' },

  // Roles & Titles
  'trainee': { th: 'ผู้เข้าอบรม', en: 'Learner / Trainee' },
  'supervisor': { th: 'หัวหน้างาน', en: 'Supervisor' },
  'instructor': { th: 'วิทยากรประจำหลักสูตร', en: 'Lead Instructor' },
  'hr_manager': { th: 'ผู้จัดการฝ่ายบุคคลและธุรการ', en: 'HR & Admin Manager' },
  'general_manager': { th: 'ผู้จัดการทั่วไปและผู้จัดการโรงงาน', en: 'General Manager & Factory Manager' },

  // System Stats & Labels
  'emp_id': { th: 'รหัสพนักงาน', en: 'Employee ID' },
  'full_name': { th: 'ชื่อ - นามสกุล', en: 'Full Name' },
  'department': { th: 'ฝ่าย / แผนก', en: 'Department' },
  'position': { th: 'ตำแหน่ง', en: 'Position' },
  'status': { th: 'สถานะ', en: 'Status' },
  'score': { th: 'คะแนน', en: 'Score' },
  'pass_criteria': { th: 'เกณฑ์ผ่าน 80% (8/10 คะแนน)', en: 'Pass Criteria: 80% (8/10 pts)' },
  'switch_role': { th: 'สลับสิทธิ์การเข้าใช้งาน', en: 'Switch Portal Role' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'tct_app_selected_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'th' || saved === 'en') {
        return saved;
      }
    } catch (e) {}
    return 'th'; // Default to Thai with 1-click instant English switch
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  const t = (key: string, defaultTh?: string, defaultEn?: string): string => {
    if (UI_DICTIONARY[key]) {
      return language === 'th' ? UI_DICTIONARY[key].th : UI_DICTIONARY[key].en;
    }
    return language === 'th' ? (defaultTh || key) : (defaultEn || defaultTh || key);
  };

  const tName = (rawName: string): string => {
    return translateFullName(rawName, language);
  };

  const tDept = (dept: string): string => {
    return translateDepartment(dept, language);
  };

  const tPos = (pos: string): string => {
    return translatePosition(pos, language);
  };

  const tCourse = (courseId: string): string => {
    return translateCourseTitle(courseId, language);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        tName,
        tDept,
        tPos,
        tCourse
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: 'th',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key, defaultTh, defaultEn) => defaultTh || key,
      tName: (name) => name,
      tDept: (dept) => dept,
      tPos: (pos) => pos,
      tCourse: (courseId) => courseId
    };
  }
  return context;
};
