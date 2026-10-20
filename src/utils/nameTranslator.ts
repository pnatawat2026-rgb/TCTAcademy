/**
 * TCT Multi-Language & Name Transliteration Engine
 * Converts Thai employee names, positions, departments, and titles to English (and vice versa)
 * Supports predefined dictionaries and intelligent Romanization for custom dynamic employees.
 */

export interface TranslatedEntity {
  th: string;
  en: string;
}

// 1. Official Known Employee & Approver Name Dictionary
export const KNOWN_NAME_DICTIONARY: Record<string, string> = {
  // QSRM Supervisors
  'ประไพ คงเพียรธรรม': 'Prapai Kongpiantham',
  'นัตติกรณ์ ทองประสานศรี': 'Nattikorn Thongprasarnsri',
  'นาวา เกษร': 'Nawa Kaysorn',
  'อมร ศรีพรหม': 'Amorn Sriprom',
  'วนิดา เพิ่มความประเสริฐ': 'Wanida Permkuamprasert',
  'ธงชัย ทับทอง': 'Thongchai Tubthong',
  'พลวริศ มะณีเนตร': 'Phonwaris Maneenet',
  'ศรัญญู เจนกระโทก': 'Saranyu Jenkratok',
  'ณัฐวัตร พงษ์สาริกิจ': 'Nathawat Pongsarikit',
  'นายณัฐวัตร พงษ์สาริกิจ': 'Mr. Nathawat Pongsarikit',
  'ณฐวัตร พงษ์สาริกิจ': 'Nathawat Pongsarikit',
  'นายณฐวัตร พงษ์สาริกิจ': 'Mr. Nathawat Pongsarikit',
  'เพ็ญนภา ศรินรจันทร์': 'Pennapa Sarinrojan',
  'ธนสรณ์ ชุ่มมิ': 'Thanasorn Choommi',
  'ธนากร ดวงจิตร': 'Thanakorn Duangjit',
  'วิรุฬ แรงเขตกรรม': 'Wirun Raengkhetkam',

  // APM Employees
  'ชลิต เสือน้อย': 'Chalit Sueanoi',
  'ประกิจ อ่อนคำ': 'Prakit Onkham',
  'ธงชัย ภาคสาร': 'Thongchai Phaksarn',
  'ศิริชัย พันธุ์ศรี': 'Sirichai Phansri',
  'ทินาคม เผือกยอด': 'Thinakom Phueakyod',
  'อนุรักษ์ รื่นบุญ': 'Anurak Ruenboon',
  'กิติพัฒน์ ทับเทศ': 'Kitipat Tubtet',
  'นัฐพล ภูมิสุข': 'Nattapon Phoomsuk',
  'เมฆสิทธิ์ เลขาลาวัณย์': 'Meksit Lekhalawan',
  'นนทบวร นาดี': 'Nontabowon Nadee',
  'ชินวัตร ฉ่ำทิม': 'Chinnawat Chamtin',
  'อานนท์ ทองแกมใบ': 'Arnon Thongkaembai',

  // Authorized Approvers & Executives
  'กิติศักดิ์ สร้อยจิตต์': 'Kitisak Soijit',
  'กิตติศักดิ์ สร้อยจิตต์': 'Kitisak Soijit',
  'นพดล บำรุงเกียรติ': 'Noppadol Bamrungkiat',
  'ณัฐวัตร ชัยพงศ์สุนทร': 'Natawat Chaiphongsuntorn',
  'อ.ณัฐวัตร ชัยพงศ์สุนทร': 'Ajarn Natawat Chaiphongsuntorn',
  'สมชาย ใจดี': 'Somchai Jaidee'
};

// 2. Thai Prefix Translations
export const PREFIX_TRANSLATIONS: Record<string, { th: string; en: string }> = {
  'นาย': { th: 'นาย', en: 'Mr.' },
  'น.ส.': { th: 'น.ส.', en: 'Ms.' },
  'นางสาว': { th: 'นางสาว', en: 'Ms.' },
  'นาง': { th: 'นาง', en: 'Mrs.' },
  'ด.ช.': { th: 'ด.ช.', en: 'Master' },
  'ด.ญ.': { th: 'ด.ญ.', en: 'Miss' },
  'ว่าที่ร้อยตรี': { th: 'ว่าที่ ร.ต.', en: 'Acting Sub Lt.' },
  'ว่าที่ ร.ต.': { th: 'ว่าที่ ร.ต.', en: 'Acting Sub Lt.' },
  'Mr.': { th: 'นาย', en: 'Mr.' },
  'Ms.': { th: 'น.ส.', en: 'Ms.' },
  'Mrs.': { th: 'นาง', en: 'Mrs.' },
  'Miss': { th: 'น.ส.', en: 'Miss' }
};

