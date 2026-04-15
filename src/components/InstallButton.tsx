'use client';

import { useState, useEffect } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Listen for the install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("✅ PWA Install Prompt is ready!");
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 2. Also check if the app is already installed
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      console.log('🚀 DeGree was installed!');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback: If the code missed the event, use the browser menu
      alert("Please tap the three dots (⋮) in Chrome and select 'Install App'");
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // The button only shows if the browser says it's okay to install
  if (!deferredPrompt) return null;

  return (
    <button 
      onClick={handleInstall}
      className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-xl border-2 border-purple-500 animate-bounce"
    >
      <img src="/logo-degree.png" alt="Logo" className="w-10 h-10" />
      <div className="text-left">
        <p className="text-sm font-black text-purple-700">DOWNLOAD APP</p>
        <p className="text-[10px] text-gray-500">Add DeGree to Home Screen</p>
      </div>
    </button>
  );
}