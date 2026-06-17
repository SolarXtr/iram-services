'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  BookOpen, 
  Calendar, 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Building,
  Presentation as PresIcon
} from 'lucide-react';

interface UserType {
  id: string;
  name: string;
  email: string;
  role: 'RESEARCHER' | 'STAFF' | 'EXECUTIVE';
}

interface Project {
  id: string;
  title: string;
  status: 'PROPOSED' | 'APPROVED' | 'ONGOING' | 'COMPLETED' | 'TERMINATED';
  budgetInitial: number;
  budgetSpent: number;
  startDate: string;
  endDate: string;
  ceuConsultDate?: string | null;
  irbNo?: string | null;
  approvedDate?: string | null;
  department?: string | null;
  leaderId: string;
}

interface Publication {
  id: string;
  title: string;
  journal: string;
  quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  rewardStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rewardAmount: number;
  status: 'WRITING' | 'UNDER_REVIEW' | 'PUBLISHED' | 'REWARDED';
  projectId?: string | null;
  project?: Project | null;
  authorId: string;
}

interface Presentation {
  id: string;
  title: string;
  conference: string;
  type: 'ORAL' | 'POSTER';
  status: 'PENDING' | 'PRESENTED';
  projectId?: string | null;
  project?: Project | null;
  presenterId: string;
}

interface Consultation {
  id: string;
  type: 'PROTOCOL' | 'STATISTICAL';
  appointmentTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  advisorId: string;
  advisor?: UserType;
  requesterId: string;
}

