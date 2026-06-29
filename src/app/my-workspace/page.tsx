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

import { Permission, UserRole, ROLE_LABELS, getPermissionsForRoles, hasPermission as hasPermissionHelper } from '@/lib/permissions';

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  isDeleted?: boolean;
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
  const [activeTab, setActiveTab] = useState<'projects' | 'publications' | 'consultations' | 'presentations' | 'profile'>('projects');
  
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

  // Editing States
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [editingPresentation, setEditingPresentation] = useState<Presentation | null>(null);

  // Modal States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isPublicationModalOpen, setIsPublicationModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);

  // Forms
  const [projectForm, setProjectForm] = useState({
    title: '',
    status: 'PROPOSED' as 'PROPOSED' | 'APPROVED' | 'ONGOING' | 'COMPLETED' | 'TERMINATED',
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
    quartile: 'Q1' as 'Q1' | 'Q2' | 'Q3' | 'Q4',
    rewardAmount: 0,
    projectId: '',
    status: 'WRITING' as 'WRITING' | 'UNDER_REVIEW' | 'PUBLISHED' | 'REWARDED',
  });
  const [consultationForm, setConsultationForm] = useState({
    type: 'PROTOCOL' as 'PROTOCOL' | 'STATISTICAL',
    appointmentTime: '',
    advisorId: '',
  });
  const [presentationForm, setPresentationForm] = useState({
    title: '',
    conference: '',
    type: 'ORAL' as 'ORAL' | 'POSTER',
    status: 'PENDING' as 'PENDING' | 'PRESENTED',
    projectId: '',
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });

  const selectedResearcher = allUsers.find(u => u.id === selectedResearcherId);

  // Sync profile settings form when active researcher changes
  useEffect(() => {
    if (selectedResearcher) {
      setProfileForm({
        name: selectedResearcher.name,
        email: selectedResearcher.email,
      });
    }
  }, [selectedResearcher]);

  // Auto-clear success/error toast notifications after 3 seconds
  useEffect(() => {
    if (actionStatus && actionStatus.type !== 'loading') {
      const timer = setTimeout(() => {
        setActionStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionStatus]);

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
        const firstResearcher = resUsers.find(u => u.role.split(',').includes('RESEARCHER'));
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

  // Filters by selected researcher
  const myProjects = projects.filter(p => p.leaderId === selectedResearcherId);
  const myPublications = publications.filter(p => p.authorId === selectedResearcherId);
  const myPresentations = presentations.filter(p => p.presenterId === selectedResearcherId);
  
  // Consultations requested by selected researcher (both past and upcoming)
  const myConsultations = consultations.filter(c => c.requesterId === selectedResearcherId);
  const upcomingConsultations = myConsultations.filter(c => new Date(c.appointmentTime) >= new Date() && c.status === 'SCHEDULED');
  const pastConsultations = myConsultations.filter(c => new Date(c.appointmentTime) < new Date() || c.status !== 'SCHEDULED');

  const [activeRole, setActiveRole] = useState<UserRole>('RESEARCHER');
  const selectedResearcherRoles = (selectedResearcher ? (selectedResearcher.roles || (selectedResearcher.role ? selectedResearcher.role.split(',') : [])) : ['RESEARCHER']) as UserRole[];

  useEffect(() => {
    if (selectedResearcherRoles.length > 0 && !selectedResearcherRoles.includes(activeRole)) {
      setActiveRole(selectedResearcherRoles[0]);
    }
  }, [selectedResearcherId, selectedResearcherRoles, activeRole]);

  const hasPermission = (permission: Permission) => {
    return hasPermissionHelper([activeRole], permission);
  };

  // Edit Initiator Functions
  const handleEditProject = (p: Project) => {
    setEditingProject(p);
    setProjectForm({
      title: p.title,
      status: p.status,
      budgetInitial: p.budgetInitial,
      budgetSpent: p.budgetSpent,
      startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
      endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '',
      ceuConsultDate: p.ceuConsultDate ? new Date(p.ceuConsultDate).toISOString().split('T')[0] : '',
      irbNo: p.irbNo || '',
      approvedDate: p.approvedDate ? new Date(p.approvedDate).toISOString().split('T')[0] : '',
      department: p.department || 'คณะแพทยศาสตร์',
    });
    setIsProjectModalOpen(true);
  };

  const handleEditPublication = (pub: Publication) => {
    setEditingPublication(pub);
    setPublicationForm({
      title: pub.title,
      journal: pub.journal,
      quartile: pub.quartile,
      rewardAmount: pub.rewardAmount,
      projectId: pub.projectId || '',
      status: pub.status,
    });
    setIsPublicationModalOpen(true);
  };

  const handleEditConsultation = (c: Consultation) => {
    setEditingConsultation(c);
    setConsultationForm({
      type: c.type,
      appointmentTime: c.appointmentTime ? new Date(c.appointmentTime).toISOString().slice(0, 16) : '',
      advisorId: c.advisorId,
    });
    setIsConsultationModalOpen(true);
  };

  const handleEditPresentation = (pres: Presentation) => {
    setEditingPresentation(pres);
    setPresentationForm({
      title: pres.title,
      conference: pres.conference,
      type: pres.type,
      status: pres.status,
      projectId: pres.projectId || '',
    });
    setIsPresentationModalOpen(true);
  };

  // Delete Handler Functions
  const handleDeleteProject = async (id: string) => {
    if (confirm('คุณต้องการลบโครงการวิจัยนี้ใช่หรือไม่?')) {
      await runAction(
        'กำลังลบโครงการวิจัย...',
        () => fetch('/api/projects/' + id, { method: 'DELETE' }),
        'ลบโครงการวิจัยสำเร็จแล้ว!'
      );
    }
  };

  const handleDeletePublication = async (id: string) => {
    if (confirm('คุณต้องการลบข้อมูลงานตีพิมพ์นี้ใช่หรือไม่?')) {
      await runAction(
        'กำลังลบข้อมูลงานตีพิมพ์...',
        () => fetch('/api/publications/' + id, { method: 'DELETE' }),
        'ลบข้อมูลงานตีพิมพ์สำเร็จแล้ว!'
      );
    }
  };

  const handleDeleteConsultation = async (id: string) => {
    if (confirm('คุณต้องการลบการจองนัดหมายคำปรึกษานี้ใช่หรือไม่?')) {
      await runAction(
        'กำลังลบการจองนัดหมาย...',
        () => fetch('/api/consultations/' + id, { method: 'DELETE' }),
        'ลบการจองนัดหมายสำเร็จแล้ว!'
      );
    }
  };

  const handleDeletePresentation = async (id: string) => {
    if (confirm('คุณต้องการลบประวัตินำเสนอผลงานนี้ใช่หรือไม่?')) {
      await runAction(
        'กำลังลบประวัตินำเสนอผลงาน...',
        () => fetch('/api/presentations/' + id, { method: 'DELETE' }),
        'ลบประวัตินำเสนอผลงานสำเร็จแล้ว!'
      );
    }
  };

  // Unified Form Submissions
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProject ? 'PUT' : 'POST';
    const url = editingProject ? '/api/projects/' + editingProject.id : '/api/projects';
    
    const payload = {
      ...projectForm,
      leaderId: selectedResearcherId,
      budgetInitial: Number(projectForm.budgetInitial),
      budgetSpent: Number(projectForm.budgetSpent),
      ceuConsultDate: projectForm.ceuConsultDate || null,
      approvedDate: projectForm.approvedDate || null,
      irbNo: projectForm.irbNo || null,
    };

    const success = await runAction(
      editingProject ? 'กำลังบันทึกการแก้ไขโครงการ...' : 'กำลังยื่นเสนอโครงการใหม่...',
      () => fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),
      editingProject ? 'แก้ไขโครงการวิจัยสำเร็จแล้ว!' : 'ยื่นเสนอโครงการใหม่สำเร็จแล้ว!'
    );

    if (success) {
      setIsProjectModalOpen(false);
      setEditingProject(null);
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
    }
  };

  const handlePublicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingPublication ? 'PUT' : 'POST';
    const url = editingPublication ? '/api/publications/' + editingPublication.id : '/api/publications';

    const payload = {
      ...publicationForm,
      authorId: selectedResearcherId,
      rewardAmount: Number(publicationForm.rewardAmount),
      projectId: publicationForm.projectId || null,
    };

    const success = await runAction(
      editingPublication ? 'กำลังบันทึกการแก้ไขข้อมูลบทความ...' : 'กำลังส่งคำร้องขอรับเงินรางวัลตีพิมพ์...',
      () => fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),
      editingPublication ? 'แก้ไขข้อมูลบทความสำเร็จแล้ว!' : 'ส่งคำร้องขอรางวัลสำเร็จแล้ว!'
    );

    if (success) {
      setIsPublicationModalOpen(false);
      setEditingPublication(null);
      setPublicationForm({
        title: '',
        journal: '',
        quartile: 'Q1',
        rewardAmount: 0,
        projectId: '',
        status: 'WRITING',
      });
    }
  };

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingConsultation ? 'PUT' : 'POST';
    const url = editingConsultation ? '/api/consultations/' + editingConsultation.id : '/api/consultations';

    const payload = {
      ...consultationForm,
      requesterId: selectedResearcherId,
      status: editingConsultation ? editingConsultation.status : 'SCHEDULED',
    };

    const success = await runAction(
      editingConsultation ? 'กำลังบันทึกการแก้ไขนัดหมาย...' : 'กำลังส่งคำยืนยันจองนัดหมายคำปรึกษา...',
      () => fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),
      editingConsultation ? 'แก้ไขนัดหมายสำเร็จแล้ว!' : 'ส่งคำยืนยันจองนัดหมายสำเร็จแล้ว!'
    );

    if (success) {
      setIsConsultationModalOpen(false);
      setEditingConsultation(null);
      setConsultationForm({
        type: 'PROTOCOL',
        appointmentTime: '',
        advisorId: '',
      });
    }
  };

  const handlePresentationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingPresentation ? 'PUT' : 'POST';
    const url = editingPresentation ? '/api/presentations/' + editingPresentation.id : '/api/presentations';

    const payload = {
      ...presentationForm,
      presenterId: selectedResearcherId,
      projectId: presentationForm.projectId || null,
    };

    const success = await runAction(
      editingPresentation ? 'กำลังบันทึกการแก้ไขประวัตินำเสนอผลงาน...' : 'กำลังบันทึกประวัตินำเสนอผลงานวิจัย...',
      () => fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),
      editingPresentation ? 'แก้ไขประวัตินำเสนอผลงานสำเร็จแล้ว!' : 'เพิ่มประวัตินำเสนอผลงานสำเร็จแล้ว!'
    );

    if (success) {
      setIsPresentationModalOpen(false);
      setEditingPresentation(null);
      setPresentationForm({
        title: '',
        conference: '',
        type: 'ORAL',
        status: 'PENDING',
        projectId: '',
      });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResearcherId) return;

    await runAction(
      'กำลังบันทึกข้อมูลส่วนตัว...',
      () => fetch(`/api/users/${selectedResearcherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      }),
      'บันทึกการตั้งค่าโปรไฟล์ส่วนตัวเรียบร้อยแล้ว!'
    );
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
    <div className="min-h-screen bg-[#fdfcf9] text-[#3c2f25] pb-12 font-sans selection:bg-[#d97706]/20 selection:text-[#3c2f25]">
      
      {/* Top Banner Header */}
      <div className="bg-[#d97706] text-[#fdfcf9] py-3.5 px-6 shadow-md text-xs font-semibold tracking-wide flex justify-between items-center border-b border-[#c2410c]">
        <div className="flex items-center gap-2">
          <Award className="h-4.5 w-4.5 animate-pulse text-[#fdfcf9]" />
          <span>RESEARCH & PUBLICATION CEU MANAGEMENT WORKSPACE</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/about" className="text-[#fdfcf9] hover:underline font-semibold mr-2">เกี่ยวกับโครงการ (Portfolio)</a>
          <span className="opacity-90 bg-black/10 px-2.5 py-1 rounded border border-[#fdfcf9]/20">Cloudflare Pages Live Mode (D1 Binding)</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* Simulating Login/Select Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-[#ebdccf]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#3c2f25] font-serif">พื้นที่ทำงานส่วนบุคคลของนักวิจัย</h1>
            <p className="text-sm text-[#7a685c] mt-1.5 font-medium">จัดการเสนอขอโครงการวิจัย ยื่นเคลมรางวัลผลงานตีพิมพ์นิตยสาร และจองคิว CEU Advisory</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-[#f9f5ee] border border-[#ebdccf] px-4.5 py-3 rounded-2xl shadow-sm self-start md:self-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#7a685c] whitespace-nowrap">จำลองเข้าสู่ระบบเป็น:</span>
              <div className="relative">
                <select
                  value={selectedResearcherId}
                  onChange={(e) => {
                    setSelectedResearcherId(e.target.value);
                    setEditingProject(null);
                    setEditingPublication(null);
                    setEditingConsultation(null);
                    setEditingPresentation(null);
                  }}
                  className="bg-[#fdfcf9] border border-[#ebdccf] text-xs font-bold rounded-xl pl-3 pr-8 py-2 text-[#3c2f25] focus:outline-none focus:ring-1 focus:ring-[#d97706] appearance-none cursor-pointer"
                >
                  {allUsers
                    .filter(u => u.role.split(',').includes('RESEARCHER') || u.role.split(',').includes('STAFF'))
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))
                  }
                </select>
              </div>
            </div>

            {selectedResearcherRoles.length > 1 && (
              <div className="flex items-center gap-2 border-l border-[#ebdccf] pl-4">
                <span className="text-xs font-bold text-[#7a685c] whitespace-nowrap">โหมดสิทธิ์:</span>
                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value as UserRole)}
                  className="bg-amber-100 text-xs font-bold text-amber-900 border-0 focus:ring-2 focus:ring-[#d97706] rounded-lg px-2 py-1 cursor-pointer transition-colors"
                >
                  {selectedResearcherRoles.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role] || role}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#ebdccf] gap-2">
          {[
            { id: 'projects', label: 'โครงการวิจัยของฉัน', icon: FileText },
            { id: 'publications', label: 'การตีพิมพ์และขอรางวัล', icon: BookOpen },
            { id: 'consultations', label: 'ตารางนัดหมายปรึกษา CEU', icon: Calendar },
            { id: 'presentations', label: 'ประวัติการนำเสนอผลงาน', icon: PresIcon },
            { id: 'profile', label: 'ตั้งค่าข้อมูลส่วนตัว', icon: User }
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
            <div className="flex items-center justify-between mt-6">
              <h2 className="text-lg font-bold text-[#3c2f25]">ทะเบียนโครงการวิจัยวิชาการ</h2>
              <button
                onClick={() => {
                  setEditingProject(null);
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
                  setIsProjectModalOpen(true);
                }}
                className="flex items-center gap-2 bg-[#d97706] hover:bg-[#c2410c] text-[#fdfcf9] font-semibold text-xs px-4.5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4 text-[#fdfcf9]" />
                <span>ยื่นเสนอโครงการใหม่</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myProjects.length === 0 ? (
                <div className="md:col-span-2 text-center py-12 bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl text-[#7a685c]">
                  คุณยังไม่มีโครงการวิจัยลงทะเบียนในระบบ
                </div>
              ) : (
                myProjects.map(p => (
                  <div key={p.id} className="bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl p-6 flex flex-col justify-between hover:border-[#ebdccf] transition-colors relative">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'PROPOSED' ? 'bg-[#f9f5ee] text-[#7a685c] border border-[#ebdccf]' :
                          p.status === 'APPROVED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                          p.status === 'ONGOING' ? 'bg-[#fdf6e2] text-[#b45309] border border-[#fbe3b5] animate-pulse' :
                          p.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {p.status}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditProject(p)}
                            className="p-1.5 text-[#7a685c] hover:text-[#3c2f25] rounded hover:bg-[#f9f5ee] transition-colors"
                            title="แก้ไข"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {hasPermission('DELETE_RESEARCH') && (
                            <button
                              onClick={() => handleDeleteProject(p.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/20 transition-colors"
                              title="ลบ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="text-base font-bold text-[#3c2f25] mt-4">{p.title}</h3>
                      <div className="text-xs text-[#7a685c] space-y-1.5 mt-5">
                        <p>ระยะเวลา: {formatDate(p.startDate)} - {formatDate(p.endDate)}</p>
                        <p>เลขที่ IRB: {p.irbNo || 'รอดำเนินการขอจริยธรรมวิจัย'}</p>
                        {p.ceuConsultDate && <p className="text-[#b45309]">วันที่นัดหมายปรึกษา CEU: {formatDate(p.ceuConsultDate)}</p>}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-900 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#7a685c]">ใช้จ่ายงบวิจัยไปแล้ว: <span className="text-amber-500 font-semibold">{formatCurrency(p.budgetSpent)}</span></span>
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
            <div className="flex items-center justify-between mt-6">
              <h2 className="text-lg font-bold text-[#3c2f25]">งานตีพิมพ์วารสารวิชาการและการเสนอขอเงินรางวัล</h2>
              <button
                onClick={() => {
                  setEditingPublication(null);
                  setPublicationForm({
                    title: '',
                    journal: '',
                    quartile: 'Q1',
                    rewardAmount: 0,
                    projectId: '',
                    status: 'WRITING',
                  });
                  setIsPublicationModalOpen(true);
                }}
                className="flex items-center gap-2 bg-[#d97706] hover:bg-[#c2410c] text-[#fdfcf9] font-semibold text-xs px-4.5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4 text-[#fdfcf9]" />
                <span>ขออนุมัติรางวัลจากบทความ</span>
              </button>
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
                          <span className="bg-amber-600/10 text-amber-500 border border-amber-600/30 px-2.5 py-0.5 rounded-md text-[10px] font-bold">
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

                      <div className="flex items-center gap-4">
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
                              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" />
                                APPROVED
                              </span>
                            )}
                            {p.rewardStatus === 'REJECTED' && (
                              <span className="bg-rose-950 text-rose-400 border border-rose-800 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                                <XCircle className="h-3.5 w-3.5" />
                                REJECTED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEditPublication(p)}
                            className="p-1.5 text-[#7a685c] hover:text-[#3c2f25] rounded hover:bg-[#f9f5ee] transition-colors"
                            title="แก้ไข"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {hasPermission('DELETE_RESEARCH') && (
                            <button
                              onClick={() => handleDeletePublication(p.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/20 transition-colors"
                              title="ลบ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
            <div className="flex items-center justify-between mt-6">
              <h2 className="text-lg font-bold text-[#3c2f25]">ตารางนัดหมายขอรับคำปรึกษา CEU</h2>
              <button
                onClick={() => {
                  setEditingConsultation(null);
                  const staffAdvisor = allUsers.find(u => u.role === 'STAFF');
                  setConsultationForm({
                    type: 'PROTOCOL',
                    appointmentTime: '',
                    advisorId: staffAdvisor?.id || '',
                  });
                  setIsConsultationModalOpen(true);
                }}
                className="flex items-center gap-2 bg-[#d97706] hover:bg-[#c2410c] text-[#fdfcf9] font-semibold text-xs px-4.5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4 text-[#fdfcf9]" />
                <span>จองคิวนัดปรึกษาด้านสถิติ / Protocol</span>
              </button>
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
                          c.type === 'PROTOCOL' ? 'bg-amber-600/10 text-amber-500 border border-amber-500/20' :
                          'bg-cyan-600/10 text-cyan-500 border border-cyan-500/20'
                        }`}>
                          {c.type}
                        </span>
                        <h4 className="text-sm font-bold text-[#3c2f25] mt-2">{formatDate(c.appointmentTime)} น.</h4>
                        <p className="text-[11px] text-[#7a685c] mt-1">
                          ที่ปรึกษา: {c.advisor ? (c.advisor.isDeleted ? `${c.advisor.name} (พ้นสภาพ)` : c.advisor.name) : 'กำลังจัดหา'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold bg-blue-950 text-blue-400 px-2 py-0.5 rounded-full border border-blue-800 uppercase">
                          {c.status}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditConsultation(c)}
                            className="p-1 text-[#7a685c] hover:text-[#3c2f25] rounded hover:bg-[#fdfcf9] transition-colors"
                            title="แก้ไข"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {hasPermission('DELETE_RESEARCH') && (
                            <button
                              onClick={() => handleDeleteConsultation(c.id)}
                              className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/20 transition-colors"
                              title="ลบ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
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
                    <div key={c.id} className="bg-[#f9f5ee] p-4 rounded-xl border border-[#ebdccf] flex items-center justify-between opacity-75">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.type === 'PROTOCOL' ? 'bg-amber-600/10 text-amber-500 border border-amber-500/20' :
                          'bg-cyan-600/10 text-cyan-500 border border-cyan-500/20'
                        }`}>{c.type}</span>
                        <h4 className="text-xs font-semibold text-slate-700 mt-2">{formatDate(c.appointmentTime)} น.</h4>
                        <p className="text-[10px] text-[#7a685c] mt-0.5">
                          ที่ปรึกษา: {c.advisor ? (c.advisor.isDeleted ? `${c.advisor.name} (พ้นสภาพ)` : c.advisor.name) : 'ไม่ระบุ'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          c.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {c.status}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditConsultation(c)}
                            className="p-1 text-[#7a685c] hover:text-[#3c2f25] rounded hover:bg-[#fdfcf9] transition-colors"
                            title="แก้ไข"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {hasPermission('DELETE_RESEARCH') && (
                            <button
                              onClick={() => handleDeleteConsultation(c.id)}
                              className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/20 transition-colors"
                              title="ลบ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
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
            <div className="flex items-center justify-between mt-6">
              <h2 className="text-lg font-bold text-[#3c2f25]">ประวัติทะเบียนงานนำเสนอวิจัยวิชาการ</h2>
              <button
                onClick={() => {
                  setEditingPresentation(null);
                  setPresentationForm({
                    title: '',
                    conference: '',
                    type: 'ORAL',
                    status: 'PENDING',
                    projectId: '',
                  });
                  setIsPresentationModalOpen(true);
                }}
                className="flex items-center gap-2 bg-[#d97706] hover:bg-[#c2410c] text-[#fdfcf9] font-semibold text-xs px-4.5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4 text-[#fdfcf9]" />
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
                        <span className="text-slate-400">•</span>
                        <span className="text-xs text-[#7a685c] font-semibold">{p.conference}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#3c2f25] mt-3">{p.title}</h3>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        p.status === 'PENDING' ? 'bg-[#fdfcf9] text-[#7a685c] border border-[#ebdccf]' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {p.status}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditPresentation(p)}
                          className="p-1.5 text-[#7a685c] hover:text-[#3c2f25] rounded hover:bg-[#f9f5ee] transition-colors"
                          title="แก้ไข"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {hasPermission('DELETE_RESEARCH') && (
                          <button
                            onClick={() => handleDeletePresentation(p.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/20 transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mt-6">
              <h2 className="text-lg font-bold text-[#3c2f25] font-serif">ตั้งค่าโปรไฟล์ส่วนตัว (Profile Settings)</h2>
            </div>

            <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-3xl p-8 max-w-xl shadow-md">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-[#7a685c] block mb-2 uppercase tracking-wider">บทบาทในระบบปัจจุบันของคุณ</label>
                  <div className="flex gap-2">
                    {selectedResearcherRoles.map((role) => (
                      <span key={role} className="px-3.5 py-1.5 bg-[#f5e6d3] text-[#b45309] border border-[#ebdccf] rounded-xl text-xs font-bold">
                        {ROLE_LABELS[role] || role}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#a09085] mt-2">
                    *สิทธิ์ระดับบทบาท (Roles) และสถานะการพ้นสภาพข้อมูล ได้รับการป้องกันด้านความปลอดภัย โดยสามารถปรับเปลี่ยนแก้ไขได้เฉพาะเจ้าหน้าที่ Staff / Admin เท่านั้น
                  </p>
                </div>

                <div className="border-t border-[#ebdccf]/60 pt-6 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#7a685c] block mb-2 uppercase tracking-wider">ชื่อ-นามสกุลจริง</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4.5 py-3 text-sm text-[#3c2f25] focus:outline-none focus:ring-1 focus:ring-[#d97706] focus:border-[#d97706] font-medium"
                      placeholder="ระบุชื่อ-นามสกุล..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#7a685c] block mb-2 uppercase tracking-wider">อีเมลสำหรับติดต่อสถาบัน</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4.5 py-3 text-sm text-[#3c2f25] focus:outline-none focus:ring-1 focus:ring-[#d97706] focus:border-[#d97706] font-medium"
                      placeholder="ระบุอีเมลหลักที่ใช้ติดต่อ..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[#ebdccf]/60">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-[#d97706] hover:bg-[#c2410c] text-[#fdfcf9] font-bold text-xs px-6 py-3 rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>บันทึกการตั้งค่าโปรไฟล์</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* -------------------- MODAL DIALOGS -------------------- */}

      {/* Project Modal (Create / Edit) */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#3c2f25] mb-6">
              {editingProject ? 'แก้ไขโครงการวิจัยวิชาการ' : 'ยื่นขอเสนอจดทะเบียนโครงการวิจัยวิชาการ'}
            </h3>
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ชื่อโครงการวิจัย (ภาษาไทย / อังกฤษ)</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:outline-none focus:ring-1 focus:ring-[#d97706]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">วันที่เริ่มต้นโครงการ</label>
                  <input
                    type="date"
                    required
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">วันที่สิ้นสุดโครงการ</label>
                  <input
                    type="date"
                    required
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">งบประมาณตั้งต้นวิจัย (บาท)</label>
                  <input
                    type="number"
                    required
                    value={projectForm.budgetInitial}
                    onChange={(e) => setProjectForm({ ...projectForm, budgetInitial: Number(e.target.value) })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">งบประมาณที่ใช้ไปแล้ว (บาท)</label>
                  <input
                    type="number"
                    required
                    value={projectForm.budgetSpent}
                    onChange={(e) => setProjectForm({ ...projectForm, budgetSpent: Number(e.target.value) })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">เลขที่การอนุมัติ IRB</label>
                  <input
                    type="text"
                    value={projectForm.irbNo}
                    onChange={(e) => setProjectForm({ ...projectForm, irbNo: e.target.value })}
                    placeholder="เว้นว่างได้"
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">วันที่อนุมัติ IRB</label>
                  <input
                    type="date"
                    value={projectForm.approvedDate}
                    onChange={(e) => setProjectForm({ ...projectForm, approvedDate: e.target.value })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">สังกัดคณะวิจัย</label>
                  <select
                    value={projectForm.department}
                    onChange={(e) => setProjectForm({ ...projectForm, department: e.target.value })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  >
                    <option value="คณะแพทยศาสตร์">คณะแพทยศาสตร์</option>
                    <option value="คณะทันตแพทยศาสตร์">คณะทันตแพทยศาสตร์</option>
                    <option value="คณะเภสัชศาสตร์">คณะเภสัชศาสตร์</option>
                    <option value="วิทยาลัยพยาบาล">วิทยาลัยพยาบาล</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">สถานะโครงการ</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as any })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  >
                    <option value="PROPOSED">PROPOSED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="TERMINATED">TERMINATED</option>
                  </select>
                </div>
              </div>

              {editingProject && (
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">วันที่ปรึกษา CEU (วันนัด)</label>
                  <input
                    type="date"
                    value={projectForm.ceuConsultDate}
                    onChange={(e) => setProjectForm({ ...projectForm, ceuConsultDate: e.target.value })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#ebdccf]">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4.5 py-2.5 text-[#7a685c] hover:text-[#3c2f25] text-xs font-semibold rounded-xl hover:bg-[#f9f5ee]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-[#d97706] text-[#fdfcf9] text-xs font-semibold rounded-xl shadow-lg"
                >
                  {editingProject ? 'บันทึกการแก้ไข' : 'ยื่นขอจดทะเบียนโครงการ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publication Reward Request Modal */}
      {isPublicationModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#3c2f25] mb-6">
              {editingPublication ? 'แก้ไขข้อมูลบทความวิจัย' : 'ขออนุมัติรับเงินรางวัลผลงานตีพิมพ์'}
            </h3>
            <form onSubmit={handlePublicationSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ชื่อบทความวิจัยที่ตีพิมพ์</label>
                <input
                  type="text"
                  required
                  value={publicationForm.title}
                  onChange={(e) => setPublicationForm({ ...publicationForm, title: e.target.value })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
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
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">ระดับ Quartile</label>
                  <select
                    value={publicationForm.quartile}
                    onChange={(e) => setPublicationForm({ ...publicationForm, quartile: e.target.value as any })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
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
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
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
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
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
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#ebdccf]">
                <button
                  type="button"
                  onClick={() => setIsPublicationModalOpen(false)}
                  className="px-4.5 py-2.5 text-[#7a685c] hover:text-[#3c2f25] text-xs font-semibold rounded-xl hover:bg-[#f9f5ee]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-[#d97706] text-[#fdfcf9] text-xs font-semibold rounded-xl shadow-lg"
                >
                  {editingPublication ? 'บันทึกการแก้ไข' : 'ยืนยันส่งคำร้อง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consultation Booking Modal */}
      {isConsultationModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#3c2f25] mb-6">
              {editingConsultation ? 'แก้ไขการจองคิวนัดหมายปรึกษา' : 'จองคิวนัดหมายปรึกษา CEU'}
            </h3>
            <form onSubmit={handleConsultationSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ประเภทหัวข้อรับบริการ</label>
                <select
                  value={consultationForm.type}
                  onChange={(e) => setConsultationForm({ ...consultationForm, type: e.target.value as any })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
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
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">เจ้าหน้าที่ผู้รับคำปรึกษา (Advisor)</label>
                <select
                  required
                  value={consultationForm.advisorId}
                  onChange={(e) => setConsultationForm({ ...consultationForm, advisorId: e.target.value })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                >
                  <option value="" disabled>เลือกที่ปรึกษา...</option>
                  {allUsers
                    .filter(u => u.role.split(',').includes('STAFF'))
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
                  className="px-4.5 py-2.5 text-[#7a685c] hover:text-[#3c2f25] text-xs font-semibold rounded-xl hover:bg-[#f9f5ee]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-[#d97706] text-[#fdfcf9] text-xs font-semibold rounded-xl shadow-lg"
                >
                  {editingConsultation ? 'บันทึกการแก้ไข' : 'ส่งยืนยันจองนัดหมาย'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Presentation Create/Edit Modal */}
      {isPresentationModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#3c2f25] mb-6">
              {editingPresentation ? 'แก้ไขประวัติการนำเสนอผลงานวิจัย' : 'บันทึกประวัติการนำเสนอผลงานวิจัย'}
            </h3>
            <form onSubmit={handlePresentationSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ชื่อหัวข้อผลงานวิจัย</label>
                <input
                  type="text"
                  required
                  value={presentationForm.title}
                  onChange={(e) => setPresentationForm({ ...presentationForm, title: e.target.value })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ชื่องานประชุมวิชาการ / สัมมนา</label>
                <input
                  type="text"
                  required
                  value={presentationForm.conference}
                  onChange={(e) => setPresentationForm({ ...presentationForm, conference: e.target.value })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">ประเภทการนำเสนอ</label>
                  <select
                    value={presentationForm.type}
                    onChange={(e) => setPresentationForm({ ...presentationForm, type: e.target.value as any })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
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
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
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
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25]"
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
                  className="px-4.5 py-2.5 text-[#7a685c] hover:text-[#3c2f25] text-xs font-semibold rounded-xl hover:bg-[#f9f5ee]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-[#d97706] text-[#fdfcf9] text-xs font-semibold rounded-xl shadow-lg"
                >
                  {editingPresentation ? 'บันทึกการแก้ไข' : 'บันทึกงานนำเสนอ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Status Toast Notification */}
      {actionStatus && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-300">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md bg-[#fdfcf9]/95 border-[#d97706]/30 text-[#d97706]">
            {actionStatus.type === 'loading' && (
              <svg className="animate-spin h-5 w-5 text-[#d97706]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {actionStatus.type === 'success' && (
              <svg className="h-5 w-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {actionStatus.type === 'error' && (
              <svg className="h-5 w-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="text-sm font-bold tracking-wide">{actionStatus.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
