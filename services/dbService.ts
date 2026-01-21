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
  // Strategy: For simplicity, delete old assets for this study and re-insert current ones.
  // This ensures the DB reflects exactly what's in the UI.
  if (caseStudyId) {
     await supabase.from('assets').delete().eq('case_study_id', newId);
  }

  // 3. Upload Blobs to Storage & Prepare for Insert
  const assetsToInsert = await Promise.all(assets.map(async (asset) => {
    let assetUrl = asset.url;

    // If it's a local Blob URL, upload to Supabase Storage
    if (assetUrl.startsWith('blob:')) {
      try {
        const response = await fetch(assetUrl);
        const blob = await response.blob();
        
        // Path: case_study_id/filename
        const filePath = `${newId}/${asset.aiName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, blob, {
            upsert: true
          });

        if (uploadError) {
          console.error(`Failed to upload ${asset.aiName}`, uploadError);
          // Fallback: keep blob URL? Or fail? 
          // If we fail, the asset record will have a broken URL on reload.
          // Let's throw to stop the save and alert user?
          // Or just log and continue (asset will be broken in cloud).
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('assets')
          .getPublicUrl(filePath);
          
        assetUrl = publicUrl;
      } catch (e) {
        console.error("Error processing asset upload", e);
        throw e;
      }
    }

    return {
      original_name: asset.originalName,
      ai_name: asset.aiName,
      type: asset.type,
      topic: asset.topic,
      context: asset.context,
      variant: asset.variant,
      version: asset.version,
      file_type: asset.fileType,
      url: assetUrl,
      size: asset.size,
      case_study_id: newId
    };
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
    .select('*, assets(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
