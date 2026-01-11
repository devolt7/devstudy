import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUserHistory, deleteHistoryItem, SavedContentItem, isFirebaseConfigured } from '../services/firebase';
import { Card, Button, Spinner } from '../components/UI';
import { Clock, FileText, GraduationCap, PenTool, Mic, Trash2, ArrowRight, Calendar, AlertCircle } from 'lucide-react';

const History: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState<SavedContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
        setError("Firebase is not configured. History is unavailable.");
        setLoading(false);
        return;
    }

    if (currentUser) {
        loadHistory();
    } else {
        setLoading(false);
    }
  }, [currentUser]);

  const loadHistory = async () => {
    if (!currentUser) return;
    try {
        const items = await fetchUserHistory(currentUser.uid);
        setHistoryItems(items);
    } catch (err) {
        console.error(err);
        setError("Failed to load history.");
    } finally {
        setLoading(false);
    }
  };

  const handleOpen = (item: SavedContentItem) => {
      // Navigate to the correct generator with the content in state
      const routeMap: Record<string, string> = {
          'assignment': '/assignment',
          'notes': '/notes',
          'report': '/report',
          'viva': '/viva'
      };
      
      const path = routeMap[item.type] || '/assignment';
      
      navigate(path, { 
          state: { 
              loadContent: item 
          } 
      });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!confirm("Are you sure you want to delete this item?")) return;
      
      setDeleteLoading(id);
      try {
          await deleteHistoryItem(id);
          setHistoryItems(prev => prev.filter(item => item.id !== id));
      } catch (err) {
          alert("Failed to delete.");
      } finally {
          setDeleteLoading(null);
      }
  };

  const getTypeIcon = (type: string) => {
      switch(type) {
          case 'assignment': return <GraduationCap size={20} />;
          case 'notes': return <FileText size={20} />;
          case 'report': return <PenTool size={20} />;
          case 'viva': return <Mic size={20} />;
          default: return <FileText size={20} />;
      }
  };

  const getTypeColor = (type: string) => {
      switch(type) {
          case 'assignment': return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400';
          case 'notes': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
          case 'report': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
          case 'viva': return 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400';
          default: return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-400';
      }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner /></div>;

  if (!currentUser) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 p-4">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                  <Clock size={40} />
              </div>
              <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in to view History</h2>
                  <p className="text-slate-500 mt-2 max-w-sm mx-auto">Your generated assignments and notes can be saved to the cloud so you never lose them.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in min-h-[80vh]">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Clock className="text-primary-600" /> History
                </h1>
                <p className="text-slate-500 mt-2">Manage your saved work saved on the cloud.</p>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {historyItems.length} Items
            </div>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
                <AlertCircle size={20} /> {error}
            </div>
        )}

        {historyItems.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                 <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mb-4">
                     <FileText size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No saved items yet</h3>
                 <p className="text-slate-500 text-sm mt-1 mb-6">Generate content and click "Save to Cloud" to see it here.</p>
                 <Button onClick={() => navigate('/assignment')}>Create New</Button>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historyItems.map((item) => (
                    <Card 
                        key={item.id} 
                        className="group relative hover:shadow-xl transition-all border border-slate-200 dark:border-slate-800 cursor-pointer overflow-hidden flex flex-col"
                        onClick={() => handleOpen(item)}
                    >
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getTypeColor(item.type)}`}>
                                    {getTypeIcon(item.type)} {item.type}
                                </span>
                                {item.updatedAt && (
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Calendar size={10} /> 
                                        {new Date(item.updatedAt?.seconds * 1000).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                                {item.title}
                            </h3>
                            
                            <p className="text-slate-500 text-sm line-clamp-3 mb-4 font-serif">
                                {item.content.replace(/[#*_\[\]]/g, '').substring(0, 150)}...
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-auto">
                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                Open <ArrowRight size={14} />
                            </span>
                            
                            <button 
                                onClick={(e) => handleDelete(e, item.id!)}
                                disabled={deleteLoading === item.id}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors z-10"
                                title="Delete"
                            >
                                {deleteLoading === item.id ? <Spinner /> : <Trash2 size={16} />}
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        )}
    </div>
  );
};

export default History;