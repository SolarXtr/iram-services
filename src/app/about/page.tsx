'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Layers, 
  Settings, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldAlert, 
  Calendar, 
  Database,
  Code,
  CheckCircle,
  HelpCircle,
  FileText,
  User,
  RefreshCw
} from 'lucide-react';

export default function AboutProjectPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f9f5ee] text-[#4c3c31]">
        Loading Project Portfolio...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5ee] text-[#3c2f25] pb-16 font-sans selection:bg-[#d97706]/20 selection:text-[#3c2f25]">
      
      {/* Premium Gradient Banner */}
      <div className="bg-gradient-to-r from-[#d97706] to-[#b45309] text-[#fdfcf9] py-12 px-8 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="h-4.5 w-4.5 animate-pulse" />
              <span>Project Development Portfolio</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight font-serif">เกี่ยวกับโครงการ iRAM Services</h1>
            <p className="text-sm opacity-90 mt-2 font-medium max-w-2xl">
              บันทึกเส้นทางการวิจัย วางแผน พัฒนาระบบ และแนวทางการทำงานของระบบจัดการโครงการวิจัยวิชาการและรางวัลการตีพิมพ์
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="/dashboard"
              className="bg-[#fdfcf9] hover:bg-[#ebdccf] text-[#3c2f25] px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <span>แดชบอร์ดหลัก</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a 
              href="/my-workspace"
              className="bg-black/20 hover:bg-black/35 text-white border border-[#fdfcf9]/30 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>พื้นที่ทำงานนักวิจัย</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-12 space-y-12">
        
        {/* Profile Card / Developer Section */}
        <section className="bg-[#fdfcf9] border border-[#ebdccf] rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-[#ebdccf] flex items-center justify-center shrink-0 border-2 border-[#d97706]/40 text-[#b45309]">
            <User className="w-12 h-12" />
          </div>
          <div className="space-y-3 text-center md:text-left">
            <span className="bg-[#f5e6d3] text-[#b45309] border border-[#ebdccf] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Lead Software Engineer & Designer
            </span>
            <h2 className="text-2xl font-bold font-serif">ผู้พัฒนาและสถาปนิกออกแบบระบบ</h2>
            <p className="text-sm text-[#7a685c] leading-relaxed max-w-3xl">
              รับผิดชอบการออกแบบสถาปัตยกรรมระบบเชื่อมต่อ Cloudflare Edge Platform, จัดทำฐานข้อมูล D1 Relational DB, ออกแบบ UI/UX ธีมสีอุ่นพรีเมียม (Warm Aesthetics) และแก้ไขช่องโหว่ด้านสิทธิ์การจัดการข้อมูลให้ตรงตามความต้องการทางธุรกิจอย่างปลอดภัย
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#b45309] pt-3.5 border-t border-[#ebdccf]/60 mt-4 justify-center md:justify-start">
              <span>Developed by Antigravity v2.1.4</span>
              <span className="text-[#ebdccf] hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <a href="mailto:tinnakornh@gmail.com" className="underline hover:text-[#d97706] transition-colors">TINNAKORNH</a>
              </span>
            </div>
          </div>
        </section>

        {/* Timeline Grid (Planning & Steps) */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#3c2f25] border-b border-[#ebdccf] pb-3 flex items-center gap-2 font-serif">
            <Calendar className="h-5.5 w-5.5 text-[#b45309]" />
            <span>กระบวนการทำงานแบบเป็นขั้นตอน (Development Timeline)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl p-6 shadow-sm hover:border-[#d97706] transition-all">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-[#d97706] flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="font-bold text-base">การริเริ่มและการวางแผน (Initiative & Schema)</h3>
              <p className="text-xs text-[#7a685c] mt-2.5 leading-relaxed">
                วิเคราะห์ความสอดคล้องของข้อมูลของระบบระหว่าง Cloudflare Workers และ Pages ให้ดึงข้อมูลจากแหล่งฐานข้อมูลออนไลน์ D1 ชุดเดียวกัน พร้อมวางโครงร่างตารางข้อมูลผู้ใช้ (Users), โครงการ (Projects), บทความ (Publications) และคิวนัดหมาย (Consultations)
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl p-6 shadow-sm hover:border-[#d97706] transition-all">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-[#d97706] flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="font-bold text-base">การพัฒนาและการรันระบบ (Development Phase)</h3>
              <p className="text-xs text-[#7a685c] mt-2.5 leading-relaxed">
                เขียน API Endpoint รองรับการทำงานแบบ Dynamic EDGE บน Cloudflare Pages, พัฒนาหน้าการทำงานส่วนตัวนักวิจัย (Researcher Workspace) สำหรับเคลมเงินรางวัลและจองคำปรึกษา CEU สถิติวิจัยแบบโต้ตอบได้จริง
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl p-6 shadow-sm hover:border-[#d97706] transition-all">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-[#d97706] flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="font-bold text-base">การแยกส่วนสิทธิ์และความปลอดภัย (Access Control)</h3>
              <p className="text-xs text-[#7a685c] mt-2.5 leading-relaxed">
                ออกแบบระบบสิทธิ์ Role-Based: หน้าแรกสำหรับเจ้าหน้าที่ (Staff ดูแลทั้งหมด), หน้าแดชบอร์ดสรุปผลรวมสำหรับทุกคน และหน้าพื้นที่ทำงานนักวิจัย ที่มีสิทธิ์เพิ่ม/แก้ไข แต่จำกัดสิทธิ์ <strong>ห้ามลบข้อมูล</strong> (สิทธิ์ลบยกให้เจ้าหน้าที่เป็นผู้ดูแล)
              </p>
            </div>

          </div>
        </section>

        {/* Website Structure & Link Mapping */}
        <section className="bg-[#fdfcf9] border border-[#ebdccf] rounded-3xl p-8 shadow-md space-y-6">
          <h2 className="text-xl font-bold text-[#3c2f25] border-b border-[#ebdccf] pb-3 flex items-center gap-2 font-serif">
            <BookOpen className="h-5.5 w-5.5 text-[#b45309]" />
            <span>โครงสร้างลิงก์และหน้าเว็บของระบบ (Sitemap & Page Structure)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#7a685c]">
            
            {/* Homepage / Staff Console */}
            <div className="bg-[#f9f5ee] border border-[#ebdccf] p-5 rounded-2xl space-y-3">
              <h3 className="font-bold text-sm text-[#3c2f25] flex items-center gap-1.5 border-b border-[#ebdccf] pb-2">
                <FileText className="h-4.5 w-4.5 text-[#d97706]" />
                <span>หน้าหลัก / หน้าแอดมิน (Root Page `/`)</span>
              </h3>
              <p className="leading-relaxed">เป็นศุนย์กลางระบบ (Staff Management Console) เพื่อให้เจ้าหน้าที่ตรวจสอบและดำเนินการจัดการข้อมูลหลัก ประกอบด้วยแท็บย่อย:</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li><span className="font-bold text-[#3c2f25]">สรุปภาพรวม:</span> สถิติเบื้องต้นและคิวการให้คำปรึกษา</li>
                <li><span className="font-bold text-[#3c2f25]">โครงการวิจัย:</span> ดูโครงการทั้งหมด ตรวจสอบงบประมาณ</li>
                <li><span className="font-bold text-[#3c2f25]">บทความวิชาการ:</span> อนุมัติสิทธิ์เงินรางวัลการตีพิมพ์แยกตาม Quartile</li>
                <li><span className="font-bold text-[#3c2f25]">การให้คำปรึกษา CEU:</span> ตรวจสอบและเปลี่ยนสถานะคิวรับนัดคำปรึกษา</li>
                <li><span className="font-bold text-[#3c2f25]">บริหารข้อมูลผู้ใช้:</span> ทำ CRUD สร้าง/แก้ไข/ลบ รายชื่อผู้ใช้</li>
                <li><span className="font-bold text-[#3c2f25]">DB Explorer / DB Status:</span> สำรวจตารางฐานข้อมูลและทดสอบความเร็วดีเลย์ของ D1 DB</li>
              </ul>
            </div>

            {/* Dashboard Overview */}
            <div className="bg-[#f9f5ee] border border-[#ebdccf] p-5 rounded-2xl space-y-3">
              <h3 className="font-bold text-sm text-[#3c2f25] flex items-center gap-1.5 border-b border-[#ebdccf] pb-2">
                <TrendingUp className="h-4.5 w-4.5 text-[#d97706]" />
                <span>หน้าสรุปภาพรวม (`/dashboard`)</span>
              </h3>
              <p className="leading-relaxed">หน้าเพจสำหรับผู้บริหาร, เจ้าหน้าที่ หรือนักวิจัยทั่วไป เข้ามาตรวจดูสรุปภาพรวมความคืบหน้าของงานวิจัยแบบ Read-Only:</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li><span className="font-bold text-[#3c2f25]">กราฟเปรียบเทียบงบประมาณ:</span> เปรียบเทียบงบประมาณตั้งต้น vs เบิกจ่ายจริง แยกตามคณะ</li>
                <li><span className="font-bold text-[#3c2f25]">สัดส่วนผลงานตีพิมพ์:</span> สถิติตาม Quartile Q1-Q4 และสถานะขั้นตอนการผลิตงานตีพิมพ์</li>
                <li><span className="font-bold text-[#3c2f25]">สถิติการนำเสนอผลงาน:</span> จำนวนการนำเสนอรูปแบบ Oral / Poster</li>
                <li><span className="font-bold text-[#3c2f25]">คิวรับบริการ CEU:</span> นับเคสเข้ารับบริการปรึกษาด้านสถิติจริง</li>
              </ul>
            </div>

            {/* Researcher Workspace */}
            <div className="bg-[#f9f5ee] border border-[#ebdccf] p-5 rounded-2xl space-y-3">
              <h3 className="font-bold text-sm text-[#3c2f25] flex items-center gap-1.5 border-b border-[#ebdccf] pb-2">
                <User className="h-4.5 w-4.5 text-[#d97706]" />
                <span>หน้าพื้นที่งานนักวิจัย (`/my-workspace`)</span>
              </h3>
              <p className="leading-relaxed">หน้าต่างการยื่นแบบฟอร์มข้อมูลเฉพาะบุคคลสำหรับนักวิจัย (Researcher Workspace) โดยกรองข้อมูลเฉพาะของตนเอง:</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li><span className="font-bold text-[#3c2f25]">โครงการวิจัยของฉัน:</span> ยื่นแบบฟอร์มเสนอขอจดทะเบียนโครงการวิจัยใหม่</li>
                <li><span className="font-bold text-[#3c2f25]">การตีพิมพ์และขอรางวัล:</span> ยื่นเคลมเงินรางวัลการตีพิมพ์พร้อมเอกสารอ้างอิง</li>
                <li><span className="font-bold text-[#3c2f25]">นัดหมายปรึกษา CEU:</span> ทำการจองคิวระบุวันเวลา ประเภทหัวข้อ และที่ปรึกษา</li>
                <li><span className="font-bold text-[#3c2f25]">ประวัตินำเสนอผลงาน:</span> เพิ่มและแก้ไขข้อมูลงานนำเสนอวิจัย</li>
                <li><span className="font-bold text-[#3c2f25]">ข้อจำกัดด้านความปลอดภัย:</span> นักวิจัยไม่มีสิทธิ์ "ลบ" ข้อมูลของตนเอง เพื่อความปลอดภัยของข้อมูลธุรกรรมการเงิน</li>
              </ul>
            </div>

          </div>
        </section>

        {/* Problem Solving & Optimization Section */}
        <section className="bg-[#fdfcf9] border border-[#ebdccf] rounded-3xl p-8 shadow-md space-y-6">
          <h2 className="text-xl font-bold text-[#3c2f25] border-b border-[#ebdccf] pb-3 flex items-center gap-2 font-serif">
            <Settings className="h-5.5 w-5.5 text-[#b45309]" />
            <span>ความท้าทายและการแก้ไขปัญหาหลัก (Problem Solving & Troubleshooting)</span>
          </h2>

          <div className="space-y-4">
            
            <div className="p-4 bg-[#f9f5ee] rounded-xl border border-[#ebdccf] flex items-start gap-4">
              <div className="bg-red-500/10 text-red-600 p-2 rounded-lg mt-0.5">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#3c2f25]">ปัญหาความไม่เข้ากันทางไทป์ของ TypeScript (Status Types mismatch)</h4>
                <p className="text-xs text-[#7a685c] mt-1 leading-relaxed">
                  <strong>อาการ:</strong> เกิดคอมไพล์เลอร์เออร์เรอร์ <code>Type '"APPROVED"' is not assignable to type '"PROPOSED"'</code> ระหว่างการส่งแบบฟอร์มเพื่อบันทึกแก้ไขข้อมูล  
                  <br /><strong>ทางแก้:</strong> ทำการรีแฟกเตอร์ฟอร์มสเตทโดยระบุการทำ Type Casting ให้กว้างขึ้นด้วย Union Types หลีกเลี่ยงความจำกัดของ Const Types
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#f9f5ee] rounded-xl border border-[#ebdccf] flex items-start gap-4">
              <div className="bg-red-500/10 text-red-600 p-2 rounded-lg mt-0.5">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#3c2f25]">ปัญหาคอมไพล์เลอร์ Vercel CLI รันบน Windows</h4>
                <p className="text-xs text-[#7a685c] mt-1 leading-relaxed">
                  <strong>อาการ:</strong> การเรียกใช้งาน `next build` ผ่าน Cloudflare Edge Wrapper ล้มเหลวเนื่องจากการประมวลผล Symbolic Links ล้มเหลวบนเครื่อง Windows  
                  <br /><strong>ทางแก้:</strong> ใช้สคริปต์แก้ไขลิงก์ชั่วคราว (Monkey-patching symlinks) เข้ามาควบคุมกระบวนการสร้างและแมปไฟล์ผ่านคำสั่ง <code>node -r ./patch-symlink.js</code> ทำให้สามารถบิลด์ได้ปกติ
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#f9f5ee] rounded-xl border border-[#ebdccf] flex items-start gap-4">
              <div className="bg-red-500/10 text-red-600 p-2 rounded-lg mt-0.5">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#3c2f25]">การยกระดับความปลอดภัยผ่านระบบ Soft Delete และการบันทึกประวัติ (Audit Log)</h4>
                <p className="text-xs text-[#7a685c] mt-1 leading-relaxed">
                  <strong>อาการ:</strong> การลบข้อมูลหลักแบบถาวร (Hard Delete) มีความเสี่ยงที่จะทำให้สูญเสียหลักฐานการตรวจสอบธุรกรรม และประวัติการจัดสรรงบประมาณที่เคยดำเนินการไปแล้ว  
                  <br /><strong>ทางแก้:</strong> เปลี่ยนระบบการจัดการลบข้อมูลเป็นการเปลี่ยนสถานะทางตรรกะ (Soft Delete) โดยกำหนดคอลัมน์ <code>isDeleted = 1</code> แทน พร้อมจัดเก็บประวัติการดำเนินธุรกรรมการเพิ่ม แก้ไข ลบข้อมูลทุกขั้นตอนลงในตาราง <code>irAuditLog</code> ในรูปแบบ JSON เพื่อการรักษาความปลอดภัยของประวัติบัญชีผู้รับเงินอย่างสมบูรณ์
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#f9f5ee] rounded-xl border border-[#ebdccf] flex items-start gap-4">
              <div className="bg-red-500/10 text-red-600 p-2 rounded-lg mt-0.5">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#3c2f25]">การพัฒนาระบบสิทธิ์และบทบาทที่ยืดหยุ่น (Permission-Based & Multi-Role Access Control)</h4>
                <p className="text-xs text-[#7a685c] mt-1 leading-relaxed">
                  <strong>อาการ:</strong> เดิมระบบใช้โครงสร้างบทบาทแบบฮาร์ดโค้ดส่งผลให้ผู้ใช้ไม่สามารถมีหลายบทบาทซ้อนทับกันได้ (เช่น นักวิจัยที่เป็นผู้บริหาร) และการแก้ไขบทบาทเดิมส่งผลกระทบต่อสิทธิ์การทำงานทั้งหมดในโค้ด  
                  <br /><strong>ทางแก้:</strong> เปลี่ยนผ่านสถาปัตยกรรมสู่ระบบสิทธิ์ย่อยแยกจำแนก (Fine-grained Permissions) ในโมดูลควบคุม <code>permissions.ts</code> และออกแบบระบบฐานข้อมูล D1 ให้เก็บบทบาทควบ (Comma-Separated) พร้อมพัฒนาหน้าจอให้มี <code>Context Switcher</code> สลับโหมดโหมดการทำงานได้แบบเรียลไทม์
                </p>
              </div>
            </div>

          </div>
        </section>
 
        {/* Operational Results & Future Roadmap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
           {/* Results */}
          <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#3c2f25] border-b border-[#ebdccf] pb-2.5 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span>ผลการดำเนินการ (Operational Results)</span>
            </h3>
            <ul className="text-xs text-[#7a685c] space-y-2.5 list-disc pl-4 leading-relaxed">
              <li>ระบบรันบน **Edge Infrastructure** โหลดหน้าเพจได้รวดเร็วภายในระยะเวลาหลักมิลลิวินาที</li>
              <li>การเชื่อมโยงฐานข้อมูล D1 มีความเสถียร รองรับการดึงข้อมูลพร้อมกันในหลากหลายเซสชัน</li>
              <li>ระบบการแจ้งเตือนตอบกลับ (Toasts Feedbacks) ทำงานแบบเรียลไทม์ เพิ่มคะแนน UX/UI ให้กับผู้ใช้งาน</li>
              <li>ระบบ **Soft Delete & Audit Log** ทำงานสมบูรณ์แบบ ช่วยปกป้องการสูญหายของข้อมูลสำคัญ</li>
              <li>ระบบ **Permission-Based & Multi-Role** ทำงานสมบูรณ์แบบ ทั้งการระบุบทบาทควบใน D1 และการเพิ่มปุ่มสลับมุมมองโหมดทำงาน (Context Switcher) เสริม UX</li>
              <li>มีการเตรียมความพร้อมสำหรับการทำระบบนำเข้าข้อมูลปริมาณมาก (Bulk Import) เพื่อรองรับรายชื่อนักวิจัย 100+ คน</li>
            </ul>
          </div>

          {/* Roadmap */}
          <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#3c2f25] border-b border-[#ebdccf] pb-2.5 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#b45309]" />
              <span>แนวทางการพัฒนาต่อเนื่อง (Future Roadmap)</span>
            </h3>
            <ul className="text-xs text-[#7a685c] space-y-2.5 list-disc pl-4 leading-relaxed">
              <li>**ระบบความปลอดภัยจริง (Enterprise Auth)**: พัฒนาการล็อกอินจริงผ่านระบบ LDAP ของมหาวิทยาลัย หรือ OAuth2 แทนการจำลองบทบาท</li>
              <li>**การควบคุมบทบาทจากฐานข้อมูลโดยตรง (Database-driven roles)**: ปรับปรุงการเพิ่ม/ลดสิทธิ์บทบาทที่ต้องการขยายในอนาคตผ่านโมดูลข้อมูลตรงโดยไม่ต้องแตะโค้ด</li>
              <li>**ระบบแจ้งเตือนผ่านช่องทางอื่น (Notification integration)**: ส่งอีเมลหรือ Line Notify เมื่อโครงการได้รับการอนุมัติ หรือคำปรึกษา CEU ถูกยกเลิก</li>
              <li>**กราฟวิเคราะห์ผลระดับผู้บริหาร (Advanced Executive Charts)**: แสดงอัตราความสำเร็จของโครงการวิจัยในแต่ละคณะในรูปแบบ Interactive Dashboard</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
