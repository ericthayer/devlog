import { supabase } from '../utils/supabase';
import { Asset, CaseStudy } from '../types';

export const saveCaseStudy = async (caseStudy: Partial<CaseStudy>, assets: Asset[]) => {
  // 1. Insert Case Study
  const { data: csData, error: csError } = await supabase
    .from('case_studies')
    .insert({
      title: caseStudy.title,
      status: caseStudy.status || 'draft',
      problem: caseStudy.problem,
      approach: caseStudy.approach,
      outcome: caseStudy.outcome,
      next_steps: caseStudy.nextSteps,
      tags: caseStudy.tags,
      seo_metadata: caseStudy.seoMetadata
    })
    .select()
    .single();

  if (csError) throw csError;

  // 2. Insert Assets linked to Case Study
  const assetsToInsert = assets.map(asset => ({
    original_name: asset.originalName,
    ai_name: asset.aiName,
    type: asset.type,
    topic: asset.topic,
    context: asset.context,
    variant: asset.variant,
    version: asset.version,
    file_type: asset.fileType,
    url: asset.url,
    size: asset.size,
    case_study_id: csData.id
  }));

  const { error: assetsError } = await supabase
    .from('assets')
    .insert(assetsToInsert);

  if (assetsError) throw assetsError;

  return { caseStudy: csData, assets: assetsToInsert };
};

export const getCaseStudies = async () => {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
