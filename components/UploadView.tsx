
import React from 'react';
import { Icon } from './Icon';
import { BrutalistButton } from './BrutalistButton';
import { ProcessingStatus } from './ProcessingStatus';
import { Asset } from '../types';
import { DEMO_ASSETS } from '../utils/demoData';

interface UploadViewProps {
  assets: Asset[];
  isUploading: boolean;
  progress: number;
  isThinkingEnabled: boolean;
  onToggleThinking: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAsset: (id: string) => void;
  onCreateStudy: () => void;
  onExpand: () => void;
  onCancel: () => void;
  onAddDemoAssets?: (assets: Asset[]) => void;
  onOpenManualModal: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  assets,
  isUploading,
  progress,
  isThinkingEnabled,
  onToggleThinking,
  onFileUpload,
  onRemoveAsset,
  onCreateStudy,
  onExpand,
  onCancel,
  onAddDemoAssets,
  onOpenManualModal
}) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-6 border-b-4 border-black bg-white flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black uppercase italic leading-none">Capture_System</h3>
          <p className="mono text-[8px] font-bold mt-1 opacity-60">READY FOR MULTI-FILE INGESTION</p>
        </div>
        {!isUploading && (
          <div className="flex gap-2">
            <button 
              onClick={onOpenManualModal}
              className="mono text-[8px] font-black uppercase underline hover:no-underline bg-zinc-200 text-black px-2 py-1 border border-black"
            >
              Manual_Add
            </button>
            {assets.length === 0 && (
              <button 
                onClick={() => onAddDemoAssets?.(DEMO_ASSETS)}
                className="mono text-[8px] font-black uppercase underline hover:no-underline bg-black text-white px-2 py-1"
              >
                Load Demo
              </button>
            )}
          </div>
        )}
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        {/* Processing Status Indicator in Drawer */}
        {isUploading && (
          <div className="mb-4">
            <ProcessingStatus 
              variant="inline"
              progress={progress}
              onExpand={onExpand}
              onCancel={onCancel}
            />
          </div>
        )}

        {/* Thinking Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-black text-[#FFF500] brutalist-border">
          <div className="flex items-center gap-3">
            <Icon name="BrainCircuit" size={20} />
            <div>
              <p className="font-black uppercase italic text-[10px]">DEEP_THINKING</p>
              <p className="mono text-[7px] uppercase opacity-60 italic">GEMINI 3 PRO 32K</p>
            </div>
          </div>
          <button 
            onClick={onToggleThinking}
            className={`w-10 h-6 brutalist-border relative transition-colors ${isThinkingEnabled ? 'bg-[#FFF500]' : 'bg-zinc-800'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white brutalist-border transition-all ${isThinkingEnabled ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>

        {!isUploading && (
          <div className="border-4 border-dashed border-black p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-[#FFF50011] transition-all cursor-pointer relative group">
            <input 
              type="file" 
              multiple 
              onChange={onFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              accept="image/*,.pdf,.mp4,.webm,.mov,.fig,.zip"
            />
            <div className="group-hover:scale-110 transition-transform duration-300 text-black">
              <Icon name="UploadCloud" size={48} className="mb-2" />
            </div>
            <p className="text-xl font-black uppercase tracking-tight text-center">Drop Artifacts</p>
            <p className="mono text-[8px] mt-2 bg-black text-white px-3 py-0.5 uppercase tracking-widest text-center">
              SELECT FILES (ZIP SUPPORTED)
            </p>
          </div>
        )}

        {assets.length > 0 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase italic">Staged Pipeline ({assets.length})</h3>
              {!isUploading && (
                <button 
                  onClick={() => assets.forEach(a => onRemoveAsset(a.id))}
                  className="mono text-[8px] font-black uppercase text-red-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {assets.map(asset => (
                <div key={asset.id} className="group brutalist-border bg-white hover:brutalist-shadow-sm transition-all flex flex-col">
                  <div className="aspect-video bg-gray-100 border-b-2 border-black flex items-center justify-center relative overflow-hidden">
                    {asset.url && asset.fileType.match(/(jpg|jpeg|png|webp|gif)/i) ? (
                      <img src={asset.url} alt={asset.aiName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    ) : asset.fileType.match(/(mp4|webm|mov)/i) ? (
                      <div className="flex flex-col items-center gap-1">
                        <Icon name="Video" size={24} className="opacity-40" />
                        <span className="mono text-[8px] font-bold opacity-40 uppercase">VIDEO</span>
                      </div>
                    ) : (
                      <Icon name="FileCode" size={32} className="opacity-20" />
                    )}
                    <div className="absolute top-1 right-1 bg-black text-[#FFF500] px-1 py-0.5 text-[7px] font-bold uppercase mono">
                      {asset.fileType}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="mono text-[9px] font-black break-all leading-tight mb-1 uppercase line-clamp-1">{asset.aiName}</p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-dotted border-black">
                      <span className="text-[8px] font-black bg-gray-100 px-2 py-0.5 border border-black uppercase">{asset.topic}</span>
                      {!isUploading && (
                        <button 
                          onClick={() => onRemoveAsset(asset.id)}
                          className="text-red-500 hover:scale-110 transition-transform"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {assets.length > 0 && (
        <div className="p-6 border-t-4 border-black bg-white sticky bottom-0">
          <BrutalistButton 
            fullWidth 
            className="text-lg py-4 brutalist-shadow-active" 
            onClick={onCreateStudy}
            disabled={isUploading}
          >
            <Icon name="Zap" size={18} className={isUploading ? 'animate-pulse' : ''} />
            {isUploading ? 'SYNTHESIZING...' : 'GENERATE_LOG'}
          </BrutalistButton>
        </div>
      )}
    </div>
  );
};
