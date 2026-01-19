
import React, { useState, useEffect, useRef } from 'react';
import { AppView, CaseStudy, Asset } from './types';
import { Navigation } from './components/Navigation';
import { Icon } from './components/Icon';
import { TimelineView } from './components/TimelineView';
import { UploadView } from './components/UploadView';
import { ArticleView } from './components/ArticleView';
import { SettingsView } from './components/SettingsView';
import { EditorView } from './components/EditorView';
import { analyzeAsset, generateCaseStudy } from './services/geminiService';
import { DEMO_STUDIES, DEMO_ASSETS } from './utils/demoData';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('timeline');
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<CaseStudy | null>(null);
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(true);
  
  const cancelRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('devsigner_data_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCaseStudies(parsed.caseStudies || []);
      setAssets(parsed.assets || []);
    } else {
      setCaseStudies(DEMO_STUDIES);
      setAssets([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('devsigner_data_v3', JSON.stringify({ caseStudies, assets }));
  }, [caseStudies, assets]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setIsMinimized(false);
    cancelRef.current = false;
    
    const newAssets: Asset[] = [];

    for (let i = 0; i < files.length; i++) {
      if (cancelRef.current) break;
      
      const file = files[i];
      try {
        const analysis = await analyzeAsset(file, file.type, isThinkingEnabled);
        
        if (cancelRef.current) break;

        const asset: Asset = {
          id: Math.random().toString(36).substr(2, 9),
          originalName: file.name,
          aiName: `${analysis.topic || 'misc'}-${analysis.type || 'file'}-${analysis.context || 'dev'}-${analysis.variant || 'v1'}-${analysis.version || '1.0'}-${file.name.split('.').pop()}`,
          type: analysis.type || 'unknown',
          topic: analysis.topic || 'misc',
          context: analysis.context || 'dev',
          variant: analysis.variant || 'v1',
          version: analysis.version || '1.0',
          fileType: file.name.split('.').pop() || '',
          url: URL.createObjectURL(file),
          size: file.size
        };
        newAssets.push(asset);
      } catch (err) {
        console.error("Analysis failed for", file.name, err);
      }
    }

    if (!cancelRef.current) {
      setAssets(prev => [...prev, ...newAssets]);
    }
    
    setIsUploading(false);
    setIsMinimized(false);
  };

  const createStudyFromAssets = async () => {
    if (assets.length === 0) return;
    setIsUploading(true);
    setIsMinimized(false);
    cancelRef.current = false;

    try {
      const newStudy = await generateCaseStudy(assets.slice(-3), "Synthesize recent progress into a technical log.", isThinkingEnabled);
      
      if (cancelRef.current) return;

      const fullStudy: CaseStudy = {
        id: Math.random().toString(36).substr(2, 9),
        title: newStudy.title || 'UNTITLED CONTRIBUTION',
        status: 'draft',
        date: new Date().toISOString(),
        tags: newStudy.tags || ['LOG'],
        problem: newStudy.problem || 'No problem statement provided.',
        approach: newStudy.approach || 'Standard implementation.',
        artifacts: [...assets],
        outcome: newStudy.outcome || 'Awaiting outcome analysis.',
        nextSteps: newStudy.nextSteps || 'Review and iterate.',
        seoMetadata: newStudy.seoMetadata || { title: '', description: '', keywords: [] }
      };

      setCaseStudies(prev => [fullStudy, ...prev]);
      setAssets([]);
      setSelectedArticle(fullStudy);
      setView('article');
    } catch (err) {
      console.error("Case study generation failed", err);
    } finally {
      setIsUploading(false);
      setIsMinimized(false);
    }
  };

  const handleSaveStudy = (updatedStudy: CaseStudy) => {
    setCaseStudies(prev => prev.map(s => s.id === updatedStudy.id ? updatedStudy : s));
    setSelectedArticle(updatedStudy);
    setView('article');
  };

  const clearDatabase = () => {
    localStorage.removeItem('devsigner_data_v3');
    window.location.reload();
  };

  const cancelWorkflow = () => {
    cancelRef.current = true;
    setIsUploading(false);
    setIsMinimized(false);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-64 flex flex-col bg-[#F9F9F9] selection:bg-[#FFF500] selection:text-black">
      <Navigation activeView={view === 'editor' ? 'article' : view} onViewChange={(v) => { setView(v); setSelectedArticle(null); }} />
      
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {view === 'timeline' && (
          <TimelineView 
            caseStudies={caseStudies} 
            assetsCount={caseStudies.reduce((acc, curr) => acc + curr.artifacts.length, 0)}
            onViewUpload={() => setView('upload')}
            onSelectStudy={(study) => { setSelectedArticle(study); setView('article'); }}
          />
        )}
        
        {view === 'upload' && (
          <UploadView 
            assets={assets}
            isUploading={isUploading}
            isThinkingEnabled={isThinkingEnabled}
            onToggleThinking={() => setIsThinkingEnabled(!isThinkingEnabled)}
            onFileUpload={handleFileUpload}
            onRemoveAsset={(id) => setAssets(assets.filter(a => a.id !== id))}
            onCreateStudy={createStudyFromAssets}
            onAddDemoAssets={(demo) => setAssets(prev => [...prev, ...demo])}
          />
        )}

        {view === 'article' && selectedArticle && (
          <ArticleView 
            study={selectedArticle} 
            onBack={() => setView('timeline')} 
            onEdit={(study) => { setSelectedArticle(study); setView('editor'); }}
          />
        )}

        {view === 'editor' && selectedArticle && (
          <EditorView 
            study={selectedArticle}
            onSave={handleSaveStudy}
            onCancel={() => setView('article')}
          />
        )}

        {view === 'settings' && (
          <SettingsView onClearData={clearDatabase} />
        )}
      </main>

      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[60] flex flex-col items-end gap-3 pointer-events-none">
        {isUploading && isMinimized && (
          <div className="bg-[#FFF500] brutalist-border p-4 brutalist-shadow-sm flex items-center gap-4 pointer-events-auto animate-in slide-in-from-right-full">
            <div className="bg-black p-2">
              <Icon name="Cpu" size={20} className="text-[#FFF500] animate-spin" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase italic">AI Processing...</span>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setIsMinimized(false)} className="mono text-[9px] font-bold uppercase underline hover:no-underline">Expand</button>
                <span className="text-gray-400">/</span>
                <button onClick={cancelWorkflow} className="mono text-[9px] font-bold uppercase underline hover:no-underline text-red-600">Cancel</button>
              </div>
            </div>
          </div>
        )}
        <div className="bg-zinc-600 text-[#FFF500] p-4 brutalist-border brutalist-shadow-sm mono text-[10px] font-bold uppercase italic">
          CPU_LOAD: {isUploading ? '98%' : '2%'} // RAM: 14GB // SYSTEM_ONLINE
        </div>
      </div>

      {isUploading && !isMinimized && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-8 backdrop-blur-md">
            <div className="bg-[#FFF500] brutalist-border p-12 md:p-20 brutalist-shadow text-center max-w-lg relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => setIsMinimized(true)} className="p-2 bg-black text-white hover:bg-zinc-800 transition-colors brutalist-border"><Icon name="Minimize2" size={18} /></button>
                  <button onClick={cancelWorkflow} className="p-2 bg-red-600 text-white hover:bg-red-700 transition-colors brutalist-border"><Icon name="X" size={18} /></button>
                </div>
                <div className="relative inline-block mb-10">
                  <Icon name="Cpu" size={80} className="animate-spin text-black" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-black animate-ping" />
                  </div>
                </div>
                <div className="mb-4 space-y-1">
                  <h3 className="text-4xl font-black uppercase italic leading-tight">
                    {isThinkingEnabled ? 'Deep Intelligence Engaged...' : 'Gemini Thinking...'}
                  </h3>
                  <div className="mono text-[10px] font-bold tracking-widest opacity-60 uppercase">
                    SYSTEM_MODE: {isThinkingEnabled ? 'GEMINI_3_PRO_MAX_REASONING' : 'STANDARD_SYNTHESIS'}
                  </div>
                </div>
                <div className="space-y-2 mono text-xs font-bold uppercase tracking-widest opacity-70 mt-8 text-left max-w-xs mx-auto">
                  <p className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full animate-pulse" />Parsing raw artifact data</p>
                  <p className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full animate-pulse delay-75" />Synthesizing technical narrative</p>
                  {isThinkingEnabled && <p className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full animate-pulse delay-100" />Deep reasoning budget active</p>}
                </div>
                <div className="mt-12 pt-8 border-t-2 border-black/10">
                  <button onClick={() => setIsMinimized(true)} className="mono text-xs font-black uppercase underline hover:no-underline">Continue working in background</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