// 3. Department Translations
export const DEPARTMENT_DICTIONARY: Record<string, { th: string; en: string; fullTh: string; fullEn: string }> = {
  'FI': { th: 'FI', en: 'FI', fullTh: 'ฝ่ายการเงินและบัญชี (FI)', fullEn: 'Finance & Accounting (FI)' },
  'ST': { th: 'ST', en: 'ST', fullTh: 'คลังสินค้าและสโตร์ (ST)', fullEn: 'Store & Warehouse (ST)' },
  'MN': { th: 'MN', en: 'MN', fullTh: 'ฝ่ายซ่อมบำรุง (MN)', fullEn: 'Maintenance Department (MN)' },
  'SEC': { th: 'SEC', en: 'SEC', fullTh: 'ฝ่ายรักษาความปลอดภัยและธุรการ (SEC)', fullEn: 'Security & General Affairs (SEC)' },
  'QA': { th: 'QA', en: 'QA', fullTh: 'ฝ่ายประกันคุณภาพ (QA)', fullEn: 'Quality Assurance (QA)' },
  'PP': { th: 'PP', en: 'PP', fullTh: 'ฝ่ายวางแผนการผลิต (PP)', fullEn: 'Production Planning (PP)' },
  'AD2': { th: 'AD2', en: 'AD2', fullTh: 'ฝ่ายบริหารธุรการ 2 (AD2)', fullEn: 'Administration 2 (AD2)' },
  'TW': { th: 'TW', en: 'TW', fullTh: 'ฝ่ายตีเกลียว (TW)', fullEn: 'Twisting Division (TW)' },
  'PS': { th: 'Personnel', en: 'Personnel', fullTh: 'ฝ่ายบุคคลและธุรการ (Personnel)', fullEn: 'Personnel & Administration Department (Personnel)' },
  'P': { th: 'P', en: 'P', fullTh: 'ฝ่ายผลิต (P)', fullEn: 'Production Department (P)' },
  'TR': { th: 'TR', en: 'TR', fullTh: 'ฝ่ายฝึกอบรมและพัฒนา (TR)', fullEn: 'Training & Development (TR)' },
  'ESH': { th: 'ESH', en: 'ESH', fullTh: 'สิ่งแวดล้อม ความปลอดภัยและอาชีวอนามัย (ESH)', fullEn: 'Environment, Safety & Health (ESH)' },
  'HR': { th: 'Personnel', en: 'Personnel', fullTh: 'ฝ่ายบุคคลและธุรการ (Personnel)', fullEn: 'Personnel & Administration Department (Personnel)' },
  'IT': { th: 'IT', en: 'IT', fullTh: 'เทคโนโลยีสารสนเทศ (IT)', fullEn: 'Information Technology (IT)' },
  'TCT': { th: 'TCT', en: 'TCT', fullTh: 'ไทยคาร์บอนแบล็ค / TCT ACADEMY', fullEn: 'Thai Carbon / TCT ACADEMY' }
};

// 4. Position Translations
export const POSITION_DICTIONARY: Record<string, { th: string; en: string }> = {
  'SUPERVISOR': { th: 'หัวหน้างาน (Supervisor)', en: 'Supervisor' },
  'MANAGER': { th: 'ผู้จัดการ (Manager)', en: 'Manager' },
  'LEADER': { th: 'หัวหน้ากะ / ลีดเดอร์ (Leader)', en: 'Team Leader' },
  'WORKER': { th: 'พนักงานปฏิบัติการ (Worker)', en: 'Operator / Worker' },
  'OPERATOR': { th: 'พนักงานเดินเครื่อง (Operator)', en: 'Machine Operator' },
  'ENGINEER': { th: 'วิศวกร (Engineer)', en: 'Engineer' },
  'CLERK': { th: 'เจ้าหน้าที่ธุรการ (Clerk)', en: 'Administrative Clerk' },
  'OFFICER': { th: 'เจ้าหน้าที่ (Officer)', en: 'Officer' },
  'TECHNICIAN': { th: 'ช่างเทคนิค (Technician)', en: 'Technician' },
  'SPECIALIST': { th: 'ผู้เชี่ยวชาญ (Specialist)', en: 'Specialist' },
  'DIRECTOR': { th: 'ผู้อำนวยการ (Director)', en: 'Director' }
};

