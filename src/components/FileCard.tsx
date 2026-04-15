"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface FileCardProps {
  id: string; 
  filename: string;
  url: string;
  filePath?: string; 
  externalLink?: string; 
  onDeleted?: (id: string) => void;
}

export default function FileCard({ id, filename, url, filePath, externalLink, onDeleted }: FileCardProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const sessionStr = localStorage.getItem('userSession');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.email === 'logapriya0k@gmail.com') {
          setIsAdmin(true);
        }
      } catch (e) {}
    }
  }, []);

  // 1. TRACKING LOGIC (Shared by both buttons)
  const trackDownload = () => {
    supabase.rpc('increment_download_count', { resource_id: id })
      .then(({ error }) => {
        if (error) {
          supabase.from('resources').select('download_count').eq('id', id).single()
            .then(({ data }) => {
              supabase.from('resources').update({ download_count: (data?.download_count || 0) + 1 }).eq('id', id);
            });
        }
      });
  };

  // 2. PREVIEW ACTION
  const handlePreview = () => {
    const targetUrl = externalLink || url;
    if (!targetUrl) return;
    trackDownload();
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // 3. FORCE DOWNLOAD ACTION
  const handleDownload = async () => {
    const targetUrl = externalLink || url;
    if (!targetUrl) return;
    trackDownload();

    if (externalLink) {
      window.open(targetUrl, '_blank');
      return;
    }

    try {
      // Fetching as blob forces the "Save As" dialog instead of just opening the tab
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback if CORS prevents blob download
      window.location.href = targetUrl;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (filePath) {
        await supabase.storage.from('vault-assets').remove([filePath]);
      }
      const { error: dbError } = await supabase.from('resources').delete().eq('id', id);
      if (dbError) throw dbError;
      setIsConfirmDeleteOpen(false);
      if (onDeleted) onDeleted(id);
    } catch (error) {
      alert("Error securely deleting the item.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between p-6 mb-4 border-2 border-v-blue/20 rounded-[32px] bg-white/40 backdrop-blur-xl hover:border-v-lavender transition-all shadow-md group gap-4">
        
        <div className="flex items-center gap-4 overflow-hidden w-full md:w-auto">
          <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl shadow-inner ${externalLink ? 'bg-v-magenta/20 text-v-magenta' : 'bg-v-blue/20 text-v-blue'}`}>
            {externalLink ? '🔗' : '📄'}
          </div>
          <span className="font-black text-v-text tracking-tighter truncate text-sm" title={filename}>{filename}</span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {isAdmin && (
            <button 
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="p-3 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}

          {/* PREVIEW BUTTON */}
          <button 
            onClick={handlePreview}
            className="px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-white/60 text-v-text border-2 border-v-blue/10 hover:bg-white transition-all shadow-sm"
          >
            Preview
          </button>

          {/* DOWNLOAD / OPEN BUTTON */}
          <button 
            onClick={handleDownload}
            className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 ${
              externalLink 
                ? 'text-v-text bg-v-lavender shadow-v-lavender/30' 
                : 'text-v-text bg-v-blue shadow-v-blue/30'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {externalLink 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              }
            </svg>
            <span>{externalLink ? 'Open Link' : 'Download'}</span>
          </button>
        </div>
      </div>

      {/* Delete Modal remains the same... */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-v-text/20 backdrop-blur-3xl p-4">
          <div className="w-full max-w-sm bg-white rounded-[32px] p-10 shadow-3xl border-4 border-v-pink/40">
            <h3 className="text-3xl font-black text-v-text tracking-tighter mb-2">Secure Wipe?</h3>
            <p className="text-v-text/40 font-black text-[10px] uppercase tracking-widest mb-8">Permanently expunge this asset.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsConfirmDeleteOpen(false)} className="px-6 py-3 text-v-text/40 font-black text-[10px] uppercase">Wait</button>
              <button onClick={handleDelete} className="px-8 py-3 text-white bg-v-pink rounded-xl font-black uppercase text-[10px] shadow-lg shadow-v-pink/30">
                {isDeleting ? 'Erasing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}