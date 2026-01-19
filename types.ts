
export type AppView = 'timeline' | 'upload' | 'editor' | 'settings' | 'article';

export interface Asset {
  id: string;
  originalName: string;
  aiName: string;
  type: string;
  topic: string;
  context: string;
  variant: string;
  version: string;
  fileType: string;
  url: string;
  size: number;
}

export interface CaseStudy {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  date: string;
  tags: string[];
  problem: string;
  approach: string;
  artifacts: Asset[];
  outcome: string;
  nextSteps: string;
  seoMetadata: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  autoRename: boolean;
  exportFormat: 'markdown' | 'json';
}
