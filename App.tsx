
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Detector } from './components/Detector';
import { History } from './components/History';
import { Sidebar } from './components/Sidebar';
import { APIPlayground } from './components/APIPlayground';
import { Language, DetectionResult } from './types';

const App: React.FC = () => {
  const [history, setHistory] = useState<DetectionResult[]>([]);
  const [activeTab, setActiveTab] = useState<'detector' | 'history' | 'api'>('detector');

  const addToHistory = useCallback((result: DetectionResult) => {
    setHistory(prev => [result, ...prev]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Sidebar for navigation */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          historyCount={history.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {activeTab === 'detector' && (
              <Detector onResult={addToHistory} />
            )}
            
            {activeTab === 'history' && (
              <History 
                history={history} 
                onClear={clearHistory} 
              />
            )}

            {activeTab === 'api' && (
              <APIPlayground />
            )}
          </div>
        </main>
      </div>

      <footer className="bg-white border-t py-4 px-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} VoxCheck AI. Built for secure voice verification.
      </footer>
    </div>
  );
};

export default App;
