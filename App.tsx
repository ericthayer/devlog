
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, CaseStudy, Asset } from './types';
import { Navigation } from './components/Navigation';
import { Icon } from './components/Icon';
import { BrutalistButton } from './components/BrutalistButton';
import { analyzeAsset, generateCaseStudy } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('timeline');
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<CaseStudy | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('devsigner_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCaseStudies(parsed.caseStudies || []);
      setAssets(parsed.assets || []);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('devsigner_data', JSON.stringify({ caseStudies, assets }));
  }, [caseStudies, assets]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAssets: Asset[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const analysis = await analyzeAsset(file, file.type);
      
      const asset: Asset = {
        id: Math.random().toString(36).substr(2, 9),
        originalName: file.name,
        aiName: `${analysis.topic}-${analysis.type}-${analysis.context}-${analysis.variant}-${analysis.version}-${file.name.split('.').pop()}`,
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
    }

    setAssets(prev => [...prev, ...newAssets]);
    setIsUploading(false);
    setView('timeline');
  };

  const createStudyFromAssets = async () => {
    if (assets.length === 0) return;
    setIsUploading(true);
    const newStudy = await generateCaseStudy(assets.slice(-3), "Auto-generated from recent contributions");
    
    const fullStudy: CaseStudy = {
      id: Math.random().toString(36).substr(2, 9),
      title: newStudy.title || 'Untitled Case Study',
      status: 'draft',
      date: new Date().toISOString(),
      tags: newStudy.tags || [],
      problem: newStudy.problem || '',
      approach: newStudy.approach || '',
      artifacts: assets.slice(-3),
      outcome: newStudy.outcome || '',
      nextSteps: newStudy.nextSteps || '',
      seoMetadata: newStudy.seoMetadata || { title: '', description: '', keywords: [] }
    };

    setCaseStudies(prev => [fullStudy, ...prev]);
    setIsUploading(false);
    setSelectedArticle(fullStudy);
    setView('article');
  };

  const renderTimeline = () => (
    <div className="p-4 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8 border-b-4 border-black pb-4">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">Contributions</h2>
          <p className="mono text-sm opacity-60">TRACKING: {caseStudies.length} STUDIES / {assets.length} ASSETS</p>
        </div>
        <div className="flex gap-2">
            <BrutalistButton variant="secondary" className="px-3" onClick={() => setView('upload')}>
                <Icon name="Search" size={20} />
            </BrutalistButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {caseStudies.length === 0 && (
          <div className="col-span-full border-4 border-dashed border-gray-300 rounded-xl p-20 flex flex-col items-center justify-center text-center">
            <Icon name="Inbox" size={64} className="text-gray-300 mb-4" />
            <p className="mono font-bold text-gray-400 uppercase">Your timeline is empty.</p>
            <BrutalistButton className="mt-6" onClick={() => setView('upload')}>
                Initialize first capture
            </BrutalistButton>
          </div>
        )}

        {caseStudies.map(study => (
          <div 
            key={study.id} 
            onClick={() => { setSelectedArticle(study); setView('article'); }}
            className="group cursor-pointer brutalist-border bg-white brutalist-shadow hover:brutalist-shadow-active transition-all overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 brutalist-border text-xs font-black uppercase ${
                  study.status === 'published' ? 'bg-green-400' : 'bg-[#FFF500]'
                }`}>
                  {study.status}
                </span>
                <span className="mono text-xs font-bold opacity-40">{new Date(study.date).toLocaleDateString()}</span>
              </div>
              <h3 className="text-2xl font-black leading-tight mb-2 group-hover:underline">{study.title}</h3>
              <p className="text-sm line-clamp-3 mb-4 opacity-70 leading-relaxed">{study.problem}</p>
              <div className="flex flex-wrap gap-2">
                {study.tags.map(tag => (
                  <span key={tag} className="bg-black text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-2 bg-black w-full" />
            <div className="bg-gray-50 p-4 border-t-2 border-black flex gap-2">
                {study.artifacts.map((a, idx) => (
                    <div key={idx} className="w-10 h-10 brutalist-border bg-white flex items-center justify-center">
                        <Icon name={a.fileType === 'pdf' ? 'FileText' : 'Image'} size={16} />
                    </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="p-4 md:p-12 max-w-4xl mx-auto">
      <div className="brutalist-border bg-white p-8 md:p-12 brutalist-shadow">
        <h2 className="text-4xl font-black uppercase italic mb-8 border-b-4 border-black pb-4">Capture Logic</h2>
        
        <div className="space-y-8">
          <div 
            className="border-4 border-dashed border-black p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-[#FFF50022] transition-colors cursor-pointer relative"
          >
            <input 
              type="file" 
              multiple 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Icon name="UploadCloud" size={64} className="mb-4" />
            <p className="text-xl font-bold uppercase tracking-tight">Drop files or click to scan</p>
            <p className="mono text-xs mt-2 opacity-60">IMG, MP4, PDF, ZIP supported</p>
          </div>

          <div className="bg-black text-white p-6 brutalist-shadow-sm">
            <h4 className="font-bold uppercase mb-2 flex items-center gap-2">
              <Icon name="Activity" size={18} />
              AI Naming Convention Active
            </h4>
            <p className="mono text-[10px] opacity-70">
              `[topic]-[type]-[context]-[variant]-[version]-[filetype]`
            </p>
          </div>

          {assets.length > 0 && (
            <div className="border-t-4 border-black pt-8">
              <h3 className="text-xl font-bold uppercase mb-4">Pending Artifacts ({assets.length})</h3>
              <div className="space-y-2">
                {assets.map(asset => (
                  <div key={asset.id} className="flex items-center justify-between p-3 brutalist-border bg-white">
                    <div className="flex items-center gap-3">
                        <Icon name="File" size={20} />
                        <div>
                            <p className="mono text-xs font-bold leading-none mb-1">{asset.aiName}</p>
                            <p className="text-[10px] opacity-40 uppercase">Original: {asset.originalName}</p>
                        </div>
                    </div>
                    <button onClick={() => setAssets(assets.filter(a => a.id !== asset.id))}>
                        <Icon name="X" size={16} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
              <BrutalistButton 
                fullWidth 
                className="mt-8" 
                onClick={createStudyFromAssets}
                disabled={isUploading}
              >
                {isUploading ? 'Engine Thinking...' : 'Transform into Case Study'}
              </BrutalistButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderArticle = () => {
    if (!selectedArticle) return null;
    return (
      <div className="animate-in slide-in-from-right-12 duration-300">
        <div className="sticky top-0 bg-white border-b-4 border-black p-4 z-40 flex justify-between items-center md:px-12">
            <button onClick={() => setView('timeline')} className="flex items-center gap-2 font-bold uppercase">
                <Icon name="ArrowLeft" />
                Back
            </button>
            <div className="flex gap-2">
                <BrutalistButton variant="secondary" className="px-4 py-1 text-sm">Draft</BrutalistButton>
                <BrutalistButton className="px-4 py-1 text-sm">Publish</BrutalistButton>
            </div>
        </div>

        <article className="max-w-4xl mx-auto p-4 md:p-12 pb-32">
            <header className="mb-12">
                <div className="flex gap-2 mb-6">
                    {selectedArticle.tags.map(t => (
                        <span key={t} className="bg-[#FFF500] brutalist-border px-3 py-1 text-xs font-bold uppercase">
                            {t}
                        </span>
                    ))}
                </div>
                <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase mb-6 italic">
                    {selectedArticle.title}
                </h1>
                <div className="flex items-center gap-4 border-y-2 border-black py-4 mono text-sm font-bold opacity-60">
                    <span>CREATED: {new Date(selectedArticle.date).toISOString().split('T')[0]}</span>
                    <span>/</span>
                    <span>STUDY_ID: {selectedArticle.id}</span>
                </div>
            </header>

            <section className="space-y-16">
                <div>
                    <h2 className="text-2xl font-black uppercase mb-4 border-l-8 border-[#FFF500] pl-4">The Problem</h2>
                    <p className="text-xl leading-relaxed font-medium">{selectedArticle.problem}</p>
                </div>

                <div>
                    <h2 className="text-2xl font-black uppercase mb-4 border-l-8 border-[#FFF500] pl-4">Approach</h2>
                    <p className="text-xl leading-relaxed text-gray-700">{selectedArticle.approach}</p>
                </div>

                <div>
                    <h2 className="text-2xl font-black uppercase mb-4 border-l-8 border-[#FFF500] pl-4">Artifacts</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                        {selectedArticle.artifacts.map(a => (
                            <div key={a.id} className="brutalist-border aspect-square bg-gray-100 flex items-center justify-center p-4 text-center hover:bg-white transition-colors">
                                <div className="flex flex-col items-center">
                                    <Icon name="FileCode" size={48} className="mb-2" />
                                    <span className="mono text-[10px] font-bold break-all">{a.aiName}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-black uppercase mb-4 border-l-8 border-[#FFF500] pl-4">Outcome</h2>
                    <p className="text-xl leading-relaxed italic border-4 border-black p-8 bg-gray-50">{selectedArticle.outcome}</p>
                </div>

                <div>
                    <h2 className="text-2xl font-black uppercase mb-4 border-l-8 border-[#FFF500] pl-4">Next Iteration</h2>
                    <p className="text-xl leading-relaxed">{selectedArticle.nextSteps}</p>
                </div>
            </section>

            <footer className="mt-20 pt-12 border-t-4 border-black flex flex-col items-center">
                <p className="mono font-bold uppercase mb-4">Share this contribution</p>
                <div className="flex gap-4">
                    <BrutalistButton variant="secondary" className="w-12 h-12 p-0"><Icon name="Twitter" /></BrutalistButton>
                    <BrutalistButton variant="secondary" className="w-12 h-12 p-0"><Icon name="Linkedin" /></BrutalistButton>
                    <BrutalistButton variant="secondary" className="w-12 h-12 p-0"><Icon name="Share2" /></BrutalistButton>
                </div>
            </footer>
        </article>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-64 flex flex-col bg-[#FDFDFD]">
      <Navigation activeView={view} onViewChange={setView} />
      
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {view === 'timeline' && renderTimeline()}
        {view === 'upload' && renderUpload()}
        {view === 'article' && renderArticle()}
        {view === 'settings' && (
          <div className="p-4 md:p-12 max-w-2xl mx-auto">
             <div className="brutalist-border bg-white p-8 brutalist-shadow">
                <h2 className="text-3xl font-black uppercase mb-8 italic border-b-4 border-black pb-2">Global Settings</h2>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 brutalist-border">
                        <span className="font-bold uppercase">Auto-Rename Artifacts</span>
                        <div className="w-12 h-6 bg-black relative rounded-full">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-[#FFF500] brutalist-border rounded-full" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 brutalist-border">
                        <span className="font-bold uppercase">Generate RSS Feed</span>
                        <Icon name="Rss" />
                    </div>
                    <div className="flex items-center justify-between p-4 brutalist-border">
                        <span className="font-bold uppercase">PWA Status</span>
                        <span className="mono text-xs font-bold text-green-500 underline">INSTALLED_OK</span>
                    </div>
                    <BrutalistButton variant="danger" fullWidth className="mt-12" onClick={() => { localStorage.clear(); window.location.reload(); }}>
                        Wipe Local Database
                    </BrutalistButton>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Global Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-12">
            <div className="bg-[#FFF500] brutalist-border p-8 brutalist-shadow text-center">
                <Icon name="Cpu" size={64} className="mx-auto mb-4 animate-spin" />
                <h3 className="text-2xl font-black uppercase mb-2">Gemini is Processing</h3>
                <p className="mono text-xs opacity-60">ANALYZING STRUCTURE / GENERATING NARRATIVE / PACKING ASSETS</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
