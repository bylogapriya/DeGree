'use client';

import { useState, useEffect } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [browserSupport, setBrowserSupport] = useState("Checking...");

  useEffect(() => {
    // 1. Check if the browser even supports this
    if (!('beforeinstallprompt' in window)) {
      setBrowserSupport("Not supported on this browser/OS");
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setBrowserSupport("Ready to Install!");
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("Please use your browser menu: 'Add to Home Screen'");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  return (
    <button 
      onClick={handleInstall}
      className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-md border border-purple-100"
    >
      <img src="/logo-degree.png" alt="Logo" className="w-8 h-8" />
      <div className="text-left">
        <p className="text-xs font-bold text-purple-700">Install DeGree</p>
        <p className="text-[8px] uppercase text-gray-400">{browserSupport}</p>
      </div>
    </button>
  );
}