
import React, { useState } from 'react';
import { DetectionResult, Classification } from '../types';

interface HistoryProps {
  history: DetectionResult[];
  onClear: () => void;
}

export const History: React.FC<HistoryProps> = ({ history, onClear }) => {
  const [filter, setFilter] = useState<Classification | 'ALL'>('ALL');

  const filteredHistory = history.filter(item => 
    filter === 'ALL' ? true : item.classification === filter
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Detection History</h2>
        <div className="flex items-center gap-4">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-xs font-bold border rounded-lg px-2 py-1 outline-none border-slate-200"
          >
            <option value="ALL">All Results</option>
            <option value={Classification.AI_GENERATED}>AI Only</option>
            <option value={Classification.HUMAN}>Human Only</option>
          </select>
          <button 
            onClick={onClear}
            className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredHistory.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Sample</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Language</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Classification</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Confidence</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.classification === Classification.AI_GENERATED ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        <i className="fas fa-file-audio"></i>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{item.fileName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {item.language}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                      item.classification === Classification.AI_GENERATED 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.classification.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.classification === Classification.AI_GENERATED ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${item.confidenceScore * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{(item.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400">
            <i className="fas fa-box-open text-4xl mb-4 opacity-20"></i>
            <p className="text-sm font-medium">No detection records found</p>
          </div>
        )}
      </div>
    </div>
  );
};
