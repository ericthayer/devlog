-- Add super_admin to user roles
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('super_admin', 'publisher', 'reader'));

-- Update RPC function to support super_admin
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = p_user_id;
  
  IF user_role IS NULL THEN
    RETURN 'reader';
  END IF;
  
  RETURN user_role;
END;
$$;

-- RLS policies for super_admin to manage users
CREATE POLICY "Super admins can view all user roles" ON user_roles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update user roles" ON user_roles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete user roles" ON user_roles
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Function to get all users with their roles (for super_admin only)
CREATE OR REPLACE FUNCTION get_all_users_with_roles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role TEXT,
  publisher_requested BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is super_admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: super_admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email::TEXT,
    COALESCE(ur.role, 'reader') as role,
    COALESCE(ur.publisher_requested, false) as publisher_requested,
    ur.created_at
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  ORDER BY ur.created_at DESC NULLS LAST;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_users_with_roles() TO authenticated;

-- Function to update user role (for super_admin only)
CREATE OR REPLACE FUNCTION update_user_role(p_user_id UUID, p_new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is super_admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: super_admin role required';
  END IF;
  
  -- Validate role
  IF p_new_role NOT IN ('super_admin', 'publisher', 'reader') THEN
    RAISE EXCEPTION 'Invalid role: %', p_new_role;
  END IF;
  
  -- Update or insert role
  INSERT INTO user_roles (user_id, role, publisher_requested)
  VALUES (p_user_id, p_new_role, false)
  ON CONFLICT (user_id) 
  DO UPDATE SET role = p_new_role, publisher_requested = false;
END;
$$;

GRANT EXECUTE ON FUNCTION update_user_role(UUID, TEXT) TO authenticated;
