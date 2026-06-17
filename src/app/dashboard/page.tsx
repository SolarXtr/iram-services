'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  DollarSign, 
  BookOpen, 
  Calendar, 
  Award, 
  Presentation as PresIcon,
  TrendingUp, 
  Building,
  RefreshCw,
  Layers,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  status: 'PROPOSED' | 'APPROVED' | 'ONGOING' | 'COMPLETED' | 'TERMINATED';
  budgetInitial: number;
  budgetSpent: number;
  startDate: string;
  endDate: string;
  department?: string | null;
}

interface Publication {
  id: string;
  title: string;
  journal: string;
  quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  rewardStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rewardAmount: number;
  status: 'WRITING' | 'UNDER_REVIEW' | 'PUBLISHED' | 'REWARDED';
  createdAt: string;
}

interface Presentation {
  id: string;
  title: string;
  conference: string;
  type: 'ORAL' | 'POSTER';
  status: 'PENDING' | 'PRESENTED';
}

interface Consultation {
  id: string;
  type: 'PROTOCOL' | 'STATISTICAL';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export default function ExecutiveDashboard() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      try {
        const [resProj, resPub, resPres, resConsult] = await Promise.all([
          fetch('/api/projects').then(r => r.json()),
          fetch('/api/publications').then(r => r.json()),
          fetch('/api/presentations').then(r => r.json()),
          fetch('/api/consultations').then(r => r.json())
        ]);
        if (Array.isArray(resProj)) setProjects(resProj);
        if (Array.isArray(resPub)) setPublications(resPub);
        if (Array.isArray(resPres)) setPresentations(resPres);
        if (Array.isArray(resConsult)) setConsultations(resConsult);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Format Currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(val);
  };

  // 1. Calculations for Summary Cards
  const totalProjects = projects.length;
  const totalBudgetInitial = projects.reduce((sum, p) => sum + p.budgetInitial, 0);
  const totalBudgetSpent = projects.reduce((sum, p) => sum + p.budgetSpent, 0);
  
  // Publications published this year
  const currentYear = new Date().getFullYear();
  const pubsThisYear = publications.filter(p => {
    // Check if status is PUBLISHED or REWARDED and created/published this year
    const isPublished = p.status === 'PUBLISHED' || p.status === 'REWARDED';
    const isThisYear = new Date(p.createdAt).getFullYear() === currentYear;
    return isPublished && isThisYear;
  }).length;

  // Consultation cases that actually attended (COMPLETED status)
  const completedConsultationsCount = consultations.filter(c => c.status === 'COMPLETED').length;

  // 2. Budget Chart Calculations (Initial vs Spent by Department)
  const deptBudgetMap: { [key: string]: { initial: number; spent: number } } = {};
  projects.forEach(p => {
    const dept = p.department || 'ทั่วไป/ไม่ระบุ';
    if (!deptBudgetMap[dept]) {
      deptBudgetMap[dept] = { initial: 0, spent: 0 };
    }
    deptBudgetMap[dept].initial += p.budgetInitial;
    deptBudgetMap[dept].spent += p.budgetSpent;
  });

  const deptBudgets = Object.keys(deptBudgetMap).map(name => ({
    name,
    initial: deptBudgetMap[name].initial,
    spent: deptBudgetMap[name].spent
  }));

  // Find max budget for scale
  const maxBudgetVal = Math.max(...deptBudgets.map(d => Math.max(d.initial, d.spent)), 100000);

  // 3. Publication Status Counter
  const pubStatusCounts = {
    WRITING: publications.filter(p => p.status === 'WRITING').length,
    UNDER_REVIEW: publications.filter(p => p.status === 'UNDER_REVIEW').length,
    PUBLISHED: publications.filter(p => p.status === 'PUBLISHED').length,
    REWARDED: publications.filter(p => p.status === 'REWARDED').length,
  };

  const totalPubs = publications.length || 1;
  const pubStatusPercentages = {
    WRITING: (pubStatusCounts.WRITING / totalPubs) * 100,
    UNDER_REVIEW: (pubStatusCounts.UNDER_REVIEW / totalPubs) * 100,
    PUBLISHED: (pubStatusCounts.PUBLISHED / totalPubs) * 100,
    REWARDED: (pubStatusCounts.REWARDED / totalPubs) * 100,
  };

  // 4. Project Status Counts
  const projectStatusCounts = {
    PROPOSED: projects.filter(p => p.status === 'PROPOSED').length,
    APPROVED: projects.filter(p => p.status === 'APPROVED').length,
    ONGOING: projects.filter(p => p.status === 'ONGOING').length,
    COMPLETED: projects.filter(p => p.status === 'COMPLETED').length,
    TERMINATED: projects.filter(p => p.status === 'TERMINATED').length,
  };

