
import React from 'react';

interface SidebarProps {
  activeTab: 'detector' | 'history' | 'api';
  setActiveTab: (tab: 'detector' | 'history' | 'api') => void;
  historyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, historyCount }) => {
  const tabs = [
    { id: 'detector', label: 'Detection Lab', icon: 'fa-microscope' },
    { id: 'history', label: 'History', icon: 'fa-history', count: historyCount },
    { id: 'api', label: 'API Specs', icon: 'fa-code' },
  ] as const;

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 shrink-0 overflow-x-auto md:overflow-y-auto">
      <nav className="flex md:flex-col gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className={`fas ${tab.icon} w-5`}></i>
            <span className="flex-1 text-left">{tab.label}</span>
            {'count' in tab && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-indigo-100' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="hidden md:block mt-8 p-4 bg-slate-900 rounded-xl text-white">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Supported Engines</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span>English Neural</span>
            <span className="text-green-400">Stable</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Indic Multi-Core</span>
            <span className="text-green-400">Stable</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Malayalam v2</span>
            <span className="text-blue-400">Beta</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
