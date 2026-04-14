import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#F4E7FB] to-[#C3C7F4] text-v-text overflow-hidden">
      <div className="text-center px-4 animate-in fade-in zoom-in-95 duration-1000 flex flex-col items-center">
        <div className="mb-4">
          <img 
            src="/logo-degree.png" 
            alt="DeGree Logo" 
            className="w-[300px] md:w-[500px] object-contain drop-shadow-[0_20px_40px_rgba(200,168,233,0.3)] animate-breathe"
          />
        </div>
        
        <p className="mx-auto mb-16 max-w-4xl text-xl md:text-2xl text-v-text font-brand font-black tracking-tighter opacity-70">
           Let's Get that Degree!
        </p>
        
        <Link 
          href="/login"
          className="inline-block rounded-full bg-v-lavender px-12 py-5 text-lg font-brand font-black text-v-text shadow-xl border-8 border-v-white/50 transition-all hover:scale-110 active:scale-95 ring-8 ring-v-lavender/20"
        >
          Begin your notes
        </Link>
      </div>
    </main>
  );
}
