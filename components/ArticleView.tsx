
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
    <div className="animate-in slide-in-from-right-12 duration-500 bg-[#FDFDFD] min-h-screen">
      <div className="sticky top-0 bg-white border-b-4 border-black p-4 z-40 flex justify-between items-center md:px-12">
        <button onClick={onBack} className="flex items-center gap-2 font-black uppercase hover:translate-x-[-4px] transition-transform">
          <Icon name="ArrowLeft" />
          Feed
        </button>
        <div className="flex gap-3">
          <BrutalistButton 
            variant="secondary" 
            className="px-5 py-2 text-xs"
            onClick={() => onEdit(study)}
          >
            <Icon name="Edit3" size={14} />
            Edit_Study
          </BrutalistButton>
          <BrutalistButton className="px-5 py-2 text-xs">Publish_Log</BrutalistButton>
        </div>
      </div>

      <article className="max-w-5xl mx-auto p-4 md:p-12 pb-48">
        <header className="mb-20">
          <div className="flex flex-wrap gap-2 mb-8">
            {study.tags.map(t => (
              <span key={t} className="bg-[#FFF500] brutalist-border px-4 py-1 text-sm font-black uppercase italic">
                {t}
              </span>
            ))}
          </div>
          <h1 className="text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter uppercase mb-10 italic break-words">
            {study.title}
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-y-4 border-black py-8 mono text-xs font-bold bg-white">
            <div className="flex flex-col">
              <span className="opacity-40 uppercase mb-1">Created</span>
              <span>{new Date(study.date).toISOString().split('T')[0]}</span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-40 uppercase mb-1">Status</span>
              <span className="text-green-600">{study.status.toUpperCase()}</span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-40 uppercase mb-1">Artifacts</span>
              <span>{study.artifacts.length} FILES</span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-40 uppercase mb-1">Log ID</span>
              <span className="truncate">#{study.id}</span>
            </div>
          </div>
        </header>

        <section className="space-y-24">
          <div className="relative">
            <h2 className="text-4xl font-black uppercase mb-6 flex items-center gap-4">
              <span className="bg-black text-white w-12 h-12 flex items-center justify-center italic">01</span>
              The Problem
            </h2>
            <div className="brutalist-border p-8 md:p-12 bg-white brutalist-shadow">
              <p className="text-2xl md:text-3xl leading-snug font-bold italic text-gray-800">
                "{study.problem}"
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-black uppercase mb-6 flex items-center gap-4">
              <span className="bg-black text-white w-12 h-12 flex items-center justify-center italic">02</span>
              Methodology
            </h2>
            <p className="text-xl md:text-2xl leading-relaxed text-gray-700 max-w-3xl">
              {study.approach}
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black uppercase mb-8 flex items-center gap-4">
              <span className="bg-black text-white w-12 h-12 flex items-center justify-center italic">03</span>
              Evidence Artifacts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {study.artifacts.map(a => (
                <div key={a.id} className="brutalist-border bg-white overflow-hidden group hover:brutalist-shadow transition-all">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center relative border-b-4 border-black">
                    {a.url ? (
                      <img src={a.url} alt={a.aiName} className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="FileCode" size={48} className="opacity-20" />
                    )}
                    <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-[10px] font-bold">
                      {a.fileType.toUpperCase()}
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="mono text-[11px] font-bold break-all leading-tight">
                      {a.aiName}
                    </p>
                    <p className="text-[10px] uppercase opacity-40 mt-2">Source: {a.originalName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black text-[#FFF500] p-12 md:p-20 brutalist-shadow">
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-8 italic italic">Outcome_Log</h2>
            <p className="text-2xl md:text-4xl leading-tight font-black uppercase italic">
              {study.outcome}
            </p>
          </div>

          <div className="border-t-4 border-black pt-12">
            <h2 className="text-4xl font-black uppercase mb-6">Next_Steps</h2>
            <p className="text-xl leading-relaxed text-gray-600 border-l-8 border-black pl-8">
              {study.nextSteps}
            </p>
          </div>
        </section>

        <footer className="mt-32 pt-16 border-t-8 border-black text-center">
          <p className="mono font-black text-2xl uppercase mb-8 italic tracking-tighter">Share Intelligence</p>
          <div className="flex flex-wrap justify-center gap-6">
            <BrutalistButton variant="secondary" className="w-16 h-16 p-0 rounded-none"><Icon name="Twitter" size={28} /></BrutalistButton>
            <BrutalistButton variant="secondary" className="w-16 h-16 p-0 rounded-none"><Icon name="Linkedin" size={28} /></BrutalistButton>
            <BrutalistButton variant="secondary" className="w-16 h-16 p-0 rounded-none"><Icon name="Link2" size={28} /></BrutalistButton>
          </div>
        </footer>
      </article>
    </div>
  );
};