// 5. Thai Phonetic Syllable Mapping (for dynamic transliteration of unlisted Thai names)
const THAI_CONSONANTS_INITIAL: Record<string, string> = {
  'ก': 'K', 'ข': 'Kh', 'ฃ': 'Kh', 'ค': 'Kh', 'ฅ': 'Kh', 'ฆ': 'Kh',
  'ง': 'Ng', 'จ': 'Ch', 'ฉ': 'Ch', 'ช': 'Ch', 'ซ': 'S', 'ฌ': 'Ch',
  'ญ': 'Y', 'ด': 'D', 'ต': 'T', 'ถ': 'Th', 'ท': 'Th', 'ธ': 'Th',
  'น': 'N', 'บ': 'B', 'ป': 'P', 'ผ': 'Ph', 'ฝ': 'F', 'พ': 'Ph',
  'ฟ': 'F', 'ภ': 'Ph', 'ม': 'M', 'ย': 'Y', 'ร': 'R', 'ฤ': 'Rue',
  'ล': 'L', 'ว': 'W', 'ศ': 'S', 'ษ': 'S', 'ส': 'S', 'ห': 'H',
  'ฬ': 'L', 'อ': '', 'ฮ': 'H'
};

const COMMON_THAI_WORDS_TRANSLATION: Record<string, string> = {
  'สมชาย': 'Somchai',
  'สมศักดิ์': 'Somsak',
  'สมศรี': 'Somsri',
  'สมบัติ': 'Sombat',
  'ประเสริฐ': 'Prasert',
  'วัฒนา': 'Watthana',
  'สมบูรณ์': 'Somboon',
  'มานะ': 'Mana',
  'วิชัย': 'Wichai',
  'กมล': 'Kamol',
  'กัญญา': 'Kanya',
  'จันทร์': 'Jan',
  'รัตนา': 'Rattana',
  'สุริยา': 'Suriya',
  'สุรเชษฐ์': 'Surachet',
  'อนุชา': 'Anucha',
  'อาทิตย์': 'Arthit',
  'เอกชัย': 'Ekachai',
  'ชัย': 'Chai',
  'พร': 'Porn',
  'ทอง': 'Thong',
  'เจริญ': 'Charoen',
  'สุข': 'Suk',
  'สิริ': 'Siri',
  'สวัสดิ์': 'Sawat',
  'นภา': 'Napha',
  'พงษ์': 'Phong'
};

/**
 * Intelligent Thai Name Romanization
 * Uses exact match dictionary, word decomposition, or phonetic approximation
 */
