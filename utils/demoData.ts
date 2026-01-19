
import { CaseStudy, Asset } from '../types';

export const DEMO_ASSETS: Asset[] = [
  {
    id: 'a1',
    originalName: 'hero-section-final.png',
    aiName: 'landing-ui-hero-v2-final-png',
    type: 'UI',
    topic: 'landing',
    context: 'marketing',
    variant: 'v2',
    version: '2.1',
    fileType: 'png',
    url: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=400',
    size: 102400
  },
  {
    id: 'a2',
    originalName: 'auth-flow.sketch',
    aiName: 'auth-ux-flow-desktop-v1-sketch',
    type: 'UX',
    topic: 'auth',
    context: 'dashboard',
    variant: 'desktop',
    version: '1.0',
    fileType: 'sketch',
    url: '',
    size: 204800
  }
];

export const DEMO_STUDIES: CaseStudy[] = [
  {
    id: 's1',
    title: 'NEURAL DASHBOARD REDESIGN',
    status: 'published',
    date: new Date().toISOString(),
    tags: ['AI', 'DASHBOARD', 'UX'],
    problem: 'The previous dashboard suffered from information overload, leading to a 40% bounce rate among power users who felt overwhelmed by the data density.',
    approach: 'Implemented a brutalist, high-contrast hierarchy with collapsible side-panels and a modular widget system inspired by physical synthesizers.',
    artifacts: [DEMO_ASSETS[0]],
    outcome: 'Increased daily active usage by 25% and reduced the average time-to-action from 12 seconds to 4 seconds through optimized visual scanning paths.',
    nextSteps: 'Explore real-time data streaming optimizations and dark mode specialized contrast ratios.',
    seoMetadata: {
      title: 'Neural Dashboard Case Study',
      description: 'Optimizing data density for power users.',
      keywords: ['ux', 'dashboard', 'brutalist']
    }
  },
  {
    id: 's2',
    title: 'AUTH FLOW RECONSTRUCTION',
    status: 'draft',
    date: new Date(Date.now() - 86400000).toISOString(),
    tags: ['SECURITY', 'UI', 'FLOW'],
    problem: 'Users were dropping off at the 2FA verification step due to unclear error messaging and lack of fallback methods.',
    approach: 'Redesigned the modal progression with state-specific illustrations and clearer call-to-actions. Integrated biometric prompts.',
    artifacts: [DEMO_ASSETS[1]],
    outcome: 'Completed prototype phase with positive initial user feedback on clarity. Awaiting full integration.',
    nextSteps: 'A/B test the SMS vs Authenticator app messaging.',
    seoMetadata: {
      title: 'Auth Flow Optimization',
      description: 'Streamlining secure entry.',
      keywords: ['auth', 'security', 'conversion']
    }
  }
];
