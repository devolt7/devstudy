import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI';
import Mascot from '../components/Mascot';
import AboutModal from '../components/AboutModal';
import { ArrowRight, GraduationCap, FileText, PenTool, Mic, Zap, HelpCircle, Sparkles, ChevronRight, Brain } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  const [greetingText, setGreetingText] = useState("Good Morning,");

  useEffect(() => {
    const updateGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) setGreetingText("Good Morning,");
        else if (hour < 18) setGreetingText("Good Afternoon,");
        else setGreetingText("Good Evening,");
    };
    
    updateGreeting();
    // Update every minute to keep it accurate
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12 pb-12">
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

      {/* HERO SECTION */}
      <div className="relative group">
          {/* Animated Glow Behind Hero */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          
          <div className="relative glass-panel bg-white/60 dark:bg-slate-900/60 rounded-[2.5rem] p-8 md:p-12 border border-white/50 dark:border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/20">
            
            {/* Background Blob Animation */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob pointer-events-none mix-blend-multiply dark:mix-blend-overlay"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none mix-blend-multiply dark:mix-blend-overlay"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                <div className="text-center md:text-left space-y-8 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/5 dark:bg-white/10 rounded-full border border-slate-900/10 dark:border-white/20 backdrop-blur-md">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">AI Engine V2.0 Active</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm leading-[1.1]">
                        {greetingText} <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient-x">Scholar.</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto md:mx-0 font-medium">
                        Ready to crush your assignments? Your AI academic companion is streamlined and ready to create.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                         <Button size="lg" className="rounded-2xl px-10 py-4 text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300" onClick={() => navigate('/assignment')}>
                            Start Creating <ArrowRight size={20} className="ml-2" />
                         </Button>
                         <Button 
                            variant="outline"
                            size="lg"
                            onClick={() => setShowAbout(true)}
                            className="rounded-2xl px-8 border-2 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:scale-105 transition-transform duration-300"
                         >
                            <HelpCircle size={20} className="mr-2" /> How it works
                         </Button>
                    </div>
                </div>

                {/* Mascot */}
                <div className="relative w-72 h-72 md:w-80 md:h-80 flex-shrink-0 animate-float hidden md:block">
                    <Mascot state="happy" size={320} className="w-full h-full filter drop-shadow-2xl" />
                </div>
            </div>
          </div>
      </div>

      {/* TOOLS GRID - VIBRANT BENTO STYLE */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
         <div className="flex items-center gap-3 mb-8 px-2">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <Sparkles className="text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" size={20} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Creative Studio</h2>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
             
             {/* 1. ASSIGNMENTS - Main Feature (Spans 8 cols on LG) */}
             <div 
                onClick={() => navigate('/assignment')}
                className="lg:col-span-8 relative h-72 rounded-[2.5rem] overflow-hidden cursor-pointer group transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 ring-1 ring-white/10"
             >
                {/* Vibrant Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 transition-transform duration-700 group-hover:scale-110"></div>
                
                {/* Texture Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] group-hover:opacity-20 transition-opacity"></div>
                
                {/* Decorative Shapes */}
                <div className="absolute -right-20 -bottom-32 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="absolute top-10 right-10 text-white/5 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
                    <GraduationCap size={280} />
                </div>

                <div className="absolute inset-0 p-10 flex flex-col justify-between z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <GraduationCap size={32} />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 opacity-80 mb-1">
                             <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Most Popular</span>
                             <div className="h-px w-8 bg-indigo-300/50"></div>
                        </div>
                        <h3 className="text-4xl font-black text-white tracking-tight leading-none">Assignments</h3>
                        <p className="text-indigo-100 font-medium text-lg max-w-md leading-relaxed">
                            Generate complete handwritten assignments from any topic instantly.
                        </p>
                    </div>

                    <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <div className="p-3 bg-white text-indigo-600 rounded-full shadow-lg">
                            <ArrowRight size={24} />
                        </div>
                    </div>
                </div>
             </div>

             {/* 2. NOTES - (Spans 4 cols on LG) */}
             <div 
                onClick={() => navigate('/notes')}
                className="lg:col-span-4 relative h-72 rounded-[2.5rem] overflow-hidden cursor-pointer group transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-2xl shadow-orange-500/20 hover:shadow-orange-500/40 ring-1 ring-white/10"
             >
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 transition-transform duration-700 group-hover:scale-110"></div>
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] group-hover:opacity-20 transition-opacity"></div>
                 
                 <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>

                 <div className="p-8 h-full flex flex-col justify-between relative z-10">
                     <div className="flex justify-between items-start">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <FileText size={28} />
                        </div>
                     </div>
                     
                     <div className="relative">
                         <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Notes</h3>
                         <p className="text-orange-100 text-sm font-medium leading-relaxed">Smart summaries & key points for quick revision.</p>
                         <ChevronRight className="absolute right-0 bottom-0 text-white opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                     </div>
                 </div>
             </div>

             {/* 3. VIVA PREP */}
             <div 
                onClick={() => navigate('/viva')}
                className="lg:col-span-4 relative h-64 rounded-[2.5rem] overflow-hidden cursor-pointer group transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-2xl shadow-pink-500/20 hover:shadow-pink-500/40 ring-1 ring-white/10"
             >
                 <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 transition-transform duration-700 group-hover:scale-110"></div>
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                 
                 <div className="p-8 h-full flex flex-col justify-between relative z-10">
                     <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                         <Mic size={28} />
                     </div>
                     <div>
                         <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Viva Prep</h3>
                         <p className="text-pink-100 text-sm font-medium">Audio Q&A & Interview Prep</p>
                     </div>
                 </div>
                 <div className="absolute -right-6 -bottom-6 text-white/10 group-hover:text-white/20 transition-colors transform rotate-12 group-hover:rotate-0">
                    <Mic size={140} />
                 </div>
             </div>

             {/* 4. ARTICLES */}
             <div 
                onClick={() => navigate('/report')}
                className="lg:col-span-4 relative h-64 rounded-[2.5rem] overflow-hidden cursor-pointer group transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 ring-1 ring-white/10"
             >
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 transition-transform duration-700 group-hover:scale-110"></div>
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')]"></div>

                 <div className="p-8 h-full flex flex-col justify-between relative z-10">
                     <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                         <PenTool size={28} />
                     </div>
                     <div>
                         <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Articles</h3>
                         <p className="text-emerald-50 text-sm font-medium">Magazine Style Reports</p>
                     </div>
                 </div>
                 <div className="absolute -right-6 -bottom-6 text-white/10 group-hover:text-white/20 transition-colors transform -rotate-12 group-hover:rotate-0">
                    <PenTool size={140} />
                 </div>
             </div>

             {/* 5. SUMMARIZER */}
             <div 
                onClick={() => navigate('/summarizer')}
                className="lg:col-span-4 relative h-64 rounded-[2.5rem] overflow-hidden cursor-pointer group transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/40 ring-1 ring-white/10"
             >
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 transition-transform duration-700 group-hover:scale-110"></div>
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                 <div className="p-8 h-full flex flex-col justify-between relative z-10">
                     <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                         <Zap size={28} />
                     </div>
                     <div>
                         <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Summarizer</h3>
                         <p className="text-amber-50 text-sm font-medium">Smart summaries from any file</p>
                     </div>
                 </div>
                 <div className="absolute -right-6 -bottom-6 text-white/10 group-hover:text-white/20 transition-colors transform rotate-6 group-hover:rotate-0">
                    <Zap size={140} />
                 </div>
             </div>

             {/* 6. SELF QUIZ */}
             <div 
                onClick={() => navigate('/selfquiz')}
                className="lg:col-span-4 relative h-64 rounded-[2.5rem] overflow-hidden cursor-pointer group transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 ring-1 ring-white/10"
             >
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 transition-transform duration-700 group-hover:scale-110"></div>
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>

                 <div className="p-8 h-full flex flex-col justify-between relative z-10">
                     <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                         <Brain size={28} />
                     </div>
                     <div>
                         <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Self Quiz</h3>
                         <p className="text-purple-50 text-sm font-medium">Generate & Test with MCQs</p>
                     </div>
                 </div>
                 <div className="absolute -right-6 -bottom-6 text-white/10 group-hover:text-white/20 transition-colors transform -rotate-12 group-hover:rotate-0">
                    <Brain size={140} />
                 </div>
             </div>

         </div>
      </div>
    </div>
  );
};

export default Home;