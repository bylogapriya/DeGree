"use client";

import { useState, useEffect, useCallback } from 'react';
import FileCard from '@/components/FileCard';
import { supabase } from '@/lib/supabaseClient';
import { DEPARTMENTS } from '@/lib/constants';

export default function DepartmentPage() {
  const [viewingDept, setViewingDept] = useState<string>('');
  const [isSwitchingDept, setIsSwitchingDept] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pyqType, setPyqType] = useState<'ESE' | 'CIA'>('ESE');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [resources, setResources] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [userName, setUserName] = useState<string>('');

  const allDepartments = DEPARTMENTS;

  const semesters = [1, 2, 3, 4, 5, 6].map(num => ({ 
    id: num, 
    title: <span>Sem <span className="font-mono">{num}</span></span> 
  }));

  const categories = [
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'pyqs', label: 'PYQs', icon: '📄' },
    { id: 'links', label: 'Links', icon: '🔗' },
    { id: 'cheatsheets', label: 'Cheat Sheets', icon: '⚡' },
  ];

  useEffect(() => {
    const sessionStr = localStorage.getItem('userSession');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.name) setUserName(session.name);
      if (session.department) setViewingDept(session.department);
    }
  }, []);

  const fetchResources = useCallback(async () => {
    if (!viewingDept || !selectedSemester || !selectedCategory) return;
    
    setIsLoadingFiles(true);
    const categoryLabel = categories.find(c => c.id === selectedCategory)?.label;
    
    try {
      let query = supabase
        .from('resources')
        .select('*')
        .eq('department', viewingDept)
        .eq('semester', selectedSemester)
        .eq('category', categoryLabel);
        
      // FIXED: Swapped 'exam_type' out to target the correct database column 'pyq_type'
      if (selectedCategory === 'pyqs') {
        query = query.eq('pyq_type', pyqType); 
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setResources([]);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [viewingDept, selectedSemester, selectedCategory, pyqType]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const filteredResources = resources.filter(res => 
    res.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 pb-20">
      <header className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="animate-in fade-in slide-in-from-left duration-700">
             <h1 className="text-5xl font-black text-[#9061CB] tracking-tighter">
               Welcome,
             </h1>
             <p className="text-2xl font-bold text-v-text tracking-tight mt-1 capitalize">
               {userName || 'Student'}
             </p>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-6 border-2 border-v-blue/10 shadow-sm mb-8">
          {!isSwitchingDept ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-3xl font-black text-v-text tracking-tighter">
                <span className="text-v-magenta mr-2">{viewingDept || 'Select Dept'} •</span>
                Vault
              </h2>
              <button 
                onClick={() => setIsSwitchingDept(true)}
                className="text-[10px] px-6 py-2 bg-white/60 border border-v-blue/20 rounded-full font-black uppercase tracking-widest hover:bg-v-lavender transition-all shadow-sm"
              >
                Change Department
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4">
              <select 
                value={viewingDept} 
                onChange={(e) => {
                  setViewingDept(e.target.value);
                  setIsSwitchingDept(false);
                }}
                className="flex-1 font-black text-v-text bg-white border-2 border-v-lavender rounded-2xl py-3 px-6 outline-none"
              >
                {allDepartments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <button onClick={() => setIsSwitchingDept(false)} className="text-xs px-6 py-3 bg-v-peach text-v-text font-black rounded-full uppercase tracking-widest">
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-white/20 p-2 rounded-[30px] border border-white/40 shadow-inner overflow-x-auto">
          {semesters.map((sem) => (
            <button
              key={sem.id}
              onClick={() => {
                setSelectedSemester(sem.id);
                if (!selectedCategory) setSelectedCategory('notes');
              }}
              className={`px-6 py-4 rounded-[22px] font-black text-[10px] uppercase tracking-widest transition-all flex-1 min-w-[100px] ${
                selectedSemester === sem.id 
                  ? 'bg-[#9061CB] text-white shadow-lg scale-105' 
                  : 'bg-white/60 text-v-text/60 hover:bg-white'
              }`}
            >
              {sem.title}
            </button>
          ))}
        </div>
      </header>

      {!selectedSemester ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/10 backdrop-blur-md rounded-[48px] border-2 border-white/20 border-dashed">
            <span className="text-7xl mb-6">📂</span>
            <h2 className="text-2xl font-black text-v-text tracking-tighter">Access the Knowledge Stream</h2>
            <p className="text-v-text/40 text-[10px] uppercase tracking-[0.2em] mt-2">Pick a semester to unlock your resources.</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h3 className="text-3xl font-black text-v-text tracking-tighter">
              Semester <span className="text-v-magenta">{selectedSemester}</span>
            </h3>
            
            <div className="relative w-full md:w-80 group">
              <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-v-blue transition-transform group-focus-within:scale-110">🔍</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a file..."
                className="w-full pl-12 pr-6 py-4 bg-white/80 border-2 border-v-blue/10 rounded-full focus:border-v-lavender outline-none shadow-sm font-black text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-4 p-5 rounded-[28px] border-2 transition-all duration-300 ${
                  selectedCategory === cat.id 
                    ? 'border-[#9061CB] bg-white text-v-text shadow-xl' 
                    : 'border-white/50 bg-white/30 text-v-text/50 hover:bg-white/50'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-black text-[10px] uppercase tracking-widest">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-white/60 backdrop-blur-2xl rounded-[40px] border-4 border-white p-8 md:p-12 shadow-2xl relative min-h-[400px]">
             {isLoadingFiles ? (
               <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                  <div className="w-12 h-12 border-4 border-v-lavender border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-v-text/40 font-black text-[10px] uppercase tracking-widest">Decrypting Files...</p>
               </div>
             ) : filteredResources.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <span className="text-5xl mb-4">🌌</span>
                  <p className="text-v-text font-black text-xs uppercase tracking-widest">No resources found in this sector</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-4">
                 {filteredResources.map((file) => (
                   <FileCard 
                     key={file.id} 
                     id={file.id} 
                     filename={file.title} 
                     url={file.file_url} 
                     filePath={file.file_path} 
                     externalLink={file.external_link} 
                     onDeleted={(id) => setResources(prev => prev.filter(r => r.id !== id))}
                   />
                 ))}
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}