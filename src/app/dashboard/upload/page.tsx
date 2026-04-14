"use client";

import { useState } from 'react';
import UploadModal from '@/components/UploadModal';

export default function UploadPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1e3a8a] tracking-tight mb-2">Upload Resources</h1>
        <p className="text-slate-600 text-lg">Contribute notes, assignments, and past papers to the vault.</p>
      </header>
      
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-2xl bg-white text-slate-500">
        <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Ready to contribute?</h3>
        <p className="mb-6 max-w-md text-center">Open the upload dialog to select your file and tag it with the correct department and semester metadata.</p>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#1e3a8a] text-white hover:bg-[#152c6e] rounded-xl font-semibold shadow-md transition-all hover:scale-105"
        >
          Open Upload Modal
        </button>
      </div>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
