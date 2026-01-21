
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase Connection...');
  
  // 1. Test Write
  const testId = crypto.randomUUID();
  console.log(`Attempting to insert test case study ${testId}...`);
  
  const { data, error } = await supabase
    .from('case_studies')
    .insert({
      id: testId,
      title: 'VERIFICATION_TEST',
      status: 'archived',
      problem: 'Testing DB connection',
      approach: 'Automated script',
      outcome: 'Success',
      next_steps: 'Delete this record',
      tags: ['TEST'],
      seo_metadata: {}
    })
    .select()
    .single();

  if (error) {
    console.error('Insert Failed:', error);
    process.exit(1);
  }
  
  console.log('Insert Successful:', data.id);

  // 2. Test Read
  const { data: readData, error: readError } = await supabase
    .from('case_studies')
    .select('*')
    .eq('id', testId)
    .single();
    
  if (readError) {
    console.error('Read Failed:', readError);
    process.exit(1);
  }
  
  console.log('Read Successful:', readData.title);

  // 3. Cleanup
  const { error: deleteError } = await supabase
    .from('case_studies')
    .delete()
    .eq('id', testId);

  if (deleteError) {
    console.warn('Cleanup Failed:', deleteError);
  } else {
    console.log('Cleanup Successful');
  }
}

testConnection();
