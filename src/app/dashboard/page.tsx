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

  const semesters = [
    { id: 1, title: <span>Sem <span className="font-mono">1</span></span> },
    { id: 2, title: <span>Sem <span className="font-mono">2</span></span> },
    { id: 3, title: <span>Sem <span className="font-mono">3</span></span> },
    { id: 4, title: <span>Sem <span className="font-mono">4</span></span> },
    { id: 5, title: <span>Sem <span className="font-mono">5</span></span> },
    { id: 6, title: <span>Sem <span className="font-mono">6</span></span> },
  ];

  const categories = [
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'pyqs', label: 'PYQs', icon: '📄' },
    { id: 'links', label: 'Links', icon: '🔗' },
    { id: 'cheatsheets', label: 'Cheat Sheets', icon: '⚡' },
  ];

  // Load user's department from local storage on mount
  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem('userSession');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.name) setUserName(session.name);
        if (session.department) {
          setViewingDept(session.department);
        }
      }
    } catch (e) {
      console.error("Error loading session:", e);
    }
  }, []);

  // Define fetchResources using useCallback so it can be used in useEffect safely
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
        
      if (selectedCategory === 'pyqs') {
        query = query.eq('exam_type', pyqType); // Ensure column name matches your DB (exam_type)
      }

      const { data, error: supabaseError } = await query.order('created_at', { ascending: false });

      if (supabaseError) {
        console.error("Database fetch error:", supabaseError.message);
        setResources([]);
      } else {
        setResources(data || []);
      }
    } catch (err) {
      console.error("Unexpected error during fetch:", err);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [viewingDept, selectedSemester, selectedCategory, pyqType]);

  // Trigger fetch when any filter changes
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const filteredResources = resources.filter(res => 
    res.title && res.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-0">
      <header className="mb-12">
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700 px-1">
           <h1 className="text-5xl font-black text-[#9061CB] tracking-tighter">
             Welcome,
           </h1>
           <p className="text-2xl font-bold text-v-text tracking-tight mt-1 capitalize">
             {userName || 'Student'}
           </p>
        </div>

        {!isSwitchingDept ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h1 className="text-4xl font-black text-v-text tracking-tighter">
              <span className="text-v-magenta font-black mr-2 drop-shadow-sm">{viewingDept || 'Department'} •</span>
              Vault
            </h1>
            <button 
                onClick={() => setIsSwitchingDept(true)}
                className="w-fit text-[10px] px-8 py-3 bg-white/40 backdrop-blur-md border-2 border-v-blue/30 text-v-text rounded-full font-black uppercase tracking-widest hover:bg-v-blue/20 transition-all shadow-sm hover:shadow-md"
            >
              Swap Department
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <select 
              value={viewingDept} 
              onChange={(e) => {
                setViewingDept(e.target.value);
                setIsSwitchingDept(false);
                setSelectedSemester(null);
                setSelectedCategory(null);
              }}
              className="text-xl md:text-2xl font-black text-v-text tracking-tighter bg-white border-4 border-v-lavender rounded-[32px] py-4 px-10 shadow-2xl shadow-v-lavender/30 outline-none"
            >
              <option value="" disabled>Select Department</option>
              {allDepartments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button 
              onClick={() => setIsSwitchingDept(false)}
              className="w-fit text-xs px-10 py-5 bg-v-peach text-v-text font-black rounded-full hover:opacity-80 transition-opacity uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Persistent Bubbly Semester Selector */}
        <div className="flex flex-wrap items-center gap-3 bg-white/30 backdrop-blur-xl p-3 rounded-[40px] border-2 border-v-blue/20 shadow-inner">
          {semesters.map((sem) => (
            <button
              key={sem.id}
              onClick={() => {
                setSelectedSemester(sem.id);
                if (!selectedCategory) setSelectedCategory('notes'); // Default to notes
              }}
              className={`px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 cursor-pointer flex-1 min-w-[120px] ${
                selectedSemester === sem.id 
                  ? 'bg-v-lavender text-v-text border-2 border-v-white' 
                  : 'bg-v-white text-v-text/60 border-2 border-v-blue/10 hover:border-v-lavender/50'
              }`}
            >
              {sem.title}
            </button>
          ))}
        </div>
      </header>

      {!selectedSemester ? (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-white/20 backdrop-blur-3xl rounded-[40px] border-4 border-white border-dashed">
            <span className="text-6xl mb-6">📂</span>
            <h2 className="text-3xl font-black text-v-text tracking-tighter mb-2">Initialize Knowledge Stream</h2>
            <p className="text-v-text/40 font-black text-xs uppercase tracking-[0.2em]">Select a semester above to begin the extraction.</p>
        </div>
      ) : (
        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-500">
          
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-v-text tracking-tighter">
                Semester <span className="font-mono text-v-magenta">{selectedSemester}</span> Content
              </h1>
              <p className="text-v-text/40 font-black text-[10px] uppercase tracking-[0.3em] mt-2 px-1">Vault Resources</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-v-blue text-xl">🔍</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search here..."
                className="w-full pl-14 pr-7 py-5 bg-white border-2 border-v-blue/20 text-v-text rounded-full focus:ring-8 focus:ring-v-lavender/10 outline-none shadow-inner transition-all font-black text-sm"
              />
            </div>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-8 rounded-[40px] border-4 transition-all duration-500 transform hover:scale-[1.05] cursor-pointer shadow-2xl ${
                  selectedCategory === cat.id 
                    ? 'border-v-lavender bg-v-lavender text-v-text shadow-v-lavender/50' 
                    : 'border-white bg-white/60 text-v-text/40 backdrop-blur-xl hover:border-v-blue'
                }`}
              >
                <span className="text-4xl mb-3 drop-shadow-xl">{cat.icon}</span>
                <span className="font-black text-[10px] uppercase tracking-widest">{cat.label}</span>
              </button>
            ))}
          </div>

          {selectedCategory === 'pyqs' && (
            <div className="mb-10 flex bg-white/40 backdrop-blur-xl p-2 rounded-full w-fit mx-auto md:mx-0 shadow-inner border-2 border-v-blue/10">
              {(['ESE', 'CIA'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setPyqType(type)}
                  className={`px-12 py-4 rounded-full font-black transition-all text-[10px] uppercase tracking-widest ${
                    pyqType === type ? 'bg-v-lavender text-v-text shadow-xl' : 'text-v-text/40 hover:text-v-text'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          {selectedCategory && (
            <div className="bg-white/50 backdrop-blur-[60px] rounded-[48px] shadow-2xl shadow-v-blue/10 border-4 border-white p-12 min-h-[400px] transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 w-80 h-80 bg-v-lavender/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <h3 className="text-3xl font-black text-v-text mb-12 flex items-center gap-5 relative z-10 tracking-tighter">
                <span className="w-14 h-14 rounded-3xl bg-v-blue/20 flex items-center justify-center shadow-inner text-2xl">⚡</span>
                {categories.find(c => c.id === selectedCategory)?.label} 
                {selectedCategory === 'pyqs' ? ` • ${pyqType} Series` : ''} 
              </h3>
              
              {isLoadingFiles ? (
                <div className="flex flex-col items-center justify-center p-20 animate-breathe">
                  <p className="text-v-text/40 font-black uppercase tracking-[0.3em] text-xs">Decrypting Vault Assets...</p>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center opacity-40">
                  <div className="w-20 h-20 bg-v-blue/10 rounded-full flex items-center justify-center text-5xl mb-6">🌌</div>
                  <p className="text-v-text font-black text-sm uppercase tracking-widest">Sector Empty</p>
                  <p className="text-v-text/60 text-xs mt-2 font-black">Waiting for initial contribution...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 relative z-10">
                  {filteredResources.map((file) => (
                    <FileCard 
                      key={file.id} 
                      id={file.id} 
                      filename={file.title} 
                      url={file.url || file.file_url} 
                      filePath={file.file_path || file.path}
                      externalLink={file.external_link}
                      onDeleted={(deletedId) => setResources(prev => prev.filter(r => r.id !== deletedId))}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}