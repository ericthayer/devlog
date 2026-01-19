
import React from 'react';
import { Icon } from './Icon';
import { BrutalistButton } from './BrutalistButton';
import { CaseStudy } from '../types';

interface ArticleViewProps {
  study: CaseStudy;
  onBack: () => void;
  onEdit: (study: CaseStudy) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ study, onBack, onEdit }) => {
  return (
    <div className="animate-in slide-in-from-right-12 duration-500 bg-white min-h-screen text-black selection:bg-[#FFF500]">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 bg-white border-b-4 border-black p-4 z-40 flex justify-between items-center md:px-12">
        <button 
          onClick={onBack} 
          className="flex items-center gap-3 font-black uppercase hover:translate-x-[-4px] transition-transform group"
        >
          <div className="bg-black text-white p-2 group-hover:bg-[#FFF500] group-hover:text-black transition-colors brutalist-border">
            <Icon name="ArrowLeft" size={18} />
          </div>
          <span className="mono text-xs hidden sm:inline">Feed_Return</span>
        </button>
        <div className="flex gap-3">
          <BrutalistButton 
            variant="secondary" 
            className="px-5 py-2 text-xs"
            onClick={() => onEdit(study)}
          >
            <Icon name="Edit3" size={14} />
            Edit_Core
          </BrutalistButton>
          <BrutalistButton className="px-5 py-2 text-xs bg-[#FFF500]">Publish_Final</BrutalistButton>
        </div>
      </div>

      <article className="max-w-6xl mx-auto px-4 md:px-12 py-12 pb-48">
        {/* Dynamic Header Section */}
        <header className="mb-20 border-b-8 border-black pb-12">
          <div className="flex flex-wrap gap-2 mb-8">
            {study.tags.map(t => (
              <span key={t} className="bg-black text-[#FFF500] px-3 py-1 text-[10px] font-black uppercase tracking-widest italic">
                #{t}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight uppercase mb-12 italic break-words">
            {study.title}
          </h1>

          {/* Quick Metrics HUD */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-4 border-black bg-black">
            <div className="bg-white p-6 border-r-4 border-black group hover:bg-[#FFF500] transition-colors">
              <span className="mono text-[10px] uppercase opacity-50 block mb-2 font-black">Timestamp</span>
              <span className="font-bold text-lg">{new Date(study.date).toLocaleDateString()}</span>
            </div>
            <div className="bg-white p-6 border-r-4 border-black group hover:bg-[#FFF500] transition-colors">
              <span className="mono text-[10px] uppercase opacity-50 block mb-2 font-black">Status</span>
              <span className="font-bold text-lg text-green-600 uppercase italic underline decoration-2">{study.status}</span>
            </div>
            <div className="bg-white p-6 border-r-4 border-black group hover:bg-[#FFF500] transition-colors">
              <span className="mono text-[10px] uppercase opacity-50 block mb-2 font-black">Evidence</span>
              <span className="font-bold text-lg">{study.artifacts.length} Assets</span>
            </div>
            <div className="bg-white p-6 group hover:bg-[#FFF500] transition-colors">
              <span className="mono text-[10px] uppercase opacity-50 block mb-2 font-black">Ref_ID</span>
              <span className="font-bold text-lg truncate block">#{study.id.slice(0, 8)}</span>
            </div>
          </div>
        </header>

        {/* Narrative Flow Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Narrative Column */}
          <div className="lg:col-span-8 space-y-24">
            
            {/* 01: Problem */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h2 className="text-4xl font-black uppercase mb-8 flex items-baseline gap-4 italic border-l-8 border-[#FFF500] pl-6">
                <span className="text-black/20 font-mono not-italic text-2xl">01/</span>
                The_Challenge
              </h2>
              <div className="bg-zinc-50 brutalist-border p-8 md:p-12 border-l-[16px] border-l-black relative">
                <Icon name="Quote" size={40} className="absolute -top-6 -right-4 text-black/5" />
                <p className="text-xl md:text-2xl leading-relaxed font-bold text-zinc-900">
                  {study.problem}
                </p>
              </div>
            </section>

            {/* 02: Methodology */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
              <h2 className="text-4xl font-black uppercase mb-8 flex items-baseline gap-4 italic border-l-8 border-[#FFF500] pl-6">
                <span className="text-black/20 font-mono not-italic text-2xl">02/</span>
                Strategy_Execution
              </h2>
              <div className="max-w-prose">
                <p className="text-xl leading-relaxed text-zinc-700">
                  {study.approach}
                </p>
              </div>
            </section>

            {/* 03: Impact */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <div className="bg-black text-white p-10 md:p-16 brutalist-shadow-active border-4 border-black relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF500] -translate-y-1/2 translate-x-1/2 rotate-45" />
                <h2 className="text-4xl md:text-5xl font-black uppercase mb-8 italic text-[#FFF500] relative z-10">Outcome</h2>
                <p className="text-lg md:text-2xl leading-relaxed font-bold text-white/90 relative z-10">
                  {study.outcome}
                </p>
              </div>
            </section>

            {/* 04: Next Iteration */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <h2 className="text-4xl font-black uppercase mb-8 flex items-baseline gap-4 italic border-l-8 border-[#FFF500] pl-6">
                <span className="text-black/20 font-mono not-italic text-2xl">04/</span>
                Roadmap_Alpha
              </h2>
              <div className="bg-[#FFF500]/5 brutalist-border p-8 border-dashed">
                <p className="text-xl leading-relaxed text-zinc-600">
                  {study.nextSteps}
                </p>
              </div>
            </section>

          </div>

          {/* Sidebar / Context Column */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* Artifact Gallery */}
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase bg-black text-white px-4 py-2 inline-block italic transform -rotate-1">Evidence_Artifacts</h3>
              <div className="grid grid-cols-1 gap-6">
                {study.artifacts.map((a, idx) => (
                  <div key={a.id} className="brutalist-border bg-white overflow-hidden group hover:bg-zinc-50 transition-all duration-300">
                    <div className="aspect-video bg-zinc-100 flex items-center justify-center relative border-b-4 border-black overflow-hidden">
                      {a.url && a.fileType.match(/(jpg|jpeg|png|webp|gif)/i) ? (
                        <img src={a.url} alt={a.aiName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                      ) : a.url && a.fileType.match(/(mp4|webm|mov)/i) ? (
                        <video src={a.url} muted loop autoPlay className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="FileCode" size={48} className="opacity-10 group-hover:opacity-30 transition-opacity" />
                      )}
                      <div className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 text-[8px] font-bold uppercase mono z-10">
                        {a.fileType}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="mono text-[10px] font-black uppercase leading-tight line-clamp-2 text-zinc-500 group-hover:text-black">{a.aiName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Metadata Box */}
            <div className="brutalist-border p-8 bg-[#FFF500]/10 space-y-8 sticky top-32">
              <h4 className="font-black text-sm uppercase italic border-b-4 border-black pb-2 flex items-center gap-2">
                <Icon name="Database" size={16} />
                Intelligence_Meta
              </h4>
              <div className="space-y-6">
                <div>
                  <span className="block mono text-[9px] font-black opacity-40 uppercase mb-2">SEO_Optimized_Title</span>
                  <p className="text-xs font-black leading-tight uppercase underline decoration-zinc-300 underline-offset-4">{study.seoMetadata?.title || study.title}</p>
                </div>
                <div>
                  <span className="block mono text-[9px] font-black opacity-40 uppercase mb-2">Knowledge_Graph_Keywords</span>
                  <div className="flex flex-wrap gap-2">
                    {(study.seoMetadata?.keywords || []).map(k => (
                      <span key={k} className="text-[9px] bg-white border-2 border-black px-2 py-0.5 font-bold uppercase hover:bg-black hover:text-white transition-colors cursor-default">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Global Footer */}
        <footer className="mt-48 pt-24 border-t-8 border-black flex flex-col items-center">
          <div className="text-center mb-16 space-y-2">
            <Icon name="CheckCircle" size={48} className="mx-auto mb-6 text-green-500" />
            <h5 className="text-4xl font-black uppercase italic tracking-tighter">Contribution_Logged</h5>
            <p className="mono text-[10px] opacity-40 uppercase font-black tracking-[0.3em]">End of Verified Intelligence Stream</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <button className="flex flex-col items-center gap-2 group">
              <BrutalistButton variant="secondary" className="w-16 h-16 p-0 group-hover:bg-black group-hover:text-[#FFF500] transition-colors"><Icon name="Share2" size={28} /></BrutalistButton>
              <span className="mono text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Share_Node</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <BrutalistButton variant="secondary" className="w-16 h-16 p-0 group-hover:bg-black group-hover:text-[#FFF500] transition-colors"><Icon name="Printer" size={28} /></BrutalistButton>
              <span className="mono text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Export_Hardcopy</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <BrutalistButton variant="secondary" className="w-16 h-16 p-0 group-hover:bg-black group-hover:text-[#FFF500] transition-colors"><Icon name="Download" size={28} /></BrutalistButton>
              <span className="mono text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Download_JSON</span>
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
};
