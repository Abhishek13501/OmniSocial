import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutDashboard, 
  History, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Trash2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ 
  history = [], 
  onSelectHistory, 
  selectedId, 
  onDeleteHistory,
  isOpen, 
  setIsOpen 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    if (onSelectHistory) {
      onSelectHistory(item);
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (onDeleteHistory) {
      onDeleteHistory(id);
    }
  };

  return (
    <aside className={`border-r border-darkborder/70 bg-darkbg/95 backdrop-blur-md transition-all duration-300 flex flex-col justify-between shrink-0 h-[calc(100vh-64px)] sticky top-16 z-40 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Sidebar Header & Toggle */}
      <div className="p-4 border-b border-darkborder/60 flex items-center justify-between overflow-hidden">
        {isOpen ? (
          <div className="flex items-center gap-2 animate-fade-in">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Workspace Panel</span>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <Sparkles className="h-4 w-4 text-brand-400" />
          </div>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded bg-slate-900 border border-darkborder text-slate-500 hover:text-slate-200 transition-colors hidden md:block"
        >
          {isOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Main sidebar body navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        
        {/* Navigation list */}
        <div className="space-y-1">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isOpen ? 'justify-start' : 'justify-center'
            } bg-brand-500/10 text-brand-400 border border-brand-500/10`}
          >
            <LayoutDashboard className="h-4 w-4 text-brand-400 shrink-0" />
            {isOpen && <span className="animate-fade-in">Dashboard</span>}
          </Link>
          
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all ${
              isOpen ? 'justify-start' : 'justify-center'
            }`}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {isOpen && <span className="animate-fade-in">Marketing Site</span>}
          </Link>
        </div>

        {/* History archive List */}
        <div className="space-y-2">
          {isOpen ? (
            <div className="flex items-center gap-1.5 px-3 mb-1 animate-fade-in">
              <History className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Draft History</span>
            </div>
          ) : (
            <div className="border-t border-darkborder/60 my-4" />
          )}

          {isOpen ? (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 animate-fade-in">
              {history.length === 0 ? (
                <div className="text-[11px] text-slate-600 px-3 py-2 italic">
                  No records stored yet.
                </div>
              ) : (
                history.map((item) => {
                  const isSelected = selectedId === item.id;
                  const itemTitle = item.url ? item.url.replace(/^https?:\/\/(www\.)?/, '') : (item.fileName || 'Document Text');
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-brand-500/5 border-brand-500/40' 
                          : 'bg-darkcard/40 border-darkborder/80 hover:border-slate-800 hover:bg-slate-900/40'
                      }`}
                    >
                      <FileText className={`h-4 w-4 mt-0.5 shrink-0 ${
                        isSelected ? 'text-brand-400' : 'text-slate-500'
                      }`} />
                      
                      <div className="flex-1 min-w-0 pr-6">
                        <h4 className="text-[11px] font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                          {itemTitle}
                        </h4>
                        <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-500">
                          <Calendar className="h-2.5 w-2.5" />
                          <span>{item.dateLabel || 'Just now'}</span>
                        </div>
                      </div>

                      {/* Delete icon on hover */}
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800/80 transition-all duration-150"
                        title="Delete record"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5">
              {history.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    selectedId === item.id 
                      ? 'bg-brand-500/10 border-brand-500/40 text-brand-400' 
                      : 'bg-darkcard/40 border-darkborder/80 text-slate-500 hover:text-white'
                  }`}
                  title={item.url || item.fileName || 'Draft'}
                >
                  <FileText className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-darkborder/60 bg-slate-950/20">
        {isOpen ? (
          <div className="flex items-center gap-2.5 px-1 animate-fade-in">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-xs font-semibold text-white shadow-md">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Workspace Account</p>
              <p className="text-xs text-slate-300 font-medium truncate font-sans">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-xs font-semibold text-white shadow-md" title={user?.email}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
