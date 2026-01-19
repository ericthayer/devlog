
import React from 'react';
import { Icon } from './Icon';
import { BrutalistButton } from './BrutalistButton';
import { Asset } from '../types';

interface UploadViewProps {
  assets: Asset[];
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAsset: (id: string) => void;
  onCreateStudy: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  assets,
  isUploading,
  onFileUpload,
  onRemoveAsset,
  onCreateStudy
}) => {
  return (
    <div className="p-4 md:p-12 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="brutalist-border bg-white p-8 md:p-16 brutalist-shadow">
        <h2 className="text-5xl font-black uppercase italic mb-10 border-b-8 border-black pb-4">Capture System</h2>
        
        <div className="space-y-12">
          <div 
            className="border-4 border-dashed border-black p-16 flex flex-col items-center justify-center bg-gray-50 hover:bg-[#FFF50011] transition-all cursor-pointer relative group"
          >
            <input 
              type="file" 
              multiple 
              onChange={onFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="group-hover:scale-110 transition-transform duration-300">
              <Icon name="Upload" size={80} className="mb-4" />
            </div>
            <p className="text-2xl font-black uppercase tracking-tight">Scan Daily Artifacts</p>
            <p className="mono text-xs mt-3 bg-black text-white px-3 py-1 uppercase">IMG, Sketch, Figma, PDF</p>
          </div>

          <div className="bg-black text-white p-8 brutalist-shadow-sm flex items-start gap-4">
            <Icon name="Cpu" size={32} className="text-[#FFF500] shrink-0" />
            <div>
              <h4 className="font-black text-xl uppercase mb-1">Gemini AI Active</h4>
              <p className="mono text-xs opacity-60 leading-relaxed uppercase">
                Automatic normalization to naming standard:<br/>
                `[topic]-[type]-[context]-[variant]-[version]`
              </p>
            </div>
          </div>

          {assets.length > 0 && (
            <div className="border-t-4 border-black pt-10">
              <h3 className="text-2xl font-black uppercase mb-6 italic">Staged Pipeline ({assets.length})</h3>
              <div className="space-y-3">
                {assets.map(asset => (
                  <div key={asset.id} className="flex items-center justify-between p-4 brutalist-border bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="bg-black p-2 text-[#FFF500]">
                          <Icon name="File" size={24} />
                        </div>
                        <div>
                            <p className="mono text-sm font-black leading-none mb-1">{asset.aiName}</p>
                            <p className="text-[10px] opacity-40 uppercase font-bold">Source: {asset.originalName}</p>
                        </div>
                    </div>
                    <button 
                      onClick={() => onRemoveAsset(asset.id)}
                      className="p-2 hover:bg-red-100 text-red-500 transition-colors"
                    >
                        <Icon name="Trash2" size={20} />
                    </button>
                  </div>
                ))}
              </div>
              <BrutalistButton 
                fullWidth 
                className="mt-12 text-xl" 
                onClick={onCreateStudy}
                disabled={isUploading}
              >
                {isUploading ? 'Synthesizing...' : 'Generate Case Study Now'}
              </BrutalistButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
