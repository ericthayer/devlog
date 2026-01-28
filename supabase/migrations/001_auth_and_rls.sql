-- Enable Row Level Security
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('publisher', 'reader')),
  publisher_requested BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Case Studies Policies

-- Publishers can do everything
CREATE POLICY "Publishers can insert case studies" ON case_studies
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'publisher'
    )
  );

CREATE POLICY "Publishers can update case studies" ON case_studies
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'publisher'
    )
  );

CREATE POLICY "Publishers can delete case studies" ON case_studies
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'publisher'
    )
  );

-- Both readers and publishers can view published case studies
-- Publishers can see all (including drafts)
CREATE POLICY "Users can view case studies" ON case_studies
  FOR SELECT TO authenticated
  USING (
    -- Publishers see everything
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'publisher'
    )
    OR
    -- Readers see only published
    (
      status = 'published' AND
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'reader'
      )
    )
  );

-- Assets Policies (inherit from parent case study)

CREATE POLICY "Publishers can insert assets" ON assets
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'publisher'
    )
  );

CREATE POLICY "Publishers can update assets" ON assets
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'publisher'
    )
  );

CREATE POLICY "Publishers can delete assets" ON assets
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'publisher'
    )
  );

CREATE POLICY "Users can view assets" ON assets
  FOR SELECT TO authenticated
  USING (
    -- Publishers see all assets
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'publisher'
    )
    OR
    -- Readers see assets of published case studies only
    (
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'reader'
      )
      AND
      EXISTS (
        SELECT 1 FROM case_studies 
        WHERE id = assets.case_study_id AND status = 'published'
      )
    )
  );

-- Storage Policies (update existing)

-- Remove old public policies if they exist
DROP POLICY IF EXISTS "Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Update" ON storage.objects;

-- New authenticated policies
CREATE POLICY "Publishers can upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'assets' AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'publisher'
    )
  );

CREATE POLICY "Authenticated users can view assets" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'assets');

CREATE POLICY "Publishers can update assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'assets' AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'publisher'
    )
  );

CREATE POLICY "Publishers can delete assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'assets' AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'publisher'
    )
  );
