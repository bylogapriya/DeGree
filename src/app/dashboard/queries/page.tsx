"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import QueriesManager from '@/components/Queries';

export default function QueriesPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || null);
      setLoading(false);
    }
    getUser();
  }, []);

  if (loading) return <div className="p-10 animate-pulse text-center">Loading Support...</div>;
  if (!userEmail) return <div className="p-10 text-center">Please login to continue.</div>;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-v-text tracking-tighter">Help & Support</h1>
        <p className="text-v-text/60 font-black text-xs uppercase tracking-widest mt-2 leading-relaxed max-w-2xl">
          Have a fresh idea for the app, a glitch to report, or need a post removed? Just open a ticket and our admin will help you tidy things up!
        </p>
      </header>
      
      {/* This is where the actual logic happens */}
      <QueriesManager userEmail={userEmail} />
    </div>
  );
}