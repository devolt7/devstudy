import React from 'react';
import { X, CheckCircle2, PenTool, FileText, Download, Sparkles, Wand2 } from 'lucide-react';
import { Card } from './UI';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
      {
          icon: <Sparkles size={24} className="text-white" />,
          color: "bg-indigo-500",
          title: "1. Choose Your Tool",
          desc: "Select what you need: Assignment, Notes, Viva Questions, or a formal Article from the sidebar or dashboard."
      },
      {
          icon: <FileText size={24} className="text-white" />,
          color: "bg-emerald-500",
          title: "2. Input or Upload",
          desc: "Enter your topic title directly, or upload a PDF/Text file to let the AI extract and solve questions automatically."
      },
      {
          icon: <Wand2 size={24} className="text-white" />,
          color: "bg-amber-500",
          title: "3. Generate & Customize",
          desc: "The AI writes the content. You can then toggle 'Handwriting Mode', change pen colors, paper styles, and adjust layouts."
      },
      {
          icon: <Download size={24} className="text-white" />,
          color: "bg-slate-800",
          title: "4. Export PDF",
          desc: "Click Export to get a high-quality PDF that looks like it was written by a human hand, or save it to the cloud history."
      }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl sticky top-0 z-10 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">How it Works</h2>
            <p className="text-sm font-medium text-slate-500">Quick start guide</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
            <div className="space-y-6">
                {steps.map((step, index) => (
                    <div key={index} className="flex gap-5 relative group">
                        {/* Connecting Line */}
                        {index !== steps.length - 1 && (
                            <div className="absolute left-6 top-14 bottom-[-14px] w-0.5 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors"></div>
                        )}
                        
                        <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg ${step.color} transform group-hover:scale-110 transition-transform duration-300 z-10`}>
                            {step.icon}
                        </div>
                        
                        <div className="pt-1">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{step.title}</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
                                {step.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-800/30 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                    <h5 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-1">Pro Tip: Image Tools</h5>
                    <p className="text-indigo-700 dark:text-indigo-400/80 text-xs leading-relaxed">
                        Use the "Image Tools" section to take a photo of a math problem or a handwritten note, and the AI will solve or transcribe it instantly.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;