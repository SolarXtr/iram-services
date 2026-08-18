'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, History, Search, Plus, Edit2, Trash2, Save, X, Check, RefreshCw, AlertCircle, BookOpen
} from 'lucide-react';

interface Researcher {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string | null;
  titleTh?: string | null;
  firstNameTh?: string | null;
  lastNameTh?: string | null;
  titleEn?: string | null;
  firstNameEn?: string | null;
  lastNameEn?: string | null;
  title?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  orcid?: string | null;
  scopusAuthorId?: string | null;
  wosResearcherId?: string | null;
  changeReason?: string | null;
}

interface Project {
  id: string;
  title: string;
  status: string;
  budgetInitial: number;
  budgetSpent: number;
  startDate: string;
  endDate: string;
  irbNo?: string | null;
  leaderId: string;
  leader?: { name: string } | null;
}

interface HistoryLog {
  id: string;
  userId: string;
  userName?: string;
  changedField: string;
  oldValue?: string;
  newValue?: string;
  effectiveDate: string;
  recordedAt: string;
  reason?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'projects' | 'researchers' | 'history'>('projects');
  
  // Data States
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [pubAuthors, setPubAuthors] = useState<any[]>([]);
  const [loadingPubs, setLoadingPubs] = useState(false);
  
  // Loading & UI States
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Edit / Add Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<Researcher> | null>(null);
  
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUsers, resProj, resHist] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/projects'),
        fetch('/api/admin/history')
      ]);
      
      const usersData = await resUsers.json();
      const projData = await resProj.json();
      const histData = await resHist.json();

      setResearchers(Array.isArray(usersData) ? usersData.filter(u => u.role === 'RESEARCHER') : []);
      setProjects(Array.isArray(projData) ? projData : []);
      setHistory(Array.isArray(histData) ? histData : []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการโหลดข้อมูลฐานข้อมูล' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPubAuthors = async (userId: string) => {
    setLoadingPubs(true);
    try {
      const res = await fetch(`/api/admin/publication-authors?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setPubAuthors(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPubs(false);
    }
  };

  const handleUpdatePubAuthor = async (id: string, newName: string) => {
    try {
      const res = await fetch(`/api/admin/publication-authors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, authorName: newName })
      });
      if (res.ok) {
        alert('อัปเดตผู้เขียนในบทความสำเร็จ');
        if (currentUser?.id) fetchPubAuthors(currentUser.id);
      }
    } catch (e) {
      alert('อัปเดตล้มเหลว');
    }
  };

  const handleUnlinkPubAuthor = async (id: string) => {
    if (!confirm('คุณต้องการยกเลิกการเชื่อมโยงนักวิจัยรายนี้กับบทความนี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`/api/admin/publication-authors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, userId: null })
      });
      if (res.ok) {
        alert('ยกเลิกการเชื่อมโยงสำเร็จ');
        if (currentUser?.id) fetchPubAuthors(currentUser.id);
      }
    } catch (e) {
      alert('ยกเลิกการเชื่อมโยงล้มเหลว');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const isEdit = !!currentUser.id;
      const url = isEdit ? `/api/users/${currentUser.id}` : '/api/users';
      const method = isEdit ? 'PUT' : 'POST';

      // Auto concat name
      const title = currentUser.titleEn || '';
      const first = currentUser.firstNameEn || '';
      const last = currentUser.lastNameEn || '';
      const name = `${title} ${first} ${last}`.trim().replace(/\s+/, ' ');

      const payload = {
        ...currentUser,
        name,
        role: 'RESEARCHER',
        changeReason: isEdit ? 'Admin profile update' : 'New researcher registration'
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-performed-by': 'admin' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('บันทึกข้อมูลล้มเหลว');

      setMessage({ type: 'success', text: isEdit ? 'อัปเดตข้อมูลนักวิจัยสำเร็จ' : 'เพิ่มนักวิจัยใหม่สำเร็จ' });
      setShowUserModal(false);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    try {
      const isEdit = !!currentProject.id;
      const url = isEdit ? `/api/projects/${currentProject.id}` : '/api/projects';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-performed-by': 'admin' },
        body: JSON.stringify(currentProject)
      });

      if (!res.ok) throw new Error('บันทึกข้อมูลโครงการล้มเหลว');

      setMessage({ type: 'success', text: isEdit ? 'อัปเดตข้อมูลโครงการสำเร็จ' : 'เพิ่มโครงการวิจัยสำเร็จ' });
      setShowProjectModal(false);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('คุณต้องการลบรายชื่อนักวิจัยรายนี้ใช่หรือไม่? (ระบบจะใช้ Soft Delete)')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { 'x-performed-by': 'admin' } });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'ลบข้อมูลล้มเหลว');
      }
      setMessage({ type: 'success', text: 'ลบข้อมูลนักวิจัยสำเร็จ' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('คุณต้องการลบโครงการวิจัยนี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE', headers: { 'x-performed-by': 'admin' } });
      if (!res.ok) throw new Error('ลบข้อมูลโครงการล้มเหลว');
      setMessage({ type: 'success', text: 'ลบโครงการวิจัยสำเร็จ' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Filters
  const filteredUsers = researchers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.firstNameTh && u.firstNameTh.includes(searchQuery)) ||
    (u.lastNameTh && u.lastNameTh.includes(searchQuery)) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.leader && p.leader.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <div className="bg-slate-900 text-white py-4 px-8 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          iRAM Database Control Center <span className="text-xs bg-red-600 px-2 py-0.5 rounded-full">ADMIN</span>
        </h1>
        <button onClick={fetchData} className="hover:bg-slate-800 p-2 rounded-full transition-colors flex items-center gap-1 text-sm font-bold">
          <RefreshCw size={16} /> รีเฟรชข้อมูล
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-12">
        {/* Status Messages */}
        {message && (
          <div className={`p-4 rounded-xl mb-6 flex justify-between items-center ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
            <span className="text-sm font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {message.text}
            </span>
            <button onClick={() => setMessage(null)} className="hover:bg-white p-1 rounded-full"><X size={16}/></button>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 mb-8 gap-4">
          <button 
            onClick={() => { setActiveTab('projects'); setSearchQuery(''); }} 
            className={`py-3 px-6 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'projects' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Briefcase size={16} /> โครงการวิจัย ({projects.length})
          </button>
          <button 
            onClick={() => { setActiveTab('researchers'); setSearchQuery(''); }} 
            className={`py-3 px-6 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'researchers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Users size={16} /> อาจารย์ / นักวิจัย ({researchers.length})
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setSearchQuery(''); }} 
            className={`py-3 px-6 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <History size={16} /> ประวัติแก้ไขตำแหน่ง ({history.length})
          </button>
        </div>

        {/* Search & Toolbars */}
        {activeTab !== 'history' && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาข้อมูล..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
              />
            </div>
            {activeTab === 'researchers' ? (
              <button onClick={() => { setCurrentUser({}); setShowUserModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-md">
                <Plus size={18}/> ลงทะเบียนนักวิจัยใหม่
              </button>
            ) : (
              <button onClick={() => { setCurrentProject({ status: 'ONGOING', budgetInitial: 0, budgetSpent: 0 }); setShowProjectModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-md">
                <Plus size={18}/> เพิ่มโครงการวิจัยใหม่
              </button>
            )}
          </div>
        )}

        {/* Render Tab Contents */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">กำลังประมวลผลข้อมูลฐานข้อมูล D1...</div>
        ) : activeTab === 'projects' ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
                  <th className="py-4 px-6">ชื่อโครงการ</th>
                  <th className="py-4 px-6">หัวหน้าโครงการ (PI)</th>
                  <th className="py-4 px-6">งบประมาณรวม</th>
                  <th className="py-4 px-6">สถานะ</th>
                  <th className="py-4 px-6 text-right">เครื่องมือ</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400">ไม่พบข้อมูลโครงการวิจัย</td></tr>
                ) : (
                  filteredProjects.map(p => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{p.title}</div>
                        <div className="text-xs text-slate-400 mt-1">ID: {p.id}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{p.leader?.name || 'N/A'}</td>
                      <td className="py-4 px-6 font-bold text-slate-700">{p.budgetInitial.toLocaleString()} บาท</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${p.status === 'ONGOING' ? 'bg-blue-50 text-blue-700' : p.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button onClick={() => { setCurrentProject(p); setShowProjectModal(true); }} className="hover:bg-slate-100 p-2 rounded-lg text-slate-500 hover:text-slate-700 transition-colors" title="แก้ไข"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteProject(p.id)} className="hover:bg-rose-50 p-2 rounded-lg text-slate-400 hover:text-rose-600 transition-colors" title="ลบ"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'researchers' ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
                  <th className="py-4 px-6">รายชื่อ</th>
                  <th className="py-4 px-6">อีเมล</th>
                  <th className="py-4 px-6">รหัสพนักงาน</th>
                  <th className="py-4 px-6">ORCID / Scopus ID</th>
                  <th className="py-4 px-6 text-right">เครื่องมือ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400">ไม่พบรายชื่อนักวิจัย</td></tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{u.titleTh ? `${u.titleTh}${u.firstNameTh} ${u.lastNameTh}` : u.name}</div>
                        <div className="text-xs text-slate-400 mt-1">EN Name: {u.name}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">{u.email}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{u.employeeId || '-'}</td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        <div>ORCID: {u.orcid || '-'}</div>
                        <div className="mt-1">Scopus: {u.scopusAuthorId || '-'}</div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button onClick={() => { setCurrentUser({ ...u, titleEn: u.titleEn || u.title || '', firstNameEn: u.firstNameEn || u.firstName || '', lastNameEn: u.lastNameEn || u.lastName || '' }); fetchPubAuthors(u.id); setShowUserModal(true); }} className="hover:bg-slate-100 p-2 rounded-lg text-slate-500 hover:text-slate-700 transition-colors" title="แก้ไข"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteUser(u.id)} className="hover:bg-rose-50 p-2 rounded-lg text-slate-400 hover:text-rose-600 transition-colors" title="ลบ"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
                  <th className="py-4 px-6">นักวิจัย</th>
                  <th className="py-4 px-6">ฟิลด์ที่เปลี่ยน</th>
                  <th className="py-4 px-6">ค่าเดิม</th>
                  <th className="py-4 px-6">ค่าใหม่</th>
                  <th className="py-4 px-6">วันที่มีผล</th>
                  <th className="py-4 px-6">เหตุผล / บันทึกการเปลี่ยน</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">ยังไม่มีประวัติการแก้ไขข้อมูลนักวิจัย</td></tr>
                ) : (
                  history.map(h => (
                    <tr key={h.id} className="border-b border-slate-100 text-sm">
                      <td className="py-4 px-6 font-bold text-slate-800">{h.userName || 'Unknown'}</td>
                      <td className="py-4 px-6 font-semibold text-blue-600">{h.changedField}</td>
                      <td className="py-4 px-6 text-slate-500 line-through">{h.oldValue || '-'}</td>
                      <td className="py-4 px-6 text-emerald-600 font-bold">{h.newValue || '-'}</td>
                      <td className="py-4 px-6 text-slate-600">{h.effectiveDate}</td>
                      <td className="py-4 px-6 text-slate-600">{h.reason || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* USER MODAL */}
      {showUserModal && currentUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">{currentUser.id ? 'แก้ไขประวัตินักวิจัย' : 'ลงทะเบียนนักวิจัยใหม่'}</h2>
              <button onClick={() => setShowUserModal(false)} className="hover:bg-slate-200 p-1.5 rounded-full"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">คำนำหน้า (ไทย)</label>
                  <input type="text" placeholder="เช่น ผศ.นพ." value={currentUser.titleTh || ''} onChange={e => setCurrentUser({...currentUser, titleTh: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">ชื่อ (ไทย)</label>
                  <input type="text" required value={currentUser.firstNameTh || ''} onChange={e => setCurrentUser({...currentUser, firstNameTh: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">นามสกุล (ไทย)</label>
                  <input type="text" required value={currentUser.lastNameTh || ''} onChange={e => setCurrentUser({...currentUser, lastNameTh: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">คำนำหน้า (EN)</label>
                  <input type="text" placeholder="เช่น Assoc. Prof. Dr." value={currentUser.titleEn || ''} onChange={e => setCurrentUser({...currentUser, titleEn: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">ชื่อ (EN)</label>
                  <input type="text" required value={currentUser.firstNameEn || ''} onChange={e => setCurrentUser({...currentUser, firstNameEn: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">นามสกุล (EN)</label>
                  <input type="text" required value={currentUser.lastNameEn || ''} onChange={e => setCurrentUser({...currentUser, lastNameEn: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">อีเมล</label>
                  <input type="email" required value={currentUser.email || ''} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">รหัสประจำตัวบุคลากร (Employee ID)</label>
                  <input type="text" required value={currentUser.employeeId || ''} onChange={e => setCurrentUser({...currentUser, employeeId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">ORCID ID</label>
                  <input type="text" value={currentUser.orcid || ''} onChange={e => setCurrentUser({...currentUser, orcid: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Scopus ID</label>
                  <input type="text" value={currentUser.scopusAuthorId || ''} onChange={e => setCurrentUser({...currentUser, scopusAuthorId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">WoS Researcher ID</label>
                  <input type="text" value={currentUser.wosResearcherId || ''} onChange={e => setCurrentUser({...currentUser, wosResearcherId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>

              {currentUser.id && (
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-500" /> ผลงานตีพิมพ์ของนักวิจัย (irPublicationAuthor)
                  </h3>
                  {loadingPubs ? (
                    <div className="text-xs text-slate-400">กำลังโหลดรายการบทความ...</div>
                  ) : pubAuthors.length === 0 ? (
                    <div className="text-xs text-slate-400">ไม่มีบทความตีพิมพ์ที่เชื่อมโยงในระบบ</div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {pubAuthors.map(pa => (
                        <div key={pa.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
                          <div className="flex-grow">
                            <div className="font-bold text-slate-700">{pa.publicationTitle}</div>
                            <div className="text-slate-400 mt-0.5">{pa.publicationJournal} ({pa.publicationYear})</div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input 
                              type="text" 
                              value={pa.authorName} 
                              onChange={(e) => {
                                const updated = pubAuthors.map(x => x.id === pa.id ? { ...x, authorName: e.target.value } : x);
                                setPubAuthors(updated);
                              }}
                              className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white w-32"
                            />
                            <button 
                              type="button" 
                              onClick={() => handleUpdatePubAuthor(pa.id, pa.authorName)} 
                              className="p-1 hover:bg-slate-200 rounded text-emerald-600"
                              title="บันทึกชื่อผู้เขียน"
                            >
                              <Check size={14}/>
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleUnlinkPubAuthor(pa.id)} 
                              className="p-1 hover:bg-rose-50 rounded text-rose-500"
                              title="ยกเลิกการเชื่อมโยง"
                            >
                              <X size={14}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentUser.id && (
                <div className="space-y-1 border-t border-slate-100 pt-4">
                  <label className="text-xs font-bold text-red-600">ระบุเหตุผลการขอแก้ไขข้อมูล (เพื่อเก็บลงประวัติ)</label>
                  <input type="text" placeholder="ระบุสาเหตุการแก้ไขประวัติ..." required onChange={e => setCurrentUser({...currentUser, changeReason: e.target.value})} className="w-full px-3 py-2 border border-rose-300 focus:border-rose-500 rounded-lg text-sm bg-rose-50/20" />
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowUserModal(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm transition-colors">ยกเลิก</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-1"><Save size={16}/> บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT MODAL */}
      {showProjectModal && currentProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">{currentProject.id ? 'แก้ไขข้อมูลโครงการวิจัย' : 'เพิ่มโครงการวิจัยใหม่'}</h2>
              <button onClick={() => setShowProjectModal(false)} className="hover:bg-slate-200 p-1.5 rounded-full"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleSaveProject} className="p-6 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">ชื่อโครงการวิจัย</label>
                <input type="text" required value={currentProject.title || ''} onChange={e => setCurrentProject({...currentProject, title: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">ผู้รับผิดชอบโครงการ (PI)</label>
                  <select required value={currentProject.leaderId || ''} onChange={e => setCurrentProject({...currentProject, leaderId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option value="">-- เลือกหัวหน้าโครงการ --</option>
                    {researchers.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.employeeId})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">สถานะการดำเนินโครงการ</label>
                  <select value={currentProject.status || 'ONGOING'} onChange={e => setCurrentProject({...currentProject, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option value="PROPOSED">PROPOSED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="TERMINATED">TERMINATED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">งบประมาณตั้งต้นโครงการ (บาท)</label>
                  <input type="number" required value={currentProject.budgetInitial || 0} onChange={e => setCurrentProject({...currentProject, budgetInitial: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">งบประมาณที่ใช้ไปแล้ว (บาท)</label>
                  <input type="number" value={currentProject.budgetSpent || 0} onChange={e => setCurrentProject({...currentProject, budgetSpent: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">วันเริ่มต้นสัญญา</label>
                  <input type="date" value={currentProject.startDate ? currentProject.startDate.slice(0,10) : ''} onChange={e => setCurrentProject({...currentProject, startDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">วันสิ้นสุดสัญญา</label>
                  <input type="date" value={currentProject.endDate ? currentProject.endDate.slice(0,10) : ''} onChange={e => setCurrentProject({...currentProject, endDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">เลขที่รับรองจริยธรรม (IRB No)</label>
                <input type="text" value={currentProject.irbNo || ''} onChange={e => setCurrentProject({...currentProject, irbNo: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowProjectModal(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm transition-colors">ยกเลิก</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-1"><Save size={16}/> บันทึกโครงการ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
