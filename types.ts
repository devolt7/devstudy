
export type Stream = 'Engineering' | 'Science' | 'Commerce' | 'Management' | 'Arts' | 'Other';

export type WritingMode = 'typed' | 'handwritten' | 'hybrid';

export type HandwritingStyle = 
  | 'neat' 
  | 'cursive' 
  | 'casual' 
  | 'indian' 
  | 'flow' 
  | 'messy' 
  | 'student_lazy' 
  | 'student_good' 
  | 'marker' 
  | 'curly' 
  | 'rushed' 
  | 'classy';

export type PenType = 'ballpoint' | 'gel';

export type PaperType = 'ruled' | 'plain' | 'margin';

export type PaperTone = 'clean' | 'dull' | 'realistic';

export type PaperSize = 'a4' | 'letter' | 'notebook';

export type InkColor = 
  | 'blue' 
  | 'black' 
  | 'red'
  | 'dark_blue' 
  | 'light_blue' 
  | 'royal_blue' 
  | 'ocean_blue' 
  | 'purple'
  | 'custom';

export type QAColorMode = 'classic' | 'inverse' | 'unified';

export type TeacherMode = 'strict' | 'average' | 'lenient';

export interface StudentDetails {
  name: string;
  instituteName: string;
  branch: string;
  semester: string;
  enrollmentNo: string;
  subjectCode: string;
  stream?: Stream; // Added
  defaultSubject?: string; // Added
}

export interface UserProfile extends StudentDetails {
  uid: string;
  email: string | null;
  photoURL: string | null;
  isProfileComplete: boolean;
  createdAt?: any;
}

export interface GenerationConfig {
  stream: Stream;
  topic: string;
  tone: 'simple' | 'academic' | 'formal';
  teacherMode: TeacherMode;
  additionalInstructions?: string;
}

export interface GeneratedContent {
  title: string;
  content: string;
  versions?: {
    simple: string;
    detailed: string;
    exam: string;
  };
  intentDetected?: string;
  vivaQuestions?: string; 
  sections?: { title: string; body: string }[];
  type: 'assignment' | 'notes' | 'report' | 'viva';
}

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
}

export interface LayoutContextType {
  isEditorMode: boolean;
  setEditorMode: (val: boolean) => void;
}
