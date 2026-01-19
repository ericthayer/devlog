
import React, { useState, useEffect, useRef } from 'react';
import { AppView, CaseStudy, Asset } from './types';
import { Navigation } from './components/Navigation';
import { AppHeader } from './components/AppHeader';
import { Drawer } from './components/Drawer';
import { TimelineView } from './components/TimelineView';
import { UploadView } from './components/UploadView';
import { ArticleView } from './components/ArticleView';
import { SettingsView } from './components/SettingsView';
import { EditorView } from './components/EditorView';
import { ProcessingModal } from './components/ProcessingModal';
// Fixed: Added missing Icon import
import { Icon } from './components/Icon';
import { analyzeAsset, generateCaseStudy } from './services/geminiService';
import { DEMO_STUDIES, DEMO_ASSETS } from './utils/demoData';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('timeline');
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<CaseStudy | null>(null);
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(false);
  
  const [processingStep, setProcessingStep] = useState<'analyzing' | 'generating' | 'finalizing'>('analyzing');
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const cancelRef = useRef(false);

  useEffect(() => {
    if (isUploading && !isMinimized) {
      const timer = setTimeout(() => setIsMinimized(true), 0);
      return () => clearTimeout(timer);
    }
  }, [isUploading, isMinimized]);

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
    setProcessingStep('analyzing');
    setProcessingProgress(0);
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
        setProcessingProgress(((i + 1) / files.length) * 100);
      } catch (err) {
        console.error("Analysis failed for", file.name, err);
      }
    }

    if (!cancelRef.current) {
      setAssets(prev => [...prev, ...newAssets]);
    }
    
    setIsUploading(false);
    setIsMinimized(true);
  };

  const createStudyFromAssets = async () => {
    if (assets.length === 0) return;
    setIsUploading(true);
    setIsMinimized(false);
    setProcessingStep('generating');
    setProcessingProgress(10);
    cancelRef.current = false;

    try {
      const progressTimer = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 2, 75));
      }, 500);

      const newStudy = await generateCaseStudy(assets.slice(-3), "Synthesize recent progress into a technical log.", isThinkingEnabled);
      clearInterval(progressTimer);

      if (cancelRef.current) return;

      setProcessingStep('finalizing');
      setProcessingProgress(90);

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

      setProcessingProgress(100);
      setTimeout(() => {
        setCaseStudies(prev => [fullStudy, ...prev]);
        setAssets([]);
        setSelectedArticle(fullStudy);
        setView('article');
        setIsUploading(false);
        setIsMinimized(false);
        setIsUploadOpen(false);
      }, 500);
    } catch (err) {
      console.error("Case study generation failed", err);
      setIsUploading(false);
    }
  };

  const handleSaveStudy = (updatedStudy: CaseStudy) => {
    setCaseStudies(prev => prev.map(s => s.id === updatedStudy.id ? updatedStudy : s));
    setSelectedArticle(updatedStudy);
    setView('article');
  };

  const cancelWorkflow = () => {
    cancelRef.current = true;
    setIsUploading(false);
    setIsMinimized(false);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#F9F9F9] selection:bg-[#FFF500] selection:text-black overflow-hidden">
      <Navigation activeView={view === 'editor' ? 'article' : view} onViewChange={(v) => { setView(v); setSelectedArticle(null); }} />
      
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <AppHeader 
          activeView={view} 
          isUploadOpen={isUploadOpen}
          onToggleUpload={() => setIsUploadOpen(!isUploadOpen)}
          onBack={view === 'article' || view === 'editor' ? () => { setView('timeline'); setSelectedArticle(null); } : undefined}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto no-scrollbar bg-[#F9F9F9]">
            {view === 'timeline' && (
              <TimelineView 
                caseStudies={caseStudies} 
                assetsCount={caseStudies.reduce((acc, curr) => acc + curr.artifacts.length, 0)}
                onSelectStudy={(study) => { setSelectedArticle(study); setView('article'); }}
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
              <SettingsView onClearData={() => { localStorage.removeItem('devsigner_data_v3'); window.location.reload(); }} />
            )}
          </main>

          <Drawer isOpen={isUploadOpen}>
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
          </Drawer>
        </div>
      </div>

      {/* Background Status Indicator */}
      <div className="fixed bottom-24 inset-x-0 m-auto w-fit md:bottom-8 z-[60] flex flex-col items-end gap-3 pointer-events-none">
        {isUploading && isMinimized && (
          <div className="bg-[#FFF500] brutalist-border p-4 brutalist-shadow-sm flex items-center gap-4 pointer-events-auto animate-in slide-in-from-right-full">
            <div className="bg-black p-2">
              <Icon name="Cpu" size={20} className="text-[#FFF500] animate-spin" />
            </div>
            <div className="flex flex-col min-w-[140px]">
              <span className="text-xs font-black uppercase italic">AI Processing...</span>
              <div className="w-full h-1 bg-black/10 mt-1 mb-1">
                <div className="h-full bg-black transition-all" style={{ width: `${processingProgress}%` }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsMinimized(false)} className="mono text-[9px] font-bold uppercase underline hover:no-underline" style={{ pointerEvents: 'auto' }}>Expand</button>
                <span className="text-gray-400">/</span>
                <button onClick={cancelWorkflow} className="mono text-[9px] font-bold uppercase underline hover:no-underline text-red-600" style={{ pointerEvents: 'auto' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Processing Modal Component */}
      {isUploading && (
        <ProcessingModal 
          isMinimized={isMinimized}
          isThinkingEnabled={isThinkingEnabled}
          step={processingStep}
          progress={processingProgress}
          onMinimize={setIsMinimized}
          onCancel={cancelWorkflow}
        />
      )}
    </div>
  );
};

export default App;
