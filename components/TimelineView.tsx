
import React from 'react';
import { Icon } from './Icon';
import { BrutalistButton } from './BrutalistButton';
import { CaseStudy, Asset } from '../types';

interface TimelineViewProps {
  caseStudies: CaseStudy[];
  assetsCount: number;
  onViewUpload: () => void;
  onSelectStudy: (study: CaseStudy) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ 
  caseStudies, 
  assetsCount, 
  onViewUpload, 
  onSelectStudy 
}) => {
  return (
    <div className="p-4 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b-8 border-black pb-6">
        <div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">Contributions</h2>
          <p className="mono text-sm font-bold mt-2 bg-black text-[#FFF500] inline-block px-2">
            TRACKING: {caseStudies.length} STUDIES / {assetsCount} ASSETS
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <BrutalistButton variant="primary" onClick={onViewUpload}>
            <Icon name="Plus" /> New Entry
          </BrutalistButton>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {caseStudies.length === 0 ? (
          <div className="col-span-full border-4 border-dashed border-gray-300 rounded-none p-24 flex flex-col items-center justify-center text-center bg-white">
            <Icon name="Inbox" size={80} className="text-gray-300 mb-6" />
            <p className="mono font-black text-2xl text-gray-300 uppercase italic">Timeline Zero Status</p>
            <BrutalistButton className="mt-8" onClick={onViewUpload}>
              Initialize first capture
            </BrutalistButton>
          </div>
        ) : (
          caseStudies.map(study => (
            <article 
              key={study.id} 
              onClick={() => onSelectStudy(study)}
              className="group cursor-pointer brutalist-border bg-white brutalist-shadow hover:brutalist-shadow-active transition-all flex flex-col"
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-4 py-1 brutalist-border text-xs font-black uppercase ${
                    study.status === 'published' ? 'bg-green-400' : 'bg-[#FFF500]'
                  }`}>
                    {study.status}
                  </span>
                  <span className="mono text-xs font-bold opacity-60 tracking-widest">
                    {new Date(study.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-3xl font-black leading-none mb-4 group-hover:underline uppercase italic">
                  {study.title}
                </h3>
                <p className="text-sm line-clamp-2 mb-6 opacity-80 leading-relaxed font-medium">
                  {study.problem}
                </p>
                <div className="flex flex-wrap gap-2">
                  {study.tags.map(tag => (
                    <span key={tag} className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-tighter">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-6 border-t-4 border-black flex gap-3 overflow-x-auto no-scrollbar">
                {study.artifacts.map((a, idx) => (
                  <div key={idx} className="w-12 h-12 brutalist-border bg-white flex items-center justify-center shrink-0 hover:bg-[#FFF500] transition-colors">
                    <Icon name={a.fileType === 'pdf' ? 'FileText' : 'Image'} size={20} />
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
