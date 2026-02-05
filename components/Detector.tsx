
import React, { useState, useRef, useEffect } from 'react';
import { Language, Classification, DetectionResult } from '../types';
import { detectVoiceAuthenticity } from '../services/geminiService';
import { usageTracker } from '../services/usageService';

interface DetectorProps {
  onResult: (result: DetectionResult) => void;
}

export const Detector: React.FC<DetectorProps> = ({ onResult }) => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>(Language.English);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState(usageTracker.usage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync usage state
  useEffect(() => {
    const interval = setInterval(() => {
      setUsage(usageTracker.usage);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'audio/mpeg' && !selectedFile.name.endsWith('.mp3')) {
        setError("Only MP3 files are supported.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const processDetection = async () => {
    if (!file || !usageTracker.canMakeRequest()) return;

    setIsProcessing(true);
    setError(null);
    try {
      const base64 = await convertToBase64(file);
      const response = await detectVoiceAuthenticity(base64, language);

      if (response.status === 'success') {
        const detectionResult: DetectionResult = {
          ...response,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          fileName: file.name
        };
        setResult(detectionResult);
        onResult(detectionResult);
      } else {
        setError(response.explanation || response.message || "Detection failed.");
      }
    } catch (err) {
      setError("Failed to process audio file.");
    } finally {
      setIsProcessing(false);
      setUsage(usageTracker.usage);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {usage.isExhausted && (
        <div className="bg-amber-600 text-white p-4 rounded-xl flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <i className="fas fa-hand-paper text-xl"></i>
            <div>
              <p className="font-bold">Safety Quota Exhausted</p>
              <p className="text-xs opacity-90">Verification disabled to avoid potential billing charges.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Voice Analysis Lab</h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Usage Guard</span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${usage.requests > 40 ? 'bg-red-500' : 'bg-indigo-500'}`}
                    style={{ width: `${(usage.requests / usage.maxRequests) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-600">{usage.requests}/{usage.maxRequests}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {!result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">1. Select Target Language</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(Language).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      disabled={usage.isExhausted}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                        language === lang
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 disabled:opacity-50'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">2. Upload Audio Sample</label>
                <div 
                  onClick={() => !usage.isExhausted && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
                    usage.isExhausted ? 'bg-slate-50 cursor-not-allowed border-slate-100' :
                    file ? 'border-indigo-400 bg-indigo-50 cursor-pointer' : 'border-slate-200 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".mp3,audio/mpeg"
                    disabled={usage.isExhausted}
                    className="hidden"
                  />
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                    usage.isExhausted ? 'bg-slate-200 text-slate-400' :
                    file ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <i className={`fas ${usage.isExhausted ? 'fa-lock' : file ? 'fa-check' : 'fa-upload'}`}></i>
                  </div>
                  {file ? (
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700">
                        {usage.isExhausted ? 'Quota Exhausted' : 'Click to upload MP3'}
                      </p>
                      <p className="text-xs text-slate-500">Max file size 20MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!result && (
            <div className="flex justify-center pt-4">
              <button
                disabled={!file || isProcessing || usage.isExhausted}
                onClick={processDetection}
                className={`w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                  !file || isProcessing || usage.isExhausted
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:scale-95'
                }`}
              >
                {isProcessing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Decomposing Audio...
                  </>
                ) : usage.isExhausted ? (
                  <>
                    <i className="fas fa-ban"></i>
                    Limit Reached
                  </>
                ) : (
                  <>
                    <i className="fas fa-shield-halved"></i>
                    Verify Authenticity
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
              <i className="fas fa-exclamation-circle"></i>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm w-full md:w-64 shrink-0">
                    <div className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center ${
                      result.classification === Classification.AI_GENERATED 
                        ? 'border-red-100 text-red-600' 
                        : 'border-green-100 text-green-600'
                    }`}>
                      <span className="text-3xl font-black">{(result.confidenceScore * 100).toFixed(0)}%</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Confidence</span>
                    </div>
                    <div className={`mt-4 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                      result.classification === Classification.AI_GENERATED 
                        ? 'bg-red-600 text-white' 
                        : 'bg-green-600 text-white'
                    }`}>
                      {result.classification.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">Source Analysis</h3>
                      <p className="text-xl font-bold text-slate-800">
                        {result.classification === Classification.AI_GENERATED 
                          ? "Synthetic Origin Detected" 
                          : "Verified Human Audio"}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-100">
                      <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2">Forensic Explanation</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{result.explanation}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Language</p>
                        <p className="text-sm font-semibold text-slate-800">{result.language}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Detection ID</p>
                        <p className="text-sm font-mono text-slate-800">#{result.id}</p>
                      </div>
                    </div>

                    <button 
                      onClick={reset}
                      className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-2 pt-2"
                    >
                      <i className="fas fa-redo text-xs"></i>
                      Analyze New Sample
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* ... keeping info cards ... */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <i className="fas fa-language"></i>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Multi-Lingual</h4>
            <p className="text-xs text-slate-500 mt-1">Native support for 5 distinct languages including Tamil and Telugu.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
            <i className="fas fa-brain"></i>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Neural Mapping</h4>
            <p className="text-xs text-slate-500 mt-1">Deep analysis of sub-frequency spectral patterns unique to LLM synthesis.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <i className="fas fa-lock"></i>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Encrypted Processing</h4>
            <p className="text-xs text-slate-500 mt-1">Samples are processed in volatile memory with zero persistent storage.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
