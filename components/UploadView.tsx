
import React from 'react';
import { Icon } from './Icon';
import { BrutalistButton } from './BrutalistButton';
import { Asset } from '../types';
import { DEMO_ASSETS } from '../utils/demoData';

interface UploadViewProps {
  assets: Asset[];
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAsset: (id: string) => void;
  onCreateStudy: () => void;
  // Added a way to inject demo assets if needed
  onAddDemoAssets?: (assets: Asset[]) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  assets,
  isUploading,
  onFileUpload,
  onRemoveAsset,
  onCreateStudy,
  onAddDemoAssets
}) => {
  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="brutalist-border bg-white p-8 md:p-16 brutalist-shadow">
        <header className="mb-10 border-b-8 border-black pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-5xl font-black uppercase italic leading-none">Capture System</h2>
            <p className="mono text-xs font-bold mt-2 opacity-60">READY FOR MULTI-FILE INGESTION // GEMINI_PARSER_ACTIVE</p>
          </div>
          {assets.length === 0 && (
            <button 
              onClick={() => onAddDemoAssets?.(DEMO_ASSETS)}
              className="mono text-[10px] font-black uppercase underline hover:no-underline bg-black text-white px-3 py-1"
            >
              Load Demo Samples
            </button>
          )}
        </header>
        
        <div className="space-y-12">
          {/* Main Dropzone Area */}
          <div 
            className="border-4 border-dashed border-black p-12 md:p-20 flex flex-col items-center justify-center bg-gray-50 hover:bg-[#FFF50011] transition-all cursor-pointer relative group"
          >
            <input 
              type="file" 
              multiple 
              onChange={onFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              accept="image/*,.pdf,.mp4,.webm,.mov,.fig"
            />
            <div className="group-hover:scale-110 transition-transform duration-300 text-black">
              <Icon name="UploadCloud" size={80} className="mb-4" />
            </div>
            <p className="text-3xl font-black uppercase tracking-tight text-center">Drop Artifacts Here</p>
            <p className="mono text-[10px] mt-4 bg-black text-white px-4 py-1 uppercase tracking-widest text-center">
              SELECT MULTIPLE FILES (IMG, PDF, MP4, WEBM, MOV)
            </p>
          </div>

          {/* AI Feature Highlight */}
          <div className="bg-zinc-600 brutalist-border text-white p-8 brutalist-shadow flex items-start gap-6">
            <div className="bg-[#FFF500] p-3 text-black shrink-0">
              <Icon name="Cpu" size={32} />
            </div>
            <div>
              <h4 className="font-black text-xl uppercase mb-1 italic">Intelligent Extraction</h4>
              <p className="mono text-xs opacity-70 leading-relaxed uppercase">
                Gemini processes multiple files simultaneously—including images, PDFs, and small videos—to normalize metadata and prepare technical narratives. 
                All artifacts are categorized by project context automatically.
              </p>
            </div>
          </div>

          {/* Staged Assets - Responsive Grid */}
          {assets.length > 0 && (
            <div className="border-t-4 border-black pt-12 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black uppercase italic">Staged Pipeline ({assets.length})</h3>
                <button 
                  onClick={() => assets.forEach(a => onRemoveAsset(a.id))}
                  className="mono text-[10px] font-black uppercase text-red-600 hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map(asset => (
                  <div key={asset.id} className="group brutalist-border bg-white hover:brutalist-shadow-sm transition-all flex flex-col">
                    <div className="aspect-video bg-gray-100 border-b-4 border-black flex items-center justify-center relative overflow-hidden">
                      {asset.url && asset.fileType.match(/(jpg|jpeg|png|webp|gif)/i) ? (
                        <img src={asset.url} alt={asset.aiName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                      ) : asset.fileType.match(/(mp4|webm|mov)/i) ? (
                        <div className="flex flex-col items-center gap-2">
                          <Icon name="Video" size={48} className="opacity-40" />
                          <span className="mono text-[10px] font-bold opacity-40">VIDEO_STREAM</span>
                        </div>
                      ) : (
                        <Icon name="FileCode" size={48} className="opacity-20" />
                      )}
                      <div className="absolute top-2 right-2 bg-black text-[#FFF500] px-2 py-1 text-[9px] font-bold uppercase mono">
                        {asset.fileType || 'file'}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="mono text-[11px] font-black break-all leading-tight mb-2 uppercase">{asset.aiName}</p>
                        <p className="text-[9px] opacity-40 uppercase font-bold truncate">SRC: {asset.originalName}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t-2 border-dotted border-black flex justify-between items-center">
                        <span className="text-[9px] font-black bg-gray-100 px-2 py-0.5 border border-black uppercase">{asset.topic}</span>
                        <button 
                          onClick={() => onRemoveAsset(asset.id)}
                          className="p-1.5 hover:bg-red-500 hover:text-white transition-colors border border-transparent hover:border-black"
                          title="Remove from pipeline"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 sticky bottom-8 z-20">
                <BrutalistButton 
                  fullWidth 
                  className="text-2xl py-6 brutalist-shadow-active" 
                  onClick={onCreateStudy}
                  disabled={isUploading}
                >
                  <Icon name="Zap" className={isUploading ? 'animate-pulse' : ''} />
                  {isUploading ? 'SYNTHESIZING_INTELLIGENCE...' : 'GENERATE MULTI-FILE CASE STUDY'}
                </BrutalistButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