  // 5. Presentations Status
  const oralPresentations = presentations.filter(p => p.type === 'ORAL').length;
  const posterPresentations = presentations.filter(p => p.type === 'POSTER').length;
  const totalPresentations = presentations.length;
  const presentedCount = presentations.filter(p => p.status === 'PRESENTED').length;

  if (!mounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f9f5ee] text-[#4c3c31]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-10 w-10 animate-spin text-[#d97706] mx-auto" />
          <p className="text-sm font-semibold tracking-wider">กำลังโหลดข้อมูลระบบวิจัย...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5ee] text-[#3c2f25] p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#ebdccf]">
          <div>
            <div className="flex items-center gap-2 text-[#b45309] text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="h-4 w-4" />
              <span>Executive & Staff Insights</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#3c2f25]">ระบบรายงานภาพรวมผู้บริหารและเจ้าหน้าที่</h1>
            <p className="text-sm text-[#7a685c] mt-1">สรุปข้อมูลความคืบหน้าโครงการ งบประมาณจัดสรร งานตีพิมพ์ และคำปรึกษา CEU ประจำปีวิจัย</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#fdfcf9] hover:bg-[#ebdccf] border border-[#ebdccf] hover:border-[#b45309] text-[#3c2f25] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              <span>รีเฟรชข้อมูล</span>
            </button>
            <a 
              href="/my-workspace"
              className="bg-[#7a685c] hover:bg-[#3c2f25] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
            >
              <span>พื้นที่ทำงานนักวิจัย</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a 
              href="/"
              className="bg-[#d97706] hover:bg-[#c2410c] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/10 active:scale-95"
            >
              <span>จัดการข้อมูลภาพรวม (Staff)</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </header>

        {/* 1. Summary Cards Panel */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl relative overflow-hidden group hover:border-[#b45309] transition-all">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#d97706]"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-[#7a685c] font-semibold block uppercase tracking-wider">โครงการวิจัยวิชาการ</span>
                <span className="text-3xl font-extrabold text-[#3c2f25] mt-3 block">{totalProjects} โครงการ</span>
              </div>
              <div className="bg-[#f5e6d3] text-[#b45309] p-3 rounded-xl border border-[#ebdccf]">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-[#7a685c] mt-5 flex items-center gap-1">
              <span className="font-semibold text-[#b45309]">{projects.filter(p => p.status === 'ONGOING').length}</span>
              <span>โครงการกำลังดำเนินการวิจัย</span>
            </p>
          </div>

          <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl relative overflow-hidden group hover:border-[#b45309] transition-all">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#b45309]"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-[#7a685c] font-semibold block uppercase tracking-wider">งบประมาณรวมจัดสรร</span>
                <span className="text-2xl font-extrabold text-[#b45309] mt-3 block">{formatCurrency(totalBudgetInitial)}</span>
              </div>
              <div className="bg-[#f5e6d3] text-[#b45309] p-3 rounded-xl border border-[#ebdccf]">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-[10px] text-[#7a685c]">
              <span>เบิกจ่ายแล้ว {( (totalBudgetSpent / (totalBudgetInitial || 1)) * 100).toFixed(0)}%</span>
              <span className="text-[#3c2f25] font-bold">{formatCurrency(totalBudgetSpent)}</span>
            </div>
          </div>

          <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl relative overflow-hidden group hover:border-[#b45309] transition-all">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#7a685c]"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-[#7a685c] font-semibold block uppercase tracking-wider">ผลงานตีพิมพ์ปีวิจัยนี้</span>
                <span className="text-3xl font-extrabold text-[#3c2f25] mt-3 block">{pubsThisYear} บทความ</span>
              </div>
              <div className="bg-[#ebdccf] text-[#3c2f25] p-3 rounded-xl border border-[#ebdccf]">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-[#7a685c] mt-5">
              <span>วารสารวิชาการทั้งหมดในระบบ: {publications.length} บทความ</span>
            </p>
          </div>

          <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl relative overflow-hidden group hover:border-[#b45309] transition-all">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#d97706]"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-[#7a685c] font-semibold block uppercase tracking-wider">เคสเข้ารับการปรึกษาจริง</span>
                <span className="text-3xl font-extrabold text-[#d97706] mt-3 block">{completedConsultationsCount} เคสบริการ</span>
              </div>
              <div className="bg-[#f5e6d3] text-[#b45309] p-3 rounded-xl border border-[#ebdccf]">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-[#7a685c] mt-5">
              <span>นัดหมายล่วงหน้าไว้ {consultations.filter(c => c.status === 'SCHEDULED').length} เคส</span>
            </p>
          </div>

        </section>

        {/* 2. Charts Section (Double Grid) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Budget Comparison Chart by Faculty/Dept */}
          <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#3c2f25]">เปรียบเทียบงบประมาณของโครงการวิจัย</h2>
                <p className="text-xs text-[#7a685c]">เปรียบเทียบงบประมาณตั้งต้น (Initial) vs งบประมาณที่จ่ายจริง (Spent) แยกตามคณะ/ภาควิชา</p>
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#d97706] rounded-sm"></span>
                  <span className="text-[#7a685c]">งบประมาณตั้งต้น</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#7a685c] rounded-sm"></span>
                  <span className="text-[#7a685c]">เบิกจ่ายไปแล้ว</span>
                </div>
              </div>
            </div>

            {/* Department Bar Charts list */}
            <div className="space-y-6 pt-4">
              {deptBudgets.length === 0 ? (
                <p className="text-sm text-[#7a685c] text-center py-12">ไม่มีข้อมูลโครงการวิจัยระบุคณะ/ภาควิชา</p>
              ) : (
                deptBudgets.map(d => {
                  const initialPercent = (d.initial / maxBudgetVal) * 100;
                  const spentPercent = (d.spent / maxBudgetVal) * 100;

                  return (
                    <div key={d.name} className="space-y-2">
                       <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#3c2f25] flex items-center gap-2">
                          <Building className="h-4 w-4 text-[#b45309]" />
                          <span>{d.name}</span>
                        </span>
                        <span className="text-[#7a685c]">
                          เบิกจ่าย: {formatCurrency(d.spent)} / ตั้งต้น: {formatCurrency(d.initial)}
                        </span>
                      </div>
                      
                      {/* Bar Bars */}
                      <div className="space-y-1">
                        <div className="w-full bg-[#f5e6d3] h-3.5 rounded-md overflow-hidden relative border border-[#ebdccf]">
                          <div 
                            className="bg-[#d97706] h-full rounded-md transition-all duration-500" 
                            style={{ width: `${initialPercent}%` }}
                          ></div>
                        </div>
                        <div className="w-full bg-[#f5e6d3] h-2 rounded-md overflow-hidden relative border border-[#ebdccf]">
                          <div 
                            className="bg-[#7a685c] h-full rounded-md transition-all duration-500" 
                            style={{ width: `${spentPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. Publication Status & Quartiles */}
          <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-[#3c2f25] mb-2">สัดส่วนสถานะบทความวิชาการ</h2>
              <p className="text-xs text-[#7a685c] mb-6">ข้อมูลสถานะความคืบหน้าของบทความตีพิมพ์วิจัยทั้งหมดในระบบ</p>
              
              <div className="space-y-4">
                {[
                  { key: 'WRITING', label: 'กำลังเขียนบทความ', color: 'bg-[#7a685c]', value: pubStatusCounts.WRITING, percent: pubStatusPercentages.WRITING },
                  { key: 'UNDER_REVIEW', label: 'อยู่ระหว่างส่งพิจารณา (Review)', color: 'bg-[#b45309]', value: pubStatusCounts.UNDER_REVIEW, percent: pubStatusPercentages.UNDER_REVIEW },
                  { key: 'PUBLISHED', label: 'ตีพิมพ์แล้วเสร็จ', color: 'bg-[#d97706]', value: pubStatusCounts.PUBLISHED, percent: pubStatusPercentages.PUBLISHED },
                  { key: 'REWARDED', label: 'ขอรางวัลสำเร็จ', color: 'bg-[#c2410c]', value: pubStatusCounts.REWARDED, percent: pubStatusPercentages.REWARDED }
                ].map(item => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="flex items-center gap-2 text-[#7a685c]">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                        <span>{item.label}</span>
                      </span>
                      <span className="text-[#3c2f25]">{item.value} บทความ ({item.percent.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#f5e6d3] rounded-full overflow-hidden border border-[#ebdccf]">
                      <div 
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total count container */}
            <div className="bg-[#f5e6d3]/40 p-4 rounded-xl border border-[#ebdccf] mt-6 flex items-center justify-between">
              <span className="text-xs text-[#7a685c]">บทความวิชาการรวม</span>
              <span className="text-lg font-bold text-[#3c2f25]">{publications.length} ผลงาน</span>
            </div>
          </div>

        </section>

        {/* 4. Project & Presentation Status Panels */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Project Status Indicators */}
          <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-[#3c2f25] flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#b45309]" />
              <span>การติดตามสถานะโครงการวิจัย</span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { status: 'PROPOSED', label: 'เสนอขอตั้งต้น', count: projectStatusCounts.PROPOSED, color: 'text-[#7a685c] bg-[#fdfcf9] border-[#ebdccf]' },
                { status: 'APPROVED', label: 'อนุมัติโครงการ', count: projectStatusCounts.APPROVED, color: 'text-[#b45309] bg-[#f5e6d3]/40 border-[#ebdccf]' },
                { status: 'ONGOING', label: 'อยู่ระหว่างดำเนินการ', count: projectStatusCounts.ONGOING, color: 'text-[#d97706] bg-[#f5e6d3]/60 border-[#ebdccf]' },
                { status: 'COMPLETED', label: 'เสร็จสมบูรณ์', count: projectStatusCounts.COMPLETED, color: 'text-[#b45309] bg-[#f5e6d3]/80 border-[#ebdccf]' },
                { status: 'TERMINATED', label: 'ยุติโครงการก่อนกำหนด', count: projectStatusCounts.TERMINATED, color: 'text-[#7a685c]/80 bg-[#ebdccf]/40 border-[#ebdccf]' }
              ].map(item => (
                <div key={item.status} className={`p-4 rounded-2xl border text-center ${item.color}`}>
                  <span className="text-lg font-extrabold block">{item.count}</span>
                  <span className="text-[10px] font-semibold mt-1 block uppercase leading-tight">{item.label}</span>
                </div>
              ))}
            </div>

            {/* List of high-budget ongoing projects */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#7a685c] uppercase tracking-wider">โครงการสำคัญที่กำลังดำเนินการ (Top Budget)</h4>
              {projects
                .filter(p => p.status === 'ONGOING')
                .slice(0, 3)
                .map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-[#f5e6d3]/30 p-3.5 rounded-xl border border-[#ebdccf] hover:border-[#b45309] transition-colors">
                    <span className="text-xs text-[#3c2f25] font-semibold truncate max-w-md">{p.title}</span>
                    <span className="text-xs font-bold text-[#d97706] shrink-0">{formatCurrency(p.budgetInitial)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Presentation Tracking Panel */}
          <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#3c2f25] mb-2 flex items-center gap-2">
                <PresIcon className="h-5 w-5 text-[#b45309]" />
                <span>สถานะการนำเสนอผลงานวิจัย</span>
              </h3>
              <p className="text-xs text-[#7a685c] mb-6">ประวัติการลงทะเบียนการนำเสนอผลงานทางวิชาการ (Oral / Poster)</p>

              {/* Oral vs Poster custom bar */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#7a685c] font-semibold">การนำเสนอแบบบรรยาย (Oral Presentation)</span>
                    <span className="text-[#3c2f25] font-bold">{oralPresentations} งาน</span>
                  </div>
                  <div className="w-full h-2 bg-[#f5e6d3] rounded-full overflow-hidden border border-[#ebdccf]">
                    <div 
                      className="h-full bg-[#d97706] rounded-full"
                      style={{ width: `${totalPresentations ? (oralPresentations / totalPresentations) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#7a685c] font-semibold">การนำเสนอแบบโปสเตอร์ (Poster Presentation)</span>
                    <span className="text-[#3c2f25] font-bold">{posterPresentations} งาน</span>
                  </div>
                  <div className="w-full h-2 bg-[#f5e6d3] rounded-full overflow-hidden border border-[#ebdccf]">
                    <div 
                      className="h-full bg-[#7a685c] rounded-full"
                      style={{ width: `${totalPresentations ? (posterPresentations / totalPresentations) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#ebdccf] pt-6">
              <div className="bg-[#f5e6d3]/40 p-4 rounded-xl border border-[#ebdccf] text-center">
                <span className="text-[10px] text-[#7a685c] block font-semibold uppercase">รอนำเสนอ</span>
                <span className="text-xl font-bold text-[#b45309] mt-1 block">{totalPresentations - presentedCount} งาน</span>
              </div>
              <div className="bg-[#f5e6d3]/40 p-4 rounded-xl border border-[#ebdccf] text-center">
                <span className="text-[10px] text-[#7a685c] block font-semibold uppercase">นำเสนอแล้วเสร็จ</span>
                <span className="text-xl font-bold text-[#b45309] mt-1 block">{presentedCount} งาน</span>
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
