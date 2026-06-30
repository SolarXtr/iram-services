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
  UserCheck,
  Database,
  HelpCircle
} from 'lucide-react';

import { Permission, UserRole, ROLE_LABELS, getPermissionsForRoles, hasPermission as hasPermissionHelper } from '@/lib/permissions';

// Types matching mockDb / Prisma
interface User {
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
  leaderId: string;
  leader?: User;
  isDeleted?: boolean;
  ceuConsultId?: string | null;
  ceuBypassReason?: string | null;
  attachmentName?: string | null;
  attachmentData?: string | null;
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
  isDeleted?: boolean;
  attachmentName?: string | null;
  attachmentData?: string | null;
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
  isDeleted?: boolean;
}

interface Evaluation {
  id: string;
  projectId: string;
  evaluatorId: string;
  evaluatorType?: string | null;
  feedbackResearchProcess?: string | null;
  feedbackOriginality?: string | null;
  feedbackExpectedOutput?: string | null;
  feedbackBudgetAppropriate?: string | null;
  scoreOverallQuality?: number | null;
  bankAccountName?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  bankAccountNumber?: string | null;
  bankBookAttachmentName?: string | null;
  bankBookAttachmentData?: string | null;
  status: 'DRAFT' | 'SUBMITTED';
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  project?: Project | null;
  evaluator?: User | null;
}

