"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DEPARTMENTS } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [statusError, setStatusError] = useState('');

  const handleSignUp = async () => {
    setStatusError('');
    if (!name || !email || !password || !department) {
      setStatusError("Please fill in all the details to register.");
      return;
    }

    if (!window.navigator.onLine) {
      setStatusError("You seem to be offline. Please check your internet connection.");
      return;
    }

    // Guard: Make sure dept value is one of the valid options
    if (!(DEPARTMENTS as readonly string[]).includes(department)) {
      setStatusError("Invalid department selected. Please pick one from the list.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create the Supabase Auth user — returns user data on success
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            department: department,
          },
        },
      });

      if (signUpError) throw signUpError;

      const authUser = signUpData?.user;
      if (!authUser) {
        throw new Error("Auth user was not returned. Registration may require email confirmation.");
      }

      // 2. Profile insert — only runs after a valid auth user.id is confirmed
      //    Uses the auth UUID as the primary key to survive RLS policies.
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: authUser.id,   // FK to auth.users.id — satisfies RLS ownership rules
          email: authUser.email,
          name,
          department,        // Validated above against DEPARTMENTS constant
        },
        { onConflict: 'id' }
      );

      if (profileError) throw profileError;

      // 3. Persist local UI context
      localStorage.setItem('userSession', JSON.stringify({ name, email, department }));

      // 4. Redirect
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Sign-up error:", err);
      const msg = err.message?.includes('Unexpected token') 
        ? "Connection error. Please check your internet." 
        : (err.message || "Sign up failed. Ensure your password is at least 6 characters.");
      setStatusError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setStatusError('');
    if (!email || !password) {
      setStatusError("Please provide both email and password.");
      return;
    }

    if (!window.navigator.onLine) {
      setStatusError("You seem to be offline. Please check your internet connection.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Authenticate exactly against Secure RLS
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.session) throw authError;

      // 2. Fetch their explicit Name and Department metadata from the 'profiles' layer dynamically
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
        
      if (fetchError) {
        console.warn("Could not retrieve full profile metadata, mapping what is available contextually.");
      }

      // 3. Hydrate UI Context safely
      localStorage.setItem('userSession', JSON.stringify({
         name: profile?.name || authData.user.email?.split('@')[0] || "Student",
         email: authData.user.email,
         department: profile?.department || "Computer Science",
      }));

      // 4. Anchor Redirect
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      const msg = err.message?.includes('Unexpected token') 
        ? "Connection error. Please check your internet." 
        : "Authentication failed: Ensure your exact email and password exist in our registry.";
      setStatusError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await handleSignUp();
    } else {
      await handleSignIn();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-v-white p-4 text-v-text">
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <img 
          src="/logo-degree.png" 
          alt="DeGree Logo" 
          className="h-24 object-contain drop-shadow-[0_10px_10px_rgba(200,168,233,0.3)] animate-breathe"
        />
      </div>
      <div className="w-full max-w-md rounded-[48px] bg-white/40 backdrop-blur-3xl p-12 shadow-2xl shadow-v-blue/20 border-4 border-white animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex bg-v-white p-1.5 mb-12 rounded-3xl shadow-inner border-2 border-v-blue/20">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-4 rounded-2xl font-black transition-all outline-none text-sm uppercase tracking-widest ${
              !isSignUp ? 'bg-v-lavender text-v-text shadow-xl' : 'text-v-text/40 hover:text-v-text'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-4 rounded-2xl font-black transition-all outline-none text-sm uppercase tracking-widest ${
              isSignUp ? 'bg-v-lavender text-v-text shadow-xl' : 'text-v-text/40 hover:text-v-text'
            }`}
          >
            Sign Up
          </button>
        </div>

        <h1 className="mb-2 text-center text-5xl font-black text-v-text tracking-tighter">
           {isSignUp ? "Join Vault" : "Welcome Back"}
        </h1>
        <p className="text-center text-v-text/40 font-black text-xs uppercase tracking-widest mb-4 px-4 leading-relaxed">
           {isSignUp ? "Initialize your academic profile." : "Enter your vault credentials below."}
        </p>

        {statusError && (
          <div className="mb-6 p-4 bg-v-pink/20 border-2 border-v-pink/40 rounded-2xl text-v-text text-xs font-black animate-in fade-in slide-in-from-top-2 text-center">
             ⚠️ {statusError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {isSignUp && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="mb-2 ml-2 block text-[10px] font-black uppercase tracking-widest text-v-magenta" htmlFor="name">
                Identity Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border-2 border-v-blue/20 bg-white/50 px-6 py-4 focus:border-v-lavender focus:outline-none transition-all font-black text-v-text"
                placeholder="Jane Doe"
                required={isSignUp}
              />
            </div>
          )}

          <div>
            <label className="mb-2 ml-2 block text-[10px] font-black uppercase tracking-widest text-v-magenta" htmlFor="email">
              University Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border-2 border-v-blue/20 bg-white/50 px-6 py-4 focus:border-v-lavender focus:outline-none transition-all font-black text-v-text"
              placeholder="student@university.edu"
              required
            />
          </div>

          <div>
            <label className="mb-2 ml-2 block text-[10px] font-black uppercase tracking-widest text-v-magenta" htmlFor="password">
              Secure Key
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border-2 border-v-blue/20 bg-white/50 px-6 py-4 focus:border-v-lavender focus:outline-none transition-all font-black text-v-text"
              placeholder="••••••••"
              required
            />
          </div>

          {isSignUp && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="mb-2 ml-2 block text-[10px] font-black uppercase tracking-widest text-v-magenta" htmlFor="department">
                Core Faculty
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-2xl border-2 border-v-blue/20 bg-white/50 px-6 py-4 focus:border-v-lavender focus:outline-none transition-all font-black text-v-text appearance-none"
                required={isSignUp}
              >
                <option value="" disabled>Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 w-full rounded-3xl bg-v-lavender py-5 font-black text-v-text shadow-2xl shadow-v-lavender/40 transition-all ${isLoading ? 'animate-breathe opacity-80' : 'hover:scale-[1.05] hover:shadow-v-lavender/60 active:scale-95'}`}
          >
            {isLoading 
               ? (isSignUp ? "Initializing..." : "Decoding...") 
               : (isSignUp ? "Open Vault Account" : "Access Personal Vault")}
          </button>
        </form>

        <div className="mt-10 text-center">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-v-text/40 hover:text-v-text transition-all">
             &larr; Return to Base Hub
          </Link>
        </div>
      </div>
    </main>
  );
}
