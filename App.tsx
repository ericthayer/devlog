
import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
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
import { ManualAssetModal } from './components/ManualAssetModal';
import { analyzeAsset, generateCaseStudy } from './services/geminiService';
import { saveCaseStudy, getCaseStudies } from './services/dbService';
import { DEMO_STUDIES, DEMO_ASSETS } from './utils/demoData';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  autoRename: true,
  exportFormat: 'markdown'
};

const SUPPORTED_UNPACK_EXTENSIONS = ['md', 'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'json', 'txt', 'py', 'go', 'rs', 'svg', 'fig', 'sql'];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('timeline');
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isUploading, setIsUploading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<CaseStudy | null>(null);
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [processingStep, setProcessingStep] = useState<'analyzing' | 'generating' | 'finalizing'>('analyzing');
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const cancelRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedStudies = await getCaseStudies();
        if (savedStudies && savedStudies.length > 0) {
           // Transform DB shape if necessary, assuming mostly match 
           // We might need to map DB columns to CaseStudy type if names differ significantly
           // But since we control both, we can align them.
           // For now, let's keep local storage as a cache/fallback or remove it?
           // The plan didn't explicitly remove local storage, but prioritizing DB is good.
           // Let's just fetch from DB.
           // Actually, getCaseStudies just returns the rows. We need to match the CaseStudy interface.
           // Our dbService.ts getCaseStudies returns 'any[]' effectively because supabase types aren't fully strict here without deeper setup.
           // Let's rely on basic mapping.
           // For this step, I will just implement the SAVE functionality first as requested by the plan.
           // Loading is a "nice to have" or part of "Verify Data Persistence".
           // Let's stick to the immediate task: Implementing Client... "save".
        }
      } catch (e) {
        console.error("Failed to load from DB", e);
      }
    };
    // loadData(); // Uncomment to enable loading
    
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

  const processFile = async (file: File | Blob, name: string, mimeType: string, index: number, total: number): Promise<Asset | null> => {
    try {
      let assetData: Partial<Asset> = {};
      
      const fileToProcess = file instanceof File ? file : new File([file], name, { type: mimeType });

      if (preferences.autoRename) {
        assetData = await analyzeAsset(fileToProcess, mimeType || 'text/plain', isThinkingEnabled);
      }
      
      if (cancelRef.current) return null;

      const extension = name.split('.').pop() || 'txt';
      const asset: Asset = {
        id: Math.random().toString(36).substr(2, 9),
        originalName: name,
        aiName: preferences.autoRename 
          ? `${assetData.topic || 'misc'}-${assetData.type || 'file'}-${assetData.context || 'dev'}-${assetData.variant || 'v1'}-${assetData.version || '1.0'}-${extension}`
          : name,
        type: assetData.type || 'unknown',
        topic: assetData.topic || 'misc',
        context: assetData.context || 'dev',
        variant: assetData.variant || 'v1',
        version: assetData.version || '1.0',
        fileType: extension,
        url: (fileToProcess.size < 30000000 && !mimeType.includes('zip')) ? URL.createObjectURL(fileToProcess) : '',
        size: fileToProcess.size
      };
      
      setProcessingProgress(((index + 1) / total) * 100);
      return asset;
    } catch (err: any) {
      console.error("Analysis failed for", name, err);
      setErrorMessage(`Analysis failed for ${name}: ${err.message}`);
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setIsMinimized(true);
    setProcessingStep('analyzing');
    setProcessingProgress(0);
    cancelRef.current = false;
    
    const assetsToProcess: { file: File | Blob; name: string; type: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.toLowerCase().endsWith('.zip')) {
        try {
          const zip = new JSZip();
          const contents = await zip.loadAsync(file);
          const zipFiles = Object.keys(contents.files).filter(fileName => {
            const ext = fileName.split('.').pop()?.toLowerCase();
            return !contents.files[fileName].dir && ext && SUPPORTED_UNPACK_EXTENSIONS.includes(ext);
          });

          for (const zipFileName of zipFiles) {
            const zipFile = contents.files[zipFileName];
            const blob = await zipFile.async('blob');
            assetsToProcess.push({ 
              file: blob, 
              name: zipFileName, 
              type: zipFileName.split('.').pop() || 'txt' 
            });
          }
        } catch (err) {
          console.error("ZIP Unpack Failed", err);
          setErrorMessage(`Archive extraction failed for ${file.name}`);
        }
      } else {
        assetsToProcess.push({ file, name: file.name, type: file.type });
      }
    }

    const processedAssets: Asset[] = [];
    for (let i = 0; i < assetsToProcess.length; i++) {
      if (cancelRef.current) break;
      const item = assetsToProcess[i];
      const asset = await processFile(item.file, item.name, item.type, i, assetsToProcess.length);
      if (asset) processedAssets.push(asset);
    }

    if (!cancelRef.current) {
      setAssets(prev => [...prev, ...processedAssets]);
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
      
      // Save draft to Supabase immediately
      try {
        const { caseStudy: savedStudy } = await saveCaseStudy(fullStudy, assets);
        // Update local study with real UUID from DB
        fullStudy.id = savedStudy.id;
      } catch (e: any) {
        console.error("Failed to auto-save draft", e);
        // We don't block the UI flow for auto-save failure, but we log it
        setErrorMessage(`Draft auto-save failed: ${e.message}`);
      }

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

  const handleSaveStudy = async (updatedStudy: CaseStudy) => {
    try {
      setErrorMessage(null);
      // Optimistic update
      setCaseStudies(prev => prev.map(s => s.id === updatedStudy.id ? updatedStudy : s));
      setSelectedArticle(updatedStudy);
      setView('article');
      
      // Save to Supabase
      // We pass the assets that belong to this study. 
      // In this app structure, 'assets' state seems to be a global "staging" area?
      // Or 'updatedStudy.artifacts'? 
      // The Type definition says CaseStudy has 'artifacts: Asset[]'.
      const { caseStudy: savedRecord } = await saveCaseStudy(updatedStudy, updatedStudy.artifacts);
      
      // Update local state with real ID if it changed (e.g. first save of a draft)
      if (savedRecord.id !== updatedStudy.id) {
         const finalStudy = { ...updatedStudy, id: savedRecord.id };
         setCaseStudies(prev => prev.map(s => s.id === updatedStudy.id ? finalStudy : s));
         setSelectedArticle(finalStudy);
      }
      
      // Show success toast? (Maybe later)
    } catch (e: any) {
      console.error("Failed to save to Supabase", e);
      setErrorMessage(`Failed to save to database: ${e.message}`);
    }
  };

  const handlePublishStudy = async (study: CaseStudy) => {
    try {
      const publishedStudy = { ...study, status: 'published' as const };
      
      // Optimistic update
      setCaseStudies(prev => prev.map(s => s.id === study.id ? publishedStudy : s));
      setSelectedArticle(publishedStudy);
      
      const { caseStudy: savedRecord } = await saveCaseStudy(publishedStudy, study.artifacts);
      
      // Update local state with real ID
      if (savedRecord.id !== study.id) {
        const finalStudy = { ...publishedStudy, id: savedRecord.id };
        setCaseStudies(prev => prev.map(s => s.id === study.id ? finalStudy : s));
        setSelectedArticle(finalStudy);
      }

      // Optional: Show success toast
    } catch (e: any) {
      console.error("Failed to publish study", e);
      setErrorMessage(`Failed to publish: ${e.message}`);
    }
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

  const handleClearAssets = () => {
    setAssets([]);
  };

  return (
    <div className={`h-screen flex flex-col md:flex-row bg-[#F9F9F9] selection:bg-amber-300 selection:text-black overflow-hidden ${preferences.theme === 'dark' ? 'dark-mode-sim' : ''}`}>
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
          hasAssets={assets.length > 0}
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
                  onPublish={handlePublishStudy}
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
                <div className="bg-zinc-600 text-amber-300 p-4 brutalist-border brutalist-shadow-sm mono text-[10px] font-bold italic">
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
                onClearAssets={handleClearAssets}
                onCreateStudy={createStudyFromAssets}
                onExpand={() => setIsMinimized(false)}
                onCancel={cancelWorkflow}
                onAddDemoAssets={(demo) => setAssets(prev => [...prev, ...demo])}
                onOpenManualModal={() => setIsManualModalOpen(true)}
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

      <div className="fixed top-24 md:top-8 inset-x-0 m-auto w-fit z-[60] flex flex-col items-end gap-3 pointer-events-none">
        {isUploading && isMinimized && !isUploadOpen && (
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

      {isManualModalOpen && (
        <ManualAssetModal 
          onAdd={(asset) => setAssets(prev => [...prev, asset])}
          onClose={() => setIsManualModalOpen(false)}
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