export default function ResearchManagementDashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'projects' | 'publications' | 'consultations' | 'db-status' | 'db-explorer'>('dashboard');
  const [currentUserId, setCurrentUserId] = useState<string>('user-3');
  const [activeRole, setActiveRole] = useState<UserRole>('STAFF');

  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
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

  // DB Explorer States
  const [explorerData, setExplorerData] = useState<any>({
    tables: [],
    schema: [],
    activeTable: 'irUser',
    tableData: []
  });
  const [selectedExplorerTable, setSelectedExplorerTable] = useState('irUser');
  const [loadingExplorer, setLoadingExplorer] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [impersonateSearch, setImpersonateSearch] = useState('');

  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isPublicationModalOpen, setIsPublicationModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    projectId: '',
    evaluatorId: '',
    evaluatorType: 'INTERNAL',
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);

  // Active / Deleted Sub-tabs States
  const [usersSubTab, setUsersSubTab] = useState<'active' | 'deleted'>('active');
  const [projectsSubTab, setProjectsSubTab] = useState<'active' | 'ceu' | 'deleted'>('active');
  const [publicationsSubTab, setPublicationsSubTab] = useState<'active' | 'deleted'>('active');
  const [consultationsSubTab, setConsultationsSubTab] = useState<'active' | 'deleted'>('active');

  const handleRestore = async (module: string, id: string) => {
    try {
      const res = await fetch(`/api/${module}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: false }),
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(`เกิดข้อผิดพลาดในการกู้คืนข้อมูล: ${err.error}`);
      }
    } catch (error: any) {
      alert(`เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ${error.message}`);
    }
  };

  const currentUser = users.find((u) => u.id === currentUserId) || {
    id: 'user-3',
    name: 'คุณ วันดี ทำงานดี (เจ้าหน้าที่)',
    email: 'wandee.w@iram.edu',
    role: 'STAFF',
    roles: ['STAFF']
  };

  const currentUserRoles = (currentUser ? (currentUser.roles || (currentUser.role ? currentUser.role.split(',') : [])) : ['STAFF']) as UserRole[];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUserId = localStorage.getItem('impersonatedUserId');
      if (savedUserId && savedUserId !== currentUserId) {
        setCurrentUserId(savedUserId);
      }
    }
  }, []);

  const handleUserChange = (val: string) => {
    setCurrentUserId(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('impersonatedUserId', val);
    }
  };

  useEffect(() => {
    if (currentUserRoles.length > 0 && !currentUserRoles.includes(activeRole)) {
      setActiveRole(currentUserRoles[0]);
    }
  }, [currentUserId, currentUserRoles, activeRole]);

  const hasPermission = (permission: Permission) => {
    return hasPermissionHelper([activeRole], permission);
  };

  const canEditProject = (p: Project) => {
    return hasPermission('EDIT_ALL_RESEARCH') || (hasPermission('EDIT_OWN_RESEARCH') && p.leaderId === currentUserId);
  };

  const canEditPublication = (pub: Publication) => {
    return hasPermission('EDIT_ALL_RESEARCH') || (hasPermission('EDIT_OWN_RESEARCH') && pub.authorId === currentUserId);
  };

  const canEditConsultation = (c: Consultation) => {
    return hasPermission('EDIT_ALL_RESEARCH') || (hasPermission('EDIT_OWN_RESEARCH') && c.requesterId === currentUserId);
  };

  // Form States
  const [userForm, setUserForm] = useState<{ name: string; email: string; rolesList: UserRole[] }>({ name: '', email: '', rolesList: ['RESEARCHER'] });
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
      const [resUsers, resProjects, resPubs, resConsults, resEvaluations, resStatus] = await Promise.all([
        fetch('/api/users?includeDeleted=true').then((res) => res.json()),
        fetch('/api/projects?includeDeleted=true').then((res) => res.json()),
        fetch('/api/publications?includeDeleted=true').then((res) => res.json()),
        fetch('/api/consultations?includeDeleted=true').then((res) => res.json()),
        fetch('/api/evaluations?includeDeleted=true').then((res) => res.json()).catch(() => []),
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
      if (Array.isArray(resEvaluations)) setEvaluations(resEvaluations);
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

  const fetchExplorerData = useCallback(async (tableName: string) => {
    setLoadingExplorer(true);
    try {
      const res = await fetch(`/api/db-explorer?table=${tableName}`).then((r) => r.json());
      if (res && res.status === 'success') {
        setExplorerData(res);
      }
    } catch (e) {
      console.error('Error fetching explorer data:', e);
    } finally {
      setLoadingExplorer(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === 'db-explorer') {
      fetchExplorerData(selectedExplorerTable);
    }
  }, [activeTab, selectedExplorerTable, fetchExplorerData]);

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
        body: JSON.stringify({
          name: userForm.name,
          email: userForm.email,
          role: userForm.rolesList.join(','),
        }),
      });
      if (res.ok) {
        setIsUserModalOpen(false);
        setEditingUser(null);
        setUserForm({ name: '', email: '', rolesList: ['RESEARCHER'] });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    const rolesList = (user.roles || (user.role ? user.role.split(',') : [])) as UserRole[];
    setUserForm({ name: user.name, email: user.email, rolesList });
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?')) {
      try {
        const res = await fetch(`/api/users/${id}?performedBy=${currentUserId}`, { method: 'DELETE' });
        if (res.ok) {
          fetchData();
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(errData.error || 'ไม่สามารถลบผู้ใช้นี้ได้ เนื่องจากระบบตรวจพบบล็อกสิทธิ์การทำงาน');
        }
      } catch (e: any) {
        alert(e.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
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

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm)
      });
      if (res.ok) {
        setIsAssignModalOpen(false);
        setAssignForm({
          projectId: '',
          evaluatorId: '',
          evaluatorType: 'INTERNAL',
        });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'แต่งตั้งผู้ทรงคุณวุฒิไม่สำเร็จ');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDeleteEvaluation = async (id: string) => {
    if (confirm('คุณต้องการถอนรายชื่อผู้ทรงคุณวุฒิท่านนี้ออกจากโครงการวิจัยนี้ใช่หรือไม่?')) {
      try {
        await fetch(`/api/evaluations/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        console.error(err);
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
    return <div className="flex h-screen items-center justify-center bg-[#f9f5ee] text-[#4c3c31]">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-[#f9f5ee] text-[#3c2f25] overflow-hidden font-sans">
      {/* Sidebar Panel */}
      <aside className="w-72 bg-[#fdfcf9] border-r border-[#ebdccf] flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-[#ebdccf]">
            <div className="bg-[#d97706] p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 text-[#3c2f25]">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#3c2f25] to-[#7a685c] bg-clip-text text-transparent">iRAM Services</h1>
              <p className="text-[10px] text-[#b45309] font-semibold tracking-widest uppercase">Research System</p>
            </div>
          </div>
          
          <nav className="p-4 space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#d97706] text-[#3c2f25] hover:bg-[#c2410c] hover:text-[#fdfcf9] shadow-lg'
                  : 'text-[#7a685c] hover:bg-[#ebdccf] hover:text-[#1c120c]'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span>สรุปภาพรวมแดชบอร์ด</span>
            </button>
 
            <button
              onClick={() => { setActiveTab('projects'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${
                activeTab === 'projects'
                  ? 'bg-[#d97706] text-[#3c2f25] hover:bg-[#c2410c] hover:text-[#fdfcf9] shadow-lg'
                  : 'text-[#7a685c] hover:bg-[#ebdccf] hover:text-[#1c120c]'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>โครงการวิจัย</span>
            </button>
 
            <button
              onClick={() => { setActiveTab('publications'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${
                activeTab === 'publications'
                  ? 'bg-[#d97706] text-[#3c2f25] hover:bg-[#c2410c] hover:text-[#fdfcf9] shadow-lg'
                  : 'text-[#7a685c] hover:bg-[#ebdccf] hover:text-[#1c120c]'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span>บทความวิชาการ (Publications)</span>
            </button>
 
            <button
              onClick={() => { setActiveTab('consultations'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${
                activeTab === 'consultations'
                  ? 'bg-[#d97706] text-[#3c2f25] hover:bg-[#c2410c] hover:text-[#fdfcf9] shadow-lg'
                  : 'text-[#7a685c] hover:bg-[#ebdccf] hover:text-[#1c120c]'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span>การให้คำปรึกษา (CEU)</span>
            </button>
 
            <button
              onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${
                activeTab === 'users'
                  ? 'bg-[#d97706] text-[#3c2f25] hover:bg-[#c2410c] hover:text-[#fdfcf9] shadow-lg'
                  : 'text-[#7a685c] hover:bg-[#ebdccf] hover:text-[#1c120c]'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>บริหารข้อมูลผู้ใช้ (Users)</span>
            </button>
 
            <button
              onClick={() => { setActiveTab('db-status'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${
                activeTab === 'db-status'
                  ? 'bg-[#d97706] text-[#3c2f25] hover:bg-[#c2410c] hover:text-[#fdfcf9] shadow-lg'
                  : 'text-[#7a685c] hover:bg-[#ebdccf] hover:text-[#1c120c]'
              }`}
            >
              <RefreshCw className="h-5 w-5" />
              <span>สถานะคลาวด์เดสเก็ต (DB Status)</span>
            </button>

            <button
              onClick={() => { setActiveTab('db-explorer'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${
                activeTab === 'db-explorer'
                  ? 'bg-[#d97706] text-[#3c2f25] hover:bg-[#c2410c] hover:text-[#fdfcf9] shadow-lg'
                  : 'text-[#7a685c] hover:bg-[#ebdccf] hover:text-[#1c120c]'
              }`}
            >
              <Database className="h-5 w-5" />
              <span>สำรวจฐานข้อมูล (DB Explorer)</span>
            </button>

            <a
              href="/about"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all text-[#7a685c] hover:bg-[#ebdccf] hover:text-[#1c120c]"
            >
              <HelpCircle className="h-5 w-5" />
              <span>เกี่ยวกับโครงการ (Portfolio)</span>
            </a>
          </nav>
        </div>

        {/* Footer Sidebar info */}
        <div className="p-4 border-t border-[#ebdccf] bg-[#fdfcf9]/50">
          <div className="bg-[#f9f5ee] p-3 rounded-xl border border-[#ebdccf]/80">
            <span className="text-[10px] text-[#8a786c] uppercase block tracking-wider font-semibold">Active Database</span>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-medium text-[#4c3c31]">
                {isDbMock ? 'Local JSON Store (Mock)' : 'Cloudflare D1 Database'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Panel */}
        <header className="h-20 bg-[#fdfcf9] border-b border-[#ebdccf] flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight capitalize text-[#3c2f25]">
              {activeTab === 'dashboard' && 'แดชบอร์ดสรุปผลวิจัย'}
              {activeTab === 'users' && 'บริหารจัดการผู้ใช้งาน'}
              {activeTab === 'projects' && 'โครงการวิจัยและงบประมาณ'}
              {activeTab === 'publications' && 'งานวิจัยตีพิมพ์และสิทธิ์รับรางวัล'}
              {activeTab === 'consultations' && 'ระบบจองคิวคำปรึกษา CEU'}
              {activeTab === 'db-status' && 'สถานะการเชื่อมต่อฐานข้อมูล'}
              {activeTab === 'db-explorer' && 'เครื่องมือสำรวจฐานข้อมูลออนไลน์ (Database Explorer)'}
            </h2>
            {loading && <RefreshCw className="h-4 w-4 animate-spin text-[#8a786c]" />}
          </div>

          {/* Quick Role Impersonator Switcher */}
          <div className="flex flex-wrap items-center gap-4 bg-[#f9f5ee] border border-[#ebdccf] px-4 py-2 rounded-2xl shadow-inner shadow-black/20">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-[#b45309]" />
              <span className="text-xs font-semibold text-[#4c3c31]">จำลองผู้ใช้:</span>
              <input
                type="text"
                placeholder="ค้นหารายชื่อ..."
                value={impersonateSearch}
                onChange={(e) => setImpersonateSearch(e.target.value)}
                className="bg-[#fdfcf9] border border-[#ebdccf] text-[11px] rounded-lg px-2.5 py-1 text-[#3c2f25] focus:outline-none focus:ring-1 focus:ring-[#d97706] w-28 font-medium"
              />
              <select
                value={currentUserId}
                onChange={(e) => handleUserChange(e.target.value)}
                className="bg-[#fdfcf9] text-xs font-bold text-[#3c2f25] border-0 focus:ring-2 focus:ring-[#d97706] rounded-lg px-2 py-1 cursor-pointer transition-colors max-w-[150px]"
              >
                {users
                  .filter(u => !u.isDeleted && u.name.toLowerCase().includes(impersonateSearch.toLowerCase()))
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
            </div>

            {currentUserRoles.length > 1 && (
              <div className="flex items-center gap-2 border-l border-[#ebdccf] pl-4">
                <span className="text-xs font-semibold text-[#4c3c31]">โหมดการทำงาน:</span>
                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value as UserRole)}
                  className="bg-amber-100 text-xs font-bold text-amber-900 border-0 focus:ring-2 focus:ring-[#d97706] rounded-lg px-2 py-1 cursor-pointer transition-colors"
                >
                  {currentUserRoles.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role] || role}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Pages Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#f9f5ee]">
          {!hasPermission('MANAGE_USERS') && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs text-[#b45309] font-medium flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shadow-sm">
              <div>
                <span className="font-bold">⚠️ แนะนำสิทธิ์การใช้งาน:</span> หน้านี้คือหน้าจัดการหลังบ้านสำหรับ <strong>เจ้าหน้าที่ตรวจดูข้อมูลภาพรวม</strong>
                <p className="mt-1 text-[#7a685c]">
                  สำหรับผู้บริหาร/เจ้าหน้าที่/นักวิจัยทั่วไป กรุณาเข้าใช้งานที่ 
                  <a href="/dashboard" className="underline font-bold text-[#d97706] ml-1 hover:text-[#c2410c]">หน้าสรุปภาพรวมแดชบอร์ด (/dashboard)</a> หรือ 
                  <a href="/my-workspace" className="underline font-bold text-[#d97706] ml-1 hover:text-[#c2410c]">พื้นที่ทำงานนักวิจัย (/my-workspace)</a>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a href="/dashboard" className="bg-[#d97706] hover:bg-[#c2410c] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95">ไป Dashboard</a>
                <a href="/my-workspace" className="bg-[#7a685c] hover:bg-[#3c2f25] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95">ไป Workspace</a>
              </div>
            </div>
          )}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-[#fdfcf9] to-[#f9f5ee] border border-[#ebdccf]/80 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute right-4 top-4 bg-[#fef3c7] p-3 rounded-xl text-[#b45309]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-[#7a685c] font-medium">โครงการวิจัยทั้งหมด</span>
                  <h3 className="text-3xl font-extrabold mt-2 text-[#3c2f25]">{projects.length} โครงการ</h3>
                  <div className="mt-4 text-xs text-[#8a786c] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>ดำเนินงานอยู่ {projects.filter((p) => p.status === 'ONGOING').length} โครงการ</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#fdfcf9] to-[#f9f5ee] border border-[#ebdccf]/80 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute right-4 top-4 bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-[#7a685c] font-medium">งบประมาณตั้งต้นรวม</span>
                  <h3 className="text-3xl font-extrabold mt-2 text-emerald-400">{formatCurrency(totalBudget)}</h3>
                  <div className="mt-4 text-xs text-[#7a685c] flex items-center justify-between">
                    <span>ใช้ไปแล้ว {((totalBudgetSpent / (totalBudget || 1)) * 100).toFixed(1)}%</span>
                    <span className="text-[#8a786c] font-medium">{formatCurrency(totalBudgetSpent)}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#fdfcf9] to-[#f9f5ee] border border-[#ebdccf]/80 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute right-4 top-4 bg-[#ffedd5] p-3 rounded-xl text-[#c2410c]">
                    <Award className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-[#7a685c] font-medium">รางวัลการตีพิมพ์ที่อนุมัติ</span>
                  <h3 className="text-3xl font-extrabold mt-2 text-[#c2410c]">{formatCurrency(totalApprovedReward) || 0}</h3>
                  <div className="mt-4 text-xs text-[#8a786c] flex items-center gap-1">
                    <span>รอนุมัติรางวัล {pendingPublications} รายการ</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#fdfcf9] to-[#f9f5ee] border border-[#ebdccf]/80 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute right-4 top-4 bg-amber-500/10 p-3 rounded-xl text-amber-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-[#7a685c] font-medium">นัดหมายคำปรึกษา CEU</span>
                  <h3 className="text-3xl font-extrabold mt-2 text-amber-400">{activeConsultationsCount} นัดหมาย</h3>
                  <div className="mt-4 text-xs text-[#8a786c]">
                    <span>ประเมิน Protocol & สถิติวิจัย</span>
                  </div>
                </div>
              </div>

              {/* Grid 2 Column */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent consultations timeline */}
                <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl shadow-lg lg:col-span-2">
                  <h4 className="text-base font-bold text-[#3c2f25] mb-6 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#b45309]" />
                    <span>นัดหมายปรึกษา CEU เร็วๆ นี้</span>
                  </h4>
                  <div className="space-y-4">
                    {consultations.length === 0 ? (
                      <p className="text-sm text-[#8a786c] text-center py-6">ไม่มีข้อมูลนัดหมายในระบบ</p>
                    ) : (
                      consultations.slice(0, 5).map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-4 bg-[#f9f5ee]/60 rounded-xl border border-[#ebdccf] hover:border-[#ebdccf] transition-colors">
                          <div className="flex items-center gap-3.5">
                            <div className={`p-2.5 rounded-xl text-[#3c2f25] font-bold text-xs ${
                              c.type === 'PROTOCOL' ? 'bg-amber-600/80' : 'bg-cyan-600/80'
                            }`}>
                              {c.type}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#3c2f25]">ผู้รับบริการ: {c.requester?.name || 'ไม่ระบุชื่อ'}</p>
                              <p className="text-xs text-[#7a685c] flex items-center gap-1 mt-0.5">
                                <span>ที่ปรึกษา: {c.advisor?.name || 'ไม่ระบุชื่อ'}</span>
                                <span className="text-[#b0a095]">•</span>
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
                <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl shadow-lg">
                  <h4 className="text-base font-bold text-[#3c2f25] mb-6 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#b45309]" />
                    <span>บทความวิชาการแยกตาม Quartile</span>
                  </h4>
                  <div className="space-y-4">
                    {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
                      const count = publications.filter((p) => p.quartile === q).length;
                      const percentage = publications.length ? (count / publications.length) * 100 : 0;
                      return (
                        <div key={q} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-[#4c3c31]">{q} Journal</span>
                            <span className="text-[#7a685c] text-xs">{count} บทความ ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-[#f9f5ee] rounded-full overflow-hidden">
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
              <div className="bg-gradient-to-br from-[#fdfcf9] to-[#f9f5ee] border border-[#ebdccf] p-8 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#3c2f25] tracking-tight">รายงานสถานะการเชื่อมต่อฐานข้อมูลคลาวด์</h3>
                    <p className="text-sm text-[#7a685c] mt-1">รายละเอียดการกำหนดค่าเชื่อมโยง Next.js กับ Cloudflare D1 (SQLite) ฐานข้อมูลไร้เซิร์ฟเวอร์</p>
                  </div>
                  <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#f9f5ee] hover:bg-slate-800 text-[#3c2f25] border border-[#ebdccf] px-4.5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>ทดสอบการเชื่อมต่อใหม่</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {/* Status Indicator Card */}
                  <div className="bg-[#f9f5ee]/50 border border-[#ebdccf]/80 p-5 rounded-xl flex items-center gap-4">
                    <div className={`p-4 rounded-xl ${dbStatus.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      <RefreshCw className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs text-[#8a786c] font-medium block">สถานะการเชื่อมต่อ (Status)</span>
                      <span className={`text-base font-bold flex items-center gap-2 mt-0.5 ${dbStatus.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${dbStatus.status === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                        {dbStatus.status === 'success' ? 'เชื่อมต่อสำเร็จ (Connected)' : 'การเชื่อมต่อผิดพลาด (Failed)'}
                      </span>
                    </div>
                  </div>

                  {/* Connection Type Card */}
                  <div className="bg-[#f9f5ee]/50 border border-[#ebdccf]/80 p-5 rounded-xl flex items-center gap-4">
                    <div className="bg-[#fef3c7] text-[#b45309] p-4 rounded-xl">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs text-[#8a786c] font-medium block">รูปแบบการดึงข้อมูล (Connection Type)</span>
                      <span className="text-base font-bold text-[#3c2f25] mt-0.5">{dbStatus.connectionType}</span>
                    </div>
                  </div>

                  {/* Query Latency Card */}
                  <div className="bg-[#f9f5ee]/50 border border-[#ebdccf]/80 p-5 rounded-xl flex items-center gap-4">
                    <div className="bg-amber-500/10 text-amber-400 p-4 rounded-xl">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs text-[#8a786c] font-medium block">ความเร็วในการตอบสนอง (Query Latency)</span>
                      <span className="text-base font-bold text-amber-400 mt-0.5">{dbStatus.latencyMs} ms</span>
                    </div>
                  </div>

                  {/* Database Name Card */}
                  <div className="bg-[#f9f5ee]/50 border border-[#ebdccf]/80 p-5 rounded-xl flex items-center gap-4">
                    <div className="bg-cyan-500/10 text-cyan-400 p-4 rounded-xl">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs text-[#8a786c] font-medium block">ชื่อฐานข้อมูล (Database Name)</span>
                      <span className="text-base font-bold text-[#3c2f25] mt-0.5">{dbStatus.databaseName || 'ไม่ระบุ'}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Information Table */}
                <div className="mt-8 border-t border-[#ebdccf]/80 pt-6 space-y-4">
                  <h4 className="text-sm font-bold text-[#3c2f25] uppercase tracking-wider">รายงานข้อมูลการกำหนดค่าระบบฐานข้อมูล (Database Configurations)</h4>
                  
                  <div className="bg-[#f9f5ee]/40 rounded-xl border border-[#ebdccf] divide-y divide-[#ebdccf] overflow-hidden text-sm">
                    <div className="grid grid-cols-3 p-4">
                      <span className="text-[#7a685c] font-semibold">ที่อยู่โฮสต์ (Database Host)</span>
                      <span className="col-span-2 font-mono text-[#3c2f25]">{dbStatus.host || 'ไม่ระบุ'}</span>
                    </div>
                    <div className="grid grid-cols-3 p-4">
                      <span className="text-[#7a685c] font-semibold">Connection String (Masked)</span>
                      <span className="col-span-2 font-mono text-[#4c3c31] text-xs break-all">{dbStatus.maskedConnectionString || 'ไม่ถูกตั้งค่า'}</span>
                    </div>
                    {dbStatus.dbVersion && (
                      <div className="grid grid-cols-3 p-4">
                        <span className="text-[#7a685c] font-semibold">รุ่นของเซิร์ฟเวอร์ (DB Version)</span>
                        <span className="col-span-2 text-[#4c3c31] text-xs leading-relaxed">{dbStatus.dbVersion}</span>
                      </div>
                    )}
                    {dbStatus.dbTime && (
                      <div className="grid grid-cols-3 p-4">
                        <span className="text-[#7a685c] font-semibold">เวลาของเซิร์ฟเวอร์ (DB Server Time)</span>
                        <span className="col-span-2 text-[#4c3c31]">{new Date(dbStatus.dbTime).toLocaleString('th-TH')}</span>
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

          {/* DB Explorer Section */}
          {activeTab === 'db-explorer' && (
            <div className="space-y-6">
              {/* Tables selection grid and meta info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left panel: List of tables */}
                <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl shadow-lg md:col-span-1 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#ebdccf] pb-3">
                    <h3 className="text-base font-bold text-[#3c2f25] flex items-center gap-2">
                      <Database className="h-5 w-5 text-[#b45309]" />
                      <span>รายการตาราง (Tables)</span>
                    </h3>
                    {loadingExplorer && <RefreshCw className="h-4 w-4 animate-spin text-[#8a786c]" />}
                  </div>
                  
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {explorerData.tables && explorerData.tables.map((t: any) => (
                      <button
                        key={t.name}
                        onClick={() => setSelectedExplorerTable(t.name)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left border transition-all text-xs font-semibold ${
                          selectedExplorerTable === t.name
                            ? 'bg-[#d97706]/15 border-[#d97706] text-[#3c2f25]'
                            : 'bg-[#f9f5ee]/40 border-[#ebdccf] text-[#7a685c] hover:bg-[#ebdccf] hover:text-[#1c120c]'
                        }`}
                      >
                        <span className="font-mono">{t.name}</span>
                        <span className="bg-[#f9f5ee] border border-[#ebdccf] px-2 py-0.5 rounded-full text-[10px] text-[#4c3c31]">
                          {t.rowCount} rows
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right panel: Selected Table Schema */}
                <div className="bg-[#fdfcf9] border border-[#ebdccf] p-6 rounded-2xl shadow-lg md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#ebdccf] pb-3">
                    <h3 className="text-base font-bold text-[#3c2f25] flex items-center gap-2">
                      <Layers className="h-5 w-5 text-[#b45309]" />
                      <span>โครงสร้างตาราง (Schema - <span className="font-mono text-xs">{selectedExplorerTable}</span>)</span>
                    </h3>
                    <button
                      onClick={() => fetchExplorerData(selectedExplorerTable)}
                      className="p-1.5 hover:bg-[#f9f5ee] rounded-lg border border-[#ebdccf] text-[#7a685c] hover:text-[#3c2f25]"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                    {explorerData.schema && explorerData.schema.map((col: any) => (
                      <div key={col.name} className="bg-[#f9f5ee]/50 border border-[#ebdccf] p-3 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#3c2f25]">{col.name}</span>
                          {col.pk && (
                            <span className="bg-amber-600/10 text-amber-600 border border-amber-600/20 px-1.5 py-0.5 rounded-[4px] text-[9px] font-extrabold uppercase scale-90">
                              PK
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[#8a786c] text-[11px] uppercase">{col.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Rows List Section */}
              <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-[#ebdccf] bg-[#fdfcf9] flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#3c2f25] flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#b45309]" />
                    <span>ข้อมูลในตาราง (Records - <span className="font-mono text-xs">{selectedExplorerTable}</span>)</span>
                  </h3>
                  <span className="text-xs text-[#7a685c]">แสดงสูงสุด 100 แถวแรก</span>
                </div>

                <div className="overflow-x-auto max-h-[500px]">
                  {explorerData.tableData && explorerData.tableData.length > 0 ? (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#f9f5ee] border-b border-[#ebdccf] text-[#7a685c] font-semibold uppercase tracking-wider font-mono">
                          {explorerData.schema && explorerData.schema.map((col: any) => (
                            <th key={col.name} className="px-5 py-3.5 whitespace-nowrap">{col.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ebdccf] font-mono text-[#4c3c31]">
                        {explorerData.tableData.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-[#f9f5ee]/40 transition-colors">
                            {explorerData.schema && explorerData.schema.map((col: any) => {
                              const val = row[col.name];
                              let displayVal = '';
                              if (val === null || val === undefined) {
                                displayVal = 'NULL';
                              } else if (typeof val === 'object') {
                                displayVal = JSON.stringify(val);
                              } else {
                                displayVal = String(val);
                              }
                              return (
                                <td key={col.name} className="px-5 py-3 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={displayVal}>
                                  {val === null || val === undefined ? (
                                    <span className="text-[#a09085] italic">{displayVal}</span>
                                  ) : (
                                    <span className="text-[#3c2f25]">{displayVal}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-12 text-center text-[#8a786c]">
                      <FileText className="h-12 w-12 mx-auto text-[#ebdccf] mb-3" />
                      <p className="text-sm font-semibold">ไม่มีรายการข้อมูลในตารางนี้</p>
                      <p className="text-xs text-[#a09085] mt-1">ตารางว่างเปล่า หรือ ไม่พบข้อมูลในระบบ</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Users List and CRUD UI */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Sub-tabs for Active vs Deleted */}
              {hasPermission('MANAGE_USERS') && (
                <div className="flex border-b border-[#ebdccf] gap-4">
                  <button
                    onClick={() => setUsersSubTab('active')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                      usersSubTab === 'active'
                        ? 'border-[#d97706] text-[#d97706]'
                        : 'border-transparent text-[#7a685c] hover:text-[#4c3c31]'
                    }`}
                  >
                    ใช้งานอยู่ ({users.filter(u => !u.isDeleted).length})
                  </button>
                  <button
                    onClick={() => setUsersSubTab('deleted')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                      usersSubTab === 'deleted'
                        ? 'border-[#d97706] text-[#d97706]'
                        : 'border-transparent text-[#7a685c] hover:text-[#4c3c31]'
                    }`}
                  >
                    พ้นสภาพ/ถูกลบ ({users.filter(u => u.isDeleted).length})
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="relative w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-[#8a786c]" />
                  </span>
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อผู้ใช้หรืออีเมล..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#fdfcf9] border border-[#ebdccf] text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
                  />
                </div>
                {hasPermission('MANAGE_USERS') && usersSubTab === 'active' && (
                  <button
                    onClick={() => { setEditingUser(null); setUserForm({ name: '', email: '', rolesList: ['RESEARCHER'] }); setIsUserModalOpen(true); }}
                    className="flex items-center gap-2 bg-[#d97706] hover:bg-[#f59e0b] text-[#3c2f25] font-semibold text-sm px-4.5 py-2.5 rounded-xl shadow-lg shadow-amber-600/10 active:scale-95 transition-all"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    <span>เพิ่มข้อมูลผู้ใช้</span>
                  </button>
                )}
              </div>

              <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f9f5ee] border-b border-[#ebdccf] text-[#7a685c] text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-4">อีเมลติดต่อ</th>
                      <th className="px-6 py-4">บทบาทของระบบ</th>
                      {hasPermission('MANAGE_USERS') && <th className="px-6 py-4 text-right">เครื่องมือ</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebdccf] text-sm">
                    {users
                      .filter((u) => {
                        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesSubTab = usersSubTab === 'active' ? !u.isDeleted : u.isDeleted;
                        return matchesSearch && matchesSubTab;
                      })
                      .map((u) => {
                        const userRoles = u.roles || (u.role ? u.role.split(',') : []) as UserRole[];
                        return (
                          <tr key={u.id} className="hover:bg-[#f9f5ee]/40 transition-colors">
                            <td className="px-6 py-4 font-semibold text-[#3c2f25]">
                              {u.name} {u.isDeleted && <span className="text-xs text-rose-500 font-normal">(พ้นสภาพ)</span>}
                            </td>
                            <td className="px-6 py-4 text-[#7a685c]">{u.email}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {userRoles.map((r) => (
                                  <span key={r} className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    r === 'RESEARCHER' ? 'bg-[#fdf6e2] text-[#b45309] border border-[#fbe3b5]' :
                                    r === 'STAFF' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                                    r === 'EXECUTIVE' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                                    r === 'EVALUATOR' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900' :
                                    'bg-slate-900 text-slate-400 border border-slate-700'
                                  }`}>
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </td>
                            {hasPermission('MANAGE_USERS') && (
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {usersSubTab === 'active' ? (
                                    <>
                                      <button
                                        onClick={() => handleEditUser(u)}
                                        className="p-2 text-[#7a685c] hover:text-[#3c2f25] rounded-lg hover:bg-[#f9f5ee] transition-colors"
                                      >
                                        <Edit className="h-4.5 w-4.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/20 transition-colors"
                                      >
                                        <Trash2 className="h-4.5 w-4.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleRestore('users', u.id)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
                                    >
                                      <RefreshCw className="h-3.5 w-3.5" />
                                      <span>กู้คืนสิทธิ์</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Projects View */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Sub-tabs for Active vs Deleted */}
              {hasPermission('DELETE_RESEARCH') && (
                <div className="flex border-b border-[#ebdccf] gap-4">
                  <button
                    onClick={() => setProjectsSubTab('active')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                      projectsSubTab === 'active'
                        ? 'border-[#d97706] text-[#d97706]'
                        : 'border-transparent text-[#7a685c] hover:text-[#4c3c31]'
                    }`}
                  >
                    โครงการขอรับทุน ({projects.filter(p => !p.isDeleted && !p.id.startsWith('CEU-')).length})
                  </button>
                  <button
                    onClick={() => setProjectsSubTab('ceu')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                      projectsSubTab === 'ceu'
                        ? 'border-[#d97706] text-[#d97706]'
                        : 'border-transparent text-[#7a685c] hover:text-[#4c3c31]'
                    }`}
                  >
                    โครงการในระบบ CEU ({projects.filter(p => !p.isDeleted && p.id.startsWith('CEU-')).length})
                  </button>
                  <button
                    onClick={() => setProjectsSubTab('deleted')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                      projectsSubTab === 'deleted'
                        ? 'border-[#d97706] text-[#d97706]'
                        : 'border-transparent text-[#7a685c] hover:text-[#4c3c31]'
                    }`}
                  >
                    ถังขยะ/โครงการถูกลบ ({projects.filter(p => p.isDeleted).length})
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-5 w-5 text-[#8a786c]" />
                    </span>
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อโครงการวิจัย..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#fdfcf9] border border-[#ebdccf] text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#fdfcf9] border border-[#ebdccf] text-xs font-semibold text-[#4c3c31] rounded-xl px-3 py-2.5"
                  >
                    <option value="ALL">ทุกสถานะโครงการ</option>
                    <option value="PROPOSED">PROPOSED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="TERMINATED">TERMINATED</option>
                  </select>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 gap-6">
                {projects
                  .filter((p) => {
                    const matchQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
                    const matchesSubTab = 
                      projectsSubTab === 'active' ? (!p.isDeleted && !p.id.startsWith('CEU-')) :
                      projectsSubTab === 'ceu' ? (!p.isDeleted && p.id.startsWith('CEU-')) :
                      p.isDeleted;
                    return matchQuery && matchStatus && matchesSubTab;
                  })
                  .map((p) => (
                    <div key={p.id} className="bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl p-6 shadow-lg hover:border-[#ebdccf] transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              p.status === 'PROPOSED' ? 'bg-[#f9f5ee] text-[#7a685c] border border-[#ebdccf]' :
                              p.status === 'APPROVED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                              p.status === 'ONGOING' ? 'bg-[#fdf6e2] text-[#b45309] border border-[#fbe3b5] animate-pulse' :
                              p.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {p.status}
                            </span>
                            <h3 className="text-lg font-bold text-[#3c2f25] mt-3 leading-snug">
                              {p.title} {p.isDeleted && <span className="text-xs text-rose-500 font-normal">(ถูกลบ)</span>}
                            </h3>
                          </div>
                          
                          {/* Project Actions */}
                          {hasPermission('DELETE_RESEARCH') && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              {projectsSubTab === 'active' ? (
                                <button
                                  onClick={() => handleDeleteProject(p.id)}
                                  className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/20 transition-colors"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRestore('projects', p.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  <span>กู้คืนโครงการ</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* PI info & Dates details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pb-6 border-b border-slate-900 text-xs">
                          <div>
                            <span className="text-[#8a786c] font-medium block">หัวหน้าโครงการ (PI)</span>
                            <span className="text-[#4c3c31] font-semibold mt-1 block">
                              {p.leader ? (p.leader.isDeleted ? `${p.leader.name} (พ้นสภาพ)` : p.leader.name) : 'ไม่พบผู้ใช้ในระบบ'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#8a786c] font-medium block">ระยะเวลาดำเนินโครงการ</span>
                            <span className="text-[#4c3c31] font-semibold mt-1 block">
                              {formatDate(p.startDate)} - {formatDate(p.endDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#8a786c] font-medium block">เลขที่ IRB & วันที่อนุมัติ</span>
                            <span className="text-[#4c3c31] font-semibold mt-1 block">
                              {p.irbNo ? `${p.irbNo} (${formatDate(p.approvedDate)})` : 'รอยืนยันการอนุมัติ'}
                            </span>
                          </div>
                        </div>

                        {/* Extra Metadata (CEU Linkage Details) */}
                        <div className="mt-4 text-xs flex gap-6 text-[#7a685c]">
                          <div>
                            {p.ceuConsultId ? (() => {
                              const linkedConsult = consultations.find(c => c.id === p.ceuConsultId);
                              return (
                                <span className="flex items-center gap-1.5 font-bold">
                                  <span className={`w-2 h-2 rounded-full ${
                                    !linkedConsult || linkedConsult.status === 'SCHEDULED' ? 'bg-amber-500 animate-pulse' :
                                    linkedConsult.status === 'COMPLETED' ? 'bg-emerald-500' :
                                    'bg-rose-500'
                                  }`}></span>
                                  <span className="text-[#3c2f25]">เชื่อมโยง CEU: </span>
                                  <span className={`px-2 py-0.5 text-[9px] rounded ${
                                    !linkedConsult ? 'bg-amber-100 text-amber-800' :
                                    linkedConsult.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                    linkedConsult.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                    'bg-rose-100 text-rose-800 border border-rose-300'
                                  }`}>
                                    {!linkedConsult ? 'ไม่พบข้อมูล' :
                                     linkedConsult.status === 'SCHEDULED' ? 'รอดำเนินการ (Scheduled)' :
                                     linkedConsult.status === 'COMPLETED' ? 'ประเมินเสร็จสิ้น (Completed)' : 'ยกเลิก (Cancelled)'}
                                  </span>
                                  <span className="text-[#7a685c] font-normal text-[10px]">
                                    {linkedConsult ? `[${linkedConsult.type}] ID: ${linkedConsult.id.slice(-6)}` : `ID: ${p.ceuConsultId}`}
                                  </span>
                                </span>
                              );
                            })() : p.ceuBypassReason ? (
                              <span className="text-[#b45309] font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-[#b45309] rounded-full"></span>
                                <span>ยกเว้นสถิติ CEU: <span className="italic font-medium">{p.ceuBypassReason}</span></span>
                              </span>
                            ) : (
                              <span className="text-rose-500 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                <span>ยังไม่ได้ผ่านตรวจสอบสถิติ CEU หรือขอยกเว้น</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Budget Tracker Progress bar */}
                      <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-[#7a685c]">งบประมาณที่ใช้ไป: <span className="text-amber-500">{formatCurrency(p.budgetSpent)}</span></span>
                          <span className="text-[#8a786c]">งบตั้งต้น: {formatCurrency(p.budgetInitial)}</span>
                        </div>
                        <div className="w-full h-3 bg-[#f9f5ee] rounded-full overflow-hidden p-0.5 border border-[#ebdccf]">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              (p.budgetSpent / p.budgetInitial) > 0.9 ? 'bg-rose-500' :
                              (p.budgetSpent / p.budgetInitial) > 0.6 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min((p.budgetSpent / (p.budgetInitial || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Peer Evaluation Module Section */}
                      <div className="mt-6 pt-5 border-t border-[#ebdccf] space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#3c2f25] uppercase tracking-wide flex items-center gap-1.5 font-serif">
                            <span>🔍 การประเมินโดยผู้ทรงคุณวุฒิ (Peer Evaluation)</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              setAssignForm({
                                projectId: p.id,
                                evaluatorId: '',
                                evaluatorType: 'INTERNAL',
                              });
                              setIsAssignModalOpen(true);
                            }}
                            className="bg-[#ebdccf] hover:bg-[#d97706]/20 text-[#3c2f25] font-bold text-[10px] px-2.5 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm"
                          >
                            + แต่งตั้งผู้ทรงคุณวุฒิประเมิน
                          </button>
                        </div>

                        {/* List of assigned evaluations */}
                        {(() => {
                          const projectEvals = evaluations.filter(e => e.projectId === p.id && !e.isDeleted);
                          const submittedEvals = projectEvals.filter(e => e.status === 'SUBMITTED');
                          const avgScore = submittedEvals.length > 0
                            ? Math.round(submittedEvals.reduce((acc, curr) => acc + (curr.scoreOverallQuality || 0), 0) / submittedEvals.length)
                            : null;

                          return (
                            <div className="space-y-3">
                              {/* Average Score Badge */}
                              {avgScore !== null && (
                                <div className="flex items-center gap-2 bg-[#fdf6e2] border border-[#fbe3b5] p-3 rounded-xl text-xs text-[#b45309]">
                                  <span className="font-extrabold text-[#d97706] text-sm">★ {avgScore} / 100</span>
                                  <span className="font-bold">คะแนนเฉลี่ยคุณภาพภาพรวม ({submittedEvals.length} ท่าน)</span>
                                </div>
                              )}

                              {projectEvals.length === 0 ? (
                                <p className="text-[11px] text-[#8a786c] italic">ยังไม่มีการแต่งตั้งผู้ทรงคุณวุฒิประเมินโครงการวิจัยนี้</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {projectEvals.map(ev => (
                                    <div key={ev.id} className="bg-white border border-[#ebdccf]/60 p-3 rounded-xl space-y-2 text-[11px]">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-[#4c3c31]">{ev.evaluator?.name || `ID: ${ev.evaluatorId.slice(0, 8)}`}</span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                          ev.status === 'SUBMITTED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                                        }`}>
                                          {ev.status}
                                        </span>
                                      </div>
                                      
                                      <div className="text-[10px] text-[#7a685c] space-y-1">
                                        <p>ประเภท: {ev.evaluatorType === 'INTERNAL' ? 'ภายในคณะแพทย์' : 'ภายนอกมหาวิทยาลัย'}</p>
                                        {ev.status === 'SUBMITTED' && (
                                          <>
                                            <p className="font-bold text-[#3c2f25]">คะแนนข้อ 5 (คุณภาพโดยรวม): <span className="text-[#d97706] font-extrabold">{ev.scoreOverallQuality} / 100</span></p>
                                            
                                            {/* Qualitative Feedbacks */}
                                            <div className="bg-[#f9f5ee] p-2 rounded-lg mt-2 text-[10px] text-[#3c2f25] space-y-1">
                                              <p><strong>1. กระบวนการวิจัย:</strong> {ev.feedbackResearchProcess || '-'}</p>
                                              <p><strong>2. ความแปลกใหม่:</strong> {ev.feedbackOriginality || '-'}</p>
                                              <p><strong>3. ผลผลิตที่คาดหวัง:</strong> {ev.feedbackExpectedOutput || '-'}</p>
                                              <p><strong>4. ความเหมาะสมงบประมาณ:</strong> {ev.feedbackBudgetAppropriate || '-'}</p>
                                            </div>

                                            {/* Bank Accounts details */}
                                            <div className="border-t border-[#ebdccf]/50 pt-2 mt-2 space-y-1 text-[10px]">
                                              <p className="font-bold text-[#4c3c31]">💰 บัญชีผู้ทรงคุณวุฒิ:</p>
                                              <p>ชื่อบัญชี: {ev.bankAccountName || '-'}</p>
                                              <p>ธนาคาร: {ev.bankName} (สาขา: {ev.bankBranch})</p>
                                              <p>เลขที่บัญชี: {ev.bankAccountNumber}</p>
                                              {ev.bankBookAttachmentData && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const win = window.open();
                                                    if (win) {
                                                      win.document.title = ev.bankBookAttachmentName || 'สมุดบัญชีผู้ประเมิน';
                                                      win.document.write(`<img src="${ev.bankBookAttachmentData}" style="max-width:100%; height:auto; display:block; margin:auto;" />`);
                                                    }
                                                  }}
                                                  className="text-[#d97706] hover:underline font-bold mt-1 inline-block"
                                                >
                                                  📎 เปิดดูหน้าสมุดบัญชี
                                                </button>
                                              )}
                                            </div>
                                          </>
                                        )}
                                      </div>

                                      <div className="flex justify-end pt-1.5 border-t border-[#ebdccf]/30">
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteEvaluation(ev.id)}
                                          className="text-rose-500 hover:text-rose-700 font-semibold"
                                        >
                                          ถอนผู้ประเมิน
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Publications Section */}
          {activeTab === 'publications' && (
            <div className="space-y-6">
              {/* Sub-tabs for Active vs Deleted */}
              {hasPermission('DELETE_RESEARCH') && (
                <div className="flex border-b border-[#ebdccf] gap-4">
                  <button
                    onClick={() => setPublicationsSubTab('active')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                      publicationsSubTab === 'active'
                        ? 'border-[#d97706] text-[#d97706]'
                        : 'border-transparent text-[#7a685c] hover:text-[#4c3c31]'
                    }`}
                  >
                    งานตีพิมพ์ทั้งหมด ({publications.filter(p => !p.isDeleted).length})
                  </button>
                  <button
                    onClick={() => setPublicationsSubTab('deleted')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                      publicationsSubTab === 'deleted'
                        ? 'border-[#d97706] text-[#d97706]'
                        : 'border-transparent text-[#7a685c] hover:text-[#4c3c31]'
                    }`}
                  >
                    ถังขยะ/งานตีพิมพ์ที่ถูกลบ ({publications.filter(p => p.isDeleted).length})
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="relative w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-[#8a786c]" />
                  </span>
                  <input
                    type="text"
                    placeholder="ค้นหางานตีพิมพ์ วารสาร..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#fdfcf9] border border-[#ebdccf] text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {publications
                  .filter((p) => {
                    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.journal.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesSubTab = publicationsSubTab === 'active' ? !p.isDeleted : p.isDeleted;
                    return matchesSearch && matchesSubTab;
                  })
                  .map((p) => (
                    <div key={p.id} className="bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl p-6 shadow-md hover:border-[#ebdccf] transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="bg-amber-600/10 text-amber-500 border border-amber-600/30 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {p.quartile} Journal
                            </span>
                            <span className="text-[#b0a095]">•</span>
                            <span className="text-xs text-[#7a685c] font-semibold">{p.journal}</span>
                          </div>
                          <h3 className="text-base font-bold text-[#3c2f25] mt-3.5 leading-snug">
                            {p.title} {p.isDeleted && <span className="text-xs text-rose-500 font-normal">(ถูกลบ)</span>}
                          </h3>
                        </div>

                        {canEditPublication(p) && (
                          <div className="flex items-center gap-1.5">
                            {publicationsSubTab === 'active' ? (
                              <button
                                onClick={() => handleDeletePublication(p.id)}
                                className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/20 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestore('publications', p.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>กู้คืนผลงาน</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Project info link and Reward Status block */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-900">
                        <div className="text-xs space-y-1">
                          <p className="text-[#8a786c]">ผู้ขอรับรางวัล: <span className="text-[#4c3c31] font-semibold">{p.author ? (p.author.isDeleted ? `${p.author.name} (พ้นสภาพ)` : p.author.name) : 'ไม่พบผู้ใช้ในระบบ'}</span></p>
                          {p.project && (
                            <p className="text-[#8a786c]">โครงการวิจัยอ้างอิง: <span className="text-[#b45309] font-medium">{p.project.title} {p.project.isDeleted && <span className="text-xs text-rose-500 font-normal">(ถูกลบ)</span>}</span></p>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-[#8a786c] uppercase block font-semibold">จำนวนเงินรางวัลที่เสนอขอ</span>
                            <span className="text-sm font-bold text-amber-500">{formatCurrency(p.rewardAmount)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                              p.rewardStatus === 'PENDING' ? 'bg-[#f9f5ee] text-[#7a685c] border border-[#ebdccf]' :
                              p.rewardStatus === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {p.rewardStatus}
                            </span>
                            
                            {/* Executive Approver action buttons */}
                            {hasPermission('APPROVE_REWARD') && p.rewardStatus === 'PENDING' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleRewardStatusChange(p.id, 'APPROVED')}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-[#3c2f25] p-1.5 rounded-lg transition-colors"
                                  title="Approve reward"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRewardStatusChange(p.id, 'REJECTED')}
                                  className="bg-rose-600 hover:bg-rose-500 text-[#3c2f25] p-1.5 rounded-lg transition-colors"
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
              {/* Sub-tabs for Active vs Deleted */}
              {hasPermission('DELETE_RESEARCH') && (
                <div className="flex border-b border-[#ebdccf] gap-4">
                  <button
                    onClick={() => setConsultationsSubTab('active')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                      consultationsSubTab === 'active'
                        ? 'border-[#d97706] text-[#d97706]'
                        : 'border-transparent text-[#7a685c] hover:text-[#4c3c31]'
                    }`}
                  >
                    คิวนัดหมายทั้งหมด ({consultations.filter(c => !c.isDeleted).length})
                  </button>
                  <button
                    onClick={() => setConsultationsSubTab('deleted')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                      consultationsSubTab === 'deleted'
                        ? 'border-[#d97706] text-[#d97706]'
                        : 'border-transparent text-[#7a685c] hover:text-[#4c3c31]'
                    }`}
                  >
                    ถังขยะ/คิวที่ถูกลบ ({consultations.filter(c => c.isDeleted).length})
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="relative w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-[#8a786c]" />
                  </span>
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อที่ปรึกษา / ผู้ขอคำปรึกษา..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#fdfcf9] border border-[#ebdccf] text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
                  />
                </div>
              </div>

              <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-2xl overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f9f5ee] border-b border-[#ebdccf] text-[#7a685c] text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">ประเภทหัวข้อ</th>
                      <th className="px-6 py-4">วันเวลาที่นัดหมาย</th>
                      <th className="px-6 py-4">ผู้ขอรับคำปรึกษา (PI)</th>
                      <th className="px-6 py-4">ผู้ให้คำปรึกษา (Advisor)</th>
                      <th className="px-6 py-4">สถานะคิว</th>
                      {(hasPermission('MANAGE_CEU_SCHEDULE') || hasPermission('CANCEL_OWN_CONSULT') || hasPermission('DELETE_RESEARCH')) && <th className="px-6 py-4 text-right">จัดการคิว</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebdccf] text-sm">
                    {consultations
                      .filter((c) => {
                        const search = searchQuery.toLowerCase();
                        const reqName = c.requester?.name?.toLowerCase() || '';
                        const advName = c.advisor?.name?.toLowerCase() || '';
                        const matchesSearch = reqName.includes(search) || advName.includes(search);
                        const matchesSubTab = consultationsSubTab === 'active' ? !c.isDeleted : c.isDeleted;
                        return matchesSearch && matchesSubTab;
                      })
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-[#f9f5ee]/40 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase ${
                              c.type === 'PROTOCOL' ? 'bg-amber-600/10 text-amber-500 border border-amber-500/20' :
                              'bg-cyan-600/10 text-cyan-500 border border-cyan-500/20'
                            }`}>
                              {c.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#4c3c31]">
                            {new Date(c.appointmentTime).toLocaleString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })} น.
                          </td>
                          <td className="px-6 py-4 text-[#3c2f25] font-medium">
                            {c.requester ? (c.requester.isDeleted ? `${c.requester.name} (พ้นสภาพ)` : c.requester.name) : 'ไม่พบผู้ใช้ในระบบ'}
                          </td>
                          <td className="px-6 py-4 text-[#4c3c31]">
                            {c.advisor ? (c.advisor.isDeleted ? `${c.advisor.name} (พ้นสภาพ)` : c.advisor.name) : 'ไม่พบผู้ใช้ในระบบ'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              c.status === 'SCHEDULED' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                              c.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          {(hasPermission('MANAGE_CEU_SCHEDULE') || hasPermission('CANCEL_OWN_CONSULT') || hasPermission('DELETE_RESEARCH')) && (
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {consultationsSubTab === 'active' ? (
                                  <>
                                    {canEditConsultation(c) && c.status === 'SCHEDULED' && (
                                      <>
                                        <button
                                          onClick={() => handleConsultStatusChange(c.id, 'COMPLETED')}
                                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-[#f9f5ee] rounded"
                                          title="Mark completed"
                                        >
                                          <CheckCircle className="h-4.5 w-4.5" />
                                        </button>
                                        <button
                                          onClick={() => handleConsultStatusChange(c.id, 'CANCELLED')}
                                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-[#f9f5ee] rounded"
                                          title="Mark cancelled"
                                        >
                                          <XCircle className="h-4.5 w-4.5" />
                                        </button>
                                      </>
                                    )}
                                    {hasPermission('DELETE_RESEARCH') && (
                                      <button
                                        onClick={() => handleDeleteConsultation(c.id)}
                                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleRestore('consultations', c.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
                                  >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    <span>กู้คืนคิวนัด</span>
                                  </button>
                                )}
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
          <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#3c2f25] mb-6">
              {editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มข้อมูลผู้ใช้งานใหม่'}
            </h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">อีเมลติดต่อ</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2.5">บทบาทและสิทธิ์ระบบ (เลือกได้มากกว่า 1)</label>
                <div className="space-y-2 bg-[#f9f5ee] border border-[#ebdccf] rounded-xl p-3.5">
                  {(['RESEARCHER', 'STAFF', 'EXECUTIVE', 'STAFF_CEU', 'EVALUATOR'] as UserRole[]).map((r) => {
                    const isChecked = userForm.rolesList.includes(r);
                    return (
                      <label key={r} className="flex items-center gap-3 text-xs text-[#3c2f25] font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setUserForm({
                                ...userForm,
                                rolesList: userForm.rolesList.filter((x) => x !== r)
                              });
                            } else {
                              setUserForm({
                                ...userForm,
                                rolesList: [...userForm.rolesList, r]
                              });
                            }
                          }}
                          className="rounded text-[#d97706] focus:ring-[#d97706]"
                        />
                        <span>{ROLE_LABELS[r] || r}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4.5 py-2.5 text-[#7a685c] hover:text-[#3c2f25] text-xs font-semibold rounded-xl hover:bg-[#f9f5ee]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-[#d97706] hover:bg-[#f59e0b] text-[#3c2f25] text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/10"
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
          <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-3xl p-8 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#3c2f25] mb-6">
              {editingProject ? 'แก้ไขโครงการวิจัย' : 'เพิ่มโครงการวิจัยใหม่'}
            </h3>
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ชื่อโครงการวิจัย</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">สถานะโครงการ</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as any })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                  >
                    <option value="PROPOSED">PROPOSED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="TERMINATED">TERMINATED</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">หัวหน้าโครงการ (PI)</label>
                  <select
                    required
                    value={projectForm.leaderId}
                    onChange={(e) => setProjectForm({ ...projectForm, leaderId: e.target.value })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                  >
                    <option value="" disabled>เลือกนักวิจัย...</option>
                    {users.filter(u => !u.isDeleted).map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">งบประมาณตั้งต้น (บาท)</label>
                  <input
                    type="number"
                    required
                    value={projectForm.budgetInitial}
                    onChange={(e) => setProjectForm({ ...projectForm, budgetInitial: Number(e.target.value) })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">งบประมาณที่ใช้ไป (บาท)</label>
                  <input
                    type="number"
                    value={projectForm.budgetSpent}
                    onChange={(e) => setProjectForm({ ...projectForm, budgetSpent: Number(e.target.value) })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
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
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">วันที่สิ้นสุดโครงการ</label>
                  <input
                    type="date"
                    required
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#ebdccf] pt-4 mt-2">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">เลขที่ IRB (จริยธรรม)</label>
                  <input
                    type="text"
                    value={projectForm.irbNo}
                    onChange={(e) => setProjectForm({ ...projectForm, irbNo: e.target.value })}
                    placeholder="เช่น IRB-2026-X"
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-3 py-2.5 text-xs text-[#3c2f25] focus:border-[#d97706]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">วันที่ได้รับอนุมัติ IRB</label>
                  <input
                    type="date"
                    value={projectForm.approvedDate}
                    onChange={(e) => setProjectForm({ ...projectForm, approvedDate: e.target.value })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-3 py-2.5 text-xs text-[#3c2f25] focus:border-[#d97706]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4.5 py-2.5 text-[#7a685c] hover:text-[#3c2f25] text-xs font-semibold rounded-xl hover:bg-[#f9f5ee]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-[#d97706] hover:bg-[#f59e0b] text-[#3c2f25] text-xs font-semibold rounded-xl shadow-lg"
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
          <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#3c2f25] mb-6">
              {editingPublication ? 'แก้ไขคำขอรางวัลงานตีพิมพ์' : 'ยื่นขอรางวัลตีพิมพ์วารสารวิจัย'}
            </h3>
            <form onSubmit={handlePublicationSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ชื่อบทความวิชาการ</label>
                <input
                  type="text"
                  required
                  value={publicationForm.title}
                  onChange={(e) => setPublicationForm({ ...publicationForm, title: e.target.value })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">ชื่อวารสารวิชาการ</label>
                  <input
                    type="text"
                    required
                    value={publicationForm.journal}
                    onChange={(e) => setPublicationForm({ ...publicationForm, journal: e.target.value })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">ระดับ Quartile</label>
                  <select
                    value={publicationForm.quartile}
                    onChange={(e) => setPublicationForm({ ...publicationForm, quartile: e.target.value as any })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
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
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">จริยธรรมอ้างอิงของโครงการ</label>
                  <select
                    value={publicationForm.projectId}
                    onChange={(e) => setPublicationForm({ ...publicationForm, projectId: e.target.value })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                  >
                    <option value="">ไม่ผูกกับโครงการ (อิสระ)</option>
                    {projects.filter(p => !p.isDeleted).map((p) => (
                      <option key={p.id} value={p.id}>{p.title.slice(0, 30)}...</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">นักวิจัยผู้ขอรางวัล</label>
                  <select
                    required
                    value={publicationForm.authorId}
                    onChange={(e) => setPublicationForm({ ...publicationForm, authorId: e.target.value })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                  >
                    <option value="" disabled>เลือกผู้ส่งผลงาน...</option>
                    {users.filter(u => !u.isDeleted).map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
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
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsPublicationModalOpen(false)}
                  className="px-4.5 py-2.5 text-[#7a685c] hover:text-[#3c2f25] text-xs font-semibold rounded-xl hover:bg-[#f9f5ee]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-[#d97706] hover:bg-[#f59e0b] text-[#3c2f25] text-xs font-semibold rounded-xl shadow-lg"
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
          <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#3c2f25] mb-6">
              {editingConsultation ? 'แก้ไขการจองคิวที่ปรึกษา' : 'จองคิวรับคำปรึกษา CEU งานวิจัย'}
            </h3>
            <form onSubmit={handleConsultationSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ประเภทหัวข้อบริการ</label>
                <select
                  value={consultationForm.type}
                  onChange={(e) => setConsultationForm({ ...consultationForm, type: e.target.value as any })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                >
                  <option value="PROTOCOL">จริยธรรมโครงร่างวิจัย (PROTOCOL)</option>
                  <option value="STATISTICAL">วิเคราะห์สถิติวารสารวิจัย (STATISTICAL)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">วันเวลาที่นัดหมาย</label>
                <input
                  type="datetime-local"
                  required
                  value={consultationForm.appointmentTime}
                  onChange={(e) => setConsultationForm({ ...consultationForm, appointmentTime: e.target.value })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">ผู้ให้คำปรึกษา (Staff)</label>
                  <select
                    required
                    value={consultationForm.advisorId}
                    onChange={(e) => setConsultationForm({ ...consultationForm, advisorId: e.target.value })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                  >
                    <option value="" disabled>เลือกผู้ให้คำปรึกษา...</option>
                    {users
                      .filter((u) => u.role === 'STAFF' && !u.isDeleted)
                      .map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">ผู้ขอรับปรึกษา (Researcher)</label>
                  <select
                    required
                    value={consultationForm.requesterId}
                    onChange={(e) => setConsultationForm({ ...consultationForm, requesterId: e.target.value })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                  >
                    <option value="" disabled>เลือกผู้รับคำปรึกษา...</option>
                    {users
                      .filter((u) => u.role === 'RESEARCHER' && !u.isDeleted)
                      .map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {editingConsultation && (
                <div>
                  <label className="text-xs font-semibold text-[#7a685c] block mb-2">สถานะการนัดหมาย</label>
                  <select
                    value={consultationForm.status}
                    onChange={(e) => setConsultationForm({ ...consultationForm, status: e.target.value as any })}
                    className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
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
                  className="px-4.5 py-2.5 text-[#7a685c] hover:text-[#3c2f25] text-xs font-semibold rounded-xl hover:bg-[#f9f5ee]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-[#d97706] hover:bg-[#f59e0b] text-[#3c2f25] text-xs font-semibold rounded-xl shadow-lg"
                >
                  ยืนยันนัดหมายคิว
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Assign Evaluator Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#fdfcf9] border border-[#ebdccf] rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#3c2f25] mb-6 font-serif">
              แต่งตั้งผู้ทรงคุณวุฒิประเมินโครงการวิจัย
            </h3>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">เลือกผู้ประเมิน (Evaluator)</label>
                <select
                  required
                  value={assignForm.evaluatorId}
                  onChange={(e) => setAssignForm({ ...assignForm, evaluatorId: e.target.value })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                >
                  <option value="" disabled>-- กรุณาเลือกผู้ประเมิน --</option>
                  {users
                    .filter((u) => (u.role.split(',').includes('EVALUATOR') || u.role.split(',').includes('RESEARCHER')) && !u.isDeleted)
                    .map((u) => {
                      const isInternal = u.role.split(',').includes('RESEARCHER');
                      const hasEvalRole = u.role.split(',').includes('EVALUATOR');
                      const displayName = isInternal && !hasEvalRole ? `${u.name} (นักวิจัยภายใน)` : u.name;
                      return (
                        <option key={u.id} value={u.id}>
                          {displayName} ({u.email})
                        </option>
                      );
                    })}
                </select>
                {users.filter((u) => (u.role.split(',').includes('EVALUATOR') || u.role.split(',').includes('RESEARCHER')) && !u.isDeleted).length === 0 && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">
                    ⚠️ ไม่มีผู้ใช้ที่เป็นนักวิจัยหรือผู้ทรงคุณวุฒิในระบบ
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7a685c] block mb-2">ประเภทผู้ประเมิน</label>
                <select
                  value={assignForm.evaluatorType}
                  onChange={(e) => setAssignForm({ ...assignForm, evaluatorType: e.target.value })}
                  className="w-full bg-[#f9f5ee] border border-[#ebdccf] rounded-xl px-4 py-2.5 text-sm text-[#3c2f25] focus:border-[#d97706]"
                >
                  <option value="INTERNAL">ภายในคณะแพทยศาสตร์ (Internal)</option>
                  <option value="EXTERNAL">ภายนอกมหาวิทยาลัย (External)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4.5 py-2.5 text-[#7a685c] hover:text-[#3c2f25] text-xs font-semibold rounded-xl hover:bg-[#f9f5ee]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-[#d97706] hover:bg-[#f59e0b] text-[#3c2f25] text-xs font-semibold rounded-xl shadow-lg"
                >
                  แต่งตั้งผู้ประเมิน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
