
import React, { useState } from 'react';
import { Icon } from './Icon';
import { BrutalistButton } from './BrutalistButton';
import { Asset } from '../types';

interface ManualAssetModalProps {
  onAdd: (asset: Asset) => void;
  onClose: () => void;
}

export const ManualAssetModal: React.FC<ManualAssetModalProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'UX',
    topic: 'misc',
    context: 'dev',
    fileType: 'txt',
    size: '1024'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAsset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      originalName: formData.name,
      aiName: `${formData.topic}-${formData.type.toLowerCase()}-${formData.context}-v1-1.0-${formData.fileType}`,
      type: formData.type,
      topic: formData.topic,
      context: formData.context,
      variant: 'v1',
      version: '1.0',
      fileType: formData.fileType,
      url: '',
      size: parseInt(formData.size) || 0
    };
    onAdd(newAsset);
    onClose();
  };

  const inputStyles = "w-full p-3 brutalist-border bg-gray-50 mono text-xs font-bold focus:outline-none focus:bg-white transition-colors";
  const labelStyles = "block text-[10px] font-black uppercase mb-1 italic opacity-60";

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white brutalist-border p-8 brutalist-shadow max-w-md w-full relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-zinc-100 transition-colors brutalist-border"
        >
          <Icon name="X" size={16} />
        </button>

        <header className="mb-6 border-b-4 border-black pb-4">
          <h3 className="text-2xl font-black uppercase italic leading-none">Manual_Ingress</h3>
          <p className="mono text-[8px] font-bold mt-1 opacity-40 uppercase">Create Local Knowledge Node</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelStyles}>Identifier_Name</label>
            <input 
              required
              type="text" 
              className={inputStyles}
              placeholder="e.g. Navigation-V2-Flow"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelStyles}>Asset_Category</label>
              <select 
                className={inputStyles}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option>UX</option>
                <option>UI</option>
                <option>CODE</option>
                <option>DATA</option>
                <option>OTHER</option>
              </select>
            </div>
            <div>
              <label className={labelStyles}>Extension</label>
              <input 
                type="text" 
                className={inputStyles}
                placeholder="png, md, js..."
                value={formData.fileType}
                onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={labelStyles}>Domain_Topic</label>
            <input 
              type="text" 
              className={inputStyles}
              placeholder="e.g. Authentication"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            />
          </div>

          <BrutalistButton fullWidth type="submit" className="mt-4">
            <Icon name="Plus" size={18} />
            Inject_Artifact
          </BrutalistButton>
        </form>
      </div>
    </div>
  );
};
