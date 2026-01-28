-- Create RPC function to get user role (bypasses PostgREST schema cache issues)
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
  
  -- If no role found, return 'reader' as default
  IF user_role IS NULL THEN
    RETURN 'reader';
  END IF;
  
  RETURN user_role;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO anon, authenticated;
