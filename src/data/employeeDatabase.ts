import type { PredefinedEmployee } from '../types.ts';
import { sanitizeThaiName } from '../utils/nameSanitizer.ts';

export type { PredefinedEmployee };
export const MASTER_EMPLOYEE_STORAGE_KEY = 'tct_master_employees_registry_v1';

/**
 * Official Master Employee Roster (224 ท่าน)
 * บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด (Teijin Cord Thailand Co., Ltd.)
 * อิงตามฐานข้อมูลทะเบียนพนักงานทางการจริง (Official Employee Registry) จากเอกสารคำสั่งบรรจุพนักงาน
 * รวมทั้งหมด 224 ท่าน ครบถ้วน 100% พร้อมข้อมูล รหัส, คำนำหน้า, ชื่อ, นามสกุล, ชื่อ-สกุลอังกฤษ, แผนก, ฝ่าย, ตำแหน่ง
 */
export const MASTER_EMPLOYEE_ROSTER_224: PredefinedEmployee[] = [
  // Page 1 & 2 (1 - 42)
  { empId: '00021', prefix: 'นาย', firstName: 'สัญชัย', lastName: 'รู้จัก', fullName: 'นาย สัญชัย รู้จัก', firstNameEn: 'Sunchai', lastNameEn: 'Rujuk', department: 'TR', division: 'TC', position: 'LEADER', isMasterRecord: true },
  { empId: '00023', prefix: 'นาย', firstName: 'กรรณจพงษ์', lastName: 'คลีรัมย์', fullName: 'นาย กรรณจพงษ์ คลีรัมย์', firstNameEn: 'Kranjapong', lastNameEn: 'Kleeram', department: 'TR', division: 'TC', position: 'SENIOR LEADER', isMasterRecord: true },
  { empId: '00024', prefix: 'นาย', firstName: 'สรรพสิทธิ์', lastName: 'ขันสัมฤทธิ์', fullName: 'นาย สรรพสิทธิ์ ขันสัมฤทธิ์', firstNameEn: 'Sappasit', lastNameEn: 'Kunsamrit', department: 'AD1', division: 'P', position: 'SENIOR LEADER', isMasterRecord: true },
  { empId: '01002', prefix: 'น.ส.', firstName: 'มลฤดี', lastName: 'ศิริคุณ', fullName: 'น.ส. มลฤดี ศิริคุณ', firstNameEn: 'Monrudee', lastNameEn: 'Serekun', department: 'PP', division: 'PP', position: 'CHIEF', isMasterRecord: true },
  { empId: '02010', prefix: 'นาย', firstName: 'เกตุแก้ว', lastName: 'ทรัพย์ขำ', fullName: 'นาย เกตุแก้ว ทรัพย์ขำ', firstNameEn: 'Ketkaew', lastNameEn: 'Supkham', department: 'ST', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '03003', prefix: 'นาย', firstName: 'พิรุณ', lastName: 'มาตทอง', fullName: 'นาย พิรุณ มาตทอง', firstNameEn: 'Pirun', lastNameEn: 'Madthong', department: 'TW', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '03007', prefix: 'นาย', firstName: 'นาวา', lastName: 'เกษร', fullName: 'นาย นาวา เกษร', firstNameEn: 'Nava', lastNameEn: 'Kesorn', department: 'MN', division: 'MN', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '03020', prefix: 'นาย', firstName: 'อโนชา', lastName: 'ร่มพิกุล', fullName: 'นาย อโนชา ร่มพิกุล', firstNameEn: 'Anocha', lastNameEn: 'Rompikul', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '04010', prefix: 'นาย', firstName: 'ลือศักดิ์', lastName: 'ทองแกมใบ', fullName: 'นาย ลือศักดิ์ ทองแกมใบ', firstNameEn: 'Luesak', lastNameEn: 'Thonggambai', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '06025', prefix: 'น.ส.', firstName: 'จารุณี', lastName: 'อินทรโสภา', fullName: 'น.ส. จารุณี อินทรโสภา', firstNameEn: 'Jarunee', lastNameEn: 'Intarasopa', department: 'PS', division: 'PS', position: 'CHIEF', isMasterRecord: true },
  { empId: '06059', prefix: 'นาย', firstName: 'ประไพ', lastName: 'รื่นบุตร', fullName: 'นาย ประไพ รื่นบุตร', firstNameEn: 'Prapai', lastNameEn: 'Ruenbut', department: 'PP', division: 'PP', position: 'SENIOR LEADER', isMasterRecord: true },
  { empId: '06061', prefix: 'นาย', firstName: 'นิรุตติ', lastName: 'สรรพสุขเติม', fullName: 'นาย นิรุตติ สรรพสุขเติม', firstNameEn: 'Nirutti', lastNameEn: 'Sansukterm', department: 'SEC', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '07008', prefix: 'น.ส.', firstName: 'พัทยา', lastName: 'มาตราช', fullName: 'น.ส. พัทยา มาตราช', firstNameEn: 'Pattaya', lastNameEn: 'Matarach', department: 'PP', division: 'PP', position: 'CLERK', isMasterRecord: true },
  { empId: '07044', prefix: 'นาย', firstName: 'ประกิจ', lastName: 'อ่อนคำ', fullName: 'นาย ประกิจ อ่อนคำ', firstNameEn: 'Prakit', lastNameEn: 'Onkham', department: 'MN', division: 'MN', position: 'WORKER', isMasterRecord: true },
  { empId: '07057', prefix: 'นาย', firstName: 'อภินันท์', lastName: 'ทองประสานศรี', fullName: 'นาย อภินันท์ ทองประสานศรี', firstNameEn: 'Apinan', lastNameEn: 'Thongprasarnsee', department: 'ST', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '08013', prefix: 'นาย', firstName: 'กิตติศักดิ์', lastName: 'สร้อยจิตต์', fullName: 'นาย กิตติศักดิ์ สร้อยจิตต์', firstNameEn: 'Kittisak', lastNameEn: 'Soijit', department: 'PS', division: 'PS', position: 'MANAGER', isMasterRecord: true },
  { empId: '08029', prefix: 'นาย', firstName: 'ต้อม', lastName: 'ศรีกุนชร', fullName: 'นาย ต้อม ศรีกุนชร', firstNameEn: 'Tom', lastNameEn: 'Srikunchone', department: 'FI', division: 'QA', position: 'LEADER', isMasterRecord: true },
  { empId: '09001', prefix: 'นาย', firstName: 'วัชรินทร์', lastName: 'จุลแก้ว', fullName: 'นาย วัชรินทร์ จุลแก้ว', firstNameEn: 'Watcharin', lastNameEn: 'Julkaew', department: 'ST', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '09012', prefix: 'นาย', firstName: 'กิตติพงษ์', lastName: 'แก้วนวล', fullName: 'นาย กิตติพงษ์ แก้วนวล', firstNameEn: 'Kittipong', lastNameEn: 'Kaewnuan', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '09015', prefix: 'นาย', firstName: 'ณัฐพล', lastName: 'ประพันธ์', fullName: 'นาย ณัฐพล ประพันธ์', firstNameEn: 'Nattapol', lastNameEn: 'Prapan', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '10019', prefix: 'นาย', firstName: 'อมร', lastName: 'ศรีพรหม', fullName: 'นาย อมร ศรีพรหม', firstNameEn: 'Amorn', lastNameEn: 'Sriprom', department: 'SEC', division: 'P', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '11003', prefix: 'นาย', firstName: 'ชลิต', lastName: 'เสือน้อย', fullName: 'นาย ชลิต เสือน้อย', firstNameEn: 'Chalit', lastNameEn: 'Suenoi', department: 'MN', division: 'MN', position: 'MANAGER', isMasterRecord: true },
  { empId: '12006', prefix: 'นาย', firstName: 'เอกชัย', lastName: 'เกตุศรี', fullName: 'นาย เอกชัย เกตุศรี', firstNameEn: 'Akkachai', lastNameEn: 'Katesri', department: 'TR', division: 'TC', position: 'WORKER', isMasterRecord: true },
  { empId: '12008', prefix: 'นาย', firstName: 'ธงชัย', lastName: 'ภาคสาร', fullName: 'นาย ธงชัย ภาคสาร', firstNameEn: 'Thongchai', lastNameEn: 'Parksan', department: 'MN', division: 'MN', position: 'LEADER', isMasterRecord: true },
  { empId: '14025', prefix: 'น.ส.', firstName: 'สุภาวดี', lastName: 'จอมทอง', fullName: 'น.ส. สุภาวดี จอมทอง', firstNameEn: 'Supawadee', lastNameEn: 'Jomthong', department: 'PP', division: 'PP', position: 'CLERK', isMasterRecord: true },
  { empId: '14032', prefix: 'นาย', firstName: 'พิพัฒน์', lastName: 'เขียวขาว', fullName: 'นาย พิพัฒน์ เขียวขาว', firstNameEn: 'Pipat', lastNameEn: 'Khiaokhao', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '14051', prefix: 'นาย', firstName: 'อภิชาติ', lastName: 'มีชอบ', fullName: 'นาย อภิชาติ มีชอบ', firstNameEn: 'Aphichat', lastNameEn: 'Mechob', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '14075', prefix: 'นาย', firstName: 'ศักดา', lastName: 'แสงเสงี่ยม', fullName: 'นาย ศักดา แสงเสงี่ยม', firstNameEn: 'Sakda', lastNameEn: 'Seangsangean', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '15015', prefix: 'นาย', firstName: 'มงคล', lastName: 'รัตนพันธ์', fullName: 'นาย มงคล รัตนพันธ์', firstNameEn: 'Mongkol', lastNameEn: 'Rattanaphan', department: 'SEC', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '15016', prefix: 'นาย', firstName: 'ทิวา', lastName: 'ทองเลิศ', fullName: 'นาย ทิวา ทองเลิศ', firstNameEn: 'Thiwa', lastNameEn: 'Thonglert', department: 'TW', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '15028', prefix: 'นาย', firstName: 'รัฐศาสตร์', lastName: 'ศิริคุณ', fullName: 'นาย รัฐศาสตร์ ศิริคุณ', firstNameEn: 'Ratthasard', lastNameEn: 'Sirikul', department: 'AD2', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '15030', prefix: 'น.ส.', firstName: 'หฤทัย', lastName: 'ถึงอินทร์', fullName: 'น.ส. หฤทัย ถึงอินทร์', firstNameEn: 'Harutai', lastNameEn: 'Thueng in', department: 'ESH', division: 'ESH', position: 'CHIEF', isMasterRecord: true },
  { empId: '15041', prefix: 'นาย', firstName: 'พอง', lastName: 'จันทะคุณ', fullName: 'นาย พอง จันทะคุณ', firstNameEn: 'Phong', lastNameEn: 'Janthakhun', department: 'RW', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '16015', prefix: 'นาย', firstName: 'ศิริชัย', lastName: 'พันธุ์ศรี', fullName: 'นาย ศิริชัย พันธุ์ศรี', firstNameEn: 'Sirichai', lastNameEn: 'Phansri', department: 'MN', division: 'MN', position: 'WORKER', isMasterRecord: true },
  { empId: '16042', prefix: 'นาย', firstName: 'มงคล', lastName: 'ภิษาภาต', fullName: 'นาย มงคล ภิษาภาต', firstNameEn: 'Mongkol', lastNameEn: 'Phisaphat', department: 'TW', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '17001', prefix: 'น.ส.', firstName: 'ดวงพร', lastName: 'ไชยวีระ', fullName: 'น.ส. ดวงพร ไชยวีระ', firstNameEn: 'Duangpron', lastNameEn: 'Chaiveera', department: 'PS', division: 'PS', position: 'WORKER', isMasterRecord: true },
  { empId: '17009', prefix: 'น.ส.', firstName: 'จิราภรณ์', lastName: 'วงษ์น้อย', fullName: 'น.ส. จิราภรณ์ วงษ์น้อย', firstNameEn: 'Jiraporn', lastNameEn: 'Wongnoy', department: 'TR', division: 'TC', position: 'CLERK', isMasterRecord: true },
  { empId: '17055', prefix: 'นาง', firstName: 'สุพิชฌาย์', lastName: 'คงเพียรธรรม', fullName: 'นาง สุพิชฌาย์ คงเพียรธรรม', firstNameEn: 'Supitcha', lastNameEn: 'Kongpiantham', department: 'FI', division: 'QA', position: 'WORKER', isMasterRecord: true },
  { empId: '17056', prefix: 'น.ส.', firstName: 'ณัฏฐณิชา', lastName: 'จงรักษ์', fullName: 'น.ส. ณัฏฐณิชา จงรักษ์', firstNameEn: 'Nattanicha', lastNameEn: 'Jongruk', department: 'FI', division: 'QA', position: 'WORKER', isMasterRecord: true },
  { empId: '17058', prefix: 'น.ส.', firstName: 'อภิญญา', lastName: 'นิยมเหมาะ', fullName: 'น.ส. อภิญญา นิยมเหมาะ', firstNameEn: 'Apinya', lastNameEn: 'Niyommor', department: 'P', division: 'P', position: 'CHIEF', isMasterRecord: true },
  { empId: '17106', prefix: 'นาย', firstName: 'เอกราช', lastName: 'สบายสูงเนิน', fullName: 'นาย เอกราช สบายสูงเนิน', firstNameEn: 'Ekkarat', lastNameEn: 'Sabaysungnern', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '17112', prefix: 'น.ส.', firstName: 'สุพัตรา', lastName: 'ชาตินาฝาย', fullName: 'น.ส. สุพัตรา ชาตินาฝาย', firstNameEn: 'Supattra', lastNameEn: 'Chatnaphai', department: 'TR', division: 'TC', position: 'CLERK', isMasterRecord: true },

  // Page 3 & 4 (43 - 85)
  { empId: '18013', prefix: 'นาย', firstName: 'ศักดิ์ดา', lastName: 'หงษ์ลอย', fullName: 'นาย ศักดิ์ดา หงษ์ลอย', firstNameEn: 'Sakda', lastNameEn: 'Hongloi', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '18025', prefix: 'นาย', firstName: 'อนุสรณ์', lastName: 'ประภาสวัสดิ์', fullName: 'นาย อนุสรณ์ ประภาสวัสดิ์', firstNameEn: 'Anusorn', lastNameEn: 'Prapasawat', department: 'ST', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '18034', prefix: 'น.ส.', firstName: 'วนิดา', lastName: 'เพิ่มความประเสริฐ', fullName: 'น.ส. วนิดา เพิ่มความประเสริฐ', firstNameEn: 'Wanida', lastNameEn: 'Permkhwamprasert', department: 'QA', division: 'QA', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '18042', prefix: 'นาย', firstName: 'ทินาคม', lastName: 'เผือกยอด', fullName: 'นาย ทินาคม เผือกยอด', firstNameEn: 'Tinakom', lastNameEn: 'Phuekyod', department: 'MN', division: 'MN', position: 'WORKER', isMasterRecord: true },
  { empId: '18049', prefix: 'นาย', firstName: 'จิณณ์ฐานันท์', lastName: 'คงเทศ', fullName: 'นาย จิณณ์ฐานันท์ คงเทศ', firstNameEn: 'Jintanan', lastNameEn: 'Kongted', department: 'TR', division: 'TC', position: 'WORKER', isMasterRecord: true },
  { empId: '18062', prefix: 'นาย', firstName: 'พงศ์ศิริ', lastName: 'อ่ำจรูญ', fullName: 'นาย พงศ์ศิริ อ่ำจรูญ', firstNameEn: 'Phongsiri', lastNameEn: 'Amcharun', department: 'SEC', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '18071', prefix: 'นาย', firstName: 'ฮานาวี', lastName: 'แสงมะหะหมัด', fullName: 'นาย ฮานาวี แสงมะหะหมัด', firstNameEn: 'Hanawee', lastNameEn: 'Saengmahamat', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '18077', prefix: 'นาย', firstName: 'วสันต์', lastName: 'เพื่อนพิมาย', fullName: 'นาย วสันต์ เพื่อนพิมาย', firstNameEn: 'Vasun', lastNameEn: 'Paenpimai', department: 'ST', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '18078', prefix: 'นาย', firstName: 'ณัฐภูมิ', lastName: 'ขลังธรรมเนียม', fullName: 'นาย ณัฐภูมิ ขลังธรรมเนียม', firstNameEn: 'Natthapoom', lastNameEn: 'Klungthumniem', department: 'SEC', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '18094', prefix: 'นาย', firstName: 'ธงชัย', lastName: 'ทับทอง', fullName: 'นาย ธงชัย ทับทอง', firstNameEn: 'Thongchai', lastNameEn: 'Tubthong', department: 'PP', division: 'PP', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '18096', prefix: 'นาย', firstName: 'วิทยา', lastName: 'ตรีมงคล', fullName: 'นาย วิทยา ตรีมงคล', firstNameEn: 'Wittaya', lastNameEn: 'Treemongkol', department: 'RW', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '18108', prefix: 'น.ส.', firstName: 'ชนกชนม์', lastName: 'ชมทรัพย์', fullName: 'น.ส. ชนกชนม์ ชมทรัพย์', firstNameEn: 'Chanokchon', lastNameEn: 'Chomsab', department: 'PP', division: 'PP', position: 'CLERK', isMasterRecord: true },
  { empId: '18109', prefix: 'น.ส.', firstName: 'ณัฐนันท์', lastName: 'ตะกรุดพนม', fullName: 'น.ส. ณัฐนันท์ ตะกรุดพนม', firstNameEn: 'Natthanan', lastNameEn: 'Takrudpon', department: 'QA', division: 'QA', position: 'MANAGER', isMasterRecord: true },
  { empId: '18120', prefix: 'นาย', firstName: 'พีรวัฒน์', lastName: 'มีศรีดี', fullName: 'นาย พีรวัฒน์ มีศรีดี', firstNameEn: 'Peerawat', lastNameEn: 'Meesridee', department: 'PP', division: 'PP', position: 'WORKER', isMasterRecord: true },
  { empId: '19003', prefix: 'นาย', firstName: 'สิทธิศักดิ์', lastName: 'เนรปัญหา', fullName: 'นาย สิทธิศักดิ์ เนรปัญหา', firstNameEn: 'Sitthisak', lastNameEn: 'Nerapanha', department: 'RW', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '19005', prefix: 'นาย', firstName: 'ธนัช', lastName: 'สีเสริม', fullName: 'นาย ธนัช สีเสริม', firstNameEn: 'Thanat', lastNameEn: 'Sriserm', department: 'TW', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '19007', prefix: 'นาย', firstName: 'รณชัย', lastName: 'พิจารณ์', fullName: 'นาย รณชัย พิจารณ์', firstNameEn: 'Ronnachai', lastNameEn: 'Pijan', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '19030', prefix: 'นาย', firstName: 'ภูริวัฒน์', lastName: 'สกุณาธวงศ์', fullName: 'นาย ภูริวัฒน์ สกุณาธวงศ์', firstNameEn: 'Bhurivat', lastNameEn: 'Sakunatawong', department: 'ST', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '19036', prefix: 'นาย', firstName: 'พลวริศ', lastName: 'มะณีเนตร', fullName: 'นาย พลวริศ มะณีเนตร', firstNameEn: 'Phonwarit', lastNameEn: 'Maneenet', department: 'AD2', division: 'P', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '19054', prefix: 'นาย', firstName: 'ธนพัฒน์', lastName: 'เรืองรัศมี', fullName: 'นาย ธนพัฒน์ เรืองรัศมี', firstNameEn: 'Thanapat', lastNameEn: 'Rungratsmee', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '19057', prefix: 'นาย', firstName: 'ณัฐพงศ์', lastName: 'งามสมัย', fullName: 'นาย ณัฐพงศ์ งามสมัย', firstNameEn: 'Nataphong', lastNameEn: 'Ngamsamai', department: 'RW', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '19094', prefix: 'นาย', firstName: 'ดิสสร', lastName: 'มงคลยุทธ', fullName: 'นาย ดิสสร มงคลยุทธ', firstNameEn: 'Dissorn', lastNameEn: 'Mongkolyut', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '19117', prefix: 'น.ส.', firstName: 'พจนีย์', lastName: 'ทองโพธิ์', fullName: 'น.ส. พจนีย์ ทองโพธิ์', firstNameEn: 'Potjanee', lastNameEn: 'Thongpo', department: 'TR', division: 'TC', position: 'CHIEF', isMasterRecord: true },
  { empId: '20003', prefix: 'นาย', firstName: 'ศุภกิติ์', lastName: 'ทองลอย', fullName: 'นาย ศุภกิติ์ ทองลอย', firstNameEn: 'Supakit', lastNameEn: 'Thongloy', department: 'FI', division: 'QA', position: 'LEADER', isMasterRecord: true },
  { empId: '20005', prefix: 'นาย', firstName: 'พลวัฒน์', lastName: 'ศรีวา', fullName: 'นาย พลวัฒน์ ศรีวา', firstNameEn: 'Pollawat', lastNameEn: 'Sriwa', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '20006', prefix: 'นาย', firstName: 'เกรียงไกร', lastName: 'ทองปิ่น', fullName: 'นาย เกรียงไกร ทองปิ่น', firstNameEn: 'Kriangkrai', lastNameEn: 'Tongpin', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '20010', prefix: 'นาย', firstName: 'ศศิพงษ์', lastName: 'นามคันที', fullName: 'นาย ศศิพงษ์ นามคันที', firstNameEn: 'Sasiphong', lastNameEn: 'Namkhantee', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '20011', prefix: 'นาย', firstName: 'เฉลิมพล', lastName: 'เทียมอัมพร', fullName: 'นาย เฉลิมพล เทียมอัมพร', firstNameEn: 'Chalumpol', lastNameEn: 'Tremamporn', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '20013', prefix: 'นาย', firstName: 'จตุพล', lastName: 'เรืองรุ่ง', fullName: 'นาย จตุพล เรืองรุ่ง', firstNameEn: 'Jatonpon', lastNameEn: 'Ruangrueng', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '20024', prefix: 'นาย', firstName: 'ปรานนท์', lastName: 'ศรีเสน่ห์', fullName: 'นาย ปรานนท์ ศรีเสน่ห์', firstNameEn: 'Puranon', lastNameEn: 'Sri-saneh', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '20028', prefix: 'นาย', firstName: 'ศรัญญู', lastName: 'เจนกระโทก', fullName: 'นาย ศรัญญู เจนกระโทก', firstNameEn: 'Saranyu', lastNameEn: 'Jenkathok', department: 'TW', division: 'P', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '20029', prefix: 'นาย', firstName: 'พิรยุทธ', lastName: 'สังข์ประไพ', fullName: 'นาย พิรยุทธ สังข์ประไพ', firstNameEn: 'Pirayut', lastNameEn: 'Sangpapi', department: 'RW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '20033', prefix: 'นาย', firstName: 'สราวุธ', lastName: 'พุทธฉาย', fullName: 'นาย สราวุธ พุทธฉาย', firstNameEn: 'Sarawut', lastNameEn: 'Puttachai', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '20035', prefix: 'นาย', firstName: 'ธีรเดช', lastName: 'ชำรัมย์', fullName: 'นาย ธีรเดช ชำรัมย์', firstNameEn: 'Thiradet', lastNameEn: 'Chamram', department: 'AD1', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '21007', prefix: 'นาย', firstName: 'รัฐพล', lastName: 'พลคำมาก', fullName: 'นาย รัฐพล พลคำมาก', firstNameEn: 'Rattapol', lastNameEn: 'Polkammak', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '21009', prefix: 'นาย', firstName: 'เดวิทชัย', lastName: 'ห้วยทราย', fullName: 'นาย เดวิทชัย ห้วยทราย', firstNameEn: 'Dewitchai', lastNameEn: 'Huaisrai', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '21010', prefix: 'นาย', firstName: 'ณัฐชัย', lastName: 'พลแสน', fullName: 'นาย ณัฐชัย พลแสน', firstNameEn: 'Natthachai', lastNameEn: 'Phonsaen', department: 'TR', division: 'TC', position: 'WORKER', isMasterRecord: true },
  { empId: '21015', prefix: 'นาย', firstName: 'ปิยะ', lastName: 'จิตรประเสริฐ', fullName: 'นาย ปิยะ จิตรประเสริฐ', firstNameEn: 'Piya', lastNameEn: 'Jitpaserd', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '21016', prefix: 'นาย', firstName: 'ไกรวิทย์', lastName: 'เรืองดาว', fullName: 'นาย ไกรวิทย์ เรืองดาว', firstNameEn: 'Kaiwit', lastNameEn: 'Rueangdao', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '21025', prefix: 'นาย', firstName: 'สมบัติ', lastName: 'อารี', fullName: 'นาย สมบัติ อารี', firstNameEn: 'Sombat', lastNameEn: 'Aree', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '21027', prefix: 'นาย', firstName: 'สาธิต', lastName: 'จำนงค์ฤทธิ์', fullName: 'นาย สาธิต จำนงค์ฤทธิ์', firstNameEn: 'Sathit', lastNameEn: 'Jumnongrit', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '21034', prefix: 'นาย', firstName: 'พิชัย', lastName: 'ศรีคำภา', fullName: 'นาย พิชัย ศรีคำภา', firstNameEn: 'Phichai', lastNameEn: 'Srikhampha', department: 'SEC', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '21035', prefix: 'นาย', firstName: 'เจษฎา', lastName: 'รามหริ่ง', fullName: 'นาย เจษฎา รามหริ่ง', firstNameEn: 'Jadsada', lastNameEn: 'Ramring', department: 'ST', division: 'P', position: 'WORKER', isMasterRecord: true },

  // Page 5 & 6 (86 - 128)
  { empId: '21036', prefix: 'นาย', firstName: 'จักรพันธ์', lastName: 'กำจรเจิด', fullName: 'นาย จักรพันธ์ กำจรเจิด', firstNameEn: 'Chakphan', lastNameEn: 'Kamchonchoed', department: 'ST', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '21044', prefix: 'นาย', firstName: 'พงษ์ศักดิ์', lastName: 'สุดใจ', fullName: 'นาย พงษ์ศักดิ์ สุดใจ', firstNameEn: 'Phongsak', lastNameEn: 'Sudjai', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '21045', prefix: 'นาย', firstName: 'เกียรติศักดิ์', lastName: 'รักไทย', fullName: 'นาย เกียรติศักดิ์ รักไทย', firstNameEn: 'Kiadtisak', lastNameEn: 'Rakthai', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '21058', prefix: 'นาย', firstName: 'ศุภอรรถ', lastName: 'กลิ่นเพ็ชร', fullName: 'นาย ศุภอรรถ กลิ่นเพ็ชร', firstNameEn: 'Suphaoat', lastNameEn: 'Klinphet', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '21062', prefix: 'นาย', firstName: 'ชลันทร', lastName: 'เพ็งคุ่ย', fullName: 'นาย ชลันทร เพ็งคุ่ย', firstNameEn: 'Charuntong', lastNameEn: 'Pengkut', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '21065', prefix: 'นาย', firstName: 'อนุรักษ์', lastName: 'รื่นบุญ', fullName: 'นาย อนุรักษ์ รื่นบุญ', firstNameEn: 'Anulux', lastNameEn: 'Luenboon', department: 'MN', division: 'MN', position: 'WORKER', isMasterRecord: true },
  { empId: '22002', prefix: 'นาย', firstName: 'เอกวิทย์', lastName: 'ดีสม', fullName: 'นาย เอกวิทย์ ดีสม', firstNameEn: 'Aekkawit', lastNameEn: 'Deesom', department: 'TR', division: 'TC', position: 'WORKER', isMasterRecord: true },
  { empId: '22007', prefix: 'นาย', firstName: 'สราวุฒิ', lastName: 'วิสาสูง', fullName: 'นาย สราวุฒิ วิสาสูง', firstNameEn: 'Sarawut', lastNameEn: 'Wisasung', department: 'ST', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22008', prefix: 'นาย', firstName: 'วรพจน์', lastName: 'ศรีสุวรรณโณ', fullName: 'นาย วรพจน์ ศรีสุวรรณโณ', firstNameEn: 'Worapot', lastNameEn: 'Srisuwanno', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22023', prefix: 'นาย', firstName: 'วุฒิไกร', lastName: 'ขอเชื่อมกลาง', fullName: 'นาย วุฒิไกร ขอเชื่อมกลาง', firstNameEn: 'Wutthikai', lastNameEn: 'Khochueamklang', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22024', prefix: 'นาย', firstName: 'กิ่งเพชร', lastName: 'ทัพเกษม', fullName: 'นาย กิ่งเพชร ทัพเกษม', firstNameEn: 'Gingpach', lastNameEn: 'Tabkasem', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22030', prefix: 'นาย', firstName: 'ศิวะ', lastName: 'คงอุบล', fullName: 'นาย ศิวะ คงอุบล', firstNameEn: 'Siwa', lastNameEn: 'Khong-u-bon', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22033', prefix: 'นาย', firstName: 'วิภู', lastName: 'สวัสดี', fullName: 'นาย วิภู สวัสดี', firstNameEn: 'Wiphoo', lastNameEn: 'Sawatdee', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22035', prefix: 'นาย', firstName: 'เรืองศักดิ์', lastName: 'แหล่งสนาม', fullName: 'นาย เรืองศักดิ์ แหล่งสนาม', firstNameEn: 'Ruaengsak', lastNameEn: 'Hlangsanam', department: 'FI', division: 'QA', position: 'LEADER', isMasterRecord: true },
  { empId: '22037', prefix: 'นาย', firstName: 'สุรเดช', lastName: 'จีบจอหอ', fullName: 'นาย สุรเดช จีบจอหอ', firstNameEn: 'Suradet', lastNameEn: 'Chipchoho', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22038', prefix: 'นาย', firstName: 'สมบูรณ์', lastName: 'เมี่ยงแก่', fullName: 'นาย สมบูรณ์ เมี่ยงแก่', firstNameEn: 'Somboon', lastNameEn: 'Miangkae', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22040', prefix: 'นาย', firstName: 'กิติพัฒน์', lastName: 'ทับเทศ', fullName: 'นาย กิติพัฒน์ ทับเทศ', firstNameEn: 'Kittiphat', lastNameEn: 'Thapthet', department: 'MN', division: 'MN', position: 'WORKER', isMasterRecord: true },
  { empId: '22054', prefix: 'นาย', firstName: 'ธนานันท์', lastName: 'ขำชะวี', fullName: 'นาย ธนานันท์ ขำชะวี', firstNameEn: 'Thananan', lastNameEn: 'Kamchawee', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22056', prefix: 'นาย', firstName: 'นัฐพล', lastName: 'กุฎีสุข', fullName: 'นาย นัฐพล กุฎีสุข', firstNameEn: 'Nuttapon', lastNameEn: 'Kudeesuk', department: 'MN', division: 'MN', position: 'WORKER', isMasterRecord: true },
  { empId: '22060', prefix: 'นาย', firstName: 'ธามินทร์', lastName: 'ดวงแก้ว', fullName: 'นาย ธามินทร์ ดวงแก้ว', firstNameEn: 'Thamin', lastNameEn: 'Duangkaeo', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22061', prefix: 'นาย', firstName: 'รัฐพงษ์', lastName: 'กล่ำมี', fullName: 'นาย รัฐพงษ์ กล่ำมี', firstNameEn: 'Rattapong', lastNameEn: 'Klammee', department: 'PS', division: 'PS', position: 'CLERK', isMasterRecord: true },
  { empId: '22064', prefix: 'นาย', firstName: 'พงษ์พจน์', lastName: 'สุวรรณเลิศ', fullName: 'นาย พงษ์พจน์ สุวรรณเลิศ', firstNameEn: 'Phongphot', lastNameEn: 'Suwannalert', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22065', prefix: 'นาย', firstName: 'วีรวิชญ์', lastName: 'ทองดี', fullName: 'นาย วีรวิชญ์ ทองดี', firstNameEn: 'Wirawit', lastNameEn: 'Thongdee', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22068', prefix: 'นาย', firstName: 'ธนู', lastName: 'ตรีนุมิตร', fullName: 'นาย ธนู ตรีนุมิตร', firstNameEn: 'Tanu', lastNameEn: 'Treenumit', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22069', prefix: 'นาย', firstName: 'อารัญ', lastName: 'คำเฉียง', fullName: 'นาย อารัญ คำเฉียง', firstNameEn: 'A-ran', lastNameEn: 'Khamchiang', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '22072', prefix: 'นาย', firstName: 'รังสรรค์', lastName: 'สำรวยสินธุ์', fullName: 'นาย รังสรรค์ สำรวยสินธุ์', firstNameEn: 'Rangsan', lastNameEn: 'Samruaisin', department: 'PP', division: 'PP', position: 'WORKER', isMasterRecord: true },
  { empId: '22074', prefix: 'นาย', firstName: 'เมฆสิทธิ์', lastName: 'เลขาลาวัณย์', fullName: 'นาย เมฆสิทธิ์ เลขาลาวัณย์', firstNameEn: 'Makkasit', lastNameEn: 'Lekhalawan', department: 'MN', division: 'MN', position: 'WORKER', isMasterRecord: true },
  { empId: '22075', prefix: 'นาย', firstName: 'กิตตินันท์', lastName: 'พวงทอง', fullName: 'นาย กิตตินันท์ พวงทอง', firstNameEn: 'Kittinan', lastNameEn: 'Phuangthong', department: 'TR', division: 'TC', position: 'WORKER', isMasterRecord: true },
  { empId: '23001', prefix: 'น.ส.', firstName: 'ทิฆัมพร', lastName: 'พิบูลย์', fullName: 'น.ส. ทิฆัมพร พิบูลย์', firstNameEn: 'Thikamporn', lastNameEn: 'Piboon', department: 'PS', division: 'PS', position: 'WORKER', isMasterRecord: true },
  { empId: '23003', prefix: 'นาย', firstName: 'เอกสิทธิ์', lastName: 'จันทะบาง', fullName: 'นาย เอกสิทธิ์ จันทะบาง', firstNameEn: 'Ek-kasit', lastNameEn: 'Janta-bang', department: 'FI', division: 'QA', position: 'LEADER', isMasterRecord: true },
  { empId: '23005', prefix: 'นาย', firstName: 'สมมนัส', lastName: 'ประสงค์ทรัพย์', fullName: 'นาย สมมนัส ประสงค์ทรัพย์', firstNameEn: 'Sommanat', lastNameEn: 'Prasongsup', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '23007', prefix: 'นาย', firstName: 'ปราชญา', lastName: 'ถนอมรูป', fullName: 'นาย ปราชญา ถนอมรูป', firstNameEn: 'Patchaya', lastNameEn: 'Tanomroop', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '23009', prefix: 'น.ส.', firstName: 'รัตนาภรณ์', lastName: 'พึ่งพันธุ์', fullName: 'น.ส. รัตนาภรณ์ พึ่งพันธุ์', firstNameEn: 'Rattanaphon', lastNameEn: 'Phuengphan', department: 'TR', division: 'TC', position: 'WORKER', isMasterRecord: true },
  { empId: '23011', prefix: 'นาย', firstName: 'มณฑล', lastName: 'บุญเรืองรอด', fullName: 'นาย มณฑล บุญเรืองรอด', firstNameEn: 'Monthol', lastNameEn: 'Boonrueangrod', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '23013', prefix: 'นาย', firstName: 'ทัศน์พล', lastName: 'ภูมิชูชิต', fullName: 'นาย ทัศน์พล ภูมิชูชิต', firstNameEn: 'Thatsaphon', lastNameEn: 'Phuchuchit', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '23020', prefix: 'นาย', firstName: 'สัชฌุกร', lastName: 'รอดกลาง', fullName: 'นาย สัชฌุกร รอดกลาง', firstNameEn: 'Sadchukorn', lastNameEn: 'Rodklang', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '23026', prefix: 'นาย', firstName: 'ภวัตเดช', lastName: 'ครองสัตย์', fullName: 'นาย ภวัตเดช ครองสัตย์', firstNameEn: 'Phawatdet', lastNameEn: 'Khrongsat', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '23030', prefix: 'นาย', firstName: 'สันติภาพ', lastName: 'ปลอดโปร่ง', fullName: 'นาย สันติภาพ ปลอดโปร่ง', firstNameEn: 'Santiphap', lastNameEn: 'Plodprong', department: 'RW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '23037', prefix: 'นาย', firstName: 'นนทบวร', lastName: 'นาดี', fullName: 'นาย นนทบวร นาดี', firstNameEn: 'Nontaborworn', lastNameEn: 'Nadee', department: 'MN', division: 'MN', position: 'WORKER', isMasterRecord: true },
  { empId: '23040', prefix: 'นาย', firstName: 'ธีระวัฒน์', lastName: 'สุขบัติ', fullName: 'นาย ธีระวัฒน์ สุขบัติ', firstNameEn: 'Thirawat', lastNameEn: 'Sukbat', department: 'AD2', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '23044', prefix: 'นาย', firstName: 'สมแพง', lastName: 'แสงสว่าง', fullName: 'นาย สมแพง แสงสว่าง', firstNameEn: 'Sompang', lastNameEn: 'Sangsawang', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '23045', prefix: 'นาย', firstName: 'นพรุจ', lastName: 'จันทร์ประสพพร', fullName: 'นาย นพรุจ จันทร์ประสพพร', firstNameEn: 'Nopparut', lastNameEn: 'Janpasoppon', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '23047', prefix: 'นาย', firstName: 'วุฒิชัย', lastName: 'จันพา', fullName: 'นาย วุฒิชัย จันพา', firstNameEn: 'Wutthichai', lastNameEn: 'Janpha', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },

  // Page 7 & 8 (129 - 171)
  { empId: '24008', prefix: 'นาย', firstName: 'อธิพงษ์', lastName: 'ใบรัก', fullName: 'นาย อธิพงษ์ ใบรัก', firstNameEn: 'Atiphong', lastNameEn: 'Bailuk', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24014', prefix: 'นาย', firstName: 'อจลวิชญ์', lastName: 'ลาภร้าย', fullName: 'นาย อจลวิชญ์ ลาภร้าย', firstNameEn: 'Ajalawit', lastNameEn: 'Laprai', department: 'PP', division: 'PP', position: 'WORKER', isMasterRecord: true },
  { empId: '24015', prefix: 'นาย', firstName: 'พิษณุ', lastName: 'กลัดเนินกุ่ม', fullName: 'นาย พิษณุ กลัดเนินกุ่ม', firstNameEn: 'Phitsanu', lastNameEn: 'Klatnoenkam', department: 'PP', division: 'PP', position: 'WORKER', isMasterRecord: true },
  { empId: '24018', prefix: 'นาย', firstName: 'อนุพงษ์', lastName: 'ศรีประเสริฐ', fullName: 'นาย อนุพงษ์ ศรีประเสริฐ', firstNameEn: 'Anupong', lastNameEn: 'Sriprasert', department: 'PP', division: 'PP', position: 'WORKER', isMasterRecord: true },
  { empId: '24019', prefix: 'น.ส.', firstName: 'ธนภรณ์', lastName: 'ทองแกมใบ', fullName: 'น.ส. ธนภรณ์ ทองแกมใบ', firstNameEn: 'Thanaporn', lastNameEn: 'Tongkambai', department: 'FI', division: 'QA', position: 'LEADER', isMasterRecord: true },
  { empId: '24021', prefix: 'นาย', firstName: 'ฉลอง', lastName: 'พงษ์สุระ', fullName: 'นาย ฉลอง พงษ์สุระ', firstNameEn: 'Chalong', lastNameEn: 'Phongsura', department: 'AD1', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24022', prefix: 'นาง', firstName: 'วิภาดา', lastName: 'อินทะรังษี', fullName: 'นาง วิภาดา อินทะรังษี', firstNameEn: 'Wipada', lastNameEn: 'Aintharangsee', department: 'FI', division: 'QA', position: 'CLERK', isMasterRecord: true },
  { empId: '24024', prefix: 'น.ส.', firstName: 'ศิริลักษณ์', lastName: 'วรชัยสกุล', fullName: 'น.ส. ศิริลักษณ์ วรชัยสกุล', firstNameEn: 'Sirilak', lastNameEn: 'Worachaisakun', department: 'PS', division: 'PS', position: 'CLERK', isMasterRecord: true },
  { empId: '24025', prefix: 'นาย', firstName: 'กัมปนาท', lastName: 'ความตั้งใจ', fullName: 'นาย กัมปนาท ความตั้งใจ', firstNameEn: 'Kampanat', lastNameEn: 'Khwamtangjai', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24026', prefix: 'นาย', firstName: 'นิพนธ์', lastName: 'สีนิล', fullName: 'นาย นิพนธ์ สีนิล', firstNameEn: 'Nipon', lastNameEn: 'Seenin', department: 'ST', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24027', prefix: 'นาย', firstName: 'คาเมโธ', lastName: 'ฟักเถา', fullName: 'นาย คาเมโธ ฟักเถา', firstNameEn: 'Khametho', lastNameEn: 'Fakthao', department: 'ST', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24029', prefix: 'นาย', firstName: 'อัยการ', lastName: 'สีสาย', fullName: 'นาย อัยการ สีสาย', firstNameEn: 'Aiyakarn', lastNameEn: 'Seesai', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24031', prefix: 'นาย', firstName: 'ไพฑูรย์', lastName: 'วันทองสุข', fullName: 'นาย ไพฑูรย์ วันทองสุข', firstNameEn: 'Paitoon', lastNameEn: 'Wanthongsuk', department: 'RW', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '24032', prefix: 'นาย', firstName: 'จักรกฤษ', lastName: 'ยิ่งดอน', fullName: 'นาย จักรกฤษ ยิ่งดอน', firstNameEn: 'Jakkrit', lastNameEn: 'Yingdon', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24034', prefix: 'นาย', firstName: 'ปฏิวัติ', lastName: 'เอี่ยมแทน', fullName: 'นาย ปฏิวัติ เอี่ยมแทน', firstNameEn: 'Patiwat', lastNameEn: 'Iamtaen', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24040', prefix: 'นาย', firstName: 'รติพงษ์', lastName: 'ทองโคกสี', fullName: 'นาย รติพงษ์ ทองโคกสี', firstNameEn: 'Ratipong', lastNameEn: 'Thongkhoksee', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24042', prefix: 'นาย', firstName: 'จารุกิตติ์', lastName: 'ผดุงจรูญ', fullName: 'นาย จารุกิตติ์ ผดุงจรูญ', firstNameEn: 'Jarukit', lastNameEn: 'Phadungjaroon', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24043', prefix: 'นาย', firstName: 'อิทธิพงษ์', lastName: 'ประยูรทอง', fullName: 'นาย อิทธิพงษ์ ประยูรทอง', firstNameEn: 'Aitthiphngs', lastNameEn: 'Paryoonthong', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24045', prefix: 'นาย', firstName: 'อภิเทพ', lastName: 'ขันธีศรี', fullName: 'นาย อภิเทพ ขันธีศรี', firstNameEn: 'Apithep', lastNameEn: 'Kanteesri', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24046', prefix: 'นาย', firstName: 'ปรณัฐ', lastName: 'ใคร่ครวญ', fullName: 'นาย ปรณัฐ ใคร่ครวญ', firstNameEn: 'Poranut', lastNameEn: 'Kaikaun', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24048', prefix: 'นาย', firstName: 'ปรัชญา', lastName: 'ผลประเสริฐ', fullName: 'นาย ปรัชญา ผลประเสริฐ', firstNameEn: 'Pratchaya', lastNameEn: 'Phonprasroeth', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24049', prefix: 'นาย', firstName: 'นรินทร์', lastName: 'มีแสง', fullName: 'นาย นรินทร์ มีแสง', firstNameEn: 'Narin', lastNameEn: 'Meesang', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24050', prefix: 'นาย', firstName: 'วิรัตน์', lastName: 'รุ่งแจ้ง', fullName: 'นาย วิรัตน์ รุ่งแจ้ง', firstNameEn: 'Wirat', lastNameEn: 'Rangjang', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24051', prefix: 'นาย', firstName: 'วิมล', lastName: 'ดอกชะเอม', fullName: 'นาย วิมล ดอกชะเอม', firstNameEn: 'Wimol', lastNameEn: 'Dokchaaem', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '24054', prefix: 'นาย', firstName: 'ภาณุเดช', lastName: 'อรุณ', fullName: 'นาย ภาณุเดช อรุณ', firstNameEn: 'Phanudet', lastNameEn: 'Arun', department: 'TR', division: 'TC', position: 'WORKER', isMasterRecord: true },
  { empId: '24055', prefix: 'นาย', firstName: 'ชินวัตร', lastName: 'อ่ำทิม', fullName: 'นาย ชินวัตร อ่ำทิม', firstNameEn: 'Chinawat', lastNameEn: 'Umtim', department: 'MN', division: 'MN', position: 'WORKER', isMasterRecord: true },
  { empId: '24057', prefix: 'นาย', firstName: 'เสน่ห์', lastName: 'มังกรทอง', fullName: 'นาย เสน่ห์ มังกรทอง', firstNameEn: 'Sane', lastNameEn: 'Mangkonthong', department: 'SEC', division: 'P', position: 'CLERK', isMasterRecord: true },
  { empId: '25001', prefix: 'นาย', firstName: 'สละ', lastName: 'สุดเอก', fullName: 'นาย สละ สุดเอก', firstNameEn: 'Sala', lastNameEn: 'Sud-eak', department: 'PS', division: 'PS', position: 'WORKER', isMasterRecord: true },
  { empId: '25003', prefix: 'นาย', firstName: 'ชนาธิป', lastName: 'นาระถี', fullName: 'นาย ชนาธิป นาระถี', firstNameEn: 'Chanathip', lastNameEn: 'Narathi', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25006', prefix: 'นาย', firstName: 'ธีรพร', lastName: 'แพร่หลาย', fullName: 'นาย ธีรพร แพร่หลาย', firstNameEn: 'Teeraporn', lastNameEn: 'Prealai', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25007', prefix: 'นาย', firstName: 'วัชรพงษ์', lastName: 'รักอยู่', fullName: 'นาย วัชรพงษ์ รักอยู่', firstNameEn: 'Watcharapong', lastNameEn: 'Rukyoo', department: 'RW', division: 'P', position: 'CLERK', isMasterRecord: true },
  { empId: '25008', prefix: 'นาย', firstName: 'ถิรวัฒน์', lastName: 'สัมฤทธิ์', fullName: 'นาย ถิรวัฒน์ สัมฤทธิ์', firstNameEn: 'Thirawat', lastNameEn: 'Samlit', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25010', prefix: 'นาย', firstName: 'เวทกริช', lastName: 'เตียเจริญ', fullName: 'นาย เวทกริช เตียเจริญ', firstNameEn: 'Wettakrit', lastNameEn: 'Tiachareon', department: 'ST', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25012', prefix: 'นาย', firstName: 'พลวัต', lastName: 'อยู่แป้น', fullName: 'นาย พลวัต อยู่แป้น', firstNameEn: 'Pollawat', lastNameEn: 'Youpaen', department: 'RW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25014', prefix: 'น.ส.', firstName: 'อัจฉริยา', lastName: 'กรอบแป้น', fullName: 'น.ส. อัจฉริยา กรอบแป้น', firstNameEn: 'Atchariya', lastNameEn: 'Krobpaen', department: 'TC', division: 'TC', position: 'MANAGER', isMasterRecord: true },
  { empId: '25022', prefix: 'นาย', firstName: 'อานนท์', lastName: 'แสงเสงี่ยม', fullName: 'นาย อานนท์ แสงเสงี่ยม', firstNameEn: 'Anon', lastNameEn: 'Sangsagem', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25023', prefix: 'น.ส.', firstName: 'มณีนุช', lastName: 'วิไลวรรณ', fullName: 'น.ส. มณีนุช วิไลวรรณ', firstNameEn: 'Maneenooch', lastNameEn: 'Vilaiwan', department: 'PP', division: 'PP', position: 'CLERK', isMasterRecord: true },
  { empId: '25024', prefix: 'นาย', firstName: 'ศิวารุต', lastName: 'ตันทะตุ่น', fullName: 'นาย ศิวารุต ตันทะตุ่น', firstNameEn: 'Siwarut', lastNameEn: 'Tantatun', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25025', prefix: 'นาย', firstName: 'สมพัฒน์', lastName: 'เจือจันทร์', fullName: 'นาย สมพัฒน์ เจือจันทร์', firstNameEn: 'Somphat', lastNameEn: 'Chueachan', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25027', prefix: 'นาย', firstName: 'อานนท์', lastName: 'ทองแกมใบ', fullName: 'นาย อานนท์ ทองแกมใบ', firstNameEn: 'A-non', lastNameEn: 'Thongkaembai', department: 'MN', division: 'MN', position: 'CLERK', isMasterRecord: true },
  { empId: '25028', prefix: 'นาย', firstName: 'ระมาศ', lastName: 'สาสุข', fullName: 'นาย ระมาศ สาสุข', firstNameEn: 'Ramat', lastNameEn: 'Sasuk', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25031', prefix: 'นาย', firstName: 'ธนากร', lastName: 'ธนุคคามิน', fullName: 'นาย ธนากร ธนุคคามิน', firstNameEn: 'Thanakorn', lastNameEn: 'Tanukkamin', department: 'RW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25033', prefix: 'นาย', firstName: 'ไชยวัฒน์', lastName: 'สิงหา', fullName: 'นาย ไชยวัฒน์ สิงหา', firstNameEn: 'Chaiwat', lastNameEn: 'Singha', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },

  // Page 9 & 10 (172 - 214)
  { empId: '25035', prefix: 'นาย', firstName: 'สุวัตร์', lastName: 'โตประเทศ', fullName: 'นาย สุวัตร์ โตประเทศ', firstNameEn: 'Suwat', lastNameEn: 'Topatad', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25037', prefix: 'นาย', firstName: 'ชาคริต', lastName: 'ไหมศรีกรด', fullName: 'นาย ชาคริต ไหมศรีกรด', firstNameEn: 'Chakrit', lastNameEn: 'Maisrikrod', department: 'ST', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '25039', prefix: 'นาย', firstName: 'กฤติน', lastName: 'อัมพร', fullName: 'นาย กฤติน อัมพร', firstNameEn: 'Krittin', lastNameEn: 'Amporn', department: 'ST', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25042', prefix: 'นาย', firstName: 'อติกานต์', lastName: 'สันติตรานนท์', fullName: 'นาย อติกานต์ สันติตรานนท์', firstNameEn: 'Atikan', lastNameEn: 'Suntitranon', department: 'ST', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25043', prefix: 'นาย', firstName: 'ศตวรรษ', lastName: 'มลสิน', fullName: 'นาย ศตวรรษ มลสิน', firstNameEn: 'Sattawat', lastNameEn: 'Molsin', department: 'TR', division: 'TC', position: 'WORKER', isMasterRecord: true },
  { empId: '25044', prefix: 'นาย', firstName: 'ปรินทรฉัตร', lastName: 'อนันตศักดิ์ธำรง', fullName: 'นาย ปรินทรฉัตร อนันตศักดิ์ธำรง', firstNameEn: 'Parinchat', lastNameEn: 'Anatasaktrumrong', department: 'TR', division: 'TC', position: 'WORKER', isMasterRecord: true },
  { empId: '25045', prefix: 'นาย', firstName: 'ชาตรี', lastName: 'สีดำ', fullName: 'นาย ชาตรี สีดำ', firstNameEn: 'Chatree', lastNameEn: 'Seedam', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25046', prefix: 'น.ส.', firstName: 'ชลิตา', lastName: 'บุตรพยาสาร', fullName: 'น.ส. ชลิตา บุตรพยาสาร', firstNameEn: 'Chalita', lastNameEn: 'Butpayasar', department: 'PS', division: 'PS', position: 'CLERK', isMasterRecord: true },
  { empId: '25051', prefix: 'นาย', firstName: 'ธนดล', lastName: 'ลาภหนุน', fullName: 'นาย ธนดล ลาภหนุน', firstNameEn: 'Thanadol', lastNameEn: 'Lapnoon', department: 'ST', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25052', prefix: 'น.ส.', firstName: 'ปัทมา', lastName: 'ขุนแก้วพระเนาว์', fullName: 'น.ส. ปัทมา ขุนแก้วพระเนาว์', firstNameEn: 'Pattama', lastNameEn: 'Khunkaewpranao', department: 'QA', division: 'QA', position: 'CLERK', isMasterRecord: true },
  { empId: '25054', prefix: 'นาย', firstName: 'ทวีทรัพย์', lastName: 'แก่นนาคำ', fullName: 'นาย ทวีทรัพย์ แก่นนาคำ', firstNameEn: 'Thaveesup', lastNameEn: 'Chainakam', department: 'TW', division: 'P', position: 'CLERK', isMasterRecord: true },
  { empId: '25055', prefix: 'นาย', firstName: 'จักรพงษ์', lastName: 'มีศิลป์', fullName: 'นาย จักรพงษ์ มีศิลป์', firstNameEn: 'Jakkaphong', lastNameEn: 'Meesin', department: 'RW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25056', prefix: 'นาย', firstName: 'ณฐวัตร', lastName: 'พงษ์สาริกิจ', fullName: 'นาย ณฐวัตร พงษ์สาริกิจ', firstNameEn: 'Natawat', lastNameEn: 'Phongsarikit', department: 'PS', division: 'PS', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '25059', prefix: 'นาย', firstName: 'กิตติพงศ์', lastName: 'แก้วศรีสุข', fullName: 'นาย กิตติพงศ์ แก้วศรีสุข', firstNameEn: 'Kittipong', lastNameEn: 'Kaewsrisuk', department: 'ST', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25061', prefix: 'นาย', firstName: 'วุฒิชัย', lastName: 'กระแสวาศ', fullName: 'นาย วุฒิชัย กระแสวาศ', firstNameEn: 'Wutthichai', lastNameEn: 'Krasawad', department: 'ST', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25062', prefix: 'น.ส.', firstName: 'เพ็ญนภา', lastName: 'ศรีนรจันทร์', fullName: 'น.ส. เพ็ญนภา ศรีนรจันทร์', firstNameEn: 'Pennapa', lastNameEn: 'Srinorajan', department: 'P', division: 'P', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '25063', prefix: 'น.ส.', firstName: 'พิมพ์รจน์', lastName: 'วงษ์สา', fullName: 'น.ส. พิมพ์รจน์ วงษ์สา', firstNameEn: 'Pimroj', lastNameEn: 'Wongsa', department: 'CO', division: 'CO', position: 'MANAGER', isMasterRecord: true },
  { empId: '25064', prefix: 'นาย', firstName: 'สุวิทย์', lastName: 'ช่างทำ', fullName: 'นาย สุวิทย์ ช่างทำ', firstNameEn: 'Suwit', lastNameEn: 'Changtom', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '25067', prefix: 'นาย', firstName: 'ธนสรณ์', lastName: 'ชุ่มมิ', fullName: 'นาย ธนสรณ์ ชุ่มมิ', firstNameEn: 'Tanason', lastNameEn: 'Chummi', department: 'TR', division: 'TC', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '25070', prefix: 'นาย', firstName: 'วัชระ', lastName: 'อินต๊ะ', fullName: 'นาย วัชระ อินต๊ะ', firstNameEn: 'Watchara', lastNameEn: 'In-ta', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '26001', prefix: 'น.ส.', firstName: 'ภัทรธิดา', lastName: 'ปิ่นศรี', fullName: 'น.ส. ภัทรธิดา ปิ่นศรี', firstNameEn: 'Phattaratida', lastNameEn: 'Pinsri', department: 'TC', division: 'TC', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '26004', prefix: 'นาย', firstName: 'คมสัน', lastName: 'พวงมาลัย', fullName: 'นาย คมสัน พวงมาลัย', firstNameEn: 'Komsan', lastNameEn: 'Poungmalai', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '26005', prefix: 'นาย', firstName: 'วรวุฒิ', lastName: 'พิมพ์แสง', fullName: 'นาย วรวุฒิ พิมพ์แสง', firstNameEn: 'Worawut', lastNameEn: 'Phimsaeng', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '26010', prefix: 'นาย', firstName: 'เกรียงไกร', lastName: 'เพ็งอบเชย', fullName: 'นาย เกรียงไกร เพ็งอบเชย', firstNameEn: 'Kreangkai', lastNameEn: 'Pengobchery', department: 'FI', division: 'QA', position: 'WORKER', isMasterRecord: true },
  { empId: '26012', prefix: 'น.ส.', firstName: 'พิมล', lastName: 'หลักคำ', fullName: 'น.ส. พิมล หลักคำ', firstNameEn: 'Phimon', lastNameEn: 'Lakkham', department: 'FI', division: 'QA', position: 'WORKER', isMasterRecord: true },
  { empId: '26013', prefix: 'นาย', firstName: 'ศรายุทธ', lastName: 'ไชยปัดถา', fullName: 'นาย ศรายุทธ ไชยปัดถา', firstNameEn: 'Sarayut', lastNameEn: 'Chaipattha', department: 'FI', division: 'QA', position: 'WORKER', isMasterRecord: true },
  { empId: '26015', prefix: 'นาย', firstName: 'ธนากร', lastName: 'พระมะโส', fullName: 'นาย ธนากร พระมะโส', firstNameEn: 'Tanakorn', lastNameEn: 'Pramaso', department: 'FI', division: 'QA', position: 'WORKER', isMasterRecord: true },
  { empId: '26016', prefix: 'นาย', firstName: 'นิพล', lastName: 'มนัสสา', fullName: 'นาย นิพล มนัสสา', firstNameEn: 'Nipol', lastNameEn: 'Manassa', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '26019', prefix: 'นาย', firstName: 'คณิต', lastName: 'คลังวิเชียร', fullName: 'นาย คณิต คลังวิเชียร', firstNameEn: 'Khanit', lastNameEn: 'Khlangwichian', department: 'TR', division: 'TC', position: 'WORKER', isMasterRecord: true },
  { empId: '26021', prefix: 'นาย', firstName: 'คุณากร', lastName: 'สีตังตา', fullName: 'นาย คุณากร สีตังตา', firstNameEn: 'Khunakon', lastNameEn: 'Seetangta', department: 'TR', division: 'TC', position: 'WORKER', isMasterRecord: true },
  { empId: '26022', prefix: 'นาย', firstName: 'ชัยชนะ', lastName: 'อุดม', fullName: 'นาย ชัยชนะ อุดม', firstNameEn: 'Chaichana', lastNameEn: 'Udom', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '26024', prefix: 'นาย', firstName: 'อาณัติ', lastName: 'แสงเสงี่ยม', fullName: 'นาย อาณัติ แสงเสงี่ยม', firstNameEn: 'Arnut', lastNameEn: 'Sangsangiam', department: 'RW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '26025', prefix: 'นาย', firstName: 'รัชชานนท์', lastName: 'ช่างพลอย', fullName: 'นาย รัชชานนท์ ช่างพลอย', firstNameEn: 'Ratcharnon', lastNameEn: 'Changploy', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '26026', prefix: 'นาย', firstName: 'ทวีศักดิ์', lastName: 'สร้อยคำ', fullName: 'นาย ทวีศักดิ์ สร้อยคำ', firstNameEn: 'Thaweesak', lastNameEn: 'Soikum', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '26027', prefix: 'นาย', firstName: 'ปกรณ์', lastName: 'อ้วนเสมอ', fullName: 'นาย ปกรณ์ อ้วนเสมอ', firstNameEn: 'Pakorn', lastNameEn: 'Ounsamer', department: 'TR', division: 'TC', position: 'WORKER', isMasterRecord: true },
  { empId: '26028', prefix: 'นาย', firstName: 'ศรราม', lastName: 'วิสุวงษ์', fullName: 'นาย ศรราม วิสุวงษ์', firstNameEn: 'Sonram', lastNameEn: 'Wisuwong', department: 'TR', division: 'TC', position: 'WORKER', isMasterRecord: true },
  { empId: '26029', prefix: 'นาย', firstName: 'ณัติพงษ์', lastName: 'เกาะกิ่ง', fullName: 'นาย ณัติพงษ์ เกาะกิ่ง', firstNameEn: 'Natipong', lastNameEn: 'Koking', department: 'RW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '26035', prefix: 'นาย', firstName: 'สุรวัชร์', lastName: 'ละราคี', fullName: 'นาย สุรวัชร์ ละราคี', firstNameEn: 'Surawat', lastNameEn: 'Larakhi', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '26036', prefix: 'นาย', firstName: 'ณัฐวัฒน์', lastName: 'อุดพ่วย', fullName: 'นาย ณัฐวัฒน์ อุดพ่วย', firstNameEn: 'Natthawat', lastNameEn: 'Autphual', department: 'RW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '26037', prefix: 'นาย', firstName: 'วีระพงษ์', lastName: 'สิงห์ไชย', fullName: 'นาย วีระพงษ์ สิงห์ไชย', firstNameEn: 'Weerapong', lastNameEn: 'Singchai', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '26038', prefix: 'นาย', firstName: 'ทิชากร', lastName: 'เหลืองอร่าม', fullName: 'นาย ทิชากร เหลืองอร่าม', firstNameEn: 'Thichakon', lastNameEn: 'Lueang-aram', department: 'TW', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '26039', prefix: 'น.ส.', firstName: 'วรรณนภา', lastName: 'หยกคชาธาร', fullName: 'น.ส. วรรณนภา หยกคชาธาร', firstNameEn: 'Wannapha', lastNameEn: 'Yokkachatan', department: 'QA', division: 'QA', position: 'CLERK', isMasterRecord: true },
  { empId: '26040', prefix: 'นาย', firstName: 'พัทธรดนย์', lastName: 'แย้มจำรัส', fullName: 'นาย พัทธรดนย์ แย้มจำรัส', firstNameEn: 'Phattaradon', lastNameEn: 'Yaemjamrat', department: 'FI', division: 'QA', position: 'WORKER', isMasterRecord: true },

  // Page 11 & 12 (215 - 224)
  { empId: '26041', prefix: 'นาย', firstName: 'ธนากร', lastName: 'ดวงจิตร', fullName: 'นาย ธนากร ดวงจิตร', firstNameEn: 'Thanakon', lastNameEn: 'Duangjit', department: 'ESH', division: 'ESH', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '26042', prefix: 'นาย', firstName: 'วิรุฬ', lastName: 'แรงเขตกรรม', fullName: 'นาย วิรุฬ แรงเขตกรรม', firstNameEn: 'Wirun', lastNameEn: 'Raengkhetkam', department: 'MN', division: 'MN', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '26043', prefix: 'นาย', firstName: 'สรายุทธ์', lastName: 'แสนแก้ว', fullName: 'นาย สรายุทธ์ แสนแก้ว', firstNameEn: 'Sarayuth', lastNameEn: 'Saenkaew', department: 'SEC', division: 'P', position: 'WORKER', isMasterRecord: true },
  { empId: '96011', prefix: 'นาย', firstName: 'ยงยุทธ', lastName: 'คำวอน', fullName: 'นาย ยงยุทธ คำวอน', firstNameEn: 'Yongyuth', lastNameEn: 'Kamvorn', department: 'PP', division: 'PP', position: 'MANAGER', isMasterRecord: true },
  { empId: '97016', prefix: 'น.ส.', firstName: 'ประไพ', lastName: 'คงเพียรธรรม', fullName: 'น.ส. ประไพ คงเพียรธรรม', firstNameEn: 'Prapai', lastNameEn: 'Kongphiantham', department: 'FI', division: 'QA', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '97033', prefix: 'นาย', firstName: 'นัตติกรณ์', lastName: 'ทองประสานศรี', fullName: 'นาย นัตติกรณ์ ทองประสานศรี', firstNameEn: 'Nattikron', lastNameEn: 'Tongpasansee', department: 'ST', division: 'P', position: 'SUPERVISOR', isMasterRecord: true },
  { empId: '98014', prefix: 'นาย', firstName: 'ธรรมนูญ', lastName: 'จันทะบาง', fullName: 'นาย ธรรมนูญ จันทะบาง', firstNameEn: 'Thammanoon', lastNameEn: 'Chantabang', department: 'FI', division: 'QA', position: 'SENIOR LEADER', isMasterRecord: true },
  { empId: '98028', prefix: 'นาย', firstName: 'วัชรพล', lastName: 'กุลมา', fullName: 'นาย วัชรพล กุลมา', firstNameEn: 'Vatcharapon', lastNameEn: 'Kunma', department: 'TW', division: 'P', position: 'LEADER', isMasterRecord: true },
  { empId: '99023', prefix: 'นาย', firstName: 'สุบรรณ', lastName: 'ขำคล้าย', fullName: 'นาย สุบรรณ ขำคล้าย', firstNameEn: 'Suban', lastNameEn: 'Kumklai', department: 'P', division: 'P', position: 'MANAGER', isMasterRecord: true },
  { empId: '99031', prefix: 'นาย', firstName: 'วิเชียร', lastName: 'บุญครอบ', fullName: 'นาย วิเชียร บุญครอบ', firstNameEn: 'Vichian', lastNameEn: 'Boonkrob', department: 'PP', division: 'PP', position: 'LEADER', isMasterRecord: true }
];

// Backwards compatibility alias
export const MASTER_EMPLOYEE_ROSTER_230 = MASTER_EMPLOYEE_ROSTER_224;

/**
 * Division Lookup & Formal Labels
 */
export const MASTER_DIVISIONS_MAP: Record<string, { nameTh: string; nameEn: string; color: string }> = {
  'P': { nameTh: 'ฝ่ายผลิต', nameEn: 'Production Division', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  'TC': { nameTh: 'ฝ่ายเทคนิค', nameEn: 'Technical Division', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  'PP': { nameTh: 'ฝ่ายวางแผนการผลิต', nameEn: 'Production Planning Division', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  'MN': { nameTh: 'ฝ่ายซ่อมบำรุง', nameEn: 'Maintenance Division', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  'PS': { nameTh: 'ฝ่ายบุคคลและธุรการ', nameEn: 'Personnel & Administration Division', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  'QA': { nameTh: 'ฝ่ายประกันคุณภาพ', nameEn: 'Quality Assurance Division', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  'ESH': { nameTh: 'ฝ่ายความปลอดภัยและสิ่งแวดล้อม', nameEn: 'ESH Division', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  'CO': { nameTh: 'ฝ่ายบริหาร / สำนักงาน', nameEn: 'Corporate Office', color: 'bg-slate-100 text-slate-800 border-slate-300' }
};

/**
 * Returns the complete master employee roster containing all 224 verified employees.
 * Automatically synchronizes with persistent browser storage.
 */
export function getMasterEmployeeRoster(): PredefinedEmployee[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(MASTER_EMPLOYEE_STORAGE_KEY) : null;
    if (raw) {
      const parsed: PredefinedEmployee[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 224) {
        return parsed;
      }
    }
  } catch (e) {
    console.debug('Failed to read master employee registry from storage', e);
  }

  // Fallback to static pristine list
  const sanitizedList = MASTER_EMPLOYEE_ROSTER_224.map(emp => {
    const sanitized = sanitizeThaiName({
      prefix: emp.prefix,
      firstName: emp.firstName,
      lastName: emp.lastName,
      fullName: emp.fullName
    });
    return {
      ...emp,
      prefix: sanitized.prefix,
      firstName: sanitized.firstName,
      lastName: sanitized.lastName,
      fullName: sanitized.fullName
    };
  });

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(MASTER_EMPLOYEE_STORAGE_KEY, JSON.stringify(sanitizedList));
    } catch (e) {}
  }

  return sanitizedList;
}

/**
 * Lookup employee by Employee ID (5 digits, case-insensitive, with zero-padding support)
 */
export function findMasterEmployeeById(empId: string): PredefinedEmployee | undefined {
  if (!empId) return undefined;
  const cleanId = empId.trim().toUpperCase().padStart(5, '0');
  const roster = getMasterEmployeeRoster();
  return roster.find(e => e.empId.trim().toUpperCase() === cleanId || e.empId.trim().toUpperCase() === empId.trim().toUpperCase());
}

/**
 * Save or update an employee in the Master Employee Registry (Protected Permanent Storage)
 */
export function saveMasterEmployeeRecord(employee: PredefinedEmployee): boolean {
  try {
    const roster = getMasterEmployeeRoster();
    const cleanId = employee.empId.trim().toUpperCase();
    const existingIndex = roster.findIndex(e => e.empId.trim().toUpperCase() === cleanId);

    const updatedEmployee: PredefinedEmployee = {
      ...employee,
      empId: cleanId,
      fullName: employee.fullName || `${employee.prefix || 'นาย'} ${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      isMasterRecord: true
    };

    if (existingIndex >= 0) {
      roster[existingIndex] = { ...roster[existingIndex], ...updatedEmployee };
    } else {
      roster.push(updatedEmployee);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(MASTER_EMPLOYEE_STORAGE_KEY, JSON.stringify(roster));
    }
    return true;
  } catch (e) {
    console.error('Failed to save master employee record', e);
    return false;
  }
}
