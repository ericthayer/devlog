
import React, { useState, useMemo } from 'react';
import { Icon } from './Icon';
import { BrutalistButton } from './BrutalistButton';
import { CaseStudy } from '../types';

interface TimelineViewProps {
  caseStudies: CaseStudy[];
  assetsCount: number;
  onViewUpload: () => void;
  onSelectStudy: (study: CaseStudy) => void;
}

type SortOrder = 'newest' | 'oldest';

export const TimelineView: React.FC<TimelineViewProps> = ({ 
  caseStudies, 
  assetsCount, 
  onViewUpload, 
  onSelectStudy 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Derive unique tags from all studies
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    caseStudies.forEach(s => s.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [caseStudies]);

  // Filter and Sort Logic
  const filteredStudies = useMemo(() => {
    return caseStudies
      .filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                             s.problem.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
        const matchesTag = !selectedTag || s.tags.includes(selectedTag);
        return matchesSearch && matchesStatus && matchesTag;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [caseStudies, searchQuery, selectedStatus, selectedTag, sortOrder]);

  return (
    <div className="p-4 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b-8 border-black pb-6 gap-6">
        <div>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">Contributions</h2>
          <div className="flex flex-wrap gap-2 mt-4">
            <p className="mono text-xs font-bold bg-black text-[#FFF500] inline-block px-3 py-1 uppercase tracking-widest">
              SYSTEM_SYNC: ACTIVE
            </p>
            <p className="mono text-xs font-bold bg-zinc-200 text-black inline-block px-3 py-1 uppercase tracking-widest">
              RECORDS: {caseStudies.length} / ASSETS: {assetsCount}
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <BrutalistButton variant="primary" onClick={onViewUpload} className="text-xl px-10 py-5">
            <Icon name="Zap" /> NEW_LOG
          </BrutalistButton>
        </div>
      </header>

      {/* Filter Interface */}
      <div className="mb-12 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          {/* Enhanced Search Input */}
          <div className="relative flex-1 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-black transition-colors">
              <Icon name="Search" size={24} />
            </div>
            <input 
              type="text"
              placeholder="QUERY DATABASE: TAGS / TITLES / CHALLENGES..."
              className="w-full pl-14 pr-6 py-5 brutalist-border mono text-sm font-black placeholder:text-zinc-400 focus:outline-none focus:bg-white bg-zinc-50 transition-all focus:brutalist-shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Core Controls */}
          <div className="flex flex-wrap gap-3">
            <div className="flex brutalist-border bg-white overflow-hidden h-full">
              {(['all', 'draft', 'published'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-6 py-4 text-[11px] font-black uppercase border-r last:border-r-0 border-black transition-all ${
                    selectedStatus === status ? 'bg-[#FFF500]' : 'hover:bg-zinc-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="px-6 py-4 brutalist-border bg-white text-[11px] font-black uppercase flex items-center gap-3 hover:bg-[#FFF500] transition-all"
            >
              <Icon name={sortOrder === 'newest' ? 'ArrowDownNarrowWide' : 'ArrowUpNarrowWide'} size={18} />
              {sortOrder === 'newest' ? 'NEWEST_FIRST' : 'OLDEST_FIRST'}
            </button>
          </div>
        </div>

        {/* Dynamic Tag Grid */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t-4 border-black border-dotted">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-1.5 text-[10px] font-black uppercase transition-all border-2 border-black ${
                selectedTag === null ? 'bg-black text-white' : 'bg-white hover:bg-zinc-100'
              }`}
            >
              SHOW_ALL_TAGS
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-4 py-1.5 text-[10px] font-black uppercase transition-all border-2 border-black ${
                  selectedTag === tag ? 'bg-[#FFF500]' : 'bg-white hover:bg-zinc-100'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Rendering System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {filteredStudies.length === 0 ? (
          <div className="col-span-full border-4 border-dashed border-zinc-300 p-32 flex flex-col items-center justify-center text-center bg-white opacity-60">
            <Icon name="MonitorX" size={100} className="text-zinc-200 mb-8" />
            <h3 className="mono font-black text-3xl text-zinc-400 uppercase italic">
              Record_Not_Found
            </h3>
            <p className="mono text-xs text-zinc-300 mt-4 uppercase">Adjusting search parameters might restore data connectivity.</p>
            <BrutalistButton className="mt-10" onClick={() => { setSearchQuery(''); setSelectedTag(null); setSelectedStatus('all'); }}>
              Reset System Filter
            </BrutalistButton>
          </div>
        ) : (
          filteredStudies.map(study => (
            <article 
              key={study.id} 
              onClick={() => onSelectStudy(study)}
              className="group cursor-pointer brutalist-border bg-white brutalist-shadow hover:brutalist-shadow-active hover:-translate-y-1 transition-all flex flex-col overflow-hidden h-full"
            >
              {/* Card Body */}
              <div className="p-8 md:p-10 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <span className={`px-4 py-1.5 brutalist-border text-[10px] font-black uppercase italic ${
                    study.status === 'published' ? 'bg-black text-[#FFF500]' : 'bg-[#FFF500] text-black'
                  }`}>
                    {study.status}
                  </span>
                  <div className="flex items-center gap-2 mono text-[10px] font-black opacity-40 uppercase">
                    <Icon name="Calendar" size={12} />
                    {new Date(study.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                
                {/* Robust Title with Clamping */}
                <h3 className="text-3xl md:text-4xl font-black leading-tight mb-6 group-hover:underline uppercase italic line-clamp-2 decoration-8 decoration-[#FFF500] underline-offset-4">
                  {study.title}
                </h3>
                
                {/* Descriptive Narrative with Clamping */}
                <p className="text-base line-clamp-3 mb-8 opacity-70 leading-relaxed font-bold text-zinc-600 flex-1">
                  {study.problem}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-auto">
                  {study.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="bg-zinc-100 text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-black/10">
                      #{tag}
                    </span>
                  ))}
                  {study.tags.length > 4 && (
                    <span className="text-[9px] font-black uppercase opacity-30 self-center">+{study.tags.length - 4} MORE</span>
                  )}
                </div>
              </div>
              
              {/* Card Asset Strip */}
              <div className="bg-zinc-50 p-6 border-t-4 border-black flex items-center justify-between gap-4">
                <div className="flex -space-x-3 overflow-hidden">
                  {study.artifacts.slice(0, 5).map((a, idx) => (
                    <div 
                      key={idx} 
                      className="w-12 h-12 brutalist-border bg-white flex items-center justify-center shrink-0 hover:z-10 hover:bg-[#FFF500] transition-colors relative"
                    >
                      <Icon name={a.fileType.match(/(mp4|webm|mov)/i) ? 'Video' : a.fileType === 'pdf' ? 'FileText' : 'Image'} size={20} />
                    </div>
                  ))}
                  {study.artifacts.length > 5 && (
                    <div className="w-12 h-12 brutalist-border bg-black text-white flex items-center justify-center text-[10px] font-black">
                      +{study.artifacts.length - 5}
                    </div>
                  )}
                </div>
                <div className="bg-black text-white w-10 h-10 flex items-center justify-center brutalist-border group-hover:bg-[#FFF500] group-hover:text-black transition-colors">
                  <Icon name="ArrowRight" size={20} />
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