export default function ResearcherWorkspace() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'publications' | 'consultations' | 'presentations'>('projects');
  
  // Selection of researcher to simulate workspace
  const [selectedResearcherId, setSelectedResearcherId] = useState<string>('');

  // Data States
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Action / Toast Status State
  const [actionStatus, setActionStatus] = useState<{ type: 'loading' | 'success' | 'error'; message: string } | null>(null);

  // Auto-clear success/error toast notifications after 3 seconds
  useEffect(() => {
    if (actionStatus && actionStatus.type !== 'loading') {
      const timer = setTimeout(() => {
        setActionStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionStatus]);

  // General action wrapper to update status indicator
  const runAction = async (msg: string, fetchFn: () => Promise<Response>, successMsg: string) => {
    setActionStatus({ type: 'loading', message: msg });
    try {
      const res = await fetchFn();
      if (res.ok) {
        setActionStatus({ type: 'success', message: successMsg });
        loadData();
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        setActionStatus({ type: 'error', message: errData.error || 'เกิดข้อผิดพลาดในการดำเนินการ' });
        return false;
      }
    } catch (e: any) {
      setActionStatus({ type: 'error', message: e.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
      return false;
    }
  };

  // Modal States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isPublicationModalOpen, setIsPublicationModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);

  // Forms
  const [projectForm, setProjectForm] = useState({
    title: '',
    status: 'PROPOSED' as const,
    budgetInitial: 0,
    budgetSpent: 0,
    startDate: '',
    endDate: '',
    ceuConsultDate: '',
    irbNo: '',
    approvedDate: '',
    department: 'คณะแพทยศาสตร์',
  });
  const [publicationForm, setPublicationForm] = useState({
    title: '',
    journal: '',
    quartile: 'Q1' as const,
    rewardAmount: 0,
    projectId: '',
    status: 'WRITING' as const,
  });
  const [consultationForm, setConsultationForm] = useState({
    type: 'PROTOCOL' as const,
    appointmentTime: '',
    advisorId: '',
  });
  const [presentationForm, setPresentationForm] = useState({
    title: '',
    conference: '',
    type: 'ORAL' as const,
    status: 'PENDING' as const,
    projectId: '',
  });

  // Load Database Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resUsers, resProj, resPub, resPres, resConsult] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/publications').then(r => r.json()),
        fetch('/api/presentations').then(r => r.json()),
        fetch('/api/consultations').then(r => r.json())
      ]);

      if (Array.isArray(resUsers)) {
        setAllUsers(resUsers);
        // Find first researcher and select their ID by default
        const firstResearcher = resUsers.find(u => u.role === 'RESEARCHER');
        if (firstResearcher && !selectedResearcherId) {
          setSelectedResearcherId(firstResearcher.id);
        }
      }
      if (Array.isArray(resProj)) setProjects(resProj);
      if (Array.isArray(resPub)) setPublications(resPub);
      if (Array.isArray(resPres)) setPresentations(resPres);
      if (Array.isArray(resConsult)) setConsultations(resConsult);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedResearcherId]);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  // Filters by selected researcher
  const myProjects = projects.filter(p => p.leaderId === selectedResearcherId);
  const myPublications = publications.filter(p => p.authorId === selectedResearcherId);
  const myPresentations = presentations.filter(p => p.presenterId === selectedResearcherId);
  
  // Consultations requested by selected researcher (both past and upcoming)
  const myConsultations = consultations.filter(c => c.requesterId === selectedResearcherId);
  const upcomingConsultations = myConsultations.filter(c => new Date(c.appointmentTime) >= new Date() && c.status === 'SCHEDULED');
  const pastConsultations = myConsultations.filter(c => new Date(c.appointmentTime) < new Date() || c.status !== 'SCHEDULED');

  const selectedResearcher = allUsers.find(u => u.id === selectedResearcherId);

  // Form Submissions
  const handleProjectCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectForm,
          leaderId: selectedResearcherId,
          budgetInitial: Number(projectForm.budgetInitial),
          budgetSpent: Number(projectForm.budgetSpent),
        })
      });
      if (res.ok) {
        setIsProjectModalOpen(false);
        setProjectForm({
          title: '',
          status: 'PROPOSED',
          budgetInitial: 0,
          budgetSpent: 0,
          startDate: '',
          endDate: '',
          ceuConsultDate: '',
          irbNo: '',
          approvedDate: '',
          department: 'คณะแพทยศาสตร์',
        });
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublicationCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...publicationForm,
          authorId: selectedResearcherId,
          rewardAmount: Number(publicationForm.rewardAmount),
          rewardStatus: 'PENDING',
        })
      });
      if (res.ok) {
        setIsPublicationModalOpen(false);
        setPublicationForm({
          title: '',
          journal: '',
          quartile: 'Q1',
          rewardAmount: 0,
          projectId: '',
          status: 'WRITING',
        });
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConsultationCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...consultationForm,
          requesterId: selectedResearcherId,
          status: 'SCHEDULED'
        })
      });
      if (res.ok) {
        setIsConsultationModalOpen(false);
        setConsultationForm({
          type: 'PROTOCOL',
          appointmentTime: '',
          advisorId: '',
        });
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePresentationCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await runAction(
      'กำลังเพิ่มประวัตินำเสนอผลงาน...',
      () => fetch('/api/presentations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...presentationForm,
          presenterId: selectedResearcherId,
        })
      }),
      'เพิ่มประวัตินำเสนอผลงานสำเร็จแล้ว!'
    );
    setIsPresentationModalOpen(false);
    setPresentationForm({
      title: '',
      conference: '',
      type: 'ORAL',
      status: 'PENDING',
      projectId: '',
    });
  };

  // Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!mounted || (loading && allUsers.length === 0)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fdfcf9] text-slate-300">
        <RefreshCw className="h-10 w-10 animate-spin text-[#b45309]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5ee] text-[#3c2f25] p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Workspace Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#ebdccf]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#3c2f25]">พื้นที่ทำงานนักวิจัย (My Workspace)</h1>
            <p className="text-sm text-[#7a685c] mt-1">จัดการโครงการวิจัยส่วนตัว ติดตามงานตีพิมพ์ และจองปรึกษา CEU ของคุณ</p>
          </div>

          {/* User selector for simulating login */}
          <div className="flex items-center gap-3 bg-[#fdfcf9] border border-[#ebdccf] p-3 rounded-2xl shadow-md">
            <User className="h-5 w-5 text-[#b45309] shrink-0" />
            <div>
              <span className="text-[10px] text-[#7a685c] font-bold block uppercase">นักวิจัยที่กำลังใช้งานอยู่</span>
              <select
                value={selectedResearcherId}
                onChange={(e) => setSelectedResearcherId(e.target.value)}
                className="bg-[#f9f5ee] text-xs font-bold text-[#3c2f25] border-0 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2 py-1 mt-0.5 cursor-pointer"
              >
                {allUsers
                  .filter(u => u.role === 'RESEARCHER')
                  .map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#ebdccf] gap-2">
          {[
            { id: 'projects', label: 'โครงการวิจัยของฉัน', icon: FileText },
            { id: 'publications', label: 'การตีพิมพ์และขอรางวัล', icon: BookOpen },
            { id: 'consultations', label: 'ตารางนัดหมายปรึกษา CEU', icon: Calendar },
            { id: 'presentations', label: 'ประวัติการนำเสนอผลงาน', icon: PresIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#d97706] text-[#3c2f25]'
                  : 'border-transparent text-[#7a685c] hover:text-[#3c2f25]'
              }`}
            >
              <tab.icon className="h-4.5 w-4.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* -------------------- TAB CONTENTS -------------------- */}

        {/* TAB 1: RESEARCH PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#3c2f25]">ทะเบียนโครงการวิจัยวิชาการ</h2>
              {/* Add Project disabled */ null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myProjects.length === 0 ? (
                <div className="md:col-span-2 text-center py-12 bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl text-[#7a685c]">
                  คุณยังไม่มีโครงการวิจัยลงทะเบียนในระบบ
                </div>
              ) : (
                myProjects.map(p => (
                  <div key={p.id} className="bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl p-6 flex flex-col justify-between hover:border-[#ebdccf] transition-colors">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'PROPOSED' ? 'bg-[#f9f5ee] text-[#7a685c] border border-[#ebdccf]' :
                          p.status === 'APPROVED' ? 'bg-[#f5e6d3] text-[#b45309] border border-[#ebdccf]' :
                          p.status === 'ONGOING' ? 'bg-[#f5e6d3] text-[#b45309] border border-[#ebdccf] animate-pulse' :
                          p.status === 'COMPLETED' ? 'bg-[#ebdccf] text-[#b45309] border border-[#ebdccf]' :
                          'bg-[#ebdccf] text-[#7a685c] border border-[#ebdccf]'
                        }`}>
                          {p.status}
                        </span>
                        {p.department && (
                          <span className="text-xs text-[#7a685c] flex items-center gap-1">
                            <Building className="h-3.5 w-3.5 text-[#7a685c]" />
                            <span>{p.department}</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[#3c2f25] mt-4">{p.title}</h3>
                      <div className="text-xs text-[#7a685c] space-y-1.5 mt-5">
                        <p>ระยะเวลา: {new Date(p.startDate).toLocaleDateString('th-TH')} - {new Date(p.endDate).toLocaleDateString('th-TH')}</p>
                        <p>เลขที่ IRB: {p.irbNo || 'รอดำเนินการขอจริยธรรมวิจัย'}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-950 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#7a685c]">ใช้จ่ายงบวิจัยไปแล้ว: <span className="text-[#d97706] font-semibold">{formatCurrency(p.budgetSpent)}</span></span>
                        <span className="text-[#7a685c]">งบจัดสรร: {formatCurrency(p.budgetInitial)}</span>
                      </div>
                      <div className="w-full h-2 bg-[#f9f5ee] rounded-full overflow-hidden p-0.5 border border-[#ebdccf]">
                        <div 
                          className="bg-[#d97706] h-full rounded-full"
                          style={{ width: `${Math.min((p.budgetSpent / (p.budgetInitial || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PUBLICATIONS & REWARDS */}
        {activeTab === 'publications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#3c2f25]">งานตีพิมพ์วารสารวิชาการและการเสนอขอเงินรางวัล</h2>
              {/* Add Publication disabled */ null}
            </div>

            <div className="space-y-4">
              {myPublications.length === 0 ? (
                <div className="text-center py-12 bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl text-[#7a685c]">
                  คุณยังไม่มีประวัติการส่งข้อมูลงานตีพิมพ์เพื่อขออนุมัติรางวัล
                </div>
              ) : (
                myPublications.map(p => (
                  <div key={p.id} className="bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl p-6 hover:border-[#ebdccf] transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="bg-[#f5e6d3] text-[#d97706] border border-[#ebdccf] px-2.5 py-0.5 rounded-md text-[10px] font-bold">
                            {p.quartile} Journal
                          </span>
                          <span className="text-xs text-[#7a685c] font-semibold">{p.journal}</span>
                        </div>
                        <h3 className="text-base font-bold text-[#3c2f25] mt-3">{p.title}</h3>
                        <p className="text-xs text-[#7a685c] mt-2">
                          สถานะการผลิตงานตีพิมพ์:{' '}
                          <span className="font-semibold text-[#3c2f25]">
                            {p.status === 'WRITING' ? 'กำลังดำเนินการร่างบทความ' :
                             p.status === 'UNDER_REVIEW' ? 'ส่งตรวจวารสาร (Under Review)' :
                             p.status === 'PUBLISHED' ? 'ตีพิมพ์เรียบร้อยแล้ว' :
                             'ขอรางวัลตีพิมพ์สำเร็จ'}
                          </span>
                        </p>
                      </div>

                      {/* Reward request status column */}
                      <div className="bg-[#f9f5ee] p-4 rounded-xl border border-[#ebdccf] flex items-center justify-between sm:justify-start gap-6 self-stretch sm:self-auto shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-[#7a685c] block uppercase font-bold">เสนอขอรับรางวัล</span>
                          <span className="text-sm font-extrabold text-[#d97706]">{formatCurrency(p.rewardAmount)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.rewardStatus === 'PENDING' && (
                            <span className="bg-[#fdfcf9] text-[#7a685c] border border-[#ebdccf] px-3 py-1 rounded-full text-[10px] font-bold">
                              PENDING (รอนุมัติ)
                            </span>
                          )}
                          {p.rewardStatus === 'APPROVED' && (
                            <span className="bg-[#ebdccf] text-[#b45309] border border-[#ebdccf] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>อนุมัติสั่งจ่าย</span>
                            </span>
                          )}
                          {p.rewardStatus === 'REJECTED' && (
                            <span className="bg-[#ebdccf] text-[#7a685c] border border-[#ebdccf] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>ไม่อนุมัติคำร้อง</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CONSULTATIONS */}
        {activeTab === 'consultations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#3c2f25]">ตารางนัดหมายขอรับคำปรึกษา CEU</h2>
              {/* Add Consultation disabled */ null}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Upcoming Consultations */}
              <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-[#3c2f25] flex items-center gap-2 pb-3 border-b border-[#ebdccf]">
                  <Clock className="h-4 w-4 text-[#b45309]" />
                  <span>การนัดหมายปรึกษาที่กำลังจะมาถึง</span>
                </h3>
                {upcomingConsultations.length === 0 ? (
                  <p className="text-xs text-[#7a685c] py-6 text-center">ไม่มีการนัดหมายล่วงหน้า</p>
                ) : (
                  upcomingConsultations.map(c => (
                    <div key={c.id} className="bg-[#f9f5ee] p-4 rounded-xl border border-[#ebdccf] flex items-center justify-between">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.type === 'PROTOCOL' ? 'bg-[#f5e6d3] text-[#d97706] border border-[#ebdccf]' :
                          'bg-cyan-600/10 text-cyan-500 border border-cyan-500/20'
                        }`}>
                          {c.type}
                        </span>
                        <h4 className="text-sm font-bold text-[#3c2f25] mt-2">{formatDate(c.appointmentTime)}</h4>
                        <p className="text-[11px] text-[#7a685c] mt-1">ที่ปรึกษา: {c.advisor?.name || 'กำลังจัดหา'}</p>
                      </div>
                      <span className="text-[10px] font-semibold bg-[#f5e6d3] text-blue-400 px-2 py-0.5 rounded-full border border-[#ebdccf] uppercase">
                        {c.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Past Consultations */}
              <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-[#3c2f25] flex items-center gap-2 pb-3 border-b border-[#ebdccf]">
                  <CheckCircle className="h-4 w-4 text-[#b45309]" />
                  <span>ประวัติการปรึกษาที่ผ่านมา / ยกเลิก</span>
                </h3>
                {pastConsultations.length === 0 ? (
                  <p className="text-xs text-[#7a685c] py-6 text-center">ไม่มีประวัติการนัดหมายคำปรึกษา</p>
                ) : (
                  pastConsultations.map(c => (
                    <div key={c.id} className="bg-[#f9f5ee] p-4 rounded-xl border border-[#ebdccf] flex items-center justify-between opacity-70">
                      <div>
                        <span className="text-[9px] font-semibold text-[#7a685c] block uppercase">{c.type}</span>
                        <h4 className="text-xs font-semibold text-slate-300 mt-1">{formatDate(c.appointmentTime)}</h4>
                        <p className="text-[10px] text-[#7a685c] mt-0.5">ที่ปรึกษา: {c.advisor?.name}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        c.status === 'COMPLETED' ? 'bg-[#ebdccf] text-emerald-500 border border-emerald-900' :
                        'bg-[#ebdccf] text-rose-500 border border-[#ebdccf]'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: PRESENTATIONS */}
        {activeTab === 'presentations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#3c2f25]">ประวัติทะเบียนงานนำเสนอวิจัยวิชาการ</h2>
              <button
                onClick={() => {
                  setPresentationForm({
                    title: '',
                    conference: '',
                    type: 'ORAL',
                    status: 'PENDING',
                    projectId: projects[0]?.id || '',
                  });
                  setIsPresentationModalOpen(true);
                }}
                className="flex items-center gap-2 bg-[#d97706] hover:bg-[#c2410c] text-[#3c2f25] font-semibold text-xs px-4.5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>เพิ่มประวัตินำเสนอผลงาน</span>
              </button>
            </div>

            <div className="space-y-4">
              {myPresentations.length === 0 ? (
                <div className="text-center py-12 bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl text-[#7a685c]">
                  คุณยังไม่มีประวัติการนำเสนอผลงานวิจัยลงทะเบียน
                </div>
              ) : (
                myPresentations.map(p => (
                  <div key={p.id} className="bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl p-6 hover:border-[#ebdccf] transition-colors flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          p.type === 'ORAL' ? 'bg-[#f5e6d3] text-[#b45309]' : 'bg-[#ebdccf] text-[#7a685c]'
                        }`}>
                          {p.type} Presentation
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-[#7a685c] font-semibold">{p.conference}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#3c2f25] mt-3">{p.title}</h3>
                    </div>

                    <div className="shrink-0 ml-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        p.status === 'PRESENTED' ? 'bg-[#ebdccf] text-[#b45309] border border-[#ebdccf]' :
                        'bg-[#f9f5ee] text-[#7a685c] border border-[#ebdccf]'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* -------------------- MODALS -------------------- */}

      {/* Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#f9f5ee] border border-[#ebdccf] rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#3c2f25] mb-6">ยื่นข้อเสนอโครงการวิจัยใหม่</h3>
            <form onSubmit={handleProjectCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ชื่อโครงการวิจัย</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">คณะ/ภาควิชาที่จัดตั้ง</label>
                  <select
                    value={projectForm.department}
                    onChange={(e) => setProjectForm({ ...projectForm, department: e.target.value })}
                    className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:ring-1"
                  >
                    <option value="คณะแพทยศาสตร์">คณะแพทยศาสตร์</option>
                    <option value="คณะวิทยาศาสตร์">คณะวิทยาศาสตร์</option>
                    <option value="คณะเภสัชศาสตร์">คณะเภสัชศาสตร์</option>
                    <option value="คณะทันตแพทยศาสตร์">คณะทันตแพทยศาสตร์</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">งบประมาณเริ่มต้นเสนอขอ (บาท)</label>
                  <input
                    type="number"
                    required
                    value={projectForm.budgetInitial}
                    onChange={(e) => setProjectForm({ ...projectForm, budgetInitial: Number(e.target.value) })}
                    className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:ring-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">วันที่เริ่มโครงการ</label>
                  <input
                    type="date"
                    required
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:ring-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">วันที่สิ้นสุดโครงการ</label>
                  <input
                    type="date"
                    required
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                    className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#ebdccf]">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4.5 py-2.5 text-[#7a685c] hover:text-[#3c2f25] text-xs font-semibold rounded-xl hover:bg-[#fdfcf9]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-[#d97706] hover:bg-[#c2410c] text-[#3c2f25] text-xs font-semibold rounded-xl"
                >
                  ยื่นขอจดทะเบียนโครงการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publication Reward Request Modal */}
      {isPublicationModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#f9f5ee] border border-[#ebdccf] rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#3c2f25] mb-6">ขออนุมัติรับเงินรางวัลผลงานตีพิมพ์</h3>
            <form onSubmit={handlePublicationCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ชื่อบทความวิจัยที่ตีพิมพ์</label>
                <input
                  type="text"
                  required
                  value={publicationForm.title}
                  onChange={(e) => setPublicationForm({ ...publicationForm, title: e.target.value })}
                  className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">ชื่อวารสารที่ลงตีพิมพ์</label>
                  <input
                    type="text"
                    required
                    value={publicationForm.journal}
                    onChange={(e) => setPublicationForm({ ...publicationForm, journal: e.target.value })}
                    className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">ระดับ Quartile</label>
                  <select
                    value={publicationForm.quartile}
                    onChange={(e) => setPublicationForm({ ...publicationForm, quartile: e.target.value as any })}
                    className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  >
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">โครงการอ้างอิง (ถ้ามี)</label>
                  <select
                    value={publicationForm.projectId}
                    onChange={(e) => setPublicationForm({ ...publicationForm, projectId: e.target.value })}
                    className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  >
                    <option value="">ไม่ได้อ้างอิงโครงการ (อิสระ)</option>
                    {myProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">สถานะงานเขียนบทความ</label>
                  <select
                    value={publicationForm.status}
                    onChange={(e) => setPublicationForm({ ...publicationForm, status: e.target.value as any })}
                    className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  >
                    <option value="WRITING">กำลังเขียนบทความ (Draft)</option>
                    <option value="UNDER_REVIEW">ส่งพิจารณาตรวจแก้ (Under Review)</option>
                    <option value="PUBLISHED">ตีพิมพ์ลงวารสารแล้ว (Published)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">จำนวนเงินรางวัลที่เสนอขอ (บาท)</label>
                <input
                  type="number"
                  required
                  value={publicationForm.rewardAmount}
                  onChange={(e) => setPublicationForm({ ...publicationForm, rewardAmount: Number(e.target.value) })}
                  className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#ebdccf]">
                <button
                  type="button"
                  onClick={() => setIsPublicationModalOpen(false)}
                  className="px-4.5 py-2.5 text-[#7a685c] hover:text-[#3c2f25] text-xs font-semibold rounded-xl hover:bg-[#fdfcf9]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-[#d97706] text-[#3c2f25] text-xs font-semibold rounded-xl shadow-lg"
                >
                  ยืนยันส่งคำร้อง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consultation Booking Modal */}
      {isConsultationModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#f9f5ee] border border-[#ebdccf] rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#3c2f25] mb-6">จองคิวนัดหมายปรึกษา CEU</h3>
            <form onSubmit={handleConsultationCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ประเภทหัวข้อรับบริการ</label>
                <select
                  value={consultationForm.type}
                  onChange={(e) => setConsultationForm({ ...consultationForm, type: e.target.value as any })}
                  className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                >
                  <option value="PROTOCOL">จริยธรรมโครงร่างวิจัย (PROTOCOL)</option>
                  <option value="STATISTICAL">วิเคราะห์และวางแผนสถิติวิจัย (STATISTICAL)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">วันเวลาที่นัดหมาย</label>
                <input
                  type="datetime-local"
                  required
                  value={consultationForm.appointmentTime}
                  onChange={(e) => setConsultationForm({ ...consultationForm, appointmentTime: e.target.value })}
                  className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">เจ้าหน้าที่ผู้รับคำปรึกษา (Advisor)</label>
                <select
                  required
                  value={consultationForm.advisorId}
                  onChange={(e) => setConsultationForm({ ...consultationForm, advisorId: e.target.value })}
                  className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                >
                  <option value="" disabled>เลือกที่ปรึกษา...</option>
                  {allUsers
                    .filter(u => u.role === 'STAFF')
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#ebdccf]">
                <button
                  type="button"
                  onClick={() => setIsConsultationModalOpen(false)}
                  className="px-4.5 py-2.5 text-[#7a685c] hover:text-[#3c2f25] text-xs font-semibold rounded-xl hover:bg-[#fdfcf9]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-[#d97706] text-[#3c2f25] text-xs font-semibold rounded-xl shadow-lg"
                >
                  ส่งยืนยันจองนัดหมาย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Presentation Create Modal */}
      {isPresentationModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#f9f5ee] border border-[#ebdccf] rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#3c2f25] mb-6">บันทึกประวัติการนำเสนอผลงานวิจัย</h3>
            <form onSubmit={handlePresentationCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ชื่อหัวข้อผลงานวิจัย</label>
                <input
                  type="text"
                  required
                  value={presentationForm.title}
                  onChange={(e) => setPresentationForm({ ...presentationForm, title: e.target.value })}
                  className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ชื่องานประชุมวิชาการ / สัมมนา</label>
                <input
                  type="text"
                  required
                  value={presentationForm.conference}
                  onChange={(e) => setPresentationForm({ ...presentationForm, conference: e.target.value })}
                  className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">ประเภทการนำเสนอ</label>
                  <select
                    value={presentationForm.type}
                    onChange={(e) => setPresentationForm({ ...presentationForm, type: e.target.value as any })}
                    className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  >
                    <option value="ORAL"> Oral (บรรยาย)</option>
                    <option value="POSTER">Poster (โปสเตอร์)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">สถานะการนำเสนอ</label>
                  <select
                    value={presentationForm.status}
                    onChange={(e) => setPresentationForm({ ...presentationForm, status: e.target.value as any })}
                    className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  >
                    <option value="PENDING">กำลังส่งประวัติ (รอนำเสนอ)</option>
                    <option value="PRESENTED">นำเสนอสำเร็จแล้ว (Presented)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">โครงการวิจัยวิชาการที่อ้างอิง</label>
                <select
                  value={presentationForm.projectId}
                  onChange={(e) => setPresentationForm({ ...presentationForm, projectId: e.target.value })}
                  className="w-full bg-[#fdfcf9] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                >
                  <option value="">ไม่ได้อ้างอิงโครงการ (อิสระ)</option>
                  {myProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#ebdccf]">
                <button
                  type="button"
                  onClick={() => setIsPresentationModalOpen(false)}
                  className="px-4.5 py-2.5 text-[#7a685c] hover:text-[#3c2f25] text-xs font-semibold rounded-xl hover:bg-[#fdfcf9]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-[#d97706] text-[#3c2f25] text-xs font-semibold rounded-xl shadow-lg"
                >
                  บันทึกงานนำเสนอ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
