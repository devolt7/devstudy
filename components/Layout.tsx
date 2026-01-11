import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import { Moon, Sun, User as UserIcon, Plus, Menu, X, Home, Clock, GraduationCap, Brain } from 'lucide-react';
import { LayoutContextType } from '../types';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebase';
import ProfileSetupModal from './ProfileSetupModal';
import CreateSheet from './CreateSheet';

// Mobile nav items - custom order: Assign, Quiz, Dashboard (center), History
const MOBILE_NAV_ITEMS = [
  { id: 'assignment', label: 'Assign', icon: GraduationCap, path: '/assignment' },
  { id: 'selfquiz', label: 'Quiz', icon: Brain, path: '/selfquiz' },
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'history', label: 'History', icon: Clock, path: '/history' },
];

const Logo = () => (
    <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg border border-white/20">
            <span className="font-black text-xs tracking-tighter" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>DS</span>
        </div>
    </div>
);

const Layout: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' || 
               (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const [isEditorMode, setIsEditorMode] = useState(false);
  const location = useLocation();

  const { currentUser, userProfile, signInWithGoogle, logout, loading } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isInitialSetup, setIsInitialSetup] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const displayTitle = currentUser 
    ? (userProfile?.name || currentUser.displayName || 'DevStudy') 
    : 'DevStudy';

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!loading && currentUser && userProfile && !userProfile.isProfileComplete) {
        setIsInitialSetup(true);
        setShowProfileModal(true);
    }
  }, [loading, currentUser, userProfile]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleSignIn = async () => {
      if (!isFirebaseConfigured()) {
          alert("Firebase is not configured.");
          return;
      }
      try { await signInWithGoogle(); } catch (e) { console.error(e); }
  };

  const handleProfileClick = () => {
      if (!currentUser) handleSignIn();
      else { setShowProfileModal(true); setIsInitialSetup(false); }
  };

  const contextValue: LayoutContextType = {
    isEditorMode,
    setEditorMode: setIsEditorMode
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-white flex transition-colors duration-300 font-sans bg-transparent">
      
      <ProfileSetupModal isOpen={showProfileModal} onClose={() => { setShowProfileModal(false); setIsInitialSetup(false); }} isInitialSetup={isInitialSetup} />
      <CreateSheet isOpen={showCreateSheet} onClose={() => setShowCreateSheet(false)} />

      {/* DESKTOP SIDEBAR - Glassmorphism */}
      <aside 
        className={`hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-white/20 dark:border-white/5 z-50 transition-transform duration-300 ${isEditorMode ? '-translate-x-full' : 'translate-x-0'} print:hidden shadow-2xl shadow-indigo-500/5`}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
           <h1 className="text-xl font-bold tracking-tight flex items-center gap-3">
              <Logo />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">DevStudy</span>
           </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={`
                            flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group
                            ${active 
                                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-medium shadow-lg shadow-primary-500/25' 
                                : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-primary-400'}
                        `}
                    >
                        <Icon size={20} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="text-sm">{item.label}</span>
                        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                    </NavLink>
                );
            })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-slate-700 shadow-sm">
                    {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon size={18} className="text-slate-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{currentUser ? (userProfile?.name || 'Student') : 'Guest'}</p>
                    <button onClick={handleSignIn} className="text-[10px] font-semibold text-primary-500 hover:text-primary-600 hover:underline">
                        {currentUser ? 'View Profile' : 'Sign In'}
                    </button>
                </div>
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-400 transition-colors"
                >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
            </div>
            {currentUser && (
                <div className="mt-3 flex gap-2">
                     <button onClick={handleProfileClick} className="flex-1 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors">Profile</button>
                     <button onClick={logout} className="flex-1 py-1.5 text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors">Logout</button>
                </div>
            )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isEditorMode ? 'md:ml-0' : 'md:ml-64'} print:ml-0 print:w-full`}>
        
        {/* MOBILE HEADER - Glass */}
        {!isEditorMode && (
            <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center print:hidden shadow-sm">
                <div className="flex items-center gap-2">
                    <Logo />
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">{displayTitle}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-transform">
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button onClick={() => setShowCreateSheet(true)} className="p-2 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/30 active:scale-95 transition-transform">
                        <Plus size={18} />
                    </button>
                </div>
            </header>
        )}

        {/* PAGE CONTENT */}
        <div className={`flex-1 w-full max-w-7xl mx-auto ${isEditorMode ? 'p-0' : 'p-4 pb-32 md:p-8'} print:p-0`}>
            <Outlet context={contextValue} />
        </div>

        {/* MOBILE BOTTOM NAV - Glass Dock */}
        <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 pb-safe print:hidden shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] ${isEditorMode ? 'hidden' : 'block'}`}>
            <nav className="flex items-end justify-around px-2 py-2 h-16">
                {MOBILE_NAV_ITEMS.map((item, index) => {
                    const Icon = item.icon;
                    const isCenter = index === 2; // Dashboard in center
                    return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) => `
                                flex flex-col items-center transition-all duration-300 relative
                                ${isCenter 
                                    ? 'mb-2' 
                                    : `p-1.5 rounded-xl ${isActive 
                                        ? 'text-primary-600 dark:text-primary-400' 
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isCenter ? (
                                        // Center Dashboard Button - Elevated Design
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                                            isActive 
                                                ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-primary-500/40' 
                                                : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-300 hover:from-primary-500 hover:to-indigo-600 hover:text-white hover:shadow-primary-500/40'
                                        }`}>
                                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                    ) : (
                                        <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                                            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? 'animate-bounce-subtle' : ''} />
                                        </div>
                                    )}
                                    <span className={`text-[10px] font-bold mt-0.5 ${isActive && !isCenter ? 'text-primary-600 dark:text-primary-400' : ''} ${isCenter ? 'text-slate-500 dark:text-slate-400' : ''}`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
                {/* Account Button */}
                <button 
                    onClick={handleProfileClick}
                    className="flex flex-col items-center p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    <div className="p-2 rounded-xl">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-slate-700">
                            {currentUser?.photoURL ? (
                                <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={14} className="text-slate-400" />
                            )}
                        </div>
                    </div>
                    <span className="text-[10px] font-bold mt-0.5">Me</span>
                </button>
            </nav>
        </div>

      </main>
    </div>
  );
};

export default Layout;