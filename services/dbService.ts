import { supabase } from '../utils/supabase';
import { Asset, CaseStudy } from '../types';

// Helper to check if string is UUID
const isUUID = (str: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(str);
};

export const saveCaseStudy = async (caseStudy: Partial<CaseStudy>, assets: Asset[]) => {
  let caseStudyId = caseStudy.id;
  
  // Prepare payload
  const payload: any = {
    title: caseStudy.title,
    status: caseStudy.status || 'draft',
    problem: caseStudy.problem,
    approach: caseStudy.approach,
    outcome: caseStudy.outcome,
    next_steps: caseStudy.nextSteps,
    tags: caseStudy.tags,
    seo_metadata: caseStudy.seoMetadata
  };

  // If we have a valid UUID, include it for UPSERT. 
  // If it's a short temp ID, we ignore it and let Supabase gen a new UUID.
  if (caseStudyId && isUUID(caseStudyId)) {
    payload.id = caseStudyId;
  } else {
    caseStudyId = undefined; // Treat as new insert
  }

  // 1. Upsert Case Study
  const { data: csData, error: csError } = await supabase
    .from('case_studies')
    .upsert(payload)
    .select()
    .single();

  if (csError) throw csError;
  const newId = csData.id;

  // 2. Handle Assets
  // Strategy: For simplicity in this "Log" app, if updating, we delete old assets and re-insert current ones 
  // to stay perfectly in sync with the frontend editor state.
  if (caseStudyId) {
     await supabase.from('assets').delete().eq('case_study_id', newId);
  }

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
    case_study_id: newId
  }));

  if (assetsToInsert.length > 0) {
    const { error: assetsError } = await supabase
      .from('assets')
      .insert(assetsToInsert);

    if (assetsError) throw assetsError;
  }

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
