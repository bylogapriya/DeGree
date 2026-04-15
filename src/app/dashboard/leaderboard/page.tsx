"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface LeaderboardEntry {
  email: string;
  count: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userDept, setUserDept] = useState<string>('');

  // 1. Load the user's department from the session first
  useEffect(() => {
    const sessionStr = localStorage.getItem('userSession');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.department) {
        setUserDept(session.department);
      }
    }
  }, []);

  const fetchLeaderboardData = useCallback(async () => {
    // Wait until we have the department to filter by
    if (!userDept) return;

    try {
      setIsLoading(true);
      
      // 2. Fetch uploader emails ONLY for resources in the user's department
      const { data, error } = await supabase
        .from('resources')
        .select('uploader_email')
        .eq('department', userDept); // <--- CRITICAL FILTER

      if (error) throw error;
      if (!data) return;

      // 3. Group by email and count total uploads
      const counts = data.reduce((acc: Record<string, number>, item) => {
        const email = item.uploader_email;
        if (email) {
          acc[email] = (acc[email] || 0) + 1;
        }
        return acc;
      }, {});

      // 4. Format, Sort, and Slice Top 10
      const sorted = Object.entries(counts)
        .map(([email, count]) => ({ 
          email, 
          count: count as number 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setLeaderboard(sorted);
    } catch (err: any) {
      console.error("Leaderboard Error:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userDept]); // Re-run whenever userDept is found

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] p-10 shadow-2xl shadow-v-blue/20 border-4 border-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-6 border-b-2 border-v-blue/20 gap-4">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black text-v-text flex items-center gap-4 tracking-tighter">
              <span className="w-14 h-14 rounded-3xl bg-v-lavender flex items-center justify-center shadow-xl shadow-v-lavender/40 text-2xl animate-breathe">🏆</span>
              The Podium
            </h1>
            <p className="text-xs font-black text-v-lavender uppercase tracking-[0.3em] mt-2 ml-1">
              {userDept || 'Scanning Department...'}
            </p>
          </div>
          <button 
            onClick={() => fetchLeaderboardData()}
            className="px-8 py-3 rounded-2xl text-xs font-black bg-white hover:bg-v-lavender/20 text-v-text transition-all uppercase tracking-widest border-2 border-v-blue/20 shadow-sm"
          >
            Refetch Stats
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white/20 rounded-[32px] animate-pulse border-2 border-white" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 bg-white/30 backdrop-blur-md rounded-[40px] border-2 border-dashed border-v-blue/20">
            <span className="text-5xl block mb-4">🌌</span>
            <p className="text-v-text/40 font-black uppercase tracking-widest text-xs">No contributions in {userDept} yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((user, index) => {
              const isGold = index === 0;
              const isSilver = index === 1;
              const isBronze = index === 2;

              let containerStyle = "";
              let badgeStyle = "";
              let textColor = "text-v-text";

              if (isGold) {
                containerStyle = "bg-[#C5A028] border-v-white shadow-2xl animate-breathe z-10 scale-[1.05]";
                badgeStyle = "bg-white/20 text-white";
                textColor = "text-white";
              } else if (isSilver) {
                containerStyle = "bg-[#E5E4E2] border-v-white shadow-lg";
                badgeStyle = "bg-black/10 text-v-text";
                textColor = "text-v-text";
              } else if (isBronze) {
                containerStyle = "bg-[#A97142] border-v-white shadow-md";
                badgeStyle = "bg-white/20 text-white";
                textColor = "text-white";
              } else {
                containerStyle = "bg-white/50 backdrop-blur-xl border-v-blue/20 hover:bg-white/70";
                badgeStyle = "bg-v-blue/20 text-v-text";
                textColor = "text-v-text";
              }

              return (
                <div 
                  key={user.email} 
                  className={`flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 ${containerStyle}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg font-mono ${badgeStyle}`}>
                      {index + 1}
                    </span>
                    
                    <div className="flex flex-col">
                      <span className={`font-black truncate max-w-[140px] md:max-w-md ${textColor}`}>
                        {user.email.split('@')[0]} {/* Hiding @domain for cleaner look */}
                      </span>
                      {isGold && <span className="text-[10px] font-black uppercase text-white/70 tracking-widest">Gold Medalist</span>}
                      {isSilver && <span className="text-[10px] font-black uppercase text-v-text/60 tracking-widest">Silver Medalist</span>}
                      {isBronze && <span className="text-[10px] font-black uppercase text-white/70 tracking-widest">Bronze Medalist</span>}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`block text-3xl font-mono font-black tracking-tighter ${textColor}`}>
                      {user.count}
                    </span>
                    <span className={`text-[10px] uppercase font-black tracking-widest ${isGold || isBronze ? 'text-white/60' : 'text-v-text/40'}`}>
                      Contributions
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}