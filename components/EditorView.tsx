
import React, { useState } from 'react';
import { Icon } from './Icon';
import { BrutalistButton } from './BrutalistButton';
import { CaseStudy } from '../types';

interface EditorViewProps {
  study: CaseStudy;
  onSave: (updatedStudy: CaseStudy) => void;
  onCancel: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ study, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CaseStudy>({ ...study });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(t => t !== '');
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputStyles = "w-full p-4 brutalist-border bg-gray-50 mono text-sm font-bold focus:outline-none focus:bg-white transition-colors";
  const labelStyles = "block text-sm font-black uppercase mb-2 italic";

  return (
    <div className="animate-in fade-in duration-500 bg-[#F9F9F9]">
      <div className="sticky top-0 bg-white border-b-4 border-black p-4 z-40 flex justify-between items-center md:px-6">
        <button onClick={onCancel} className="flex items-center gap-2 font-black uppercase hover:translate-x-[-4px] transition-transform">
          <Icon name="X" />
          Cancel
        </button>
        <div className="flex gap-3">
          <BrutalistButton 
            variant="primary"
            onClick={handleSubmit}
            className="text-sm !py-3 !px-5 transition-colors brutalist-shadow-sm"
          >
            <Icon name="Save" size={18} />
            Commit_Changes
          </BrutalistButton>
        </div>
      </div>

      <form className="max-w-4xl mx-auto p-4 md:p-12 pb-48 space-y-10" onSubmit={handleSubmit}>
        <header className="mb-12 border-b-8 border-black pb-8">
          <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-2">Editor_Core</h2>
          <p className="mono text-xs font-bold opacity-60 uppercase">Modifying Record: {study.id}</p>
        </header>

        <div className="space-y-6">
          <div>
            <label className={labelStyles}>Title / Identity</label>
            <input 
              type="text" 
              name="title"
              value={formData.title} 
              onChange={handleChange}
              className={inputStyles}
              placeholder="ENTER TITLE..."
            />
          </div>

          <div>
            <label className={labelStyles}>Tags (Comma separated)</label>
            <input 
              type="text" 
              value={formData.tags.join(', ')} 
              onChange={handleTagsChange}
              className={inputStyles}
              placeholder="UI, UX, DEVELOPMENT..."
            />
          </div>

          <div>
            <label className={labelStyles}>01 // Problem Statement</label>
            <textarea 
              name="problem"
              value={formData.problem} 
              onChange={handleChange}
              rows={4}
              className={inputStyles}
              placeholder="WHAT CHALLENGE WAS ADDRESSED?..."
            />
          </div>

          <div>
            <label className={labelStyles}>02 // Methodology & Approach</label>
            <textarea 
              name="approach"
              value={formData.approach} 
              onChange={handleChange}
              rows={6}
              className={inputStyles}
              placeholder="HOW WAS THE PROBLEM SOLVED?..."
            />
          </div>

          <div>
            <label className={labelStyles}>Outcome // Result Log</label>
            <textarea 
              name="outcome"
              value={formData.outcome} 
              onChange={handleChange}
              rows={4}
              className={inputStyles}
              placeholder="WHAT WAS THE FINAL IMPACT?..."
            />
          </div>

          <div>
            <label className={labelStyles}>Future // Next Steps</label>
            <textarea 
              name="nextSteps"
              value={formData.nextSteps} 
              onChange={handleChange}
              rows={3}
              className={inputStyles}
              placeholder="WHERE DOES THE PROJECT GO NEXT?..."
            />
          </div>
        </div>

        <div className="bg-black text-white p-8 brutalist-shadow-sm flex items-start gap-4 mt-12">
            <Icon name="AlertTriangle" size={32} className="text-amber-300 shrink-0" />
            <div>
              <h4 className="font-black text-xl uppercase mb-1">Integrity Check</h4>
              <p className="mono text-xs opacity-60 leading-relaxed uppercase">
                Saving these changes will overwrite the previous record in the local intelligence database. Artifact links will be preserved.
              </p>
            </div>
          </div>
      </form>
    </div>
  );
};