"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DEPARTMENTS } from '@/lib/constants';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [resourceName, setResourceName] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [externalLink, setExternalLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dept, setDept] = useState('');
  const [semester, setSemester] = useState('');
  const [category, setCategory] = useState('');
  const [pyqType, setPyqType] = useState('CIA');
  const [isUploading, setIsUploading] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSessionUser(user);
    };
    if (isOpen) checkUser();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation
    if (!resourceName || !dept || !semester || !category) {
      alert("Please fill in all details.");
      return;
    }

    if (uploadType === 'file' && !file) {
      alert("Please select a file to upload.");
      return;
    }

    if (uploadType === 'link' && !externalLink) {
      alert("Please provide an external link.");
      return;
    }

    setIsUploading(true);

    try {
      // 2. Verify Session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert("Session expired. Please log in again.");
        setIsUploading(false);
        window.location.href = "/login";
        return;
      }

      let fileUrl = '';
      let filePathInStorage = '';

      // 3. Handle File Upload to Storage
      if (uploadType === 'file' && file) {
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const deptSlug = dept.toLowerCase().replace(/\s+/g, '');
        filePathInStorage = `${deptSlug}/sem${semester}/${Date.now()}_${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from('vault-assets')
          .upload(filePathInStorage, file);

        if (uploadError) throw uploadError;

        // Generate Public URL
        const { data: publicUrlData } = supabase.storage
          .from('vault-assets')
          .getPublicUrl(filePathInStorage);

        fileUrl = publicUrlData.publicUrl;
      }

      // 4. Prepare Database Payload
      const recordPayload: any = {
        title: resourceName,
        department: dept,
        semester: parseInt(semester, 10),
        category: category,
        uploader_email: user.email,
        download_count: 0, // Initialize stats
      };

      if (uploadType === 'file') {
        recordPayload.file_url = fileUrl;
        recordPayload.file_path = filePathInStorage;
        recordPayload.external_link = null;
      } else {
        recordPayload.external_link = externalLink;
        recordPayload.file_url = null;
        recordPayload.file_path = null;
      }

      if (category === 'PYQs') {
        recordPayload.pyq_type = pyqType;
      }

      // 5. Insert into Database
      const { error: dbError } = await supabase
        .from('resources')
        .insert([recordPayload]);

      if (dbError) throw dbError;

      alert("Resource successfully added to the vault!");
      onClose();
      
      // Reset form states
      setResourceName('');
      setFile(null);
      setExternalLink('');
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert("Upload error: " + (error.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-v-blue/40 backdrop-blur-xl p-4 text-v-text">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border-4 border-v-blue/20 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-7 border-b border-v-blue/10 bg-v-white/80">
          <h2 className="text-2xl font-black text-v-text">Vault Deposit</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!sessionUser && (
            <div className="p-4 bg-v-pink/20 border border-v-pink/40 rounded-2xl text-v-text text-sm font-black mb-4">
              ⚠️ Please <a href="/login" className="underline decoration-v-pink/60">Sign In</a> to contribute.
            </div>
          )}

          <div>
            <label className="block text-sm font-black text-v-text ml-1 mb-2">Resource Title</label>
            <input 
              type="text" 
              value={resourceName || ""} 
              onChange={(e) => setResourceName(e.target.value)}
              placeholder="e.g. Sampling Theory Notes"
              className="w-full rounded-2xl border-2 border-v-blue/30 px-5 py-4 outline-none focus:ring-4 focus:ring-v-lavender/20 transition-all font-black text-v-text"
              required
            />
          </div>

          <div className="flex bg-v-white p-1.5 rounded-2xl border border-v-blue/20">
            <button
              type="button"
              onClick={() => setUploadType('file')}
              className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${uploadType === 'file' ? 'bg-v-lavender text-v-text shadow-lg' : 'text-v-text/40 hover:bg-v-blue/10'}`}
            >Upload File</button>
            <button
              type="button"
              onClick={() => setUploadType('link')}
              className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${uploadType === 'link' ? 'bg-v-lavender text-v-text shadow-lg' : 'text-v-text/40 hover:bg-v-blue/10'}`}
            >External Link</button>
          </div>

          {uploadType === 'file' ? (
            <div>
              <label className="block text-sm font-black text-v-text ml-1 mb-2">Select File</label>
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-v-text/60 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-2 file:border-v-blue/20 file:text-xs file:font-black file:bg-v-white file:text-v-text hover:file:bg-v-blue/10 transition-all"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-black text-v-text ml-1 mb-2">External Content Link</label>
              <input 
                type="url" 
                value={externalLink || ""} 
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full rounded-2xl border-2 border-v-blue/30 px-5 py-4 outline-none focus:ring-4 focus:ring-v-lavender/20 transition-all font-black text-v-text"
                required={uploadType === 'link'}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-black text-v-text ml-1 mb-1">Department</label>
            <select 
              value={dept || ""} 
              onChange={(e) => setDept(e.target.value)}
              className="w-full rounded-2xl border-2 border-v-blue/30 px-5 py-4 outline-none focus:ring-4 focus:ring-v-lavender/20 transition-all font-black text-v-text appearance-none bg-white/50"
            >
              <option value="" disabled>Select Department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-black text-v-text ml-1 mb-1">Semester</label>
              <select 
                value={semester || ""} 
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-2xl border-2 border-v-blue/30 px-5 py-4 outline-none focus:ring-4 focus:ring-v-lavender/20 transition-all font-black text-v-text appearance-none bg-white/50"
              >
                <option value="" disabled>Select</option>
                {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-v-text ml-1 mb-1">Category</label>
              <select 
                value={category || ""} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border-2 border-v-blue/30 px-5 py-4 outline-none focus:ring-4 focus:ring-v-lavender/20 transition-all font-black text-v-text appearance-none bg-white/50"
              >
                <option value="" disabled>Select</option>
                <option value="Notes">Notes</option>
                <option value="PYQs">PYQs</option>
                <option value="Cheat Sheets">Cheat Sheets</option>
                <option value="Links">Links</option>
              </select>
            </div>
          </div>

          {category === 'PYQs' && (
            <div className="flex gap-4 p-4 bg-v-blue/10 rounded-2xl border border-v-blue/20">
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-2xl hover:bg-white/40 transition-colors">
                <input type="radio" value="CIA" checked={pyqType === 'CIA'} onChange={(e) => setPyqType(e.target.value)} className="w-5 h-5 text-v-lavender focus:ring-v-lavender" />
                <span className="text-sm font-black text-v-text">CIA</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-2xl hover:bg-white/40 transition-colors">
                <input type="radio" value="ESE" checked={pyqType === 'ESE'} onChange={(e) => setPyqType(e.target.value)} className="w-5 h-5 text-v-lavender focus:ring-v-lavender" />
                <span className="text-sm font-black text-v-text">ESE</span>
              </label>
            </div>
          )}

          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isUploading} className="px-8 py-4 text-v-text font-black bg-white border-2 border-v-blue/20 rounded-2xl hover:bg-v-white transition-colors">Cancel</button>
            <button 
              type="submit" 
              disabled={isUploading || !sessionUser} 
              className={`px-10 py-4 bg-v-lavender text-v-text font-black rounded-2xl shadow-2xl shadow-v-lavender/40 transition-all ${isUploading ? 'animate-breathe opacity-80' : 'hover:scale-[1.05] hover:shadow-v-lavender/60 active:scale-95'}`}
            >
              {isUploading ? "Depositing..." : "Deposit Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}