import React, { useState, useEffect } from 'react';
import { X, User, School, BookOpen, Hash, GraduationCap, ChevronRight, CheckCircle2, Layers, LogOut } from 'lucide-react';
import { Button, Input, Card, Select } from './UI';
import { useAuth } from '../context/AuthContext';
import { StudentDetails, Stream } from '../types';
import { STREAMS } from '../constants';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInitialSetup?: boolean;
}

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onClose, isInitialSetup = false }) => {
  const { userProfile, updateUserProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StudentDetails>({
    name: '',
    instituteName: '',
    branch: '',
    semester: '',
    enrollmentNo: '',
    subjectCode: '',
    stream: 'Engineering',
    defaultSubject: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        instituteName: userProfile.instituteName || '',
        branch: userProfile.branch || '',
        semester: userProfile.semester || '',
        enrollmentNo: userProfile.enrollmentNo || '',
        subjectCode: userProfile.subjectCode || '',
        stream: userProfile.stream || 'Engineering',
        defaultSubject: userProfile.defaultSubject || ''
      });
    }
  }, [userProfile]);

  const handleChange = (field: keyof StudentDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateUserProfile(formData);
      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-lg bg-white dark:bg-slate-950 p-0 shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with decorative background */}
        <div className="relative bg-gradient-to-r from-primary-600 to-indigo-600 p-8 text-white shrink-0">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <GraduationCap size={120} />
            </div>
            
            <h2 className="text-2xl font-bold relative z-10">
                {isInitialSetup ? "Welcome to DevStudy!" : "Edit Profile"}
            </h2>
            <p className="text-primary-100 mt-2 relative z-10 max-w-sm text-sm">
                {isInitialSetup 
                  ? "Let's set up your academic profile to automate your assignments and notes." 
                  : "Update your details. These will be auto-filled in your future tasks."}
            </p>

            {!isInitialSetup && (
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                >
                    <X size={20} />
                </button>
            )}
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1 block">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <Input 
                            value={formData.name} 
                            onChange={(e) => handleChange('name', e.target.value)} 
                            className="pl-10"
                            placeholder="e.g. Aditi Verma"
                        />
                    </div>
                 </div>

                 {/* NEW: Stream Selection */}
                 <div className="col-span-1 md:col-span-2">
                    <Select 
                        label="Default Stream"
                        options={STREAMS}
                        value={formData.stream}
                        onChange={(e) => handleChange('stream', e.target.value)}
                    />
                 </div>

                 <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1 block">Institute / College</label>
                    <div className="relative">
                        <School className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <Input 
                            value={formData.instituteName} 
                            onChange={(e) => handleChange('instituteName', e.target.value)} 
                            className="pl-10"
                            placeholder="e.g. IIT Delhi"
                        />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1 block">Course / Branch</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <Input 
                            value={formData.branch} 
                            onChange={(e) => handleChange('branch', e.target.value)} 
                            className="pl-10"
                            placeholder="e.g. CSE"
                        />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1 block">Semester</label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <Input 
                            value={formData.semester} 
                            onChange={(e) => handleChange('semester', e.target.value)} 
                            className="pl-10"
                            placeholder="e.g. Sem IV"
                        />
                    </div>
                 </div>

                 <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1 block">Roll Number (Optional)</label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <Input 
                            value={formData.enrollmentNo} 
                            onChange={(e) => handleChange('enrollmentNo', e.target.value)} 
                            className="pl-10"
                            placeholder="e.g. 2021BCS045"
                        />
                    </div>
                 </div>

                 {/* NEW: Default Subject */}
                 <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1 block">Default Subject Code (Optional)</label>
                    <div className="relative">
                        <Layers className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <Input 
                            value={formData.subjectCode} 
                            onChange={(e) => handleChange('subjectCode', e.target.value)} 
                            className="pl-10"
                            placeholder="e.g. CS-101 (Auto-filled in new docs)"
                        />
                    </div>
                 </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-4 shrink-0">
            {isInitialSetup ? (
                <button 
                    onClick={onClose} 
                    className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                    Skip for now
                </button>
            ) : (
                <button 
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                >
                    <LogOut size={16} /> Logout
                </button>
            )}
            
            <Button 
                onClick={handleSubmit} 
                isLoading={loading}
                className="px-8 rounded-xl shadow-lg shadow-primary-500/20"
            >
                {isInitialSetup ? (
                    <span className="flex items-center gap-2">Get Started <ChevronRight size={16} /></span>
                ) : (
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Save Changes</span>
                )}
            </Button>
        </div>

      </Card>
    </div>
  );
};

export default ProfileSetupModal;