export function romanizeThaiWord(thaiWord: string): string {
  if (!thaiWord) return '';
  const clean = thaiWord.trim();

  // If word is already English letters
  if (/^[A-Za-z\s.\-']+$/.test(clean)) {
    return clean;
  }

  // Exact known name match
  if (KNOWN_NAME_DICTIONARY[clean]) {
    return KNOWN_NAME_DICTIONARY[clean];
  }

  if (COMMON_THAI_WORDS_TRANSLATION[clean]) {
    return COMMON_THAI_WORDS_TRANSLATION[clean];
  }

  // Segment known sub-words
  for (const [thKey, enVal] of Object.entries(COMMON_THAI_WORDS_TRANSLATION)) {
    if (clean.startsWith(thKey) && clean.length > thKey.length) {
      const rest = clean.slice(thKey.length);
      return enVal + romanizeThaiWord(rest).toLowerCase();
    }
  }

  // Fallback transliteration: approximate characters
  let result = '';
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (THAI_CONSONANTS_INITIAL[char]) {
      result += THAI_CONSONANTS_INITIAL[char].toLowerCase();
    } else if (char === 'า' || char === 'ะ' || char === 'ั') {
      result += 'a';
    } else if (char === 'ิ' || char === 'ี') {
      result += 'i';
    } else if (char === 'ึ' || char === 'ื') {
      result += 'ue';
    } else if (char === 'ุ' || char === 'ู') {
      result += 'u';
    } else if (char === 'เ' || char === 'แ') {
      result += 'e';
    } else if (char === 'โ') {
      result += 'o';
    }
  }

  if (!result) {
    return clean;
  }

  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Translates a full name with prefix into English or Thai based on current language
 */
export function translateFullName(rawFullName: string, targetLang: 'th' | 'en'): string {
  if (!rawFullName) return '';
  const trimmed = rawFullName.replace(/\s+/g, ' ').trim();

  // Extract prefix
  let prefix = '';
  let nameWithoutPrefix = trimmed;

  const allPrefixes = [
    'นาย', 'น.ส.', 'นางสาว', 'นาง', 'ด.ช.', 'ด.ญ.', 'ว่าที่ร้อยตรี', 'ว่าที่ ร.ต.',
    'Mr.', 'Ms.', 'Mrs.', 'Miss', 'Master', 'Mr', 'Ms', 'Mrs'
  ];

  for (const p of allPrefixes) {
    if (nameWithoutPrefix.startsWith(p + ' ') || nameWithoutPrefix.startsWith(p)) {
      prefix = p;
      nameWithoutPrefix = nameWithoutPrefix.slice(p.length).trim();
      break;
    }
  }

  if (targetLang === 'th') {
    // If it is already Thai, return cleaned Thai
    if (/[\u0E00-\u0E7F]/.test(nameWithoutPrefix)) {
      const thPrefix = prefix ? (PREFIX_TRANSLATIONS[prefix]?.th || prefix) : 'นาย';
      return `${thPrefix} ${nameWithoutPrefix}`.replace(/\s+/g, ' ').trim();
    }
    // Reverse lookup from dictionary if found
    for (const [thName, enName] of Object.entries(KNOWN_NAME_DICTIONARY)) {
      if (enName.toLowerCase() === nameWithoutPrefix.toLowerCase()) {
        const thPrefix = prefix ? (PREFIX_TRANSLATIONS[prefix]?.th || 'นาย') : 'นาย';
        return `${thPrefix} ${thName}`;
      }
    }
    return trimmed;
  }

  // targetLang === 'en'
  // Check exact full name in dictionary without prefix
  let enName = KNOWN_NAME_DICTIONARY[nameWithoutPrefix];

  if (!enName) {
    // Try splitting first and last name
    const parts = nameWithoutPrefix.split(' ');
    if (parts.length >= 2) {
      const firstEn = KNOWN_NAME_DICTIONARY[parts[0]] || romanizeThaiWord(parts[0]);
      const lastEn = KNOWN_NAME_DICTIONARY[parts.slice(1).join(' ')] || romanizeThaiWord(parts.slice(1).join(' '));
      enName = `${firstEn} ${lastEn}`;
    } else {
      enName = romanizeThaiWord(nameWithoutPrefix);
    }
  }

  const enPrefix = prefix ? (PREFIX_TRANSLATIONS[prefix]?.en || 'Mr.') : 'Mr.';
  return `${enPrefix} ${enName}`.replace(/\s+/g, ' ').trim();
}

/**
 * Translates department code or text into localized string
 */
export function translateDepartment(dept: string, targetLang: 'th' | 'en'): string {
  if (!dept) return dept || '';
  const upper = dept.toUpperCase().trim();
  const found = DEPARTMENT_DICTIONARY[upper];
  if (found) {
    return targetLang === 'th' ? found.fullTh : found.fullEn;
  }
  return dept;
}

/**
 * Translates position string
 */
export function translatePosition(pos: string, targetLang: 'th' | 'en'): string {
  if (!pos) return pos || '';
  const upper = pos.toUpperCase().trim();
  const found = POSITION_DICTIONARY[upper];
  if (found) {
    return targetLang === 'th' ? found.th : found.en;
  }
  return pos;
}

/**
 * Returns localized course title
 */
export function translateCourseTitle(courseId: string, targetLang: 'th' | 'en'): string {
  if (courseId === 'advanced-preventive-maintenance') {
    return targetLang === 'th'
      ? 'การบำรุงรักษาเชิงป้องกันขั้นสูง (Advanced Preventive Maintenance - APM)'
      : 'Advanced Preventive Maintenance (APM Industrial Standard)';
  }
  return targetLang === 'th'
    ? 'การบริหารและประเมินความเสี่ยงสำหรับหัวหน้างาน (Quantitative & Semi-Quantitative Risk Assessment & Management)'
    : 'Quantitative & Semi-Quantitative Risk Assessment & Management for Supervisors';
}
