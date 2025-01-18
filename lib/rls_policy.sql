-- lib/rls_policy.sql

-- Create a function to set the RLS context
CREATE OR REPLACE FUNCTION set_rls_context(
    user_id text,
    chatroom_id text
)
RETURNS void AS $$
BEGIN
  -- Set the user_id and chatroom_id in the current session's claims
  PERFORM set_config('app.current_user_id', user_id, true);
  PERFORM set_config('app.current_chatroom_id', chatroom_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;