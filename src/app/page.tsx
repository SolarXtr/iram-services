'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Layers, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Search, 
  FileText, 
  Award, 
  ChevronRight, 
  Clock, 
  RefreshCw,
  UserCheck
} from 'lucide-react';

// Types matching mockDb / Prisma
interface User {
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
  leaderId: string;
  leader?: User;
}

interface Publication {
  id: string;
  title: string;
  journal: string;
  quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  rewardStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rewardAmount: number;
  projectId?: string | null;
  project?: Project | null;
  authorId: string;
  author?: User;
}

interface Consultation {
  id: string;
  type: 'PROTOCOL' | 'STATISTICAL';
  appointmentTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  advisorId: string;
  advisor?: User;
  requesterId: string;
  requester?: User;
}

export default function ResearchManagementDashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'projects' | 'publications' | 'consultations' | 'db-status'>('dashboard');
  const [currentRole, setCurrentRole] = useState<'RESEARCHER' | 'STAFF' | 'EXECUTIVE'>('STAFF');

  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDbMock, setIsDbMock] = useState(true);
  const [dbStatus, setDbStatus] = useState<any>({
    status: 'loading',
    isMock: false,
    connectionType: 'Detecting...',
    host: '',
    databaseName: '',
    latencyMs: 0
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isPublicationModalOpen, setIsPublicationModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // Editing States (null means creating)
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);

  // Form States
  const [userForm, setUserForm] = useState<{ name: string; email: string; role: 'RESEARCHER' | 'STAFF' | 'EXECUTIVE' }>({ name: '', email: '', role: 'RESEARCHER' });
  const [projectForm, setProjectForm] = useState<{
    title: string;
    status: 'PROPOSED' | 'APPROVED' | 'ONGOING' | 'COMPLETED' | 'TERMINATED';
    budgetInitial: number;
    budgetSpent: number;
    startDate: string;
    endDate: string;
    ceuConsultDate: string;
    irbNo: string;
    approvedDate: string;
    leaderId: string;
  }>({
    title: '',
    status: 'PROPOSED',
    budgetInitial: 0,
    budgetSpent: 0,
    startDate: '',
    endDate: '',
    ceuConsultDate: '',
    irbNo: '',
    approvedDate: '',
    leaderId: '',
  });
  const [publicationForm, setPublicationForm] = useState<{
    title: string;
    journal: string;
    quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    rewardStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    rewardAmount: number;
    projectId: string;
    authorId: string;
  }>({
    title: '',
    journal: '',
    quartile: 'Q1',
    rewardStatus: 'PENDING',
    rewardAmount: 0,
    projectId: '',
    authorId: '',
  });
  const [consultationForm, setConsultationForm] = useState<{
    type: 'PROTOCOL' | 'STATISTICAL';
    appointmentTime: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    advisorId: string;
    requesterId: string;
  }>({
    type: 'PROTOCOL',
    appointmentTime: '',
    status: 'SCHEDULED',
    advisorId: '',
    requesterId: '',
  });

  // Fetch API Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resUsers, resProjects, resPubs, resConsults, resStatus] = await Promise.all([
        fetch('/api/users').then((res) => res.json()),
        fetch('/api/projects').then((res) => res.json()),
        fetch('/api/publications').then((res) => res.json()),
        fetch('/api/consultations').then((res) => res.json()),
        fetch('/api/db-status').then((res) => res.json()).catch((err) => ({
          status: 'error',
          isMock: true,
          connectionType: 'Error',
          error: err.message || err.toString()
        })),
      ]);

      if (Array.isArray(resUsers)) setUsers(resUsers);
      if (Array.isArray(resProjects)) setProjects(resProjects);
      if (Array.isArray(resPubs)) setPublications(resPubs);
      if (Array.isArray(resConsults)) setConsultations(resConsults);
      if (resStatus) {
        setIsDbMock(resStatus.isMock);
        setDbStatus(resStatus);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  // Format Helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // CRUD handlers for Users
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingUser ? 'PUT' : 'POST';
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });
      if (res.ok) {
        setIsUserModalOpen(false);
        setEditingUser(null);
        setUserForm({ name: '', email: '', role: 'RESEARCHER' });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, role: user.role });
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?')) {
      try {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // CRUD handlers for Projects
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProject ? 'PUT' : 'POST';
    const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';

    const payload = {
      ...projectForm,
      budgetInitial: Number(projectForm.budgetInitial),
      budgetSpent: Number(projectForm.budgetSpent),
      ceuConsultDate: projectForm.ceuConsultDate || null,
      approvedDate: projectForm.approvedDate || null,
      irbNo: projectForm.irbNo || null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
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
          leaderId: '',
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

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
      leaderId: p.leaderId,
    });
    setIsProjectModalOpen(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('คุณต้องการลบโครงการวิจัยนี้ใช่หรือไม่?')) {
      try {
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // CRUD handlers for Publications
  const handlePublicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingPublication ? 'PUT' : 'POST';
    const url = editingPublication ? `/api/publications/${editingPublication.id}` : '/api/publications';

    const payload = {
      ...publicationForm,
      rewardAmount: Number(publicationForm.rewardAmount),
      projectId: publicationForm.projectId || null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsPublicationModalOpen(false);
        setEditingPublication(null);
        setPublicationForm({
          title: '',
          journal: '',
          quartile: 'Q1',
          rewardStatus: 'PENDING',
          rewardAmount: 0,
          projectId: '',
          authorId: '',
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditPublication = (pub: Publication) => {
    setEditingPublication(pub);
    setPublicationForm({
      title: pub.title,
      journal: pub.journal,
      quartile: pub.quartile,
      rewardStatus: pub.rewardStatus,
      rewardAmount: pub.rewardAmount,
      projectId: pub.projectId || '',
      authorId: pub.authorId,
    });
    setIsPublicationModalOpen(true);
  };

  const handleRewardStatusChange = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/publications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardStatus: newStatus }),
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePublication = async (id: string) => {
    if (confirm('คุณต้องการลบงานตีพิมพ์นี้ใช่หรือไม่?')) {
      try {
        await fetch(`/api/publications/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // CRUD handlers for Consultations
  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingConsultation ? 'PUT' : 'POST';
    const url = editingConsultation ? `/api/consultations/${editingConsultation.id}` : '/api/consultations';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultationForm),
      });
      if (res.ok) {
        setIsConsultationModalOpen(false);
        setEditingConsultation(null);
        setConsultationForm({
          type: 'PROTOCOL',
          appointmentTime: '',
          status: 'SCHEDULED',
          advisorId: '',
          requesterId: '',
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditConsultation = (c: Consultation) => {
    setEditingConsultation(c);
    setConsultationForm({
      type: c.type,
      appointmentTime: c.appointmentTime ? new Date(c.appointmentTime).toISOString().slice(0, 16) : '',
      status: c.status,
      advisorId: c.advisorId,
      requesterId: c.requesterId,
    });
    setIsConsultationModalOpen(true);
  };

  const handleConsultStatusChange = async (id: string, newStatus: 'COMPLETED' | 'CANCELLED') => {
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConsultation = async (id: string) => {
    if (confirm('คุณต้องการลบนัดหมายคำปรึกษานี้ใช่หรือไม่?')) {
      try {
        await fetch(`/api/consultations/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Calculated Stats for Dashboard
  const totalBudget = projects.reduce((acc, curr) => acc + curr.budgetInitial, 0);
  const totalBudgetSpent = projects.reduce((acc, curr) => acc + curr.budgetSpent, 0);
  const totalApprovedReward = publications
    .filter((p) => p.rewardStatus === 'APPROVED')
    .reduce((acc, curr) => acc + curr.rewardAmount, 0);
  const pendingPublications = publications.filter((p) => p.rewardStatus === 'PENDING').length;
  const activeConsultationsCount = consultations.filter((c) => c.status === 'SCHEDULED').length;

  if (!mounted) {
    return <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-300">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Panel */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">iRAM Services</h1>
              <p className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">Research System</p>
            </div>
          </div>
          
          <nav className="p-4 space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span>สรุปภาพรวมแดชบอร์ด</span>
            </button>

            <button
              onClick={() => { setActiveTab('projects'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'projects'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>โครงการวิจัย</span>
            </button>

            <button
              onClick={() => { setActiveTab('publications'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'publications'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span>บทความวิชาการ (Publications)</span>
            </button>

            <button
              onClick={() => { setActiveTab('consultations'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'consultations'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span>การให้คำปรึกษา (CEU)</span>
            </button>

            <button
              onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>บริหารข้อมูลผู้ใช้ (Users)</span>
            </button>

            <button
              onClick={() => { setActiveTab('db-status'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'db-status'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <RefreshCw className="h-5 w-5" />
              <span>สถานะคลาวด์เดสเก็ต (DB Status)</span>
            </button>
          </nav>
        </div>

        {/* Footer Sidebar info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block tracking-wider font-semibold">Active Database</span>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-medium text-slate-300">
                {isDbMock ? 'Local JSON Store (Mock)' : 'PostgreSQL (Cloud SQL)'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Panel */}
        <header className="h-20 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight capitalize text-white">
              {activeTab === 'dashboard' && 'แดชบอร์ดสรุปผลวิจัย'}
              {activeTab === 'users' && 'บริหารจัดการผู้ใช้งาน'}
              {activeTab === 'projects' && 'โครงการวิจัยและงบประมาณ'}
              {activeTab === 'publications' && 'งานวิจัยตีพิมพ์และสิทธิ์รับรางวัล'}
              {activeTab === 'consultations' && 'ระบบจองคิวคำปรึกษา CEU'}
            </h2>
            {loading && <RefreshCw className="h-4 w-4 animate-spin text-slate-500" />}
          </div>

          {/* Quick Role Impersonator Switcher */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl shadow-inner shadow-black/20">
            <UserCheck className="h-4.5 w-4.5 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-300">จำลองสิทธิ์:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as any)}
              className="bg-slate-950 text-xs font-bold text-white border-0 focus:ring-2 focus:ring-indigo-500 rounded-lg px-2 py-1 cursor-pointer transition-colors"
            >
              <option value="STAFF">เจ้าหน้าที่ (Staff)</option>
              <option value="RESEARCHER">นักวิจัย (Researcher)</option>
              <option value="EXECUTIVE">ผู้บริหาร (Executive)</option>
            </select>
          </div>
        </header>

        {/* Dashboard Pages Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-900">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute right-4 top-4 bg-indigo-500/10 p-3 rounded-xl text-indigo-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">โครงการวิจัยทั้งหมด</span>
                  <h3 className="text-3xl font-extrabold mt-2 text-white">{projects.length} โครงการ</h3>
                  <div className="mt-4 text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>ดำเนินงานอยู่ {projects.filter((p) => p.status === 'ONGOING').length} โครงการ</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute right-4 top-4 bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">งบประมาณตั้งต้นรวม</span>
                  <h3 className="text-3xl font-extrabold mt-2 text-emerald-400">{formatCurrency(totalBudget)}</h3>
                  <div className="mt-4 text-xs text-slate-400 flex items-center justify-between">
                    <span>ใช้ไปแล้ว {((totalBudgetSpent / (totalBudget || 1)) * 100).toFixed(1)}%</span>
                    <span className="text-slate-500 font-medium">{formatCurrency(totalBudgetSpent)}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute right-4 top-4 bg-violet-500/10 p-3 rounded-xl text-violet-400">
                    <Award className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">รางวัลการตีพิมพ์ที่อนุมัติ</span>
                  <h3 className="text-3xl font-extrabold mt-2 text-violet-400">{formatCurrency(totalApprovedReward)}</h3>
                  <div className="mt-4 text-xs text-slate-500 flex items-center gap-1">
                    <span>รอนุมัติรางวัล {pendingPublications} รายการ</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute right-4 top-4 bg-amber-500/10 p-3 rounded-xl text-amber-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">นัดหมายคำปรึกษา CEU</span>
                  <h3 className="text-3xl font-extrabold mt-2 text-amber-400">{activeConsultationsCount} นัดหมาย</h3>
                  <div className="mt-4 text-xs text-slate-500">
                    <span>ประเมิน Protocol & สถิติวิจัย</span>
                  </div>
                </div>
              </div>

              {/* Grid 2 Column */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent consultations timeline */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-lg lg:col-span-2">
                  <h4 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-400" />
                    <span>นัดหมายปรึกษา CEU เร็วๆ นี้</span>
                  </h4>
                  <div className="space-y-4">
                    {consultations.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-6">ไม่มีข้อมูลนัดหมายในระบบ</p>
                    ) : (
                      consultations.slice(0, 5).map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                          <div className="flex items-center gap-3.5">
                            <div className={`p-2.5 rounded-xl text-white font-bold text-xs ${
                              c.type === 'PROTOCOL' ? 'bg-amber-600/80' : 'bg-cyan-600/80'
                            }`}>
                              {c.type}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">ผู้รับบริการ: {c.requester?.name || 'ไม่ระบุชื่อ'}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <span>ที่ปรึกษา: {c.advisor?.name || 'ไม่ระบุชื่อ'}</span>
                                <span className="text-slate-600">•</span>
                                <span>{new Date(c.appointmentTime).toLocaleString('th-TH')}</span>
                              </p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                            c.status === 'SCHEDULED' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                            c.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quartiles & Publications Pie / Summary List */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-lg">
                  <h4 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-400" />
                    <span>บทความวิชาการแยกตาม Quartile</span>
                  </h4>
                  <div className="space-y-4">
                    {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
                      const count = publications.filter((p) => p.quartile === q).length;
                      const percentage = publications.length ? (count / publications.length) * 100 : 0;
                      return (
                        <div key={q} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-slate-300">{q} Journal</span>
                            <span className="text-slate-400 text-xs">{count} บทความ ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                q === 'Q1' ? 'bg-amber-500' :
                                q === 'Q2' ? 'bg-indigo-500' :
                                q === 'Q3' ? 'bg-teal-500' : 'bg-slate-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Database Connection Status and Configuration Report */}
          {activeTab === 'db-status' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">รายงานสถานะการเชื่อมต่อฐานข้อมูลคลาวด์</h3>
                    <p className="text-sm text-slate-400 mt-1">รายละเอียดการกำหนดค่าเชื่อมโยง Next.js กับ PostgreSQL Cloud SQL และ Hyperdrive</p>
                  </div>
                  <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4.5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>ทดสอบการเชื่อมต่อใหม่</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {/* Status Indicator Card */}
                  <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-xl flex items-center gap-4">
                    <div className={`p-4 rounded-xl ${dbStatus.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      <RefreshCw className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium block">สถานะการเชื่อมต่อ (Status)</span>
                      <span className={`text-base font-bold flex items-center gap-2 mt-0.5 ${dbStatus.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${dbStatus.status === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                        {dbStatus.status === 'success' ? 'เชื่อมต่อสำเร็จ (Connected)' : 'การเชื่อมต่อผิดพลาด (Failed)'}
                      </span>
                    </div>
                  </div>

                  {/* Connection Type Card */}
                  <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-xl flex items-center gap-4">
                    <div className="bg-indigo-500/10 text-indigo-400 p-4 rounded-xl">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium block">รูปแบบการดึงข้อมูล (Connection Type)</span>
                      <span className="text-base font-bold text-white mt-0.5">{dbStatus.connectionType}</span>
                    </div>
                  </div>

                  {/* Query Latency Card */}
                  <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-xl flex items-center gap-4">
                    <div className="bg-amber-500/10 text-amber-400 p-4 rounded-xl">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium block">ความเร็วในการตอบสนอง (Query Latency)</span>
                      <span className="text-base font-bold text-amber-400 mt-0.5">{dbStatus.latencyMs} ms</span>
                    </div>
                  </div>

                  {/* Database Name Card */}
                  <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-xl flex items-center gap-4">
                    <div className="bg-cyan-500/10 text-cyan-400 p-4 rounded-xl">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium block">ชื่อฐานข้อมูล (Database Name)</span>
                      <span className="text-base font-bold text-white mt-0.5">{dbStatus.databaseName || 'ไม่ระบุ'}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Information Table */}
                <div className="mt-8 border-t border-slate-800/80 pt-6 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">รายงานการตั้งค่าทางเทคนิค (Configuration Report)</h4>
                  
                  <div className="bg-slate-900/40 rounded-xl border border-slate-800 divide-y divide-slate-800 overflow-hidden text-sm">
                    <div className="grid grid-cols-3 p-4">
                      <span className="text-slate-400 font-semibold">ที่อยู่โฮสต์ (Database Host)</span>
                      <span className="col-span-2 font-mono text-slate-200">{dbStatus.host || 'ไม่ระบุ'}</span>
                    </div>
                    <div className="grid grid-cols-3 p-4">
                      <span className="text-slate-400 font-semibold">Connection String (Masked)</span>
                      <span className="col-span-2 font-mono text-slate-300 text-xs break-all">{dbStatus.maskedConnectionString || 'ไม่ถูกตั้งค่า'}</span>
                    </div>
                    {dbStatus.dbVersion && (
                      <div className="grid grid-cols-3 p-4">
                        <span className="text-slate-400 font-semibold">รุ่นของเซิร์ฟเวอร์ (DB Version)</span>
                        <span className="col-span-2 text-slate-300 text-xs leading-relaxed">{dbStatus.dbVersion}</span>
                      </div>
                    )}
                    {dbStatus.dbTime && (
                      <div className="grid grid-cols-3 p-4">
                        <span className="text-slate-400 font-semibold">เวลาของเซิร์ฟเวอร์ (DB Server Time)</span>
                        <span className="col-span-2 text-slate-300">{new Date(dbStatus.dbTime).toLocaleString('th-TH')}</span>
                      </div>
                    )}
                    {dbStatus.error && (
                      <div className="grid grid-cols-3 p-4 bg-rose-950/20">
                        <span className="text-rose-400 font-semibold">ข้อผิดพลาดที่พบ (Error Log)</span>
                        <span className="col-span-2 font-mono text-rose-300 text-xs break-all leading-relaxed">{dbStatus.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users List and CRUD UI */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อผู้ใช้หรืออีเมล..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                {currentRole === 'STAFF' && (
                  <button
                    onClick={() => { setEditingUser(null); setUserForm({ name: '', email: '', role: 'RESEARCHER' }); setIsUserModalOpen(true); }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    <span>เพิ่มข้อมูลผู้ใช้</span>
                  </button>
                )}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-4">อีเมลติดต่อ</th>
                      <th className="px-6 py-4">บทบาทของระบบ</th>
                      {currentRole === 'STAFF' && <th className="px-6 py-4 text-right">เครื่องมือ</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {users
                      .filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{u.name}</td>
                          <td className="px-6 py-4 text-slate-400">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              u.role === 'RESEARCHER' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900' :
                              u.role === 'STAFF' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                              'bg-amber-950 text-amber-400 border border-amber-900'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          {currentRole === 'STAFF' && (
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditUser(u)}
                                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                  <Edit className="h-4.5 w-4.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/20 transition-colors"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Projects View */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-5 w-5 text-slate-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อโครงการวิจัย..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl px-3 py-2.5"
                  >
                    <option value="ALL">ทุกสถานะโครงการ</option>
                    <option value="PROPOSED">PROPOSED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="TERMINATED">TERMINATED</option>
                  </select>
                </div>
                {currentRole !== 'EXECUTIVE' && (
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
                        leaderId: users[0]?.id || '',
                      });
                      setIsProjectModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    <span>เพิ่มโครงการวิจัย</span>
                  </button>
                )}
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 gap-6">
                {projects
                  .filter((p) => {
                    const matchQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
                    return matchQuery && matchStatus;
                  })
                  .map((p) => (
                    <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              p.status === 'PROPOSED' ? 'bg-slate-900 text-slate-400 border border-slate-800' :
                              p.status === 'APPROVED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                              p.status === 'ONGOING' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800 animate-pulse' :
                              p.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {p.status}
                            </span>
                            <h3 className="text-lg font-bold text-white mt-3 leading-snug">{p.title}</h3>
                          </div>
                          
                          {/* Project Actions */}
                          {currentRole !== 'EXECUTIVE' && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleEditProject(p)}
                                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                              >
                                <Edit className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(p.id)}
                                className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/20 transition-colors"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* PI info & Dates details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pb-6 border-b border-slate-900 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium block">หัวหน้าโครงการ (PI)</span>
                            <span className="text-slate-300 font-semibold mt-1 block">{p.leader?.name || 'ไม่พบผู้ใช้ในระบบ'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block">ระยะเวลาดำเนินโครงการ</span>
                            <span className="text-slate-300 font-semibold mt-1 block">
                              {formatDate(p.startDate)} - {formatDate(p.endDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block">เลขที่ IRB & วันที่อนุมัติ</span>
                            <span className="text-slate-300 font-semibold mt-1 block">
                              {p.irbNo ? `${p.irbNo} (${formatDate(p.approvedDate)})` : 'รอยืนยันการอนุมัติ'}
                            </span>
                          </div>
                        </div>

                        {/* Extra Metadata (CEUConsultDate) */}
                        <div className="mt-4 text-xs flex gap-6 text-slate-400">
                          <div>
                            <span className="text-slate-500">วันที่ปรึกษา CEU:</span>{' '}
                            <span className="text-indigo-400 font-semibold">{formatDate(p.ceuConsultDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Budget Tracker Progress bar */}
                      <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">งบประมาณที่ใช้ไป: <span className="text-amber-500">{formatCurrency(p.budgetSpent)}</span></span>
                          <span className="text-slate-500">งบตั้งต้น: {formatCurrency(p.budgetInitial)}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              (p.budgetSpent / p.budgetInitial) > 0.9 ? 'bg-rose-500' :
                              (p.budgetSpent / p.budgetInitial) > 0.6 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min((p.budgetSpent / (p.budgetInitial || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Publications Section */}
          {activeTab === 'publications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    placeholder="ค้นหางานตีพิมพ์ วารสาร..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                {currentRole === 'RESEARCHER' && (
                  <button
                    onClick={() => {
                      setEditingPublication(null);
                      setPublicationForm({
                        title: '',
                        journal: '',
                        quartile: 'Q1',
                        rewardStatus: 'PENDING',
                        rewardAmount: 0,
                        projectId: projects[0]?.id || '',
                        authorId: users[0]?.id || '',
                      });
                      setIsPublicationModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    <span>ขอรับเงินรางวัลตีพิมพ์</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {publications
                  .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.journal.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => (
                    <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="bg-amber-600/10 text-amber-500 border border-amber-600/30 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {p.quartile} Journal
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs text-slate-400 font-semibold">{p.journal}</span>
                          </div>
                          <h3 className="text-base font-bold text-white mt-3.5 leading-snug">{p.title}</h3>
                        </div>

                        {currentRole === 'RESEARCHER' && p.authorId === users.find((u) => u.role === 'RESEARCHER')?.id && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditPublication(p)}
                              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePublication(p.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/20 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Project info link and Reward Status block */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-900">
                        <div className="text-xs space-y-1">
                          <p className="text-slate-500">ผู้ขอรับรางวัล: <span className="text-slate-300 font-semibold">{p.author?.name}</span></p>
                          {p.project && (
                            <p className="text-slate-500">โครงการวิจัยอ้างอิง: <span className="text-indigo-400 font-medium">{p.project.title}</span></p>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase block font-semibold">จำนวนเงินรางวัลที่เสนอขอ</span>
                            <span className="text-sm font-bold text-amber-500">{formatCurrency(p.rewardAmount)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                              p.rewardStatus === 'PENDING' ? 'bg-slate-900 text-slate-400 border border-slate-800' :
                              p.rewardStatus === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {p.rewardStatus}
                            </span>
                            
                            {/* Executive Approver action buttons */}
                            {currentRole === 'EXECUTIVE' && p.rewardStatus === 'PENDING' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleRewardStatusChange(p.id, 'APPROVED')}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg transition-colors"
                                  title="Approve reward"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRewardStatusChange(p.id, 'REJECTED')}
                                  className="bg-rose-600 hover:bg-rose-500 text-white p-1.5 rounded-lg transition-colors"
                                  title="Reject reward"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Consultations View */}
          {activeTab === 'consultations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อที่ปรึกษา / ผู้ขอคำปรึกษา..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                {currentRole === 'RESEARCHER' && (
                  <button
                    onClick={() => {
                      setEditingConsultation(null);
                      setConsultationForm({
                        type: 'PROTOCOL',
                        appointmentTime: '',
                        status: 'SCHEDULED',
                        advisorId: users.find((u) => u.role === 'STAFF')?.id || '',
                        requesterId: users.find((u) => u.role === 'RESEARCHER')?.id || '',
                      });
                      setIsConsultationModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    <span>จองคิวคำปรึกษางานวิจัย</span>
                  </button>
                )}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">ประเภทหัวข้อ</th>
                      <th className="px-6 py-4">วันเวลาที่นัดหมาย</th>
                      <th className="px-6 py-4">ผู้ขอรับคำปรึกษา (PI)</th>
                      <th className="px-6 py-4">ผู้ให้คำปรึกษา (Advisor)</th>
                      <th className="px-6 py-4">สถานะคิว</th>
                      {currentRole !== 'EXECUTIVE' && <th className="px-6 py-4 text-right">จัดการคิว</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {consultations
                      .filter((c) => {
                        const search = searchQuery.toLowerCase();
                        const reqName = c.requester?.name?.toLowerCase() || '';
                        const advName = c.advisor?.name?.toLowerCase() || '';
                        return reqName.includes(search) || advName.includes(search);
                      })
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase ${
                              c.type === 'PROTOCOL' ? 'bg-amber-600/10 text-amber-500 border border-amber-500/20' :
                              'bg-cyan-600/10 text-cyan-500 border border-cyan-500/20'
                            }`}>
                              {c.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-300">
                            {new Date(c.appointmentTime).toLocaleString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })} น.
                          </td>
                          <td className="px-6 py-4 text-white font-medium">{c.requester?.name}</td>
                          <td className="px-6 py-4 text-slate-300">{c.advisor?.name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              c.status === 'SCHEDULED' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                              c.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          {currentRole !== 'EXECUTIVE' && (
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {currentRole === 'STAFF' && c.status === 'SCHEDULED' && (
                                  <>
                                    <button
                                      onClick={() => handleConsultStatusChange(c.id, 'COMPLETED')}
                                      className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-900 rounded"
                                      title="Mark completed"
                                    >
                                      <CheckCircle className="h-4.5 w-4.5" />
                                    </button>
                                    <button
                                      onClick={() => handleConsultStatusChange(c.id, 'CANCELLED')}
                                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-900 rounded"
                                      title="Mark cancelled"
                                    >
                                      <XCircle className="h-4.5 w-4.5" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleEditConsultation(c)}
                                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteConsultation(c.id)}
                                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* -------------------- MODAL DIALOGS -------------------- */}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-6">
              {editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มข้อมูลผู้ใช้งานใหม่'}
            </h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">อีเมลติดต่อ</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">สิทธิ์การเข้าใช้</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                >
                  <option value="RESEARCHER">นักวิจัย (RESEARCHER)</option>
                  <option value="STAFF">เจ้าหน้าที่ (STAFF)</option>
                  <option value="EXECUTIVE">ผู้บริหาร (EXECUTIVE)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4.5 py-2.5 text-slate-400 hover:text-white text-xs font-semibold rounded-xl hover:bg-slate-900"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-6">
              {editingProject ? 'แก้ไขโครงการวิจัย' : 'เพิ่มโครงการวิจัยใหม่'}
            </h3>
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">ชื่อโครงการวิจัย</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">สถานะโครงการ</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                  >
                    <option value="PROPOSED">PROPOSED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="TERMINATED">TERMINATED</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">หัวหน้าโครงการ (PI)</label>
                  <select
                    required
                    value={projectForm.leaderId}
                    onChange={(e) => setProjectForm({ ...projectForm, leaderId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                  >
                    <option value="" disabled>เลือกนักวิจัย...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">งบประมาณตั้งต้น (บาท)</label>
                  <input
                    type="number"
                    required
                    value={projectForm.budgetInitial}
                    onChange={(e) => setProjectForm({ ...projectForm, budgetInitial: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">งบประมาณที่ใช้ไป (บาท)</label>
                  <input
                    type="number"
                    value={projectForm.budgetSpent}
                    onChange={(e) => setProjectForm({ ...projectForm, budgetSpent: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">วันที่เริ่มโครงการ</label>
                  <input
                    type="date"
                    required
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">วันที่สิ้นสุดโครงการ</label>
                  <input
                    type="date"
                    required
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-900 pt-4 mt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">เลขที่ IRB (จริยธรรม)</label>
                  <input
                    type="text"
                    value={projectForm.irbNo}
                    onChange={(e) => setProjectForm({ ...projectForm, irbNo: e.target.value })}
                    placeholder="เช่น IRB-2026-X"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">วันที่ได้รับอนุมัติ IRB</label>
                  <input
                    type="date"
                    value={projectForm.approvedDate}
                    onChange={(e) => setProjectForm({ ...projectForm, approvedDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">วันที่ปรึกษา CEU</label>
                  <input
                    type="date"
                    value={projectForm.ceuConsultDate}
                    onChange={(e) => setProjectForm({ ...projectForm, ceuConsultDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4.5 py-2.5 text-slate-400 hover:text-white text-xs font-semibold rounded-xl hover:bg-slate-900"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg"
                >
                  บันทึกโครงการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publication Reward Modal */}
      {isPublicationModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-6">
              {editingPublication ? 'แก้ไขคำขอรางวัลงานตีพิมพ์' : 'ยื่นขอรางวัลตีพิมพ์วารสารวิจัย'}
            </h3>
            <form onSubmit={handlePublicationSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">ชื่อบทความวิชาการ</label>
                <input
                  type="text"
                  required
                  value={publicationForm.title}
                  onChange={(e) => setPublicationForm({ ...publicationForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">ชื่อวารสารวิชาการ</label>
                  <input
                    type="text"
                    required
                    value={publicationForm.journal}
                    onChange={(e) => setPublicationForm({ ...publicationForm, journal: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">ระดับ Quartile</label>
                  <select
                    value={publicationForm.quartile}
                    onChange={(e) => setPublicationForm({ ...publicationForm, quartile: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
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
                  <label className="text-xs font-semibold text-slate-400 block mb-2">จริยธรรมอ้างอิงของโครงการ</label>
                  <select
                    value={publicationForm.projectId}
                    onChange={(e) => setPublicationForm({ ...publicationForm, projectId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                  >
                    <option value="">ไม่ผูกกับโครงการ (อิสระ)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title.slice(0, 30)}...</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">นักวิจัยผู้ขอรางวัล</label>
                  <select
                    required
                    value={publicationForm.authorId}
                    onChange={(e) => setPublicationForm({ ...publicationForm, authorId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                  >
                    <option value="" disabled>เลือกผู้ส่งผลงาน...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">จำนวนเงินรางวัลที่เสนอขอ (บาท)</label>
                <input
                  type="number"
                  required
                  value={publicationForm.rewardAmount}
                  onChange={(e) => setPublicationForm({ ...publicationForm, rewardAmount: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsPublicationModalOpen(false)}
                  className="px-4.5 py-2.5 text-slate-400 hover:text-white text-xs font-semibold rounded-xl hover:bg-slate-900"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg"
                >
                  ส่งขอคำร้องรับรางวัล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consultation Appointment Modal */}
      {isConsultationModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-6">
              {editingConsultation ? 'แก้ไขการจองคิวที่ปรึกษา' : 'จองคิวรับคำปรึกษา CEU งานวิจัย'}
            </h3>
            <form onSubmit={handleConsultationSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">ประเภทหัวข้อบริการ</label>
                <select
                  value={consultationForm.type}
                  onChange={(e) => setConsultationForm({ ...consultationForm, type: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                >
                  <option value="PROTOCOL">จริยธรรมโครงร่างวิจัย (PROTOCOL)</option>
                  <option value="STATISTICAL">วิเคราะห์สถิติวารสารวิจัย (STATISTICAL)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">วันเวลาที่นัดหมาย</label>
                <input
                  type="datetime-local"
                  required
                  value={consultationForm.appointmentTime}
                  onChange={(e) => setConsultationForm({ ...consultationForm, appointmentTime: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">ผู้ให้คำปรึกษา (Staff)</label>
                  <select
                    required
                    value={consultationForm.advisorId}
                    onChange={(e) => setConsultationForm({ ...consultationForm, advisorId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                  >
                    <option value="" disabled>เลือกผู้ให้คำปรึกษา...</option>
                    {users
                      .filter((u) => u.role === 'STAFF')
                      .map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">ผู้ขอรับปรึกษา (Researcher)</label>
                  <select
                    required
                    value={consultationForm.requesterId}
                    onChange={(e) => setConsultationForm({ ...consultationForm, requesterId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                  >
                    <option value="" disabled>เลือกผู้รับคำปรึกษา...</option>
                    {users
                      .filter((u) => u.role === 'RESEARCHER')
                      .map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {editingConsultation && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">สถานะการนัดหมาย</label>
                  <select
                    value={consultationForm.status}
                    onChange={(e) => setConsultationForm({ ...consultationForm, status: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsConsultationModalOpen(false)}
                  className="px-4.5 py-2.5 text-slate-400 hover:text-white text-xs font-semibold rounded-xl hover:bg-slate-900"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg"
                >
                  ยืนยันนัดหมายคิว
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
