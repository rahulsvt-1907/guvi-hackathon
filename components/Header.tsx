
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <i className="fas fa-wave-square text-xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">VoxCheck <span className="text-indigo-600">AI</span></h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Voice Authenticity Protocol</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          System Online
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <i className="fas fa-gear text-lg"></i>
        </button>
      </div>
    </header>
  );
};
