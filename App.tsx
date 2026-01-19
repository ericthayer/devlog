
import React, { useState, useEffect } from 'react';
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
  const [selectedArticle, setSelectedArticle] = useState<CaseStudy | null>(null);

  // Initialize from LocalStorage or Load Demo Data
  useEffect(() => {
    const saved = localStorage.getItem('devsigner_data_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCaseStudies(parsed.caseStudies || []);
      setAssets(parsed.assets || []);
    } else {
      // Load demo data if fresh start
      setCaseStudies(DEMO_STUDIES);
      setAssets(DEMO_ASSETS);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('devsigner_data_v3', JSON.stringify({ caseStudies, assets }));
  }, [caseStudies, assets]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAssets: Asset[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const analysis = await analyzeAsset(file, file.type);
        
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

    setAssets(prev => [...prev, ...newAssets]);
    setIsUploading(false);
  };

  const createStudyFromAssets = async () => {
    if (assets.length === 0) return;
    setIsUploading(true);
    try {
      const newStudy = await generateCaseStudy(assets.slice(-3), "Synthesize recent progress into a technical log.");
      
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
      setAssets([]); // Clear staging
      setSelectedArticle(fullStudy);
      setView('article');
    } catch (err) {
      console.error("Case study generation failed", err);
    } finally {
      setIsUploading(false);
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
            onFileUpload={handleFileUpload}
            onRemoveAsset={(id) => setAssets(assets.filter(a => a.id !== id))}
            onCreateStudy={createStudyFromAssets}
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

      {/* Persistent HUD / Global Status */}
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[60] pointer-events-none">
        <div className="bg-zinc-600 text-[#FFF500] p-4 brutalist-border brutalist-shadow-sm mono text-[10px] font-bold uppercase italic">
          CPU_LOAD: {isUploading ? '98%' : '2%'} // RAM: 14GB // SYSTEM_ONLINE
        </div>
      </div>

      {/* AI Processing Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-8 backdrop-blur-md">
            <div className="bg-[#FFF500] brutalist-border p-12 md:p-20 brutalist-shadow text-center max-w-lg">
                <div className="relative inline-block mb-10">
                  <Icon name="Cpu" size={80} className="animate-spin text-black" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-black animate-ping" />
                  </div>
                </div>
                <h3 className="text-4xl font-black uppercase mb-4 italic leading-tight">Gemini Thinking...</h3>
                <div className="space-y-2 mono text-xs font-bold uppercase tracking-widest opacity-70">
                  <p>Parsing raw artifact data</p>
                  <p>Synthesizing technical narrative</p>
                  <p>Calculating impact metrics</p>
                  <p>Formatting case study structure</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
