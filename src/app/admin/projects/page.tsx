'use client';
import React, { useState } from 'react';
import { 
  FilePlus, FileText, Send, User, MapPin, Target, DollarSign, UploadCloud, ChevronRight, Link2, Info, X, AlertTriangle, Clock, CheckCircle2, History
} from 'lucide-react';

export default function AdminProjects() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  const handleGenerateDoc = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('ระบบได้สร้าง "บันทึกข้อความขอรับทุน" อัตโนมัติเรียบร้อยแล้ว');
      setStep(2);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3 flex items-center gap-3">
            <FilePlus className="text-emerald-500" size={36} /> ระบบขอรับทุนวิจัย 
          </h1>
        {/* Horizontal Stepper */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 mb-8 flex flex-col relative overflow-hidden">
          <div className="flex w-full justify-between relative z-10 max-w-3xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-3 w-1/3 relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-lg transition-colors ${step >= 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50' : 'bg-slate-100 text-slate-400'}`}>1</div>
              <span className={`text-sm font-bold text-center ${step >= 1 ? 'text-blue-900' : 'text-slate-400'}`}>เสนอโครงการ<br/><span className="text-xs font-normal opacity-80">(Proposal)</span></span>
              <div className={`hidden md:block absolute top-6 left-[50%] w-full h-1 -z-10 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-3 w-1/3 relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-lg transition-colors ${step >= 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50' : 'bg-slate-100 text-slate-400'}`}>2</div>
              <span className={`text-sm font-bold text-center ${step >= 2 ? 'text-blue-900' : 'text-slate-400'}`}>ทำสัญญา & งวด 1<br/><span className="text-xs font-normal opacity-80">(Contract)</span></span>
              <div className={`hidden md:block absolute top-6 left-[50%] w-full h-1 -z-10 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center gap-3 w-1/3 relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-lg transition-colors ${step >= 3 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50' : 'bg-slate-100 text-slate-400'}`}>3</div>
              <span className={`text-sm font-bold text-center ${step >= 3 ? 'text-blue-900' : 'text-slate-400'}`}>ก้าวหน้า & งวด 2<br/><span className="text-xs font-normal opacity-80">(Progress Tracker)</span></span>
            </div>
          </div>
          
          <button onClick={() => setShowTimelineModal(true)} className="absolute right-6 top-6 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 p-3 rounded-full transition-colors group border border-slate-100 flex items-center gap-2" title="ดูประวัติการดำเนินการ (Audit Trail)">
             <Clock size={20} className="group-hover:rotate-12 transition-transform" />
             <span className="text-xs font-bold hidden md:inline-block">ประวัติการกระทำ</span>
          </button>
        </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">1. ข้อมูลโครงการวิจัยเบื้องต้น</h2>
              <p className="text-sm text-slate-500 mt-1">ข้อมูลเหล่านี้จะถูกนำไปใช้ออกแบบบันทึกข้อความขอรับทุน และสัญญาอัตโนมัติ</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><FileText size={16} className="text-slate-400" /> ชื่อโครงการวิจัย</label>
                  <input type="text" placeholder="ระบุชื่อโครงการ..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><User size={16} className="text-slate-400" /> หัวหน้าโครงการ (PI)</label>
                  <input type="text" placeholder="พิมพ์ชื่อเพื่อค้นหานักวิจัย..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><MapPin size={16} className="text-slate-400" /> ภาควิชา / เบอร์โทรติดต่อ</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="ภาควิชา" className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white" />
                    <input type="text" placeholder="เบอร์โทร" className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><User size={16} className="text-slate-400" /> ประเภทนักวิจัย</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white">
                    <option value="">-- เลือกประเภท --</option>
                    <option value="general">นักวิจัยทั่วไป</option>
                    <option value="experienced">นักวิจัยที่มีประสบการณ์</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Target size={16} className="text-slate-400" /> หมวดยุทธศาสตร์คณะฯ</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white">
                    <option value="">-- เลือกยุทธศาสตร์ --</option>
                    <option value="innovation">ด้านนวัตกรรม</option>
                    <option value="health_sys">ด้านระบบสุขภาพ</option>
                    <option value="aging">ด้านผู้สูงอายุ</option>
                    <option value="med_ed">ด้าน Med Ed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><DollarSign size={16} className="text-slate-400" /> งบประมาณที่ขอรับ (บาท)</label>
                  <input type="number" placeholder="เช่น 500000" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><FileText size={16} className="text-slate-400" /> ระยะเวลาดำเนินการ (เดือน)</label>
                  <input type="number" placeholder="เช่น 12" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4"><UploadCloud size={16} className="text-slate-400" /> เอกสารแนบ (Required Documents)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                    <input type="checkbox" className="w-5 h-5 rounded border-rose-300 text-rose-500 focus:ring-rose-500" />
                    <span className="text-sm text-slate-700">1. แบบเสนอโครงการวิจัย (รับรองจริยธรรม)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                    <input type="checkbox" className="w-5 h-5 rounded border-rose-300 text-rose-500 focus:ring-rose-500" />
                    <span className="text-sm text-slate-700">2. แบบเก็บข้อมูล (รับรองจริยธรรม)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                    <input type="checkbox" className="w-5 h-5 rounded border-rose-300 text-rose-500 focus:ring-rose-500" />
                    <span className="text-sm text-slate-700">3. สำเนาใบรับรองจริยธรรม (IRB)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                    <input type="checkbox" className="w-5 h-5 rounded border-rose-300 text-rose-500 focus:ring-rose-500" />
                    <span className="text-sm text-slate-700">4. แบบเสนอรายชื่อผู้ทรงคุณวุฒิ</span>
                  </div>
                </div>
                
                <div className="space-y-2 mt-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Link2 size={16} className="text-slate-400" /> ลิงก์โฟลเดอร์เอกสารประกอบ (Google Drive / OneDrive)</label>
                    <button onClick={() => setShowHelpModal(true)} className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1 font-bold bg-blue-50 px-2 py-1 rounded-md transition-colors border border-blue-100">
                      <Info size={14}/> วิธีแชร์ลิงก์ที่ถูกต้อง
                    </button>
                  </div>
                  <input type="url" placeholder="วางลิงก์ที่แชร์สิทธิ์ 'ผู้ที่มีลิงก์สามารถดูได้'..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white" />
                  <p className="text-slate-400 text-xs mt-1">กรุณารวบรวมเอกสารทั้ง 4 รายการไว้ในโฟลเดอร์เดียวกันเพื่อความสะดวกในการตรวจสอบ</p>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  onClick={handleGenerateDoc}
                  disabled={isGenerating}
                  className="bg-slate-900 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-slate-200 disabled:opacity-70"
                >
                  {isGenerating ? 'กำลังสร้างเอกสาร...' : 'บันทึก & สร้างบันทึกข้อความขอรับทุนอัตโนมัติ'} <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden text-center p-12">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">สร้างเอกสารขอรับทุนสำเร็จ!</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">ระบบได้ดึงข้อมูลที่คุณกรอกไปสร้างเป็นฟอร์ม "บันทึกข้อความขอรับทุน" แบบสมบูรณ์ พร้อมให้หัวหน้าโครงการดาวน์โหลดไปเซ็นชื่อได้ทันที</p>
            
            <div className="flex justify-center gap-4 mb-10">
              <button className="bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 font-bold py-3 px-6 rounded-xl transition-all">
                ดาวน์โหลดเอกสาร (Word)
              </button>
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-200">
                ส่งอีเมลแจ้งหัวหน้าโครงการ
              </button>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-left">
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><Target size={20} className="text-blue-500"/> สำหรับเจ้าหน้าที่ (Admin Only)</h3>
              <p className="text-sm text-slate-500 mb-4">เมื่อโครงการได้รับการอนุมัติและเซ็นสัญญาแล้ว กรุณาแนบลิงก์เอกสาร PDF ฉบับสมบูรณ์ที่นี่ เพื่อบันทึกเป็นฐานข้อมูล</p>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Link2 size={16} className="text-slate-400" /> ลิงก์เอกสารอนุมัติ (Google Drive / OneDrive)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="url" placeholder="วางลิงก์เอกสาร PDF ที่นี่..." className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white" />
                  <button onClick={() => { alert('บันทึกการอนุมัติสำเร็จ ระบบเตรียมความพร้อมสำหรับเข้าสู่งวดที่ 2'); setStep(3); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all whitespace-nowrap shadow-md">
                    บันทึกการอนุมัติ
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 font-medium underline">
                กลับไปหน้าเสนอขอรับทุน
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">3. รายงานความก้าวหน้าและเบิกเงินงวดที่ 2</h2>
                <p className="text-sm text-slate-500 mt-1">อัปเดตความก้าวหน้า (Progress) และอัตราการเบิกจ่าย (Burn Rate)</p>
              </div>
              <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm shadow-inner">
                สถานะ: ดำเนินการโครงการ (ได้รับงวด 1 แล้ว)
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Tracker Visual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-sm font-bold text-slate-600">ความก้าวหน้าโครงการ (Progress)</p>
                    <p className="text-3xl font-extrabold text-blue-600">50%</p>
                  </div>
                  <input type="range" min="0" max="100" defaultValue="50" className="w-full accent-blue-600 cursor-pointer" />
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-sm font-bold text-slate-600">อัตราการเบิกจ่ายงบประมาณ (Burn Rate)</p>
                    <p className="text-3xl font-extrabold text-rose-600">฿250,000 <span className="text-base text-slate-400 font-medium">/ 500,000</span></p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 mt-3 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-rose-400 to-rose-600 h-3 rounded-full relative" style={{ width: '50%' }}>
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploads */}
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">ขอเบิกเงินงวดที่ 2</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><DollarSign size={16} className="text-slate-400" /> ยอดเงินที่ขอเบิกงวดที่ 2 (บาท)</label>
                    <input type="number" placeholder="เช่น 150000..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all shadow-sm" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Link2 size={16} className="text-slate-400" /> ลิงก์โฟลเดอร์เอกสารรายงาน (OneDrive/Drive)</label>
                      <button onClick={() => setShowHelpModal(true)} className="text-xs text-blue-600 hover:text-blue-800 underline font-bold bg-blue-50 px-2 py-1 rounded-md">วิธีแชร์ลิงก์</button>
                    </div>
                    <input type="url" placeholder="วางลิงก์แฟ้มรวมรายงานก้าวหน้า..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all shadow-sm" />
                  </div>
                </div>

                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <p className="text-sm text-blue-800 font-bold mb-3 flex items-center gap-2">
                    <FileText size={16} /> เอกสารที่ต้องรวบรวมในโฟลเดอร์ลิงก์ด้านบน:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                    <div className="flex items-center gap-2 text-sm text-slate-700"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> รายงานความก้าวหน้าโครงการวิจัย</div>
                    <div className="flex items-center gap-2 text-sm text-slate-700"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> รายงานสรุปการเงิน (Excel)</div>
                    <div className="flex items-center gap-2 text-sm text-slate-700"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> รายการค่าใช้จ่ายประจำงวด (Excel)</div>
                    <div className="flex items-center gap-2 text-sm text-slate-700"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> สำเนาบัญชีธนาคารจนถึงรายการล่าสุด</div>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-between items-center border-t border-slate-100">
                <button onClick={() => setStep(2)} className="text-slate-400 hover:text-slate-600 font-bold underline transition-colors">
                  ย้อนกลับ
                </button>
                <button 
                  onClick={() => alert('บันทึกข้อมูลเรียบร้อย! ข้อมูลความก้าวหน้าและ Burn Rate ได้เชื่อมต่อไปยัง Executive Dashboard ทันที')}
                  className="bg-slate-900 hover:bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-xl shadow-slate-200/50 hover:shadow-blue-200"
                >
                  <Send size={18} /> ส่งรายงานและขอเบิกงวด 2
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Info className="text-blue-500" /> คำแนะนำการแชร์ลิงก์เอกสารอย่างปลอดภัย
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 hover:bg-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">🟢 สำหรับ Google Drive</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 ml-2">
                  <li>สร้างโฟลเดอร์ใหม่ และนำเอกสารทั้ง 4 รายการใส่ลงไป</li>
                  <li>คลิกขวาที่โฟลเดอร์ เลือก <strong className="text-slate-800">แชร์ (Share)</strong></li>
                  <li>ในส่วนสิทธิ์การเข้าถึงทั่วไป ให้เปลี่ยนเป็น <strong className="text-blue-600">ผู้ที่มีลิงก์ (Anyone with the link)</strong></li>
                  <li>ตั้งค่าสิทธิ์ด้านขวาเป็น <strong className="text-slate-800">ผู้มีสิทธิ์อ่าน (Viewer)</strong> เท่านั้น <span className="text-rose-500">(ห้ามตั้งเป็น Editor)</span></li>
                  <li>คลิก <strong className="text-slate-800">คัดลอกลิงก์ (Copy link)</strong> และนำมาวางในแบบฟอร์ม</li>
                </ol>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">🔵 สำหรับ Microsoft OneDrive</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 ml-2">
                  <li>สร้างโฟลเดอร์ใหม่ และนำเอกสารใส่ลงไป</li>
                  <li>คลิกขวาที่โฟลเดอร์ เลือก <strong className="text-slate-800">แชร์ (Share)</strong></li>
                  <li>คลิกที่ข้อความตั้งค่าลิงก์ แล้วเลือก <strong className="text-blue-600">ทุกคนที่มีลิงก์ (Anyone with the link)</strong></li>
                  <li><span className="text-rose-500">เอาเครื่องหมายถูกออก</span> ที่เมนู <strong className="text-slate-800">อนุญาตให้แก้ไข (Allow editing)</strong></li>
                  <li>คลิก นำไปใช้ (Apply) จากนั้นกด <strong className="text-slate-800">คัดลอกลิงก์ (Copy link)</strong></li>
                </ol>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 mt-4">
                <AlertTriangle className="text-amber-500 shrink-0" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  <strong>ข้อควรระวัง:</strong> เพื่อป้องกันข้อมูลส่วนตัวรั่วไหลหรือถูกดัดแปลง ห้ามตั้งค่าแชร์ให้ผู้อื่นมีสิทธิ์แก้ไข (Editor) เป็นอันขาด <br/>
                  <span className="text-xs opacity-80 mt-1 block">* คำแนะนำ: ลองเปิดลิงก์ผ่านหน้าต่างไม่ระบุตัวตน (Incognito Mode) เพื่อทดสอบว่าแอดมินสามารถเปิดดูได้จริงก่อนนำมาส่ง</span>
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setShowHelpModal(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-md shadow-blue-200">
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <History className="text-blue-500" /> ประวัติการดำเนินการ (Audit Trail)
              </h3>
              <button onClick={() => setShowTimelineModal(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 hover:bg-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                
                {step >= 3 && (
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-in slide-in-from-top-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900 text-sm">เข้าสู่รายงานความก้าวหน้า</div>
                        <time className="text-xs font-medium text-slate-400">วันนี้ 10:45</time>
                      </div>
                      <div className="text-sm text-slate-500">ระบบปลดล็อคโมดูลเบิกจ่ายงวด 2</div>
                    </div>
                  </div>
                )}

                {step >= 2 && (
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-in slide-in-from-top-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <User size={18} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900 text-sm">Admin อนุมัติสัญญา</div>
                        <time className="text-xs font-medium text-slate-400">วันนี้ 10:40</time>
                      </div>
                      <div className="text-sm text-slate-500">แนบลิงก์เอกสาร PDF ฉบับสมบูรณ์เรียบร้อย</div>
                    </div>
                  </div>
                )}

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <FilePlus size={18} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900 text-sm">สร้างข้อเสนอโครงการ</div>
                      <time className="text-xs font-medium text-slate-400">เมื่อวาน 15:30</time>
                    </div>
                    <div className="text-sm text-slate-500">ผู้วิจัยส่งข้อมูลผ่านระบบ One-Stop</div>
                  </div>
                </div>

              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center">
              <button onClick={() => setShowTimelineModal(false)} className="text-slate-500 hover:text-slate-800 font-bold transition-colors">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
