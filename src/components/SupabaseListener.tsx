"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SupabaseListener() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Global Auth State Observer
        if (event === 'SIGNED_IN' && session) {
           console.log("Global Listener: Authenticated User Session Active");
        } else if (event === 'SIGNED_OUT') {
           localStorage.removeItem('userSession');
           console.log("Global Listener: User Session Purged");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
