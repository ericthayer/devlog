
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

      {/* Filter Matrix */}
      <div className="mb-10 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
              <Icon name="Search" size={20} />
            </div>
            <input 
              type="text"
              placeholder="SEARCH LOGS / TAGS / PROBLEMS..."
              className="w-full pl-12 pr-4 py-4 brutalist-border mono text-sm font-bold placeholder:text-gray-400 focus:outline-none focus:bg-white bg-gray-50 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status and Sort Controls */}
          <div className="flex flex-wrap gap-2">
            <div className="flex brutalist-border bg-white overflow-hidden">
              {(['all', 'draft', 'published'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 text-[10px] font-black uppercase border-r last:border-r-0 border-black transition-colors ${
                    selectedStatus === status ? 'bg-[#FFF500]' : 'hover:bg-gray-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="px-4 py-2 brutalist-border bg-white text-[10px] font-black uppercase flex items-center gap-2 hover:bg-gray-100"
            >
              <Icon name={sortOrder === 'newest' ? 'ArrowDown' : 'ArrowUp'} size={14} />
              {sortOrder === 'newest' ? 'NEWEST_FIRST' : 'OLDEST_FIRST'}
            </button>
          </div>
        </div>

        {/* Tag Cloud Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-black border-dotted">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 text-[9px] font-bold uppercase transition-all border-2 border-black ${
                selectedTag === null ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
              }`}
            >
              ALL_TAGS
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1 text-[9px] font-bold uppercase transition-all border-2 border-black ${
                  selectedTag === tag ? 'bg-[#FFF500]' : 'bg-white hover:bg-gray-100'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {filteredStudies.length === 0 ? (
          <div className="col-span-full border-4 border-dashed border-gray-300 rounded-none p-24 flex flex-col items-center justify-center text-center bg-white">
            <Icon name="SearchX" size={80} className="text-gray-300 mb-6" />
            <p className="mono font-black text-2xl text-gray-300 uppercase italic">
              {searchQuery ? 'NO MATCHES IN CURRENT LOG' : 'Timeline Zero Status'}
            </p>
            {searchQuery && (
              <BrutalistButton className="mt-8" onClick={() => { setSearchQuery(''); setSelectedTag(null); setSelectedStatus('all'); }}>
                Reset Filters
              </BrutalistButton>
            )}
          </div>
        ) : (
          filteredStudies.map(study => (
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
