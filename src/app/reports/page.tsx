'use client';
import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Wallet, TrendingUp, Award, Flame, Star, AlertTriangle, ChevronRight, Loader2, PieChart as PieIcon } from 'lucide-react';

export default function ExecutiveDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://iram-backend.tinnakornh.workers.dev/api/projects')
      .then(res => res.json())
      .then(data => {
        // Handle double array if api returns it, else just data
        const items = Array.isArray(data) ? data : [];
        setProjects(items);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch projects', err);
        setLoading(false);
      });
  }, []);

  // --- 🔴 LIVE DATA CALCULATIONS ---
  const totalFunding = projects.reduce((sum, p) => sum + (p.budgetInitial || 0), 0);
  const totalBurn = projects.reduce((sum, p) => sum + (p.budgetSpent || 0), 0);
  const burnRate = totalFunding > 0 ? Math.round((totalBurn / totalFunding) * 100) : 0;
  
  // Determine trend (mocked for now since we don't have historical snapshot in DB yet)
  const fundingTrend = "+15%";

  // Find delayed/risky projects from live data
  const liveRiskProjects = projects
    .filter(p => p.status === 'DELAYED' || (p.budgetSpent || 0) < ((p.budgetInitial || 1) * 0.2))
    .slice(0, 5)
    .map(p => ({
      id: p.id ? p.id.toString().substring(0, 12) : 'N/A',
      name: p.title || 'Untitled',
      status: p.status === 'DELAYED' ? 'ล่าช้า' : 'เบิกจ่ายต่ำ',
      action: 'ติดตามผล'
    }));

  // --- 🟡 MOCK DATA FOR MVP (Pending Backend Support) ---
  const yearlyData = [
    { year: '2024', budget: 120, burn: 110 },
    { year: '2025', budget: 150, burn: 135 },
    { year: '2026', budget: Math.round(totalFunding / 1000000) || 200, burn: Math.round(totalBurn / 1000000) || 120 },
  ];

  const strategyData = [
    { name: 'การแพทย์แม่นยำ', value: 45 },
    { name: 'สังคมผู้สูงอายุ', value: 30 },
    { name: 'นวัตกรรมอุปกรณ์', value: 25 },
  ];
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  const topResearchers = [
    { rank: 1, name: 'ศ.ดร. นพ. สมชาย รักวิจัย', role: 'Senior', fund: '15.2M', trend: '+12%' },
    { rank: 2, name: 'ผศ.ดร. หญิง ใจดี', role: 'Mid-Career', fund: '8.5M', trend: '+5%' },
    { rank: 3, name: 'อ.ดร. ขยัน สุดยอด', role: 'Early-Career', fund: '4.1M', trend: '+20%' },
  ];

  const riskProjects = [
    { id: 'RES-2024-001', name: 'การพัฒนา AI วิเคราะห์ภาพถ่ายรังสี', status: 'ล่าช้า (เบิกจ่าย 15%)', action: 'เรียกดูรายงาน' },
    { id: 'RES-2024-042', name: 'หุ่นยนต์ช่วยผ่าตัดขนาดจิ๋ว', status: 'ใกล้หมดสัญญา', action: 'ติดตามผล' },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-8 font-sans flex justify-center items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      {/* macOS Window Wrapper */}
      <div className="bg-white/95 backdrop-blur-2xl w-full max-w-7xl rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] overflow-hidden border border-white/40 ring-1 ring-slate-900/5">
        
        {/* macOS Title Bar */}
        <div className="bg-gradient-to-b from-slate-50/80 to-slate-100/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 flex items-center shadow-sm">
          <div className="flex space-x-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-inner"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-inner"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-inner"></div>
          </div>
          <div className="mx-auto text-xs font-semibold tracking-wide text-slate-500 uppercase flex items-center gap-2">
             iRAM Executive Workspace
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8 md:p-10">
          
          {/* Header */}
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                ภาพรวมการลงทุนด้านวิจัย
              </h1>
              <p className="text-slate-500 mt-2 font-medium text-lg">ข้อมูลเชิงยุทธศาสตร์และประสิทธิผล ประจำปี 2026</p>
            </div>
            <button className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg">
              ดาวน์โหลดรายงาน <ChevronRight size={16} />
            </button>
          </div>

          {/* Top Row: Quick KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* KPI 1 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)] transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wallet size={80} color="#10b981" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
                {loading ? <Loader2 size={24} className="animate-spin" /> : <Wallet size={24} />}
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Total Funding</p>
              <h3 className="text-4xl font-extrabold text-slate-800">฿{(totalFunding / 1000000).toFixed(1)}<span className="text-xl text-slate-400">M</span></h3>
              <p className="text-sm font-bold text-emerald-500 mt-3 flex items-center gap-1">
                <TrendingUp size={16} /> {fundingTrend} จากปีที่แล้ว
              </p>
            </div>
            
            {/* KPI 2 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={80} color="#3b82f6" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-inner">
                <TrendingUp size={24} />
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Leverage Ratio</p>
              <h3 className="text-4xl font-extrabold text-slate-800">1 <span className="text-2xl text-slate-400">:</span> 4.2</h3>
              <p className="text-sm font-medium text-slate-500 mt-3">
                ทุก 1 บาท ดึงทุนนอกได้ 4.2 บาท
              </p>
            </div>

            {/* KPI 3 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(99,102,241,0.12)] transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award size={80} color="#6366f1" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-inner">
                <Award size={24} />
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">ROI (Cost/Pub)</p>
              <h3 className="text-4xl font-extrabold text-slate-800">฿850<span className="text-xl text-slate-400">k</span></h3>
              <p className="text-sm font-medium text-slate-500 mt-3">
                ต่อ 1 บทความ Q1-Q2
              </p>
            </div>

            {/* KPI 4 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(244,63,94,0.12)] transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Flame size={80} color="#f43f5e" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-inner">
                {loading ? <Loader2 size={24} className="animate-spin" /> : <Flame size={24} />}
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Burn Rate</p>
              <h3 className="text-4xl font-extrabold text-slate-800">{burnRate}%</h3>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-400 to-rose-600 h-2 rounded-full" style={{ width: `${burnRate}%` }}></div>
              </div>
            </div>
          </div>

          {/* Middle Row: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            
            {/* Trend Chart */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" /> แนวโน้มงบประมาณ vs เบิกจ่าย
                </h3>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} dy={10}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} tickFormatter={(v)=>`${v}M`}/>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', color: '#475569' }} />
                    <Line type="monotone" name="งบประมาณที่ได้ (Budget)" dataKey="budget" stroke="#10b981" strokeWidth={4} dot={{r: 5, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 7, strokeWidth: 0}} />
                    <Line type="monotone" name="เบิกจ่ายจริง (Burn Rate)" dataKey="burn" stroke="#f43f5e" strokeWidth={4} dot={{r: 5, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 7, strokeWidth: 0}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strategic Alignment Chart */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PieIcon className="text-blue-500" size={24} /> สัดส่วนยุทธศาสตร์
              </h3>
              <div className="flex-grow flex items-center justify-center min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={strategyData} cx="50%" cy="50%" innerRadius={85} outerRadius={120} paddingAngle={4} dataKey="value" stroke="none">
                      {strategyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontWeight: 'bold', fontSize: '14px', color: '#334155' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Bottom Row: Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Top Rainmakers */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Star className="text-amber-500 fill-amber-500" size={20} /> Top Rainmakers
                </h3>
              </div>
              <div className="p-4">
                {topResearchers.map(r => (
                  <div key={r.rank} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${r.rank === 1 ? 'bg-amber-100 text-amber-600' : r.rank === 2 ? 'bg-slate-200 text-slate-600' : 'bg-orange-100 text-orange-600'}`}>
                        #{r.rank}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">{r.name}</p>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full mt-1.5 inline-block">{r.role}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-emerald-600 text-lg">{r.fund}</p>
                      <p className="text-xs font-bold text-emerald-500 mt-1">{r.trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Watchlist */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-400 to-rose-600"></div>
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center mt-1">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="text-rose-500" size={20} /> Risk Watchlist
                </h3>
              </div>
              <div className="p-4">
                {loading ? (
                  <div className="p-4 text-center text-slate-400 text-sm">กำลังโหลดข้อมูลโครงการเฝ้าระวัง...</div>
                ) : (liveRiskProjects.length > 0 ? liveRiskProjects : riskProjects).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 hover:bg-rose-50/50 rounded-2xl transition-all border border-transparent hover:border-rose-100 group cursor-pointer">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{p.id}</span>
                        <span className="text-[11px] bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-bold tracking-wide">{p.status}</span>
                      </div>
                      <p className="font-bold text-slate-700 text-base group-hover:text-rose-600 transition-colors">{p.name}</p>
                    </div>
                    <button className="text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl transition-all shadow-sm">
                      {p.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
