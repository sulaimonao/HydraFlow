-- Example RLS policy on 'task_cards' table
CREATE POLICY "Allow select for task cards" ON task_cards
  FOR SELECT
  USING (
    user_id = current_setting('app.current_user_id')::text AND
    chatroom_id = current_setting('app.current_chatroom_id')::text
  );