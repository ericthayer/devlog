
import React, { useState, useEffect, useRef } from 'react';
import { AppView, CaseStudy, Asset, UserPreferences } from './types';
import { Navigation } from './components/Navigation';
import { AppHeader } from './components/AppHeader';
import { Drawer } from './components/Drawer';
import { TimelineView } from './components/TimelineView';
import { UploadView } from './components/UploadView';
import { ArticleView } from './components/ArticleView';
import { SettingsView } from './components/SettingsView';
import { EditorView } from './components/EditorView';
import { ProcessingModal } from './components/ProcessingModal';
import { ProcessingStatus } from './components/ProcessingStatus';
import { SystemHud } from './components/SystemHud';
import { Icon } from './components/Icon';
import { Toast } from './components/Toast';
import { analyzeAsset, generateCaseStudy } from './services/geminiService';
import { DEMO_STUDIES, DEMO_ASSETS } from './utils/demoData';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  autoRename: true,
  exportFormat: 'markdown'
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('timeline');
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isUploading, setIsUploading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<CaseStudy | null>(null);
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [processingStep, setProcessingStep] = useState<'analyzing' | 'generating' | 'finalizing'>('analyzing');
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const cancelRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('devsigner_data_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCaseStudies(parsed.caseStudies || []);
      setAssets(parsed.assets || []);
      if (parsed.preferences) {
        setPreferences(parsed.preferences);
      }
    } else {
      setCaseStudies(DEMO_STUDIES);
      setAssets([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('devsigner_data_v3', JSON.stringify({ caseStudies, assets, preferences }));
  }, [caseStudies, assets, preferences]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setIsMinimized(true);
    setProcessingStep('analyzing');
    setProcessingProgress(0);
    cancelRef.current = false;
    
    const newAssets: Asset[] = [];

    for (let i = 0; i < files.length; i++) {
      if (cancelRef.current) break;
      
      const file = files[i];
      try {
        let assetData: Partial<Asset> = {};
        
        if (preferences.autoRename) {
          assetData = await analyzeAsset(file, file.type, isThinkingEnabled);
        }
        
        if (cancelRef.current) break;

        const asset: Asset = {
          id: Math.random().toString(36).substr(2, 9),
          originalName: file.name,
          aiName: preferences.autoRename 
            ? `${assetData.topic || 'misc'}-${assetData.type || 'file'}-${assetData.context || 'dev'}-${assetData.variant || 'v1'}-${assetData.version || '1.0'}-${file.name.split('.').pop()}`
            : file.name,
          type: assetData.type || 'unknown',
          topic: assetData.topic || 'misc',
          context: assetData.context || 'dev',
          variant: assetData.variant || 'v1',
          version: assetData.version || '1.0',
          fileType: file.name.split('.').pop() || '',
          url: URL.createObjectURL(file),
          size: file.size
        };
        newAssets.push(asset);
        setProcessingProgress(((i + 1) / files.length) * 100);
      } catch (err: any) {
        console.error("Analysis failed for", file.name, err);
        setErrorMessage(`Analysis failed for ${file.name}: ${err.message}`);
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
    setIsMinimized(true);
    setProcessingStep('generating');
    setProcessingProgress(10);
    cancelRef.current = false;

    let progressTimer: any;

    try {
      progressTimer = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev < 60) return prev + 4;
          if (prev < 80) return prev + 2;
          if (prev < 90) return prev + 0.5;
          return prev;
        });
      }, 600);

      const newStudy = await generateCaseStudy(assets.slice(-3), "Synthesize recent progress into a technical log.", isThinkingEnabled);
      clearInterval(progressTimer);

      if (cancelRef.current) return;

      setProcessingStep('finalizing');
      setProcessingProgress(95);

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
        setIsMinimized(true);
        setIsUploadOpen(false);
      }, 500);
    } catch (err: any) {
      if (progressTimer) clearInterval(progressTimer);
      console.error("Case study generation failed", err);
      setErrorMessage(`Synthesis failed: ${err.message}`);
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
    setIsMinimized(true);
  };

  const toggleUpload = () => {
    if (!isUploadOpen) setIsSettingsOpen(false);
    setIsUploadOpen(!isUploadOpen);
  };

  const toggleSettings = () => {
    if (!isSettingsOpen) setIsUploadOpen(false);
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  return (
    <div className={`h-screen flex flex-col md:flex-row bg-[#F9F9F9] selection:bg-[#FFF500] selection:text-black overflow-hidden ${preferences.theme === 'dark' ? 'dark-mode-sim' : ''}`}>
      <Navigation
        activeView={view === 'editor' ? 'article' : view} 
        onViewChange={(v) => { 
          setView(v); 
          setSelectedArticle(null); 
          setIsUploadOpen(false);
          setIsSettingsOpen(false);
        }} 
      />
      
      <div className="flex-1 flex flex-col md:pl-0 min-w-0">
        <AppHeader 
          activeView={view} 
          isUploadOpen={isUploadOpen}
          isSettingsOpen={isSettingsOpen}
          onToggleUpload={toggleUpload}
          onToggleSettings={toggleSettings}
          onBack={view === 'article' || view === 'editor' ? () => { setView('timeline'); setSelectedArticle(null); } : undefined}
        />
        
        <div className="flex-1 flex overflow-hidden h-dvh">
          <main className="flex-1 overflow-y-auto no-scrollbar bg-[#F9F9F9] relative flex">
            <div className="w-full flex-1 grid grid-rows-[1fr_auto]">
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

              <div className={`flex flex-col md:flex-row gap- p-4 md:p-12 justify-between mt-auto" ${view === 'article' ? 'bg-white': ''}`}>
                <div className="bg-zinc-600 text-[#FFF500] p-4 brutalist-border brutalist-shadow-sm mono text-[10px] font-bold italic">
                  v1.0.0-alpha // OFFLINE CACHE: OK
                </div>                        
                <SystemHud isUploading={isUploading} />
              </div>
            </div>
          </main>

          <Drawer isOpen={isUploadOpen || isSettingsOpen}>
            {isUploadOpen ? (
              <UploadView 
                assets={assets}
                isUploading={isUploading}
                progress={processingProgress}
                isThinkingEnabled={isThinkingEnabled}
                onToggleThinking={() => setIsThinkingEnabled(!isThinkingEnabled)}
                onFileUpload={handleFileUpload}
                onRemoveAsset={(id) => setAssets(assets.filter(a => a.id !== id))}
                onCreateStudy={createStudyFromAssets}
                onExpand={() => setIsMinimized(false)}
                onCancel={cancelWorkflow}
                onAddDemoAssets={(demo) => setAssets(prev => [...prev, ...demo])}
              />
            ) : isSettingsOpen ? (
              <SettingsView 
                preferences={preferences}
                onUpdatePreferences={handleUpdatePreferences}
                onClearData={() => { localStorage.removeItem('devsigner_data_v3'); window.location.reload(); }} 
              />
            ) : null}
          </Drawer>
        </div>
      </div>

      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[60] flex flex-col items-end gap-3 pointer-events-none">
        {isUploading && isMinimized && !isUploadOpen && !isSettingsOpen && (
          <ProcessingStatus 
            variant="floating"
            progress={processingProgress}
            onExpand={() => setIsMinimized(false)}
            onCancel={cancelWorkflow}
          />
        )}
      </div>

      {isUploading && !isMinimized && (
        <ProcessingModal 
          isMinimized={isMinimized}
          isThinkingEnabled={isThinkingEnabled}
          step={processingStep}
          progress={processingProgress}
          onMinimize={() => setIsMinimized(true)}
          onCancel={cancelWorkflow}
        />
      )}

      {errorMessage && (
        <Toast 
          message={errorMessage} 
          onClose={() => setErrorMessage(null)} 
          type="error"
        />
      )}
    </div>
  );
};

export default App;
