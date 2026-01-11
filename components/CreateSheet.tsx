import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import { X } from 'lucide-react';

interface CreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateSheet: React.FC<CreateSheetProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Filter out Home from the tools list
  const tools = NAV_ITEMS.filter(item => item.id !== 'home');

  return (
    <>
      {/* Backdrop with heavy blur for focus */}
      <div 
        className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-[#1A1F2E] rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.2)] animate-slide-up transform gpu overflow-hidden border-t border-white/20">
        
        {/* Drag Handle */}
        <div className="w-full flex justify-center pt-4 pb-2" onClick={onClose}>
            <div className="w-14 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full opacity-50" />
        </div>

        <div className="p-8 pb-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create New</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Select a tool to get started</p>
                </div>
                <button 
                    onClick={onClose}
                    className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {tools.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            onClick={onClose}
                            style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'forwards' }}
                            className="flex flex-col items-start p-5 bg-slate-50 dark:bg-[#111625] border border-slate-100 dark:border-white/5 rounded-[2rem] active:scale-95 transition-all duration-300 hover:bg-white dark:hover:bg-white/5 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-primary-200 dark:hover:border-primary-500/30 group animate-slide-up-fast opacity-0"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/10 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/20 group-hover:text-primary-600 dark:group-hover:text-white transition-all duration-300 mb-3">
                                <Icon size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <span className="block text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {item.label}
                                </span>
                            </div>
                        </NavLink>
                    );
                })}
            </div>
        </div>
      </div>
    </>
  );
};

export default CreateSheet;