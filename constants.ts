import { GraduationCap, BookOpen, FileText, Zap, PenTool, Home, Mic, Clock, Info, Brain } from 'lucide-react';
import { NavItem } from './types';

export const STREAMS = [
  'Engineering',
  'Commerce',
  'Science',
  'Management',
  'Arts',
  'Other',
];

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Dashboard', icon: Home, path: '/' },
  { id: 'history', label: 'History', icon: Clock, path: '/history' },
  { id: 'assignment', label: 'Assignments', icon: GraduationCap, path: '/assignment' },
  { id: 'notes', label: 'Notes', icon: FileText, path: '/notes' },
  { id: 'report', label: 'Articles', icon: PenTool, path: '/report' },
  { id: 'viva', label: 'Viva Prep', icon: Mic, path: '/viva' },
  { id: 'summarizer', label: 'Summarizer', icon: Zap, path: '/summarizer' },
  { id: 'selfquiz', label: 'Self Quiz', icon: Brain, path: '/selfquiz' },
  { id: 'about', label: 'About Us', icon: Info, path: '/about' },
];

export const TEACHER_MODES = [
  { value: 'strict', label: 'Strict Examiner' },
  { value: 'average', label: 'Balanced Evaluator' },
  { value: 'lenient', label: 'Marks-Oriented Evaluator' },
];

export const FONTS = {
  typed: 'font-serif', // Merriweather via Tailwind utility
  handwritten: {
    neat: "'Patrick Hand', cursive",
    cursive: "'Dancing Script', cursive",
    casual: "'Caveat', cursive",
    indian: "'Kalam', cursive",
    flow: "'Indie Flower', cursive",
    messy: "'Zeyada', cursive",
    student_lazy: "'Reenie Beanie', cursive",
    student_good: "'Nanum Pen Script', cursive",
    marker: "'Gloria Hallelujah', cursive",
    curly: "'Courgette', cursive",
    rushed: "'Nothing You Could Do', cursive",
    classy: "'Covered By Your Grace', cursive",
  },
};