import React from 'react';
import { User, Code, Heart, Shield, FileText, Mail, Globe, Zap, Coffee, HelpCircle, Info } from 'lucide-react';
import { Card } from '../components/UI';

const AboutUs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 border border-white/10">
                <span className="font-black text-2xl tracking-tighter" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>DS</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">About DevStudy</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Vision, Mission & The Team</p>
            </div>
        </div>

        {/* 1. INTRO SECTION */}
        <section className="text-center py-10 px-4">
            <h3 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 mb-4">
              Crafted for the Dreamers & Achievers
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto italic">
              DevStudy is made for students who’ve felt exhausted, confused, and quietly overwhelmed by endless assignments and deadlines.
              It’s a calm, caring space created to make studying feel lighter and thoughts clearer.
              And if you ever feel stuck or tired, remember this — I’m Dev, and I’m right here with you. You don’t have to go through it alone.
            </p>
        </section>

        {/* 2. VISION & MISSION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/50 hover:-translate-y-1 transition-transform">
               <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                  <Zap size={24} />
               </div>
               <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Our Vision</h4>
               <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                 To ignite the spark of curiosity in every student by removing the friction of mundane tasks. We envision a world where your creativity flows unhindered, supported by AI that cares about your success as much as you do.
               </p>
            </Card>
            <Card className="p-8 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/50 hover:-translate-y-1 transition-transform">
               <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                  <Heart size={24} />
               </div>
               <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Our Mission</h4>
               <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                 To wrap powerful technology in a warm, inviting experience. We strive to be the supportive friend during late-night study sessions, turning stress into structure and anxiety into accomplishment.
               </p>
            </Card>
        </section>

        {/* 3. CREATOR PROFILE */}
        <section className="mt-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Meet the Creator</h3>
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Code size={240} />
                </div>
                
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-inner border-4 border-white dark:border-slate-800">
                        <User size={48} />
                    </div>
                    <div className="flex-1 space-y-5">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-primary-100 dark:border-primary-800/50">
                                Founder & Lead Developer
                            </div>
                            <h4 className="text-3xl font-bold text-slate-900 dark:text-white">Devkant Prajapati</h4>
                            <p className="text-slate-500 font-medium text-lg">Full-Stack Developer | Product Designer</p>
                        </div>

                        <div className="prose prose-lg dark:prose-invert text-slate-600 dark:text-slate-300 italic border-l-4 border-primary-500 pl-6 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-r-xl">
                            "I built DevStudy because I wanted to reclaim my time. I hated wasting hours on manual assignments when I could be coding or following my passion. This platform is my solution to a problem every student faces—giving you back the time to do what you love."
                        </div>
                    </div>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-4">
                    <a href="mailto:workfordevolt@gmail.com" className="flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group">
                        <Mail size={18} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                        workfordevolt@gmail.com
                    </a>
                    <a href="https://devolt7.github.io/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group">
                        <Globe size={18} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                        Portfolio & Projects
                    </a>
                    </div>
                </div>
            </div>
        </section>

        {/* 4. PRIVACY & TERMS */}
        <section className="space-y-6 pt-8">
             <div className="flex items-center gap-3 mb-2">
                <Shield size={20} className="text-slate-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Privacy & Trust</h4>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                   <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Shield size={18} className="text-emerald-500" /> Privacy Policy
                   </h5>
                   <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      We respect your data privacy. Any content or files uploaded are processed solely to generate your requested academic materials and are not stored permanently or misused. Your academic integrity is our priority.
                   </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                   <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <FileText size={18} className="text-amber-500" /> Terms of Use
                   </h5>
                   <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      DevStudy is an educational aid. While we strive for accuracy, students should review generated content. We provide the tools; you provide the responsibility for how they are used in your institution.
                   </p>
                </div>
             </div>
        </section>

        {/* 5. FEEDBACK */}
        <section className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-3xl p-8 text-white text-center shadow-xl shadow-primary-900/20">
             <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <HelpCircle size={32} />
                </div>
                <h4 className="font-bold text-2xl">Have Feedback or Suggestions?</h4>
                <p className="text-primary-100 max-w-lg mx-auto">
                   We are constantly improving. If you have an idea or found a bug, reach out to us directly via email. We'd love to hear from you!
                </p>
             </div>
        </section>

        {/* Footer Trust Line - FIXED LAYOUT */}
        <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
             <div className="flex flex-wrap justify-center items-center gap-1.5 text-sm font-medium text-slate-500 max-w-2xl mx-auto">
                <Coffee size={16} className="text-slate-400" />
                <span>Built with</span>
                <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" />
                <span className="text-center">and care, transparency, and a deep understanding of student needs.</span>
             </div>
             <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">v1.0.0 • © 2025 DevStudy</p>
        </div>

    </div>
  );
};

export default AboutUs;