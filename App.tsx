import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AssignmentGenerator from './pages/AssignmentGenerator';
import NotesGenerator from './pages/NotesGenerator';
import ReportGenerator from './pages/ReportGenerator';
import Summarizer from './pages/Summarizer';
import SelfQuiz from './pages/SelfQuiz';
import VivaGenerator from './pages/VivaGenerator';
import History from './pages/History';
import AboutUs from './pages/AboutUs';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="history" element={<History />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="assignment" element={<AssignmentGenerator />} />
            <Route path="notes" element={<NotesGenerator />} />
            <Route path="report" element={<ReportGenerator />} />
            <Route path="viva" element={<VivaGenerator />} />
            <Route path="summarizer" element={<Summarizer />} />
            <Route path="selfquiz" element={<SelfQuiz />} />
            <Route path="images" element={<Navigate to="/summarizer" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;