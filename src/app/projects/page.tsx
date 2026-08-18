'use client';
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function ProjectsShowroom() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://iram-backend.tinnakornh.workers.dev/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load projects", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูลโครงการวิจัย...</div>;
  }

  // --- Data Processing for Charts ---
  // 1. Growth by Year (Assuming startDate dictates the year)
  const yearlyDataMap: Record<string, any> = {};
  projects.forEach(p => {
    if (!p.startDate) return;
    const year = p.startDate.substring(0, 4);
    if (!yearlyDataMap[year]) {
      yearlyDataMap[year] = { year, budget: 0, count: 0 };
    }
    yearlyDataMap[year].budget += (p.budgetInitial || 0);
    yearlyDataMap[year].count += 1;
  });
  const yearlyData = Object.values(yearlyDataMap).sort((a, b) => a.year.localeCompare(b.year));

  // 2. Status Proportions (Since we don't have fundingCategory in API yet, we'll use status)
  const statusMap: Record<string, number> = {};
  projects.forEach(p => {
    const s = p.status || 'ไม่ระบุ';
    statusMap[s] = (statusMap[s] || 0) + 1;
  });
  const statusData = Object.keys(statusMap).map(k => ({ name: k, value: statusMap[k] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // 3. Summary Stats
  const totalBudget = projects.reduce((sum, p) => sum + (p.budgetInitial || 0), 0);
  const totalProjects = projects.length;

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen font-sans">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-800">📊 โชว์รูมโครงการวิจัย (Research Projects)</h1>
        <p className="text-slate-500 mt-2">ภาพรวมการเติบโตและสัดส่วนทุนวิจัยขององค์กร</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <h3 className="text-slate-500 text-lg font-medium">จำนวนโครงการทั้งหมด</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{totalProjects} <span className="text-xl">โครงการ</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <h3 className="text-slate-500 text-lg font-medium">งบประมาณวิจัยรวม</h3>
          <p className="text-4xl font-bold text-emerald-600 mt-2">
            {(totalBudget / 1000000).toFixed(2)} <span className="text-xl">ล้านบาท</span>
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-6 text-center">📈 การเติบโตของงบประมาณรายปี</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(val) => `${val/1000000}M`} />
                <Tooltip formatter={(value: any) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(value))} />
                <Bar dataKey="budget" name="งบประมาณ (บาท)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-6 text-center">🍩 สัดส่วนสถานะโครงการวิจัย</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-700">รายชื่อโครงการวิจัยล่าสุด</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm">
                <th className="p-4 font-semibold">ชื่อโครงการ</th>
                <th className="p-4 font-semibold">หัวหน้าโครงการ</th>
                <th className="p-4 font-semibold">งบประมาณ</th>
                <th className="p-4 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {projects.slice(0, 10).map((p, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4 max-w-md truncate" title={p.title}>{p.title}</td>
                  <td className="p-4 text-slate-600">{p.leaderName || '-'}</td>
                  <td className="p-4 font-medium text-emerald-600">
                    {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(p.budgetInitial || 0)}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {p.status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 text-center border-t border-slate-100">
          <button className="text-blue-600 font-medium text-sm hover:underline">ดูโครงการทั้งหมด</button>
        </div>
      </div>

    </div>
  );
}
