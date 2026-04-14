"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function QueriesManager({ userEmail }: { userEmail: string }) {
  const [queries, setQueries] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const isAdmin = userEmail === 'logapriya0k@gmail.com';

  const fetchQueries = async () => {
    let { data } = await supabase.from('queries').select('*').order('created_at', { ascending: false });
    setQueries(data || []);
  };

  useEffect(() => { fetchQueries(); }, [userEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('queries').insert([{ user_email: userEmail, subject, message }]);
    setSubject(''); setMessage(''); fetchQueries();
  };

  const handleAdminReply = async (id: string) => {
    await supabase.from('queries').update({ 
      admin_reply: replyText[id], 
      status: 'resolved' 
    }).eq('id', id);
    fetchQueries();
  };

  const deleteTicket = async (id: string) => {
    if (confirm("Delete this ticket permanently?")) {
      await supabase.from('queries').delete().eq('id', id);
      fetchQueries();
    }
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Student View: Raise Ticket Form */}
      {!isAdmin && (
        <form onSubmit={handleSubmit} className="bg-white/40 backdrop-blur-3xl p-10 rounded-[48px] border-4 border-white shadow-3xl shadow-v-blue/20 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <span className="w-12 h-12 rounded-2xl bg-v-lavender flex items-center justify-center text-xl shadow-lg">✉️</span>
            <h2 className="text-3xl font-black text-v-text tracking-tighter">Support Vault</h2>
          </div>
          <p className="text-v-text/40 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Your message is encrypted and primary-gated.</p>
          
          <div className="space-y-4">
            <input 
              className="w-full p-6 bg-v-white/50 rounded-3xl border-2 border-v-blue/20 outline-none focus:ring-8 focus:ring-v-lavender/10 transition-all font-black text-v-text" 
              placeholder="Ticket Subject" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              required 
            />
            <textarea 
              className="w-full p-6 bg-v-white/50 rounded-3xl border-2 border-v-blue/20 h-40 outline-none focus:ring-8 focus:ring-v-lavender/10 transition-all font-black text-v-text" 
              placeholder="Explain the anomaly..." 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              required 
            />
          </div>
          <button className="bg-v-lavender text-v-text px-12 py-5 rounded-full font-black hover:scale-[1.05] transition-all shadow-2xl shadow-v-lavender/40 active:scale-95 uppercase tracking-widest text-xs">
            Transmit to Admin
          </button>
        </form>
      )}

      {/* Shared View: The Tickets */}
      <div className="grid gap-8">
        <h2 className="text-3xl font-black text-v-text mb-4 tracking-tighter">
          {isAdmin ? "Admin to User Encrypted Chat" : "Your Extraction History"}
        </h2>
        {queries.map(q => (
          <div key={q.id} className={`p-10 rounded-[48px] border-4 border-white transition-all overflow-hidden relative ${q.status === 'resolved' ? 'opacity-60 bg-white/20 blur-[0.5px]' : 'bg-white/40 backdrop-blur-3xl shadow-3xl shadow-v-blue/10'}`}>
            <div className="flex justify-between items-start mb-8">
              <div className="flex-1">
                <span className={`inline-block px-4 py-2 rounded-full text-[10px] font-black uppercase mb-4 shadow-sm tracking-widest ${q.status === 'resolved' ? 'bg-v-blue text-v-text/60' : 'bg-v-magenta text-v-text'}`}>
                  {q.status}
                </span>
                <h3 className={`font-black text-2xl mb-2 tracking-tighter ${q.status === 'resolved' ? 'line-through text-v-text/40' : 'text-v-text'}`}>{q.subject}</h3>
                <p className="text-v-magenta text-xs font-black mb-6 uppercase tracking-widest opacity-60">Identity: {q.user_email}</p>
                <div className="text-v-text/80 bg-white/30 p-8 rounded-[32px] border-2 border-v-blue/10 font-black leading-relaxed italic">
                  "{q.message}"
                </div>
              </div>
              {isAdmin && (
                <button onClick={() => deleteTicket(q.id)} className="text-red-400 hover:text-red-600 p-2">✕</button>
              )}
            </div>

            {/* Admin Response Box */}
            {isAdmin && q.status === 'open' && (
              <div className="mt-10 space-y-6">
                <textarea 
                  className="w-full p-8 bg-white/80 border-2 border-v-blue/20 rounded-[32px] text-sm outline-none focus:ring-8 focus:ring-v-lavender/10 font-black h-32 shadow-inner" 
                  placeholder="Draft resolution response..."
                  onChange={(e) => setReplyText({ ...replyText, [q.id]: e.target.value })}
                />
                <button onClick={() => handleAdminReply(q.id)} className="w-full py-5 bg-v-lavender text-v-text rounded-full font-black shadow-2xl shadow-v-lavender/40 hover:scale-[1.02] transition-all uppercase tracking-widest text-xs">Authorize Resolution</button>
              </div>
            )}

            {/* Displaying the Answer to the User */}
            {q.admin_reply && (
              <div className="mt-10 p-8 bg-v-lavender/20 rounded-[40px] border-4 border-v-white shadow-xl">
                <p className="text-[10px] font-black text-v-magenta uppercase mb-4 tracking-widest opacity-60 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-v-magenta"></span> Admin Verdict
                </p>
                <p className="text-v-text font-black text-lg leading-relaxed">{q.admin_reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}