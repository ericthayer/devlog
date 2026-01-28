import { describe, it, expect, vi } from 'vitest';
import { analyzeAsset, generateCaseStudy } from '../services/geminiService';
import { Asset } from '../types';

// Mock the Gemini API
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          topic: 'auth',
          type: 'wireframe',
          context: 'mobile',
          variant: 'dark',
          version: 'v2'
        })
      })
    }
  })),
  Type: {
    OBJECT: 'object',
    STRING: 'string',
    ARRAY: 'array'
  }
}));

describe('geminiService', () => {
  describe('analyzeAsset', () => {
    it('should analyze a file and return metadata', async () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      
      const result = await analyzeAsset(file, 'image/png', false);
      
      expect(result).toHaveProperty('topic');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('context');
      expect(result).toHaveProperty('variant');
      expect(result).toHaveProperty('version');
    });
  });

  describe('generateCaseStudy', () => {
    it('should generate a case study from assets', async () => {
      const assets: Asset[] = [
        {
          id: '1',
          originalName: 'wireframe.png',
          aiName: 'auth-wireframe-mobile-dark-v2.png',
          type: 'wireframe',
          topic: 'auth',
          context: 'mobile',
          variant: 'dark',
          version: 'v2',
          fileType: 'png',
          url: 'blob:test',
          size: 1024
        }
      ];

      const result = await generateCaseStudy(assets, 'Test context', false);
      
      expect(result).toBeDefined();
    });
  });
});
