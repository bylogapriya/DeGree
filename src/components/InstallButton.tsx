'use client';

import { useState, useEffect } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <button 
      onClick={handleInstall}
      className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-lg border border-purple-100 hover:scale-105 transition-transform"
    >
      <img src="/logo-degree.png" alt="Logo" className="w-12 h-12 mb-2" />
      <span className="text-sm font-semibold text-purple-700">Add to Home Screen</span>
    </button>
  );
}