
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
  canEdit: boolean;
  onToggleThinking: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAsset: (id: string) => void;
  onClearAssets: () => void;
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
  canEdit,
  onToggleThinking,
  onFileUpload,
  onRemoveAsset,
  onClearAssets,
  onCreateStudy,
  onExpand,
  onCancel,
  onAddDemoAssets,
  onOpenManualModal
}) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-6 border-b-4 border-black bg-white flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h3 className="text-2xl font-black uppercase italic leading-none">Capture_System</h3>
          <p className="mono text-[10px] font-bold mt-1 opacity-60">READY FOR MULTI-FILE INGESTION</p>
        </div>
        {!isUploading && (
          <div className="flex gap-2 items-center">
            {assets.length > 0 && (
              <button 
                onClick={onCreateStudy}
                className="mono text-[11px] font-black uppercase bg-amber-300 text-black px-3 py-1.5 min-h-[32px] !border-2 border-black flex items-center gap-1.5 hover:bg-black hover:text-amber-300 transition-all active:translate-y-0.5 animate-in fade-in zoom-in duration-300"
              >
                <Icon name="Zap" size={16} />
                Generate
              </button>
            )}
            {assets.length === 0 && (
              <button 
                onClick={() => onAddDemoAssets?.(DEMO_ASSETS)}
                className="mono text-[11px] min-h-[32px] font-black uppercase bg-black text-white px-3 py-1.5 flex items-center gap-1.5 hover:bg-zinc-800 transition-colors"
              >
                LOAD_DEMO
              </button>
            )}
            {/* Add Asset */}
            <button 
              onClick={onOpenManualModal}
              className="mono text-[11px] font-black uppercase bg-zinc-200 hover:bg-zinc-300 text-black px-2 py-1 !border-2 border-black min-h-[32px] flex items-center justify-center w-[32px]"
              title="Manual Ingress"
            >
              <Icon name="Plus" size={18} />
            </button>
          </div>
        )}
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
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

        <div className="flex items-center justify-between p-4 bg-black text-amber-300 brutalist-border">
          <div className="flex items-center gap-3">
            <Icon name="BrainCircuit" size={20} />
            <div>
              <p className="font-black uppercase italic text-[10px]">DEEP_THINKING</p>
              <p className="mono text-[7px] uppercase opacity-60 italic">GEMINI 3 PRO 32K</p>
            </div>
          </div>
          <button 
            onClick={onToggleThinking}
            className={`w-10 h-6 brutalist-border relative transition-colors ${isThinkingEnabled ? 'bg-amber-300' : 'bg-zinc-800'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white brutalist-border transition-all ${isThinkingEnabled ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>

        {!isUploading && (
          <div className="border-4 border-dashed border-black p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-amber-300/10 transition-all cursor-pointer relative group">
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
            <p className="mono text-[11px] mt-2 bg-black text-white px-3 py-0.5 uppercase tracking-widest text-center">
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
                  onClick={onClearAssets}
                  className="mono text-[11px] font-black uppercase bg-zinc-200 text-black px-3 py-1 !border-2 border-black hover:bg-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  CLEAR
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {assets.map(asset => (
                <div key={asset.id} className="group brutalist-border bg-white hover:brutalist-shadow-sm transition-all flex flex-col">
                  <div className="aspect-video bg-gray-100 border-b-2 border-black flex items-center justify-center relative overflow-hidden">
                    {asset.url && asset.fileType.match(/(jpg|jpeg|png|webp|gif)/i) ? (
                      <img src={asset.url} alt={asset.aiName} className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all" />
                    ) : asset.url && asset.fileType.match(/(mp4|webm|mov)/i) ? (
                      <video 
                        src={`${asset.url}#t=0.5`} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        muted
                        playsInline
                        preload="metadata"
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0.5; }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-black/5 p-4 rounded-full group-hover:bg-amber-300 transition-colors">
                          <Icon name={asset.fileType.match(/(mp4|webm|mov)/i) ? 'Video' : 'FileCode'} size={32} className="opacity-40" />
                        </div>
                        <span className="mono text-[8px] font-black opacity-40 uppercase">{asset.fileType} artifact detected</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black text-amber-300 px-2 py-0.5 text-[8px] font-bold uppercase mono border border-black/20">
                      {asset.fileType}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="mono text-[9px] font-black break-all leading-tight mb-1 uppercase line-clamp-1">{asset.aiName}</p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-dotted border-black">
                      <span className="text-[8px] font-black bg-zinc-100 px-2 py-0.5 border border-black uppercase">{asset.topic}</span>
                      {!isUploading && (
                        <button 
                          onClick={() => onRemoveAsset(asset.id)}
                          className="text-red-500 hover:scale-110 transition-transform p-1"
                          aria-label="Remove asset"
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

      {assets.length > 0 && canEdit ? (
        <div className="p-6 border-t-4 border-black bg-white sticky bottom-0">
          <BrutalistButton 
            fullWidth 
            className="text-lg py-6 brutalist-shadow" 
            onClick={onCreateStudy}
            disabled={isUploading}
          >
            <Icon name="Zap" size={24} className={isUploading ? 'animate-pulse' : ''} />
            {isUploading ? 'BUILDING...' : 'GENERATE_LOG'}
          </BrutalistButton>
        </div>
      ) : !canEdit && assets.length > 0 ? (
        <div className="p-6 border-t-4 border-black bg-white mt-auto">
          <div className="flex items-center gap-3 justify-center text-red-600">
            <Icon name="Lock" size={16} />
            <span className="mono text-[10px] font-black uppercase">READ-ONLY ACCESS</span>
          </div>
        </div>
      ) : (
        <div className="p-6 border-t-4 border-black bg-white mt-auto">
          <div className="flex items-center gap-3 justify-center text-zinc-400">
            <Icon name="ShieldCheck" size={16} />
            <span className="mono text-[10px] font-black uppercase">End-to-End Encrypted Node</span>
          </div>
        </div>
      )}
    </div>
  );
};
